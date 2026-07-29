import { useState } from "react";
import { Plus, Trash2, Route } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsoleTag } from "@/shared/components/console";
import type { ActionInput, ActionParameter, PublicProduct, PublicProductAction } from "../api/marketplace-api";

const METHODS: PublicProductAction["method"][] = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const LOCATIONS: ActionParameter["in"][] = ["query", "path", "body", "header"];
const TYPES: ActionParameter["type"][] = ["string", "number", "boolean", "object", "array"];

export interface ActionFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	connector: PublicProduct;
	action: PublicProductAction | null;
	onSubmit: (input: ActionInput) => void;
	isPending?: boolean;
}

interface ParamRow extends ActionParameter {
	enumText?: string;
}

function toRows(parameters: ActionParameter[]): ParamRow[] {
	return parameters.map((param) => ({ ...param, enumText: param.enum?.join(", ") ?? "" }));
}

/** Path placeholders and path parameters must always agree — keep them in sync. */
function syncPathParams(path: string, rows: ParamRow[]): ParamRow[] {
	const placeholders = [...path.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => m[1]);

	// Drop path params whose placeholder disappeared from the path.
	const kept = rows.filter((row) => row.in !== "path" || placeholders.includes(row.name));

	// Add path params for new placeholders.
	for (const name of placeholders) {
		if (!kept.some((row) => row.name === name && row.in === "path")) {
			kept.push({ name, in: "path", type: "string", required: true, enumText: "" });
		}
	}
	return kept;
}

/**
 * One registered endpoint = one tool the AI can call. The description matters:
 * it is what the model reads to decide whether this is the right action.
 */
export function ActionFormModal({ open, onOpenChange, connector, action, onSubmit, isPending }: ActionFormModalProps) {
	const [name, setName] = useState(action?.name ?? "");
	const [description, setDescription] = useState(action?.description ?? "");
	const [method, setMethod] = useState<PublicProductAction["method"]>(action?.method ?? "GET");
	const [path, setPath] = useState(action?.path ?? "/");
	const [contentType, setContentType] = useState<PublicProductAction["content_type"]>(action?.content_type ?? "json");
	const [params, setParams] = useState<ParamRow[]>(toRows(action?.parameters ?? []));
	const [responsePath, setResponsePath] = useState(action?.response_path ?? "");
	const [readOnly, setReadOnly] = useState(action?.is_read_only ?? true);
	const [requiresConfirmation, setRequiresConfirmation] = useState(action?.requires_confirmation ?? false);
	const [enabled, setEnabled] = useState(action?.enabled ?? true);
	const [error, setError] = useState<string | null>(null);

	const updateParam = (index: number, patch: Partial<ParamRow>) => {
		setParams((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
	};

	const handlePathChange = (value: string) => {
		setPath(value);
		setParams((prev) => syncPathParams(value, prev));
	};

	const handleMethodChange = (value: PublicProductAction["method"]) => {
		setMethod(value);
		const isWrite = value !== "GET";
		// Writes default to read-only off + approval required; the user can override.
		setReadOnly(!isWrite);
		setRequiresConfirmation(isWrite);
		if (!isWrite) setContentType("none");
		else if (contentType === "none") setContentType("json");
	};

	const handleSubmit = () => {
		setError(null);

		if (!/^[a-z][a-z0-9_]{1,63}$/.test(name)) {
			return setError('Name must be lowercase snake_case, e.g. "find_customer_by_email".');
		}
		if (description.trim().length < 10) {
			return setError("Describe when the agent should use this endpoint (at least 10 characters).");
		}
		if (!path.trim()) return setError("Path is required.");

		const seen = new Set<string>();
		const parameters: ActionParameter[] = [];
		for (const row of params) {
			const paramName = row.name.trim();
			if (!paramName) return setError("Every parameter needs a name.");
			if (seen.has(paramName)) return setError(`Duplicate parameter "${paramName}".`);
			seen.add(paramName);

			const enumValues = (row.enumText ?? "")
				.split(",")
				.map((v) => v.trim())
				.filter(Boolean);

			parameters.push({
				name: paramName,
				in: row.in,
				type: row.type,
				required: row.required,
				description: row.description?.trim() || undefined,
				enum: enumValues.length > 0 ? enumValues : undefined,
				default: row.default === "" || row.default === undefined ? undefined : row.default,
			});
		}

		onSubmit({
			name,
			description: description.trim(),
			method,
			path: path.trim(),
			content_type: contentType,
			parameters,
			headers: action?.headers ?? {},
			response_path: responsePath.trim() || null,
			requires_confirmation: requiresConfirmation,
			is_read_only: readOnly,
			enabled,
		});
	};

	const previewUrl = `${connector.base_url}${path.startsWith("/") ? path : `/${path}`}`;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-3xl max-h-[88vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{action ? `Edit ${action.name}` : "Register an endpoint"}</DialogTitle>
					<DialogDescription className="text-xs">
						Each endpoint becomes one tool your AI agents can call on {connector.name}.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-5 py-2">
					<div className="grid gap-3 sm:grid-cols-[140px_1fr]">
						<div className="space-y-1.5">
							<Label>Method</Label>
							<Select value={method} onValueChange={(v) => handleMethodChange(v as PublicProductAction["method"])}>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{METHODS.map((m) => (
										<SelectItem key={m} value={m}>
											{m}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="action-path">Path</Label>
							<Input
								id="action-path"
								value={path}
								onChange={(e) => handlePathChange(e.target.value)}
								placeholder="/v1/customers/{customer_id}"
								className="font-mono text-xs"
							/>
						</div>
					</div>

					<p className="flex items-center gap-1.5 truncate border border-border bg-muted/40 px-2 py-1.5 font-mono text-[10px] text-muted-foreground">
						<Route className="size-3 shrink-0" />
						{previewUrl}
					</p>

					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label htmlFor="action-name">Action name</Label>
							<Input
								id="action-name"
								value={name}
								onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
								placeholder="find_customer_by_email"
								className="font-mono text-xs"
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Request body format</Label>
							<Select
								value={contentType}
								onValueChange={(v) => setContentType(v as PublicProductAction["content_type"])}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="json">JSON</SelectItem>
									<SelectItem value="form">Form-encoded (Stripe style)</SelectItem>
									<SelectItem value="none">No body</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label htmlFor="action-description">When should the agent use this?</Label>
						<Textarea
							id="action-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							placeholder="Find a customer by email address. Use this first to get the customer id needed by the other actions."
							className="text-sm"
						/>
					</div>

					{/* ── Parameters ───────────────────────────────────────── */}
					<section className="space-y-2 border-t border-border pt-4">
						<div className="flex items-center justify-between">
							<ConsoleTag className="text-primary dark:text-accent">Parameters</ConsoleTag>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="h-7 text-[10px]"
								onClick={() =>
									setParams((prev) => [...prev, { name: "", in: "query", type: "string", required: false, enumText: "" }])
								}
							>
								<Plus className="mr-1 size-3" />
								Add parameter
							</Button>
						</div>

						{params.length === 0 ? (
							<p className="border border-dashed border-border p-3 text-[11px] text-muted-foreground">
								No parameters. Add one for every value the agent must supply.
							</p>
						) : (
							<div className="divide-y border border-border">
								{params.map((row, index) => (
									<div key={index} className="space-y-2 p-2">
										<div className="grid items-center gap-2 sm:grid-cols-[1fr_110px_110px_auto_auto]">
											<Input
												value={row.name}
												onChange={(e) => updateParam(index, { name: e.target.value })}
												placeholder="customer_id"
												className="h-8 font-mono text-xs"
												disabled={row.in === "path"}
											/>
											<Select value={row.in} onValueChange={(v) => updateParam(index, { in: v as ActionParameter["in"] })}>
												<SelectTrigger className="h-8 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{LOCATIONS.map((location) => (
														<SelectItem key={location} value={location} disabled={location === "path" && row.in !== "path"}>
															{location}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<Select
												value={row.type}
												onValueChange={(v) => updateParam(index, { type: v as ActionParameter["type"] })}
											>
												<SelectTrigger className="h-8 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													{TYPES.map((type) => (
														<SelectItem key={type} value={type}>
															{type}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
												<Switch
													checked={row.required}
													onCheckedChange={(v) => updateParam(index, { required: v })}
													disabled={row.in === "path"}
												/>
												Req
											</label>
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="size-8 text-destructive"
												onClick={() => setParams((prev) => prev.filter((_, i) => i !== index))}
												disabled={row.in === "path"}
											>
												<Trash2 className="size-3.5" />
											</Button>
										</div>
										<div className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
											<Input
												value={row.description ?? ""}
												onChange={(e) => updateParam(index, { description: e.target.value })}
												placeholder="What this value is (the agent reads this)"
												className="h-7 text-[11px]"
											/>
											<Input
												value={row.enumText ?? ""}
												onChange={(e) => updateParam(index, { enumText: e.target.value })}
												placeholder="allowed, values, csv"
												className="h-7 font-mono text-[11px]"
											/>
											<Input
												value={row.default === undefined ? "" : String(row.default)}
												onChange={(e) => updateParam(index, { default: e.target.value })}
												placeholder="default"
												className="h-7 font-mono text-[11px]"
											/>
										</div>
									</div>
								))}
							</div>
						)}
						{params.some((row) => row.in === "path") && (
							<p className="text-[10px] text-muted-foreground">
								Path parameters are derived from the {"{placeholders}"} in the path.
							</p>
						)}
					</section>

					{/* ── Behaviour ────────────────────────────────────────── */}
					<section className="space-y-3 border-t border-border pt-4">
						<ConsoleTag className="text-primary dark:text-accent">Behaviour</ConsoleTag>

						<div className="space-y-1.5">
							<Label htmlFor="action-response-path">Response path (optional)</Label>
							<Input
								id="action-response-path"
								value={responsePath}
								onChange={(e) => setResponsePath(e.target.value)}
								placeholder="data"
								className="h-8 font-mono text-xs"
							/>
							<p className="text-[10px] text-muted-foreground">
								Only this part of the response is handed to the agent — keeps replies fast and cheap.
							</p>
						</div>

						<div className="divide-y border border-border">
							<ToggleRow
								label="Read-only"
								hint="The endpoint only reads data and changes nothing."
								checked={readOnly}
								onCheckedChange={setReadOnly}
							/>
							<ToggleRow
								label="Requires human approval"
								hint="The agent can never run it on its own — it must escalate instead."
								checked={requiresConfirmation}
								onCheckedChange={setRequiresConfirmation}
								badge={requiresConfirmation ? "PROTECTED" : undefined}
							/>
							<ToggleRow
								label="Enabled"
								hint="Disabled endpoints disappear from every agent's toolset."
								checked={enabled}
								onCheckedChange={setEnabled}
							/>
						</div>
					</section>

					{error && (
						<p className="border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">{error}</p>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSubmit} disabled={isPending}>
						{isPending ? "Saving…" : action ? "Save endpoint" : "Register endpoint"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ToggleRow({
	label,
	hint,
	checked,
	onCheckedChange,
	badge,
}: {
	label: string;
	hint: string;
	checked: boolean;
	onCheckedChange: (value: boolean) => void;
	badge?: string;
}) {
	return (
		<div className="flex items-center justify-between gap-3 p-3">
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<p className="text-xs font-medium">{label}</p>
					{badge && (
						<Badge variant="outline" className="border-warning/40 text-[9px] text-warning">
							{badge}
						</Badge>
					)}
				</div>
				<p className="text-[11px] text-muted-foreground">{hint}</p>
			</div>
			<Switch checked={checked} onCheckedChange={onCheckedChange} />
		</div>
	);
}
