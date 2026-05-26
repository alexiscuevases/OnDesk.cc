import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { BusinessHours, Weekday } from "../api/business-hours-api";

export interface PeriodInput {
	weekday: Weekday;
	start_minute: number;
	end_minute: number;
}

export interface BusinessHoursFormValues {
	name: string;
	description: string;
	timezone: string;
	is_default: boolean;
	enabled: boolean;
	periods: PeriodInput[];
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	calendar?: BusinessHours | null;
	onSubmit: (values: BusinessHoursFormValues) => void;
}

const WEEKDAYS: { value: Weekday; label: string }[] = [
	{ value: 1, label: "Monday" },
	{ value: 2, label: "Tuesday" },
	{ value: 3, label: "Wednesday" },
	{ value: 4, label: "Thursday" },
	{ value: 5, label: "Friday" },
	{ value: 6, label: "Saturday" },
	{ value: 0, label: "Sunday" },
];

// A short, opinionated list — users can type any IANA tz via the input fallback.
const TIMEZONES = [
	"UTC",
	"America/New_York",
	"America/Chicago",
	"America/Denver",
	"America/Los_Angeles",
	"America/Mexico_City",
	"America/Sao_Paulo",
	"America/Argentina/Buenos_Aires",
	"Europe/London",
	"Europe/Berlin",
	"Europe/Madrid",
	"Europe/Paris",
	"Africa/Johannesburg",
	"Asia/Dubai",
	"Asia/Kolkata",
	"Asia/Singapore",
	"Asia/Tokyo",
	"Australia/Sydney",
];

function minutesToTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function timeToMinutes(time: string): number | null {
	const m = /^(\d{1,2}):(\d{2})$/.exec(time);
	if (!m) return null;
	const h = parseInt(m[1], 10);
	const min = parseInt(m[2], 10);
	if (h < 0 || h > 24 || min < 0 || min > 59) return null;
	return h * 60 + min;
}

function defaults(c?: BusinessHours | null): BusinessHoursFormValues {
	if (c) {
		return {
			name: c.name,
			description: c.description ?? "",
			timezone: c.timezone,
			is_default: c.is_default,
			enabled: c.enabled,
			periods: c.periods.map((p) => ({
				weekday: p.weekday,
				start_minute: p.start_minute,
				end_minute: p.end_minute,
			})),
		};
	}
	// Sensible default: Mon–Fri 09:00–18:00
	const periods: PeriodInput[] = [1, 2, 3, 4, 5].map((d) => ({
		weekday: d as Weekday,
		start_minute: 9 * 60,
		end_minute: 18 * 60,
	}));
	return {
		name: "",
		description: "",
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
		is_default: false,
		enabled: true,
		periods,
	};
}

export function BusinessHoursFormModal({ open, onOpenChange, calendar, onSubmit }: Props) {
	const [v, setV] = useState<BusinessHoursFormValues>(() => defaults(calendar));

	const valid = v.name.trim().length > 0 && v.timezone.trim().length > 0;

	const periodsByDay = (day: Weekday) => v.periods.filter((p) => p.weekday === day);

	const addPeriod = (day: Weekday) => {
		// Default a new shift to 09:00–17:00 if none, else last-end → +1h
		const existing = periodsByDay(day).sort((a, b) => a.start_minute - b.start_minute);
		let start = 9 * 60;
		let end = 17 * 60;
		if (existing.length > 0) {
			const last = existing[existing.length - 1];
			start = Math.min(last.end_minute + 60, 22 * 60);
			end = Math.min(start + 60, 24 * 60);
			if (end <= start) return;
		}
		setV({ ...v, periods: [...v.periods, { weekday: day, start_minute: start, end_minute: end }] });
	};

	const removePeriod = (day: Weekday, idx: number) => {
		const filtered = v.periods.filter((p) => p.weekday !== day);
		const dayList = periodsByDay(day).filter((_, i) => i !== idx);
		setV({ ...v, periods: [...filtered, ...dayList] });
	};

	const updatePeriod = (day: Weekday, idx: number, patch: Partial<PeriodInput>) => {
		const filtered = v.periods.filter((p) => p.weekday !== day);
		const dayList = periodsByDay(day).map((p, i) => (i === idx ? { ...p, ...patch } : p));
		setV({ ...v, periods: [...filtered, ...dayList] });
	};

	const sortedTimezones = TIMEZONES.includes(v.timezone) ? TIMEZONES : [v.timezone, ...TIMEZONES];

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title={calendar ? "Edit business hours" : "New business hours"}
			description="Define operating hours per weekday. Times are local to the selected timezone."
			maxWidth="sm:max-w-2xl"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (!valid) return;
					// Strip invalid (end <= start) ranges before submit
					const cleaned = v.periods
						.filter((p) => p.end_minute > p.start_minute)
						.sort((a, b) => a.weekday - b.weekday || a.start_minute - b.start_minute);
					onSubmit({ ...v, periods: cleaned });
				}}
			>
				<div className="grid max-h-[65vh] gap-4 overflow-y-auto py-4 pr-1">
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Name</Label>
							<Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="h-9 rounded-lg" placeholder="e.g. US Support" />
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Timezone</Label>
							<Select value={v.timezone} onValueChange={(val) => setV({ ...v, timezone: val })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent className="max-h-72">
									{sortedTimezones.map((tz) => (
										<SelectItem key={tz} value={tz} className="text-xs">
											{tz}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Description</Label>
						<Textarea
							value={v.description}
							onChange={(e) => setV({ ...v, description: e.target.value })}
							className="min-h-[50px] rounded-lg text-xs"
							placeholder="Optional notes about who/what this calendar covers"
						/>
					</div>

					<div className="rounded-lg border bg-card p-3">
						<p className="mb-2 text-xs font-medium">Weekly schedule</p>
						<div className="grid gap-2">
							{WEEKDAYS.map(({ value: day, label }) => {
								const list = periodsByDay(day).sort((a, b) => a.start_minute - b.start_minute);
								return (
									<div key={day} className="grid grid-cols-[100px_1fr] items-start gap-3 rounded-md border bg-background/40 px-3 py-2">
										<p className="pt-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
										<div className="flex flex-col gap-1.5">
											{list.length === 0 ? (
												<p className="py-1 text-[11px] italic text-muted-foreground">Closed</p>
											) : (
												list.map((p, idx) => (
													<div key={idx} className="flex items-center gap-2">
														<Input
															type="time"
															value={minutesToTime(p.start_minute)}
															onChange={(e) => {
																const min = timeToMinutes(e.target.value);
																if (min !== null) updatePeriod(day, idx, { start_minute: min });
															}}
															className="h-7 w-24 rounded-md text-xs"
														/>
														<span className="text-[11px] text-muted-foreground">→</span>
														<Input
															type="time"
															value={minutesToTime(p.end_minute)}
															onChange={(e) => {
																const min = timeToMinutes(e.target.value);
																if (min !== null) updatePeriod(day, idx, { end_minute: min });
															}}
															className="h-7 w-24 rounded-md text-xs"
														/>
														<Button
															type="button"
															size="icon"
															variant="ghost"
															onClick={() => removePeriod(day, idx)}
															className="size-7 text-destructive"
														>
															<Trash2 className="size-3" />
														</Button>
													</div>
												))
											)}
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onClick={() => addPeriod(day)}
												className="h-6 w-fit gap-1 rounded-md px-2 text-[10px] text-muted-foreground"
											>
												<Plus className="size-3" />
												Add shift
											</Button>
										</div>
									</div>
								);
							})}
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Switch checked={v.enabled} onCheckedChange={(c) => setV({ ...v, enabled: c })} />
							<Label className="text-xs">Enabled</Label>
						</div>
						<div className="flex items-center gap-2">
							<Switch checked={v.is_default} onCheckedChange={(c) => setV({ ...v, is_default: c })} />
							<Label className="text-xs">Default for workspace</Label>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button type="submit" disabled={!valid} className="rounded-lg text-xs font-semibold">
						{calendar ? "Save changes" : "Create calendar"}
					</Button>
				</DialogFooter>
			</form>
		</FormModal>
	);
}
