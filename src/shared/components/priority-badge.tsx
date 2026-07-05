import { Badge } from "@/components/ui/badge";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

const badgeStyles: Record<TicketPriority, string> = {
	urgent: "bg-destructive/10 text-destructive border-destructive/25",
	high: "bg-warning/10 text-warning border-warning/25",
	medium: "bg-primary/8 text-primary border-primary/25",
	low: "bg-secondary text-secondary-foreground border-border",
};

const dotColors: Record<TicketPriority, string> = {
	urgent: "bg-destructive",
	high: "bg-warning",
	medium: "bg-primary",
	low: "bg-muted-foreground",
};

interface PriorityBadgeProps {
	priority: TicketPriority;
	variant?: "badge" | "indicator";
	className?: string;
}

export function PriorityBadge({ priority, variant = "badge", className }: PriorityBadgeProps) {
	if (variant === "indicator") {
		return (
			<div className={`flex items-center gap-2 ${className ?? ""}`}>
				<div className={`size-2 rounded-full ${dotColors[priority]}`} />
				<span className="font-mono text-xs uppercase tracking-[0.08em]">{priority}</span>
			</div>
		);
	}

	return <Badge className={`text-[9px] px-1.5 border ${badgeStyles[priority]} ${className ?? ""}`}>{priority}</Badge>;
}
