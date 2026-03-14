import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { AiAgent } from "../api/ai-agents-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AiAgent | null;
  onConfirm: (data: Partial<AiAgent>) => void;
  isPending?: boolean;
}

export function EditAiAgentModal({ open, onOpenChange, agent, onConfirm, isPending }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState("0.5");
  const [maxAutoReplies, setMaxAutoReplies] = useState("0");
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setDescription(agent.description ?? "");
      setSystemPrompt(agent.system_prompt ?? "");
      setConfidenceThreshold(String(agent.confidence_threshold));
      setMaxAutoReplies(String(agent.max_auto_replies));
      setActive(agent.status === "active");
    }
  }, [agent]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({
      name: name.trim(),
      description: description.trim() || null,
      system_prompt: systemPrompt.trim() || null,
      confidence_threshold: parseFloat(confidenceThreshold) || 0.5,
      max_auto_replies: parseInt(maxAutoReplies, 10) || 0,
      status: active ? "active" : "inactive",
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Edit AI Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-sm rounded-lg"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-sm rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Custom System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="text-sm rounded-lg min-h-[80px] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Confidence threshold (0–1)</Label>
              <Input
                type="number"
                min="0"
                max="1"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(e.target.value)}
                className="text-sm rounded-lg"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Max auto-replies (0 = unlimited)</Label>
              <Input
                type="number"
                min="0"
                step="1"
                value={maxAutoReplies}
                onChange={(e) => setMaxAutoReplies(e.target.value)}
                className="text-sm rounded-lg"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary/40 px-3.5 py-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-[11px] text-muted-foreground">Agent will process incoming tickets when active.</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-lg text-xs"
              disabled={!name.trim() || isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
