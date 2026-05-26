import { useState } from "react";
import { Clock, Plus, Pencil, Trash2, Star, Power, Calendar, X } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/context/workspace-context";
import { ConfirmDeleteModal } from "@/shared/components";
import { useBusinessHours, useBusinessHoursStatus } from "../hooks/use-business-hours-queries";
import {
	useCreateBusinessHoursMutation,
	useUpdateBusinessHoursMutation,
	useDeleteBusinessHoursMutation,
	useCreateHolidayMutation,
	useDeleteHolidayMutation,
} from "../hooks/use-business-hours-mutations";
import {
	BusinessHoursFormModal,
	type BusinessHoursFormValues,
} from "../modals/business-hours-form-modal";
import { HolidayFormModal } from "../modals/holiday-form-modal";
import type { BusinessHours, Weekday } from "../api/business-hours-api";

type FormMode = { type: "closed" } | { type: "create" } | { type: "edit"; calendar: BusinessHours };

const DAY_LABELS: Record<Weekday, string> = {
	0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat",
};

function minutesToTime(minutes: number): string {
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function BusinessHoursView() {
	const { workspace } = useWorkspace();
	const { data: calendars = [], isLoading } = useBusinessHours(workspace.id);

	const deleteMutation = useDeleteBusinessHoursMutation(workspace.id);
	const [mode, setMode] = useState<FormMode>({ type: "closed" });
	const [deleting, setDeleting] = useState<BusinessHours | null>(null);

	const enabledCount = calendars.filter((c) => c.enabled).length;
	const defaultCal = calendars.find((c) => c.is_default) ?? null;

	const handleDelete = () => {
		if (!deleting) return;
		deleteMutation.mutate(deleting.id, {
			onSuccess: () => {
				toast.success("Calendar deleted");
				setDeleting(null);
			},
			onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to delete"),
		});
	};

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-end justify-between">
				<p className="text-xs text-muted-foreground">
					Operating hours and holidays. Used by SLA policies to pause clocks outside business hours.
				</p>
				<Button onClick={() => setMode({ type: "create" })} className="rounded-lg text-xs">
					<Plus className="mr-1 size-3.5" />
					New calendar
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-3">
				<SummaryCard icon={Clock} label="Calendars" value={calendars.length} />
				<SummaryCard icon={Power} label="Enabled" value={enabledCount} />
				<SummaryCard icon={Star} label="Default" value={defaultCal ? defaultCal.name : "—"} />
			</div>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Calendars</CardTitle>
					<CardDescription className="text-xs">
						The default calendar is used by any SLA policy that has business hours enabled without an explicit calendar.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					{isLoading ? (
						<div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>
					) : calendars.length === 0 ? (
						<div className="flex flex-col items-center gap-2 py-10 text-center">
							<div className="flex size-10 items-center justify-center rounded-xl bg-secondary">
								<Clock className="size-5 text-muted-foreground" />
							</div>
							<p className="text-sm font-medium">No business hours yet</p>
							<p className="text-[11px] text-muted-foreground max-w-xs">
								Create a calendar to define when your team is available.
							</p>
						</div>
					) : (
						<ul className="divide-y">
							{calendars.map((c) => (
								<CalendarRow
									key={c.id}
									calendar={c}
									workspaceId={workspace.id}
									onEdit={() => setMode({ type: "edit", calendar: c })}
									onDelete={() => setDeleting(c)}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</Card>

			{mode.type === "create" && (
				<CreateWrapper workspaceId={workspace.id} onClose={() => setMode({ type: "closed" })} />
			)}
			{mode.type === "edit" && (
				<EditWrapper
					calendar={mode.calendar}
					workspaceId={workspace.id}
					onClose={() => setMode({ type: "closed" })}
				/>
			)}

			<ConfirmDeleteModal
				open={!!deleting}
				onOpenChange={(o) => !o && setDeleting(null)}
				title="Delete calendar"
				description={`This will permanently delete "${deleting?.name}". SLA policies pointing here will fall back to the default calendar.`}
				confirmLabel="Delete"
				onConfirm={handleDelete}
			/>
		</div>
	);
}

function SummaryCard({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: number | string;
}) {
	return (
		<div className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm">
			<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
				<Icon className="size-5 text-primary" />
			</div>
			<div className="min-w-0">
				<p className="truncate text-xl font-bold">{value}</p>
				<p className="text-[11px] text-muted-foreground">{label}</p>
			</div>
		</div>
	);
}

function CalendarRow({
	calendar,
	workspaceId,
	onEdit,
	onDelete,
}: {
	calendar: BusinessHours;
	workspaceId: string;
	onEdit: () => void;
	onDelete: () => void;
}) {
	const [holidayOpen, setHolidayOpen] = useState(false);
	const { data: status } = useBusinessHoursStatus(calendar.id);
	const createHoliday = useCreateHolidayMutation(calendar.id, workspaceId);
	const deleteHoliday = useDeleteHolidayMutation(calendar.id, workspaceId);

	const periodsByDay = (day: Weekday) =>
		calendar.periods
			.filter((p) => p.weekday === day)
			.sort((a, b) => a.start_minute - b.start_minute);

	const upcomingHolidays = calendar.holidays
		.filter((h) => h.date >= new Date().toISOString().slice(0, 10))
		.slice(0, 6);

	return (
		<li className="px-4 py-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-2">
						<p className="truncate text-sm font-medium">{calendar.name}</p>
						{calendar.is_default && (
							<Badge variant="secondary" className="gap-1 text-[10px] font-normal">
								<Star className="size-2.5" /> Default
							</Badge>
						)}
						{!calendar.enabled && (
							<Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
								Disabled
							</Badge>
						)}
						{status && (
							<Badge
								variant="outline"
								className={`text-[10px] font-medium ${
									status.is_open
										? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
										: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
								}`}
							>
								{status.is_open ? "Open now" : "Closed"}
							</Badge>
						)}
						<Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">
							{calendar.timezone}
						</Badge>
					</div>
					{calendar.description && (
						<p className="mt-1 truncate text-xs text-muted-foreground">{calendar.description}</p>
					)}

					<div className="mt-3 grid grid-cols-7 gap-1.5">
						{([1, 2, 3, 4, 5, 6, 0] as Weekday[]).map((day) => {
							const list = periodsByDay(day);
							return (
								<div
									key={day}
									className={`rounded-md border bg-background/40 px-2 py-1.5 text-center ${
										list.length === 0 ? "opacity-50" : ""
									}`}
								>
									<p className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
										{DAY_LABELS[day]}
									</p>
									{list.length === 0 ? (
										<p className="mt-0.5 text-[10px] text-muted-foreground">Closed</p>
									) : (
										list.map((p, i) => (
											<p key={i} className="mt-0.5 text-[10px] tabular-nums">
												{minutesToTime(p.start_minute)}–{minutesToTime(p.end_minute)}
											</p>
										))
									)}
								</div>
							);
						})}
					</div>

					<div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
						<Calendar className="size-3" />
						<span>Holidays ({calendar.holidays.length})</span>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							onClick={() => setHolidayOpen(true)}
							className="h-5 gap-1 rounded-md px-1.5 text-[10px]"
						>
							<Plus className="size-3" /> Add
						</Button>
					</div>
					{upcomingHolidays.length > 0 && (
						<ul className="mt-1.5 flex flex-wrap gap-1">
							{upcomingHolidays.map((h) => (
								<li key={h.id}>
									<Badge variant="outline" className="gap-1 text-[10px] font-normal">
										<span className="tabular-nums">{h.date}</span>
										<span className="text-muted-foreground">·</span>
										<span className="truncate max-w-[120px]">{h.name}</span>
										{h.kind === "open" && h.start_minute != null && h.end_minute != null && (
											<span className="text-muted-foreground">
												{minutesToTime(h.start_minute)}–{minutesToTime(h.end_minute)}
											</span>
										)}
										<button
											type="button"
											onClick={() =>
												deleteHoliday.mutate(h.id, {
													onSuccess: () => toast.success("Holiday removed"),
													onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
												})
											}
											className="ml-0.5 text-muted-foreground hover:text-destructive"
										>
											<X className="size-3" />
										</button>
									</Badge>
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="flex shrink-0 items-center gap-1">
					<Button variant="ghost" size="icon" onClick={onEdit} className="size-8">
						<Pencil className="size-3.5" />
					</Button>
					<Button variant="ghost" size="icon" onClick={onDelete} className="size-8 text-destructive">
						<Trash2 className="size-3.5" />
					</Button>
				</div>
			</div>

			{holidayOpen && (
				<HolidayFormModal
					open
					onOpenChange={(o) => !o && setHolidayOpen(false)}
					onSubmit={(input) => {
						createHoliday.mutate(input, {
							onSuccess: () => {
								toast.success("Holiday added");
								setHolidayOpen(false);
							},
							onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to add"),
						});
					}}
				/>
			)}
		</li>
	);
}

function CreateWrapper({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
	const createMutation = useCreateBusinessHoursMutation(workspaceId);
	const handleSubmit = (v: BusinessHoursFormValues) => {
		createMutation.mutate(
			{
				workspace_id: workspaceId,
				name: v.name.trim(),
				description: v.description.trim() || null,
				timezone: v.timezone,
				is_default: v.is_default,
				enabled: v.enabled,
				periods: v.periods,
			},
			{
				onSuccess: () => {
					toast.success("Calendar created");
					onClose();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to create"),
			},
		);
	};
	return <BusinessHoursFormModal open onOpenChange={(o) => !o && onClose()} calendar={null} onSubmit={handleSubmit} />;
}

function EditWrapper({
	calendar,
	workspaceId,
	onClose,
}: {
	calendar: BusinessHours;
	workspaceId: string;
	onClose: () => void;
}) {
	const updateMutation = useUpdateBusinessHoursMutation(calendar.id, workspaceId);
	const handleSubmit = (v: BusinessHoursFormValues) => {
		updateMutation.mutate(
			{
				name: v.name.trim(),
				description: v.description.trim() || null,
				timezone: v.timezone,
				is_default: v.is_default,
				enabled: v.enabled,
				periods: v.periods,
			},
			{
				onSuccess: () => {
					toast.success("Calendar updated");
					onClose();
				},
				onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
			},
		);
	};
	return <BusinessHoursFormModal open onOpenChange={(o) => !o && onClose()} calendar={calendar} onSubmit={handleSubmit} />;
}
