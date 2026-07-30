import { useQuery } from "@tanstack/react-query";
import { Shield, ExternalLink, ScrollText, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useWorkspace } from "@/context/workspace-context";

interface AuditEntry {
	id: string;
	actor_email: string | null;
	action: string;
	target: string | null;
	ip: string | null;
	created_at: number;
}

const ONDESK_URL = "https://ondesk.cc";

/**
 * Security settings moved to OnDesk: two-factor enforcement, the password
 * policy and the IP allowlist all gate sign-in, and sign-in no longer happens
 * in Pulse. What stays here is the product audit trail — what people did inside
 * this workspace once they were let in.
 */
export function SecuritySection() {
	const { workspace } = useWorkspace();

	const { data, isLoading } = useQuery({
		queryKey: ["audit-log", workspace?.id],
		enabled: Boolean(workspace?.id),
		queryFn: async (): Promise<{ entries: AuditEntry[]; total: number }> => {
			const res = await fetch(`/api/security/audit-log?workspace_id=${workspace!.id}&limit=50`, {
				credentials: "include",
			});
			if (!res.ok) throw new Error("Failed to load audit log");
			return res.json() as Promise<{ entries: AuditEntry[]; total: number }>;
		},
	});

	return (
		<div className="flex flex-col gap-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Shield className="size-4" />
						Access policy
					</CardTitle>
					<CardDescription>
						Two-factor enforcement, password rules and the IP allowlist apply to every OnDesk
						product, so they are configured once on your OnDesk workspace.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="outline">
						<a href={`${ONDESK_URL}/workspaces`} target="_blank" rel="noreferrer">
							Open security settings on OnDesk
							<ExternalLink className="size-3.5" />
						</a>
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<ScrollText className="size-4" />
						Activity log
					</CardTitle>
					<CardDescription>
						Actions taken inside Pulse. Sign-ins, role changes and billing events are recorded on
						OnDesk.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="text-muted-foreground size-5 animate-spin" />
						</div>
					) : !data?.entries.length ? (
						<p className="text-muted-foreground py-6 text-center text-sm">No activity recorded yet.</p>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>When</TableHead>
										<TableHead>Who</TableHead>
										<TableHead>Action</TableHead>
										<TableHead>Target</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{data.entries.map((entry: AuditEntry) => (
										<TableRow key={entry.id}>
											<TableCell className="text-muted-foreground whitespace-nowrap text-xs">
												{new Date(entry.created_at * 1000).toLocaleString()}
											</TableCell>
											<TableCell className="text-sm">{entry.actor_email ?? "—"}</TableCell>
											<TableCell className="font-mono text-xs">{entry.action}</TableCell>
											<TableCell className="text-muted-foreground text-xs">
												{entry.target ?? "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
							<Separator className="my-4" />
							<p className="text-muted-foreground text-xs">
								Showing {data.entries.length} of {data.total} entries.
							</p>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default SecuritySection;
