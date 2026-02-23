"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronRight, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type Agent } from "@/lib/data";
import { type ConfigTeam } from "@/types/index";
import { nextId } from "@/lib/config-data";

interface TeamsSectionProps {
	teams: ConfigTeam[];
	setTeams: React.Dispatch<React.SetStateAction<ConfigTeam[]>>;
	agents: Agent[];
}

export function TeamsSection({ teams, setTeams, agents }: TeamsSectionProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState<ConfigTeam | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ConfigTeam | null>(null);
	const [form, setForm] = useState({ name: "", description: "", image: "", leaderId: "", memberIds: [] as string[], autoAssign: true });
	const [memberSearch, setMemberSearch] = useState(false);

	function openAdd() {
		setEditingTeam(null);
		setForm({ name: "", description: "", image: "", leaderId: "", memberIds: [], autoAssign: true });
		setDialogOpen(true);
	}

	function openEdit(team: ConfigTeam) {
		setEditingTeam(team);
		setForm({
			name: team.name,
			description: team.description,
			image: team.image,
			leaderId: team.leaderId || "",
			memberIds: team.memberIds || [],
			autoAssign: team.autoAssign,
		});
		setDialogOpen(true);
	}

	function openDelete(team: ConfigTeam) {
		setDeleteTarget(team);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.name) return;
		const image =
			form.image ||
			form.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();

		if (editingTeam) {
			setTeams((prev) =>
				prev.map((t) =>
					t.id === editingTeam.id
						? {
								...t,
								name: form.name,
								description: form.description,
								image,
								leaderId: form.leaderId,
								lead: agents.find((a) => a.id === form.leaderId)?.name || t.lead,
								memberIds: form.memberIds,
								members: form.memberIds.length,
								autoAssign: form.autoAssign,
							}
						: t,
				),
			);
		} else {
			const newTeam: ConfigTeam = {
				id: nextId("t"),
				name: form.name,
				description: form.description,
				image,
				leaderId: form.leaderId,
				lead: agents.find((a) => a.id === form.leaderId)?.name || "Unassigned",
				memberIds: form.memberIds,
				members: form.memberIds.length,
				autoAssign: form.autoAssign,
			};
			setTeams((prev) => [...prev, newTeam]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setTeams((prev) => prev.filter((t) => t.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	function toggleMember(agentId: string) {
		setForm((prev) => ({
			...prev,
			memberIds: prev.memberIds.includes(agentId) ? prev.memberIds.filter((id) => id !== agentId) : [...prev.memberIds, agentId],
		}));
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Support Teams</CardTitle>
							<CardDescription className="text-xs">{teams.length} teams configured</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Team
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{teams.map((team) => (
							<div key={team.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<Avatar className="size-10 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">{team.image}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{team.name}</p>
									<p className="text-[11px] text-muted-foreground truncate">{team.description}</p>
								</div>
								<div className="text-center shrink-0">
									<p className="text-sm font-bold">{team.members}</p>
									<p className="text-[10px] text-muted-foreground">members</p>
								</div>
								{team.autoAssign && (
									<Badge variant="secondary" className="text-[10px] rounded-full px-2">
										Auto-assign
									</Badge>
								)}
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(team)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit team</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(team)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete team</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
						<DialogDescription>{editingTeam ? "Update team information" : "Create a new support team"}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="team-name" className="text-xs font-medium">
								Team Name
							</Label>
							<Input id="team-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 rounded-lg" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="team-desc" className="text-xs font-medium">
								Description
							</Label>
							<Textarea
								id="team-desc"
								value={form.description}
								onChange={(e) => setForm({ ...form, description: e.target.value })}
								placeholder="Brief description of the team's responsibilities"
								className="min-h-20 rounded-lg resize-none"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="team-image" className="text-xs font-medium">
								Team Initials/Image
							</Label>
							<Input
								id="team-image"
								value={form.image}
								onChange={(e) => setForm({ ...form, image: e.target.value.slice(0, 2).toUpperCase() })}
								placeholder="ES"
								maxLength={2}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Team Lead</Label>
							<Select value={form.leaderId} onValueChange={(v) => setForm({ ...form, leaderId: v })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue placeholder="Select team lead..." />
								</SelectTrigger>
								<SelectContent>
									{agents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											{agent.name} - {agent.role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Team Members</Label>
							<Popover open={memberSearch} onOpenChange={setMemberSearch}>
								<PopoverTrigger asChild>
									<Button variant="outline" role="combobox" className="h-9 justify-between rounded-lg text-xs">
										<span className="truncate">
											{form.memberIds.length === 0 ? "Select members..." : `${form.memberIds.length} selected`}
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
													const isSelected = form.memberIds.includes(agent.id);
													return (
														<CommandItem key={agent.id} value={agent.name} onSelect={() => toggleMember(agent.id)}>
															<div className="flex items-center gap-2 flex-1">
																<Checkbox checked={isSelected} onCheckedChange={() => toggleMember(agent.id)} />
																<span className="text-xs">{agent.name}</span>
															</div>
															<Badge variant="secondary" className="text-[10px] rounded-full px-1.5 ml-auto">
																{agent.role}
															</Badge>
														</CommandItem>
													);
												})}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							{form.memberIds.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{form.memberIds.map((id) => {
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
						<div className="flex items-center justify-between pt-2">
							<div>
								<Label htmlFor="auto-assign" className="text-xs font-medium">
									Auto-assign tickets
								</Label>
								<p className="text-[10px] text-muted-foreground">Automatically route tickets to this team</p>
							</div>
							<Switch id="auto-assign" checked={form.autoAssign} onCheckedChange={(checked) => setForm({ ...form, autoAssign: checked })} />
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.name} className="rounded-lg text-xs font-semibold">
							{editingTeam ? "Save Changes" : "Create Team"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Team?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete {deleteTarget?.name}? Existing tickets will need to be reassigned.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Team
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
