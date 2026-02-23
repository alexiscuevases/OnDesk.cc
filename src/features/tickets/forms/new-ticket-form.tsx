import { Plus } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { newTicketSchema, type NewTicketFormValues } from "../schemas/ticket.schema";

interface NewTicketFormProps {
	onSubmit: (values: NewTicketFormValues) => void;
	onCancel: () => void;
}

export function NewTicketForm({ onSubmit, onCancel }: NewTicketFormProps) {
	const form = useForm({
		defaultValues: {
			subject: "",
			requesterEmail: "",
			priority: "medium" as const,
			team: "",
			description: "",
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
								Subject
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

				<div className="grid grid-cols-2 gap-4">
					<form.Field name="requesterEmail">
						{(field) => (
							<div className="grid gap-2">
								<Label htmlFor="nt-requester" className="text-xs font-medium">
									Requester Email
								</Label>
								<Input
									id="nt-requester"
									type="email"
									placeholder="user@company.com"
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
										<SelectItem value="critical">Critical</SelectItem>
									</SelectContent>
								</Select>
							</div>
						)}
					</form.Field>
				</div>

				<form.Field name="team">
					{(field) => (
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Team</Label>
							<Select value={field.state.value} onValueChange={field.handleChange}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue placeholder="Assign to team..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Email Support">Email Support</SelectItem>
									<SelectItem value="Teams Support">Teams Support</SelectItem>
									<SelectItem value="SharePoint Support">SharePoint Support</SelectItem>
									<SelectItem value="Identity & Access">{"Identity & Access"}</SelectItem>
									<SelectItem value="Cloud Storage">Cloud Storage</SelectItem>
									<SelectItem value="Office Apps">Office Apps</SelectItem>
									<SelectItem value="Automation">Automation</SelectItem>
								</SelectContent>
							</Select>
							{field.state.meta.errors.length > 0 && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="nt-desc" className="text-xs font-medium">
								Description
							</Label>
							<Textarea
								id="nt-desc"
								placeholder="Detailed description of the issue..."
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="min-h-24 rounded-lg resize-none"
							/>
						</div>
					)}
				</form.Field>
			</div>

			<DialogFooter>
				<Button type="button" variant="outline" onClick={onCancel} className="rounded-lg text-xs">
					Cancel
				</Button>
				<form.Subscribe selector={(s) => s.canSubmit}>
					{(canSubmit) => (
						<Button
							type="submit"
							disabled={!canSubmit}
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
