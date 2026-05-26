import { useState } from "react";
import { FormModal } from "@/shared/components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter } from "@/components/ui/dialog";
import type { KbCategory } from "../api/kb-api";

export interface KbCategoryFormValues {
	name: string;
	description: string;
	display_order: number;
}

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	category?: KbCategory | null;
	onSubmit: (v: KbCategoryFormValues) => void;
}

function defaults(c?: KbCategory | null): KbCategoryFormValues {
	return {
		name: c?.name ?? "",
		description: c?.description ?? "",
		display_order: c?.display_order ?? 0,
	};
}

export function KbCategoryFormModal({ open, onOpenChange, category, onSubmit }: Props) {
	const [v, setV] = useState<KbCategoryFormValues>(() => defaults(category));

	const valid = v.name.trim().length > 0;

	return (
		<FormModal
			open={open}
			onOpenChange={onOpenChange}
			title={category ? "Edit category" : "New category"}
			description="Organize KB articles into navigable groups."
		>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					if (valid) onSubmit(v);
				}}
			>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Name</Label>
						<Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className="h-9 rounded-lg" />
					</div>
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Description</Label>
						<Textarea
							value={v.description}
							onChange={(e) => setV({ ...v, description: e.target.value })}
							className="min-h-[50px] rounded-lg text-xs"
						/>
					</div>
					<div className="grid gap-2">
						<Label className="text-xs font-medium">Display order</Label>
						<Input
							type="number"
							value={v.display_order}
							onChange={(e) => setV({ ...v, display_order: Number(e.target.value) || 0 })}
							className="h-9 w-24 rounded-lg"
						/>
					</div>
				</div>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg text-xs">
						Cancel
					</Button>
					<Button type="submit" disabled={!valid} className="rounded-lg text-xs font-semibold">
						{category ? "Save" : "Create"}
					</Button>
				</DialogFooter>
			</form>
		</FormModal>
	);
}
