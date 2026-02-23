"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Agent } from "@/lib/data";
import { nextId } from "@/lib/config-data";
import { type AgentFormValues } from "../schemas/config.schema";
import { AddAgentModal } from "../modals/add-agent-modal";
import { EditAgentModal } from "../modals/edit-agent-modal";
import { DeleteAgentModal } from "../modals/delete-agent-modal";

interface AgentsSectionProps {
	agents: Agent[];
	setAgents: React.Dispatch<React.SetStateAction<Agent[]>>;
}

export function AgentsSection({ agents, setAgents }: AgentsSectionProps) {
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

	function handleAdd(values: AgentFormValues) {
		const emailPrefix = values.email.split("@")[0] || "Agent";
		const name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
		const newAgent: Agent = {
			id: nextId("a"),
			name,
			email: values.email,
			role: values.role,
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

	function handleEdit(values: AgentFormValues) {
		if (!selectedAgent) return;
		setAgents((prev) => prev.map((a) => (a.id === selectedAgent.id ? { ...a, role: values.role } : a)));
	}

	function handleDelete() {
		if (!selectedAgent) return;
		setAgents((prev) => prev.filter((a) => a.id !== selectedAgent.id));
		setSelectedAgent(null);
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
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={() => setAddOpen(true)}>
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
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg"
										onClick={() => {
											setSelectedAgent(agent);
											setEditOpen(true);
										}}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit agent</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => {
											setSelectedAgent(agent);
											setDeleteOpen(true);
										}}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete agent</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<AddAgentModal open={addOpen} onOpenChange={setAddOpen} onConfirm={handleAdd} />
			<EditAgentModal open={editOpen} onOpenChange={setEditOpen} agent={selectedAgent} onConfirm={handleEdit} />
			<DeleteAgentModal open={deleteOpen} onOpenChange={setDeleteOpen} agent={selectedAgent} onConfirm={handleDelete} />
		</>
	);
}
