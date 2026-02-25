import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function SecuritySection() {
	const [require2FA, setRequire2FA] = useState(false);
	const [sessionTimeout, setSessionTimeout] = useState(true);
	const [ipRestriction, setIpRestriction] = useState(false);
	const [auditLog, setAuditLog] = useState(true);
	const [passwordPolicy, setPasswordPolicy] = useState(false);
	const [timeoutDuration, setTimeoutDuration] = useState("30");

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Authentication</CardTitle>
					<CardDescription className="text-xs">Control how all agents sign in to the workspace</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Require Two-Factor Authentication</Label>
							<p className="text-[10px] text-muted-foreground">Enforce 2FA for every agent in this workspace</p>
						</div>
						<Switch checked={require2FA} onCheckedChange={setRequire2FA} />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Strong Password Policy</Label>
							<p className="text-[10px] text-muted-foreground">Require minimum 12 characters, mixed case and symbols</p>
						</div>
						<Switch checked={passwordPolicy} onCheckedChange={setPasswordPolicy} />
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Session Management</CardTitle>
					<CardDescription className="text-xs">Control agent session duration and inactivity rules</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Auto-Logout on Inactivity</Label>
							<p className="text-[10px] text-muted-foreground">Automatically sign out agents after a period of inactivity</p>
						</div>
						<Switch checked={sessionTimeout} onCheckedChange={setSessionTimeout} />
					</div>
					{sessionTimeout && (
						<>
							<Separator />
							<div className="flex items-center justify-between">
								<div>
									<Label className="text-xs">Timeout Duration</Label>
									<p className="text-[10px] text-muted-foreground">How long before an idle session is ended</p>
								</div>
								<Select value={timeoutDuration} onValueChange={setTimeoutDuration}>
									<SelectTrigger className="h-7 text-xs w-32">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="15">15 minutes</SelectItem>
										<SelectItem value="30">30 minutes</SelectItem>
										<SelectItem value="60">1 hour</SelectItem>
										<SelectItem value="240">4 hours</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Access Controls</CardTitle>
					<CardDescription className="text-xs">Restrict and audit workspace access</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">IP Allowlist</Label>
							<p className="text-[10px] text-muted-foreground">Restrict access to approved IP ranges only</p>
						</div>
						<Switch checked={ipRestriction} onCheckedChange={setIpRestriction} />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Audit Log</Label>
							<p className="text-[10px] text-muted-foreground">Record agent sign-ins, changes, and sensitive actions</p>
						</div>
						<Switch checked={auditLog} onCheckedChange={setAuditLog} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
