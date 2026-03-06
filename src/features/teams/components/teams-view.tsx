import { useState } from "react";
import { Users, CheckCircle2, Ticket, TrendingUp, Search, X, Clock } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkspace } from "@/context/workspace-context";
import { useTeams } from "../hooks/use-team-queries";
import { useTickets } from "@/features/tickets/hooks/use-ticket-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";

export function TeamsView() {
	const { workspace } = useWorkspace();
	const { data: teams = [] } = useTeams(workspace.id);
	const { data: tickets = [] } = useTickets(workspace.id);
	const { data: contacts = [] } = useContacts(workspace.id);
	const { data: companies = [] } = useCompanies(workspace.id);
	const navigate = useNavigate();
	const { slug } = useParams({ strict: false }) as { slug: string };

	const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const effectiveSelectedTeam = selectedTeam ?? teams[0]?.id ?? null;
	const selectedTeamData = teams.find((t) => t.id === effectiveSelectedTeam);
	const teamTickets = effectiveSelectedTeam ? tickets.filter((t) => t.team_id === effectiveSelectedTeam) : [];

	const resolvedToday = (teamId: string) =>
		tickets.filter((t) => {
			if (t.team_id !== teamId || t.status !== "resolved") return false;
			const today = new Date();
			const d = new Date(t.updated_at * 1000);
			return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
		}).length;

	const openCount = (teamId: string) => tickets.filter((t) => t.team_id === teamId && t.status === "open").length;
	const pendingCount = (teamId: string) => tickets.filter((t) => t.team_id === teamId && t.status === "pending").length;

	const totalResolved = teams.reduce((a, t) => a + resolvedToday(t.id), 0);
	const totalOpen = teams.reduce((a, t) => a + openCount(t.id), 0);
	const totalPending = teams.reduce((a, t) => a + pendingCount(t.id), 0);

	const filteredTickets = teamTickets.filter((ticket) => {
		const matchesSearch =
			searchQuery === "" ||
			ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
		const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
		return matchesSearch && matchesPriority && matchesStatus;
	});

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-balance">Teams</h1>
				<p className="text-sm text-muted-foreground mt-1">Manage support teams and view their ticket assignments</p>
			</div>

			{/* Summary */}
			<div className="grid grid-cols-4 gap-3">
				<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
					<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
						<Users className="size-5 text-primary" />
					</div>
					<div>
						<p className="text-xl font-bold">{teams.length}</p>
						<p className="text-[11px] text-muted-foreground">Total Teams</p>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
					<div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
						<TrendingUp className="size-5 text-accent" />
					</div>
					<div>
						<p className="text-xl font-bold">{totalResolved}</p>
						<p className="text-[11px] text-muted-foreground">Resolved Today</p>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
					<div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
						<Ticket className="size-5 text-warning" />
					</div>
					<div>
						<p className="text-xl font-bold">{totalOpen}</p>
						<p className="text-[11px] text-muted-foreground">Open Tickets</p>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
					<div className="flex size-10 items-center justify-center rounded-lg bg-chart-1/10">
						<Clock className="size-5 text-chart-1" />
					</div>
					<div>
						<p className="text-xl font-bold">{totalPending}</p>
						<p className="text-[11px] text-muted-foreground">Pending Tickets</p>
					</div>
				</div>
			</div>

			{/* Split Layout: Teams Left, Tickets Right */}
			<div className="grid lg:grid-cols-[340px_1fr] gap-4">
				{/* Left: Teams List */}
				<Card className="border-0 shadow-sm lg:sticky lg:top-4 lg:self-start">
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-semibold">Teams</CardTitle>
						<CardDescription className="text-xs">Select a team to view tickets</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						{teams.map((team) => {
							const teamOpen = openCount(team.id);
							const teamPending = pendingCount(team.id);
							const teamResolved = resolvedToday(team.id);
							const resolvePercent = Math.round((teamResolved / (teamOpen + teamResolved || 1)) * 100);
							const isSelected = effectiveSelectedTeam === team.id;
							const initials = team.name
								.split(" ")
								.map((w) => w[0])
								.join("")
								.slice(0, 2)
								.toUpperCase();
							return (
								<button
									key={team.id}
									onClick={() => setSelectedTeam(team.id)}
									className={`w-full text-left rounded-xl p-3 transition-all ${isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/40 hover:bg-secondary/80"
										}`}>
									<div className="flex items-center gap-3 mb-2">
										<Avatar className="size-9 rounded-lg">
											<AvatarImage src={team.logo_url ?? undefined} className="object-cover rounded-lg" />
											<AvatarFallback
												className={`rounded-lg text-xs font-bold ${isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
													}`}>
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className={`text-xs font-semibold truncate ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{team.name}
											</p>
											{team.description && (
												<p className={`text-[10px] truncate ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
													{team.description}
												</p>
											)}
										</div>
									</div>

									<div className="grid grid-cols-3 gap-1.5 mb-2">
										<div
											className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
												}`}>
											<span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{teamOpen}
											</span>
											<span className={`text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Open</span>
										</div>
										<div
											className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
												}`}>
											<span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{teamPending}
											</span>
											<span className={`text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Pending</span>
										</div>
										<div
											className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
												}`}>
											<span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{teamResolved}
											</span>
											<span className={`text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
												Resolved
											</span>
										</div>
									</div>

									<Progress value={resolvePercent} className={`h-1 ${isSelected ? "[&>div]:bg-primary-foreground/90" : ""}`} />
								</button>
							);
						})}
					</CardContent>
				</Card>

				{/* Right: Tickets with Filters */}
				{selectedTeamData && (
					<Card className="border-0 shadow-sm">
						<CardHeader>
							<div className="flex items-center justify-between mb-3">
								<div>
									<CardTitle className="text-sm font-semibold">{selectedTeamData.name} - Tickets</CardTitle>
									<CardDescription className="text-xs">
										{filteredTickets.length} of {teamTickets.length} ticket{teamTickets.length !== 1 ? "s" : ""}
									</CardDescription>
								</div>
							</div>

							{/* Filters */}
							<div className="flex flex-wrap items-center gap-2">
								<div className="relative flex-1 min-w-48">
									<Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
									<Input
										placeholder="Search by subject or ID..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="pl-8 h-8 rounded-lg text-xs"
									/>
									{searchQuery && (
										<button
											onClick={() => setSearchQuery("")}
											className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
											<X className="size-3" />
										</button>
									)}
								</div>
								<Select value={priorityFilter} onValueChange={setPriorityFilter}>
									<SelectTrigger className="w-32 h-8 rounded-lg text-xs">
										<SelectValue placeholder="Priority" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Priorities</SelectItem>
										<SelectItem value="urgent">Urgent</SelectItem>
										<SelectItem value="high">High</SelectItem>
										<SelectItem value="medium">Medium</SelectItem>
										<SelectItem value="low">Low</SelectItem>
									</SelectContent>
								</Select>
								<Select value={statusFilter} onValueChange={setStatusFilter}>
									<SelectTrigger className="w-32 h-8 rounded-lg text-xs">
										<SelectValue placeholder="Status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="all">All Statuses</SelectItem>
										<SelectItem value="open">Open</SelectItem>
										<SelectItem value="pending">Pending</SelectItem>
										<SelectItem value="resolved">Resolved</SelectItem>
										<SelectItem value="closed">Closed</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							{filteredTickets.length > 0 ? (
								<div className="space-y-2">
									{filteredTickets.map((ticket) => {
										const contact = ticket.contact_id ? contacts.find((c) => c.id === ticket.contact_id) : null;
										const companyLogo = contact?.company_id
											? (companies.find((c) => c.id === contact.company_id)?.logo_url ?? undefined)
											: undefined;
										const contactInitials = contact
											? contact.name
												.split(" ")
												.map((w) => w[0])
												.join("")
												.slice(0, 2)
												.toUpperCase()
											: "?";
										return (
											<div
												key={ticket.id}
												onClick={() => navigate({ to: "/w/$slug/tickets/$id", params: { slug, id: ticket.id } })}
												className="flex items-center justify-between gap-4 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80 cursor-pointer">
												<div className="flex items-center gap-3 min-w-0 flex-1">
													<Avatar className="size-8 rounded-lg shrink-0">
														<AvatarImage src={companyLogo} className="object-cover rounded-lg" />
														<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
															{contactInitials}
														</AvatarFallback>
													</Avatar>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium truncate">{ticket.subject}</p>
														<p className="text-[11px] text-muted-foreground truncate mt-0.5">
															{contact ? contact.name : "No contact"}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-2 shrink-0">
													<Badge
														variant={
															ticket.priority === "urgent" ? "destructive" : ticket.priority === "high" ? "default" : "secondary"
														}
														className={`text-[10px] rounded-full px-2 ${ticket.priority === "high" ? "bg-warning text-warning-foreground" : ""
															}`}>
														{ticket.priority}
													</Badge>
													<Badge variant="outline" className="text-[10px] rounded-full px-2">
														{ticket.status}
													</Badge>
												</div>
											</div>
										);
									})}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-10 text-center">
									{teamTickets.length === 0 ? (
										<>
											<CheckCircle2 className="size-8 text-muted-foreground/40 mb-2" />
											<p className="text-sm font-medium text-muted-foreground">No tickets assigned</p>
											<p className="text-[11px] text-muted-foreground/60">This team has no open tickets</p>
										</>
									) : (
										<>
											<Search className="size-8 text-muted-foreground/40 mb-2" />
											<p className="text-sm font-medium text-muted-foreground">No matching tickets</p>
											<p className="text-[11px] text-muted-foreground/60">Try adjusting your filters</p>
										</>
									)}
								</div>
							)}
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
