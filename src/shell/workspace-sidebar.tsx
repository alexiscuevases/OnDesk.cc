import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Ticket, Users, BarChart3, Settings, ChevronDown, ChevronRight, Building2, Plus, UserCircle, Palette, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useWorkspace } from "@/context/workspace-context";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspace-queries";
import { useWorkspaceMembers } from "@/features/users/hooks/use-user-queries";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

export function WorkspaceSidebar() {
	const { user } = useAuth();
	const { workspace } = useWorkspace();
	const logoutMutation = useLogoutMutation();
	const navigate = useNavigate();
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;
	const { data: workspaces = [] } = useWorkspaces();
	const { data: members = [] } = useWorkspaceMembers(workspace.id);
	const currentMember = members.find((m) => m.id === user?.id) ?? null;

	const slug = workspace.slug;

	const navItems = [
		{ id: "overview", label: "Overview", icon: LayoutDashboard, badge: null, to: `/w/${slug}/overview` },
		{ id: "tickets", label: "Tickets", icon: Ticket, badge: null, to: `/w/${slug}/tickets/` },
		{ id: "teams", label: "Teams", icon: Users, badge: null, to: `/w/${slug}/teams` },
		{ id: "analytics", label: "Analytics", icon: BarChart3, badge: null, to: `/w/${slug}/analytics` },
		{ id: "settings", label: "Settings", icon: Settings, badge: null, to: `/w/${slug}/settings` },
	];

	const userInitials =
		user?.name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.slice(0, 2)
			.toUpperCase() ?? "??";

	const workspaceInitials = workspace.name
		.split(" ")
		.map((n) => n[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();

	return (
		<Sidebar collapsible="icon" className="border-r-0">
			<SidebarHeader className="p-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
							{workspace.logo_url ? (
								<img src={workspace.logo_url} alt={workspace.name} className="size-9 rounded-xl object-cover" />
							) : (
								<div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
									{workspaceInitials}
								</div>
							)}
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-bold tracking-tight">{workspace.name}</span>
								<span className="truncate text-[11px] text-sidebar-foreground/50">/{workspace.slug}</span>
							</div>
							<ChevronDown className="size-4 text-sidebar-foreground/40" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64" side="bottom" align="start" sideOffset={4}>
						<DropdownMenuLabel className="text-xs text-muted-foreground">Your workspaces</DropdownMenuLabel>
						{workspaces.map((ws) => (
							<DropdownMenuItem key={ws.id} onClick={() => navigate({ to: "/w/$slug/overview", params: { slug: ws.slug } })} className="gap-2">
								{ws.logo_url ? (
									<img src={ws.logo_url} alt={ws.name} className="size-6 rounded-md object-cover" />
								) : (
									<div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
										{ws.name.slice(0, 2).toUpperCase()}
									</div>
								)}
								<span className="flex-1 truncate">{ws.name}</span>
								{ws.slug === slug && <ChevronRight className="size-3 text-muted-foreground" />}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate({ to: "/workspaces/new" })} className="gap-2 text-muted-foreground">
							<Plus className="size-4" />
							Create workspace
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup className="px-3">
					<SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mb-1">Menu</SidebarGroupLabel>
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
										<AvatarImage src={currentMember?.logo_url ?? workspace.logo_url ?? undefined} className="object-cover rounded-lg" />
										<AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
											{userInitials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold text-[13px]">{user?.name ?? "..."}</span>
										<span className="truncate text-[11px] text-sidebar-foreground/50">{workspace.role}</span>
									</div>
									<ChevronDown className="ml-auto size-4 text-sidebar-foreground/40" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-60" side="top" align="start" sideOffset={4}>
								<div className="px-2 py-2.5 border-b mb-1">
									<p className="text-xs font-semibold truncate">{user?.name ?? "..."}</p>
									<p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ""}</p>
								</div>
								<DropdownMenuItem
									onClick={() => navigate({ to: "/w/$slug/profile", params: { slug } })}
									className="gap-2.5 text-xs">
									<UserCircle className="size-3.5 text-muted-foreground" />
									Profile
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => navigate({ to: "/w/$slug/profile", params: { slug } })}
									className="gap-2.5 text-xs">
									<Palette className="size-3.5 text-muted-foreground" />
									Appearance
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() => navigate({ to: "/w/$slug/profile", params: { slug } })}
									className="gap-2.5 text-xs">
									<ShieldCheck className="size-3.5 text-muted-foreground" />
									Security
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() => logoutMutation.mutate()}
									disabled={logoutMutation.isPending}
									className="gap-2.5 text-xs text-destructive focus:text-destructive">
									<LogOut className="size-3.5" />
									{logoutMutation.isPending ? "Signing out..." : "Sign out"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
