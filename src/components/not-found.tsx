import { useEffect } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { Activity, ArrowRight, ArrowUpRight } from "lucide-react";
import { ConsoleTag, PanelHeader, EmptyState } from "@/shared/components/console";
import { ondeskUrl } from "@/lib/ondesk";

/**
 * Pulse's two 404s.
 *
 * `NotFoundPage` hangs off the root route and catches addresses that never
 * reached a workspace — it renders standalone, in the workspace picker's
 * card language, because there is no shell to wear yet.
 *
 * `WorkspaceNotFound` hangs off the `/w/$slug` layout: a bad address *inside*
 * a workspace keeps the sidebar and header, so the person who mistyped a URL
 * is still in their workspace with every exit visible.
 */

const ACTION_LINK =
	"inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] hover:border-primary hover:text-primary dark:hover:border-accent dark:hover:text-accent transition-colors";

function usePageTitle() {
	useEffect(() => {
		const previous = document.title;
		document.title = "Page not found — Pulse";
		return () => {
			document.title = previous;
		};
	}, []);
}

export function NotFoundPage() {
	usePageTitle();
	const requested = typeof window !== "undefined" ? window.location.pathname : "";

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
			<div className="w-full max-w-lg border border-border bg-card">
				<div className="border-b border-border px-6 py-3 flex items-center justify-between">
					<span className="console-label text-primary dark:text-accent">
						404 — Signal lost<span className="blink-cursor text-accent">_</span>
					</span>
					<span className="console-label hidden sm:block">Pulse</span>
				</div>

				<div className="px-6 py-10 text-center">
					<div className="text-7xl font-black tracking-tighter mb-4">
						4<span className="text-accent">0</span>4
					</div>
					<h1 className="text-xl font-black tracking-tight mb-2">No pulse at this address</h1>
					<p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
						The address doesn't match anything Pulse knows about. It may be mistyped, or the page has
						moved.
					</p>
					{requested && (
						<p className="mt-4 mx-auto max-w-xs truncate border border-dashed border-border px-3 py-2 font-mono text-[11px] text-muted-foreground/70">
							{requested}
						</p>
					)}
				</div>

				<div className="border-t border-border grid sm:grid-cols-2 sm:divide-x max-sm:divide-y divide-border">
					<Link
						to="/workspaces"
						className="group flex items-center justify-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] font-semibold text-foreground hover:text-primary hover:bg-primary/5 dark:hover:text-accent dark:hover:bg-accent/5 transition-colors">
						Your workspaces
						<ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
					</Link>
					<a
						href={ondeskUrl()}
						className="group flex items-center justify-center gap-2 px-6 py-4 font-mono text-xs uppercase tracking-[0.12em] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 dark:hover:text-accent dark:hover:bg-accent/5 transition-colors">
						OnDesk home
						<ArrowUpRight className="size-3.5" />
					</a>
				</div>
			</div>
		</div>
	);
}

export function WorkspaceNotFound() {
	usePageTitle();
	const { slug } = useParams({ strict: false });

	return (
		<div className="mx-auto max-w-2xl">
			<div className="border border-border bg-card">
				<PanelHeader label="404 — NOT FOUND" right={<ConsoleTag>PULSE</ConsoleTag>} />
				<EmptyState
					icon={Activity}
					title="No pulse at this address"
					description="Nothing in this workspace lives at this address. It may be mistyped, or the page has moved."
					action={
						slug ? (
							<Link to="/w/$slug/overview" params={{ slug }} className={ACTION_LINK}>
								Back to overview
								<ArrowRight className="size-3" />
							</Link>
						) : (
							<Link to="/workspaces" className={ACTION_LINK}>
								Choose a workspace
								<ArrowRight className="size-3" />
							</Link>
						)
					}
				/>
			</div>
		</div>
	);
}
