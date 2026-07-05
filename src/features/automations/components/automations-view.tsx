import { useState } from "react";
import { Zap, Plus, Pencil, Trash2, Power, Activity } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/context/workspace-context";
import { ConfirmDeleteModal } from "@/shared/components";
import { EmptyState, StatGrid, StatTile } from "@/shared/components/console";
import { useAutomations } from "../hooks/use-automation-queries";
import {
	useCreateAutomationMutation,
	useUpdateAutomationMutation,
	useDeleteAutomationMutation,
} from "../hooks/use-automation-mutations";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useCannedReplies } from "@/features/canned-replies/hooks/use-canned-reply-queries";
import { AutomationFormModal, type AutomationFormValues } from "../modals/automation-form-modal";
import type { Automation } from "../api/automations-api";

const TRIGGER_LABELS: Record<string, string> = {
	"ticket.created": "Ticket created",
	"ticket.updated": "Ticket updated",
	"ticket.status_changed": "Status changed",
	"ticket.priority_changed": "Priority changed",
	"ticket.assigned": "Ticket assigned",
	"message.received": "Message received",
	"message.sent": "Message sent",
	"scheduled.time_since_created": "Time since created",
	"scheduled.time_since_updated": "Time since updated",
};

type FormMode = { type: "closed" } | { type: "create" } | { type: "edit"; automation: Automation };

export function AutomationsView() {
	const { workspace } = useWorkspace();
	const { data: automations = [], isLoading } = useAutomations(workspace.id);
	const { data: members = [] } = useWorkspaceMembers(workspace.id);
	const { data: teams = [] } = useTeams(workspace.id);
	const { data: cannedReplies = [] } = useCannedReplies(workspace.id);

	const deleteMutation = useDeleteAutomationMutation(workspace.id);

	const [formMode, setFormMode] = useState<FormMode>({ type: "closed" });
	const [deleting, setDeleting] = useState<Automation | null>(null);

	const usersForActions = members.map((m) => ({ id: m.id, name: m.name }));
	const teamsForActions = teams.map((t) => ({ id: t.id, name: t.name }));
	const cannedRepliesForActions = cannedReplies.map((r) => ({ id: r.id, name: r.name }));

	const enabledCount = automations.filter((a) => a.enabled).length;
	const totalRuns = automations.reduce((sum, a) => sum + a.run_count, 0);

	const handleDelete = () => {
		if (!deleting) return;
		deleteMutation.mutate(deleting.id, {
			onSuccess: () => {
				toast.success("Automation deleted");
				setDeleting(null);
			},
			onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-end justify-between">
				<p className="text-xs text-muted-foreground">
					Rules that automatically act on tickets based on events or time.
				</p>
				<Button onClick={() => setFormMode({ type: "create" })} className="text-xs">
					<Plus className="mr-1 size-3.5" />
					New automation
				</Button>
			</div>

			<StatGrid className="grid-cols-3">
				<StatTile icon={Zap} label="Total" value={automations.length} />
				<StatTile icon={Power} label="Enabled" value={enabledCount} />
				<StatTile icon={Activity} label="Total runs" value={totalRuns} />
			</StatGrid>

			<Card>
				<CardHeader>
					<CardTitle className="console-label">Rules</CardTitle>
					<CardDescription className="text-xs">Ordered by run priority, then creation date</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
					) : automations.length === 0 ? (
						<EmptyState
							icon={Zap}
							title="No automations yet"
							description="Create your first rule to auto-assign, auto-reply, escalate, and more."
						/>
					) : (
						<ul className="divide-y">
							{automations.map((automation) => (
								<AutomationRow
									key={automation.id}
									automation={automation}
									workspaceId={workspace.id}
									onEdit={() => setFormMode({ type: "edit", automation })}
									onDelete={() => setDeleting(automation)}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{formMode.type === "create" && (
				<CreateAutomationModalWrapper
					workspaceId={workspace.id}
					users={usersForActions}
					teams={teamsForActions}
					cannedReplies={cannedRepliesForActions}
					onClose={() => setFormMode({ type: "closed" })}
				/>
			)}

			{formMode.type === "edit" && (
				<EditAutomationModalWrapper
					automation={formMode.automation}
					workspaceId={workspace.id}
					users={usersForActions}
					teams={teamsForActions}
					cannedReplies={cannedRepliesForActions}
					onClose={() => setFormMode({ type: "closed" })}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deleting}
				onOpenChange={(open) => !open && setDeleting(null)}
				title="Delete automation"
				description={`This will permanently delete "${deleting?.name}". This action cannot be undone.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
			/>
		</div>
	);
}


function AutomationRow({
	automation,
	workspaceId,
	onEdit,
	onDelete,
}: {
	automation: Automation;
	workspaceId: string;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const updateMutation = useUpdateAutomationMutation(automation.id, workspaceId);

	const toggleEnabled = (enabled: boolean) => {
		updateMutation.mutate({ enabled }, {
			onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
		});
	};

	return (
		<li className="flex items-center justify-between gap-3 px-4 py-3">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate text-sm font-medium">{automation.name}</p>
					<Badge variant="secondary" className="text-[10px] font-normal">
						{TRIGGER_LABELS[automation.trigger_type] ?? automation.trigger_type}
					</Badge>
					{automation.trigger_type.startsWith("scheduled.") && automation.schedule_minutes && (
						<Badge variant="outline" className="text-[10px] font-normal font-mono">
							after {automation.schedule_minutes}m
						</Badge>
					)}
				</div>
				{automation.description && (
					<p className="mt-0.5 truncate text-xs text-muted-foreground">{automation.description}</p>
				)}
				<p className="mt-1 text-[10px] text-muted-foreground font-mono tabular-nums">
					{automation.conditions.rules.length} condition{automation.conditions.rules.length === 1 ? "" : "s"} · {automation.actions.length} action
					{automation.actions.length === 1 ? "" : "s"} · ran {automation.run_count}× ·{" "}
					{automation.last_run_at ? `last ${new Date(automation.last_run_at * 1000).toLocaleString()}` : "never run"}
				</p>
			</div>
			<div className="flex items-center gap-1">
				<Switch checked={automation.enabled} onCheckedChange={toggleEnabled} />
				<Button variant="ghost" size="icon" onClick={onEdit} className="size-8">
					<Pencil className="size-3.5" />
				</Button>
				<Button variant="ghost" size="icon" onClick={onDelete} className="size-8 text-destructive">
					<Trash2 className="size-3.5" />
				</Button>
			</div>
		</li>
	);
}

function CreateAutomationModalWrapper({
	workspaceId,
	users,
	teams,
	cannedReplies,
	onClose,
}: {
	workspaceId: string;
	users: { id: string; name: string }[];
	teams: { id: string; name: string }[];
	cannedReplies: { id: string; name: string }[];
	onClose: () => void;
}) {
	const createMutation = useCreateAutomationMutation(workspaceId);

	const handleSubmit = (values: AutomationFormValues) => {
		createMutation.mutate(
			{
				workspace_id: workspaceId,
				name: values.name.trim(),
				description: values.description.trim() || null,
				trigger_type: values.trigger_type,
				enabled: values.enabled,
				schedule_minutes: values.schedule_minutes,
				conditions: values.conditions,
				actions: values.actions,
			},
			{
				onSuccess: () => {
					toast.success("Automation created");
					onClose();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create"),
			},
		);
	};

	return (
		<AutomationFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			automation={null}
			users={users}
			teams={teams}
			cannedReplies={cannedReplies}
			onSubmit={handleSubmit}
		/>
	);
}

function EditAutomationModalWrapper({
	automation,
	workspaceId,
	users,
	teams,
	cannedReplies,
	onClose,
}: {
	automation: Automation;
	workspaceId: string;
	users: { id: string; name: string }[];
	teams: { id: string; name: string }[];
	cannedReplies: { id: string; name: string }[];
	onClose: () => void;
}) {
	const updateMutation = useUpdateAutomationMutation(automation.id, workspaceId);

	const handleSubmit = (values: AutomationFormValues) => {
		updateMutation.mutate(
			{
				name: values.name.trim(),
				description: values.description.trim() || null,
				trigger_type: values.trigger_type,
				enabled: values.enabled,
				schedule_minutes: values.schedule_minutes,
				conditions: values.conditions,
				actions: values.actions,
			},
			{
				onSuccess: () => {
					toast.success("Automation updated");
					onClose();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
			},
		);
	};

	return (
		<AutomationFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			automation={automation}
			users={users}
			teams={teams}
			cannedReplies={cannedReplies}
			onSubmit={handleSubmit}
		/>
	);
}
