import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: {
    name: string;
    description?: string;
    system_prompt?: string;
    confidence_threshold: number;
    max_auto_replies: number;
  }) => void;
  isPending?: boolean;
}

export function CreateAiAgentModal({ open, onOpenChange, onConfirm, isPending }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [confidenceThreshold, setConfidenceThreshold] = useState("0.5");
  const [maxAutoReplies, setMaxAutoReplies] = useState("0");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onConfirm({
      name: name.trim(),
      description: description.trim() || undefined,
      system_prompt: systemPrompt.trim() || undefined,
      confidence_threshold: parseFloat(confidenceThreshold) || 0.5,
      max_auto_replies: parseInt(maxAutoReplies, 10) || 0,
    });
  }

  function handleOpenChange(v: boolean) {
    if (!v) {
      setName("");
      setDescription("");
      setSystemPrompt("");
      setConfidenceThreshold("0.5");
      setMaxAutoReplies("0");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Create AI Agent</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Support Bot"
              className="text-sm rounded-lg"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this agent handle?"
              className="text-sm rounded-lg"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Custom System Prompt</Label>
            <Textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Optional instructions that override the default AI behaviour..."
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
              <p className="text-[10px] text-muted-foreground">Replies below this score trigger escalation.</p>
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
              <p className="text-[10px] text-muted-foreground">Force escalation after this many replies.</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-lg text-xs"
              onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-lg text-xs"
              disabled={!name.trim() || isPending}>
              {isPending ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
