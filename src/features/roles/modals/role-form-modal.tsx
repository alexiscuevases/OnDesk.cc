import { useState, useMemo } from "react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import type { Permission, WorkspaceRole } from "../api/roles-api";

export interface RoleFormValues {
	key: string;
	name: string;
	description: string;
	permissions: Permission[];
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	role?: WorkspaceRole | null;
	availablePermissions: Permission[];
	onSubmit: (v: RoleFormValues) => void;
}

function defaults(role?: WorkspaceRole | null): RoleFormValues {
	return {
		key: role?.key ?? "",
		name: role?.name ?? "",
		description: role?.description ?? "",
		permissions: role?.permissions ?? [],
	};
}

function groupPermissions(perms: Permission[]): Record<string, Permission[]> {
	const groups: Record<string, Permission[]> = {};
	for (const p of perms) {
		const [g] = p.split(".");
		(groups[g] ??= []).push(p);
	}
	return groups;
}

export function RoleFormModal({ open, onOpenChange, role, availablePermissions, onSubmit }: Props) {
	const [v, setV] = useState<RoleFormValues>(() => defaults(role));

	const isSystem = role?.is_system ?? false;
	const valid = v.name.trim().length > 0;
	const groups = useMemo(() => groupPermissions(availablePermissions), [availablePermissions]);

	const togglePermission = (p: Permission) => {
		setV((prev) =>
			prev.permissions.includes(p)
				? { ...prev, permissions: prev.permissions.filter((x) => x !== p) }
				: { ...prev, permissions: [...prev.permissions, p] },
		);
	};

	const toggleGroup = (groupPerms: Permission[]) => {
		const allOn = groupPerms.every((p) => v.permissions.includes(p));
		setV((prev) =>
			allOn
				? { ...prev, permissions: prev.permissions.filter((p) => !groupPerms.includes(p)) }
				: { ...prev, permissions: Array.from(new Set([...prev.permissions, ...groupPerms])) },
		);
	};

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title={role ? (isSystem ? `${role.name} (system)` : "Edit role") : "New role"}
			description={isSystem ? "System roles are read-only" : "Select which permissions this role grants"}
			maxWidth="sm:max-w-xl"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (valid && !isSystem) onSubmit(v);
				}}
			>
				<div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Name</Label>
							<Input
								value={v.name}
								disabled={isSystem}
								onChange={(e) => setV({ ...v, name: e.target.value })}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Key</Label>
							<Input
								value={v.key}
								disabled={!!role}
								onChange={(e) => setV({ ...v, key: e.target.value })}
								placeholder="lowercase_slug"
								className="h-9 rounded-lg font-mono text-xs"
							/>
						</div>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Description</Label>
						<Textarea
							value={v.description}
							disabled={isSystem}
							onChange={(e) => setV({ ...v, description: e.target.value })}
							className="min-h-[50px] rounded-lg text-xs"
						/>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Permissions</Label>
						<div className="space-y-3 rounded-lg border bg-card p-3">
							{Object.entries(groups).map(([group, perms]) => {
								const allOn = perms.every((p) => v.permissions.includes(p));
								const someOn = perms.some((p) => v.permissions.includes(p));
								return (
									<div key={group}>
										<div className="mb-1 flex items-center gap-2">
											<Checkbox
												checked={allOn ? true : someOn ? "indeterminate" : false}
												disabled={isSystem}
												onCheckedChange={() => toggleGroup(perms)}
											/>
											<Label className="text-xs font-semibold capitalize">{group.replace(/_/g, " ")}</Label>
										</div>
										<div className="ml-6 grid grid-cols-2 gap-1">
											{perms.map((p) => (
												<label key={p} className="flex items-center gap-2 text-[11px]">
													<Checkbox
														checked={v.permissions.includes(p)}
														disabled={isSystem}
														onCheckedChange={() => togglePermission(p)}
													/>
													<span className="font-mono text-muted-foreground">{p.split(".")[1]}</span>
												</label>
											))}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Close
					</Button>
					{!isSystem && (
						<Button type="submit" disabled={!valid} className="rounded-lg text-xs font-semibold">
							{role ? "Save changes" : "Create role"}
						</Button>
					)}
				</DialogFooter>
			</form>
		</FormModal>
	);
}
