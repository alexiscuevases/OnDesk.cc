"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/workspace-context";
import { useUpdateWorkspaceMutation } from "@/features/workspaces/hooks/use-workspace-mutations";
import { LogoUpload } from "@/shared/components";

export function GeneralSection() {
	const { workspace } = useWorkspace();
	const updateWorkspace = useUpdateWorkspaceMutation(workspace.slug);

	const [name, setName] = useState(workspace.name);
	const [description, setDescription] = useState(workspace.description ?? "");
	const [logoUrl, setLogoUrl] = useState(workspace.logo_url ?? "");
	const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

	useEffect(() => {
		setName(workspace.name);
		setDescription(workspace.description ?? "");
		setLogoUrl(workspace.logo_url ?? "");
	}, [workspace.name, workspace.description, workspace.logo_url]);

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else if (theme === "light") {
			root.classList.remove("dark");
		} else {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			if (prefersDark) root.classList.add("dark");
			else root.classList.remove("dark");
		}
	}, [theme]);

	function handleSave() {
		if (!name.trim()) return;
		updateWorkspace.mutate(
			{ name: name.trim(), description: description.trim() || undefined, logo_url: logoUrl || undefined },
			{
				onSuccess: () => toast.success("Workspace settings saved"),
				onError: (err) => toast.error(err.message),
			},
		);
	}

	const workspaceInitials = name
		? name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
		: "WS";

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Workspace Settings</CardTitle>
					<CardDescription className="text-xs">Basic workspace configuration</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<LogoUpload
						label="Workspace Logo"
						initials={workspaceInitials}
						currentUrl={logoUrl || null}
						folder="workspaces"
						onUpload={(url) => setLogoUrl(url)}
					/>
					<div className="space-y-2">
						<Label htmlFor="workspace-name" className="text-xs">
							Workspace Name
						</Label>
						<Input
							id="workspace-name"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="h-9 rounded-lg"
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="workspace-description" className="text-xs">
							Description
						</Label>
						<Input
							id="workspace-description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Optional workspace description"
							className="h-9 rounded-lg"
						/>
					</div>
					<div className="space-y-2">
						<Label className="text-xs text-muted-foreground">Workspace Slug</Label>
						<Input value={workspace.slug} readOnly className="h-9 rounded-lg bg-muted text-muted-foreground" />
					</div>
					<Button
						size="sm"
						className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
						onClick={handleSave}
						disabled={updateWorkspace.isPending || !name.trim()}>
						<Save className="size-3.5" />
						{updateWorkspace.isPending ? "Saving..." : "Save Changes"}
					</Button>
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
