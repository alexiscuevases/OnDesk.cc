"use client";

import { ArrowDown, ArrowUp, TrendingUp, Clock, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { fetchKPIs, fetchTicketVolumeData, fetchChannelDistribution, queryKeys } from "@/lib/queries";
import { useTickets } from "@/features/tickets/hooks/use-ticket-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";
import type { Contact } from "@/features/contacts/api/contacts-api";

const kpiIcons = [AlertTriangle, Clock, CheckCircle2, TrendingUp];

const tooltipStyle = {
	backgroundColor: "var(--color-card)",
	border: "1px solid var(--color-border)",
	borderRadius: "8px",
	color: "var(--color-card-foreground)",
	fontSize: 12,
	boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function OverviewView({
	workspaceId,
	onOpenTicket,
	onViewAll,
}: {
	workspaceId: string;
	onOpenTicket: (id: string) => void;
	onViewAll: () => void;
}) {
	const { data: kpis = [] } = useQuery({ queryKey: queryKeys.kpis.all, queryFn: fetchKPIs });
	const { data: ticketVolumeData = [] } = useQuery({ queryKey: queryKeys.analytics.ticketVolume, queryFn: fetchTicketVolumeData });
	const { data: channelDistribution = [] } = useQuery({ queryKey: queryKeys.analytics.channelDistribution, queryFn: fetchChannelDistribution });

	const { data: tickets = [] } = useTickets(workspaceId);
	const { data: contacts = [] } = useContacts(workspaceId);
	const { data: companies = [] } = useCompanies(workspaceId);

	const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c as Contact]));
	const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.logo_url]));

	const recentTickets = [...tickets]
		.sort((a, b) => b.created_at - a.created_at)
		.slice(0, 5);

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-balance">Overview</h1>
				<p className="text-sm text-muted-foreground mt-1">Your support operations at a glance</p>
			</div>

			{/* KPI Cards */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{kpis.map((kpi, i) => {
					const Icon = kpiIcons[i];
					return (
						<Card key={kpi.label} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
							<div className="absolute top-0 left-0 right-0 h-1 bg-primary" style={{ opacity: 0.15 + i * 0.2 }} />
							<CardHeader className="flex flex-row items-center justify-between pb-2">
								<CardDescription className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</CardDescription>
								<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
									<Icon className="size-4 text-primary" />
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-3xl font-bold tracking-tight">{kpi.value}</div>
								<div className="flex items-center gap-1.5 text-xs mt-2">
									<span className={`flex items-center gap-0.5 font-medium ${kpi.trend === "up" ? "text-accent" : "text-accent"}`}>
										{kpi.trend === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
										{Math.abs(kpi.change)}%
									</span>
									<span className="text-muted-foreground">from last week</span>
								</div>
							</CardContent>
						</Card>
					);
				})}
			</div>

			{/* Charts Row */}
			<div className="grid gap-4 lg:grid-cols-7">
				<Card className="lg:col-span-4 border-0 shadow-sm">
					<CardHeader>
						<CardTitle className="text-sm font-semibold">Ticket Volume</CardTitle>
						<CardDescription className="text-xs">Daily ticket activity over the past week</CardDescription>
					</CardHeader>
					<CardContent>
						<ResponsiveContainer width="100%" height={280}>
							<AreaChart data={ticketVolumeData}>
								<defs>
									<linearGradient id="fillOpen" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
										<stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="fillResolved" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.2} />
										<stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
								<XAxis
									dataKey="date"
									className="text-xs"
									tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
									axisLine={false}
									tickLine={false}
								/>
								<YAxis className="text-xs" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
								<Tooltip contentStyle={tooltipStyle} />
								<Area type="monotone" dataKey="open" stroke="var(--color-chart-1)" fill="url(#fillOpen)" strokeWidth={2} />
								<Area type="monotone" dataKey="resolved" stroke="var(--color-chart-2)" fill="url(#fillResolved)" strokeWidth={2} />
							</AreaChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				<Card className="lg:col-span-3 border-0 shadow-sm">
					<CardHeader>
						<CardTitle className="text-sm font-semibold">Channel Distribution</CardTitle>
						<CardDescription className="text-xs">Tickets by support channel</CardDescription>
					</CardHeader>
					<CardContent className="flex items-center justify-center">
						<div className="flex flex-col items-center gap-4 w-full">
							<ResponsiveContainer width="100%" height={200}>
								<PieChart>
									<Pie
										data={channelDistribution}
										cx="50%"
										cy="50%"
										innerRadius={55}
										outerRadius={85}
										paddingAngle={4}
										dataKey="value"
										strokeWidth={0}>
										{channelDistribution.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.fill} />
										))}
									</Pie>
									<Tooltip contentStyle={tooltipStyle} />
								</PieChart>
							</ResponsiveContainer>
							<div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
								{channelDistribution.map((ch) => (
									<div key={ch.name} className="flex items-center gap-2">
										<div className="size-2 rounded-full" style={{ backgroundColor: ch.fill }} />
										<span className="text-xs text-muted-foreground">{ch.name}</span>
										<span className="text-xs font-semibold">{ch.value}%</span>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Recent Tickets */}
			<Card className="border-0 shadow-sm">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-sm font-semibold">Recent Tickets</CardTitle>
						<CardDescription className="text-xs">Latest support requests requiring attention</CardDescription>
					</div>
					<Button variant="ghost" size="sm" onClick={onViewAll} className="text-xs text-primary font-semibold gap-1 hover:text-primary/80">
						View All
						<ExternalLink className="size-3" />
					</Button>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{recentTickets.map((ticket) => {
							const contact = ticket.contact_id ? contactMap[ticket.contact_id] : null;
							return (
								<button
									key={ticket.id}
									onClick={() => onOpenTicket(ticket.id)}
									className="flex items-center justify-between gap-4 rounded-xl border border-transparent bg-secondary/40 p-3.5 w-full text-left transition-all hover:border-border hover:bg-secondary/80 hover:shadow-sm">
									<div className="flex items-center gap-3 min-w-0">
										<Avatar className="size-8 rounded-lg shrink-0">
											<AvatarImage src={contact?.logo_url ?? (contact?.company_id ? companyMap[contact.company_id] ?? undefined : undefined)} className="object-cover rounded-lg" />
											<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
												{contact ? getInitials(contact.name) : "?"}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0">
											<p className="text-sm font-medium truncate">{ticket.subject}</p>
											<p className="text-[11px] text-muted-foreground mt-0.5">
												{contact ? contact.name : "No contact"}
											</p>
										</div>
									</div>
									<div className="flex items-center gap-2 shrink-0">
										<Badge
											variant={ticket.priority === "urgent" ? "destructive" : ticket.priority === "high" ? "default" : "secondary"}
											className={`text-[10px] px-2 rounded-full ${ticket.priority === "high" ? "bg-warning text-warning-foreground" : ""}`}>
											{ticket.priority}
										</Badge>
										<Badge
											variant="outline"
											className={`text-[10px] px-2 rounded-full ${
												ticket.status === "open"
													? "border-chart-1 text-chart-1"
													: ticket.status === "pending"
														? "border-warning text-warning"
														: ticket.status === "resolved"
															? "border-success text-success"
															: ticket.status === "closed"
																? "border-muted-foreground text-muted-foreground"
																: ""
											}`}>
											{ticket.status}
										</Badge>
									</div>
								</button>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
