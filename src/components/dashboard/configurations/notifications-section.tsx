import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function NotificationsSection() {
	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
					<CardDescription className="text-xs">Manage how and when you receive alerts</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">New Ticket Assignment</Label>
							<p className="text-[10px] text-muted-foreground">Get notified when a ticket is assigned to you</p>
						</div>
						<Switch defaultChecked />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Customer Replies</Label>
							<p className="text-[10px] text-muted-foreground">Notifications for customer responses</p>
						</div>
						<Switch defaultChecked />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">SLA Warnings</Label>
							<p className="text-[10px] text-muted-foreground">Alert when tickets approach SLA deadline</p>
						</div>
						<Switch defaultChecked />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
