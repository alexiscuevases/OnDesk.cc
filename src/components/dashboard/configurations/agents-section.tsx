"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { type Agent } from "@/lib/data";
import { nextId } from "@/lib/config-data";

interface AgentsSectionProps {
	agents: Agent[];
	setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export function AgentsSection({ agents, setAgents }: AgentsSectionProps) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
	const [form, setForm] = useState({ email: "", role: "Agent" });

	function openAdd() {
		setEditingAgent(null);
		setForm({ email: "", role: "Agent" });
		setDialogOpen(true);
	}

	function openEdit(agent: Agent) {
		setEditingAgent(agent);
		setForm({ email: agent.email, role: agent.role });
		setDialogOpen(true);
	}

	function openDelete(agent: Agent) {
		setDeleteTarget(agent);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.email) return;
		if (editingAgent) {
			setAgents((prev) => prev.map((a) => (a.id === editingAgent.id ? { ...a, role: form.role } : a)));
		} else {
			const emailPrefix = form.email.split("@")[0] || "Agent";
			const name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
			const newAgent: Agent = {
				id: nextId("a"),
				name,
				email: form.email,
				role: form.role,
				status: "offline",
				invitationStatus: "pending",
				invitationSentAt: new Date().toISOString(),
				initials: name
					.split(" ")
					.map((w) => w[0])
					.join("")
					.slice(0, 2)
					.toUpperCase(),
				tickets: 0,
			};
			setAgents((prev) => [...prev, newAgent]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	function handleResendInvitation(agentId: string) {
		setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, invitationSentAt: new Date().toISOString() } : a)));
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Support Agents</CardTitle>
							<CardDescription className="text-xs">{agents.length} agents in your workspace</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Agent
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{agents.map((agent) => (
							<div key={agent.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="relative">
									<Avatar className="size-9 rounded-lg">
										<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[11px] font-bold">
											{agent.initials}
										</AvatarFallback>
									</Avatar>
									<div
										className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${
											agent.status === "online" ? "bg-accent" : agent.status === "away" ? "bg-warning" : "bg-muted-foreground"
										}`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{agent.name}</p>
									<p className="text-[11px] text-muted-foreground">{agent.email}</p>
								</div>
								<Badge variant="secondary" className="text-[10px] rounded-full px-2">
									{agent.role}
								</Badge>
								{agent.invitationStatus === "pending" ? (
									<Button
										variant="outline"
										size="sm"
										className="h-7 gap-1.5 text-[11px] rounded-lg"
										onClick={() => handleResendInvitation(agent.id)}>
										<Mail className="size-3" />
										Resend Invitation
									</Button>
								) : (
									<div className="text-right shrink-0">
										<p className="text-sm font-bold">{agent.tickets}</p>
										<p className="text-[10px] text-muted-foreground">tickets</p>
									</div>
								)}
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(agent)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit agent</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(agent)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete agent</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
						<DialogDescription>{editingAgent ? "Update agent information" : "Invite a new agent to your workspace"}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="agent-email" className="text-xs font-medium">
								Email Address
							</Label>
							<Input
								id="agent-email"
								type="email"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								disabled={!!editingAgent}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Role</Label>
							<Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Admin">Admin</SelectItem>
									<SelectItem value="Senior Agent">Senior Agent</SelectItem>
									<SelectItem value="Agent">Agent</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.email} className="rounded-lg text-xs font-semibold">
							{editingAgent ? "Save Changes" : "Send Invitation"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Agent?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove {deleteTarget?.name}? This will unassign their tickets and remove their access.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Agent
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
