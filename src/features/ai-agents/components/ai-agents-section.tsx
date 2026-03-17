import { useState } from "react";
import { Bot, Pencil, Trash2, Mail, Plus, RefreshCw, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWorkspace } from "@/context/workspace-context";
import { useMailboxes } from "@/features/integrations/hooks/use-mailbox-queries";
import { useAiAgents, useAiAgent } from "../hooks/use-ai-agent-queries";
import {
  useCreateAiAgent,
  useUpdateAiAgent,
  useDeleteAiAgent,
  useAssignMailbox,
  useUnassignMailbox,
  useToggleMailboxEnabled,
} from "../hooks/use-ai-agent-mutations";
import type { AiAgent } from "../api/ai-agents-api";
import { CreateAiAgentModal } from "../modals/create-ai-agent-modal";
import { EditAiAgentModal } from "../modals/edit-ai-agent-modal";
import { ManageMailboxesModal } from "../modals/manage-mailboxes-modal";
import { ManageToolsModal } from "../modals/manage-tools-modal";
import { TestAiAgentModal } from "../modals/test-ai-agent-modal";
import { useAgentTools, useAssignTool, useRemoveTool } from "../hooks/use-agent-tools";
import { useWorkspaceProducts } from "@/features/marketplace/hooks/useWorkspaceProducts";

function AgentMailboxesRow({
  workspaceId,
  agent,
  allMailboxes,
}: {
  workspaceId: string;
  agent: AiAgent;
  allMailboxes: ReturnType<typeof useMailboxes>["data"];
}) {
  const [open, setOpen] = useState(false);
  const { data } = useAiAgent(workspaceId, agent.id);
  const mailboxes = data?.mailboxes ?? [];

  const assign = useAssignMailbox(workspaceId, agent.id);
  const unassign = useUnassignMailbox(workspaceId, agent.id);
  const toggle = useToggleMailboxEnabled(workspaceId, agent.id);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-[11px] rounded-lg"
        onClick={() => setOpen(true)}>
        <Mail className="size-3" />
        {mailboxes.length > 0 ? `${mailboxes.length} mailbox${mailboxes.length > 1 ? "es" : ""}` : "Assign mailbox"}
      </Button>

      <ManageMailboxesModal
        open={open}
        onOpenChange={setOpen}
        agent={agent}
        assignedMailboxes={mailboxes}
        allMailboxes={allMailboxes ?? []}
        onAssign={(id) =>
          assign.mutate(id, {
            onError: (err) => toast.error(err.message),
          })
        }
        onUnassign={(id) =>
          unassign.mutate(id, {
            onError: (err) => toast.error(err.message),
          })
        }
        onToggle={(id, enabled) =>
          toggle.mutate(
            { mailboxIntegrationId: id, enabled },
            { onError: (err) => toast.error(err.message) }
          )
        }
      />
    </>
  );
}

function AgentToolsRow({
  agent,
  allProducts,
}: {
  agent: AiAgent;
  allProducts: ReturnType<typeof useWorkspaceProducts>["data"];
}) {
  const [open, setOpen] = useState(false);
  const { data: tools = [] } = useAgentTools(agent.id);

  const assign = useAssignTool(agent.id);
  const remove = useRemoveTool(agent.id);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-[11px] rounded-lg"
        onClick={() => setOpen(true)}>
        <Wrench className="size-3" />
        {tools.length > 0 ? `${tools.length} tool${tools.length > 1 ? "s" : ""}` : "Assign tools"}
      </Button>

      <ManageToolsModal
        open={open}
        onOpenChange={setOpen}
        agent={agent}
        assignedTools={tools}
        allWorkspaceProducts={allProducts ?? []}
        onAssign={(id) => assign.mutate(id, { onError: (err) => toast.error(err.message) })}
        onUnassign={(id) => remove.mutate(id, { onError: (err) => toast.error(err.message) })}
      />
    </>
  );
}

export function AiAgentsSection() {
  const { workspace } = useWorkspace();
  const { data: agents = [], isLoading } = useAiAgents(workspace.id);
  const { data: mailboxes = [] } = useMailboxes(workspace.id);
  const { data: workspaceProducts = [] } = useWorkspaceProducts(workspace.slug);

  const createAgent = useCreateAiAgent(workspace.id);
  const deleteAgent = useDeleteAiAgent(workspace.id);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [selected, setSelected] = useState<AiAgent | null>(null);

  const updateAgent = useUpdateAiAgent(workspace.id, selected?.id ?? "");

  function handleCreate(data: Parameters<typeof createAgent.mutate>[0]) {
    createAgent.mutate(data, {
      onSuccess: () => {
        toast.success("AI agent created");
        setCreateOpen(false);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleUpdate(data: Partial<AiAgent>) {
    if (!selected) return;
    updateAgent.mutate(data, {
      onSuccess: () => {
        toast.success("AI agent updated");
        setEditOpen(false);
        setSelected(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  function handleDelete() {
    if (!selected) return;
    deleteAgent.mutate(selected.id, {
      onSuccess: () => {
        toast.success("AI agent deleted");
        setDeleteOpen(false);
        setSelected(null);
      },
      onError: (err) => toast.error(err.message),
    });
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">AI Agents</CardTitle>
              <CardDescription className="text-xs">
                Automated agents that reply to tickets from assigned mailboxes
              </CardDescription>
            </div>
            <Button
              size="sm"
              className="rounded-lg text-xs gap-1.5"
              onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" />
              New Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
                <Bot className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No AI agents yet</p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                Create an agent and assign mailboxes to start automatically handling incoming tickets.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <Badge
                        variant={agent.status === "active" ? "default" : "secondary"}
                        className="text-[9px] px-1.5 py-0 rounded-full">
                        {agent.status}
                      </Badge>
                    </div>
                    {agent.description && (
                      <p className="text-[11px] text-muted-foreground truncate">{agent.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Confidence ≥ {agent.confidence_threshold} ·{" "}
                      {agent.max_auto_replies === 0
                        ? "unlimited replies"
                        : `max ${agent.max_auto_replies} replies`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1.5 text-[11px] rounded-lg border border-primary/20 text-primary hover:bg-primary/10"
                      onClick={() => {
                        setSelected(agent);
                        setTestOpen(true);
                      }}>
                      <Bot className="size-3" />
                      Test
                    </Button>
                    <AgentToolsRow
                      agent={agent}
                      allProducts={workspaceProducts}
                    />
                    <AgentMailboxesRow
                      workspaceId={workspace.id}
                      agent={agent}
                      allMailboxes={mailboxes}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg"
                      onClick={() => {
                        setSelected(agent);
                        setEditOpen(true);
                      }}>
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        setSelected(agent);
                        setDeleteOpen(true);
                      }}>
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAiAgentModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onConfirm={handleCreate}
        isPending={createAgent.isPending}
      />

      <EditAiAgentModal
        open={editOpen}
        onOpenChange={(v) => {
          setEditOpen(v);
          if (!v && !testOpen && !deleteOpen) setSelected(null);
        }}
        agent={selected}
        onConfirm={handleUpdate}
        isPending={updateAgent.isPending}
      />

      <TestAiAgentModal
        open={testOpen}
        onOpenChange={(v) => {
          setTestOpen(v);
          if (!v && !editOpen && !deleteOpen) setSelected(null);
        }}
        agent={selected}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete AI Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selected?.name}</strong>? This will remove all
              mailbox assignments and stop automated responses. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteAgent.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
              {deleteAgent.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
