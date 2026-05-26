import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertCircle, Plus, Trash2, Shield, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useWorkspace } from "@/context/workspace-context";
import {
	apiGetSecuritySettings,
	apiUpdateSecuritySettings,
	apiListIpAllowlist,
	apiAddIpAllowlistEntry,
	apiDeleteIpAllowlistEntry,
	apiListAuditLog,
	type SecuritySettings,
	type IpAllowlistEntry,
	type AuditLogEntry,
} from "../api/security-api";

export function SecuritySection() {
	const { workspace } = useWorkspace();
	const workspaceId = workspace.id;

	const settingsQuery = useQuery({
		queryKey: ["security-settings", workspaceId],
		queryFn: () => apiGetSecuritySettings(workspaceId),
	});

	if (settingsQuery.isLoading) {
		return (
			<div className="flex items-center justify-center py-12 text-muted-foreground">
				<Loader2 className="size-4 animate-spin mr-2" />
				<span className="text-sm">Loading security settings...</span>
			</div>
		);
	}

	if (settingsQuery.isError || !settingsQuery.data) {
		return (
			<div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
				<AlertCircle className="size-4 text-destructive shrink-0" />
				<p className="text-xs text-destructive">Failed to load security settings.</p>
			</div>
		);
	}

	return (
		<div className="grid gap-4">
			<AuthenticationCard workspaceId={workspaceId} settings={settingsQuery.data} />
			<AccessControlsCard workspaceId={workspaceId} settings={settingsQuery.data} />
			<AuditLogCard workspaceId={workspaceId} enabled={settingsQuery.data.audit_log_enabled} />
		</div>
	);
}

// ─── Authentication ───────────────────────────────────────────────────────────

function AuthenticationCard({ workspaceId, settings }: { workspaceId: string; settings: SecuritySettings }) {
	const qc = useQueryClient();
	const mutation = useMutation({
		mutationFn: (patch: Partial<SecuritySettings>) => apiUpdateSecuritySettings(workspaceId, patch),
		onSuccess: (data) => {
			qc.setQueryData(["security-settings", workspaceId], data);
			toast.success("Security settings updated");
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update"),
	});

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="text-sm font-semibold">Authentication</CardTitle>
				<CardDescription className="text-xs">Control how all agents sign in to the workspace</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<Label className="text-xs">Require Two-Factor Authentication</Label>
						<p className="text-[10px] text-muted-foreground">Enforce 2FA for every agent in this workspace on next sign-in</p>
					</div>
					<Switch
						checked={settings.require_2fa}
						disabled={mutation.isPending}
						onCheckedChange={(v) => mutation.mutate({ require_2fa: v })}
					/>
				</div>
				<Separator />
				<div className="flex items-center justify-between">
					<div>
						<Label className="text-xs">Strong Password Policy</Label>
						<p className="text-[10px] text-muted-foreground">Require ≥12 chars with mixed case, digits and symbols on registration & reset</p>
					</div>
					<Switch
						checked={settings.strong_password}
						disabled={mutation.isPending}
						onCheckedChange={(v) => mutation.mutate({ strong_password: v })}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

// ─── Access Controls ──────────────────────────────────────────────────────────

function AccessControlsCard({ workspaceId, settings }: { workspaceId: string; settings: SecuritySettings }) {
	const qc = useQueryClient();
	const settingsMutation = useMutation({
		mutationFn: (patch: Partial<SecuritySettings>) => apiUpdateSecuritySettings(workspaceId, patch),
		onSuccess: (data) => {
			qc.setQueryData(["security-settings", workspaceId], data);
			toast.success("Security settings updated");
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to update"),
	});

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader>
				<CardTitle className="text-sm font-semibold">Access Controls</CardTitle>
				<CardDescription className="text-xs">Restrict and audit workspace access</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<div>
						<Label className="text-xs">IP Allowlist</Label>
						<p className="text-[10px] text-muted-foreground">Reject sign-ins from IPs that are not in the allowlist below</p>
					</div>
					<Switch
						checked={settings.ip_allowlist_enabled}
						disabled={settingsMutation.isPending}
						onCheckedChange={(v) => settingsMutation.mutate({ ip_allowlist_enabled: v })}
					/>
				</div>

				{settings.ip_allowlist_enabled && (
					<>
						<Separator />
						<IpAllowlistEditor workspaceId={workspaceId} />
					</>
				)}

				<Separator />
				<div className="flex items-center justify-between">
					<div>
						<Label className="text-xs">Audit Log</Label>
						<p className="text-[10px] text-muted-foreground">Record agent sign-ins, security changes, and sensitive actions</p>
					</div>
					<Switch
						checked={settings.audit_log_enabled}
						disabled={settingsMutation.isPending}
						onCheckedChange={(v) => settingsMutation.mutate({ audit_log_enabled: v })}
					/>
				</div>
			</CardContent>
		</Card>
	);
}

function IpAllowlistEditor({ workspaceId }: { workspaceId: string }) {
	const qc = useQueryClient();
	const [cidr, setCidr] = useState("");
	const [label, setLabel] = useState("");

	const listQuery = useQuery({
		queryKey: ["ip-allowlist", workspaceId],
		queryFn: () => apiListIpAllowlist(workspaceId),
	});

	const addMutation = useMutation({
		mutationFn: () => apiAddIpAllowlistEntry(workspaceId, { cidr: cidr.trim(), label: label.trim() || undefined }),
		onSuccess: (entry) => {
			qc.setQueryData<IpAllowlistEntry[]>(["ip-allowlist", workspaceId], (prev) => [entry, ...(prev ?? [])]);
			setCidr("");
			setLabel("");
			toast.success("IP added to allowlist");
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to add"),
	});

	const removeMutation = useMutation({
		mutationFn: (id: string) => apiDeleteIpAllowlistEntry(workspaceId, id),
		onSuccess: (_data, id) => {
			qc.setQueryData<IpAllowlistEntry[]>(["ip-allowlist", workspaceId], (prev) => (prev ?? []).filter((e) => e.id !== id));
			toast.success("IP removed");
		},
		onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to remove"),
	});

	return (
		<div className="space-y-3">
			<div className="flex items-end gap-2">
				<div className="flex-1">
					<Label className="text-[10px] text-muted-foreground">IP or CIDR</Label>
					<Input
						value={cidr}
						onChange={(e) => setCidr(e.target.value)}
						placeholder="203.0.113.5 or 203.0.113.0/24"
						className="h-8 text-xs"
					/>
				</div>
				<div className="flex-1">
					<Label className="text-[10px] text-muted-foreground">Label (optional)</Label>
					<Input
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						placeholder="Office VPN"
						className="h-8 text-xs"
					/>
				</div>
				<Button
					size="sm"
					className="h-8 text-xs gap-1"
					onClick={() => addMutation.mutate()}
					disabled={!cidr.trim() || addMutation.isPending}>
					{addMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
					Add
				</Button>
			</div>

			{listQuery.isLoading ? (
				<div className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Loader2 className="size-3 animate-spin" /> Loading...</div>
			) : (listQuery.data?.length ?? 0) === 0 ? (
				<div className="rounded-lg border border-dashed p-3 flex items-center gap-2">
					<Shield className="size-3.5 text-muted-foreground" />
					<p className="text-[10px] text-muted-foreground">
						No IPs added yet. With the allowlist enabled and empty, all sign-ins will be blocked — add at least one entry.
					</p>
				</div>
			) : (
				<div className="space-y-1.5">
					{listQuery.data!.map((entry) => (
						<div key={entry.id} className="flex items-center justify-between rounded-lg border bg-background px-3 py-1.5">
							<div className="flex items-center gap-2 min-w-0">
								<code className="text-[11px] font-mono">{entry.cidr}</code>
								{entry.label && <span className="text-[10px] text-muted-foreground truncate">— {entry.label}</span>}
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="h-6 w-6 p-0"
								onClick={() => removeMutation.mutate(entry.id)}
								disabled={removeMutation.isPending}>
								<Trash2 className="size-3 text-destructive" />
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
	"auth.login": "Sign-in",
	"auth.login_blocked_ip": "Sign-in blocked (IP)",
	"security.settings_updated": "Security settings updated",
	"security.ip_added": "IP added to allowlist",
	"security.ip_removed": "IP removed from allowlist",
};

function actionVariant(action: string): "default" | "secondary" | "destructive" {
	if (action.includes("blocked")) return "destructive";
	if (action.startsWith("auth.")) return "secondary";
	return "default";
}

function AuditLogCard({ workspaceId, enabled }: { workspaceId: string; enabled: boolean }) {
	const [showAll, setShowAll] = useState(false);
	const limit = showAll ? 200 : 25;

	const query = useQuery({
		queryKey: ["audit-log", workspaceId, limit],
		queryFn: () => apiListAuditLog(workspaceId, { limit }),
		enabled,
	});

	return (
		<Card className="border-0 shadow-sm">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-sm font-semibold flex items-center gap-1.5">
							<History className="size-3.5" />
							Audit Log
						</CardTitle>
						<CardDescription className="text-xs">Recent sensitive actions in this workspace</CardDescription>
					</div>
					{enabled && query.data && query.data.total > limit && (
						<Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowAll(true)}>
							Show all ({query.data.total})
						</Button>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{!enabled ? (
					<div className="rounded-lg border border-dashed p-3">
						<p className="text-[10px] text-muted-foreground">Enable the Audit Log toggle above to start recording events.</p>
					</div>
				) : query.isLoading ? (
					<div className="text-[10px] text-muted-foreground flex items-center gap-1.5"><Loader2 className="size-3 animate-spin" /> Loading...</div>
				) : (query.data?.entries.length ?? 0) === 0 ? (
					<p className="text-[10px] text-muted-foreground">No events recorded yet.</p>
				) : (
					<div className="space-y-1.5 max-h-96 overflow-y-auto">
						{query.data!.entries.map((entry) => <AuditLogRow key={entry.id} entry={entry} />)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function AuditLogRow({ entry }: { entry: AuditLogEntry }) {
	const date = new Date(entry.created_at * 1000);
	return (
		<div className="flex items-start gap-3 rounded-lg border bg-background px-3 py-2">
			<Badge variant={actionVariant(entry.action)} className="text-[9px] shrink-0 mt-0.5">
				{ACTION_LABELS[entry.action] ?? entry.action}
			</Badge>
			<div className="flex-1 min-w-0">
				<p className="text-[11px] truncate">
					<span className="font-medium">{entry.actor_email ?? "System"}</span>
					{entry.target && <span className="text-muted-foreground"> · {entry.target}</span>}
				</p>
				<p className="text-[10px] text-muted-foreground">
					{date.toLocaleString()}
					{entry.ip && <span> · {entry.ip}</span>}
				</p>
			</div>
		</div>
	);
}
