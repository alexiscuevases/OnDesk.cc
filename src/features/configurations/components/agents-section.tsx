import { ExternalLink, Users, UserCog } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState, StatGrid, StatTile } from "@/shared/components/console";
import { useWorkspace } from "@/context/workspace-context";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";

const ONDESK_URL = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";

/**
 * Read-only view of who belongs to this workspace.
 *
 * Membership is platform state, not product state: the same person and the same
 * role apply across every OnDesk product, and `workspace_members` here is a
 * mirror that only mirror.ts may write. Inviting, changing a role or removing
 * someone all happen on OnDesk — done here they would be silently reverted by
 * the next sync.
 */
export function AgentsSection() {
	const { workspace } = useWorkspace();
	const { data: members = [], isLoading } = useWorkspaceMembers(workspace.id);

	const manageUrl = `${ONDESK_URL}/workspaces/${workspace.slug}/members`;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<p className="text-muted-foreground text-xs">
					Who can work on tickets in this workspace. Managed on your OnDesk account.
				</p>
				<Button asChild size="sm" className="gap-1.5 text-xs">
					<a href={manageUrl} target="_blank" rel="noreferrer">
						<UserCog className="size-3.5" />
						Manage on OnDesk
						<ExternalLink className="size-3" />
					</a>
				</Button>
			</div>

			<StatGrid className="grid-cols-1">
				<StatTile icon={Users} label="Agents" value={members.length} />
			</StatGrid>

			<Card>
				<CardHeader>
					<CardTitle className="console-label">Support Agents</CardTitle>
					<CardDescription className="text-xs">
						Members currently active in this workspace
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{isLoading ? (
						<div className="text-muted-foreground py-6 text-center text-xs">Loading…</div>
					) : members.length === 0 ? (
						<EmptyState
							icon={Users}
							title="No agents yet"
							description="Invite your team on OnDesk and they'll appear here."
						/>
					) : (
						<div className="space-y-2">
							{members.map((member) => {
								const initials = member.name
									.split(" ")
									.map((w) => w[0])
									.join("")
									.slice(0, 2)
									.toUpperCase();
								return (
									<div key={member.id} className="bg-secondary/40 flex items-center gap-3 p-3.5">
										<Avatar className="size-9">
											<AvatarImage
												src={member.logo_url ?? workspace.logo_url ?? undefined}
												className="object-cover"
											/>
											<AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium">{member.name}</p>
											<p className="text-muted-foreground font-mono text-[11px]">{member.email}</p>
										</div>
										<Badge variant="secondary" className="px-2 text-[10px]">
											{member.workspace_role}
										</Badge>
									</div>
								);
							})}
						</div>
					)}

					<Separator />

					<p className="text-muted-foreground text-xs leading-relaxed">
						Invitations, roles and removals are handled on OnDesk, where they apply to every product this
						workspace uses.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

export default AgentsSection;
