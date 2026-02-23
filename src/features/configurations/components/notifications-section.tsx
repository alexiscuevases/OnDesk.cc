import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const notificationPrefs = [
	{ id: "new-assignment", label: "New Ticket Assignment", description: "Get notified when a ticket is assigned to you" },
	{ id: "customer-replies", label: "Customer Replies", description: "Notifications for customer responses" },
	{ id: "sla-warnings", label: "SLA Warnings", description: "Alert when tickets approach SLA deadline" },
	{ id: "ticket-resolved", label: "Ticket Resolved", description: "Get notified when your tickets are resolved" },
	{ id: "mentions", label: "Mentions", description: "Notifications when you are mentioned in a ticket" },
] as const;

type NotifId = (typeof notificationPrefs)[number]["id"];

const defaultPrefs: Record<NotifId, boolean> = {
	"new-assignment": true,
	"customer-replies": true,
	"sla-warnings": true,
	"ticket-resolved": false,
	"mentions": true,
};

export function NotificationsSection() {
	const [prefs, setPrefs] = useState<Record<NotifId, boolean>>(defaultPrefs);

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
					<CardDescription className="text-xs">Manage how and when you receive alerts</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{notificationPrefs.map((pref, i) => (
						<div key={pref.id}>
							{i > 0 && <Separator className="mb-4" />}
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor={pref.id} className="text-xs">
										{pref.label}
									</Label>
									<p className="text-[10px] text-muted-foreground">{pref.description}</p>
								</div>
								<Switch
									id={pref.id}
									checked={prefs[pref.id]}
									onCheckedChange={(checked) => setPrefs((p) => ({ ...p, [pref.id]: checked }))}
								/>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
