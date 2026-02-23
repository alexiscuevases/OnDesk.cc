"use client";

import { useState } from "react";
import { Users, Clock, CheckCircle2, Ticket, TrendingUp, Search, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { fetchTeams, fetchTickets, queryKeys } from "@/lib/queries";

export function TeamsView() {
	const { data: teams = [] } = useQuery({ queryKey: queryKeys.teams.all, queryFn: fetchTeams });
	const { data: tickets = [] } = useQuery({ queryKey: queryKeys.tickets.all, queryFn: () => fetchTickets() });

	const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [priorityFilter, setPriorityFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const effectiveSelectedTeam = selectedTeam ?? teams[0]?.id ?? null;
	const selectedTeamData = teams.find((t) => t.id === effectiveSelectedTeam);
	const teamTickets = selectedTeamData ? tickets.filter((t) => t.team === selectedTeamData.name) : [];

	// Apply filters
	const filteredTickets = teamTickets.filter((ticket) => {
		const matchesSearch =
			searchQuery === "" ||
			ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
			ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
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
			<div className="grid grid-cols-3 gap-3">
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
						<p className="text-xl font-bold">{teams.reduce((a, t) => a + t.resolvedToday, 0)}</p>
						<p className="text-[11px] text-muted-foreground">Resolved Today</p>
					</div>
				</div>
				<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
					<div className="flex size-10 items-center justify-center rounded-lg bg-warning/10">
						<Ticket className="size-5 text-warning" />
					</div>
					<div>
						<p className="text-xl font-bold">{teams.reduce((a, t) => a + t.ticketCount, 0)}</p>
						<p className="text-[11px] text-muted-foreground">Open Tickets</p>
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
							const resolvePercent = Math.round((team.resolvedToday / (team.ticketCount || 1)) * 100);
							const isSelected = selectedTeam === team.id;
							return (
								<button
									key={team.id}
									onClick={() => setSelectedTeam(team.id)}
									className={`w-full text-left rounded-xl p-3 transition-all ${
										isSelected ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary/40 hover:bg-secondary/80"
									}`}>
									<div className="flex items-center gap-3 mb-2">
										<Avatar className="size-9 rounded-lg">
											<AvatarFallback
												className={`rounded-lg text-xs font-bold ${
													isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary text-primary-foreground"
												}`}>
												{team.avatar}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className={`text-xs font-semibold truncate ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{team.name}
											</p>
											<p className={`text-[10px] truncate ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
												{team.lead}
											</p>
										</div>
									</div>

									<div className="grid grid-cols-3 gap-1.5 mb-2">
										<div
											className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${
												isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
											}`}>
											<span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{team.ticketCount}
											</span>
											<span className={`text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Open</span>
										</div>
										<div
											className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${
												isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
											}`}>
											<span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{team.resolvedToday}
											</span>
											<span className={`text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
												Resolved
											</span>
										</div>
										<div
											className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 ${
												isSelected ? "bg-primary-foreground/10" : "bg-secondary/60"
											}`}>
											<span className={`text-xs font-bold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
												{team.avgResponseTime}
											</span>
											<span className={`text-[9px] ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Avg</span>
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
										<SelectItem value="critical">Critical</SelectItem>
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
										<SelectItem value="in-progress">In Progress</SelectItem>
										<SelectItem value="resolved">Resolved</SelectItem>
										<SelectItem value="closed">Closed</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardHeader>
						<CardContent>
							{filteredTickets.length > 0 ? (
								<div className="space-y-2">
									{filteredTickets.map((ticket) => (
										<div
											key={ticket.id}
											className="flex items-center justify-between gap-4 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80 cursor-pointer">
											<div className="flex items-center gap-3 min-w-0 flex-1">
												<span className="text-[11px] font-mono font-semibold text-primary/70 shrink-0">{ticket.id}</span>
												<div className="min-w-0 flex-1">
													<p className="text-sm font-medium truncate">{ticket.subject}</p>
													<div className="flex items-center gap-2 mt-1">
														<Avatar className="size-5 rounded-lg">
															<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
																{ticket.assignee
																	.split(" ")
																	.map((w) => w[0])
																	.join("")
																	.slice(0, 2)}
															</AvatarFallback>
														</Avatar>
														<p className="text-[11px] text-muted-foreground truncate">{ticket.assignee}</p>
													</div>
												</div>
											</div>
											<div className="flex items-center gap-2 shrink-0">
												<Badge
													variant={
														ticket.priority === "critical" ? "destructive" : ticket.priority === "high" ? "default" : "secondary"
													}
													className={`text-[10px] rounded-full px-2 ${
														ticket.priority === "high" ? "bg-warning text-warning-foreground" : ""
													}`}>
													{ticket.priority}
												</Badge>
												<Badge variant="outline" className="text-[10px] rounded-full px-2">
													{ticket.status}
												</Badge>
											</div>
										</div>
									))}
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
