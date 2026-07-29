import { useState } from "react";
import { Play, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRunAction } from "../hooks/use-marketplace-mutations";
import type { PublicWorkspaceProduct, ToolCallResult } from "../api/marketplace-api";

export interface ActionRunnerProps {
	install: PublicWorkspaceProduct;
	workspaceId: string;
	slug: string;
}

/**
 * Runs one registered action against the live API with the workspace's stored
 * credentials — the same code path the agent uses, so what works here works
 * for the agent.
 */
export function ActionRunner({ install, workspaceId, slug }: ActionRunnerProps) {
	const runMutation = useRunAction(workspaceId, slug);
	const enabledActions = install.actions.filter((action) => action.enabled);

	const [actionName, setActionName] = useState(enabledActions[0]?.name ?? "");
	const [values, setValues] = useState<Record<string, string>>({});
	const [confirm, setConfirm] = useState(false);
	const [result, setResult] = useState<ToolCallResult | null>(null);
	const [error, setError] = useState<string | null>(null);

	const action = enabledActions.find((a) => a.name === actionName);

	const run = () => {
		if (!action) return;
		setError(null);
		setResult(null);

		const params: Record<string, unknown> = {};
		for (const param of action.parameters) {
			const raw = values[param.name];
			if (raw === undefined || raw.trim() === "") continue;
			params[param.name] = raw.trim();
		}

		runMutation.mutate(
			{ workspaceProductId: install.workspace_product_id, actionName: action.name, params, confirm },
			{
				onSuccess: setResult,
				onError: (e) => setError(e instanceof Error ? e.message : "Run failed"),
			},
		);
	};

	if (enabledActions.length === 0) {
		return (
			<p className="border border-dashed border-border p-3 text-[11px] text-muted-foreground">
				This connector has no enabled endpoints yet.
			</p>
		);
	}

	return (
		<div className="space-y-3">
			<div className="space-y-1.5">
				<Label>Action</Label>
				<Select
					value={actionName}
					onValueChange={(v) => {
						setActionName(v);
						setValues({});
						setResult(null);
						setError(null);
						setConfirm(false);
					}}
				>
					<SelectTrigger className="text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{enabledActions.map((a) => (
							<SelectItem key={a.id} value={a.name}>
								<span className="font-mono text-xs">
									{a.method} {a.name}
								</span>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{action && (
				<>
					<p className="text-[11px] text-muted-foreground">{action.description}</p>

					{action.parameters.length > 0 && (
						<div className="space-y-2">
							{action.parameters.map((param) => (
								<div key={param.name} className="space-y-1">
									<Label className="flex items-center gap-1.5 text-[11px]">
										<span className="font-mono">{param.name}</span>
										{param.required && <span className="text-destructive">*</span>}
										<Badge variant="outline" className="text-[9px] text-muted-foreground">
											{param.in}
										</Badge>
									</Label>
									<Input
										value={values[param.name] ?? ""}
										onChange={(e) => setValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
										placeholder={
											param.enum?.length
												? param.enum.join(" | ")
												: param.default !== undefined
													? String(param.default)
													: param.description || param.type
										}
										className="h-8 font-mono text-xs"
									/>
								</div>
							))}
						</div>
					)}

					{action.requires_confirmation && (
						<label className="flex items-start gap-2 border border-warning/40 bg-warning/10 p-2 text-[11px]">
							<Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(!!v)} className="mt-0.5" />
							<span>
								<span className="flex items-center gap-1 font-medium text-warning">
									<ShieldAlert className="size-3" />
									This action changes data
								</span>
								Agents can never run it. Tick to run it yourself, right now, for real.
							</span>
						</label>
					)}

					<Button
						size="sm"
						className="h-8 w-full text-xs"
						onClick={run}
						disabled={runMutation.isPending || (action.requires_confirmation && !confirm)}
					>
						<Play className="mr-1 size-3" />
						{runMutation.isPending ? "Calling…" : "Run"}
					</Button>
				</>
			)}

			{error && <p className="border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">{error}</p>}

			{result && (
				<div className="space-y-2 border border-border">
					<div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
						<span className="flex items-center gap-1.5 text-xs font-medium">
							{result.ok ? (
								<CheckCircle2 className="size-3.5 text-accent" />
							) : (
								<XCircle className="size-3.5 text-destructive" />
							)}
							{result.ok ? "Success" : "Failed"}
						</span>
						<span className="font-mono text-[10px] text-muted-foreground tabular-nums">
							{result.status ?? "—"} · {result.duration_ms}ms
						</span>
					</div>
					{result.request && (
						<p className="break-all px-3 font-mono text-[10px] text-muted-foreground">
							{result.request.method} {result.request.url}
						</p>
					)}
					{result.error && <p className="px-3 text-[11px] text-destructive">{result.error}</p>}
					<pre className="max-h-56 overflow-auto px-3 pb-3 font-mono text-[10px] leading-relaxed">
						{JSON.stringify(result.data ?? null, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
