import { createWorkspaceScopedApi } from "@/lib/crud-api";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type HolidayKind = "closed" | "open";

export interface BusinessHoursPeriod {
	id: string;
	business_hours_id: string;
	weekday: Weekday;
	start_minute: number;
	end_minute: number;
}

export interface BusinessHoursHoliday {
	id: string;
	business_hours_id: string;
	date: string;
	name: string;
	kind: HolidayKind;
	start_minute: number | null;
	end_minute: number | null;
}

export interface BusinessHours {
	id: string;
	workspace_id: string;
	name: string;
	description: string | null;
	timezone: string;
	is_default: boolean;
	enabled: boolean;
	created_at: number;
	updated_at: number;
	periods: BusinessHoursPeriod[];
	holidays: BusinessHoursHoliday[];
}

export interface BusinessHoursStatus {
	is_open: boolean;
	next_change_at: number | null;
	timezone: string;
}

export interface CreateBusinessHoursInput {
	workspace_id: string;
	name: string;
	description?: string | null;
	timezone?: string;
	is_default?: boolean;
	enabled?: boolean;
	periods?: { weekday: Weekday; start_minute: number; end_minute: number }[];
}

export interface UpdateBusinessHoursInput {
	name?: string;
	description?: string | null;
	timezone?: string;
	is_default?: boolean;
	enabled?: boolean;
	periods?: { weekday: Weekday; start_minute: number; end_minute: number }[];
}

const _api = createWorkspaceScopedApi<BusinessHours, CreateBusinessHoursInput, UpdateBusinessHoursInput>({
	basePath: "/api/business-hours",
	listKey: "business_hours",
	itemKey: "business_hours",
});

export const apiGetBusinessHours = _api.getAll;
export const apiGetBusinessHoursById = _api.getById;
export const apiCreateBusinessHours = _api.create;
export const apiUpdateBusinessHours = (id: string, input: UpdateBusinessHoursInput) => _api.update(id, input);
export const apiDeleteBusinessHours = _api.delete;

export interface CreateHolidayInput {
	date: string;
	name: string;
	kind?: HolidayKind;
	start_minute?: number | null;
	end_minute?: number | null;
}

export async function apiCreateHoliday(
	businessHoursId: string,
	input: CreateHolidayInput,
): Promise<BusinessHoursHoliday> {
	const res = await fetch(`/api/business-hours/${businessHoursId}/holidays`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify(input),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error?: string };
		throw new Error(err.error ?? "Failed to add holiday");
	}
	const data = (await res.json()) as { holiday: BusinessHoursHoliday };
	return data.holiday;
}

export async function apiDeleteHoliday(holidayId: string): Promise<void> {
	const res = await fetch(`/api/business-hours/holidays/${holidayId}`, {
		method: "DELETE",
		credentials: "include",
	});
	if (!res.ok) {
		const err = (await res.json()) as { error?: string };
		throw new Error(err.error ?? "Failed to delete holiday");
	}
}

export async function apiGetBusinessHoursStatus(businessHoursId: string): Promise<BusinessHoursStatus | null> {
	const res = await fetch(`/api/business-hours/${businessHoursId}/status`, { credentials: "include" });
	if (!res.ok) return null;
	const data = (await res.json()) as { status: BusinessHoursStatus };
	return data.status;
}
