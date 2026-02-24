import { Badge } from "@/components/ui/badge";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

const badgeStyles: Record<TicketPriority, string> = {
	urgent: "bg-destructive/15 text-destructive border border-destructive/20",
	high: "bg-warning/15 text-warning border border-warning/20",
	medium: "bg-primary/15 text-primary border border-primary/20",
	low: "bg-secondary text-secondary-foreground border border-border",
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
				<span className="text-sm capitalize font-medium">{priority}</span>
			</div>
		);
	}

	return (
		<Badge className={`text-[10px] rounded-full px-2 ${badgeStyles[priority]} ${className ?? ""}`}>{priority}</Badge>
	);
}
