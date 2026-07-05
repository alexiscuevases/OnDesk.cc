import { useState } from "react";
import { Shield, Plus, Pencil, Trash2, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/context/workspace-context";
import { ConfirmDeleteModal } from "@/shared/components";
import { EmptyState, StatGrid, StatTile } from "@/shared/components/console";
import { useRoles, useCreateRoleMutation, useUpdateRoleMutation, useDeleteRoleMutation } from "../hooks/use-roles";
import { RoleFormModal, type RoleFormValues } from "../modals/role-form-modal";
import type { Permission, WorkspaceRole } from "../api/roles-api";
import { BUILTIN_ROLES } from "../builtin-roles";

type Mode = { type: "closed" } | { type: "create" } | { type: "edit"; role: WorkspaceRole };

export function RolesView() {
	const { workspace } = useWorkspace();
	const { data, isLoading } = useRoles(workspace.id);
	const customRoles = data?.roles ?? [];
	const availablePerms: Permission[] = data?.available_permissions ?? [];

	const deleteMutation = useDeleteRoleMutation(workspace.id);
	const [mode, setMode] = useState<Mode>({ type: "closed" });
	const [deleting, setDeleting] = useState<WorkspaceRole | null>(null);

	const builtinDisplay: WorkspaceRole[] = BUILTIN_ROLES.map((b) => ({
		id: `builtin-${b.key}`,
		workspace_id: workspace.id,
		key: b.key,
		name: b.name,
		description: b.description,
		permissions: b.permissions,
		is_system: true,
		created_at: 0,
		updated_at: 0,
	}));

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-end justify-between">
				<p className="text-xs text-muted-foreground">
					Built-in roles plus optional custom roles you can assign to workspace members.
				</p>
				<Button onClick={() => setMode({ type: "create" })} className="text-xs">
					<Plus className="mr-1 size-3.5" />
					New role
				</Button>
			</div>

			<StatGrid className="grid-cols-3">
				<StatTile icon={ShieldCheck} label="Built-in" value={builtinDisplay.length} />
				<StatTile icon={Shield} label="Custom" value={customRoles.length} />
				<StatTile icon={KeyRound} label="Permissions" value={availablePerms.length} />
			</StatGrid>

			<Card>
				<CardHeader>
					<CardTitle className="console-label">Built-in roles</CardTitle>
					<CardDescription className="text-xs">These three roles always exist and cannot be edited.</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<ul className="divide-y">
						{builtinDisplay.map((r) => (
							<RoleRow key={r.key} role={r} onEdit={() => setMode({ type: "edit", role: r })} onDelete={null} />
						))}
					</ul>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="console-label">Custom roles</CardTitle>
					<CardDescription className="text-xs">Created in this workspace.</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
					) : customRoles.length === 0 ? (
						<EmptyState
							icon={Shield}
							title="No custom roles"
							description="Add custom roles to grant a curated set of permissions."
						/>
					) : (
						<ul className="divide-y">
							{customRoles.map((r) => (
								<RoleRow
									key={r.id}
									role={r}
									onEdit={() => setMode({ type: "edit", role: r })}
									onDelete={() => setDeleting(r)}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{mode.type === "create" && (
				<CreateRoleWrapper
					workspaceId={workspace.id}
					availablePermissions={availablePerms}
					onClose={() => setMode({ type: "closed" })}
				/>
			)}
			{mode.type === "edit" && (
				<EditRoleWrapper
					role={mode.role}
					workspaceId={workspace.id}
					availablePermissions={availablePerms}
					onClose={() => setMode({ type: "closed" })}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deleting}
				onOpenChange={(o) => !o && setDeleting(null)}
				title="Delete role"
				description={`Members currently assigned to "${deleting?.name}" will lose all permissions until reassigned.`}
				confirmLabel="Delete"
				onConfirm={() => {
					if (!deleting) return;
					deleteMutation.mutate(deleting.id, {
						onSuccess: () => toast.success("Role deleted"),
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					});
					setDeleting(null);
				}}
			/>
		</div>
	);
}


function RoleRow({
	role,
	onEdit,
	onDelete,
}: {
	role: WorkspaceRole;
	onEdit: () => void;
	onDelete: (() => void) | null;
}) {
	return (
		<li className="flex items-center justify-between gap-3 px-4 py-3">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<p className="truncate text-sm font-medium">{role.name}</p>
					<Badge variant="secondary" className="font-mono text-[10px]">{role.key}</Badge>
					{role.is_system && (
						<span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
							<Lock className="size-2.5" /> system
						</span>
					)}
				</div>
				{role.description && (
					<p className="mt-0.5 truncate text-xs text-muted-foreground">{role.description}</p>
				)}
				<p className="mt-1 text-[10px] text-muted-foreground font-mono tabular-nums">
					{role.permissions.length} permission{role.permissions.length === 1 ? "" : "s"}
				</p>
			</div>
			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon" onClick={onEdit} className="size-8">
					<Pencil className="size-3.5" />
				</Button>
				{onDelete && (
					<Button variant="ghost" size="icon" onClick={onDelete} className="size-8 text-destructive">
						<Trash2 className="size-3.5" />
					</Button>
				)}
			</div>
		</li>
	);
}

function CreateRoleWrapper({
	workspaceId,
	availablePermissions,
	onClose,
}: {
	workspaceId: string;
	availablePermissions: Permission[];
	onClose: () => void;
}) {
	const m = useCreateRoleMutation(workspaceId);
	return (
		<RoleFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			role={null}
			availablePermissions={availablePermissions}
			onSubmit={(v: RoleFormValues) => {
				m.mutate(
					{
						workspace_id: workspaceId,
						key: v.key.trim() || undefined,
						name: v.name.trim(),
						description: v.description.trim() || null,
						permissions: v.permissions,
					},
					{
						onSuccess: () => {
							toast.success("Role created");
							onClose();
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					},
				);
			}}
		/>
	);
}

function EditRoleWrapper({
	role,
	workspaceId,
	availablePermissions,
	onClose,
}: {
	role: WorkspaceRole;
	workspaceId: string;
	availablePermissions: Permission[];
	onClose: () => void;
}) {
	const m = useUpdateRoleMutation(role.id, workspaceId);
	return (
		<RoleFormModal
			open
			onOpenChange={(o) => !o && onClose()}
			role={role}
			availablePermissions={availablePermissions}
			onSubmit={(v) => {
				m.mutate(
					{
						name: v.name.trim(),
						description: v.description.trim() || null,
						permissions: v.permissions,
					},
					{
						onSuccess: () => {
							toast.success("Role updated");
							onClose();
						},
						onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
					},
				);
			}}
		/>
	);
}
