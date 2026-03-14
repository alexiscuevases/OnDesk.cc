import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Mail, Plus, Trash2 } from "lucide-react";
import type { AiAgent, AiAgentMailbox } from "../api/ai-agents-api";
import type { MailboxIntegration } from "@/features/integrations/api/integrations-api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AiAgent | null;
  assignedMailboxes: AiAgentMailbox[];
  allMailboxes: MailboxIntegration[];
  onAssign: (mailboxIntegrationId: string) => void;
  onUnassign: (mailboxIntegrationId: string) => void;
  onToggle: (mailboxIntegrationId: string, enabled: boolean) => void;
}

export function ManageMailboxesModal({
  open,
  onOpenChange,
  agent,
  assignedMailboxes,
  allMailboxes,
  onAssign,
  onUnassign,
  onToggle,
}: Props) {
  const assignedIds = new Set(assignedMailboxes.map((m) => m.mailbox_integration_id));
  const unassigned = allMailboxes.filter((m) => !assignedIds.has(m.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            Mailboxes — {agent?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {assignedMailboxes.length === 0 && (
            <p className="text-[11px] text-muted-foreground text-center py-3">
              No mailboxes assigned yet.
            </p>
          )}

          {assignedMailboxes.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl bg-secondary/40 px-3.5 py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{m.mailbox_email}</p>
                <Badge
                  variant={m.enabled ? "default" : "secondary"}
                  className="text-[9px] px-1.5 py-0 rounded-full mt-0.5">
                  {m.enabled ? "Active" : "Paused"}
                </Badge>
              </div>
              <Switch
                checked={m.enabled}
                onCheckedChange={(v) => onToggle(m.mailbox_integration_id, v)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onUnassign(m.mailbox_integration_id)}>
                <Trash2 className="size-3" />
              </Button>
            </div>
          ))}

          {unassigned.length > 0 && (
            <>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide pt-1">
                Available Mailboxes
              </p>
              {unassigned.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/20 px-3.5 py-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <p className="flex-1 text-sm text-muted-foreground truncate">{m.email}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 text-[11px] rounded-lg"
                    onClick={() => onAssign(m.id)}>
                    <Plus className="size-3" />
                    Assign
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
