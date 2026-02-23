import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export function SecuritySection() {
	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Security Settings</CardTitle>
					<CardDescription className="text-xs">Authentication and access control</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Require 2FA</Label>
							<p className="text-[10px] text-muted-foreground">Enforce two-factor authentication for all agents</p>
						</div>
						<Switch />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Session Timeout</Label>
							<p className="text-[10px] text-muted-foreground">Auto-logout after period of inactivity</p>
						</div>
						<Switch defaultChecked />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
