import { useMemo, useState } from "react";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConsoleTag } from "@/shared/components/console";
import type { AuthConfig, AuthType, ConfigField, ConnectorInput, ProductCategory, PublicProduct } from "../api/marketplace-api";

const CATEGORIES: { value: ProductCategory; label: string }[] = [
	{ value: "scheduling", label: "Scheduling" },
	{ value: "payments", label: "Payments" },
	{ value: "crm", label: "CRM" },
	{ value: "ecommerce", label: "E-commerce" },
	{ value: "communication", label: "Communication" },
	{ value: "internal", label: "Internal / enterprise" },
	{ value: "other", label: "Other" },
];

const AUTH_LABELS: { value: AuthType; label: string; hint: string }[] = [
	{ value: "bearer", label: "Bearer token", hint: "Authorization: Bearer <token> — Stripe, Calendly, most modern APIs" },
	{ value: "api_key_header", label: "API key in a header", hint: "e.g. X-API-Key: <key> or Authorization: Token <key>" },
	{ value: "api_key_query", label: "API key in the query string", hint: "e.g. ?api_key=<key>" },
	{ value: "basic", label: "HTTP Basic", hint: "base64(username:password)" },
	{ value: "custom", label: "Custom headers", hint: "Any headers you want, with {{field}} placeholders" },
	{ value: "none", label: "No authentication", hint: "Public endpoints only" },
];

type FieldType = "text" | "password" | "url";

interface KeyValueRow {
	key: string;
	value: string;
}

export interface ConnectorFormModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	connector: PublicProduct | null;
	onSubmit: (input: ConnectorInput) => void;
	isPending?: boolean;
}

const DEFAULT_FIELD: ConfigField = {
	key: "api_key",
	label: "API key",
	type: "password",
	secret: true,
	required: true,
};

function toRows(record: Record<string, string>): KeyValueRow[] {
	return Object.entries(record).map(([key, value]) => ({ key, value }));
}

function fromRows(rows: KeyValueRow[]): Record<string, string> {
	const result: Record<string, string> = {};
	for (const row of rows) {
		const key = row.key.trim();
		if (key) result[key] = row.value;
	}
	return result;
}

/**
 * Builds the connector envelope: where the API lives, how to authenticate, and
 * what each installing workspace has to fill in. Endpoints are registered
 * separately (see ConnectorEndpointsModal).
 */
export function ConnectorFormModal({ open, onOpenChange, connector, onSubmit, isPending }: ConnectorFormModalProps) {
	const initialAuth = connector?.auth_config;

	const [name, setName] = useState(connector?.name ?? "");
	const [description, setDescription] = useState(connector?.description ?? "");
	const [category, setCategory] = useState<ProductCategory>(connector?.category ?? "internal");
	const [baseUrl, setBaseUrl] = useState(connector?.base_url ?? "https://");
	const [docsUrl, setDocsUrl] = useState(connector?.docs_url ?? "");
	const [authType, setAuthType] = useState<AuthType>(connector?.auth_type ?? "bearer");
	const [fields, setFields] = useState<ConfigField[]>(
		connector?.config_fields?.length ? connector.config_fields : [DEFAULT_FIELD],
	);
	const [headerName, setHeaderName] = useState(
		initialAuth?.type === "api_key_header" ? initialAuth.header : "X-API-Key",
	);
	const [headerPrefix, setHeaderPrefix] = useState(
		initialAuth?.type === "api_key_header" ? (initialAuth.prefix ?? "") : "",
	);
	const [queryParam, setQueryParam] = useState(initialAuth?.type === "api_key_query" ? initialAuth.param : "api_key");
	const [tokenField, setTokenField] = useState(
		initialAuth && "token_field" in initialAuth ? initialAuth.token_field : DEFAULT_FIELD.key,
	);
	const [usernameField, setUsernameField] = useState(initialAuth?.type === "basic" ? initialAuth.username_field : "");
	const [passwordField, setPasswordField] = useState(initialAuth?.type === "basic" ? initialAuth.password_field : "");
	const [customHeaders, setCustomHeaders] = useState<KeyValueRow[]>(
		initialAuth?.type === "custom" ? toRows(initialAuth.headers) : [{ key: "", value: "" }],
	);
	const [defaultHeaders, setDefaultHeaders] = useState<KeyValueRow[]>(toRows(connector?.default_headers ?? {}));
	const [error, setError] = useState<string | null>(null);

	const fieldKeys = useMemo(() => fields.map((f) => f.key).filter(Boolean), [fields]);
	const secretKeys = useMemo(() => fields.filter((f) => f.secret).map((f) => f.key).filter(Boolean), [fields]);

	const updateField = (index: number, patch: Partial<ConfigField>) => {
		setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...patch } : field)));
	};

	const buildAuthConfig = (): AuthConfig | string => {
		switch (authType) {
			case "none":
				return { type: "none" };
			case "bearer":
				if (!tokenField) return "Pick which config field holds the token.";
				return { type: "bearer", token_field: tokenField };
			case "api_key_header":
				if (!headerName.trim()) return "Header name is required.";
				if (!tokenField) return "Pick which config field holds the key.";
				return {
					type: "api_key_header",
					header: headerName.trim(),
					prefix: headerPrefix.trim() || undefined,
					token_field: tokenField,
				};
			case "api_key_query":
				if (!queryParam.trim()) return "Query parameter name is required.";
				if (!tokenField) return "Pick which config field holds the key.";
				return { type: "api_key_query", param: queryParam.trim(), token_field: tokenField };
			case "basic":
				if (!usernameField || !passwordField) return "Pick the username and password config fields.";
				return { type: "basic", username_field: usernameField, password_field: passwordField };
			case "custom": {
				const headers = fromRows(customHeaders);
				if (Object.keys(headers).length === 0) return "Add at least one header.";
				return { type: "custom", headers };
			}
		}
	};

	const handleSubmit = () => {
		setError(null);

		if (name.trim().length < 2) return setError("Give the connector a name.");
		if (!/^https:\/\/.+/.test(baseUrl.trim())) return setError("Base URL must start with https://");

		for (const field of fields) {
			if (!/^[a-z][a-z0-9_]*$/.test(field.key)) {
				return setError(`Config field key "${field.key}" must be lowercase snake_case.`);
			}
		}
		if (new Set(fieldKeys).size !== fieldKeys.length) return setError("Config field keys must be unique.");

		const authConfig = buildAuthConfig();
		if (typeof authConfig === "string") return setError(authConfig);

		onSubmit({
			name: name.trim(),
			description: description.trim() || null,
			category,
			docs_url: docsUrl.trim() || null,
			base_url: baseUrl.trim().replace(/\/+$/, ""),
			auth_type: authType,
			auth_config: authConfig,
			config_fields: fields,
			default_headers: fromRows(defaultHeaders),
		});
	};

	const authHint = AUTH_LABELS.find((a) => a.value === authType)?.hint;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl max-h-[88vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{connector ? `Edit ${connector.name}` : "New connector"}</DialogTitle>
					<DialogDescription className="text-xs">
						Point Pulse at any REST API. Endpoints are registered afterwards, one by one or imported.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-2">
					{/* ── Identity ─────────────────────────────────────────── */}
					<section className="space-y-3">
						<ConsoleTag className="text-primary dark:text-accent">01 — Identity</ConsoleTag>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="connector-name">Name</Label>
								<Input
									id="connector-name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Billing API"
								/>
							</div>
							<div className="space-y-1.5">
								<Label>Category</Label>
								<Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{CATEGORIES.map((c) => (
											<SelectItem key={c.value} value={c.value}>
												{c.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="connector-description">What can the agent do with it?</Label>
							<Textarea
								id="connector-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={2}
								placeholder="Look up orders and shipping status in our internal fulfilment API."
								className="text-sm"
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="connector-base-url">Base URL</Label>
								<Input
									id="connector-base-url"
									value={baseUrl}
									onChange={(e) => setBaseUrl(e.target.value)}
									placeholder="https://api.example.com"
									className="font-mono text-xs"
								/>
								<p className="text-[10px] text-muted-foreground">
									Use {"{{field_key}}"} for values that differ per workspace, e.g. https://{"{{tenant}}"}.example.com
								</p>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="connector-docs">API docs URL (optional)</Label>
								<Input
									id="connector-docs"
									value={docsUrl}
									onChange={(e) => setDocsUrl(e.target.value)}
									placeholder="https://docs.example.com/api"
									className="font-mono text-xs"
								/>
							</div>
						</div>
					</section>

					{/* ── Config fields ────────────────────────────────────── */}
					<section className="space-y-3 border-t border-border pt-4">
						<div className="flex items-center justify-between">
							<ConsoleTag className="text-primary dark:text-accent">02 — What each workspace provides</ConsoleTag>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="h-7 text-[10px]"
								onClick={() => setFields((prev) => [...prev, { key: "", label: "", type: "text", secret: false, required: false }])}
							>
								<Plus className="mr-1 size-3" />
								Add field
							</Button>
						</div>
						<p className="text-[11px] text-muted-foreground">
							Secrets are encrypted per install and never leave the server. Non-secret fields can be used in URLs as{" "}
							{"{{key}}"}.
						</p>

						<div className="divide-y border border-border">
							{fields.length === 0 && (
								<p className="p-3 text-[11px] text-muted-foreground">No fields — the API needs no configuration.</p>
							)}
							{fields.map((field, index) => (
								<div key={index} className="grid items-center gap-2 p-2 sm:grid-cols-[1fr_1fr_130px_auto_auto]">
									<Input
										value={field.key}
										onChange={(e) => updateField(index, { key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
										placeholder="secret_key"
										className="h-8 font-mono text-xs"
									/>
									<Input
										value={field.label}
										onChange={(e) => updateField(index, { label: e.target.value })}
										placeholder="Secret key"
										className="h-8 text-xs"
									/>
									<Select
										value={field.type}
										onValueChange={(v) => updateField(index, { type: v as FieldType, secret: v === "password" })}
									>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="password">Secret</SelectItem>
											<SelectItem value="text">Text</SelectItem>
											<SelectItem value="url">URL</SelectItem>
										</SelectContent>
									</Select>
									<label className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
										<Switch checked={field.required} onCheckedChange={(v) => updateField(index, { required: v })} />
										Req
									</label>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="size-8 text-destructive"
										onClick={() => setFields((prev) => prev.filter((_, i) => i !== index))}
									>
										<Trash2 className="size-3.5" />
									</Button>
								</div>
							))}
						</div>
					</section>

					{/* ── Auth ─────────────────────────────────────────────── */}
					<section className="space-y-3 border-t border-border pt-4">
						<ConsoleTag className="text-primary dark:text-accent">03 — Authentication</ConsoleTag>
						<Select value={authType} onValueChange={(v) => setAuthType(v as AuthType)}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{AUTH_LABELS.map((auth) => (
									<SelectItem key={auth.value} value={auth.value}>
										{auth.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{authHint && <p className="text-[11px] text-muted-foreground">{authHint}</p>}

						{(authType === "bearer" || authType === "api_key_header" || authType === "api_key_query") && (
							<div className="grid gap-3 sm:grid-cols-3">
								{authType === "api_key_header" && (
									<>
										<div className="space-y-1.5">
											<Label>Header name</Label>
											<Input
												value={headerName}
												onChange={(e) => setHeaderName(e.target.value)}
												className="h-8 font-mono text-xs"
											/>
										</div>
										<div className="space-y-1.5">
											<Label>Value prefix</Label>
											<Input
												value={headerPrefix}
												onChange={(e) => setHeaderPrefix(e.target.value)}
												placeholder="Token"
												className="h-8 font-mono text-xs"
											/>
										</div>
									</>
								)}
								{authType === "api_key_query" && (
									<div className="space-y-1.5">
										<Label>Query parameter</Label>
										<Input
											value={queryParam}
											onChange={(e) => setQueryParam(e.target.value)}
											className="h-8 font-mono text-xs"
										/>
									</div>
								)}
								<div className="space-y-1.5">
									<Label>Token comes from</Label>
									<Select value={tokenField} onValueChange={setTokenField}>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue placeholder="Select a field" />
										</SelectTrigger>
										<SelectContent>
											{secretKeys.length === 0 && (
												<p className="px-2 py-1.5 text-[11px] text-muted-foreground">Add a secret field first</p>
											)}
											{secretKeys.map((key) => (
												<SelectItem key={key} value={key}>
													{key}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						)}

						{authType === "basic" && (
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label>Username field</Label>
									<Select value={usernameField} onValueChange={setUsernameField}>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue placeholder="Select a field" />
										</SelectTrigger>
										<SelectContent>
											{fieldKeys.map((key) => (
												<SelectItem key={key} value={key}>
													{key}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label>Password field</Label>
									<Select value={passwordField} onValueChange={setPasswordField}>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue placeholder="Select a field" />
										</SelectTrigger>
										<SelectContent>
											{secretKeys.map((key) => (
												<SelectItem key={key} value={key}>
													{key}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						)}

						{authType === "custom" && (
							<HeaderRows
								rows={customHeaders}
								onChange={setCustomHeaders}
								placeholderKey="X-Signature"
								placeholderValue="{{signing_key}}"
							/>
						)}
					</section>

					{/* ── Default headers ──────────────────────────────────── */}
					<section className="space-y-3 border-t border-border pt-4">
						<ConsoleTag className="text-primary dark:text-accent">04 — Headers on every request (optional)</ConsoleTag>
						<HeaderRows
							rows={defaultHeaders}
							onChange={setDefaultHeaders}
							placeholderKey="Stripe-Version"
							placeholderValue="2024-06-20"
						/>
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
						<KeyRound className="mr-1 size-3.5" />
						{isPending ? "Saving…" : connector ? "Save connector" : "Create connector"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function HeaderRows({
	rows,
	onChange,
	placeholderKey,
	placeholderValue,
}: {
	rows: KeyValueRow[];
	onChange: (rows: KeyValueRow[]) => void;
	placeholderKey: string;
	placeholderValue: string;
}) {
	return (
		<div className="space-y-2">
			{rows.map((row, index) => (
				<div key={index} className="flex items-center gap-2">
					<Input
						value={row.key}
						onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, key: e.target.value } : r)))}
						placeholder={placeholderKey}
						className="h-8 font-mono text-xs"
					/>
					<Input
						value={row.value}
						onChange={(e) => onChange(rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)))}
						placeholder={placeholderValue}
						className="h-8 font-mono text-xs"
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						className="size-8 text-destructive"
						onClick={() => onChange(rows.filter((_, i) => i !== index))}
					>
						<Trash2 className="size-3.5" />
					</Button>
				</div>
			))}
			<Button
				type="button"
				size="sm"
				variant="outline"
				className="h-7 text-[10px]"
				onClick={() => onChange([...rows, { key: "", value: "" }])}
			>
				<Plus className="mr-1 size-3" />
				Add header
			</Button>
		</div>
	);
}
