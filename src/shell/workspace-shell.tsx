import { useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationsProvider } from "@/context/notifications-context";
import { useWorkspace } from "@/context/workspace-context";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { GlobalSearch } from "./global-search";
import { NotificationsPanel } from "./notifications-panel";
import { GlobalNova } from "./global-nova";
import { HelpMenu } from "./help-menu";
import { AppSwitcher } from "./app-switcher";

function HeaderBreadcrumb() {
	const { workspace } = useWorkspace();
	const currentPath = useRouterState({ select: (s) => s.location.pathname });
	const section = currentPath.split("/").filter(Boolean)[2] ?? "overview";
	return (
		<span className="hidden md:flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground whitespace-nowrap">
			<span className="text-foreground/70">w/{workspace.slug}</span>
			<span className="text-muted-foreground/50">/</span>
			<span className="text-primary dark:text-accent">
				{section}
				<span className="blink-cursor text-accent">_</span>
			</span>
		</span>
	);
}

export function WorkspaceShell() {
	// Nova's open state is lifted here rather than kept inside the sheet, because
	// two things in the topbar open it: its own button and the help menu's "Ask
	// Nova instead". A self-contained trigger would need the help menu to reach
	// into a sibling.
	const [novaOpen, setNovaOpen] = useState(false);

	return (
		<NotificationsProvider>
			<SidebarProvider>
				<WorkspaceSidebar />
				<SidebarInset>
					<header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/85 backdrop-blur-lg px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-1 h-4" />
						<HeaderBreadcrumb />
						<GlobalSearch />
						<div className="ml-auto flex items-center gap-1.5">
							<AppSwitcher />
							<Button
								variant="ghost"
								size="sm"
								className="h-8 gap-1.5 text-xs text-primary transition-colors hover:bg-primary/5 hover:text-primary dark:text-accent dark:hover:bg-accent/10 dark:hover:text-accent"
								onClick={() => setNovaOpen(true)}>
								<Sparkles className="size-3.5" />
								Nova
							</Button>
							<HelpMenu onAskNova={() => setNovaOpen(true)} />
							<NotificationsPanel />
						</div>
					</header>
					<main className="flex-1 overflow-auto p-6">
						<Outlet />
					</main>
				</SidebarInset>
				<GlobalNova open={novaOpen} onOpenChange={setNovaOpen} />
			</SidebarProvider>
		</NotificationsProvider>
	);
}
