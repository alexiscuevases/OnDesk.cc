import { useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/context/workspace-context";
import { useUpdateWorkspaceMutation } from "@/features/workspaces/hooks/use-workspace-mutations";

const ONDESK_URL = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";

/**
 * Workspace settings, split by who owns them.
 *
 * The name, description and logo used to be editable here, with a logo uploader
 * writing into Pulse's own R2 bucket. All four fields are mirrored from OnDesk,
 * and the API has refused to write them for a while — so the form saved the AI
 * prompt, silently dropped the rest, and said "Workspace settings saved". The
 * identity block is now what it always was underneath: a read-only view of
 * OnDesk's copy, with a link to the one page that can change it.
 *
 * `workspace_prompt` stays editable. It is Pulse's AI configuration and exists
 * nowhere else on the platform.
 */
export function GeneralSection() {
	const { workspace } = useWorkspace();
	const updateWorkspace = useUpdateWorkspaceMutation(workspace.slug);

	// An overlay on the saved value, not a copy of it: null means "not editing",
	// so a refetch updates the textarea without overwriting what is being typed.
	const [draft, setDraft] = useState<string | null>(null);
	const workspacePrompt = draft ?? workspace.workspace_prompt ?? "";

	function handleSave() {
		updateWorkspace.mutate(
			{ workspace_prompt: workspacePrompt.trim() },
			{
				onSuccess: () => {
					setDraft(null);
					toast.success("Workspace prompt saved");
				},
				onError: (err) => toast.error(err.message),
			},
		);
	}

	const workspaceInitials = workspace.name
		? workspace.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "WS";

	return (
		<div className="grid gap-4">
			<Card>
				<CardHeader>
					<CardTitle className="console-label">Workspace</CardTitle>
					<CardDescription className="text-xs">
						Identity is OnDesk's — the same name and logo appear in every product.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-4">
						{workspace.logo_url ? (
							<img src={workspace.logo_url} alt={workspace.name} className="size-12 object-cover" />
						) : (
							<div className="flex size-12 items-center justify-center bg-primary font-mono text-sm font-bold text-primary-foreground">
								{workspaceInitials}
							</div>
						)}
						<div className="min-w-0">
							<p className="truncate text-base font-bold tracking-tight">{workspace.name}</p>
							<p className="truncate font-mono text-[11px] text-muted-foreground">/{workspace.slug}</p>
						</div>
					</div>

					{workspace.description && (
						<p className="text-xs leading-relaxed text-muted-foreground">{workspace.description}</p>
					)}

					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
						<p className="text-[11px] leading-relaxed text-muted-foreground">
							Change the name, description or logo on OnDesk and every product picks it up.
						</p>
						<a
							href={`${ONDESK_URL}/workspaces/${workspace.slug}/settings`}
							target="_blank"
							rel="noreferrer"
							className="inline-flex shrink-0 items-center gap-1.5 border border-border bg-background px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-primary hover:text-primary">
							Manage on OnDesk
							<ExternalLink className="size-3" />
						</a>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="console-label">AI</CardTitle>
					<CardDescription className="text-xs">Pulse's own configuration, stored here.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="workspace-prompt" className="text-xs">
							Workspace Prompt
						</Label>
						<p className="text-[11px] leading-relaxed text-muted-foreground">
							General context/instructions that will be injected into the AI agent pipeline for this workspace.
						</p>
						<Textarea
							id="workspace-prompt"
							value={workspacePrompt}
							onChange={(e) => setDraft(e.target.value)}
							placeholder="e.g. We are Acme SaaS. Our tone is friendly but professional. Escalate any billing/refund topics. Use product terms: Workspace, Ticket, Agent..."
							className="min-h-32"
						/>
					</div>
					<Button
						size="sm"
						className="h-8 gap-1.5 text-xs"
						onClick={handleSave}
						disabled={updateWorkspace.isPending}>
						<Save className="size-3.5" />
						{updateWorkspace.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
