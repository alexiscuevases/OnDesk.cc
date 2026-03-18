import { Outlet } from "@tanstack/react-router";
import { HelpCircle } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationsProvider } from "@/context/notifications-context";
import { WorkspaceSidebar } from "./workspace-sidebar";
import { GlobalSearch } from "./global-search";
import { NotificationsPanel } from "./notifications-panel";
import { GlobalAIAssistant } from "./global-ai-assistant";

export function WorkspaceShell() {
	return (
		<NotificationsProvider>
			<SidebarProvider>
				<WorkspaceSidebar />
				<SidebarInset>
					<header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-lg px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-1 h-4" />
						<GlobalSearch />
						<div className="ml-auto flex items-center gap-1.5">
							<GlobalAIAssistant />
							<Button variant="ghost" size="icon" className="size-8 rounded-lg">
								<HelpCircle className="size-4" />
								<span className="sr-only">Help</span>
							</Button>
							<NotificationsPanel />
						</div>
					</header>
					<main className="flex-1 overflow-auto p-6">
						<Outlet />
					</main>
				</SidebarInset>
			</SidebarProvider>
		</NotificationsProvider>
	);
}
