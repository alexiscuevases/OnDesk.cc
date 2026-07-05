import { ArrowDown, ArrowUp, TrendingUp, Clock, CheckCircle2, AlertTriangle, ArrowRight, BarChart2, Inbox } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { apiGetWorkspaceAnalytics, analyticsQueryKeys } from "@/features/analytics/api/analytics-api";
import { useTickets } from "@/features/tickets/hooks/use-ticket-queries";
import { useContacts } from "@/features/contacts/hooks/use-contact-queries";
import { useCompanies } from "@/features/companies/hooks/use-company-queries";
import { TicketAiStatusBadge } from "@/shared/components/ticket-ai-status-badge";
import { StatusBadge, type TicketStatus } from "@/shared/components/status-badge";
import { PriorityBadge, type TicketPriority } from "@/shared/components/priority-badge";
import { PageHeader, StatGrid, StatTile, PanelHeader, EmptyState, ConsoleTag } from "@/shared/components/console";
import type { Contact } from "@/features/contacts/api/contacts-api";

const kpiIcons = [AlertTriangle, Clock, CheckCircle2, TrendingUp];

const tooltipStyle = {
	backgroundColor: "var(--color-popover)",
	border: "1px solid var(--color-border)",
	borderRadius: 0,
	color: "var(--color-popover-foreground)",
	fontSize: 12,
	fontFamily: "var(--font-mono)",
};

function getInitials(name: string) {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function OverviewView({ workspaceId, onOpenTicket, onViewAll }: { workspaceId: string; onOpenTicket: (id: string) => void; onViewAll: () => void }) {
	const { data: analytics } = useQuery({
		queryKey: analyticsQueryKeys.snapshot(workspaceId),
		queryFn: () => apiGetWorkspaceAnalytics(workspaceId),
	});
	const kpis = analytics?.kpis ?? [];
	const ticketVolumeData = analytics?.ticketVolume ?? [];
	const channelDistribution = analytics?.channelDistribution ?? [];

	const { data: ticketPage } = useTickets(workspaceId);
	const tickets = ticketPage?.tickets ?? [];
	const { data: contacts = [] } = useContacts(workspaceId);
	const { data: companies = [] } = useCompanies(workspaceId);

	const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c as Contact]));
	const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.logo_url]));

	const recentTickets = [...tickets].sort((a, b) => b.created_at - a.created_at).slice(0, 5);

	const hasVolumeData = ticketVolumeData.some((d) => d.open > 0 || d.resolved > 0);
	const hasChannelData = channelDistribution.some((d) => d.value > 0);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader tag="01 — Overview" title="Overview" description="Your support operations at a glance" />

			{/* KPI hairline grid */}
			<StatGrid className="sm:grid-cols-2 lg:grid-cols-4">
				{kpis.map((kpi, i) => {
					const Icon = kpiIcons[i];
					return (
						<StatTile
							key={kpi.label}
							label={kpi.label}
							value={kpi.value}
							icon={Icon}
							hint={
								<span className="flex items-center gap-1.5">
									<span className={`flex items-center gap-0.5 font-mono font-semibold ${kpi.trend === "up" ? "text-accent" : "text-warning"}`}>
										{kpi.trend === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
										{Math.abs(kpi.change)}%
									</span>
									<span className="text-muted-foreground">from last week</span>
								</span>
							}
						/>
					);
				})}
			</StatGrid>

			{/* Charts Row */}
			<div className="grid gap-4 lg:grid-cols-7">
				<Card className="lg:col-span-4 gap-0 py-0">
					<PanelHeader label="Ticket volume" right={<ConsoleTag>7 days</ConsoleTag>} />
					<CardContent className="p-4">
						{!hasVolumeData ? (
							<EmptyState icon={BarChart2} title="No ticket data yet" description="Data will appear once tickets start coming in." className="h-[280px] py-0" />
						) : (
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
										tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
										axisLine={false}
										tickLine={false}
									/>
									<YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
									<Tooltip contentStyle={tooltipStyle} />
									<Area type="monotone" dataKey="open" stroke="var(--color-chart-1)" fill="url(#fillOpen)" strokeWidth={2} />
									<Area type="monotone" dataKey="resolved" stroke="var(--color-chart-2)" fill="url(#fillResolved)" strokeWidth={2} />
								</AreaChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				<Card className="lg:col-span-3 gap-0 py-0">
					<PanelHeader label="Channel distribution" />
					<CardContent className="flex items-center justify-center p-4">
						{!hasChannelData ? (
							<EmptyState icon={BarChart2} title="No channel data yet" description="Channel breakdown will appear once tickets arrive." className="h-[240px] py-0" />
						) : (
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
											<div className="size-2" style={{ backgroundColor: ch.fill }} />
											<span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{ch.name}</span>
											<span className="font-mono text-xs font-semibold tabular-nums">{ch.value}%</span>
										</div>
									))}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Recent Tickets */}
			<Card className="gap-0 py-0">
				<PanelHeader
					label="Recent tickets"
					right={
						<button
							onClick={onViewAll}
							className="group/link flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-primary dark:text-accent hover:text-accent transition-colors">
							View all
							<ArrowRight className="size-3 group-hover/link:translate-x-0.5 transition-transform" />
						</button>
					}
				/>
				<CardContent className="p-0">
					{recentTickets.length === 0 ? (
						<EmptyState icon={Inbox} title="No tickets yet" description="Incoming support requests will show up here." />
					) : (
						<div className="divide-y divide-border">
							{recentTickets.map((ticket) => {
								const contact = ticket.contact_id ? contactMap[ticket.contact_id] : null;
								return (
									<button
										key={ticket.id}
										onClick={() => onOpenTicket(ticket.id)}
										className="group relative flex items-center justify-between gap-4 px-4 py-3 w-full text-left transition-colors hover:bg-secondary/50">
										<div className="flex items-center gap-3 min-w-0">
											<Avatar className="size-8 shrink-0">
												<AvatarImage
													src={contact?.logo_url ?? (contact?.company_id ? (companyMap[contact.company_id] ?? undefined) : undefined)}
													className="object-cover"
												/>
												<AvatarFallback className="bg-primary/10 text-primary font-mono text-[10px] font-bold">
													{contact ? getInitials(contact.name) : "?"}
												</AvatarFallback>
											</Avatar>
											<div className="min-w-0">
												<p className="text-sm font-medium truncate">{ticket.subject}</p>
												<p className="text-[11px] text-muted-foreground mt-0.5 truncate">
													<span className="font-mono text-[10px] text-primary/70 dark:text-accent/70">#{ticket.number}</span>
													<span className="mx-1">·</span>
													{contact ? contact.name : "No contact"}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2 shrink-0">
											<TicketAiStatusBadge ticket={ticket} />
											<PriorityBadge priority={ticket.priority as TicketPriority} />
											<StatusBadge status={ticket.status as TicketStatus} />
										</div>
										<span className="scan-line" />
									</button>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
