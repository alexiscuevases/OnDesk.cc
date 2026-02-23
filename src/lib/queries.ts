import {
	tickets,
	teams,
	agents,
	customers,
	companies,
	kpis,
	ticketMessages,
	outlookAccounts,
	ticketVolumeData,
	channelDistribution,
	responseTimeData,
	csatTrendData,
	teamPerformanceData,
	priorityBreakdown,
	hourlyTicketData,
	type Ticket,
	type TicketStatus,
	type TicketPriority,
} from "./data";

// Simula un delay de red para imitar una API real
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const queryKeys = {
	tickets: {
		all: ["tickets"] as const,
		list: (filters?: TicketFilters) => ["tickets", "list", filters] as const,
		detail: (id: string) => ["tickets", "detail", id] as const,
		messages: (id: string) => ["tickets", "messages", id] as const,
	},
	teams: {
		all: ["teams"] as const,
	},
	agents: {
		all: ["agents"] as const,
	},
	customers: {
		all: ["customers"] as const,
	},
	companies: {
		all: ["companies"] as const,
	},
	kpis: {
		all: ["kpis"] as const,
	},
	outlookAccounts: {
		all: ["outlookAccounts"] as const,
	},
	analytics: {
		ticketVolume: ["analytics", "ticketVolume"] as const,
		channelDistribution: ["analytics", "channelDistribution"] as const,
		responseTime: ["analytics", "responseTime"] as const,
		csatTrend: ["analytics", "csatTrend"] as const,
		teamPerformance: ["analytics", "teamPerformance"] as const,
		priorityBreakdown: ["analytics", "priorityBreakdown"] as const,
		hourlyTickets: ["analytics", "hourlyTickets"] as const,
	},
} as const;

// ─── Tipos de filtros ───────────────────────────────────────────────────────────

export interface TicketFilters {
	status?: TicketStatus | "all";
	priority?: TicketPriority | "all";
	search?: string;
}

// ─── Query Functions — Tickets ─────────────────────────────────────────────────

export async function fetchTickets(filters?: TicketFilters): Promise<Ticket[]> {
	await delay();
	let result = [...tickets];

	if (filters?.status && filters.status !== "all") {
		result = result.filter((t) => t.status === filters.status);
	}
	if (filters?.priority && filters.priority !== "all") {
		result = result.filter((t) => t.priority === filters.priority);
	}
	if (filters?.search) {
		const q = filters.search.toLowerCase();
		result = result.filter(
			(t) =>
				t.subject.toLowerCase().includes(q) ||
				t.id.toLowerCase().includes(q) ||
				t.requester.toLowerCase().includes(q),
		);
	}

	return result;
}

export async function fetchTicketById(id: string): Promise<Ticket | undefined> {
	await delay();
	return tickets.find((t) => t.id === id);
}

export async function fetchTicketMessages(ticketId: string) {
	await delay();
	return ticketMessages.filter((m) => m.ticketId === ticketId);
}

// ─── Query Functions — Entidades ───────────────────────────────────────────────

export async function fetchTeams() {
	await delay();
	return [...teams];
}

export async function fetchAgents() {
	await delay();
	return [...agents];
}

export async function fetchCustomers() {
	await delay();
	return [...customers];
}

export async function fetchCompanies() {
	await delay();
	return [...companies];
}

export async function fetchKPIs() {
	await delay();
	return [...kpis];
}

export async function fetchOutlookAccounts() {
	await delay();
	return [...outlookAccounts];
}

// ─── Query Functions — Analytics ───────────────────────────────────────────────

export async function fetchTicketVolumeData() {
	await delay();
	return [...ticketVolumeData];
}

export async function fetchChannelDistribution() {
	await delay();
	return [...channelDistribution];
}

export async function fetchResponseTimeData() {
	await delay();
	return [...responseTimeData];
}

export async function fetchCsatTrendData() {
	await delay();
	return [...csatTrendData];
}

export async function fetchTeamPerformanceData() {
	await delay();
	return [...teamPerformanceData];
}

export async function fetchPriorityBreakdown() {
	await delay();
	return [...priorityBreakdown];
}

export async function fetchHourlyTicketData() {
	await delay();
	return [...hourlyTicketData];
}
