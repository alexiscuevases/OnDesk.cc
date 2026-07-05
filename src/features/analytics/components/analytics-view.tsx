import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	Legend,
} from "recharts";

import { BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, PanelHeader, EmptyState } from "@/shared/components/console";
import { useQuery } from "@tanstack/react-query";
import {
	apiGetWorkspaceAnalytics,
	analyticsQueryKeys,
} from "../api/analytics-api";

const tooltipStyle = {
	backgroundColor: "var(--color-popover)",
	border: "1px solid var(--color-border)",
	borderRadius: 0,
	color: "var(--color-popover-foreground)",
	fontSize: 12,
	fontFamily: "var(--font-mono)",
};

const axisTick = { fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" };

export function AnalyticsView({ workspaceId }: { workspaceId: string }) {
	const { data: analytics } = useQuery({
		queryKey: analyticsQueryKeys.snapshot(workspaceId),
		queryFn: () => apiGetWorkspaceAnalytics(workspaceId),
	});
	const ticketVolumeData = analytics?.ticketVolume ?? [];
	const responseTimeData = analytics?.responseTime ?? [];
	const resolutionTrendData = analytics?.resolutionTrend ?? [];
	const teamPerformanceData = analytics?.teamPerformance ?? [];
	const priorityBreakdown = analytics?.priorityBreakdown ?? [];
	const hourlyTicketData = analytics?.hourlyTickets ?? [];

	const hasTeamData = teamPerformanceData.some((d) => d.tickets > 0 || d.resolved > 0);
	const hasResponseData = responseTimeData.some((d) => d.time > 0);
	const hasResolutionData = resolutionTrendData.some((d) => d.score > 0);
	const hasHourlyData = hourlyTicketData.some((d) => d.tickets > 0);
	const hasPriorityData = priorityBreakdown.some((d) => d.count > 0);
	const hasVolumeData = ticketVolumeData.some((d) => d.open > 0 || d.resolved > 0);

	return (
		<div className="flex flex-col gap-6">
			<PageHeader tag="04 — Analytics" title="Analytics" description="In-depth metrics and performance insights" />

			<Tabs defaultValue="performance" className="w-full">
				<TabsList>
					<TabsTrigger value="performance">Performance</TabsTrigger>
					<TabsTrigger value="trends">Trends</TabsTrigger>
					<TabsTrigger value="breakdown">Breakdown</TabsTrigger>
				</TabsList>

				<TabsContent value="performance" className="mt-4">
					<div className="grid gap-4 lg:grid-cols-2">
						<Card className="gap-0 py-0">
							<PanelHeader label="Team performance" />
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground mb-4">Ticket count vs resolved by team</p>
							{!hasTeamData ? (
								<EmptyState icon={BarChart2} title="No team data yet" description="Data will appear once teams are assigned tickets." className="h-[300px] py-0" />
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={teamPerformanceData} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
										<XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} />
										<YAxis
											dataKey="name"
											type="category"
											width={110}
											tick={axisTick}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="tickets" fill="var(--color-chart-1)" name="Open" />
										<Bar dataKey="resolved" fill="var(--color-chart-2)" name="Resolved" />
									</BarChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>

						<Card className="gap-0 py-0">
							<PanelHeader label="Avg. response time" />
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground mb-4">Response time in hours throughout the day</p>
							{!hasResponseData ? (
								<EmptyState icon={BarChart2} title="No response time data yet" description="Data will appear once tickets are resolved." className="h-[300px] py-0" />
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={responseTimeData}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="hour"
											tick={axisTick}
											interval={1}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											tick={axisTick}
											domain={[0, 3]}
											tickFormatter={(v) => `${v}h`}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, "Response Time"]} />
										<Line
											type="monotone"
											dataKey="time"
											stroke="var(--color-chart-1)"
											strokeWidth={2.5}
											dot={{ fill: "var(--color-chart-1)", r: 3, strokeWidth: 0 }}
											activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--color-card)" }}
										/>
									</LineChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="trends" className="mt-4">
					<div className="grid gap-4 lg:grid-cols-2">
						<Card className="gap-0 py-0">
							<PanelHeader label="Resolution health trend" />
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground mb-4">Resolved tickets vs created tickets over the last 8 weeks</p>
							{!hasResolutionData ? (
								<EmptyState icon={BarChart2} title="No trend data yet" description="Data will appear after a few weeks of activity." className="h-[300px] py-0" />
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<AreaChart data={resolutionTrendData}>
										<defs>
											<linearGradient id="csatGrad" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.2} />
												<stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="week"
											tick={axisTick}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											domain={[0, 5]}
											tick={axisTick}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip contentStyle={tooltipStyle} />
										<Area type="monotone" dataKey="score" stroke="var(--color-chart-2)" fill="url(#csatGrad)" strokeWidth={2.5} />
									</AreaChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>

						<Card className="gap-0 py-0">
							<PanelHeader label="Hourly ticket activity" />
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground mb-4">Ticket creation distribution by hour over the last 30 days</p>
							{!hasHourlyData ? (
								<EmptyState icon={BarChart2} title="No hourly data yet" description="Activity breakdown will appear once tickets start coming in." className="h-[300px] py-0" />
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={hourlyTicketData}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="hour"
											tick={axisTick}
											interval={2}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis tick={axisTick} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="tickets" fill="var(--color-chart-1)" />
									</BarChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="breakdown" className="mt-4">
					<div className="grid gap-4 lg:grid-cols-2">
						<Card className="gap-0 py-0">
							<PanelHeader label="Priority breakdown" />
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground mb-4">Total tickets by priority level</p>
							{!hasPriorityData ? (
								<EmptyState icon={BarChart2} title="No priority data yet" description="Priority breakdown will appear once tickets are created." className="h-[300px] py-0" />
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={priorityBreakdown}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="priority"
											tick={axisTick}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis tick={axisTick} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="count">
											{priorityBreakdown.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.fill} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>

						<Card className="gap-0 py-0">
							<PanelHeader label="Weekly volume trend" />
							<CardContent className="p-4">
								<p className="text-xs text-muted-foreground mb-4">Open, resolved, and closed tickets over the last 7 days</p>
							{!hasVolumeData ? (
								<EmptyState icon={BarChart2} title="No volume data yet" description="Weekly trends will appear once tickets start coming in." className="h-[300px] py-0" />
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<AreaChart data={ticketVolumeData}>
										<defs>
											<linearGradient id="areaOpen" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
												<stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
											</linearGradient>
											<linearGradient id="areaResolved" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.2} />
												<stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
											</linearGradient>
											<linearGradient id="areaClosed" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.2} />
												<stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="date"
											tick={axisTick}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis tick={axisTick} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={tooltipStyle} />
										<Legend wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase" as const }} />
										<Area type="monotone" dataKey="open" stroke="var(--color-chart-1)" fill="url(#areaOpen)" strokeWidth={2} />
										<Area type="monotone" dataKey="resolved" stroke="var(--color-chart-2)" fill="url(#areaResolved)" strokeWidth={2} />
										<Area type="monotone" dataKey="closed" stroke="var(--color-chart-3)" fill="url(#areaClosed)" strokeWidth={2} />
									</AreaChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
