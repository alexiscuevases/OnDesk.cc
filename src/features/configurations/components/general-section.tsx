import { useState, useEffect } from "react";
import { Save } from "lucide-react";
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
	useEffect(() => {
		setName(workspace.name);
		setDescription(workspace.description ?? "");
		setLogoUrl(workspace.logo_url ?? "");
	}, [workspace.name, workspace.description, workspace.logo_url]);

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
		? name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "WS";

	return (
		<div className="grid gap-4">
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
						<Input id="workspace-name" value={name} onChange={(e) => setName(e.target.value)} className="h-9 rounded-lg" />
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
		</div>
	);
}
