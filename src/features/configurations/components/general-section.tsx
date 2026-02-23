"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function GeneralSection() {
	const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else if (theme === "light") {
			root.classList.remove("dark");
		} else {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			if (prefersDark) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		}
	}, [theme]);

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Workspace Settings</CardTitle>
					<CardDescription className="text-xs">Basic workspace configuration</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="workspace-name" className="text-xs">
							Workspace Name
						</Label>
						<Input id="workspace-name" defaultValue="SupportDesk 365" className="h-9 rounded-lg" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="workspace-url" className="text-xs">
							Workspace URL
						</Label>
						<Input id="workspace-url" defaultValue="supportdesk-365.microsoft.com" className="h-9 rounded-lg" />
					</div>
					<div className="space-y-2">
						<Label className="text-xs">Timezone</Label>
						<Select defaultValue="utc-5">
							<SelectTrigger className="h-9 rounded-lg text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
								<SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
								<SelectItem value="utc">UTC</SelectItem>
								<SelectItem value="utc+1">CET (UTC+1)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Appearance</CardTitle>
					<CardDescription className="text-xs">Customize the look and feel</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label className="text-xs">Theme</Label>
						<div className="grid grid-cols-3 gap-2">
							{[
								{ value: "light" as const, label: "Light", icon: Sun },
								{ value: "dark" as const, label: "Dark", icon: Moon },
								{ value: "system" as const, label: "System", icon: Monitor },
							].map((opt) => {
								const Icon = opt.icon;
								const isActive = theme === opt.value;
								return (
									<button
										key={opt.value}
										onClick={() => setTheme(opt.value)}
										className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
											isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-secondary/50"
										}`}>
										<Icon className={`size-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
										<span className={`text-[11px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{opt.label}</span>
									</button>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
