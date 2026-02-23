"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Shield, Globe, Users, Plug, MessageSquareText, FileSignature, UserCog, ChevronRight, Check, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchAgents, fetchOutlookAccounts, fetchCompanies, fetchCustomers, queryKeys } from "@/lib/queries";
import type { Agent, OutlookAccount, Company, Customer } from "@/lib/data";
import { initialTeams, initialCannedReplies, initialSignatures } from "@/lib/config-data";
import { type ConfigTeam, type CannedReply, type Signature } from "@/types/index";
import { GeneralSection } from "./general-section";
import { AgentsSection } from "./agents-section";
import { IntegrationsSection } from "./integrations-section";
import { TeamsSection } from "./teams-section";
import { CannedRepliesSection } from "./canned-replies-section";
import { SignaturesSection } from "./signatures-section";
import { UsersCompaniesSection } from "./users-companies-section";
import { NotificationsSection } from "./notifications-section";
import { SecuritySection } from "./security-section";

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

export function ConfigurationsView() {
	const [activeSection, setActiveSection] = useState<ConfigSection>("general");
	const [saved, setSaved] = useState(false);

	const { data: fetchedAgents = [] } = useQuery({ queryKey: queryKeys.agents.all, queryFn: fetchAgents });
	const { data: fetchedOutlookAccounts = [] } = useQuery({ queryKey: queryKeys.outlookAccounts.all, queryFn: fetchOutlookAccounts });
	const { data: fetchedCompanies = [] } = useQuery({ queryKey: queryKeys.companies.all, queryFn: fetchCompanies });
	const { data: fetchedCustomers = [] } = useQuery({ queryKey: queryKeys.customers.all, queryFn: fetchCustomers });

	const [agents, setAgents] = useState<Agent[]>([]);
	const [outlookAccounts, setOutlookAccounts] = useState<OutlookAccount[]>([]);
	const [configTeams, setConfigTeams] = useState<ConfigTeam[]>(initialTeams);
	const [cannedReplies, setCannedReplies] = useState<CannedReply[]>(initialCannedReplies);
	const [signatures, setSignatures] = useState<Signature[]>(initialSignatures);
	const [companies, setCompanies] = useState<Company[]>([]);
	const [customers, setCustomers] = useState<Customer[]>([]);

	// Inicializar estado local una sola vez cuando los datos lleguen de la query
	useEffect(() => { if (fetchedAgents.length > 0) setAgents(fetchedAgents); }, [fetchedAgents]);
	useEffect(() => { if (fetchedOutlookAccounts.length > 0) setOutlookAccounts(fetchedOutlookAccounts); }, [fetchedOutlookAccounts]);
	useEffect(() => { if (fetchedCompanies.length > 0) setCompanies(fetchedCompanies); }, [fetchedCompanies]);
	useEffect(() => { if (fetchedCustomers.length > 0) setCustomers(fetchedCustomers); }, [fetchedCustomers]);

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
