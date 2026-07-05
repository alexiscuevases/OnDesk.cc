import { useState } from "react";
import { Shield, Globe, Users, Radio, MessageSquareText, FileSignature, UserCog, ChevronRight, Building2, Bot, CreditCard, Zap, Gauge, BookOpen, ShieldAlert, Clock } from "lucide-react";
import { GeneralSection } from "./general-section";
import { AgentsSection } from "./agents-section";
import { IntegrationsSection } from "./integrations-section";
import { TeamsSection } from "./teams-section";
import { CannedRepliesSection } from "./canned-replies-section";
import { SignaturesSection } from "./signatures-section";
import { UsersCompaniesSection } from "./users-companies-section";
import { SecuritySection } from "./security-section";
import { BillingSection } from "./billing-section";
import { AutomationsSection } from "./automations-section";
import { SlaSection } from "./sla-section";
import { BusinessHoursSection } from "./business-hours-section";
import { KbSection } from "./kb-section";
import { RolesSection } from "./roles-section";
import { AiAgentsSection } from "@/features/ai-agents/components/ai-agents-section";
import { PageHeader } from "@/shared/components/console";

type ConfigSection =
	| "general"
	| "agents"
	| "ai-agents"
	| "integrations"
	| "teams"
	| "canned-replies"
	| "signatures"
	| "users-companies"
	| "automations"
	| "sla"
	| "business-hours"
	| "kb"
	| "roles"
	| "security"
	| "billing";

const sections: { id: ConfigSection; label: string; icon: typeof Globe; desc: string; groupEnd?: boolean }[] = [
	{ id: "general", label: "General", icon: Globe, desc: "Workspace settings and branding", groupEnd: true },

	{ id: "agents", label: "Agents", icon: UserCog, desc: "Manage support agents and roles" },
	{ id: "teams", label: "Teams", icon: Users, desc: "Team structure and auto-assignment" },
	{ id: "users-companies", label: "Users & Companies", icon: Building2, desc: "Customer management", groupEnd: true },

	{ id: "ai-agents", label: "AI Agents", icon: Bot, desc: "Automated ticket handling" },
	{ id: "kb", label: "Knowledge Base", icon: BookOpen, desc: "Articles for AI agents and your team", groupEnd: true },

	{ id: "automations", label: "Automations", icon: Zap, desc: "Rules that act on tickets automatically" },
	{ id: "sla", label: "SLA Policies", icon: Gauge, desc: "Response and resolution time targets" },
	{ id: "business-hours", label: "Business Hours", icon: Clock, desc: "Operating hours, timezones and holidays", groupEnd: true },

	{ id: "integrations", label: "Channels", icon: Radio, desc: "Connected mailboxes and channels", groupEnd: true },

	{ id: "canned-replies", label: "Canned Replies", icon: MessageSquareText, desc: "Quick response templates" },
	{ id: "signatures", label: "Signatures", icon: FileSignature, desc: "Email signatures for agents", groupEnd: true },

	{ id: "roles", label: "Roles & Permissions", icon: ShieldAlert, desc: "Built-in and custom workspace roles" },
	{ id: "security", label: "Security", icon: Shield, desc: "Authentication and access controls", groupEnd: true },

	{ id: "billing", label: "Plan & Billing", icon: CreditCard, desc: "Subscription, invoices and payment" },
];

export function ConfigurationsView() {
	const [activeSection, setActiveSection] = useState<ConfigSection>("general");

	return (
		<div className="flex flex-col gap-6">
			<PageHeader tag="06 — Settings" title="Settings" description="Manage your workspace, agents, and integrations" />

			<div className="grid gap-6 lg:grid-cols-4">
				<div className="lg:col-span-1">
					<nav className="flex flex-col border border-border bg-card divide-y divide-border">
						{sections.map((section) => {
							const Icon = section.icon;
							const isActive = activeSection === section.id;
							return (
								<button
									key={section.id}
									onClick={() => setActiveSection(section.id)}
									className={`relative flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
										isActive
											? "bg-primary text-primary-foreground dark:bg-secondary dark:text-foreground"
											: "hover:bg-secondary/60 text-foreground"
									}`}>
									{isActive && <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent dark:bg-(--pulse-lime)" />}
									<Icon className={`size-4 shrink-0 ${isActive ? "" : "text-muted-foreground"}`} />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium">{section.label}</p>
										<p className={`text-[10px] truncate ${isActive ? "text-primary-foreground/70 dark:text-muted-foreground" : "text-muted-foreground"}`}>
											{section.desc}
										</p>
									</div>
									<ChevronRight className={`size-3.5 shrink-0 ${isActive ? "text-primary-foreground/60 dark:text-accent" : "text-muted-foreground/40"}`} />
								</button>
							);
						})}
					</nav>
				</div>

				<div className="lg:col-span-3">
					{activeSection === "general" && <GeneralSection />}
					{activeSection === "agents" && <AgentsSection />}
					{activeSection === "ai-agents" && <AiAgentsSection />}
					{activeSection === "integrations" && <IntegrationsSection />}
					{activeSection === "teams" && <TeamsSection />}
					{activeSection === "canned-replies" && <CannedRepliesSection />}
					{activeSection === "signatures" && <SignaturesSection />}
					{activeSection === "users-companies" && <UsersCompaniesSection />}
					{activeSection === "automations" && <AutomationsSection />}
					{activeSection === "sla" && <SlaSection />}
					{activeSection === "business-hours" && <BusinessHoursSection />}
					{activeSection === "kb" && <KbSection />}
					{activeSection === "roles" && <RolesSection />}
					{activeSection === "security" && <SecuritySection />}
				{activeSection === "billing" && <BillingSection />}
				</div>
			</div>
		</div>
	);
}
