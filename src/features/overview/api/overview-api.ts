// ─── Types ─────────────────────────────────────────────────────────────────────

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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const kpis: KPI[] = [
	{ label: "Open Tickets", value: "248", change: -12, trend: "down" },
	{ label: "Avg. Response Time", value: "1.4h", change: -18, trend: "down" },
	{ label: "Resolution Rate", value: "94.2%", change: 3.5, trend: "up" },
	{ label: "CSAT Score", value: "4.7/5", change: 2.1, trend: "up" },
];

export const ticketVolumeData: TicketVolumeEntry[] = [
	{ date: "Mon", open: 32, resolved: 28, closed: 15 },
	{ date: "Tue", open: 45, resolved: 38, closed: 22 },
	{ date: "Wed", open: 38, resolved: 42, closed: 18 },
	{ date: "Thu", open: 52, resolved: 35, closed: 25 },
	{ date: "Fri", open: 41, resolved: 45, closed: 30 },
	{ date: "Sat", open: 18, resolved: 20, closed: 12 },
	{ date: "Sun", open: 12, resolved: 15, closed: 8 },
];

const channelDistribution: ChannelDistributionEntry[] = [
	{ name: "Email", value: 38, fill: "var(--color-chart-1)" },
	{ name: "Chat", value: 28, fill: "var(--color-chart-2)" },
	{ name: "Phone", value: 20, fill: "var(--color-chart-3)" },
	{ name: "Portal", value: 14, fill: "var(--color-chart-4)" },
];

// ─── Simulate network delay ────────────────────────────────────────────────────

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const overviewQueryKeys = {
	kpis: {
		all: ["kpis"] as const,
	},
	ticketVolume: ["analytics", "ticketVolume"] as const,
	channelDistribution: ["analytics", "channelDistribution"] as const,
} as const;

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function apiGetKPIs(): Promise<KPI[]> {
	await delay();
	return [...kpis];
}

export async function apiGetTicketVolumeData(): Promise<TicketVolumeEntry[]> {
	await delay();
	return [...ticketVolumeData];
}

export async function apiGetChannelDistribution(): Promise<ChannelDistributionEntry[]> {
	await delay();
	return [...channelDistribution];
}
