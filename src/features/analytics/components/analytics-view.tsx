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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
	apiGetWorkspaceAnalytics,
	analyticsQueryKeys,
} from "../api/analytics-api";

const tooltipStyle = {
	backgroundColor: "var(--color-card)",
	border: "1px solid var(--color-border)",
	borderRadius: "8px",
	color: "var(--color-card-foreground)",
	fontSize: 12,
	boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

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
			<div>
				<h1 className="text-2xl font-bold tracking-tight text-balance">Analytics</h1>
				<p className="text-sm text-muted-foreground mt-1">In-depth metrics and performance insights</p>
			</div>

			<Tabs defaultValue="performance" className="w-full">
				<TabsList className="bg-secondary/60 rounded-xl p-1 h-auto">
					<TabsTrigger value="performance" className="rounded-lg text-xs data-[state=active]:shadow-sm">
						Performance
					</TabsTrigger>
					<TabsTrigger value="trends" className="rounded-lg text-xs data-[state=active]:shadow-sm">
						Trends
					</TabsTrigger>
					<TabsTrigger value="breakdown" className="rounded-lg text-xs data-[state=active]:shadow-sm">
						Breakdown
					</TabsTrigger>
				</TabsList>

				<TabsContent value="performance" className="mt-4">
					<div className="grid gap-4 lg:grid-cols-2">
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Team Performance</CardTitle>
								<CardDescription className="text-xs">Ticket count vs resolved by team</CardDescription>
							</CardHeader>
							<CardContent>
							{!hasTeamData ? (
								<div className="flex flex-col items-center justify-center h-[300px] text-center">
									<div className="flex size-10 items-center justify-center rounded-xl bg-secondary mb-3">
										<BarChart2 className="size-5 text-muted-foreground" />
									</div>
									<p className="text-sm font-medium">No team data yet</p>
									<p className="text-[11px] text-muted-foreground mt-1">Data will appear once teams are assigned tickets.</p>
								</div>
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={teamPerformanceData} layout="vertical">
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
										<XAxis type="number" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
										<YAxis
											dataKey="name"
											type="category"
											width={110}
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
											axisLine={false}
											tickLine={false}
										/>
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="tickets" fill="var(--color-chart-1)" radius={[0, 6, 6, 0]} name="Open" />
										<Bar dataKey="resolved" fill="var(--color-chart-2)" radius={[0, 6, 6, 0]} name="Resolved" />
									</BarChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>

						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Avg. Response Time</CardTitle>
								<CardDescription className="text-xs">Response time in hours throughout the day</CardDescription>
							</CardHeader>
							<CardContent>
							{!hasResponseData ? (
								<div className="flex flex-col items-center justify-center h-[300px] text-center">
									<div className="flex size-10 items-center justify-center rounded-xl bg-secondary mb-3">
										<BarChart2 className="size-5 text-muted-foreground" />
									</div>
									<p className="text-sm font-medium">No response time data yet</p>
									<p className="text-[11px] text-muted-foreground mt-1">Data will appear once tickets are resolved.</p>
								</div>
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<LineChart data={responseTimeData}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="hour"
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
											interval={1}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
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
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Resolution Health Trend</CardTitle>
								<CardDescription className="text-xs">Resolved tickets vs created tickets over the last 8 weeks</CardDescription>
							</CardHeader>
							<CardContent>
							{!hasResolutionData ? (
								<div className="flex flex-col items-center justify-center h-[300px] text-center">
									<div className="flex size-10 items-center justify-center rounded-xl bg-secondary mb-3">
										<BarChart2 className="size-5 text-muted-foreground" />
									</div>
									<p className="text-sm font-medium">No trend data yet</p>
									<p className="text-[11px] text-muted-foreground mt-1">Data will appear after a few weeks of activity.</p>
								</div>
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
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis
											domain={[0, 5]}
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
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

						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Hourly Ticket Activity</CardTitle>
								<CardDescription className="text-xs">Ticket creation distribution by hour over the last 30 days</CardDescription>
							</CardHeader>
							<CardContent>
							{!hasHourlyData ? (
								<div className="flex flex-col items-center justify-center h-[300px] text-center">
									<div className="flex size-10 items-center justify-center rounded-xl bg-secondary mb-3">
										<BarChart2 className="size-5 text-muted-foreground" />
									</div>
									<p className="text-sm font-medium">No hourly data yet</p>
									<p className="text-[11px] text-muted-foreground mt-1">Activity breakdown will appear once tickets start coming in.</p>
								</div>
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={hourlyTicketData}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="hour"
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
											interval={2}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="tickets" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
									</BarChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="breakdown" className="mt-4">
					<div className="grid gap-4 lg:grid-cols-2">
						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Priority Breakdown</CardTitle>
								<CardDescription className="text-xs">Total tickets by priority level</CardDescription>
							</CardHeader>
							<CardContent>
							{!hasPriorityData ? (
								<div className="flex flex-col items-center justify-center h-[300px] text-center">
									<div className="flex size-10 items-center justify-center rounded-xl bg-secondary mb-3">
										<BarChart2 className="size-5 text-muted-foreground" />
									</div>
									<p className="text-sm font-medium">No priority data yet</p>
									<p className="text-[11px] text-muted-foreground mt-1">Priority breakdown will appear once tickets are created.</p>
								</div>
							) : (
								<ResponsiveContainer width="100%" height={300}>
									<BarChart data={priorityBreakdown}>
										<CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
										<XAxis
											dataKey="priority"
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={tooltipStyle} />
										<Bar dataKey="count" radius={[6, 6, 0, 0]}>
											{priorityBreakdown.map((entry, index) => (
												<Cell key={`cell-${index}`} fill={entry.fill} />
											))}
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							)}
							</CardContent>
						</Card>

						<Card className="border-0 shadow-sm">
							<CardHeader>
								<CardTitle className="text-sm font-semibold">Weekly Volume Trend</CardTitle>
								<CardDescription className="text-xs">Open, resolved, and closed tickets over the last 7 days</CardDescription>
							</CardHeader>
							<CardContent>
							{!hasVolumeData ? (
								<div className="flex flex-col items-center justify-center h-[300px] text-center">
									<div className="flex size-10 items-center justify-center rounded-xl bg-secondary mb-3">
										<BarChart2 className="size-5 text-muted-foreground" />
									</div>
									<p className="text-sm font-medium">No volume data yet</p>
									<p className="text-[11px] text-muted-foreground mt-1">Weekly trends will appear once tickets start coming in.</p>
								</div>
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
											tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
											axisLine={false}
											tickLine={false}
										/>
										<YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
										<Tooltip contentStyle={tooltipStyle} />
										<Legend wrapperStyle={{ fontSize: 11 }} />
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
