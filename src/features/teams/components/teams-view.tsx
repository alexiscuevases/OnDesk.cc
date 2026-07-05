import { useEffect, useState } from "react";
import { Users, CheckCircle2, Ticket, TrendingUp, Search, X, Clock } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, PanelHeader, StatGrid, StatTile, EmptyState, ConsoleTag } from "@/shared/components/console";
import { useWorkspace } from "@/context/workspace-context";
import { useTeams } from "../hooks/use-team-queries";
import { useTickets } from "@/features/tickets/hooks/use-ticket-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";
import { TeamTicketsTable } from "./team-tickets-table";

export function TeamsView({ initialTeamId }: { initialTeamId?: string }) {
	const { workspace } = useWorkspace();
	const { data: teams = [] } = useTeams(workspace.id);
	const { data: ticketPage } = useTickets(workspace.id);
	const tickets = ticketPage?.tickets ?? [];
	const { data: contacts = [] } = useContacts(workspace.id);
	const { data: companies = [] } = useCompanies(workspace.id);
	const navigate = useNavigate();
	const { slug } = useParams({ strict: false }) as { slug: string };

	const [selectedTeam, setSelectedTeam] = useState<string | null>(initialTeamId ?? null);
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
		const matchesSearch = searchQuery === "" || ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
		const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
		return matchesSearch && matchesPriority && matchesStatus;
	});

	useEffect(() => {
		if (!initialTeamId) return;
		if (teams.some((team) => team.id === initialTeamId)) {
			setSelectedTeam(initialTeamId);
		}
	}, [initialTeamId, teams]);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader tag="03 — Teams" title="Teams" description="Manage support teams and view their ticket assignments" />

			{/* Summary */}
			<StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
				<StatTile label="Total Teams" value={teams.length} icon={Users} />
				<StatTile label="Resolved Today" value={totalResolved} icon={TrendingUp} tone="accent" />
				<StatTile label="Open Tickets" value={totalOpen} icon={Ticket} tone="warning" />
				<StatTile label="Pending Tickets" value={totalPending} icon={Clock} />
			</StatGrid>

			{/* Split Layout: Teams Left, Tickets Right */}
			<div className="grid lg:grid-cols-[340px_1fr] gap-4">
				{/* Left: Teams List */}
				<Card className="gap-0 py-0 lg:sticky lg:top-4 lg:self-start">
					<PanelHeader label="Teams" right={<ConsoleTag>{teams.length}</ConsoleTag>} />
					<CardContent className="p-0">
						{teams.length === 0 ? (
							<EmptyState icon={Users} title="No teams yet" description="Create teams in Settings to organize your agents." />
						) : (
							<>
								<p className="px-4 py-2.5 text-xs text-muted-foreground border-b border-border">Select a team to view tickets</p>
								<div className="divide-y divide-border">
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
												className={`group relative w-full text-left p-3 transition-colors ${
													isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary/60"
												}`}>
												{isSelected && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent" />}
												<div className="flex items-center gap-3 mb-2">
													<Avatar className="size-9">
														<AvatarImage src={team.logo_url ?? undefined} className="object-cover" />
														<AvatarFallback
															className={`font-mono text-xs font-bold ${
																isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
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

												<div className="grid grid-cols-3 gap-px mb-2">
													<div
														className={`flex flex-col items-center gap-0.5 p-1.5 ${
															isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
														}`}>
														<span className={`font-mono text-xs font-bold tabular-nums ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
															{teamOpen}
														</span>
														<span className={`font-mono text-[9px] uppercase tracking-[0.08em] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Open</span>
													</div>
													<div
														className={`flex flex-col items-center gap-0.5 p-1.5 ${
															isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
														}`}>
														<span className={`font-mono text-xs font-bold tabular-nums ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
															{teamPending}
														</span>
														<span className={`font-mono text-[9px] uppercase tracking-[0.08em] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Pending</span>
													</div>
													<div
														className={`flex flex-col items-center gap-0.5 p-1.5 ${
															isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
														}`}>
														<span className={`font-mono text-xs font-bold tabular-nums ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
															{teamResolved}
														</span>
														<span className={`font-mono text-[9px] uppercase tracking-[0.08em] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
															Resolved
														</span>
													</div>
												</div>

												<Progress value={resolvePercent} className={`h-1 ${isSelected ? "[&>div]:bg-primary-foreground/90" : ""}`} />
												<span className="scan-line" />
											</button>
										);
									})}
								</div>
							</>
						)}
					</CardContent>
				</Card>

				{/* Right: Tickets with Filters */}
				{selectedTeamData && (
					<Card className="gap-0 py-0">
						<PanelHeader
							label={`${selectedTeamData.name} — Tickets`}
							right={
								<ConsoleTag>
									{filteredTickets.length} of {teamTickets.length} ticket{teamTickets.length !== 1 ? "s" : ""}
								</ConsoleTag>
							}
						/>

						{/* Filters */}
						<div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
							<div className="relative flex-1 min-w-48">
								<Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search by subject or ID..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-8 h-8 text-xs"
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
								<SelectTrigger className="w-32 h-8 text-xs">
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
								<SelectTrigger className="w-32 h-8 text-xs">
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

						<CardContent className="p-0">
							<TeamTicketsTable
								tickets={filteredTickets}
								contacts={contacts}
								companies={companies}
								onOpenTicket={(id) => navigate({ to: "/w/$slug/tickets/$id", params: { slug, id } })}
								emptyState={
									teamTickets.length === 0 ? (
										<EmptyState icon={CheckCircle2} title="No tickets assigned" description="This team has no open tickets" />
									) : (
										<EmptyState icon={Search} title="No matching tickets" description="Try adjusting your filters" />
									)
								}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
