"use client";

import { useState, useEffect } from "react";
import {
	Save,
	Bell,
	Shield,
	Globe,
	Users,
	Plug,
	MessageSquareText,
	FileSignature,
	UserCog,
	ChevronRight,
	Plus,
	Pencil,
	Trash2,
	Check,
	Sun,
	Moon,
	Monitor,
	X,
	Search,
	Mail,
	RefreshCw,
	Building2,
	UserX,
	Upload,
	AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	agents as importedAgents,
	outlookAccounts as importedOutlookAccounts,
	companies as importedCompanies,
	customers as importedCustomers,
	type Agent,
	type OutlookAccount,
	type Company,
	type Customer,
} from "@/lib/data";

// --- Types ---
interface ConfigTeam {
	id: string;
	name: string;
	description: string;
	image: string;
	members: number;
	lead: string;
	leaderId?: string;
	memberIds?: string[];
	autoAssign: boolean;
}

interface CannedReply {
	id: string;
	title: string;
	shortcut: string;
	content: string;
}

interface Signature {
	id: string;
	name: string;
	isDefault: boolean;
	content: string;
}

// --- Initial data ---
const initialTeams: ConfigTeam[] = [
	{
		id: "t1",
		name: "Email Support",
		description: "Handles all email-related issues",
		image: "ES",
		members: 4,
		lead: "Carlos Mendez",
		leaderId: "a1",
		memberIds: ["a1", "a5", "a3"],
		autoAssign: true,
	},
	{
		id: "t2",
		name: "Teams Support",
		description: "Microsoft Teams support",
		image: "TS",
		members: 3,
		lead: "Ana Torres",
		leaderId: "a2",
		memberIds: ["a2", "a6"],
		autoAssign: true,
	},
	{
		id: "t3",
		name: "SharePoint Support",
		description: "SharePoint and document management",
		image: "SP",
		members: 5,
		lead: "Miguel Reyes",
		leaderId: "a3",
		memberIds: ["a3", "a4", "a5"],
		autoAssign: false,
	},
	{
		id: "t4",
		name: "Identity & Access",
		description: "Azure AD and authentication",
		image: "IA",
		members: 3,
		lead: "Laura Diaz",
		leaderId: "a4",
		memberIds: ["a4", "a2"],
		autoAssign: true,
	},
];

const initialCannedReplies: CannedReply[] = [
	{ id: "cr1", title: "Ticket Acknowledgment", shortcut: "/ack", content: "Thank you for contacting us. Your ticket {{ticket_id}} has been received..." },
	{ id: "cr2", title: "Request More Info", shortcut: "/info", content: "To better assist you, could you provide the following details..." },
	{ id: "cr3", title: "Escalation Notice", shortcut: "/esc", content: "Your ticket has been escalated to our senior team for further investigation..." },
	{
		id: "cr4",
		title: "Resolution Confirmation",
		shortcut: "/resolved",
		content: "Your ticket {{ticket_id}} has been resolved. If you need further assistance...",
	},
];

const initialSignatures: Signature[] = [
	{ id: "s1", name: "Default Signature", isDefault: true, content: "Best regards,\\n{{agent_name}}\\nSupportDesk 365 | {{team_name}}" },
	{ id: "s2", name: "Formal Signature", isDefault: false, content: "Kind regards,\\n{{agent_name}}\\n{{agent_role}} | SupportDesk 365" },
];

type ConfigSection = "general" | "agents" | "integrations" | "teams" | "canned-replies" | "signatures" | "users-companies" | "notifications" | "security";

const sections: { id: ConfigSection; label: string; icon: typeof Globe; desc: string }[] = [
	{ id: "general", label: "General", icon: Globe, desc: "Workspace settings and branding" },
	{ id: "agents", label: "Agents", icon: UserCog, desc: "Manage support agents and roles" },
	{ id: "integrations", label: "Integrations", icon: Plug, desc: "Connected services and APIs" },
	{ id: "teams", label: "Teams", icon: Users, desc: "Team structure and auto-assignment" },
	{ id: "canned-replies", label: "Canned Replies", icon: MessageSquareText, desc: "Quick response templates" },
	{ id: "signatures", label: "Signatures", icon: FileSignature, desc: "Email signatures for agents" },
	{ id: "users-companies", label: "Users & Companies", icon: Building2, desc: "Customer management" },
	{ id: "notifications", label: "Notifications", icon: Bell, desc: "Alert and notification rules" },
	{ id: "security", label: "Security", icon: Shield, desc: "Authentication and access controls" },
];

let _idCounter = 100;

function nextId(prefix: string) {
	_idCounter++;
	return `${prefix}-${_idCounter}`;
}

export function ConfigurationsView() {
	const [activeSection, setActiveSection] = useState<ConfigSection>("general");
	const [saved, setSaved] = useState(false);

	// Shared state
	const [agents, setAgents] = useState(importedAgents);
	const [outlookAccounts, setOutlookAccounts] = useState(importedOutlookAccounts);
	const [configTeams, setConfigTeams] = useState(initialTeams);
	const [cannedReplies, setCannedReplies] = useState(initialCannedReplies);
	const [signatures, setSignatures] = useState(initialSignatures);
	const [companies, setCompanies] = useState(importedCompanies);
	const [customers, setCustomers] = useState(importedCustomers);

	function handleSave() {
		setSaved(true);
		setTimeout(() => setSaved(false), 2000);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight text-balance">Settings</h1>
					<p className="text-sm text-muted-foreground mt-1">Manage your workspace, agents, and integrations</p>
				</div>
				<Button onClick={handleSave} className="gap-1.5 rounded-lg text-xs font-semibold h-9">
					{saved ? <Check className="size-4" /> : <Save className="size-4" />}
					{saved ? "Saved" : "Save Changes"}
				</Button>
			</div>

			<div className="grid gap-6 lg:grid-cols-4">
				{/* Settings Nav */}
				<div className="lg:col-span-1">
					<nav className="flex flex-col gap-1">
						{sections.map((section) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							return (
								<button
									key={section.id}
									onClick={() => setActiveSection(section.id)}
									className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
										isActive ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-secondary/80 text-foreground"
									}`}>
									<Icon className="size-4 shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">{section.label}</p>
										<p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
											{section.desc}
										</p>
									</div>
									<ChevronRight className={`size-3.5 shrink-0 ${isActive ? "text-primary-foreground/60" : "text-muted-foreground/40"}`} />
								</button>
							);
						})}
					</nav>
				</div>

				{/* Content */}
				<div className="lg:col-span-3">
					{activeSection === "general" && <GeneralSection />}
					{activeSection === "agents" && <AgentsSection agents={agents} setAgents={setAgents} />}
					{activeSection === "integrations" && <IntegrationsSection accounts={outlookAccounts} setAccounts={setOutlookAccounts} />}
					{activeSection === "teams" && <TeamsSection teams={configTeams} setTeams={setConfigTeams} agents={agents} />}
					{activeSection === "canned-replies" && <CannedRepliesSection replies={cannedReplies} setReplies={setCannedReplies} />}
					{activeSection === "signatures" && <SignaturesSection signatures={signatures} setSignatures={setSignatures} />}
					{activeSection === "users-companies" && (
						<UsersCompaniesSection companies={companies} setCompanies={setCompanies} customers={customers} setCustomers={setCustomers} />
					)}
					{activeSection === "notifications" && <NotificationsSection />}
					{activeSection === "security" && <SecuritySection />}
				</div>
			</div>
		</div>
	);
}

// ==================== GENERAL (with theme) ====================

function GeneralSection() {
	const [theme, setTheme] = useState<"light" | "dark" | "system">("light");

	useEffect(() => {
		const root = document.documentElement;
		if (theme === "dark") {
			root.classList.add("dark");
		} else if (theme === "light") {
			root.classList.remove("dark");
		} else {
			const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
			if (prefersDark) {
				root.classList.add("dark");
			} else {
				root.classList.remove("dark");
			}
		}
	}, [theme]);

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Workspace Settings</CardTitle>
					<CardDescription className="text-xs">Basic workspace configuration</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="workspace-name" className="text-xs">
							Workspace Name
						</Label>
						<Input id="workspace-name" defaultValue="SupportDesk 365" className="h-9 rounded-lg" />
					</div>
					<div className="space-y-2">
						<Label htmlFor="workspace-url" className="text-xs">
							Workspace URL
						</Label>
						<Input id="workspace-url" defaultValue="supportdesk-365.microsoft.com" className="h-9 rounded-lg" />
					</div>
					<div className="space-y-2">
						<Label className="text-xs">Timezone</Label>
						<Select defaultValue="utc-5">
							<SelectTrigger className="h-9 rounded-lg text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
								<SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
								<SelectItem value="utc">UTC</SelectItem>
								<SelectItem value="utc+1">CET (UTC+1)</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Appearance</CardTitle>
					<CardDescription className="text-xs">Customize the look and feel</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label className="text-xs">Theme</Label>
						<div className="grid grid-cols-3 gap-2">
							{[
								{ value: "light" as const, label: "Light", icon: Sun },
								{ value: "dark" as const, label: "Dark", icon: Moon },
								{ value: "system" as const, label: "System", icon: Monitor },
							].map((opt) => {
								const Icon = opt.icon;
								const isActive = theme === opt.value;
								return (
									<button
										key={opt.value}
										onClick={() => setTheme(opt.value)}
										className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all ${
											isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-secondary/50"
										}`}>
										<Icon className={`size-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
										<span className={`text-[11px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>{opt.label}</span>
									</button>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ==================== AGENTS with invitation status ====================

function AgentsSection({ agents, setAgents }: { agents: Agent[]; setAgents: React.Dispatch<React.SetStateAction<Agent[]>> }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
	const [form, setForm] = useState({ email: "", role: "Agent" });

	function openAdd() {
		setEditingAgent(null);
		setForm({ email: "", role: "Agent" });
		setDialogOpen(true);
	}

	function openEdit(agent: Agent) {
		setEditingAgent(agent);
		setForm({ email: agent.email, role: agent.role });
		setDialogOpen(true);
	}

	function openDelete(agent: Agent) {
		setDeleteTarget(agent);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.email) return;
		if (editingAgent) {
			setAgents((prev) =>
				prev.map((a) =>
					a.id === editingAgent.id
						? {
								...a,
								role: form.role,
							}
						: a,
				),
			);
		} else {
			const emailPrefix = form.email.split("@")[0] || "Agent";
			const name = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
			const newAgent: Agent = {
				id: nextId("a"),
				name,
				email: form.email,
				role: form.role,
				status: "offline",
				invitationStatus: "pending",
				invitationSentAt: new Date().toISOString(),
				initials: name
					.split(" ")
					.map((w) => w[0])
					.join("")
					.slice(0, 2)
					.toUpperCase(),
				tickets: 0,
			};
			setAgents((prev) => [...prev, newAgent]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	function handleResendInvitation(agentId: string) {
		setAgents((prev) => prev.map((a) => (a.id === agentId ? { ...a, invitationSentAt: new Date().toISOString() } : a)));
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Support Agents</CardTitle>
							<CardDescription className="text-xs">{agents.length} agents in your workspace</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Agent
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{agents.map((agent) => (
							<div key={agent.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="relative">
									<Avatar className="size-9 rounded-lg">
										<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-[11px] font-bold">
											{agent.initials}
										</AvatarFallback>
									</Avatar>
									<div
										className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card ${
											agent.status === "online" ? "bg-accent" : agent.status === "away" ? "bg-warning" : "bg-muted-foreground"
										}`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{agent.name}</p>
									<p className="text-[11px] text-muted-foreground">{agent.email}</p>
								</div>
								<Badge variant="secondary" className="text-[10px] rounded-full px-2">
									{agent.role}
								</Badge>
								{agent.invitationStatus === "pending" ? (
									<Button
										variant="outline"
										size="sm"
										className="h-7 gap-1.5 text-[11px] rounded-lg"
										onClick={() => handleResendInvitation(agent.id)}>
										<Mail className="size-3" />
										Resend Invitation
									</Button>
								) : (
									<div className="text-right shrink-0">
										<p className="text-sm font-bold">{agent.tickets}</p>
										<p className="text-[10px] text-muted-foreground">tickets</p>
									</div>
								)}
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(agent)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit agent</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(agent)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete agent</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Agent Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingAgent ? "Edit Agent" : "Add New Agent"}</DialogTitle>
						<DialogDescription>{editingAgent ? "Update agent information" : "Invite a new agent to your workspace"}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="agent-email" className="text-xs font-medium">
								Email Address
							</Label>
							<Input
								id="agent-email"
								type="email"
								value={form.email}
								onChange={(e) => setForm({ ...form, email: e.target.value })}
								disabled={!!editingAgent}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Role</Label>
							<Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Admin">Admin</SelectItem>
									<SelectItem value="Senior Agent">Senior Agent</SelectItem>
									<SelectItem value="Agent">Agent</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.email} className="rounded-lg text-xs font-semibold">
							{editingAgent ? "Save Changes" : "Send Invitation"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Agent?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to remove {deleteTarget?.name}? This will unassign their tickets and remove their access.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Agent
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==================== INTEGRATIONS (Outlook only) ====================

function IntegrationsSection({ accounts, setAccounts }: { accounts: OutlookAccount[]; setAccounts: React.Dispatch<React.SetStateAction<OutlookAccount[]>> }) {
	const [disconnectOpen, setDisconnectOpen] = useState(false);
	const [disconnectTarget, setDisconnectTarget] = useState<OutlookAccount | null>(null);

	function handleResync(accountId: string) {
		setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, syncStatus: "syncing" as const, lastSync: new Date().toISOString() } : a)));
		setTimeout(() => {
			setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, syncStatus: "synced" as const } : a)));
		}, 2000);
	}

	function handleDisconnect() {
		if (!disconnectTarget) return;
		setAccounts((prev) => prev.filter((a) => a.id !== disconnectTarget.id));
		setDisconnectOpen(false);
		setDisconnectTarget(null);
	}

	function openDisconnect(account: OutlookAccount) {
		setDisconnectTarget(account);
		setDisconnectOpen(true);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Microsoft Outlook</CardTitle>
							<CardDescription className="text-xs">Connected email accounts for ticket creation</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold">
							<Plus className="size-3.5" />
							Connect Account
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{accounts.map((account) => (
							<div key={account.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
									<Mail className="size-5 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{account.email}</p>
									<div className="flex items-center gap-1.5 mt-0.5">
										{account.syncStatus === "syncing" ? (
											<>
												<RefreshCw className="size-3 text-primary animate-spin" />
												<p className="text-[11px] text-primary">Syncing...</p>
											</>
										) : account.syncStatus === "synced" ? (
											<>
												<Check className="size-3 text-accent" />
												<p className="text-[11px] text-muted-foreground">Last sync: {new Date(account.lastSync).toLocaleString()}</p>
											</>
										) : (
											<>
												<AlertCircle className="size-3 text-destructive" />
												<p className="text-[11px] text-destructive">Sync error</p>
											</>
										)}
									</div>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button
										variant="outline"
										size="sm"
										className="h-7 gap-1.5 text-[11px] rounded-lg"
										onClick={() => handleResync(account.id)}
										disabled={account.syncStatus === "syncing"}>
										<RefreshCw className={`size-3 ${account.syncStatus === "syncing" ? "animate-spin" : ""}`} />
										Re-sync
									</Button>
									<Button
										variant="ghost"
										size="sm"
										className="h-7 gap-1.5 text-[11px] rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDisconnect(account)}>
										<X className="size-3" />
										Disconnect
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Disconnect Dialog */}
			<AlertDialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Disconnect Outlook Account?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to disconnect {disconnectTarget?.email}? Email tickets will no longer be created from this account.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDisconnect}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Disconnect
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==================== TEAMS with description and image ====================

function TeamsSection({ teams, setTeams, agents }: { teams: ConfigTeam[]; setTeams: React.Dispatch<React.SetStateAction<ConfigTeam[]>>; agents: Agent[] }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingTeam, setEditingTeam] = useState<ConfigTeam | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<ConfigTeam | null>(null);
	const [form, setForm] = useState({ name: "", description: "", image: "", leaderId: "", memberIds: [] as string[], autoAssign: true });
	const [memberSearch, setMemberSearch] = useState(false);

	function openAdd() {
		setEditingTeam(null);
		setForm({ name: "", description: "", image: "", leaderId: "", memberIds: [], autoAssign: true });
		setDialogOpen(true);
	}

	function openEdit(team: ConfigTeam) {
		setEditingTeam(team);
		setForm({
			name: team.name,
			description: team.description,
			image: team.image,
			leaderId: team.leaderId || "",
			memberIds: team.memberIds || [],
			autoAssign: team.autoAssign,
		});
		setDialogOpen(true);
	}

	function openDelete(team: ConfigTeam) {
		setDeleteTarget(team);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.name) return;
		if (editingTeam) {
			setTeams((prev) =>
				prev.map((t) =>
					t.id === editingTeam.id
						? {
								...t,
								name: form.name,
								description: form.description,
								image:
									form.image ||
									form.name
										.split(" ")
										.map((w) => w[0])
										.join("")
										.slice(0, 2)
										.toUpperCase(),
								leaderId: form.leaderId,
								lead: agents.find((a) => a.id === form.leaderId)?.name || t.lead,
								memberIds: form.memberIds,
								members: form.memberIds.length,
								autoAssign: form.autoAssign,
							}
						: t,
				),
			);
		} else {
			const newTeam: ConfigTeam = {
				id: nextId("t"),
				name: form.name,
				description: form.description,
				image:
					form.image ||
					form.name
						.split(" ")
						.map((w) => w[0])
						.join("")
						.slice(0, 2)
						.toUpperCase(),
				leaderId: form.leaderId,
				lead: agents.find((a) => a.id === form.leaderId)?.name || "Unassigned",
				memberIds: form.memberIds,
				members: form.memberIds.length,
				autoAssign: form.autoAssign,
			};
			setTeams((prev) => [...prev, newTeam]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setTeams((prev) => prev.filter((t) => t.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	function toggleMember(agentId: string) {
		setForm((prev) => ({
			...prev,
			memberIds: prev.memberIds.includes(agentId) ? prev.memberIds.filter((id) => id !== agentId) : [...prev.memberIds, agentId],
		}));
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Support Teams</CardTitle>
							<CardDescription className="text-xs">{teams.length} teams configured</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Team
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{teams.map((team) => (
							<div key={team.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<Avatar className="size-10 rounded-lg">
									<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">{team.image}</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium">{team.name}</p>
									<p className="text-[11px] text-muted-foreground truncate">{team.description}</p>
								</div>
								<div className="text-center shrink-0">
									<p className="text-sm font-bold">{team.members}</p>
									<p className="text-[10px] text-muted-foreground">members</p>
								</div>
								{team.autoAssign && (
									<Badge variant="secondary" className="text-[10px] rounded-full px-2">
										Auto-assign
									</Badge>
								)}
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(team)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit team</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(team)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete team</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Team Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingTeam ? "Edit Team" : "Add New Team"}</DialogTitle>
						<DialogDescription>{editingTeam ? "Update team information" : "Create a new support team"}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="team-name" className="text-xs font-medium">
								Team Name
							</Label>
							<Input id="team-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 rounded-lg" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="team-desc" className="text-xs font-medium">
								Description
							</Label>
							<Textarea
								id="team-desc"
								value={form.description}
								onChange={(e) => setForm({ ...form, description: e.target.value })}
								placeholder="Brief description of the team's responsibilities"
								className="min-h-20 rounded-lg resize-none"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="team-image" className="text-xs font-medium">
								Team Initials/Image
							</Label>
							<Input
								id="team-image"
								value={form.image}
								onChange={(e) => setForm({ ...form, image: e.target.value.slice(0, 2).toUpperCase() })}
								placeholder="ES"
								maxLength={2}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Team Lead</Label>
							<Select value={form.leaderId} onValueChange={(v) => setForm({ ...form, leaderId: v })}>
								<SelectTrigger className="h-9 rounded-lg text-xs">
									<SelectValue placeholder="Select team lead..." />
								</SelectTrigger>
								<SelectContent>
									{agents.map((agent) => (
										<SelectItem key={agent.id} value={agent.id}>
											{agent.name} - {agent.role}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Team Members</Label>
							<Popover open={memberSearch} onOpenChange={setMemberSearch}>
								<PopoverTrigger asChild>
									<Button variant="outline" role="combobox" className="h-9 justify-between rounded-lg text-xs">
										<span className="truncate">
											{form.memberIds.length === 0 ? "Select members..." : `${form.memberIds.length} selected`}
										</span>
										<ChevronRight className="ml-2 size-3.5 shrink-0 rotate-90" />
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-72 p-0" align="start">
									<Command>
										<CommandInput placeholder="Search agents..." className="h-9" />
										<CommandList>
											<CommandEmpty>No agent found.</CommandEmpty>
											<CommandGroup>
												{agents.map((agent) => {
													const isSelected = form.memberIds.includes(agent.id);
													return (
														<CommandItem key={agent.id} value={agent.name} onSelect={() => toggleMember(agent.id)}>
															<div className="flex items-center gap-2 flex-1">
																<Checkbox checked={isSelected} onCheckedChange={() => toggleMember(agent.id)} />
																<span className="text-xs">{agent.name}</span>
															</div>
															<Badge variant="secondary" className="text-[10px] rounded-full px-1.5 ml-auto">
																{agent.role}
															</Badge>
														</CommandItem>
													);
												})}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							{form.memberIds.length > 0 && (
								<div className="flex flex-wrap gap-1.5">
									{form.memberIds.map((id) => {
										const agent = agents.find((a) => a.id === id);
										if (!agent) return null;
										return (
											<Badge key={id} variant="secondary" className="text-[10px] gap-1 rounded-full pr-1">
												{agent.name}
												<button
													type="button"
													onClick={() => toggleMember(id)}
													className="ml-0.5 rounded-full hover:bg-secondary-foreground/20 p-0.5">
													<X className="size-2.5" />
												</button>
											</Badge>
										);
									})}
								</div>
							)}
						</div>
						<div className="flex items-center justify-between pt-2">
							<div>
								<Label htmlFor="auto-assign" className="text-xs font-medium">
									Auto-assign tickets
								</Label>
								<p className="text-[10px] text-muted-foreground">Automatically route tickets to this team</p>
							</div>
							<Switch id="auto-assign" checked={form.autoAssign} onCheckedChange={(checked) => setForm({ ...form, autoAssign: checked })} />
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.name} className="rounded-lg text-xs font-semibold">
							{editingTeam ? "Save Changes" : "Create Team"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Team?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete {deleteTarget?.name}? Existing tickets will need to be reassigned.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Team
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==================== CANNED REPLIES ====================

function CannedRepliesSection({ replies, setReplies }: { replies: CannedReply[]; setReplies: React.Dispatch<React.SetStateAction<CannedReply[]>> }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingReply, setEditingReply] = useState<CannedReply | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<CannedReply | null>(null);
	const [form, setForm] = useState({ title: "", shortcut: "", content: "" });

	function openAdd() {
		setEditingReply(null);
		setForm({ title: "", shortcut: "", content: "" });
		setDialogOpen(true);
	}

	function openEdit(reply: CannedReply) {
		setEditingReply(reply);
		setForm({ title: reply.title, shortcut: reply.shortcut, content: reply.content });
		setDialogOpen(true);
	}

	function openDelete(reply: CannedReply) {
		setDeleteTarget(reply);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.title || !form.shortcut || !form.content) return;
		if (editingReply) {
			setReplies((prev) => prev.map((r) => (r.id === editingReply.id ? { ...r, title: form.title, shortcut: form.shortcut, content: form.content } : r)));
		} else {
			const newReply: CannedReply = {
				id: nextId("cr"),
				title: form.title,
				shortcut: form.shortcut,
				content: form.content,
			};
			setReplies((prev) => [...prev, newReply]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setReplies((prev) => prev.filter((r) => r.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Canned Replies</CardTitle>
							<CardDescription className="text-xs">{replies.length} quick response templates</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Reply
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{replies.map((reply) => (
							<div key={reply.id} className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium">{reply.title}</p>
										<Badge variant="outline" className="text-[10px] rounded-full font-mono px-2">
											{reply.shortcut}
										</Badge>
									</div>
									<p className="text-[11px] text-muted-foreground truncate mt-1">{reply.content}</p>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(reply)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit reply</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(reply)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete reply</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Reply Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingReply ? "Edit Canned Reply" : "Add Canned Reply"}</DialogTitle>
						<DialogDescription>Create a reusable response template with variables</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="reply-title" className="text-xs font-medium">
								Title
							</Label>
							<Input
								id="reply-title"
								value={form.title}
								onChange={(e) => setForm({ ...form, title: e.target.value })}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="reply-shortcut" className="text-xs font-medium">
								Shortcut
							</Label>
							<Input
								id="reply-shortcut"
								value={form.shortcut}
								onChange={(e) => setForm({ ...form, shortcut: e.target.value })}
								placeholder="/ack"
								className="h-9 rounded-lg font-mono"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="reply-content" className="text-xs font-medium">
								Content
							</Label>
							<TiptapEditor
								content={form.content}
								onChange={(content) => setForm({ ...form, content })}
								placeholder="Enter the canned reply content..."
								minHeight="min-h-[128px]"
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.title || !form.shortcut || !form.content} className="rounded-lg text-xs font-semibold">
							{editingReply ? "Save Changes" : "Create Reply"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Canned Reply?</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.title}"? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Reply
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==================== SIGNATURES ====================

function SignaturesSection({ signatures, setSignatures }: { signatures: Signature[]; setSignatures: React.Dispatch<React.SetStateAction<Signature[]>> }) {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editingSig, setEditingSig] = useState<Signature | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Signature | null>(null);
	const [form, setForm] = useState({ name: "", content: "", isDefault: false });

	function openAdd() {
		setEditingSig(null);
		setForm({ name: "", content: "", isDefault: false });
		setDialogOpen(true);
	}

	function openEdit(sig: Signature) {
		setEditingSig(sig);
		setForm({ name: sig.name, content: sig.content, isDefault: sig.isDefault });
		setDialogOpen(true);
	}

	function openDelete(sig: Signature) {
		setDeleteTarget(sig);
		setDeleteOpen(true);
	}

	function handleSave() {
		if (!form.name || !form.content) return;
		if (editingSig) {
			setSignatures((prev) =>
				prev.map((s) =>
					s.id === editingSig.id
						? { ...s, name: form.name, content: form.content, isDefault: form.isDefault }
						: form.isDefault
							? { ...s, isDefault: false }
							: s,
				),
			);
		} else {
			const newSig: Signature = {
				id: nextId("s"),
				name: form.name,
				content: form.content,
				isDefault: form.isDefault,
			};
			setSignatures((prev) => [...prev.map((s) => (form.isDefault ? { ...s, isDefault: false } : s)), newSig]);
		}
		setDialogOpen(false);
	}

	function handleDelete() {
		if (!deleteTarget) return;
		setSignatures((prev) => prev.filter((s) => s.id !== deleteTarget.id));
		setDeleteOpen(false);
		setDeleteTarget(null);
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Email Signatures</CardTitle>
							<CardDescription className="text-xs">{signatures.length} signatures configured</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAdd}>
							<Plus className="size-3.5" />
							Add Signature
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						{signatures.map((sig) => (
							<div key={sig.id} className="flex items-start gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<p className="text-sm font-medium">{sig.name}</p>
										{sig.isDefault && (
											<Badge variant="secondary" className="text-[10px] rounded-full px-2">
												Default
											</Badge>
										)}
									</div>
									<pre className="text-[11px] text-muted-foreground mt-2 whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-2">
										{sig.content}
									</pre>
								</div>
								<div className="flex items-center gap-1 shrink-0">
									<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEdit(sig)}>
										<Pencil className="size-3" />
										<span className="sr-only">Edit signature</span>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
										onClick={() => openDelete(sig)}>
										<Trash2 className="size-3" />
										<span className="sr-only">Delete signature</span>
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Signature Dialog */}
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className="sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>{editingSig ? "Edit Signature" : "Add Signature"}</DialogTitle>
						<DialogDescription>Create a signature template with variables</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="sig-name" className="text-xs font-medium">
								Signature Name
							</Label>
							<Input id="sig-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 rounded-lg" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="sig-content" className="text-xs font-medium">
								Signature Content
							</Label>
							<TiptapEditor
								content={form.content}
								onChange={(content) => setForm({ ...form, content })}
								placeholder="Enter your signature..."
								minHeight="min-h-[128px]"
							/>
						</div>
						<div className="flex items-center gap-2">
							<Checkbox
								id="sig-default"
								checked={form.isDefault}
								onCheckedChange={(checked) => setForm({ ...form, isDefault: checked as boolean })}
							/>
							<Label htmlFor="sig-default" className="text-xs font-medium cursor-pointer">
								Set as default signature
							</Label>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSave} disabled={!form.name || !form.content} className="rounded-lg text-xs font-semibold">
							{editingSig ? "Save Changes" : "Create Signature"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Signature?</AlertDialogTitle>
						<AlertDialogDescription>Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDelete}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Signature
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==================== USERS & COMPANIES ====================

function UsersCompaniesSection({
	companies,
	setCompanies,
	customers,
	setCustomers,
}: {
	companies: Company[];
	setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
	customers: Customer[];
	setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}) {
	const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
	const [companyDeleteOpen, setCompanyDeleteOpen] = useState(false);
	const [companyForm, setCompanyForm] = useState({ name: "", description: "", image: "" });
	const [selectedCompanyUsers, setSelectedCompanyUsers] = useState<string[]>([]);
	const [companyUserSelectOpen, setCompanyUserSelectOpen] = useState(false);
	const [editingCompany, setEditingCompany] = useState<Company | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

	const unassignedCustomers = customers.filter((c) => !c.companyId);

	function openAddCompany() {
		setEditingCompany(null);
		setCompanyForm({ name: "", description: "", image: "" });
		setSelectedCompanyUsers([]);
		setCompanyDialogOpen(true);
	}

	function openEditCompany(company: Company) {
		setEditingCompany(company);
		setCompanyForm({ name: company.name, description: company.description, image: company.image });
		const companyUserIds = customers.filter((c) => c.companyId === company.id).map((c) => c.id);
		setSelectedCompanyUsers(companyUserIds);
		setCompanyDialogOpen(true);
	}

	function openDeleteCompany(company: Company) {
		setDeleteTarget(company);
		setCompanyDeleteOpen(true);
	}

	function handleSaveCompany() {
		if (!companyForm.name) return;

		const companyId = editingCompany?.id || nextId("c");
		const companyImage =
			companyForm.image ||
			companyForm.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase();

		if (editingCompany) {
			setCompanies((prev) =>
				prev.map((c) =>
					c.id === editingCompany.id
						? {
								...c,
								name: companyForm.name,
								description: companyForm.description,
								image: companyImage,
								userCount: selectedCompanyUsers.length,
							}
						: c,
				),
			);
		} else {
			const newCompany: Company = {
				id: companyId,
				name: companyForm.name,
				description: companyForm.description,
				image: companyImage,
				userCount: selectedCompanyUsers.length,
				createdAt: new Date().toISOString(),
			};
			setCompanies((prev) => [...prev, newCompany]);
		}

		// Update selected users to belong to this company
		setCustomers((prev) =>
			prev.map((customer) => {
				if (selectedCompanyUsers.includes(customer.id)) {
					return { ...customer, companyId, companyName: companyForm.name };
				} else if (customer.companyId === companyId && !selectedCompanyUsers.includes(customer.id)) {
					// Remove users that were unselected
					return { ...customer, companyId: undefined, companyName: undefined };
				}
				return customer;
			}),
		);

		setCompanyDialogOpen(false);
	}

	function handleDeleteCompany() {
		if (!deleteTarget) return;
		// Unassign users from this company
		setCustomers((prev) => prev.map((c) => (c.companyId === deleteTarget.id ? { ...c, companyId: undefined, companyName: undefined } : c)));
		setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
		setCompanyDeleteOpen(false);
		setDeleteTarget(null);
	}

	function assignToCompany(customerId: string, companyId: string) {
		const company = companies.find((c) => c.id === companyId);
		if (!company) return;
		setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, companyId, companyName: company.name } : c)));
		setCompanies((prev) => prev.map((c) => (c.id === companyId ? { ...c, userCount: c.userCount + 1 } : c)));
	}

	return (
		<>
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="text-sm font-semibold">Companies & Users</CardTitle>
							<CardDescription className="text-xs">
								{companies.length} companies, {customers.length} users
							</CardDescription>
						</div>
						<Button size="sm" className="h-8 gap-1.5 rounded-lg text-xs font-semibold" onClick={openAddCompany}>
							<Plus className="size-3.5" />
							Add Company
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="companies" className="w-full">
						<TabsList className="w-full grid grid-cols-2 h-9">
							<TabsTrigger value="companies" className="text-xs">
								Companies
							</TabsTrigger>
							<TabsTrigger value="unassigned" className="text-xs">
								Unassigned Users
								{unassignedCustomers.length > 0 && (
									<Badge variant="secondary" className="ml-1.5 text-[10px] rounded-full px-1.5">
										{unassignedCustomers.length}
									</Badge>
								)}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="companies" className="mt-4 space-y-2">
							{companies.map((company) => {
								const companyUsers = customers.filter((c) => c.companyId === company.id);
								return (
									<div key={company.id} className="rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
										<div className="flex items-center gap-3 mb-3">
											<Avatar className="size-10 rounded-lg">
												<AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-xs font-bold">
													{company.image}
												</AvatarFallback>
											</Avatar>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium">{company.name}</p>
												<p className="text-[11px] text-muted-foreground truncate">{company.description}</p>
											</div>
											<div className="text-center shrink-0">
												<p className="text-sm font-bold">{companyUsers.length}</p>
												<p className="text-[10px] text-muted-foreground">users</p>
											</div>
											<div className="flex items-center gap-1 shrink-0">
												<Button variant="ghost" size="icon" className="size-7 rounded-lg" onClick={() => openEditCompany(company)}>
													<Pencil className="size-3" />
													<span className="sr-only">Edit company</span>
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="size-7 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
													onClick={() => openDeleteCompany(company)}>
													<Trash2 className="size-3" />
													<span className="sr-only">Delete company</span>
												</Button>
											</div>
										</div>
										{companyUsers.length > 0 && (
											<div className="space-y-1 pl-2 border-l-2 border-border/50 ml-5">
												{companyUsers.map((user) => (
													<div key={user.id} className="flex items-center gap-2 text-xs text-muted-foreground">
														<div className="size-1 rounded-full bg-muted-foreground/40" />
														<span>{user.name}</span>
														<span className="text-[10px]">({user.email})</span>
													</div>
												))}
											</div>
										)}
									</div>
								);
							})}
						</TabsContent>
						<TabsContent value="unassigned" className="mt-4 space-y-2">
							{unassignedCustomers.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-10 text-center">
									<CheckCircle2 className="size-8 text-accent mb-2" />
									<p className="text-sm font-medium">All users assigned</p>
									<p className="text-[11px] text-muted-foreground">Every user belongs to a company</p>
								</div>
							) : (
								unassignedCustomers.map((user) => (
									<div
										key={user.id}
										className="flex items-center gap-3 rounded-xl bg-secondary/40 p-3.5 transition-colors hover:bg-secondary/80">
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg bg-muted text-muted-foreground text-[11px] font-bold">
												{user.name
													.split(" ")
													.map((w) => w[0])
													.join("")
													.slice(0, 2)
													.toUpperCase()}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium">{user.name}</p>
											<p className="text-[11px] text-muted-foreground">{user.email}</p>
										</div>
										<Select onValueChange={(companyId) => assignToCompany(user.id, companyId)}>
											<SelectTrigger className="w-40 h-7 rounded-lg text-[11px]">
												<SelectValue placeholder="Assign to company" />
											</SelectTrigger>
											<SelectContent>
												{companies.map((company) => (
													<SelectItem key={company.id} value={company.id} className="text-xs">
														{company.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								))
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>

			{/* Company Dialog */}
			<Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>{editingCompany ? "Edit Company" : "Add New Company"}</DialogTitle>
						<DialogDescription>{editingCompany ? "Update company information" : "Create a new company profile"}</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="company-name" className="text-xs font-medium">
								Company Name
							</Label>
							<Input
								id="company-name"
								value={companyForm.name}
								onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="company-desc" className="text-xs font-medium">
								Description
							</Label>
							<Textarea
								id="company-desc"
								value={companyForm.description}
								onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
								placeholder="Brief description of the company"
								className="min-h-20 rounded-lg resize-none"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="company-image" className="text-xs font-medium">
								Company Initials
							</Label>
							<Input
								id="company-image"
								value={companyForm.image}
								onChange={(e) => setCompanyForm({ ...companyForm, image: e.target.value.slice(0, 2).toUpperCase() })}
								placeholder="CI"
								maxLength={2}
								className="h-9 rounded-lg"
							/>
						</div>
						<div className="grid gap-2">
							<Label className="text-xs font-medium">Assign Users</Label>
							<Popover open={companyUserSelectOpen} onOpenChange={setCompanyUserSelectOpen}>
								<PopoverTrigger asChild>
									<Button variant="outline" role="combobox" className="h-auto min-h-9 rounded-lg justify-start text-left font-normal">
										<div className="flex flex-wrap gap-1 items-center">
											{selectedCompanyUsers.length === 0 ? (
												<span className="text-xs text-muted-foreground">Select users...</span>
											) : (
												selectedCompanyUsers.map((userId) => {
													const user = customers.find((c) => c.id === userId);
													if (!user) return null;
													return (
														<Badge key={userId} variant="secondary" className="text-[10px] rounded-md px-1.5 py-0.5">
															{user.name}
															<button
																type="button"
																onClick={(e) => {
																	e.stopPropagation();
																	setSelectedCompanyUsers((prev) => prev.filter((id) => id !== userId));
																}}
																className="ml-1 hover:text-destructive">
																×
															</button>
														</Badge>
													);
												})
											)}
										</div>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-[300px] p-0" align="start">
									<Command>
										<CommandInput placeholder="Search users..." className="h-9 text-xs" />
										<CommandList>
											<CommandEmpty className="py-6 text-center text-xs">No users found</CommandEmpty>
											<CommandGroup>
												{customers.map((user) => {
													const isSelected = selectedCompanyUsers.includes(user.id);
													return (
														<CommandItem
															key={user.id}
															onSelect={() => {
																setSelectedCompanyUsers((prev) =>
																	isSelected ? prev.filter((id) => id !== user.id) : [...prev, user.id],
																);
															}}
															className="text-xs">
															<Checkbox checked={isSelected} className="mr-2 size-4" />
															<div className="flex-1">
																<div className="font-medium">{user.name}</div>
																<div className="text-[10px] text-muted-foreground">{user.email}</div>
															</div>
														</CommandItem>
													);
												})}
											</CommandGroup>
										</CommandList>
									</Command>
								</PopoverContent>
							</Popover>
							<p className="text-[10px] text-muted-foreground">
								{selectedCompanyUsers.length} user{selectedCompanyUsers.length !== 1 ? "s" : ""} selected
							</p>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCompanyDialogOpen(false)} className="rounded-lg text-xs">
							Cancel
						</Button>
						<Button onClick={handleSaveCompany} disabled={!companyForm.name} className="rounded-lg text-xs font-semibold">
							{editingCompany ? "Save Changes" : "Create Company"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Company Dialog */}
			<AlertDialog open={companyDeleteOpen} onOpenChange={setCompanyDeleteOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Company?</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete {deleteTarget?.name}? All users will be unassigned from this company.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel className="rounded-lg text-xs">Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleDeleteCompany}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-xs">
							Delete Company
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

// ==================== NOTIFICATIONS ====================

function NotificationsSection() {
	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Notification Preferences</CardTitle>
					<CardDescription className="text-xs">Manage how and when you receive alerts</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">New Ticket Assignment</Label>
							<p className="text-[10px] text-muted-foreground">Get notified when a ticket is assigned to you</p>
						</div>
						<Switch defaultChecked />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Customer Replies</Label>
							<p className="text-[10px] text-muted-foreground">Notifications for customer responses</p>
						</div>
						<Switch defaultChecked />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">SLA Warnings</Label>
							<p className="text-[10px] text-muted-foreground">Alert when tickets approach SLA deadline</p>
						</div>
						<Switch defaultChecked />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// ==================== SECURITY ====================

function SecuritySection() {
	return (
		<div className="grid gap-4">
			<Card className="border-0 shadow-sm">
				<CardHeader>
					<CardTitle className="text-sm font-semibold">Security Settings</CardTitle>
					<CardDescription className="text-xs">Authentication and access control</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Require 2FA</Label>
							<p className="text-[10px] text-muted-foreground">Enforce two-factor authentication for all agents</p>
						</div>
						<Switch />
					</div>
					<Separator />
					<div className="flex items-center justify-between">
						<div>
							<Label className="text-xs">Session Timeout</Label>
							<p className="text-[10px] text-muted-foreground">Auto-logout after period of inactivity</p>
						</div>
						<Switch defaultChecked />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
