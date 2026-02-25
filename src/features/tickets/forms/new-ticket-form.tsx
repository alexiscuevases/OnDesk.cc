import { Plus } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { newTicketSchema, type NewTicketFormValues } from "../schemas/ticket.schema";
import { useTeams } from "@/features/teams/hooks/use-team-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";

interface NewTicketFormProps {
	onSubmit: (values: NewTicketFormValues) => void;
	onCancel: () => void;
	isPending?: boolean;
	workspaceId: string;
}

export function NewTicketForm({ onSubmit, onCancel, isPending, workspaceId }: NewTicketFormProps) {
	const { data: teams = [] } = useTeams(workspaceId);
	const { data: contacts = [] } = useContacts(workspaceId);
	const { data: members = [] } = useWorkspaceMembers(workspaceId);

	const form = useForm({
		defaultValues: {
			subject: "",
			body: "",
			contact_id: "",
			assignee_id: "",
			priority: "medium" as const,
			team_id: "",
		},
		onSubmit: async ({ value }) => onSubmit(value),
		validators: { onChange: newTicketSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<div className="grid gap-4 py-4">
				<form.Field name="subject">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="nt-subject" className="text-xs font-medium">
								Subject <span className="text-destructive">*</span>
							</Label>
							<Input
								id="nt-subject"
								placeholder="Brief description of the issue"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="h-9 rounded-lg"
							/>
							{field.state.meta.errors.length > 0 && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="body">
					{(field) => (
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Body</Label>
							<TiptapEditor
								content={field.state.value}
								onChange={field.handleChange}
								placeholder="Describe the issue in detail..."
								minHeight="min-h-[120px]"
								members={members.map((m) => ({ id: m.id, name: m.name }))}
							/>
						</div>
					)}
				</form.Field>

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="contact_id">
						{(field) => (
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Contact</Label>
								<Select value={field.state.value} onValueChange={field.handleChange}>
									<SelectTrigger className="h-9 rounded-lg text-xs">
										<SelectValue placeholder="Select contact..." />
									</SelectTrigger>
									<SelectContent>
										{contacts.map((c) => (
											<SelectItem key={c.id} value={c.id}>
												{c.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="assignee_id">
						{(field) => (
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Assignee</Label>
								<Select value={field.state.value} onValueChange={field.handleChange}>
									<SelectTrigger className="h-9 rounded-lg text-xs">
										<SelectValue placeholder="Assign to agent..." />
									</SelectTrigger>
									<SelectContent>
										{members.map((m) => (
											<SelectItem key={m.id} value={m.id}>
												{m.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="priority">
						{(field) => (
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Priority</Label>
								<Select value={field.state.value} onValueChange={field.handleChange}>
									<SelectTrigger className="h-9 rounded-lg text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="low">Low</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>

					<form.Field name="team_id">
						{(field) => (
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Team</Label>
								<Select value={field.state.value} onValueChange={field.handleChange}>
									<SelectTrigger className="h-9 rounded-lg text-xs">
										<SelectValue placeholder="Assign to team..." />
									</SelectTrigger>
									<SelectContent>
										{teams.map((t) => (
											<SelectItem key={t.id} value={t.id}>
												{t.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel} className="rounded-lg text-xs">
					Cancel
				</Button>
				<form.Subscribe selector={(s) => s.canSubmit}>
					{(canSubmit) => (
						<Button
							type="submit"
							disabled={!canSubmit || isPending}
							className="rounded-lg text-xs font-semibold gap-1.5">
							<Plus className="size-3.5" />
							Create Ticket
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
