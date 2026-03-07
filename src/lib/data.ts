// Mock data for the OnDesk.cc dashboard

export type TicketStatus = "open" | "in-progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";

export interface Ticket {
	id: string;
	subject: string;
	description: string;
	status: TicketStatus;
	priority: TicketPriority;
	assignee: string;
	requester: string;
	team: string;
	createdAt: string;
	updatedAt: string;
	channel: string;
}

export interface Team {
	id: string;
	name: string;
	description: string;
	lead: string;
	members: string[];
	ticketCount: number;
	resolvedToday: number;
	avgResponseTime: string;
	avatar: string;
	image?: string;
}

export interface Agent {
	id: string;
	name: string;
	email: string;
	role: string;
	status: "online" | "away" | "offline";
	invitationStatus: "accepted" | "pending";
	invitationSentAt: string;
	initials: string;
	tickets: number;
}

export interface OutlookAccount {
	id: string;
	email: string;
	syncStatus: "syncing" | "synced" | "error";
	lastSync: string;
	connected: boolean;
}

export interface Company {
	id: string;
	name: string;
	description: string;
	image: string;
	userCount: number;
	createdAt: string;
}

export interface Customer {
	id: string;
	name: string;
	email: string;
	companyId?: string;
	companyName?: string;
	createdAt: string;
	lastActivity: string;
}

export interface KPI {
	label: string;
	value: string;
	change: number;
	trend: "up" | "down";
}

export const kpis: KPI[] = [
	{ label: "Open Tickets", value: "248", change: -12, trend: "down" },
	{ label: "Avg. Response Time", value: "1.4h", change: -18, trend: "down" },
	{ label: "Resolution Rate", value: "94.2%", change: 3.5, trend: "up" },
	{ label: "CSAT Score", value: "4.7/5", change: 2.1, trend: "up" },
];

export const tickets: Ticket[] = [
	{
		id: "TK-1024",
		subject: "Outlook integration not syncing emails",
		description: "Customer reports that their Outlook 365 integration has stopped syncing since the latest update.",
		status: "open",
		priority: "high",
		assignee: "Carlos Mendez",
		requester: "john.smith@contoso.com",
		team: "Email Support",
		createdAt: "2026-02-21T09:30:00Z",
		updatedAt: "2026-02-21T10:15:00Z",
		channel: "Email",
	},
	{
		id: "TK-1023",
		subject: "Teams meeting recording unavailable",
		description: "Meeting recordings from yesterday are showing as unavailable in Teams.",
		status: "in-progress",
		priority: "medium",
		assignee: "Ana Torres",
		requester: "sarah.jones@fabrikam.com",
		team: "Teams Support",
		createdAt: "2026-02-21T08:45:00Z",
		updatedAt: "2026-02-21T11:00:00Z",
		channel: "Chat",
	},
	{
		id: "TK-1022",
		subject: "SharePoint permissions error on shared folder",
		description: "Users unable to access shared folder despite having correct permissions assigned.",
		status: "open",
		priority: "critical",
		assignee: "Miguel Reyes",
		requester: "alex.brown@woodgrove.com",
		team: "SharePoint Support",
		createdAt: "2026-02-20T16:20:00Z",
		updatedAt: "2026-02-21T08:00:00Z",
		channel: "Phone",
	},
	{
		id: "TK-1021",
		subject: "OneDrive sync conflict on multiple devices",
		description: "Files showing sync conflicts when edited from different devices simultaneously.",
		status: "in-progress",
		priority: "medium",
		assignee: "Laura Diaz",
		requester: "mike.wilson@adatum.com",
		team: "Cloud Storage",
		createdAt: "2026-02-20T14:10:00Z",
		updatedAt: "2026-02-21T09:30:00Z",
		channel: "Email",
	},
	{
		id: "TK-1020",
		subject: "Excel Online formula calculation delay",
		description: "Large spreadsheets taking too long to calculate formulas in the browser.",
		status: "resolved",
		priority: "low",
		assignee: "Carlos Mendez",
		requester: "emma.davis@northwind.com",
		team: "Office Apps",
		createdAt: "2026-02-19T11:00:00Z",
		updatedAt: "2026-02-21T07:45:00Z",
		channel: "Chat",
	},
	{
		id: "TK-1019",
		subject: "Azure AD SSO login failure",
		description: "Users experiencing SSO login failures when accessing Microsoft 365 services.",
		status: "open",
		priority: "critical",
		assignee: "Ana Torres",
		requester: "robert.lee@litware.com",
		team: "Identity & Access",
		createdAt: "2026-02-21T07:00:00Z",
		updatedAt: "2026-02-21T10:30:00Z",
		channel: "Phone",
	},
	{
		id: "TK-1018",
		subject: "Power Automate flow triggering incorrectly",
		description: "Automated flows are triggering on wrong conditions after recent update.",
		status: "in-progress",
		priority: "high",
		assignee: "Miguel Reyes",
		requester: "lisa.chen@proseware.com",
		team: "Automation",
		createdAt: "2026-02-20T13:00:00Z",
		updatedAt: "2026-02-21T08:15:00Z",
		channel: "Email",
	},
	{
		id: "TK-1017",
		subject: "Planner task assignments not reflecting in Teams",
		description: "Task assignments made in Planner are not showing in the Teams Planner tab.",
		status: "closed",
		priority: "low",
		assignee: "Laura Diaz",
		requester: "david.wang@treyresearch.com",
		team: "Teams Support",
		createdAt: "2026-02-18T10:30:00Z",
		updatedAt: "2026-02-20T15:00:00Z",
		channel: "Chat",
	},
	{
		id: "TK-1016",
		subject: "Microsoft Defender alert: Suspicious sign-in activity",
		description: "Multiple sign-in attempts from unusual locations flagged by Defender.",
		status: "open",
		priority: "critical",
		assignee: "Carlos Mendez",
		requester: "security@blueyonder.com",
		team: "Identity & Access",
		createdAt: "2026-02-21T06:00:00Z",
		updatedAt: "2026-02-21T06:30:00Z",
		channel: "Alert",
	},
	{
		id: "TK-1015",
		subject: "Word document co-authoring conflict",
		description: "Two users editing same Word document online causes merge conflicts.",
		status: "resolved",
		priority: "medium",
		assignee: "Ana Torres",
		requester: "jennifer.martinez@wingtip.com",
		team: "Office Apps",
		createdAt: "2026-02-19T09:15:00Z",
		updatedAt: "2026-02-20T16:45:00Z",
		channel: "Email",
	},
];

export const teams: Team[] = [
	{
		id: "team-1",
		name: "Email Support",
		description: "Handles all email-related issues including Outlook sync, SMTP, and Exchange",
		lead: "Carlos Mendez",
		members: ["Carlos Mendez", "Sofia Vargas", "Pedro Ruiz", "Elena Castro"],
		ticketCount: 42,
		resolvedToday: 8,
		avgResponseTime: "1.2h",
		avatar: "ES",
	},
	{
		id: "team-2",
		name: "Teams Support",
		description: "Microsoft Teams meetings, calls, chat, and collaboration issues",
		lead: "Ana Torres",
		members: ["Ana Torres", "Diego Morales", "Isabel Herrera"],
		ticketCount: 35,
		resolvedToday: 6,
		avgResponseTime: "0.9h",
		avatar: "TS",
	},
	{
		id: "team-3",
		name: "SharePoint Support",
		description: "SharePoint permissions, document libraries, and site management",
		lead: "Miguel Reyes",
		members: ["Miguel Reyes", "Carmen Lopez", "Andres Gutierrez", "Patricia Flores", "Ricardo Navarro"],
		ticketCount: 28,
		resolvedToday: 5,
		avgResponseTime: "1.8h",
		avatar: "SP",
	},
	{
		id: "team-4",
		name: "Identity & Access",
		description: "Azure AD, SSO, MFA, and user authentication issues",
		lead: "Laura Diaz",
		members: ["Laura Diaz", "Fernando Silva", "Mariana Rojas"],
		ticketCount: 56,
		resolvedToday: 12,
		avgResponseTime: "0.6h",
		avatar: "IA",
	},
	{
		id: "team-5",
		name: "Cloud Storage",
		description: "OneDrive sync, file sharing, and storage quota management",
		lead: "Roberto Perez",
		members: ["Roberto Perez", "Valentina Cruz", "Gabriel Ramos", "Lucia Martinez"],
		ticketCount: 31,
		resolvedToday: 7,
		avgResponseTime: "1.5h",
		avatar: "CS",
	},
	{
		id: "team-6",
		name: "Office Apps",
		description: "Word, Excel, PowerPoint, and Office Online application support",
		lead: "Sofia Vargas",
		members: ["Sofia Vargas", "Manuel Ortiz", "Andrea Jimenez"],
		ticketCount: 22,
		resolvedToday: 4,
		avgResponseTime: "2.1h",
		avatar: "OA",
	},
	{
		id: "team-7",
		name: "Automation",
		description: "Power Automate flows, Power Apps, and workflow automation",
		lead: "Diego Morales",
		members: ["Diego Morales", "Camila Sanchez", "Javier Mendoza", "Rosa Alvarez"],
		ticketCount: 18,
		resolvedToday: 3,
		avgResponseTime: "2.4h",
		avatar: "AU",
	},
];

export const ticketVolumeData = [
	{ date: "Mon", open: 32, resolved: 28, closed: 15 },
	{ date: "Tue", open: 45, resolved: 38, closed: 22 },
	{ date: "Wed", open: 38, resolved: 42, closed: 18 },
	{ date: "Thu", open: 52, resolved: 35, closed: 25 },
	{ date: "Fri", open: 41, resolved: 45, closed: 30 },
	{ date: "Sat", open: 18, resolved: 20, closed: 12 },
	{ date: "Sun", open: 12, resolved: 15, closed: 8 },
];

export const channelDistribution = [
	{ name: "Email", value: 38, fill: "var(--color-chart-1)" },
	{ name: "Chat", value: 28, fill: "var(--color-chart-2)" },
	{ name: "Phone", value: 20, fill: "var(--color-chart-3)" },
	{ name: "Portal", value: 14, fill: "var(--color-chart-4)" },
];

export const responseTimeData = [
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

export const csatTrendData = [
	{ week: "W1", score: 4.2 },
	{ week: "W2", score: 4.4 },
	{ week: "W3", score: 4.3 },
	{ week: "W4", score: 4.6 },
	{ week: "W5", score: 4.5 },
	{ week: "W6", score: 4.7 },
	{ week: "W7", score: 4.8 },
	{ week: "W8", score: 4.7 },
];

export const teamPerformanceData = teams.map((t) => ({
	name: t.name,
	tickets: t.ticketCount,
	resolved: t.resolvedToday * 5,
}));

export const priorityBreakdown = [
	{ priority: "Critical", count: 24, fill: "var(--color-destructive)" },
	{ priority: "High", count: 67, fill: "var(--color-warning)" },
	{ priority: "Medium", count: 98, fill: "var(--color-chart-1)" },
	{ priority: "Low", count: 59, fill: "var(--color-chart-2)" },
];

export const hourlyTicketData = Array.from({ length: 24 }, (_, i) => ({
	hour: `${i}:00`,
	tickets: Math.floor(Math.random() * 20 + (i >= 8 && i <= 17 ? 15 : 3)),
}));

// Ticket conversation / activity data
export interface TicketMessage {
	id: string;
	ticketId: string;
	author: string;
	authorRole: "agent" | "customer" | "system";
	authorInitials: string;
	content: string;
	timestamp: string;
	isInternal: boolean;
}

export const ticketMessages: TicketMessage[] = [
	{
		id: "msg-1",
		ticketId: "TK-1024",
		author: "john.smith@contoso.com",
		authorRole: "customer",
		authorInitials: "JS",
		content:
			"Hi, since the latest update my Outlook 365 integration has stopped syncing emails. I've tried restarting and re-authenticating but nothing works. This is urgent as I'm missing client communications.",
		timestamp: "2026-02-21T09:30:00Z",
		isInternal: false,
	},
	{
		id: "msg-2",
		ticketId: "TK-1024",
		author: "Carlos Mendez",
		authorRole: "agent",
		authorInitials: "CM",
		content:
			"Hello John, thank you for reaching out. I understand how critical email sync is for your daily operations. Let me check the sync logs for your account right away. Could you tell me which version of Outlook you're running and whether this affects all folders or just specific ones?",
		timestamp: "2026-02-21T09:45:00Z",
		isInternal: false,
	},
	{
		id: "msg-3",
		ticketId: "TK-1024",
		author: "Carlos Mendez",
		authorRole: "agent",
		authorInitials: "CM",
		content:
			"Internal note: Checked the sync logs - seeing OAuth token refresh failures since the 2.4.1 update. This may be related to the known Graph API issue MSFT-8842. Escalating to L2 if customer confirms scope.",
		timestamp: "2026-02-21T10:00:00Z",
		isInternal: true,
	},
	{
		id: "msg-4",
		ticketId: "TK-1024",
		author: "john.smith@contoso.com",
		authorRole: "customer",
		authorInitials: "JS",
		content:
			"I'm running Outlook version 16.84 on macOS. It seems to affect all folders - Inbox, Sent, and Archive. I noticed the sync icon just spins indefinitely.",
		timestamp: "2026-02-21T10:15:00Z",
		isInternal: false,
	},
	{
		id: "msg-5",
		ticketId: "TK-1022",
		author: "alex.brown@woodgrove.com",
		authorRole: "customer",
		authorInitials: "AB",
		content:
			"Our team can't access the shared project folder anymore. We get a 403 error even though our permissions haven't changed. This is blocking our entire department.",
		timestamp: "2026-02-20T16:20:00Z",
		isInternal: false,
	},
	{
		id: "msg-6",
		ticketId: "TK-1022",
		author: "Miguel Reyes",
		authorRole: "agent",
		authorInitials: "MR",
		content:
			"Hi Alex, I'm looking into this immediately given the impact. Can you confirm the exact SharePoint site URL and the folder path? Also, were any permission changes made by your SharePoint admin recently?",
		timestamp: "2026-02-20T17:00:00Z",
		isInternal: false,
	},
	{
		id: "msg-7",
		ticketId: "TK-1023",
		author: "sarah.jones@fabrikam.com",
		authorRole: "customer",
		authorInitials: "SJ",
		content:
			"The recordings from yesterday's all-hands meeting and two client calls are showing as 'unavailable' in Teams. We need these for compliance purposes.",
		timestamp: "2026-02-21T08:45:00Z",
		isInternal: false,
	},
	{
		id: "msg-8",
		ticketId: "TK-1023",
		author: "Ana Torres",
		authorRole: "agent",
		authorInitials: "AT",
		content:
			"Hi Sarah, I understand the urgency especially for compliance. I've checked the recording service status and there was a brief outage in the recording pipeline yesterday between 2-4 PM EST. The recordings should be processing now. I'll monitor and update you within the hour.",
		timestamp: "2026-02-21T09:15:00Z",
		isInternal: false,
	},
];

export function getTicketMessages(ticketId: string): TicketMessage[] {
	return ticketMessages.filter((m) => m.ticketId === ticketId);
}

// Agents with invitation status
export const agents: Agent[] = [
	{
		id: "a1",
		name: "Carlos Mendez",
		email: "carlos@supportdesk.com",
		role: "Admin",
		status: "online",
		invitationStatus: "accepted",
		invitationSentAt: "2026-01-15T10:00:00Z",
		initials: "CM",
		tickets: 18,
	},
	{
		id: "a2",
		name: "Ana Torres",
		email: "ana@supportdesk.com",
		role: "Senior Agent",
		status: "online",
		invitationStatus: "accepted",
		invitationSentAt: "2026-01-20T14:30:00Z",
		initials: "AT",
		tickets: 12,
	},
	{
		id: "a3",
		name: "Miguel Reyes",
		email: "miguel@supportdesk.com",
		role: "Agent",
		status: "away",
		invitationStatus: "accepted",
		invitationSentAt: "2026-01-25T09:15:00Z",
		initials: "MR",
		tickets: 9,
	},
	{
		id: "a4",
		name: "Laura Diaz",
		email: "laura@supportdesk.com",
		role: "Agent",
		status: "offline",
		invitationStatus: "pending",
		invitationSentAt: "2026-02-18T16:45:00Z",
		initials: "LD",
		tickets: 15,
	},
	{
		id: "a5",
		name: "Sofia Vargas",
		email: "sofia@supportdesk.com",
		role: "Agent",
		status: "online",
		invitationStatus: "accepted",
		invitationSentAt: "2026-02-01T11:20:00Z",
		initials: "SV",
		tickets: 7,
	},
	{
		id: "a6",
		name: "Diego Morales",
		email: "diego@supportdesk.com",
		role: "Agent",
		status: "online",
		invitationStatus: "pending",
		invitationSentAt: "2026-02-20T13:00:00Z",
		initials: "DM",
		tickets: 11,
	},
];

// Microsoft Outlook integration accounts
export const outlookAccounts: OutlookAccount[] = [
	{ id: "ol1", email: "support@supportdesk.com", syncStatus: "synced", lastSync: "2026-02-21T11:45:00Z", connected: true },
	{ id: "ol2", email: "billing@supportdesk.com", syncStatus: "synced", lastSync: "2026-02-21T11:30:00Z", connected: true },
	{ id: "ol3", email: "notifications@supportdesk.com", syncStatus: "syncing", lastSync: "2026-02-21T11:35:00Z", connected: true },
];

// Companies
export const companies: Company[] = [
	{
		id: "c1",
		name: "Contoso Inc.",
		description: "Leading digital transformation consulting firm",
		image: "CI",
		userCount: 24,
		createdAt: "2025-06-10T08:00:00Z",
	},
	{ id: "c2", name: "Fabrikam Ltd.", description: "Enterprise software development company", image: "FL", userCount: 18, createdAt: "2025-07-15T10:30:00Z" },
	{ id: "c3", name: "Northwind Traders", description: "International import/export business", image: "NT", userCount: 15, createdAt: "2025-08-20T14:45:00Z" },
	{ id: "c4", name: "Woodgrove Bank", description: "Financial services provider", image: "WB", userCount: 32, createdAt: "2025-09-05T09:15:00Z" },
	{ id: "c5", name: "Litware Inc.", description: "IT infrastructure solutions", image: "LI", userCount: 21, createdAt: "2025-10-12T16:20:00Z" },
];

// Customer users
export const customers: Customer[] = [
	{
		id: "u1",
		name: "John Smith",
		email: "john.smith@contoso.com",
		companyId: "c1",
		companyName: "Contoso Inc.",
		createdAt: "2025-06-15T08:00:00Z",
		lastActivity: "2026-02-21T10:30:00Z",
	},
	{
		id: "u2",
		name: "Emma Davis",
		email: "emma.davis@northwind.com",
		companyId: "c3",
		companyName: "Northwind Traders",
		createdAt: "2025-08-22T10:00:00Z",
		lastActivity: "2026-02-20T15:45:00Z",
	},
	{
		id: "u3",
		name: "Sarah Jones",
		email: "sarah.jones@fabrikam.com",
		companyId: "c2",
		companyName: "Fabrikam Ltd.",
		createdAt: "2025-07-18T11:30:00Z",
		lastActivity: "2026-02-21T09:15:00Z",
	},
	{
		id: "u4",
		name: "Robert Lee",
		email: "robert.lee@litware.com",
		companyId: "c5",
		companyName: "Litware Inc.",
		createdAt: "2025-10-14T14:00:00Z",
		lastActivity: "2026-02-21T08:00:00Z",
	},
	{
		id: "u5",
		name: "Alex Brown",
		email: "alex.brown@woodgrove.com",
		companyId: "c4",
		companyName: "Woodgrove Bank",
		createdAt: "2025-09-08T13:15:00Z",
		lastActivity: "2026-02-21T11:20:00Z",
	},
	{ id: "u6", name: "Mike Wilson", email: "mike.wilson@adatum.com", createdAt: "2026-01-10T09:30:00Z", lastActivity: "2026-02-21T10:50:00Z" },
	{ id: "u7", name: "Lisa Chen", email: "lisa.chen@proseware.com", createdAt: "2026-01-25T14:20:00Z", lastActivity: "2026-02-20T16:10:00Z" },
	{ id: "u8", name: "David Wang", email: "david.wang@treyresearch.com", createdAt: "2026-02-05T11:45:00Z", lastActivity: "2026-02-21T09:30:00Z" },
];
