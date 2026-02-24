import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Ticket, Users, BarChart3, Settings, ChevronDown, Headset } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const navItems = [
	{ id: "overview", label: "Overview", icon: LayoutDashboard, badge: null, to: "/dashboard/overview" },
	{ id: "tickets", label: "Tickets", icon: Ticket, badge: "248", to: "/dashboard/tickets" },
	{ id: "teams", label: "Teams", icon: Users, badge: "7", to: "/dashboard/teams" },
	{ id: "analytics", label: "Analytics", icon: BarChart3, badge: null, to: "/dashboard/analytics" },
	{ id: "configurations", label: "Settings", icon: Settings, badge: null, to: "/dashboard/configurations" },
] as const;

export function DashboardSidebar() {
	const { user } = useAuth();
	const logoutMutation = useLogoutMutation();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const initials = user?.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase() ?? "??";

	return (
		<Sidebar collapsible="icon" className="border-r-0">
			<SidebarHeader className="p-4">
				<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
					<div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
						<Headset className="size-5" />
					</div>
					<div className="grid flex-1 text-left text-sm leading-tight">
						<span className="truncate font-bold tracking-tight">SupportDesk</span>
						<span className="truncate text-[11px] text-sidebar-foreground/50">Microsoft 365</span>
					</div>
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup className="px-3">
					<SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mb-1">
						Menu
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu className="gap-0.5">
							{navItems.map((item) => (
								<SidebarMenuItem key={item.id}>
									<SidebarMenuButton
										asChild
										isActive={currentPath.startsWith(item.to)}
										tooltip={item.label}
										className="h-9 rounded-lg text-[13px] transition-all">
										<Link to={item.to}>
											<item.icon className="size-[18px]" />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
									{item.badge && (
										<SidebarMenuBadge className="text-[10px] font-medium bg-sidebar-primary/20 text-sidebar-primary border-0 rounded-full px-2">
											{item.badge}
										</SidebarMenuBadge>
									)}
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter className="p-3">
				<Separator className="mb-3 bg-sidebar-border" />
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded-lg">
									<Avatar className="size-8 rounded-lg">
										<AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold text-[13px]">{user?.name ?? "..."}</span>
										<span className="truncate text-[11px] text-sidebar-foreground/50">{user?.role ?? ""}</span>
									</div>
									<ChevronDown className="ml-auto size-4 text-sidebar-foreground/40" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" side="top" align="start" sideOffset={4}>
								<DropdownMenuItem>Profile</DropdownMenuItem>
								<DropdownMenuItem>Account Settings</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => logoutMutation.mutate()}
									disabled={logoutMutation.isPending}>
									{logoutMutation.isPending ? "Signing out..." : "Sign Out"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
