import { apiGetWorkspaceAnalytics, type ChannelDistributionEntry, type KPI, type TicketVolumeEntry } from "@/features/analytics/api/analytics-api";

export type { KPI, TicketVolumeEntry, ChannelDistributionEntry };

export const overviewQueryKeys = {
	kpis: {
		all: (workspaceId: string) => ["overview", workspaceId, "kpis"] as const,
	},
	ticketVolume: (workspaceId: string) => ["overview", workspaceId, "ticketVolume"] as const,
	channelDistribution: (workspaceId: string) => ["overview", workspaceId, "channelDistribution"] as const,
} as const;

export async function apiGetKPIs(workspaceId: string): Promise<KPI[]> {
	const analytics = await apiGetWorkspaceAnalytics(workspaceId);
	return analytics.kpis;
}

export async function apiGetTicketVolumeData(workspaceId: string): Promise<TicketVolumeEntry[]> {
	const analytics = await apiGetWorkspaceAnalytics(workspaceId);
	return analytics.ticketVolume;
}

export async function apiGetChannelDistribution(workspaceId: string): Promise<ChannelDistributionEntry[]> {
	const analytics = await apiGetWorkspaceAnalytics(workspaceId);
	return analytics.channelDistribution;
}
