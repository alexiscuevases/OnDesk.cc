import { useMemo, useState } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotifications } from "@/context/notifications-context";
import {
	NotificationIcon,
	TICKET_NOTIFICATION_TYPES,
	formatRelativeTime,
} from "./notification-icon";
import type { Notification } from "../api/notifications-api";

type Filter = "all" | "unread";

function isToday(timestamp: number): boolean {
	const d = new Date(timestamp * 1000);
	const now = new Date();
	return (
		d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth() &&
		d.getDate() === now.getDate()
	);
}

export function NotificationsView() {
	const { notifications, unreadCount, isLoading, markAllRead, dismissNotification, markAsRead } =
		useNotifications();
	const navigate = useNavigate();
	const { slug } = useParams({ strict: false }) as { slug: string };
	const [filter, setFilter] = useState<Filter>("all");

	const visible = useMemo(
		() => (filter === "unread" ? notifications.filter((n) => !n.read) : notifications),
		[notifications, filter],
	);

	const { today, earlier } = useMemo(() => {
		const today: Notification[] = [];
		const earlier: Notification[] = [];
		for (const n of visible) {
			if (isToday(n.created_at)) today.push(n);
			else earlier.push(n);
		}
		return { today, earlier };
	}, [visible]);

	function handleClick(notif: Notification) {
		markAsRead(notif.id);
		if (notif.resource_id && TICKET_NOTIFICATION_TYPES.includes(notif.type)) {
			navigate({ to: "/w/$slug/tickets/$id", params: { slug, id: notif.resource_id } });
		}
	}

	return (
		<div className="flex flex-col gap-6 max-w-3xl">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Stay on top of ticket activity, assignments, and SLA alerts
					</p>
				</div>
				{unreadCount > 0 && (
					<Button variant="outline" size="sm" onClick={markAllRead} className="shrink-0">
						<CheckCheck className="size-4" />
						Mark all read
					</Button>
				)}
			</div>

			<Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
				<TabsList>
					<TabsTrigger value="all">
						All
						<Badge variant="secondary" className="ml-1.5 h-5 rounded-full px-1.5 text-[10px]">
							{notifications.length}
						</Badge>
					</TabsTrigger>
					<TabsTrigger value="unread">
						Unread
						{unreadCount > 0 && (
							<Badge variant="secondary" className="ml-1.5 h-5 rounded-full px-1.5 text-[10px]">
								{unreadCount}
							</Badge>
						)}
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{isLoading ? (
				<div className="flex items-center justify-center py-20 text-muted-foreground">
					<p className="text-sm">Loading…</p>
				</div>
			) : visible.length === 0 ? (
				<div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg">
					<Bell className="size-10 mb-3 opacity-20" />
					<p className="text-sm font-medium">
						{filter === "unread" ? "No unread notifications" : "No notifications yet"}
					</p>
					<p className="text-xs mt-1">
						{filter === "unread"
							? "You're all caught up"
							: "Activity from your workspace will show up here"}
					</p>
				</div>
			) : (
				<div className="flex flex-col gap-6">
					{today.length > 0 && (
						<NotificationGroup
							label="Today"
							items={today}
							onClick={handleClick}
							onDismiss={dismissNotification}
						/>
					)}
					{earlier.length > 0 && (
						<NotificationGroup
							label="Earlier"
							items={earlier}
							onClick={handleClick}
							onDismiss={dismissNotification}
						/>
					)}
				</div>
			)}
		</div>
	);
}

function NotificationGroup({
	label,
	items,
	onClick,
	onDismiss,
}: {
	label: string;
	items: Notification[];
	onClick: (n: Notification) => void;
	onDismiss: (id: string) => void;
}) {
	return (
		<section className="flex flex-col gap-2">
			<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">
				{label}
			</h2>
			<div className="border rounded-lg divide-y bg-card">
				{items.map((notif) => {
					const clickable = !!notif.resource_id && TICKET_NOTIFICATION_TYPES.includes(notif.type);
					return (
						<div
							key={notif.id}
							className={`flex items-start gap-4 px-4 py-4 transition-colors hover:bg-secondary/40 ${
								!notif.read ? "bg-primary/5" : ""
							} ${clickable ? "cursor-pointer" : "cursor-default"}`}
							onClick={() => onClick(notif)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") onClick(notif);
							}}>
							<NotificationIcon type={notif.type} size="md" />
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<p
										className={`text-sm font-medium ${
											!notif.read ? "text-foreground" : "text-muted-foreground"
										}`}>
										{notif.title}
									</p>
									{!notif.read && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
								</div>
								<p className="text-xs text-muted-foreground leading-relaxed mt-1">
									{notif.description}
								</p>
								<p className="text-[11px] text-muted-foreground/60 mt-2">
									{formatRelativeTime(notif.created_at)}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon"
								className="size-7 rounded-md shrink-0 text-muted-foreground/40 hover:text-destructive"
								onClick={(e) => {
									e.stopPropagation();
									onDismiss(notif.id);
								}}>
								<X className="size-3.5" />
								<span className="sr-only">Dismiss notification</span>
							</Button>
						</div>
					);
				})}
			</div>
		</section>
	);
}
