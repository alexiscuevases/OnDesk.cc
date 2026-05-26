// Weekday: 0=Sunday .. 6=Saturday (matches JS Date.getDay() / .getUTCDay()).
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HolidayKind = "closed" | "open";

export interface BusinessHoursRow {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	timezone: string;
	is_default: number;
	enabled: number;
	created_at: number;
	updated_at: number;
}

export interface BusinessHoursPeriodRow {
	id: string;
	business_hours_id: string;
	weekday: Weekday;
	start_minute: number;
	end_minute: number;
	created_at: number;
}

export interface BusinessHoursHolidayRow {
	id: string;
	business_hours_id: string;
	date: string; // YYYY-MM-DD local to calendar tz
	name: string;
	kind: HolidayKind;
	start_minute: number | null;
	end_minute: number | null;
	created_at: number;
}

export interface PublicBusinessHoursPeriod {
	id: string;
	business_hours_id: string;
	weekday: Weekday;
	start_minute: number;
	end_minute: number;
}

export interface PublicBusinessHoursHoliday {
	id: string;
	business_hours_id: string;
	date: string;
	name: string;
	kind: HolidayKind;
	start_minute: number | null;
	end_minute: number | null;
}

export interface PublicBusinessHours {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	timezone: string;
	is_default: boolean;
	enabled: boolean;
	created_at: number;
	updated_at: number;
	periods: PublicBusinessHoursPeriod[];
	holidays: PublicBusinessHoursHoliday[];
}
