import { useState } from "react";
import { Bot, AlertTriangle, ChevronDown, ChevronUp, Play, OctagonX } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTicketAiState } from "@/features/ai-agents/hooks/use-ai-agent-queries";
import { useEscalateTicketAi, useResumeTicketAi } from "@/features/ai-agents/hooks/use-ai-agent-mutations";
import type { AiActionLog } from "@/features/ai-agents/api/ai-agents-api";

const ACTION_LABELS: Record<string, string> = {
  auto_reply: "Auto-replied",
  escalate: "Escalated",
  status_change: "Status changed",
  note_added: "Note added",
  routed: "Ticket routed",
};

function LogRow({ log }: { log: AiActionLog }) {
  return (
    <div className="flex items-start gap-2 text-[10px]">
      <div className="mt-1 size-1.5 rounded-full bg-primary/40 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="font-medium">{ACTION_LABELS[log.action] ?? log.action}</span>
        {log.action === "auto_reply" && log.metadata?.confidence !== undefined && (
          <span className="text-muted-foreground ml-1">
            (confidence {Number(log.metadata.confidence).toFixed(2)})
          </span>
        )}
        {log.action === "escalate" && log.metadata?.reason && (
          <span className="text-muted-foreground ml-1">— {String(log.metadata.reason)}</span>
        )}
      </div>
      <span className="text-muted-foreground shrink-0">
        {format(new Date(log.created_at * 1000), "MMM d, h:mm a")}
      </span>
    </div>
  );
}

interface Props {
  ticketId: string;
}

export function TicketAiStatePanel({ ticketId }: Props) {
  const { data, isLoading } = useTicketAiState(ticketId);
  const escalate = useEscalateTicketAi(ticketId);
  const resume = useResumeTicketAi(ticketId);
  const [logsOpen, setLogsOpen] = useState(false);

  // Don't render if there is no AI state at all
  if (isLoading || !data?.state) return null;

  const { state, agent_name, logs } = data;

  function handleEscalate() {
    escalate.mutate(undefined, {
      onSuccess: () => toast.success("Ticket escalated — AI responses stopped"),
      onError: (err) => toast.error(err.message),
    });
  }

  function handleResume() {
    resume.mutate(undefined, {
      onSuccess: () => toast.success("AI agent resumed"),
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Bot className="size-3.5" />
          AI Agent
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium">{agent_name ?? "AI Agent"}</p>
            <p className="text-[10px] text-muted-foreground">
              {state.reply_count} auto-repl{state.reply_count === 1 ? "y" : "ies"}
            </p>
          </div>
          <Badge
            variant={state.escalated ? "destructive" : "default"}
            className="text-[9px] px-1.5 py-0 rounded-full">
            {state.escalated ? "Escalated" : "Active"}
          </Badge>
        </div>

        {state.escalated && state.escalation_note && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2">
            <AlertTriangle className="size-3 text-destructive mt-0.5 shrink-0" />
            <p className="text-[10px] text-destructive">{state.escalation_note}</p>
          </div>
        )}

        <div className="flex gap-1.5">
          {state.escalated ? (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px] rounded-lg flex-1"
              onClick={handleResume}
              disabled={resume.isPending}>
              <Play className="size-3" />
              {resume.isPending ? "Resuming..." : "Resume AI"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-7 gap-1 text-[11px] rounded-lg flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleEscalate}
              disabled={escalate.isPending}>
              <OctagonX className="size-3" />
              {escalate.isPending ? "Escalating..." : "Escalate"}
            </Button>
          )}
        </div>

        {logs.length > 0 && (
          <div>
            <button
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setLogsOpen((v) => !v)}>
              {logsOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              {logsOpen ? "Hide" : "Show"} activity ({logs.length})
            </button>
            {logsOpen && (
              <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {logs.map((log) => (
                  <LogRow key={log.id} log={log} />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
