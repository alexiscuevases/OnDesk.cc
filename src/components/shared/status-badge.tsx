import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TicketStatus } from "@/lib/data";

const statusStyles: Record<TicketStatus, string> = {
	open: "border-chart-1 text-chart-1 bg-chart-1/10",
	"in-progress": "border-warning text-warning bg-warning/10",
	resolved: "border-accent text-accent bg-accent/10",
	closed: "border-muted-foreground text-muted-foreground bg-muted",
};

function StatusIcon({ status }: { status: TicketStatus }) {
	switch (status) {
		case "open":
			return <AlertCircle className="size-3.5 text-chart-1" />;
		case "in-progress":
			return <Clock className="size-3.5 text-warning" />;
		case "resolved":
			return <CheckCircle2 className="size-3.5 text-accent" />;
		case "closed":
			return <CheckCircle2 className="size-3.5 text-muted-foreground" />;
	}
}

interface StatusBadgeProps {
	status: TicketStatus;
	showIcon?: boolean;
	size?: "sm" | "md";
	className?: string;
}

export function StatusBadge({ status, showIcon = false, size = "sm", className }: StatusBadgeProps) {
	const sizeClass = size === "md" ? "px-2.5 py-0.5 text-[11px] font-medium" : "px-2 text-[10px]";
	return (
		<Badge variant="outline" className={`rounded-full ${sizeClass} ${statusStyles[status]} ${className ?? ""}`}>
			{showIcon && <StatusIcon status={status} />}
			<span className={showIcon ? "ml-1.5 capitalize" : "capitalize"}>{status.replace("-", " ")}</span>
		</Badge>
	);
}
