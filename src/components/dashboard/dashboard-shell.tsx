import { useState } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { HelpCircle, Plus } from "lucide-react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationsProvider } from "@/context/notifications-context";
import { DashboardSidebar } from "@/components/dashboard/shell/dashboard-sidebar";
import { GlobalSearch } from "@/components/dashboard/shell/global-search";
import { NotificationsPanel } from "@/components/dashboard/shell/notifications-panel";
import { NewTicketDialog } from "@/components/dashboard/shell/new-ticket-dialog";

export function DashboardShell() {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const [newTicketOpen, setNewTicketOpen] = useState(false);

	const showNewTicketButton =
		currentPath === "/dashboard/tickets" || currentPath === "/dashboard/tickets/";

	return (
		<NotificationsProvider>
			<SidebarProvider>
				<DashboardSidebar />
				<SidebarInset>
					<header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-lg px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mr-1 h-4" />
						<GlobalSearch />
						<div className="ml-auto flex items-center gap-1.5">
							<Button variant="ghost" size="icon" className="size-8 rounded-lg">
								<HelpCircle className="size-4" />
								<span className="sr-only">Help</span>
							</Button>
							{showNewTicketButton && (
								<Button
									size="sm"
									className="h-8 gap-1.5 rounded-lg text-xs font-semibold"
									onClick={() => setNewTicketOpen(true)}>
									<Plus className="size-3.5" />
									New Ticket
								</Button>
							)}
							<NewTicketDialog open={newTicketOpen} onOpenChange={setNewTicketOpen} />
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
