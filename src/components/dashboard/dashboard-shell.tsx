"use client";

import { useState } from "react";
import {
	LayoutDashboard,
	Ticket,
	Users,
	BarChart3,
	Settings,
	Search,
	Bell,
	ChevronDown,
	Headset,
	Plus,
	X,
	Clock,
	AlertCircle,
	UserPlus,
	CheckCircle2,
	HelpCircle,
	User,
	Hash,
} from "lucide-react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { OverviewView } from "@/components/dashboard/overview-view";
import { TicketsView } from "@/components/dashboard/tickets-view";
import { TeamsView } from "@/components/dashboard/teams-view";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { ConfigurationsView } from "@/components/dashboard/configurations-view";
import { TicketDetailView } from "@/components/dashboard/ticket-detail-view";
import { tickets, agents, teams, customers } from "@/lib/data";

const navItems = [
	{ id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
	{ id: "tickets", label: "Tickets", icon: Ticket, badge: "248" },
	{ id: "teams", label: "Teams", icon: Users, badge: "7" },
	{ id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
	{ id: "configurations", label: "Settings", icon: Settings, badge: null },
];

interface Notification {
	id: string;
	title: string;
	description: string;
	time: string;
	read: boolean;
	type: "ticket" | "assign" | "sla" | "resolved";
}

const initialNotifications: Notification[] = [
	{
		id: "n1",
		title: "SLA Breach Warning",
		description: "Ticket TK-1022 is approaching its SLA deadline in 30 minutes.",
		time: "5 min ago",
		read: false,
		type: "sla",
	},
	{
		id: "n2",
		title: "New Ticket Assigned",
		description: "TK-1024 has been assigned to you by the system auto-router.",
		time: "12 min ago",
		read: false,
		type: "assign",
	},
	{
		id: "n3",
		title: "Ticket Resolved",
		description: "TK-1020 has been marked as resolved by Carlos Mendez.",
		time: "1 hour ago",
		read: false,
		type: "resolved",
	},
	{
		id: "n4",
		title: "Customer Reply",
		description: "john.smith@contoso.com replied to TK-1024.",
		time: "2 hours ago",
		read: true,
		type: "ticket",
	},
	{
		id: "n5",
		title: "New Team Member",
		description: "Sofia Vargas has been added to the Email Support team.",
		time: "3 hours ago",
		read: true,
		type: "assign",
	},
];

function NotificationIcon({ type }: { type: Notification["type"] }) {
	switch (type) {
		case "sla":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-warning/15">
					<Clock className="size-4 text-warning" />
				</div>
			);
		case "assign":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
					<UserPlus className="size-4 text-primary" />
				</div>
			);
		case "resolved":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-accent/15">
					<CheckCircle2 className="size-4 text-accent" />
				</div>
			);
		case "ticket":
			return (
				<div className="flex size-8 items-center justify-center rounded-lg bg-chart-1/10">
					<AlertCircle className="size-4 text-chart-1" />
				</div>
			);
	}
}

export function DashboardShell() {
	const [activeView, setActiveView] = useState("overview");
	const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
	const [notifications, setNotifications] = useState(initialNotifications);
	const [notifOpen, setNotifOpen] = useState(false);
	const [newTicketOpen, setNewTicketOpen] = useState(false);
	const [globalSearch, setGlobalSearch] = useState("");
	const [searchOpen, setSearchOpen] = useState(false);
	const [newTicket, setNewTicket] = useState({
		subject: "",
		requester: "",
		priority: "medium",
		team: "",
		description: "",
	});

	const unreadCount = notifications.filter((n) => !n.read).length;

	// Search results
	const searchResults = {
		tickets: tickets
			.filter(
				(t) =>
					globalSearch &&
					(t.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
						t.subject.toLowerCase().includes(globalSearch.toLowerCase()) ||
						t.requester.toLowerCase().includes(globalSearch.toLowerCase())),
			)
			.slice(0, 3),
		agents: agents
			.filter(
				(a) =>
					globalSearch && (a.name.toLowerCase().includes(globalSearch.toLowerCase()) || a.email.toLowerCase().includes(globalSearch.toLowerCase())),
			)
			.slice(0, 3),
		teams: teams.filter((t) => globalSearch && t.name.toLowerCase().includes(globalSearch.toLowerCase())).slice(0, 3),
	};

	const hasResults = searchResults.tickets.length > 0 || searchResults.agents.length > 0 || searchResults.teams.length > 0;

	function handleOpenTicket(ticketId: string) {
		setSelectedTicketId(ticketId);
		setActiveView("ticket-detail");
	}

	function handleBackToTickets() {
		setSelectedTicketId(null);
		setActiveView("tickets");
	}

	function markAllRead() {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	}

	function dismissNotification(id: string) {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	}

	function markAsRead(id: string) {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
	}

	function handleCreateTicket() {
		// In a real app this would call an API
		setNewTicketOpen(false);
		setNewTicket({ subject: "", requester: "", priority: "medium", team: "", description: "" });
	}

	const showNewTicketButton = activeView === "tickets";

	return (
		<SidebarProvider>
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
						<SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-sidebar-foreground/40 mb-1">Menu</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu className="gap-0.5">
								{navItems.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton
											isActive={activeView === item.id}
											onClick={() => {
												setActiveView(item.id);
												setSelectedTicketId(null);
											}}
											tooltip={item.label}
											className="h-9 rounded-lg text-[13px] transition-all">
											<item.icon className="size-[18px]" />
											<span>{item.label}</span>
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
												CM
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold text-[13px]">Carlos Mendez</span>
											<span className="truncate text-[11px] text-sidebar-foreground/50">Admin</span>
										</div>
										<ChevronDown className="ml-auto size-4 text-sidebar-foreground/40" />
									</SidebarMenuButton>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" side="top" align="start" sideOffset={4}>
									<DropdownMenuItem>Profile</DropdownMenuItem>
									<DropdownMenuItem>Account Settings</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem>Sign Out</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarFooter>
			</Sidebar>

			<SidebarInset>
				<header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur-lg px-4">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-1 h-4" />
					<Popover open={searchOpen && globalSearch.length > 0} onOpenChange={setSearchOpen}>
						<PopoverTrigger asChild>
							<div className="relative flex-1 max-w-md">
								<Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
								<Input
									placeholder="Search tickets, teams, or users..."
									value={globalSearch}
									onChange={(e) => {
										setGlobalSearch(e.target.value);
										setSearchOpen(e.target.value.length > 0);
									}}
									onFocus={() => globalSearch.length > 0 && setSearchOpen(true)}
									className="pl-9 h-9 bg-secondary/60 border-0 rounded-lg focus-visible:bg-card focus-visible:ring-1"
								/>
							</div>
						</PopoverTrigger>
						<PopoverContent className="w-[400px] p-0" align="start" sideOffset={8} onOpenAutoFocus={(e) => e.preventDefault()}>
							{hasResults ? (
								<div className="max-h-96 overflow-y-auto">
									{searchResults.tickets.length > 0 && (
										<div className="p-2">
											<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
												<Hash className="size-3" />
												Tickets
											</div>
											{searchResults.tickets.map((ticket) => (
												<button
													key={ticket.id}
													onClick={() => {
														handleOpenTicket(ticket.id);
														setSearchOpen(false);
														setGlobalSearch("");
													}}
													className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors text-left">
													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<span className="text-xs font-mono font-semibold text-primary/70">{ticket.id}</span>
														</div>
														<p className="text-sm font-medium truncate">{ticket.subject}</p>
														<p className="text-xs text-muted-foreground truncate">{ticket.requester}</p>
													</div>
												</button>
											))}
										</div>
									)}
									{searchResults.agents.length > 0 && (
										<div className="p-2 border-t">
											<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
												<User className="size-3" />
												Agents
											</div>
											{searchResults.agents.map((agent) => (
												<div
													key={agent.id}
													className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors">
													<Avatar className="size-7 rounded-lg">
														<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[10px] font-bold">
															{agent.initials}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium truncate">{agent.name}</p>
														<p className="text-xs text-muted-foreground truncate">{agent.role}</p>
													</div>
												</div>
											))}
										</div>
									)}
									{searchResults.teams.length > 0 && (
										<div className="p-2 border-t">
											<div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
												<Users className="size-3" />
												Teams
											</div>
											{searchResults.teams.map((team) => (
												<div
													key={team.id}
													className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/80 transition-colors">
													<Avatar className="size-7 rounded-lg">
														<AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[9px] font-bold">
															{team.avatar}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-medium">{team.name}</p>
														<p className="text-xs text-muted-foreground truncate">{team.description}</p>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
									<Search className="size-8 mb-2 opacity-30" />
									<p className="text-sm">No results found</p>
								</div>
							)}
						</PopoverContent>
					</Popover>
					<div className="ml-auto flex items-center gap-1.5">
						{/* Help Button */}
						<Button variant="ghost" size="icon" className="size-8 rounded-lg">
							<HelpCircle className="size-4" />
							<span className="sr-only">Help</span>
						</Button>
						{/* New Ticket - only in tickets view */}
						{showNewTicketButton && (
							<Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
								<DialogTrigger asChild>
									<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold">
										<Plus className="size-3.5" />
										New Ticket
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-lg">
									<DialogHeader>
										<DialogTitle>Create New Ticket</DialogTitle>
										<DialogDescription>Fill in the details below to create a new support ticket.</DialogDescription>
									</DialogHeader>
									<div className="grid gap-4 py-4">
										<div className="grid gap-2">
											<Label htmlFor="nt-subject" className="text-xs font-medium">
												Subject
											</Label>
											<Input
												id="nt-subject"
												placeholder="Brief description of the issue"
												value={newTicket.subject}
												onChange={(e) => setNewTicket((p) => ({ ...p, subject: e.target.value }))}
												className="h-9 rounded-lg"
											/>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div className="grid gap-2">
												<Label htmlFor="nt-requester" className="text-xs font-medium">
													Requester Email
												</Label>
												<Input
													id="nt-requester"
													placeholder="user@company.com"
													value={newTicket.requester}
													onChange={(e) => setNewTicket((p) => ({ ...p, requester: e.target.value }))}
													className="h-9 rounded-lg"
												/>
											</div>
											<div className="grid gap-2">
												<Label className="text-xs font-medium">Priority</Label>
												<Select value={newTicket.priority} onValueChange={(v) => setNewTicket((p) => ({ ...p, priority: v }))}>
													<SelectTrigger className="h-9 rounded-lg text-xs">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="low">Low</SelectItem>
														<SelectItem value="medium">Medium</SelectItem>
														<SelectItem value="high">High</SelectItem>
														<SelectItem value="critical">Critical</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="grid gap-2">
											<Label className="text-xs font-medium">Team</Label>
											<Select value={newTicket.team} onValueChange={(v) => setNewTicket((p) => ({ ...p, team: v }))}>
												<SelectTrigger className="h-9 rounded-lg text-xs">
													<SelectValue placeholder="Assign to team..." />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Email Support">Email Support</SelectItem>
													<SelectItem value="Teams Support">Teams Support</SelectItem>
													<SelectItem value="SharePoint Support">SharePoint Support</SelectItem>
													<SelectItem value="Identity & Access">{"Identity & Access"}</SelectItem>
													<SelectItem value="Cloud Storage">Cloud Storage</SelectItem>
													<SelectItem value="Office Apps">Office Apps</SelectItem>
													<SelectItem value="Automation">Automation</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="grid gap-2">
											<Label htmlFor="nt-desc" className="text-xs font-medium">
												Description
											</Label>
											<Textarea
												id="nt-desc"
												placeholder="Detailed description of the issue..."
												value={newTicket.description}
												onChange={(e) => setNewTicket((p) => ({ ...p, description: e.target.value }))}
												className="min-h-24 rounded-lg resize-none"
											/>
										</div>
									</div>
									<DialogFooter>
										<Button variant="outline" onClick={() => setNewTicketOpen(false)} className="rounded-lg text-xs">
											Cancel
										</Button>
										<Button
											onClick={handleCreateTicket}
											disabled={!newTicket.subject || !newTicket.requester}
											className="rounded-lg text-xs font-semibold gap-1.5">
											<Plus className="size-3.5" />
											Create Ticket
										</Button>
									</DialogFooter>
								</DialogContent>
							</Dialog>
						)}

						{/* Notifications Popover */}
						<Popover open={notifOpen} onOpenChange={setNotifOpen}>
							<PopoverTrigger asChild>
								<Button variant="ghost" size="icon" className="relative size-8 rounded-lg">
									<Bell className="size-4" />
									{unreadCount > 0 && (
										<span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-accent-foreground">
											{unreadCount}
										</span>
									)}
									<span className="sr-only">Notifications</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-96 p-0" align="end" sideOffset={8}>
								<div className="flex items-center justify-between px-4 py-3 border-b">
									<div className="flex items-center gap-2">
										<h3 className="text-sm font-semibold">Notifications</h3>
										{unreadCount > 0 && (
											<Badge variant="secondary" className="text-[10px] rounded-full px-1.5 h-5">
												{unreadCount} new
											</Badge>
										)}
									</div>
									{unreadCount > 0 && (
										<Button variant="ghost" size="sm" className="text-[11px] h-7 text-primary hover:text-primary/80" onClick={markAllRead}>
											Mark all read
										</Button>
									)}
								</div>
								<div className="max-h-80 overflow-y-auto">
									{notifications.length === 0 ? (
										<div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
											<Bell className="size-8 mb-2 opacity-20" />
											<p className="text-sm">No notifications</p>
										</div>
									) : (
										notifications.map((notif) => (
											<div
												key={notif.id}
												className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors cursor-pointer hover:bg-secondary/50 ${
													!notif.read ? "bg-primary/5" : ""
												}`}
												onClick={() => markAsRead(notif.id)}
												role="button"
												tabIndex={0}
												onKeyDown={(e) => {
													if (e.key === "Enter" || e.key === " ") markAsRead(notif.id);
												}}>
												<NotificationIcon type={notif.type} />
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2">
														<p
															className={`text-xs font-medium truncate ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
															{notif.title}
														</p>
														{!notif.read && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
													</div>
													<p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{notif.description}</p>
													<p className="text-[10px] text-muted-foreground/60 mt-1">{notif.time}</p>
												</div>
												<Button
													variant="ghost"
													size="icon"
													className="size-6 rounded-md shrink-0 mt-0.5 text-muted-foreground/40 hover:text-destructive"
													onClick={(e) => {
														e.stopPropagation();
														dismissNotification(notif.id);
													}}>
													<X className="size-3" />
													<span className="sr-only">Dismiss notification</span>
												</Button>
											</div>
										))
									)}
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</header>

				<main className="flex-1 overflow-auto p-6">
					{activeView === "overview" && <OverviewView onOpenTicket={handleOpenTicket} />}
					{activeView === "tickets" && <TicketsView onOpenTicket={handleOpenTicket} />}
					{activeView === "teams" && <TeamsView />}
					{activeView === "analytics" && <AnalyticsView />}
					{activeView === "configurations" && <ConfigurationsView />}
					{activeView === "ticket-detail" && selectedTicketId && <TicketDetailView ticketId={selectedTicketId} onBack={handleBackToTickets} />}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
