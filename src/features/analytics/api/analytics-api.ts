import { ticketVolumeData, type TicketVolumeEntry } from "@/features/overview/api/overview-api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type { TicketVolumeEntry };

export interface ResponseTimeEntry {
	hour: string;
	time: number;
}

export interface CsatEntry {
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

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const responseTimeData: ResponseTimeEntry[] = [
	{ hour: "8AM", time: 2.1 },
	{ hour: "9AM", time: 1.8 },
	{ hour: "10AM", time: 1.4 },
	{ hour: "11AM", time: 1.2 },
	{ hour: "12PM", time: 1.6 },
	{ hour: "1PM", time: 1.9 },
	{ hour: "2PM", time: 1.3 },
	{ hour: "3PM", time: 1.1 },
	{ hour: "4PM", time: 1.5 },
	{ hour: "5PM", time: 2.0 },
];

const csatTrendData: CsatEntry[] = [
	{ week: "W1", score: 4.2 },
	{ week: "W2", score: 4.4 },
	{ week: "W3", score: 4.3 },
	{ week: "W4", score: 4.6 },
	{ week: "W5", score: 4.5 },
	{ week: "W6", score: 4.7 },
	{ week: "W7", score: 4.8 },
	{ week: "W8", score: 4.7 },
];

// Team performance derived from the same static source used in the old lib/data
const _teams = [
	{ name: "Email Support", ticketCount: 42, resolvedToday: 8 },
	{ name: "Teams Support", ticketCount: 35, resolvedToday: 6 },
	{ name: "SharePoint Support", ticketCount: 28, resolvedToday: 5 },
	{ name: "Identity & Access", ticketCount: 56, resolvedToday: 12 },
	{ name: "Cloud Storage", ticketCount: 31, resolvedToday: 7 },
	{ name: "Office Apps", ticketCount: 22, resolvedToday: 4 },
	{ name: "Automation", ticketCount: 18, resolvedToday: 3 },
];

const teamPerformanceData: TeamPerformanceEntry[] = _teams.map((t) => ({
	name: t.name,
	tickets: t.ticketCount,
	resolved: t.resolvedToday * 5,
}));

const priorityBreakdown: PriorityEntry[] = [
	{ priority: "Critical", count: 24, fill: "var(--color-destructive)" },
	{ priority: "High", count: 67, fill: "var(--color-warning)" },
	{ priority: "Medium", count: 98, fill: "var(--color-chart-1)" },
	{ priority: "Low", count: 59, fill: "var(--color-chart-2)" },
];

const hourlyTicketData: HourlyEntry[] = Array.from({ length: 24 }, (_, i) => ({
	hour: `${i}:00`,
	tickets: Math.floor(Math.random() * 20 + (i >= 8 && i <= 17 ? 15 : 3)),
}));

// ─── Simulate network delay ────────────────────────────────────────────────────

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const analyticsQueryKeys = {
	ticketVolume: ["analytics", "ticketVolume"] as const,
	responseTime: ["analytics", "responseTime"] as const,
	csatTrend: ["analytics", "csatTrend"] as const,
	teamPerformance: ["analytics", "teamPerformance"] as const,
	priorityBreakdown: ["analytics", "priorityBreakdown"] as const,
	hourlyTickets: ["analytics", "hourlyTickets"] as const,
} as const;

// ─── API Functions ─────────────────────────────────────────────────────────────

export async function apiGetTicketVolumeData(): Promise<TicketVolumeEntry[]> {
	await delay();
	return [...ticketVolumeData];
}

export async function apiGetResponseTimeData(): Promise<ResponseTimeEntry[]> {
	await delay();
	return [...responseTimeData];
}

export async function apiGetCsatTrendData(): Promise<CsatEntry[]> {
	await delay();
	return [...csatTrendData];
}

export async function apiGetTeamPerformanceData(): Promise<TeamPerformanceEntry[]> {
	await delay();
	return [...teamPerformanceData];
}

export async function apiGetPriorityBreakdown(): Promise<PriorityEntry[]> {
	await delay();
	return [...priorityBreakdown];
}

export async function apiGetHourlyTicketData(): Promise<HourlyEntry[]> {
	await delay();
	return [...hourlyTicketData];
}
