import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AtSign, ExternalLink, KeyRound, TriangleAlert } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const ONDESK_URL = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";

/**
 * The identity half of the profile: email, password and account deletion.
 *
 * None of it belongs to Pulse. One OnDesk account signs into every product, so
 * changing an email here would either desync from ondesk or silently do nothing
 * — this screen previously offered all three as forms that were never wired to
 * anything. It links out instead.
 */
export function AccountSection() {
	const { user } = useAuth();

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle className="console-label text-primary dark:text-accent flex items-center gap-2">
						<AtSign className="size-3.5" />
						Email Address
					</CardTitle>
					<CardDescription className="text-xs">
						Your sign-in address across every OnDesk product, and where Pulse sends notifications.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-muted-foreground text-[10px]">Signed in as</p>
						<p className="font-mono text-xs font-medium">{user?.email}</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="console-label text-primary dark:text-accent flex items-center gap-2">
						<KeyRound className="size-3.5" />
						Password & Identity
					</CardTitle>
					<CardDescription className="text-xs">
						Your password, two-factor authentication and connected Google/Microsoft accounts live on
						OnDesk and apply everywhere you sign in.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
						<a href={`${ONDESK_URL}/account/security`} target="_blank" rel="noreferrer">
							Manage on OnDesk
							<ExternalLink className="size-3" />
						</a>
					</Button>
				</CardContent>
			</Card>

			<Card className="border-destructive/40">
				<CardHeader>
					<CardTitle className="console-label text-destructive flex items-center gap-2">
						<TriangleAlert className="size-3.5" />
						Danger Zone
					</CardTitle>
					<CardDescription className="text-xs">Irreversible actions for your account</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-xs font-medium">Delete account</p>
							<p className="text-muted-foreground text-[10px]">
								Closing your OnDesk account removes you from every product, not just Pulse.
							</p>
						</div>
						<Button asChild variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
							<a href={`${ONDESK_URL}/account/security`} target="_blank" rel="noreferrer">
								Manage on OnDesk
								<ExternalLink className="size-3" />
							</a>
						</Button>
					</div>
					<Separator className="my-4" />
					<p className="text-muted-foreground text-[10px] leading-relaxed">
						To leave a single workspace without closing your account, remove yourself from it on OnDesk.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

export default AccountSection;
