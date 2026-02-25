import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Monitor, Smartphone } from "lucide-react";

const activeSessions = [
	{ id: "1", device: "Chrome on macOS", location: "Buenos Aires, AR", current: true, icon: Monitor },
	{ id: "2", device: "Safari on iPhone", location: "Buenos Aires, AR", current: false, icon: Smartphone },
];

export function ProfileSecuritySection() {
	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Two-Factor Authentication</CardTitle>
					<CardDescription className="text-xs">Add an extra layer of security to your account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Enable 2FA</Label>
							<p className="text-[10px] text-muted-foreground">Require a code each time you sign in</p>
						</div>
						<Switch />
					</div>
					<Separator />
					<div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
						<ShieldCheck className="size-4 text-muted-foreground shrink-0" />
						<p className="text-[11px] text-muted-foreground">
							We recommend enabling 2FA for all accounts that handle customer data.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Active Sessions</CardTitle>
					<CardDescription className="text-xs">Devices currently signed in to your account</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{activeSessions.map((session, i) => {
						const Icon = session.icon;
						return (
							<div key={session.id}>
								{i > 0 && <Separator className="mb-4" />}
								<div className="flex items-center gap-3">
									<div className="flex size-8 items-center justify-center rounded-lg bg-secondary shrink-0">
										<Icon className="size-4 text-muted-foreground" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-medium truncate">{session.device}</p>
										<p className="text-[10px] text-muted-foreground">{session.location}</p>
									</div>
									{session.current ? (
										<Badge variant="secondary" className="text-[10px] shrink-0">Current</Badge>
									) : (
										<Button variant="ghost" size="sm" className="h-6 text-[10px] text-destructive hover:text-destructive shrink-0">
											Revoke
										</Button>
									)}
								</div>
							</div>
						);
					})}
					<Separator />
					<div className="flex justify-end">
						<Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive">
							Sign out all other sessions
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
