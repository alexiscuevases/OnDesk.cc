export interface KPI {
	label: string;
	value: string;
	change: number;
	trend: "up" | "down";
}

export interface TicketVolumeEntry {
	date: string;
	open: number;
	resolved: number;
	closed: number;
}

export interface ChannelDistributionEntry {
	name: string;
	value: number;
	fill: string;
}

export interface ResponseTimeEntry {
	hour: string;
	time: number;
}

export interface ResolutionTrendEntry {
	week: string;
	score: number;
}

export interface TeamPerformanceEntry {
	name: string;
	tickets: number;
	resolved: number;
}

export interface PriorityEntry {
	priority: string;
	count: number;
	fill: string;
}

export interface HourlyEntry {
	hour: string;
	tickets: number;
}

export interface WorkspaceAnalyticsSnapshot {
	kpis: KPI[];
	ticketVolume: TicketVolumeEntry[];
	channelDistribution: ChannelDistributionEntry[];
	responseTime: ResponseTimeEntry[];
	resolutionTrend: ResolutionTrendEntry[];
	teamPerformance: TeamPerformanceEntry[];
	priorityBreakdown: PriorityEntry[];
	hourlyTickets: HourlyEntry[];
}

const API_BASE = "/api/analytics";

async function fetchWorkspaceAnalytics(workspaceId: string): Promise<WorkspaceAnalyticsSnapshot> {
	const res = await fetch(`${API_BASE}?workspace_id=${workspaceId}`, { credentials: "include" });
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to fetch analytics");
	}

	const data = (await res.json()) as { analytics: WorkspaceAnalyticsSnapshot };
	return data.analytics;
}

export const apiGetWorkspaceAnalytics = fetchWorkspaceAnalytics;

export const analyticsQueryKeys = {
	snapshot: (workspaceId: string) => ["analytics", workspaceId, "snapshot"] as const,
	ticketVolume: (workspaceId: string) => ["analytics", workspaceId, "ticketVolume"] as const,
	responseTime: (workspaceId: string) => ["analytics", workspaceId, "responseTime"] as const,
	resolutionTrend: (workspaceId: string) => ["analytics", workspaceId, "resolutionTrend"] as const,
	teamPerformance: (workspaceId: string) => ["analytics", workspaceId, "teamPerformance"] as const,
	priorityBreakdown: (workspaceId: string) => ["analytics", workspaceId, "priorityBreakdown"] as const,
	hourlyTickets: (workspaceId: string) => ["analytics", workspaceId, "hourlyTickets"] as const,
} as const;

export async function apiGetTicketVolumeData(workspaceId: string): Promise<TicketVolumeEntry[]> {
	const analytics = await fetchWorkspaceAnalytics(workspaceId);
	return analytics.ticketVolume;
}

export async function apiGetResponseTimeData(workspaceId: string): Promise<ResponseTimeEntry[]> {
	const analytics = await fetchWorkspaceAnalytics(workspaceId);
	return analytics.responseTime;
}

export async function apiGetResolutionTrendData(workspaceId: string): Promise<ResolutionTrendEntry[]> {
	const analytics = await fetchWorkspaceAnalytics(workspaceId);
	return analytics.resolutionTrend;
}

export async function apiGetTeamPerformanceData(workspaceId: string): Promise<TeamPerformanceEntry[]> {
	const analytics = await fetchWorkspaceAnalytics(workspaceId);
	return analytics.teamPerformance;
}

export async function apiGetPriorityBreakdown(workspaceId: string): Promise<PriorityEntry[]> {
	const analytics = await fetchWorkspaceAnalytics(workspaceId);
	return analytics.priorityBreakdown;
}

export async function apiGetHourlyTicketData(workspaceId: string): Promise<HourlyEntry[]> {
	const analytics = await fetchWorkspaceAnalytics(workspaceId);
	return analytics.hourlyTickets;
}
