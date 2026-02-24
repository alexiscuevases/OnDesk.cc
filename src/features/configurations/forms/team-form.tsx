import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DialogFooter } from "@/components/ui/dialog";
import type { WorkspaceMember } from "@/features/users/api/users-api";
import { teamSchema, type TeamFormValues } from "../schemas/config.schema";

interface TeamFormProps {
	defaultValues?: Partial<TeamFormValues>;
	agents: WorkspaceMember[];
	onSubmit: (values: TeamFormValues) => void;
	onCancel: () => void;
	submitLabel: string;
}

export function TeamForm({ defaultValues, agents, onSubmit, onCancel, submitLabel }: TeamFormProps) {
	const [memberSearch, setMemberSearch] = useState(false);

	const form = useForm({
		defaultValues: {
			name: defaultValues?.name ?? "",
			description: defaultValues?.description ?? "",
			image: defaultValues?.image ?? "",
			leaderId: defaultValues?.leaderId ?? "",
			memberIds: defaultValues?.memberIds ?? [],
			autoAssign: defaultValues?.autoAssign ?? true,
		},
		onSubmit: async ({ value }) => onSubmit(value as TeamFormValues),
		validators: { onChange: teamSchema },
		validatorAdapter: zodValidator(),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}>
			<div className="grid gap-4 py-4">
				<form.Field name="name">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="team-name" className="text-xs font-medium">
								Team Name
							</Label>
							<Input
								id="team-name"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								className="h-9 rounded-lg"
							/>
							{field.state.meta.errors[0] && (
								<p className="text-xs text-destructive">{field.state.meta.errors[0]?.message}</p>
							)}
						</div>
					)}
				</form.Field>

				<form.Field name="description">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="team-desc" className="text-xs font-medium">
								Description
							</Label>
							<Textarea
								id="team-desc"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Brief description of the team's responsibilities"
								className="min-h-20 rounded-lg resize-none"
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="image">
					{(field) => (
						<div className="grid gap-2">
							<Label htmlFor="team-image" className="text-xs font-medium">
								Team Initials/Image
							</Label>
							<Input
								id="team-image"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value.slice(0, 2).toUpperCase())}
								placeholder="ES"
								maxLength={2}
								className="h-9 rounded-lg"
							/>
						</div>
					)}
				</form.Field>

				<form.Field name="leaderId">
					{(field) => (
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Team Lead</Label>
							<Select value={field.state.value} onValueChange={field.handleChange}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue placeholder="Select team lead..." />
								</SelectTrigger>
								<SelectContent>
									{agents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											{agent.name} - {agent.workspace_role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>

				<form.Field name="memberIds">
					{(field) => {
						const toggleMember = (agentId: string) => {
							const current = field.state.value;
							field.handleChange(
								current.includes(agentId) ? current.filter((id) => id !== agentId) : [...current, agentId],
							);
						};

						return (
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Team Members</Label>
								<Popover open={memberSearch} onOpenChange={setMemberSearch}>
									<PopoverTrigger asChild>
										<Button variant="outline" role="combobox" className="h-9 justify-between rounded-lg text-xs">
											<span className="truncate">
												{field.state.value.length === 0 ? "Select members..." : `${field.state.value.length} selected`}
											</span>
											<ChevronRight className="ml-2 size-3.5 shrink-0 rotate-90" />
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-72 p-0" align="start">
										<Command>
											<CommandInput placeholder="Search agents..." className="h-9" />
											<CommandList>
												<CommandEmpty>No agent found.</CommandEmpty>
												<CommandGroup>
													{agents.map((agent) => {
														const isSelected = field.state.value.includes(agent.id);
														return (
															<CommandItem key={agent.id} value={agent.name} onSelect={() => toggleMember(agent.id)}>
																<div className="flex items-center gap-2 flex-1">
																	<Checkbox checked={isSelected} onCheckedChange={() => toggleMember(agent.id)} />
																	<span className="text-xs">{agent.name}</span>
																</div>
																<Badge variant="secondary" className="text-[10px] rounded-full px-1.5 ml-auto">
																	{agent.workspace_role}
																</Badge>
															</CommandItem>
														);
													})}
												</CommandGroup>
											</CommandList>
										</Command>
									</PopoverContent>
								</Popover>
								{field.state.value.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{field.state.value.map((id) => {
											const agent = agents.find((a) => a.id === id);
											if (!agent) return null;
											return (
												<Badge key={id} variant="secondary" className="text-[10px] gap-1 rounded-full pr-1">
													{agent.name}
													<button
														type="button"
														onClick={() => toggleMember(id)}
														className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5">
														<X className="size-2.5" />
													</button>
												</Badge>
											);
										})}
									</div>
								)}
							</div>
						);
					}}
				</form.Field>

				<form.Field name="autoAssign">
					{(field) => (
						<div className="flex items-center justify-between pt-2">
							<div>
								<Label htmlFor="auto-assign" className="text-xs font-medium">
									Auto-assign tickets
								</Label>
								<p className="text-[10px] text-muted-foreground">Automatically route tickets to this team</p>
							</div>
							<Switch
								id="auto-assign"
								checked={field.state.value}
								onCheckedChange={field.handleChange}
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
						<Button type="submit" disabled={!canSubmit} className="rounded-lg text-xs font-semibold">
							{submitLabel}
						</Button>
					)}
				</form.Subscribe>
			</DialogFooter>
		</form>
	);
}
