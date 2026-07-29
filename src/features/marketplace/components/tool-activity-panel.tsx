import { Activity, CheckCircle2, XCircle, Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/shared/components/console";
import { useToolCallLogs } from "../hooks/use-marketplace-queries";

/**
 * Audit trail of every outbound connector call. This is what you read when a
 * customer says the agent told them something wrong about their payment.
 */
export function ToolActivityPanel({ workspaceId }: { workspaceId: string }) {
	const { data: logs = [], isLoading } = useToolCallLogs(workspaceId, { limit: 100 });

	if (isLoading) {
		return (
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<Skeleton key={i} className="h-14 w-full" />
				))}
			</div>
		);
	}

	if (logs.length === 0) {
		return (
			<EmptyState
				icon={Activity}
				title="No connector calls yet"
				description="Every call an agent or admin makes through a connector shows up here with its result."
				className="py-16"
			/>
		);
	}

	return (
		<ul className="divide-y border border-border">
			{logs.map((log) => (
				<li key={log.id} className="group relative flex items-start justify-between gap-3 p-3">
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							{log.ok === 1 ? (
								<CheckCircle2 className="size-3.5 shrink-0 text-accent" />
							) : (
								<XCircle className="size-3.5 shrink-0 text-destructive" />
							)}
							<span className="font-mono text-xs font-medium">{log.action_id}</span>
							<Badge variant="outline" className="gap-1 text-[9px] text-muted-foreground">
								{log.triggered_by === "agent" ? <Bot className="size-2.5" /> : <User className="size-2.5" />}
								{log.triggered_by}
							</Badge>
							{log.status_code !== null && (
								<Badge
									variant="outline"
									className={`text-[9px] ${log.ok === 1 ? "text-muted-foreground" : "border-destructive/40 text-destructive"}`}
								>
									{log.status_code}
								</Badge>
							)}
						</div>
						{log.url && (
							<p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
								{log.method} {log.url}
							</p>
						)}
						{log.error && <p className="mt-1 line-clamp-2 text-[11px] text-destructive">{log.error}</p>}
						{log.request_params && log.request_params !== "{}" && (
							<p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{log.request_params}</p>
						)}
					</div>
					<div className="shrink-0 text-right">
						<p className="font-mono text-[10px] text-muted-foreground tabular-nums">
							{new Date(log.created_at * 1000).toLocaleString()}
						</p>
						{log.duration_ms !== null && (
							<p className="font-mono text-[10px] text-muted-foreground tabular-nums">{log.duration_ms}ms</p>
						)}
					</div>
					<span className="scan-line" />
				</li>
			))}
		</ul>
	);
}
