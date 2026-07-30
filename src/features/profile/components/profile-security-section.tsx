import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, Monitor, Smartphone, ExternalLink, KeyRound } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const ONDESK_URL = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";

const activeSessions = [
	{ id: "1", device: "Chrome on macOS", location: "Buenos Aires, AR", current: true, icon: Monitor },
	{ id: "2", device: "Safari on iPhone", location: "Buenos Aires, AR", current: false, icon: Smartphone },
];

/**
 * Account security is an OnDesk concern: the password, two-factor and the
 * connected Google/Microsoft identities are shared across every product, so
 * Pulse links out rather than keeping a second, divergent copy of the controls.
 */
export function ProfileSecuritySection() {
	const { user } = useAuth();

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ShieldCheck className="size-4" />
						Account security
					</CardTitle>
					<CardDescription>
						Your password, two-factor authentication and connected accounts are managed on your
						OnDesk account and apply everywhere you sign in.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div className="text-sm">
						<p className="text-muted-foreground text-xs">Signed in as</p>
						<p className="font-medium">{user?.email}</p>
					</div>
					<Separator />
					<div className="flex flex-wrap gap-2">
						<Button asChild variant="outline">
							<a href={`${ONDESK_URL}/account/security`} target="_blank" rel="noreferrer">
								<KeyRound className="size-3.5" />
								Manage on OnDesk
								<ExternalLink className="size-3.5" />
							</a>
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active sessions</CardTitle>
					<CardDescription>Devices currently signed in to Pulse.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{activeSessions.map((session) => (
						<div key={session.id} className="flex items-center gap-3">
							<session.icon className="text-muted-foreground size-4" />
							<div className="flex-1">
								<p className="text-sm font-medium">{session.device}</p>
								<p className="text-muted-foreground text-xs">{session.location}</p>
							</div>
							{session.current && <Badge variant="secondary">This device</Badge>}
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}

export default ProfileSecuritySection;
