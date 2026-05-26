import { useState } from "react";
import { Gauge, Plus, Pencil, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/context/workspace-context";
import { ConfirmDeleteModal } from "@/shared/components";
import { useSlaPolicies } from "../hooks/use-sla-queries";
import {
	useCreateSlaPolicyMutation,
	useUpdateSlaPolicyMutation,
	useDeleteSlaPolicyMutation,
} from "../hooks/use-sla-mutations";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";
import { useBusinessHours } from "@/features/business-hours";
import { SlaPolicyFormModal, type SlaFormValues } from "../modals/sla-policy-form-modal";
import type { SlaPolicy } from "../api/sla-api";

type FormMode = { type: "closed" } | { type: "create" } | { type: "edit"; policy: SlaPolicy };

function formatMinutes(min: number | null): string {
	if (!min) return "—";
	if (min < 60) return `${min}m`;
	if (min < 1440) return `${Math.round(min / 60)}h`;
	return `${Math.round(min / 1440)}d`;
}

export function SlaView() {
	const { workspace } = useWorkspace();
	const { data: policies = [], isLoading } = useSlaPolicies(workspace.id);
	const { data: teams = [] } = useTeams(workspace.id);
	const { data: companies = [] } = useCompanies(workspace.id);
	const { data: businessHoursList = [] } = useBusinessHours(workspace.id);

	const deleteMutation = useDeleteSlaPolicyMutation(workspace.id);
	const [mode, setMode] = useState<FormMode>({ type: "closed" });
	const [deleting, setDeleting] = useState<SlaPolicy | null>(null);

	const enabledCount = policies.filter((p) => p.enabled).length;

	const handleDelete = () => {
		if (!deleting) return;
		deleteMutation.mutate(deleting.id, {
			onSuccess: () => {
				toast.success("SLA policy deleted");
				setDeleting(null);
			},
			onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
		});
	};

	const teamsList = teams.map((t) => ({ id: t.id, name: t.name }));
	const companiesList = companies.map((c) => ({ id: c.id, name: c.name }));
	const businessHoursOptions = businessHoursList.map((b) => ({ id: b.id, name: b.name, is_default: b.is_default }));

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-end justify-between">
				<p className="text-xs text-muted-foreground">
					Targets for first response and resolution times by priority.
				</p>
				<Button onClick={() => setMode({ type: "create" })} className="rounded-lg text-xs">
					<Plus className="mr-1 size-3.5" />
					New policy
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-3">
				<SummaryCard icon={Gauge} label="Total policies" value={policies.length} />
				<SummaryCard icon={Power} label="Enabled" value={enabledCount} />
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Policies</CardTitle>
					<CardDescription className="text-xs">First matching policy wins (highest match priority).</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
					) : policies.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-10 text-center">
							<div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
								<Gauge className="size-5 text-muted-foreground" />
							</div>
							<p className="text-sm font-medium">No SLA policies yet</p>
							<p className="text-[11px] text-muted-foreground max-w-xs">
								Create a policy to start measuring response and resolution times.
							</p>
						</div>
					) : (
						<ul className="divide-y">
							{policies.map((p) => (
								<PolicyRow
									key={p.id}
									policy={p}
									workspaceId={workspace.id}
									onEdit={() => setMode({ type: "edit", policy: p })}
									onDelete={() => setDeleting(p)}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{mode.type === "create" && (
				<CreatePolicyWrapper
					workspaceId={workspace.id}
					teams={teamsList}
					companies={companiesList}
					businessHours={businessHoursOptions}
					onClose={() => setMode({ type: "closed" })}
				/>
			)}
			{mode.type === "edit" && (
				<EditPolicyWrapper
					policy={mode.policy}
					workspaceId={workspace.id}
					teams={teamsList}
					companies={companiesList}
					businessHours={businessHoursOptions}
					onClose={() => setMode({ type: "closed" })}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deleting}
				onOpenChange={(o) => !o && setDeleting(null)}
				title="Delete SLA policy"
				description={`This will permanently delete "${deleting?.name}".`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
			/>
		</div>
	);
}

function SummaryCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
			<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
				<Icon className="size-5 text-primary" />
			</div>
			<div>
				<p className="text-xl font-bold">{value}</p>
				<p className="text-[11px] text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}

function PolicyRow({
	policy,
	workspaceId,
	onEdit,
	onDelete,
}: {
	policy: SlaPolicy;
	workspaceId: string;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const updateMutation = useUpdateSlaPolicyMutation(policy.id, workspaceId);

	return (
		<li className="flex items-center justify-between gap-3 px-4 py-3">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate text-sm font-medium">{policy.name}</p>
					{policy.applies_to_priority && (
						<Badge variant="secondary" className="text-[10px] font-normal capitalize">
							{policy.applies_to_priority}
						</Badge>
					)}
					{policy.priority > 0 && (
						<Badge variant="outline" className="text-[10px] font-normal">
							priority {policy.priority}
						</Badge>
					)}
				</div>
				{policy.description && (
					<p className="mt-0.5 truncate text-xs text-muted-foreground">{policy.description}</p>
				)}
				<p className="mt-1 text-[10px] text-muted-foreground">
					Response: L {formatMinutes(policy.response_low)} · M {formatMinutes(policy.response_medium)} · H{" "}
					{formatMinutes(policy.response_high)} · U {formatMinutes(policy.response_urgent)} | Resolution: L{" "}
					{formatMinutes(policy.resolution_low)} · M {formatMinutes(policy.resolution_medium)} · H{" "}
					{formatMinutes(policy.resolution_high)} · U {formatMinutes(policy.resolution_urgent)}
				</p>
			</div>
			<div className="flex items-center gap-1">
				<Switch
					checked={policy.enabled}
					onCheckedChange={(enabled) =>
						updateMutation.mutate({ enabled }, {
							onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
						})
					}
				/>
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

function CreatePolicyWrapper({
	workspaceId,
	teams,
	companies,
	businessHours,
	onClose,
}: {
	workspaceId: string;
	teams: { id: string; name: string }[];
	companies: { id: string; name: string }[];
	businessHours: { id: string; name: string; is_default: boolean }[];
	onClose: () => void;
}) {
	const createMutation = useCreateSlaPolicyMutation(workspaceId);
	const handleSubmit = (v: SlaFormValues) => {
		createMutation.mutate(
			{ workspace_id: workspaceId, ...v, description: v.description.trim() || null, name: v.name.trim() },
			{
				onSuccess: () => {
					toast.success("SLA policy created");
					onClose();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create"),
			},
		);
	};
	return (
		<SlaPolicyFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			policy={null}
			teams={teams}
			companies={companies}
			businessHours={businessHours}
			onSubmit={handleSubmit}
		/>
	);
}

function EditPolicyWrapper({
	policy,
	workspaceId,
	teams,
	companies,
	businessHours,
	onClose,
}: {
	policy: SlaPolicy;
	workspaceId: string;
	teams: { id: string; name: string }[];
	companies: { id: string; name: string }[];
	businessHours: { id: string; name: string; is_default: boolean }[];
	onClose: () => void;
}) {
	const updateMutation = useUpdateSlaPolicyMutation(policy.id, workspaceId);
	const handleSubmit = (v: SlaFormValues) => {
		updateMutation.mutate(
			{ ...v, description: v.description.trim() || null, name: v.name.trim() },
			{
				onSuccess: () => {
					toast.success("SLA policy updated");
					onClose();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
			},
		);
	};
	return (
		<SlaPolicyFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			policy={policy}
			teams={teams}
			companies={companies}
			businessHours={businessHours}
			onSubmit={handleSubmit}
		/>
	);
}
