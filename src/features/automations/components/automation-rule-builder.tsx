import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type {
	AutomationConditions,
	AutomationConditionRule,
	AutomationConditionField,
	AutomationConditionOp,
} from "../api/automations-api";

const FIELD_OPTIONS: { value: AutomationConditionField; label: string }[] = [
	{ value: "subject", label: "Subject" },
	{ value: "status", label: "Status" },
	{ value: "priority", label: "Priority" },
	{ value: "channel", label: "Channel" },
	{ value: "assignee_id", label: "Assignee" },
	{ value: "team_id", label: "Team" },
	{ value: "contact_id", label: "Contact" },
	{ value: "contact_email", label: "Contact email" },
	{ value: "company_id", label: "Company" },
	{ value: "message_content", label: "Message content" },
];

const OP_OPTIONS: { value: AutomationConditionOp; label: string }[] = [
	{ value: "eq", label: "equals" },
	{ value: "neq", label: "not equals" },
	{ value: "contains", label: "contains" },
	{ value: "not_contains", label: "does not contain" },
	{ value: "gt", label: ">" },
	{ value: "lt", label: "<" },
	{ value: "is_empty", label: "is empty" },
	{ value: "is_not_empty", label: "is not empty" },
];

const OPS_WITHOUT_VALUE: AutomationConditionOp[] = ["is_empty", "is_not_empty"];

interface Props {
	value: AutomationConditions;
	onChange: (value: AutomationConditions) => void;
}

export function AutomationRuleBuilder({ value, onChange }: Props) {
	const updateRule = (index: number, patch: Partial<AutomationConditionRule>) => {
		const next = [...value.rules];
		next[index] = { ...next[index], ...patch };
		onChange({ ...value, rules: next });
	};

	const addRule = () => {
		onChange({
			...value,
			rules: [...value.rules, { field: "subject", op: "contains", value: "" }],
		});
	};

	const removeRule = (index: number) => {
		onChange({ ...value, rules: value.rules.filter((_, i) => i !== index) });
	};

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<Label className="console-label">When</Label>
				<Select value={value.match} onValueChange={(v) => onChange({ ...value, match: v as "all" | "any" })}>
					<SelectTrigger className="h-7 w-32 text-xs">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">ALL match</SelectItem>
						<SelectItem value="any">ANY match</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				{value.rules.length === 0 && (
					<p className="border border-dashed p-3 text-center text-xs text-muted-foreground">
						No conditions — runs on every event of this type.
					</p>
				)}
				{value.rules.map((rule, i) => {
					const noValue = OPS_WITHOUT_VALUE.includes(rule.op);
					return (
						<div key={i} className="flex items-center gap-2">
							<Select value={rule.field} onValueChange={(v) => updateRule(i, { field: v as AutomationConditionField })}>
								<SelectTrigger className="h-8 flex-1 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{FIELD_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select value={rule.op} onValueChange={(v) => updateRule(i, { op: v as AutomationConditionOp })}>
								<SelectTrigger className="h-8 w-36 text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{OP_OPTIONS.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{!noValue && (
								<Input
									value={(rule.value as string) ?? ""}
									onChange={(e) => updateRule(i, { value: e.target.value })}
									className="h-8 flex-1 text-xs"
									placeholder="Value"
								/>
							)}
							<Button type="button" variant="ghost" size="icon" onClick={() => removeRule(i)} className="size-8 shrink-0">
								<Trash2 className="size-3.5" />
							</Button>
						</div>
					);
				})}
			</div>

			<Button type="button" variant="outline" size="sm" onClick={addRule} className="h-7 text-xs">
				<Plus className="mr-1 size-3" />
				Add condition
			</Button>
		</div>
	);
}
