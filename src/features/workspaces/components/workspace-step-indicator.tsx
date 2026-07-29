import { Check } from "lucide-react";

function Step({ index, label, step }: { index: 1 | 2; label: string; step: 1 | 2 }) {
	return (
		<div className="flex items-center gap-2 shrink-0">
			<span
				className={`size-6 flex items-center justify-center font-mono text-[11px] font-bold transition-colors ${
					step >= index
						? "bg-primary text-primary-foreground"
						: "border border-border bg-muted text-muted-foreground"
				}`}>
				{step > index ? <Check className="size-3" /> : index}
			</span>
			<span className={step === index ? "font-semibold text-foreground" : "text-muted-foreground"}>
				{label}
			</span>
		</div>
	);
}

export function StepIndicator({ step, className = "" }: { step: 1 | 2; className?: string }) {
	return (
		<div
			className={`flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.15em] ${className}`}>
			<Step index={1} label="Details" step={step} />
			<div className="flex-1 h-px bg-border" />
			<Step index={2} label="Plan" step={step} />
		</div>
	);
}
