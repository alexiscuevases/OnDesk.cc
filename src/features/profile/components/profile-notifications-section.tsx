import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import { useNotificationPreferencesQuery } from "@/features/notifications/hooks/use-notification-queries";
import { useUpdateNotificationPreferences } from "@/features/notifications/hooks/use-notification-mutations";
import type { NotificationPrefKey, NotificationPreferences } from "@/features/notifications/api/notifications-api";

const emailPrefs: { id: NotificationPrefKey; label: string; description: string }[] = [
	{ id: "ticket_assigned_to_me", label: "Tickets Assigned to Me", description: "A ticket is assigned to you" },
	{ id: "ticket_assigned_to_team", label: "Tickets for My Teams", description: "A ticket lands on one of your teams or the shared inbox" },
	{ id: "reply_on_my_ticket", label: "Replies on My Tickets", description: "A customer or teammate replies on a ticket assigned to you" },
	{ id: "reply_on_team_ticket", label: "Replies on Team Tickets", description: "A reply arrives on a ticket assigned to one of your teams" },
	{ id: "mention", label: "Mentions", description: "Someone @mentions you in a reply or internal note" },
	{ id: "escalation", label: "AI Escalations", description: "An AI agent hands a ticket back for human review" },
	{ id: "sla_breach", label: "SLA Breaches", description: "A ticket you follow misses its SLA target" },
	{ id: "ticket_status", label: "Status & Priority Changes", description: "A ticket you follow is resolved, closed or re-prioritised" },
];

const pushPrefs = [
	{ id: "push-assignment", label: "New Assignments", description: "Browser notification on new ticket assignment" },
	{ id: "push-mention", label: "Mentions", description: "Browser notification when mentioned" },
	{ id: "push-reply", label: "Customer Replies", description: "Browser notification on customer reply" },
] as const;

export function ProfileNotificationsSection() {
	const { workspace } = useWorkspace();
	const { data: preferences, isLoading } = useNotificationPreferencesQuery(workspace.id);
	const updateMutation = useUpdateNotificationPreferences(workspace.id);

	const toggle = (key: keyof NotificationPreferences, value: boolean) => {
		updateMutation.mutate(
			{ [key]: value },
			{ onError: (err) => toast.error(err instanceof Error ? err.message : "Failed to save preference") },
		);
	};

	const emailEnabled = preferences?.email_enabled ?? false;
	const disabled = isLoading || !preferences;

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle className="console-label text-primary dark:text-accent">Email Notifications</CardTitle>
					<CardDescription className="text-xs">Choose which events trigger an email to you</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between border border-border bg-secondary/60 p-3">
						<div className="flex items-center gap-3">
							<Mail className="size-4 text-muted-foreground shrink-0" />
							<div>
								<Label htmlFor="email_enabled" className="text-xs">All email notifications</Label>
								<p className="text-[10px] text-muted-foreground">Master switch — turn off to silence every email below</p>
							</div>
						</div>
						<Switch
							id="email_enabled"
							checked={emailEnabled}
							disabled={disabled}
							onCheckedChange={(checked) => toggle("email_enabled", checked)}
						/>
					</div>

					{emailPrefs.map((pref, i) => (
						<div key={pref.id}>
							{i > 0 && <Separator className="mb-4" />}
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor={pref.id} className="text-xs">{pref.label}</Label>
									<p className="text-[10px] text-muted-foreground">{pref.description}</p>
								</div>
								<Switch
									id={pref.id}
									checked={preferences?.[pref.id] ?? false}
									disabled={disabled || !emailEnabled}
									onCheckedChange={(checked) => toggle(pref.id, checked)}
								/>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<CardTitle className="console-label text-primary dark:text-accent">Push Notifications</CardTitle>
						<Badge variant="secondary" className="text-[10px]">Coming soon</Badge>
					</div>
					<CardDescription className="text-xs">In-browser alerts while you work</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{pushPrefs.map((pref, i) => (
						<div key={pref.id}>
							{i > 0 && <Separator className="mb-4" />}
							<div className="flex items-center justify-between opacity-60">
								<div>
									<Label htmlFor={pref.id} className="text-xs">{pref.label}</Label>
									<p className="text-[10px] text-muted-foreground">{pref.description}</p>
								</div>
								<Switch id={pref.id} checked={false} disabled />
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
