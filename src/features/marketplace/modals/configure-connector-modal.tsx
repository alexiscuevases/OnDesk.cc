import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ConsoleTag } from "@/shared/components/console";
import { ActionRunner } from "../components/action-runner";
import { useUpdateInstall } from "../hooks/use-marketplace-mutations";
import type { PublicWorkspaceProduct } from "../api/marketplace-api";

export interface ConfigureConnectorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	install: PublicWorkspaceProduct;
	workspaceId: string;
	slug: string;
}

/**
 * Credentials + health check for one installed connector. Stored secrets are
 * never sent back to the browser — a saved field shows as "stored" and is only
 * overwritten when the admin types a new value.
 */
export function ConfigureConnectorModal({ open, onOpenChange, install, workspaceId, slug }: ConfigureConnectorModalProps) {
	const updateMutation = useUpdateInstall(workspaceId, slug);

	const [values, setValues] = useState<Record<string, string>>(() => {
		const initial: Record<string, string> = {};
		for (const field of install.config_fields) {
			if (!field.secret) initial[field.key] = install.settings[field.key] ?? "";
		}
		return initial;
	});
	const [enabled, setEnabled] = useState(install.status === "enabled");

	const isStored = (key: string) => install.credential_keys.includes(key);

	const save = () => {
		const config: Record<string, string> = {};
		for (const field of install.config_fields) {
			const value = values[field.key];
			// Untouched secrets stay as they are.
			if (value === undefined) continue;
			if (field.secret && value === "") continue;
			config[field.key] = value;
		}

		for (const field of install.config_fields) {
			if (!field.required) continue;
			const provided = config[field.key]?.trim() || (field.secret && isStored(field.key));
			if (!provided) {
				toast.error(`${field.label} is required`);
				return;
			}
		}

		updateMutation.mutate(
			{ workspaceProductId: install.workspace_product_id, config, status: enabled ? "enabled" : "disabled" },
			{
				onSuccess: () => toast.success(`${install.name} saved`),
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						{install.name}
						<Badge variant="outline" className="text-[9px] text-muted-foreground">
							{install.actions.length} actions
						</Badge>
					</DialogTitle>
					<DialogDescription className="text-xs">
						{install.description ?? "Configure the credentials this workspace uses to call the API."}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-2">
					{/* ── Status ───────────────────────────────────────────── */}
					<div className="flex items-center justify-between border border-border p-3">
						<div>
							<p className="text-xs font-medium">Available to agents</p>
							<p className="text-[11px] text-muted-foreground">
								Turning this off removes the connector from every agent immediately.
							</p>
						</div>
						<Switch checked={enabled} onCheckedChange={setEnabled} />
					</div>

					{install.last_test_at !== null && (
						<p className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
							{install.last_test_ok ? (
								<CheckCircle2 className="size-3 text-accent" />
							) : (
								<XCircle className="size-3 text-destructive" />
							)}
							Last call {new Date(install.last_test_at * 1000).toLocaleString()}
							{install.last_test_error ? ` — ${install.last_test_error}` : ""}
						</p>
					)}

					{/* ── Credentials ──────────────────────────────────────── */}
					<section className="space-y-3">
						<div className="flex items-center justify-between">
							<ConsoleTag className="text-primary dark:text-accent">Credentials</ConsoleTag>
							{install.docs_url && (
								<a
									href={install.docs_url}
									target="_blank"
									rel="noreferrer"
									className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground underline hover:text-foreground"
								>
									API docs
									<ExternalLink className="size-2.5" />
								</a>
							)}
						</div>

						{install.config_fields.length === 0 ? (
							<p className="text-[11px] text-muted-foreground">This connector needs no configuration.</p>
						) : (
							install.config_fields.map((field) => (
								<div key={field.key} className="space-y-1.5">
									<Label htmlFor={`config-${field.key}`} className="flex items-center gap-1.5 text-xs">
										{field.label}
										{field.required && <span className="text-destructive">*</span>}
										{field.secret && isStored(field.key) && (
											<Badge variant="outline" className="border-accent/40 text-[9px] text-accent">
												Stored
											</Badge>
										)}
									</Label>
									<Input
										id={`config-${field.key}`}
										type={field.secret ? "password" : "text"}
										value={values[field.key] ?? ""}
										onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
										placeholder={
											field.secret && isStored(field.key) ? "•••••••• (leave blank to keep)" : field.placeholder || ""
										}
										autoComplete="off"
										className="font-mono text-xs"
									/>
									{field.help && <p className="text-[10px] text-muted-foreground">{field.help}</p>}
								</div>
							))
						)}

						<Button size="sm" className="h-8 text-xs" onClick={save} disabled={updateMutation.isPending}>
							{updateMutation.isPending ? "Saving…" : "Save configuration"}
						</Button>
					</section>

					{/* ── Live check ───────────────────────────────────────── */}
					<section className="space-y-3 border-t border-border pt-4">
						<ConsoleTag className="text-primary dark:text-accent">Try it</ConsoleTag>
						<p className="text-[11px] text-muted-foreground">
							Run a real call to confirm the credentials work before agents rely on it.
						</p>
						<ActionRunner install={install} workspaceId={workspaceId} slug={slug} />
					</section>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
