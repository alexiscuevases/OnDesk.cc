import { Clock, UserPlus, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";
import type { Notification } from "../api/notifications-api";

export const TICKET_NOTIFICATION_TYPES: Notification["type"][] = [
	"ticket",
	"assign",
	"resolved",
	"message",
	"sla",
];

export function formatRelativeTime(timestamp: number): string {
	const diffMs = Date.now() - timestamp * 1000;
	const diffMins = Math.floor(diffMs / 60_000);
	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}d ago`;
}

export function NotificationIcon({ type, size = "sm" }: { type: Notification["type"]; size?: "sm" | "md" }) {
	const box = size === "md" ? "size-10" : "size-8";
	const icon = size === "md" ? "size-5" : "size-4";

	switch (type) {
		case "sla":
			return (
				<div className={`flex ${box} items-center justify-center rounded-lg bg-warning/15`}>
					<Clock className={`${icon} text-warning`} />
				</div>
			);
		case "assign":
			return (
				<div className={`flex ${box} items-center justify-center rounded-lg bg-primary/10`}>
					<UserPlus className={`${icon} text-primary`} />
				</div>
			);
		case "resolved":
			return (
				<div className={`flex ${box} items-center justify-center rounded-lg bg-accent/15`}>
					<CheckCircle2 className={`${icon} text-accent`} />
				</div>
			);
		case "message":
			return (
				<div className={`flex ${box} items-center justify-center rounded-lg bg-chart-2/10`}>
					<MessageSquare className={`${icon} text-chart-2`} />
				</div>
			);
		case "ticket":
		default:
			return (
				<div className={`flex ${box} items-center justify-center rounded-lg bg-chart-1/10`}>
					<AlertCircle className={`${icon} text-chart-1`} />
				</div>
			);
	}
}
