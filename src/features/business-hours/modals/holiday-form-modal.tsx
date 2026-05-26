import { useState } from "react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { HolidayKind, CreateHolidayInput } from "../api/business-hours-api";

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (input: CreateHolidayInput) => void;
}

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

export function HolidayFormModal({ open, onOpenChange, onSubmit }: Props) {
	const today = new Date().toISOString().slice(0, 10);
	const [date, setDate] = useState<string>(today);
	const [name, setName] = useState<string>("");
	const [kind, setKind] = useState<HolidayKind>("closed");
	const [startMin, setStartMin] = useState<number>(9 * 60);
	const [endMin, setEndMin] = useState<number>(13 * 60);

	const valid =
		/^\d{4}-\d{2}-\d{2}$/.test(date) &&
		name.trim().length > 0 &&
		(kind === "closed" || endMin > startMin);

	const handleSubmit = () => {
		if (!valid) return;
		onSubmit({
			date,
			name: name.trim(),
			kind,
			start_minute: kind === "open" ? startMin : null,
			end_minute: kind === "open" ? endMin : null,
		});
	};

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title="Add holiday"
			description="One-off exception that overrides the weekly schedule for a date."
			maxWidth="sm:max-w-md"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					handleSubmit();
				}}
			>
				<div className="grid gap-3 py-4">
					<div className="grid grid-cols-2 gap-3">
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Date</Label>
							<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 rounded-lg text-xs" />
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Kind</Label>
							<Select value={kind} onValueChange={(val) => setKind(val as HolidayKind)}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="closed" className="text-xs">Closed all day</SelectItem>
									<SelectItem value="open" className="text-xs">Open with custom hours</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid gap-2">
						<Label className="text-xs font-medium">Name</Label>
						<Input
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-9 rounded-lg text-xs"
							placeholder="e.g. Christmas, Independence Day"
						/>
					</div>

					{kind === "open" && (
						<div className="grid grid-cols-2 gap-3">
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Open from</Label>
								<Input
									type="time"
									value={minutesToTime(startMin)}
									onChange={(e) => {
										const m = timeToMinutes(e.target.value);
										if (m !== null) setStartMin(m);
									}}
									className="h-9 rounded-lg text-xs"
								/>
							</div>
							<div className="grid gap-2">
								<Label className="text-xs font-medium">Open until</Label>
								<Input
									type="time"
									value={minutesToTime(endMin)}
									onChange={(e) => {
										const m = timeToMinutes(e.target.value);
										if (m !== null) setEndMin(m);
									}}
									className="h-9 rounded-lg text-xs"
								/>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button type="submit" disabled={!valid} className="rounded-lg text-xs font-semibold">
						Add holiday
					</Button>
				</DialogFooter>
			</form>
		</FormModal>
	);
}
