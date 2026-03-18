const CHANNEL_COLORS = [
	"var(--color-chart-1)",
	"var(--color-chart-2)",
	"var(--color-chart-3)",
	"var(--color-chart-4)",
	"var(--color-chart-5)",
];

const PRIORITY_COLORS: Record<string, string> = {
	urgent: "var(--color-destructive)",
	high: "var(--color-warning)",
	medium: "var(--color-chart-1)",
	low: "var(--color-chart-2)",
};

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" });

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

function startOfUtcDay(timestampSeconds: number): number {
	const date = new Date(timestampSeconds * 1000);
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000;
}

function formatHourLabel(hour24: number): string {
	const suffix = hour24 >= 12 ? "PM" : "AM";
	const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
	return `${hour12}${suffix}`;
}

function formatHourClock(hour24: number): string {
	return `${hour24.toString().padStart(2, "0")}:00`;
}

function round(value: number, digits = 1): number {
	const factor = 10 ** digits;
	return Math.round(value * factor) / factor;
}

function percentageChange(current: number, previous: number): number {
	if (previous === 0) {
		return current === 0 ? 0 : 100;
	}
	return round(((current - previous) / previous) * 100, 1);
}

function formatDurationHours(hours: number): string {
	if (!Number.isFinite(hours) || hours <= 0) return "0m";
	if (hours < 1) return `${Math.round(hours * 60)}m`;
	return `${round(hours, 1)}h`;
}

function formatPercentage(value: number): string {
	return `${round(value, 1)}%`;
}

function buildLastSevenDays(nowSeconds: number) {
	const todayStart = startOfUtcDay(nowSeconds);
	return Array.from({ length: 7 }, (_, index) => {
		const dayStart = todayStart - (6 - index) * 86400;
		const dayKey = new Date(dayStart * 1000).toISOString().slice(0, 10);
		return {
			dayKey,
			label: WEEKDAY_FORMATTER.format(new Date(dayStart * 1000)),
		};
	});
}

function buildLastEightWeeks(nowSeconds: number) {
	const currentWeekStart = startOfUtcDay(nowSeconds) - new Date(nowSeconds * 1000).getUTCDay() * 86400;
	return Array.from({ length: 8 }, (_, index) => {
		const weekStart = currentWeekStart - (7 - index) * 7 * 86400;
		return {
			label: `W${index + 1}`,
			weekStart,
		};
	});
}

interface AggregateRow {
	count: number;
}

interface ResponseAggregateRow {
	avg_hours: number | null;
}

interface TicketVolumeRow {
	day: string;
	open: number;
	resolved: number;
	closed: number;
}

interface ChannelRow {
	channel: string | null;
	count: number;
}

interface ResponseTimeRow {
	hour_of_day: number;
	avg_hours: number | null;
}

interface WeeklyResolutionRow {
	week_start: number;
	created_count: number;
	resolved_count: number;
}

interface TeamPerformanceRow {
	name: string | null;
	tickets: number;
	resolved: number;
}

interface PriorityRow {
	priority: string;
	count: number;
}

interface HourlyTicketRow {
	hour_of_day: number;
	count: number;
}

export async function getWorkspaceAnalyticsSnapshot(db: D1Database, workspaceId: string): Promise<WorkspaceAnalyticsSnapshot> {
	const nowSeconds = Math.floor(Date.now() / 1000);
	const last7DaysStart = startOfUtcDay(nowSeconds) - 6 * 86400;
	const currentWeekStart = startOfUtcDay(nowSeconds) - 7 * 86400;
	const previousWeekStart = currentWeekStart - 7 * 86400;
	const last8WeeksStart = currentWeekStart - 7 * 7 * 86400;
	const last30DaysStart = startOfUtcDay(nowSeconds) - 29 * 86400;

	const [
		openTicketsRow,
		currentWeekOpenRow,
		previousWeekOpenRow,
		currentResponseRow,
		previousResponseRow,
		currentCreatedRow,
		currentResolvedRow,
		previousCreatedRow,
		previousResolvedRow,
		currentActiveTeamsRow,
		previousActiveTeamsRow,
		ticketVolumeResult,
		channelResult,
		responseTimeResult,
		weeklyResolutionResult,
		teamPerformanceResult,
		priorityResult,
		hourlyTicketsResult,
	] = await Promise.all([
		db.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND status = 'open'").bind(workspaceId).first<AggregateRow>(),
		db
			.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND status = 'open' AND created_at >= ?")
			.bind(workspaceId, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND status = 'open' AND created_at >= ? AND created_at < ?")
			.bind(workspaceId, previousWeekStart, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare(
				`SELECT AVG((first_agent.first_agent_at - t.created_at) / 3600.0) AS avg_hours
				 FROM tickets t
				 JOIN (
				   SELECT ticket_id, MIN(created_at) AS first_agent_at
				   FROM ticket_messages
				   WHERE author_type = 'agent'
				   GROUP BY ticket_id
				 ) first_agent ON first_agent.ticket_id = t.id
				 WHERE t.workspace_id = ? AND t.created_at >= ? AND first_agent.first_agent_at >= t.created_at`,
			)
			.bind(workspaceId, currentWeekStart)
			.first<ResponseAggregateRow>(),
		db
			.prepare(
				`SELECT AVG((first_agent.first_agent_at - t.created_at) / 3600.0) AS avg_hours
				 FROM tickets t
				 JOIN (
				   SELECT ticket_id, MIN(created_at) AS first_agent_at
				   FROM ticket_messages
				   WHERE author_type = 'agent'
				   GROUP BY ticket_id
				 ) first_agent ON first_agent.ticket_id = t.id
				 WHERE t.workspace_id = ? AND t.created_at >= ? AND t.created_at < ? AND first_agent.first_agent_at >= t.created_at`,
			)
			.bind(workspaceId, previousWeekStart, currentWeekStart)
			.first<ResponseAggregateRow>(),
		db.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND created_at >= ?").bind(workspaceId, currentWeekStart).first<AggregateRow>(),
		db
			.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND created_at >= ? AND status IN ('resolved', 'closed')")
			.bind(workspaceId, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND created_at >= ? AND created_at < ?")
			.bind(workspaceId, previousWeekStart, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare("SELECT COUNT(*) AS count FROM tickets WHERE workspace_id = ? AND created_at >= ? AND created_at < ? AND status IN ('resolved', 'closed')")
			.bind(workspaceId, previousWeekStart, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare(
				`SELECT COUNT(DISTINCT COALESCE(team_id, '__unassigned__')) AS count
				 FROM tickets
				 WHERE workspace_id = ? AND created_at >= ?`,
			)
			.bind(workspaceId, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare(
				`SELECT COUNT(DISTINCT COALESCE(team_id, '__unassigned__')) AS count
				 FROM tickets
				 WHERE workspace_id = ? AND created_at >= ? AND created_at < ?`,
			)
			.bind(workspaceId, previousWeekStart, currentWeekStart)
			.first<AggregateRow>(),
		db
			.prepare(
				`SELECT date(datetime(created_at, 'unixepoch')) AS day,
				        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open,
				        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
				        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed
				 FROM tickets
				 WHERE workspace_id = ? AND created_at >= ?
				 GROUP BY day
				 ORDER BY day ASC`,
			)
			.bind(workspaceId, last7DaysStart)
			.all<TicketVolumeRow>(),
		db
			.prepare(
				`SELECT channel, COUNT(*) AS count
				 FROM tickets
				 WHERE workspace_id = ?
				 GROUP BY channel
				 ORDER BY count DESC`,
			)
			.bind(workspaceId)
			.all<ChannelRow>(),
		db
			.prepare(
				`SELECT CAST(strftime('%H', datetime(t.created_at, 'unixepoch')) AS INTEGER) AS hour_of_day,
				        AVG((first_agent.first_agent_at - t.created_at) / 3600.0) AS avg_hours
				 FROM tickets t
				 JOIN (
				   SELECT ticket_id, MIN(created_at) AS first_agent_at
				   FROM ticket_messages
				   WHERE author_type = 'agent'
				   GROUP BY ticket_id
				 ) first_agent ON first_agent.ticket_id = t.id
				 WHERE t.workspace_id = ? AND t.created_at >= ? AND first_agent.first_agent_at >= t.created_at
				 GROUP BY hour_of_day
				 ORDER BY hour_of_day ASC`,
			)
			.bind(workspaceId, last30DaysStart)
			.all<ResponseTimeRow>(),
		db
			.prepare(
				`SELECT CAST(strftime('%s', date(datetime(created_at, 'unixepoch'), '-' || strftime('%w', datetime(created_at, 'unixepoch')) || ' days')) AS INTEGER) AS week_start,
				        COUNT(*) AS created_count,
				        SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS resolved_count
				 FROM tickets
				 WHERE workspace_id = ? AND created_at >= ?
				 GROUP BY week_start
				 ORDER BY week_start ASC`,
			)
			.bind(workspaceId, last8WeeksStart)
			.all<WeeklyResolutionRow>(),
		db
			.prepare(
				`SELECT COALESCE(tm.name, 'Unassigned') AS name,
				        COUNT(*) AS tickets,
				        SUM(CASE WHEN t.status IN ('resolved', 'closed') THEN 1 ELSE 0 END) AS resolved
				 FROM tickets t
				 LEFT JOIN teams tm ON tm.id = t.team_id
				 WHERE t.workspace_id = ?
				 GROUP BY COALESCE(tm.name, 'Unassigned')
				 ORDER BY tickets DESC, name ASC`,
			)
			.bind(workspaceId)
			.all<TeamPerformanceRow>(),
		db
			.prepare(
				`SELECT priority, COUNT(*) AS count
				 FROM tickets
				 WHERE workspace_id = ?
				 GROUP BY priority`,
			)
			.bind(workspaceId)
			.all<PriorityRow>(),
		db
			.prepare(
				`SELECT CAST(strftime('%H', datetime(created_at, 'unixepoch')) AS INTEGER) AS hour_of_day,
				        COUNT(*) AS count
				 FROM tickets
				 WHERE workspace_id = ? AND created_at >= ?
				 GROUP BY hour_of_day
				 ORDER BY hour_of_day ASC`,
			)
			.bind(workspaceId, last30DaysStart)
			.all<HourlyTicketRow>(),
	]);

	const openTickets = openTicketsRow?.count ?? 0;
	const currentWeekOpen = currentWeekOpenRow?.count ?? 0;
	const previousWeekOpen = previousWeekOpenRow?.count ?? 0;
	const currentAvgResponse = currentResponseRow?.avg_hours ?? 0;
	const previousAvgResponse = previousResponseRow?.avg_hours ?? 0;
	const currentCreated = currentCreatedRow?.count ?? 0;
	const currentResolved = currentResolvedRow?.count ?? 0;
	const previousCreated = previousCreatedRow?.count ?? 0;
	const previousResolved = previousResolvedRow?.count ?? 0;
	const currentResolutionRate = currentCreated > 0 ? (currentResolved / currentCreated) * 100 : 0;
	const previousResolutionRate = previousCreated > 0 ? (previousResolved / previousCreated) * 100 : 0;
	const activeTeams = currentActiveTeamsRow?.count ?? 0;
	const previousActiveTeams = previousActiveTeamsRow?.count ?? 0;

	const ticketVolumeMap = new Map((ticketVolumeResult.results ?? []).map((row) => [row.day, row]));
	const ticketVolume = buildLastSevenDays(nowSeconds).map(({ dayKey, label }) => {
		const row = ticketVolumeMap.get(dayKey);
		return {
			date: label,
			open: row?.open ?? 0,
			resolved: row?.resolved ?? 0,
			closed: row?.closed ?? 0,
		};
	});

	const channelRows = channelResult.results ?? [];
	const totalChannels = channelRows.reduce((sum, row) => sum + row.count, 0);
	const channelDistribution = channelRows.map((row, index) => ({
		name: row.channel ? row.channel[0].toUpperCase() + row.channel.slice(1) : "Unspecified",
		value: totalChannels > 0 ? round((row.count / totalChannels) * 100, 1) : 0,
		fill: CHANNEL_COLORS[index % CHANNEL_COLORS.length],
	}));

	const responseTimeMap = new Map((responseTimeResult.results ?? []).map((row) => [row.hour_of_day, row]));
	const responseTime = Array.from({ length: 24 }, (_, hour) => ({
		hour: formatHourLabel(hour),
		time: round(responseTimeMap.get(hour)?.avg_hours ?? 0, 2),
	}));

	const weeklyResolutionMap = new Map((weeklyResolutionResult.results ?? []).map((row) => [row.week_start, row]));
	const resolutionTrend = buildLastEightWeeks(nowSeconds).map(({ label, weekStart }) => {
		const row = weeklyResolutionMap.get(weekStart);
		const score = row && row.created_count > 0 ? (row.resolved_count / row.created_count) * 5 : 0;
		return {
			week: label,
			score: round(score, 2),
		};
	});

	const teamPerformance = (teamPerformanceResult.results ?? []).map((row) => ({
		name: row.name ?? "Unassigned",
		tickets: row.tickets,
		resolved: row.resolved,
	}));

	const priorityOrder = ["urgent", "high", "medium", "low"];
	const priorityMap = new Map((priorityResult.results ?? []).map((row) => [row.priority, row.count]));
	const priorityBreakdown = priorityOrder.map((priority) => ({
		priority: priority[0].toUpperCase() + priority.slice(1),
		count: priorityMap.get(priority) ?? 0,
		fill: PRIORITY_COLORS[priority],
	}));

	const hourlyTicketsMap = new Map((hourlyTicketsResult.results ?? []).map((row) => [row.hour_of_day, row.count]));
	const hourlyTickets = Array.from({ length: 24 }, (_, hour) => ({
		hour: formatHourClock(hour),
		tickets: hourlyTicketsMap.get(hour) ?? 0,
	}));

	return {
		kpis: [
			{
				label: "Open Tickets",
				value: openTickets.toString(),
				change: Math.abs(percentageChange(currentWeekOpen, previousWeekOpen)),
				trend: percentageChange(currentWeekOpen, previousWeekOpen) >= 0 ? "up" : "down",
			},
			{
				label: "Avg. Response Time",
				value: formatDurationHours(currentAvgResponse),
				change: Math.abs(percentageChange(currentAvgResponse, previousAvgResponse)),
				trend: percentageChange(currentAvgResponse, previousAvgResponse) <= 0 ? "down" : "up",
			},
			{
				label: "Resolution Rate",
				value: formatPercentage(currentResolutionRate),
				change: Math.abs(percentageChange(currentResolutionRate, previousResolutionRate)),
				trend: percentageChange(currentResolutionRate, previousResolutionRate) >= 0 ? "up" : "down",
			},
			{
				label: "Active Teams",
				value: activeTeams.toString(),
				change: Math.abs(percentageChange(activeTeams, previousActiveTeams)),
				trend: percentageChange(activeTeams, previousActiveTeams) >= 0 ? "up" : "down",
			},
		],
		ticketVolume,
		channelDistribution,
		responseTime,
		resolutionTrend,
		teamPerformance,
		priorityBreakdown,
		hourlyTickets,
	};
}
