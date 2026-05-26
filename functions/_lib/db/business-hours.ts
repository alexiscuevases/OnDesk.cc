import type {
	BusinessHoursRow,
	BusinessHoursPeriodRow,
	BusinessHoursHolidayRow,
	PublicBusinessHours,
	PublicBusinessHoursPeriod,
	PublicBusinessHoursHoliday,
	HolidayKind,
	Weekday,
} from "../types/business-hours";

// ─── Row → Public ─────────────────────────────────────────────────────────────

export function rowToPublicPeriod(row: BusinessHoursPeriodRow): PublicBusinessHoursPeriod {
	return {
		id: row.id,
		business_hours_id: row.business_hours_id,
		weekday: row.weekday,
		start_minute: row.start_minute,
		end_minute: row.end_minute,
	};
}

export function rowToPublicHoliday(row: BusinessHoursHolidayRow): PublicBusinessHoursHoliday {
	return {
		id: row.id,
		business_hours_id: row.business_hours_id,
		date: row.date,
		name: row.name,
		kind: row.kind,
		start_minute: row.start_minute,
		end_minute: row.end_minute,
	};
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function findBusinessHoursByWorkspace(
	db: D1Database,
	workspaceId: string,
): Promise<PublicBusinessHours[]> {
	const calRes = await db
		.prepare("SELECT * FROM business_hours WHERE workspace_id = ? ORDER BY is_default DESC, created_at ASC")
		.bind(workspaceId)
		.all<BusinessHoursRow>();
	const calendars = calRes.results ?? [];
	if (calendars.length === 0) return [];

	const ids = calendars.map((c) => c.id);
	const placeholders = ids.map(() => "?").join(",");

	const periodsRes = await db
		.prepare(
			`SELECT * FROM business_hours_periods WHERE business_hours_id IN (${placeholders}) ORDER BY weekday ASC, start_minute ASC`,
		)
		.bind(...ids)
		.all<BusinessHoursPeriodRow>();
	const holidaysRes = await db
		.prepare(
			`SELECT * FROM business_hours_holidays WHERE business_hours_id IN (${placeholders}) ORDER BY date ASC`,
		)
		.bind(...ids)
		.all<BusinessHoursHolidayRow>();

	const periodsBy = new Map<string, PublicBusinessHoursPeriod[]>();
	for (const p of periodsRes.results ?? []) {
		const arr = periodsBy.get(p.business_hours_id) ?? [];
		arr.push(rowToPublicPeriod(p));
		periodsBy.set(p.business_hours_id, arr);
	}
	const holidaysBy = new Map<string, PublicBusinessHoursHoliday[]>();
	for (const h of holidaysRes.results ?? []) {
		const arr = holidaysBy.get(h.business_hours_id) ?? [];
		arr.push(rowToPublicHoliday(h));
		holidaysBy.set(h.business_hours_id, arr);
	}

	return calendars.map((c) => ({
		id: c.id,
		workspace_id: c.workspace_id,
		name: c.name,
		description: c.description,
		timezone: c.timezone,
		is_default: Boolean(c.is_default),
		enabled: Boolean(c.enabled),
		created_at: c.created_at,
		updated_at: c.updated_at,
		periods: periodsBy.get(c.id) ?? [],
		holidays: holidaysBy.get(c.id) ?? [],
	}));
}

export async function findBusinessHoursById(
	db: D1Database,
	id: string,
): Promise<PublicBusinessHours | null> {
	const cal = await db
		.prepare("SELECT * FROM business_hours WHERE id = ? LIMIT 1")
		.bind(id)
		.first<BusinessHoursRow>();
	if (!cal) return null;
	const periods = await db
		.prepare("SELECT * FROM business_hours_periods WHERE business_hours_id = ? ORDER BY weekday ASC, start_minute ASC")
		.bind(id)
		.all<BusinessHoursPeriodRow>();
	const holidays = await db
		.prepare("SELECT * FROM business_hours_holidays WHERE business_hours_id = ? ORDER BY date ASC")
		.bind(id)
		.all<BusinessHoursHolidayRow>();
	return {
		id: cal.id,
		workspace_id: cal.workspace_id,
		name: cal.name,
		description: cal.description,
		timezone: cal.timezone,
		is_default: Boolean(cal.is_default),
		enabled: Boolean(cal.enabled),
		created_at: cal.created_at,
		updated_at: cal.updated_at,
		periods: (periods.results ?? []).map(rowToPublicPeriod),
		holidays: (holidays.results ?? []).map(rowToPublicHoliday),
	};
}

export async function findDefaultBusinessHours(
	db: D1Database,
	workspaceId: string,
): Promise<PublicBusinessHours | null> {
	const row = await db
		.prepare("SELECT id FROM business_hours WHERE workspace_id = ? AND is_default = 1 AND enabled = 1 LIMIT 1")
		.bind(workspaceId)
		.first<{ id: string }>();
	if (!row) return null;
	return findBusinessHoursById(db, row.id);
}

export interface CreateBusinessHoursInput {
	name: string;
	description?: string | null;
	timezone?: string;
	is_default?: boolean;
	enabled?: boolean;
}

export async function createBusinessHours(
	db: D1Database,
	workspaceId: string,
	data: CreateBusinessHoursInput,
): Promise<string> {
	const id = crypto.randomUUID();
	// Clear other defaults if this one is marked default
	if (data.is_default) {
		await db
			.prepare("UPDATE business_hours SET is_default = 0, updated_at = unixepoch() WHERE workspace_id = ? AND is_default = 1")
			.bind(workspaceId)
			.run();
	}
	await db
		.prepare(
			`INSERT INTO business_hours (id, workspace_id, name, description, timezone, is_default, enabled)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
		)
		.bind(
			id,
			workspaceId,
			data.name,
			data.description ?? null,
			data.timezone ?? "UTC",
			data.is_default ? 1 : 0,
			data.enabled === false ? 0 : 1,
		)
		.run();
	return id;
}

export interface UpdateBusinessHoursInput {
	name?: string;
	description?: string | null;
	timezone?: string;
	is_default?: boolean;
	enabled?: boolean;
}

export async function updateBusinessHours(
	db: D1Database,
	id: string,
	workspaceId: string,
	data: UpdateBusinessHoursInput,
): Promise<void> {
	if (data.is_default === true) {
		await db
			.prepare(
				"UPDATE business_hours SET is_default = 0, updated_at = unixepoch() WHERE workspace_id = ? AND is_default = 1 AND id != ?",
			)
			.bind(workspaceId, id)
			.run();
	}
	const fields: string[] = [];
	const values: (string | number | null)[] = [];
	if (data.name !== undefined) {
		fields.push("name = ?");
		values.push(data.name);
	}
	if (data.description !== undefined) {
		fields.push("description = ?");
		values.push(data.description);
	}
	if (data.timezone !== undefined) {
		fields.push("timezone = ?");
		values.push(data.timezone);
	}
	if (data.is_default !== undefined) {
		fields.push("is_default = ?");
		values.push(data.is_default ? 1 : 0);
	}
	if (data.enabled !== undefined) {
		fields.push("enabled = ?");
		values.push(data.enabled ? 1 : 0);
	}
	if (fields.length === 0) return;
	fields.push("updated_at = unixepoch()");
	values.push(id);
	await db
		.prepare(`UPDATE business_hours SET ${fields.join(", ")} WHERE id = ?`)
		.bind(...values)
		.run();
}

export async function deleteBusinessHours(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM business_hours WHERE id = ?").bind(id).run();
}

// ─── Periods CRUD ─────────────────────────────────────────────────────────────

export interface UpsertPeriodInput {
	weekday: Weekday;
	start_minute: number;
	end_minute: number;
}

export async function replacePeriods(
	db: D1Database,
	businessHoursId: string,
	periods: UpsertPeriodInput[],
): Promise<void> {
	await db
		.prepare("DELETE FROM business_hours_periods WHERE business_hours_id = ?")
		.bind(businessHoursId)
		.run();
	for (const p of periods) {
		if (p.end_minute <= p.start_minute) continue;
		await db
			.prepare(
				"INSERT INTO business_hours_periods (id, business_hours_id, weekday, start_minute, end_minute) VALUES (?, ?, ?, ?, ?)",
			)
			.bind(crypto.randomUUID(), businessHoursId, p.weekday, p.start_minute, p.end_minute)
			.run();
	}
}

// ─── Holidays CRUD ────────────────────────────────────────────────────────────

export interface CreateHolidayInput {
	date: string;
	name: string;
	kind?: HolidayKind;
	start_minute?: number | null;
	end_minute?: number | null;
}

export async function createHoliday(
	db: D1Database,
	businessHoursId: string,
	data: CreateHolidayInput,
): Promise<string> {
	const id = crypto.randomUUID();
	const kind: HolidayKind = data.kind ?? "closed";
	await db
		.prepare(
			"INSERT INTO business_hours_holidays (id, business_hours_id, date, name, kind, start_minute, end_minute) VALUES (?, ?, ?, ?, ?, ?, ?)",
		)
		.bind(
			id,
			businessHoursId,
			data.date,
			data.name,
			kind,
			kind === "open" ? data.start_minute ?? null : null,
			kind === "open" ? data.end_minute ?? null : null,
		)
		.run();
	return id;
}

export async function deleteHoliday(db: D1Database, id: string): Promise<void> {
	await db.prepare("DELETE FROM business_hours_holidays WHERE id = ?").bind(id).run();
}

export async function findHolidayById(
	db: D1Database,
	id: string,
): Promise<BusinessHoursHolidayRow | null> {
	const row = await db
		.prepare("SELECT * FROM business_hours_holidays WHERE id = ? LIMIT 1")
		.bind(id)
		.first<BusinessHoursHolidayRow>();
	return row ?? null;
}

// ─── Timezone-aware computation ───────────────────────────────────────────────
//
// Cloudflare Workers expose Intl.DateTimeFormat with IANA timezones, but
// JavaScript has no first-class way to "convert" a Date to another tz. We use
// the standard trick: format the UTC instant using the target tz, then re-parse
// the fields as if they were the local wall-clock time.

interface ZonedFields {
	year: number;
	month: number;  // 1..12
	day: number;    // 1..31
	hour: number;   // 0..23
	minute: number; // 0..59
	second: number; // 0..59
	weekday: Weekday;
}

// Format an instant (epoch seconds) into wall-clock fields for the given tz.
export function instantToZonedFields(epochSeconds: number, timezone: string): ZonedFields {
	const date = new Date(epochSeconds * 1000);
	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone: timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
		weekday: "short",
	});
	const parts = formatter.formatToParts(date);
	const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
	const weekdayShort = get("weekday");
	const weekdayMap: Record<string, Weekday> = {
		Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
	};
	let hour = parseInt(get("hour"), 10);
	if (hour === 24) hour = 0; // some locales emit 24 for midnight
	return {
		year: parseInt(get("year"), 10),
		month: parseInt(get("month"), 10),
		day: parseInt(get("day"), 10),
		hour,
		minute: parseInt(get("minute"), 10),
		second: parseInt(get("second"), 10),
		weekday: weekdayMap[weekdayShort] ?? 0,
	};
}

// Given wall-clock fields and a tz, return the epoch seconds that corresponds.
// Uses the round-trip approach: start with a UTC epoch built from the wall-clock
// fields as if they were UTC, then measure the offset by formatting back and
// adjusting. Handles DST transitions correctly within one iteration for the
// vast majority of zones (we run a second correction pass for edge cases).
export function zonedFieldsToInstant(
	year: number,
	month: number,
	day: number,
	hour: number,
	minute: number,
	timezone: string,
): number {
	// Initial guess: treat fields as UTC.
	const utcGuess = Math.floor(Date.UTC(year, month - 1, day, hour, minute, 0) / 1000);
	// Measure how the guess is interpreted in the target tz.
	const f1 = instantToZonedFields(utcGuess, timezone);
	const f1Utc = Math.floor(Date.UTC(f1.year, f1.month - 1, f1.day, f1.hour, f1.minute, 0) / 1000);
	const offset = f1Utc - utcGuess;
	let result = utcGuess - offset;
	// Second pass to settle DST boundaries.
	const f2 = instantToZonedFields(result, timezone);
	const f2Utc = Math.floor(Date.UTC(f2.year, f2.month - 1, f2.day, f2.hour, f2.minute, 0) / 1000);
	const offset2 = f2Utc - result;
	const target = Math.floor(Date.UTC(year, month - 1, day, hour, minute, 0) / 1000);
	result = target - offset2;
	return result;
}

function ymd(year: number, month: number, day: number): string {
	const m = String(month).padStart(2, "0");
	const d = String(day).padStart(2, "0");
	return `${year}-${m}-${d}`;
}

// Returns the open windows for a specific calendar date, as start/end minute pairs
// in calendar-local time. Honors holiday overrides.
function windowsForDate(
	calendar: PublicBusinessHours,
	dateStr: string,
	weekday: Weekday,
): { start: number; end: number }[] {
	const holiday = calendar.holidays.find((h) => h.date === dateStr);
	if (holiday) {
		if (holiday.kind === "closed") return [];
		if (
			holiday.kind === "open" &&
			holiday.start_minute != null &&
			holiday.end_minute != null &&
			holiday.end_minute > holiday.start_minute
		) {
			return [{ start: holiday.start_minute, end: holiday.end_minute }];
		}
		return [];
	}
	return calendar.periods
		.filter((p) => p.weekday === weekday && p.end_minute > p.start_minute)
		.map((p) => ({ start: p.start_minute, end: p.end_minute }))
		.sort((a, b) => a.start - b.start);
}

export function isCalendarOpenAt(calendar: PublicBusinessHours, epochSeconds: number): boolean {
	if (!calendar.enabled) return false;
	const z = instantToZonedFields(epochSeconds, calendar.timezone);
	const wins = windowsForDate(calendar, ymd(z.year, z.month, z.day), z.weekday);
	const m = z.hour * 60 + z.minute;
	return wins.some((w) => m >= w.start && m < w.end);
}

// Returns the next epochSeconds at which the calendar becomes open.
// If the calendar is already open at `from`, returns `from`. Capped by lookaheadDays.
export function nextOpenAt(
	calendar: PublicBusinessHours,
	from: number,
	lookaheadDays = 365,
): number | null {
	if (!calendar.enabled) return null;
	if (isCalendarOpenAt(calendar, from)) return from;

	const z = instantToZonedFields(from, calendar.timezone);
	let year = z.year, month = z.month, day = z.day;
	let weekday: Weekday = z.weekday;
	let startSearchMinute = z.hour * 60 + z.minute;

	for (let i = 0; i < lookaheadDays; i++) {
		const dateStr = ymd(year, month, day);
		const wins = windowsForDate(calendar, dateStr, weekday);
		for (const w of wins) {
			const useStart = i === 0 ? Math.max(startSearchMinute, w.start) : w.start;
			if (useStart < w.end) {
				const h = Math.floor(useStart / 60);
				const min = useStart % 60;
				return zonedFieldsToInstant(year, month, day, h, min, calendar.timezone);
			}
		}
		// Advance one calendar day.
		const next = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
		next.setUTCDate(next.getUTCDate() + 1);
		year = next.getUTCFullYear();
		month = next.getUTCMonth() + 1;
		day = next.getUTCDate();
		weekday = (((weekday + 1) % 7) as Weekday);
		startSearchMinute = 0;
	}
	return null;
}

// Add `minutes` of business time to `from`, advancing across open windows.
// Skips closed weekdays and holiday-closed dates. Returns the resulting epoch
// seconds, or null if it cannot be reached within lookaheadDays.
export function addBusinessMinutes(
	calendar: PublicBusinessHours,
	from: number,
	minutes: number,
	lookaheadDays = 365,
): number | null {
	if (!calendar.enabled) return null;
	if (minutes <= 0) return from;

	let remaining = minutes;
	let cursor = from;

	for (let i = 0; i < lookaheadDays; i++) {
		const z = instantToZonedFields(cursor, calendar.timezone);
		const dateStr = ymd(z.year, z.month, z.day);
		const wins = windowsForDate(calendar, dateStr, z.weekday);
		const cursorMin = z.hour * 60 + z.minute;

		for (const w of wins) {
			if (w.end <= cursorMin) continue; // already past this window
			const segStart = Math.max(cursorMin, w.start);
			const segMinutes = w.end - segStart;
			if (remaining <= segMinutes) {
				const finalMin = segStart + remaining;
				const h = Math.floor(finalMin / 60);
				const min = finalMin % 60;
				return zonedFieldsToInstant(z.year, z.month, z.day, h, min, calendar.timezone);
			}
			remaining -= segMinutes;
		}

		// Advance to next day at 00:00 local.
		const nextDate = new Date(Date.UTC(z.year, z.month - 1, z.day, 12, 0, 0));
		nextDate.setUTCDate(nextDate.getUTCDate() + 1);
		const ny = nextDate.getUTCFullYear();
		const nm = nextDate.getUTCMonth() + 1;
		const nd = nextDate.getUTCDate();
		cursor = zonedFieldsToInstant(ny, nm, nd, 0, 0, calendar.timezone);
	}
	return null;
}

// Compute the open status payload — useful for badges in the UI.
export interface OpenStatus {
	is_open: boolean;
	next_change_at: number | null;
	timezone: string;
}

export function computeOpenStatus(calendar: PublicBusinessHours, now: number): OpenStatus {
	if (!calendar.enabled) {
		return { is_open: false, next_change_at: null, timezone: calendar.timezone };
	}
	const isOpen = isCalendarOpenAt(calendar, now);
	if (isOpen) {
		// Find end of current window.
		const z = instantToZonedFields(now, calendar.timezone);
		const dateStr = ymd(z.year, z.month, z.day);
		const wins = windowsForDate(calendar, dateStr, z.weekday);
		const cursorMin = z.hour * 60 + z.minute;
		const current = wins.find((w) => cursorMin >= w.start && cursorMin < w.end);
		if (current) {
			const h = Math.floor(current.end / 60);
			const min = current.end % 60;
			const closesAt = zonedFieldsToInstant(z.year, z.month, z.day, h, min, calendar.timezone);
			return { is_open: true, next_change_at: closesAt, timezone: calendar.timezone };
		}
		return { is_open: true, next_change_at: null, timezone: calendar.timezone };
	}
	return { is_open: false, next_change_at: nextOpenAt(calendar, now), timezone: calendar.timezone };
}
