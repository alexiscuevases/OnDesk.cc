import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const emailPrefs = [
	{ id: "assignment", label: "Ticket Assigned to Me", description: "Email when a ticket is assigned to you" },
	{ id: "customer-reply", label: "Customer Replies", description: "Email when a customer responds to your ticket" },
	{ id: "mention", label: "Mentions", description: "Email when someone mentions you in a note" },
	{ id: "sla-breach", label: "SLA Warnings", description: "Email when a ticket is approaching its SLA deadline" },
] as const;

const pushPrefs = [
	{ id: "push-assignment", label: "New Assignments", description: "Browser notification on new ticket assignment" },
	{ id: "push-mention", label: "Mentions", description: "Browser notification when mentioned" },
	{ id: "push-reply", label: "Customer Replies", description: "Browser notification on customer reply" },
] as const;

type EmailId = (typeof emailPrefs)[number]["id"];
type PushId = (typeof pushPrefs)[number]["id"];

export function ProfileNotificationsSection() {
	const [email, setEmail] = useState<Record<EmailId, boolean>>({
		assignment: true,
		"customer-reply": true,
		mention: true,
		"sla-breach": false,
	});
	const [push, setPush] = useState<Record<PushId, boolean>>({
		"push-assignment": true,
		"push-mention": true,
		"push-reply": false,
	});

	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Email Notifications</CardTitle>
					<CardDescription className="text-xs">Choose which events trigger an email to you</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
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
									checked={email[pref.id]}
									onCheckedChange={(checked) => setEmail((p) => ({ ...p, [pref.id]: checked }))}
								/>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Push Notifications</CardTitle>
					<CardDescription className="text-xs">In-browser alerts while you work</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{pushPrefs.map((pref, i) => (
						<div key={pref.id}>
							{i > 0 && <Separator className="mb-4" />}
							<div className="flex items-center justify-between">
								<div>
									<Label htmlFor={pref.id} className="text-xs">{pref.label}</Label>
									<p className="text-[10px] text-muted-foreground">{pref.description}</p>
								</div>
								<Switch
									id={pref.id}
									checked={push[pref.id]}
									onCheckedChange={(checked) => setPush((p) => ({ ...p, [pref.id]: checked }))}
								/>
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
