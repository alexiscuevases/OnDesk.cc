import { Bot } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { Ticket } from "@/features/tickets/api/tickets-api";

interface TicketAiStatusBadgeProps {
	ticket: Pick<Ticket, "ai_agent_id" | "ai_agent_name" | "ai_escalated">;
	className?: string;
}

export function TicketAiStatusBadge({ ticket, className }: TicketAiStatusBadgeProps) {
	if (!ticket.ai_agent_id) {
		return (
			<Badge
				variant="outline"
				className={`gap-1 rounded-full border-border/70 text-muted-foreground ${className ?? ""}`.trim()}>
				<Bot className="size-3" />
				No AI
			</Badge>
		);
	}

	if (ticket.ai_escalated) {
		return (
			<Badge
				variant="destructive"
				title={ticket.ai_agent_name ?? "AI Agent"}
				className={`gap-1 rounded-full ${className ?? ""}`.trim()}>
				<Bot className="size-3" />
				Escalated
			</Badge>
		);
	}

	return (
		<Badge
			variant="default"
			title={ticket.ai_agent_name ?? "AI Agent"}
			className={`gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary/10 ${className ?? ""}`.trim()}>
			<Bot className="size-3" />
			Active
		</Badge>
	);
}
