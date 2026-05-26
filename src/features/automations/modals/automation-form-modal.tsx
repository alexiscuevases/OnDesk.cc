import { useState } from "react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { AutomationRuleBuilder } from "../components/automation-rule-builder";
import { AutomationActionBuilder } from "../components/automation-action-builder";
import type {
	Automation,
	AutomationTriggerType,
	AutomationConditions,
	AutomationAction,
} from "../api/automations-api";

const TRIGGER_OPTIONS: { value: AutomationTriggerType; label: string; group: "event" | "scheduled" }[] = [
	{ value: "ticket.created", label: "Ticket created", group: "event" },
	{ value: "ticket.updated", label: "Ticket updated", group: "event" },
	{ value: "ticket.status_changed", label: "Status changed", group: "event" },
	{ value: "ticket.priority_changed", label: "Priority changed", group: "event" },
	{ value: "ticket.assigned", label: "Ticket assigned", group: "event" },
	{ value: "message.received", label: "Message received", group: "event" },
	{ value: "message.sent", label: "Message sent", group: "event" },
	{ value: "scheduled.time_since_created", label: "Time since created", group: "scheduled" },
	{ value: "scheduled.time_since_updated", label: "Time since last updated", group: "scheduled" },
];

export interface AutomationFormValues {
	name: string;
	description: string;
	trigger_type: AutomationTriggerType;
	enabled: boolean;
	schedule_minutes: number | null;
	conditions: AutomationConditions;
	actions: AutomationAction[];
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	automation?: Automation | null;
	users: { id: string; name: string }[];
	teams: { id: string; name: string }[];
	cannedReplies: { id: string; name: string }[];
	onSubmit: (values: AutomationFormValues) => void;
}

function defaultValues(automation?: Automation | null): AutomationFormValues {
	return {
		name: automation?.name ?? "",
		description: automation?.description ?? "",
		trigger_type: automation?.trigger_type ?? "ticket.created",
		enabled: automation?.enabled ?? true,
		schedule_minutes: automation?.schedule_minutes ?? null,
		conditions: automation?.conditions ?? { match: "all", rules: [] },
		actions: automation?.actions ?? [],
	};
}

export function AutomationFormModal({ open, onOpenChange, automation, users, teams, cannedReplies, onSubmit }: Props) {
	const [values, setValues] = useState<AutomationFormValues>(() => defaultValues(automation));

	const isScheduled = values.trigger_type.startsWith("scheduled.");
	const isValid = values.name.trim().length > 0 && values.actions.length > 0 && (!isScheduled || (values.schedule_minutes ?? 0) > 0);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!isValid) return;
		onSubmit(values);
	};

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title={automation ? "Edit automation" : "New automation"}
			description="Define what triggers this rule and what happens when it matches"
			maxWidth="sm:max-w-xl"
		>
			<form onSubmit={handleSubmit}>
				<div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 pr-1">
					<div className="grid gap-2">
						<Label htmlFor="automation-name" className="text-xs font-medium">Name</Label>
						<Input
							id="automation-name"
							value={values.name}
							onChange={(e) => setValues({ ...values, name: e.target.value })}
							className="h-9 rounded-lg"
							placeholder="Auto-assign urgent tickets to leads"
						/>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="automation-description" className="text-xs font-medium">Description</Label>
						<Textarea
							id="automation-description"
							value={values.description}
							onChange={(e) => setValues({ ...values, description: e.target.value })}
							className="min-h-[60px] rounded-lg text-xs"
							placeholder="Optional"
						/>
					</div>

					<div className="grid grid-cols-[1fr_auto] items-end gap-2">
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Trigger</Label>
							<Select
								value={values.trigger_type}
								onValueChange={(v) => setValues({ ...values, trigger_type: v as AutomationTriggerType })}
							>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Events</div>
									{TRIGGER_OPTIONS.filter((t) => t.group === "event").map((t) => (
										<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
									))}
									<div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Scheduled</div>
									{TRIGGER_OPTIONS.filter((t) => t.group === "scheduled").map((t) => (
										<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2 pb-2">
							<Switch
								id="automation-enabled"
								checked={values.enabled}
								onCheckedChange={(checked) => setValues({ ...values, enabled: checked })}
							/>
							<Label htmlFor="automation-enabled" className="text-xs">Enabled</Label>
						</div>
					</div>

					{isScheduled && (
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Minutes after</Label>
							<Input
								type="number"
								min={1}
								value={values.schedule_minutes ?? ""}
								onChange={(e) => setValues({ ...values, schedule_minutes: e.target.value ? Number(e.target.value) : null })}
								className="h-9 rounded-lg"
								placeholder="60"
							/>
							<p className="text-[10px] text-muted-foreground">
								Evaluated by the cron job. Each ticket fires this rule at most once.
							</p>
						</div>
					)}

					<div className="rounded-lg border bg-card p-3">
						<AutomationRuleBuilder
							value={values.conditions}
							onChange={(conditions) => setValues({ ...values, conditions })}
						/>
					</div>

					<div className="rounded-lg border bg-card p-3">
						<AutomationActionBuilder
							value={values.actions}
							onChange={(actions) => setValues({ ...values, actions })}
							users={users}
							teams={teams}
							cannedReplies={cannedReplies}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button type="submit" disabled={!isValid} className="rounded-lg text-xs font-semibold">
						{automation ? "Save changes" : "Create automation"}
					</Button>
				</DialogFooter>
			</form>
		</FormModal>
	);
}
