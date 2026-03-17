import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, User, Activity, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useWorkspace } from "@/context/workspace-context";
import { useTestAiAgent } from "../hooks/use-test-agent";
import type { TestAiAgentPayload, TestAiAgentResponse } from "../hooks/use-test-agent";
import type { AiAgent } from "../api/ai-agents-api";

interface TestAiAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AiAgent | null;
}

type MessageRole = "user" | "assistant" | "system";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  isTrace?: boolean;
  traceData?: TestAiAgentResponse["traces"][number];
}

export function TestAiAgentModal({ open, onOpenChange, agent }: TestAiAgentModalProps) {
  const { workspace } = useWorkspace();
  const testMutation = useTestAiAgent(workspace.id, agent?.id ?? "");
  const scrollRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // We keep a pure history of what the model saw (excluding our custom UI trace objects)
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  // Reset state when opening a new agent
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setMessages([]);
      setHistory([]);
      setInput("");
    }
  }, [open, agent?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!agent) return null;

  async function handleSend() {
    if (!input.trim() || testMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to UI
    const newUserMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);

    const payload: TestAiAgentPayload = {
      message: userMessage,
      history: history,
    };

    try {
      const response = await testMutation.mutateAsync(payload);
      
      // Update our pure history for the next turn
      setHistory(response.history);

      // Add traces to the UI
      const newTraces: ChatMessage[] = response.traces.map((trace) => ({
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        isTrace: true,
        traceData: trace,
      }));

      setMessages((prev) => [...prev, ...newTraces]);
    } catch {
      // Error handled by mutation onError
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0 bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Activity className="size-4 text-primary" />
            Testing Agent: {agent.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Simulation mode. Tools WILL perform actual HTTP requests. No emails will be sent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Bot className="size-8 mb-2 opacity-20" />
                <p className="text-sm">Send a message to start testing {agent.name}</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-3 text-sm",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}>
                  <div
                    className={cn(
                      "flex size-8 shrink-0 select-none items-center justify-center rounded-md border shadow-sm",
                      msg.role === "user" ? "bg-primary text-primary-foreground border-primary" : "bg-background"
                    )}>
                    {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                  </div>
                  
                  <div className={cn("flex flex-col gap-2 min-w-0 flex-1", msg.role === "user" ? "items-end" : "items-start")}>
                    {!msg.isTrace ? (
                      <div className={cn(
                        "rounded-xl px-4 py-2.5 max-w-[85%]",
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    ) : (
                      <TraceMessage trace={msg.traceData!} />
                    )}
                  </div>
                </div>
              ))
            )}
            
            {testMutation.isPending && (
              <div className="flex gap-3 text-sm text-muted-foreground animate-pulse">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Agent is thinking...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t shrink-0 bg-background">
          <div className="relative flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[60px] max-h-[200px] resize-none pr-12 rounded-xl text-sm"
              disabled={testMutation.isPending}
            />
            <Button
              size="icon"
              className="absolute right-2 bottom-2 size-8 rounded-lg"
              disabled={!input.trim() || testMutation.isPending}
              onClick={handleSend}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TraceMessage({ trace }: { trace: TestAiAgentResponse["traces"][number] }) {
  const { type, parsed, toolResult } = trace;

  if (type === "execute") {
    return (
      <div className="w-full max-w-[90%] rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b bg-muted/50 flex items-center justify-between">
          <span className="text-xs font-medium flex items-center gap-1.5">
            <Activity className="size-3.5 text-blue-500" />
            Tool Execution
          </span>
          <span className="text-[10px] text-muted-foreground font-mono bg-background px-1.5 py-0.5 rounded border">
            {parsed.action.actionId}
          </span>
        </div>
        <div className="p-3 space-y-3 text-xs">
          {parsed._thought && (
            <div className="space-y-1">
              <span className="font-semibold text-muted-foreground">Thought Process:</span>
              <p className="text-muted-foreground leading-relaxed italic border-l-2 pl-2">
                {parsed._thought}
              </p>
            </div>
          )}
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">Parameters:</span>
            <pre className="p-2 rounded-md bg-muted font-mono text-[10px] overflow-x-auto">
              {JSON.stringify(parsed.action.params, null, 2)}
            </pre>
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-muted-foreground">Tool Result:</span>
            <pre className="p-2 rounded-md bg-muted font-mono text-[10px] overflow-x-auto max-h-[200px]">
              {JSON.stringify(toolResult, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  if (type === "escalate") {
    return (
      <div className="w-full max-w-[90%] rounded-xl border border-destructive/50 bg-destructive/10 text-destructive overflow-hidden">
        <div className="px-3 py-2 border-b border-destructive/20 bg-destructive/20 flex items-center gap-1.5">
          <AlertTriangle className="size-3.5" />
          <span className="text-xs font-semibold">Agent Escalated</span>
        </div>
        <div className="p-3 text-xs space-y-2">
          {parsed._thought && (
            <p className="italic border-l-2 border-destructive/50 pl-2 text-destructive/80">
              {parsed._thought}
            </p>
          )}
          <p className="font-medium">Reason: {parsed.escalateReason}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[90%] space-y-2">
      {parsed._thought && (
        <div className="text-[11px] text-muted-foreground italic border-l-2 pl-2 w-fit">
          Thought: {parsed._thought}
        </div>
      )}
      <div className="bg-muted text-foreground rounded-xl px-4 py-2.5">
        <p className="whitespace-pre-wrap">{parsed.cleanText}</p>
      </div>
      <div className="text-[10px] text-muted-foreground text-right">
        Confidence Score: {(parsed.confidence * 100).toFixed(1)}%
      </div>
    </div>
  );
}
