import { useQuery } from "@tanstack/react-query";
import { ExternalLink, KeyRound, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWorkspace } from "@/context/workspace-context";

const ONDESK_URL = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";

interface RolesResponse {
	permissions: string[];
}

/**
 * Roles moved to OnDesk, and they had to.
 *
 * Pulse could define a role and never assign it: the assignment lives on the
 * Pulse *seat*, and seats belong to the control plane. Definitions on one side
 * of the wire and assignments on the other meant the feature had never worked —
 * so what is left here is the answer for the person reading the page, and a link
 * to where the question is decided.
 */
export function RolesSection() {
	const { workspace } = useWorkspace();

	const mine = useQuery({
		queryKey: ["my-permissions", workspace?.id],
		enabled: Boolean(workspace?.id),
		queryFn: async (): Promise<RolesResponse> => {
			const res = await fetch(`/api/me/permissions?workspace_id=${workspace!.id}`, { credentials: "include" });
			if (!res.ok) throw new Error("Failed to load permissions");
			return res.json() as Promise<RolesResponse>;
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<KeyRound className="size-4" />
						Roles &amp; permissions
					</CardTitle>
					<CardDescription>
						A role says what somebody may do inside Pulse, and it is attached to their Pulse seat — so it is
						created and handed out on OnDesk, next to the seat itself. Owner, admin and agent stay what they
						always were: who administers the workspace and who is billed.
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					<Button asChild variant="outline">
						<a href={`${ONDESK_URL}/workspaces/${workspace.slug}/roles`} target="_blank" rel="noreferrer">
							Manage roles on OnDesk
							<ExternalLink className="size-3.5" />
						</a>
					</Button>
					<Button asChild variant="ghost">
						<a href={`${ONDESK_URL}/workspaces/${workspace.slug}/members`} target="_blank" rel="noreferrer">
							Assign them to people
							<ExternalLink className="size-3.5" />
						</a>
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-base">What you can do here</CardTitle>
					<CardDescription>
						Resolved from your own role. This is the list Pulse checks on every write.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{mine.isLoading ? (
						<Loader2 className="text-muted-foreground size-4 animate-spin" />
					) : (mine.data?.permissions.length ?? 0) === 0 ? (
						<p className="text-muted-foreground text-sm">No permissions resolved yet — sign out and back in.</p>
					) : (
						<div className="flex flex-wrap gap-1.5">
							{mine.data?.permissions.map((permission) => (
								<Badge key={permission} variant="secondary" className="font-mono text-[10px]">
									{permission}
								</Badge>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
