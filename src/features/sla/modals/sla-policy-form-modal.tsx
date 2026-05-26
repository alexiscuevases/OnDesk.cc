import { useState } from "react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { SlaPolicy, SlaPriority } from "../api/sla-api";

export interface SlaFormValues {
	name: string;
	description: string;
	enabled: boolean;
	applies_to_team_id: string | null;
	applies_to_company_id: string | null;
	applies_to_priority: SlaPriority | null;
	response_low: number | null;
	response_medium: number | null;
	response_high: number | null;
	response_urgent: number | null;
	resolution_low: number | null;
	resolution_medium: number | null;
	resolution_high: number | null;
	resolution_urgent: number | null;
	business_hours_only: boolean;
	business_hours_id: string | null;
	priority: number;
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	policy?: SlaPolicy | null;
	teams: { id: string; name: string }[];
	companies: { id: string; name: string }[];
	businessHours: { id: string; name: string; is_default: boolean }[];
	onSubmit: (values: SlaFormValues) => void;
}

function defaults(p?: SlaPolicy | null): SlaFormValues {
	return {
		name: p?.name ?? "",
		description: p?.description ?? "",
		enabled: p?.enabled ?? true,
		applies_to_team_id: p?.applies_to_team_id ?? null,
		applies_to_company_id: p?.applies_to_company_id ?? null,
		applies_to_priority: p?.applies_to_priority ?? null,
		response_low: p?.response_low ?? null,
		response_medium: p?.response_medium ?? 60,
		response_high: p?.response_high ?? 30,
		response_urgent: p?.response_urgent ?? 15,
		resolution_low: p?.resolution_low ?? null,
		resolution_medium: p?.resolution_medium ?? 1440,
		resolution_high: p?.resolution_high ?? 480,
		resolution_urgent: p?.resolution_urgent ?? 240,
		business_hours_only: p?.business_hours_only ?? false,
		business_hours_id: p?.business_hours_id ?? null,
		priority: p?.priority ?? 0,
	};
}

export function SlaPolicyFormModal({ open, onOpenChange, policy, teams, companies, businessHours, onSubmit }: Props) {
	const [v, setV] = useState<SlaFormValues>(() => defaults(policy));

	const valid = v.name.trim().length > 0;

	const renderTarget = (key: keyof SlaFormValues, label: string) => (
		<div className="grid gap-1">
			<Label className="text-[10px] text-muted-foreground">{label}</Label>
			<Input
				type="number"
				min={0}
				value={(v[key] as number | null) ?? ""}
				onChange={(e) => setV({ ...v, [key]: e.target.value ? Number(e.target.value) : null })}
				placeholder="—"
				className="h-8 rounded-md text-xs"
			/>
		</div>
	);

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title={policy ? "Edit SLA policy" : "New SLA policy"}
			description="Targets are in minutes. Leave blank for no SLA on that priority."
			maxWidth="sm:max-w-xl"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (valid) onSubmit(v);
				}}
			>
				<div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Name</Label>
						<Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="h-9 rounded-lg" />
					</div>
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Description</Label>
						<Textarea
							value={v.description}
							onChange={(e) => setV({ ...v, description: e.target.value })}
							className="min-h-[50px] rounded-lg text-xs"
						/>
					</div>

					<div className="grid grid-cols-3 gap-3">
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Scope: priority</Label>
							<Select
								value={v.applies_to_priority ?? "all"}
								onValueChange={(val) =>
									setV({ ...v, applies_to_priority: val === "all" ? null : (val as SlaPriority) })
								}
							>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="low">Low</SelectItem>
									<SelectItem value="medium">Medium</SelectItem>
									<SelectItem value="high">High</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Scope: team</Label>
							<Select
								value={v.applies_to_team_id ?? "all"}
								onValueChange={(val) => setV({ ...v, applies_to_team_id: val === "all" ? null : val })}
							>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									{teams.map((t) => (
										<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Scope: company</Label>
							<Select
								value={v.applies_to_company_id ?? "all"}
								onValueChange={(val) => setV({ ...v, applies_to_company_id: val === "all" ? null : val })}
							>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									{companies.map((c) => (
										<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="rounded-lg border bg-card p-3">
						<p className="mb-2 text-xs font-medium">First response (minutes)</p>
						<div className="grid grid-cols-4 gap-2">
							{renderTarget("response_low", "Low")}
							{renderTarget("response_medium", "Medium")}
							{renderTarget("response_high", "High")}
							{renderTarget("response_urgent", "Urgent")}
						</div>
					</div>

					<div className="rounded-lg border bg-card p-3">
						<p className="mb-2 text-xs font-medium">Resolution (minutes)</p>
						<div className="grid grid-cols-4 gap-2">
							{renderTarget("resolution_low", "Low")}
							{renderTarget("resolution_medium", "Medium")}
							{renderTarget("resolution_high", "High")}
							{renderTarget("resolution_urgent", "Urgent")}
						</div>
					</div>

					<div className="rounded-lg border bg-card p-3">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-xs font-medium">Business hours only</p>
								<p className="text-[10px] text-muted-foreground">
									Clock only ticks during the calendar's open windows (skips weekends and holidays).
								</p>
							</div>
							<Switch
								checked={v.business_hours_only}
								onCheckedChange={(c) => setV({ ...v, business_hours_only: c })}
							/>
						</div>
						{v.business_hours_only && (
							<div className="mt-3 grid gap-2">
								<Label className="text-[10px] text-muted-foreground">Calendar</Label>
								<Select
									value={v.business_hours_id ?? "default"}
									onValueChange={(val) =>
										setV({ ...v, business_hours_id: val === "default" ? null : val })
									}
								>
									<SelectTrigger className="h-9 rounded-lg text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="default" className="text-xs">
											Workspace default
										</SelectItem>
										{businessHours.map((b) => (
											<SelectItem key={b.id} value={b.id} className="text-xs">
												{b.name}
												{b.is_default ? " (default)" : ""}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{businessHours.length === 0 && (
									<p className="text-[10px] text-amber-600 dark:text-amber-400">
										No business hours configured. Create one in Settings → Business Hours; otherwise this flag has no effect.
									</p>
								)}
							</div>
						)}
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Switch checked={v.enabled} onCheckedChange={(c) => setV({ ...v, enabled: c })} />
							<Label className="text-xs">Enabled</Label>
						</div>
						<div className="flex items-center gap-2">
							<Label className="text-xs">Match priority</Label>
							<Input
								type="number"
								min={0}
								value={v.priority}
								onChange={(e) => setV({ ...v, priority: Number(e.target.value) || 0 })}
								className="h-8 w-20 rounded-md text-xs"
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button type="submit" disabled={!valid} className="rounded-lg text-xs font-semibold">
						{policy ? "Save changes" : "Create policy"}
					</Button>
				</DialogFooter>
			</form>
		</FormModal>
	);
}
