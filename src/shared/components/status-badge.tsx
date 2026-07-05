import { Badge } from "@/components/ui/badge";

export type TicketStatus = "open" | "pending" | "resolved" | "closed";

const statusStyles: Record<TicketStatus, string> = {
	open: "border-info/30 text-info bg-info/8",
	pending: "border-warning/30 text-warning bg-warning/8",
	resolved: "border-success/30 text-success bg-success/8",
	closed: "border-border text-muted-foreground bg-muted",
};

const dotStyles: Record<TicketStatus, string> = {
	open: "bg-info",
	pending: "bg-warning",
	resolved: "bg-success",
	closed: "bg-muted-foreground",
};

interface StatusBadgeProps {
	status: TicketStatus;
	showIcon?: boolean;
	size?: "sm" | "md";
	className?: string;
}

export function StatusBadge({ status, showIcon = false, size = "sm", className }: StatusBadgeProps) {
	const sizeClass = size === "md" ? "px-2 py-0.5 text-[10px]" : "px-1.5 text-[9px]";
	return (
		<Badge variant="outline" className={`${sizeClass} ${statusStyles[status]} ${className ?? ""}`}>
			{showIcon && <span className={`size-1.5 rounded-full ${dotStyles[status]}`} />}
			<span>{status.replace("-", " ")}</span>
		</Badge>
	);
}
