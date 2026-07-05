import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AutomationAction, AutomationActionType } from "../api/automations-api";

const ACTION_OPTIONS: { value: AutomationActionType; label: string }[] = [
	{ value: "set_status", label: "Set status" },
	{ value: "set_priority", label: "Set priority" },
	{ value: "assign_user", label: "Assign user" },
	{ value: "assign_team", label: "Assign team" },
	{ value: "send_canned_reply", label: "Send canned reply" },
	{ value: "add_internal_note", label: "Add internal note" },
	{ value: "escalate_to_human", label: "Escalate to human" },
	{ value: "stop_processing", label: "Stop processing" },
];

interface UserOption { id: string; name: string }
interface TeamOption { id: string; name: string }
interface CannedReplyOption { id: string; name: string }

interface Props {
	value: AutomationAction[];
	onChange: (value: AutomationAction[]) => void;
	users: UserOption[];
	teams: TeamOption[];
	cannedReplies: CannedReplyOption[];
}

export function AutomationActionBuilder({ value, onChange, users, teams, cannedReplies }: Props) {
	const updateAction = (index: number, patch: Partial<AutomationAction>) => {
		const next = [...value];
		next[index] = { ...next[index], ...patch };
		onChange(next);
	};

	const updateParams = (index: number, paramPatch: Record<string, unknown>) => {
		const next = [...value];
		next[index] = { ...next[index], params: { ...next[index].params, ...paramPatch } };
		onChange(next);
	};

	const addAction = () => {
		onChange([...value, { type: "set_status", params: { status: "pending" } }]);
	};

	const removeAction = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	const renderParams = (action: AutomationAction, index: number) => {
		switch (action.type) {
			case "set_status":
				return (
					<Select value={(action.params.status as string) ?? "pending"} onValueChange={(v) => updateParams(index, { status: v })}>
						<SelectTrigger className="h-8 flex-1 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="open">Open</SelectItem>
							<SelectItem value="pending">Pending</SelectItem>
							<SelectItem value="resolved">Resolved</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
						</SelectContent>
					</Select>
				);
			case "set_priority":
				return (
					<Select value={(action.params.priority as string) ?? "medium"} onValueChange={(v) => updateParams(index, { priority: v })}>
						<SelectTrigger className="h-8 flex-1 text-xs">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="low">Low</SelectItem>
							<SelectItem value="medium">Medium</SelectItem>
							<SelectItem value="high">High</SelectItem>
							<SelectItem value="urgent">Urgent</SelectItem>
						</SelectContent>
					</Select>
				);
			case "assign_user":
				return (
					<Select value={(action.params.user_id as string) ?? ""} onValueChange={(v) => updateParams(index, { user_id: v })}>
						<SelectTrigger className="h-8 flex-1 text-xs">
							<SelectValue placeholder="Select user" />
						</SelectTrigger>
						<SelectContent>
							{users.map((u) => (
								<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			case "assign_team":
				return (
					<Select value={(action.params.team_id as string) ?? ""} onValueChange={(v) => updateParams(index, { team_id: v })}>
						<SelectTrigger className="h-8 flex-1 text-xs">
							<SelectValue placeholder="Select team" />
						</SelectTrigger>
						<SelectContent>
							{teams.map((t) => (
								<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			case "send_canned_reply":
				return (
					<Select value={(action.params.canned_reply_id as string) ?? ""} onValueChange={(v) => updateParams(index, { canned_reply_id: v })}>
						<SelectTrigger className="h-8 flex-1 text-xs">
							<SelectValue placeholder="Select canned reply" />
						</SelectTrigger>
						<SelectContent>
							{cannedReplies.map((r) => (
								<SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
							))}
						</SelectContent>
					</Select>
				);
			case "add_internal_note":
				return (
					<Textarea
						value={(action.params.content as string) ?? ""}
						onChange={(e) => updateParams(index, { content: e.target.value })}
						placeholder="Note content"
						className="min-h-[60px] flex-1 text-xs"
					/>
				);
			case "escalate_to_human":
				return (
					<Input
						value={(action.params.note as string) ?? ""}
						onChange={(e) => updateParams(index, { note: e.target.value })}
						placeholder="Escalation note (optional)"
						className="h-8 flex-1 text-xs"
					/>
				);
			case "stop_processing":
				return <span className="flex-1 text-xs text-muted-foreground">Halts further automations on this ticket</span>;
		}
	};

	return (
		<div className="space-y-3">
			<Label className="console-label">Then</Label>
			<div className="space-y-2">
				{value.length === 0 && (
					<p className="border border-dashed p-3 text-center text-xs text-muted-foreground">
						No actions configured.
					</p>
				)}
				{value.map((action, i) => (
					<div key={i} className="flex items-start gap-2">
						<Select
							value={action.type}
							onValueChange={(v) => updateAction(i, { type: v as AutomationActionType, params: {} })}
						>
							<SelectTrigger className="h-8 w-44 shrink-0 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{ACTION_OPTIONS.map((opt) => (
									<SelectItem key={opt.value} value={opt.value}>
										{opt.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{renderParams(action, i)}
						<Button type="button" variant="ghost" size="icon" onClick={() => removeAction(i)} className="size-8 shrink-0">
							<Trash2 className="size-3.5" />
						</Button>
					</div>
				))}
			</div>

			<Button type="button" variant="outline" size="sm" onClick={addAction} className="h-7 text-xs">
				<Plus className="mr-1 size-3" />
				Add action
			</Button>
		</div>
	);
}
