import { Bell, Clock, UserPlus, CheckCircle2, AlertCircle, MessageSquare, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/context/notifications-context";
import type { Notification } from "@/features/notifications/api/notifications-api";

function formatRelativeTime(timestamp: number): string {
	const diffMs = Date.now() - timestamp * 1000;
	const diffMins = Math.floor(diffMs / 60_000);
	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	const diffHours = Math.floor(diffMins / 60);
	if (diffHours < 24) return `${diffHours}h ago`;
	const diffDays = Math.floor(diffHours / 24);
	return `${diffDays}d ago`;
}

function NotificationIcon({ type }: { type: Notification["type"] }) {
	switch (type) {
		case "sla":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-warning/15">
					<Clock className="size-4 text-warning" />
				</div>
			);
		case "assign":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
					<UserPlus className="size-4 text-primary" />
				</div>
			);
		case "resolved":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-accent/15">
					<CheckCircle2 className="size-4 text-accent" />
				</div>
			);
		case "message":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/10">
					<MessageSquare className="size-4 text-chart-2" />
				</div>
			);
		case "ticket":
		default:
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-chart-1/10">
					<AlertCircle className="size-4 text-chart-1" />
				</div>
			);
	}
}

export function NotificationsPanel() {
	const { notifications, unreadCount, isLoading, markAllRead, dismissNotification, markAsRead } =
		useNotifications();

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative size-8 rounded-lg">
					<Bell className="size-4" />
					{unreadCount > 0 && (
						<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
							{unreadCount}
						</span>
					)}
					<span className="sr-only">Notifications</span>
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
				<div className="flex items-center justify-between px-4 py-3 border-b">
					<div className="flex items-center gap-2">
						<h3 className="text-sm font-semibold">Notifications</h3>
						{unreadCount > 0 && (
							<Badge variant="secondary" className="text-[10px] rounded-full px-1.5 h-5">
								{unreadCount} new
							</Badge>
						)}
					</div>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="text-[11px] h-7 text-primary hover:text-primary/80"
							onClick={markAllRead}>
							Mark all read
						</Button>
					)}
				</div>
				<div className="max-h-80 overflow-y-auto">
					{isLoading ? (
						<div className="flex items-center justify-center py-10 text-muted-foreground">
							<p className="text-sm">Loading…</p>
						</div>
					) : notifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
							<Bell className="size-8 mb-2 opacity-20" />
							<p className="text-sm">No notifications</p>
						</div>
					) : (
						notifications.map((notif) => (
							<div
								key={notif.id}
								className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors cursor-pointer hover:bg-secondary/50 ${
									!notif.read ? "bg-primary/5" : ""
								}`}
								onClick={() => markAsRead(notif.id)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") markAsRead(notif.id);
								}}>
								<NotificationIcon type={notif.type} />
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p
											className={`text-xs font-medium truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
											{notif.title}
										</p>
										{!notif.read && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
									</div>
									<p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">
										{notif.description}
									</p>
									<p className="text-[10px] text-muted-foreground/60 mt-1">
										{formatRelativeTime(notif.created_at)}
									</p>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="size-6 rounded-md shrink-0 mt-0.5 text-muted-foreground/40 hover:text-destructive"
									onClick={(e) => {
										e.stopPropagation();
										dismissNotification(notif.id);
									}}>
									<X className="size-3" />
									<span className="sr-only">Dismiss notification</span>
								</Button>
							</div>
						))
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}
