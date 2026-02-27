import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, Server, Eye, Globe, Users, CheckCircle2, FileText, Zap, Key, AlertTriangle, Database } from "lucide-react";
import { SiteLayout } from "./site-layout";

const CERTIFICATIONS = [
	{
		name: "SOC 2 Type II",
		body: "AICPA",
		description: "Independently audited annually. Covers security, availability, processing integrity, confidentiality, and privacy.",
		icon: Shield,
		badge: "Certified",
	},
	{
		name: "GDPR",
		body: "EU Regulation 2016/679",
		description: "Full compliance with EU data protection regulation. DPA available for all customers. EU data residency included in Enterprise.",
		icon: Globe,
		badge: "Compliant",
	},
	{
		name: "CCPA",
		body: "California Consumer Privacy Act",
		description: "Data subject rights fully supported. Deletion, export, and opt-out requests handled within 72 hours.",
		icon: Eye,
		badge: "Compliant",
	},
	{
		name: "ISO 27001",
		body: "In progress — Q3 2025",
		description: "Information security management system audit underway. Expected certification Q3 2025.",
		icon: FileText,
		badge: "In progress",
	},
	{
		name: "HIPAA",
		body: "US Healthcare",
		description: "BAA available for healthcare customers. Audit logging, data encryption at rest and in transit, and strict access controls.",
		icon: Lock,
		badge: "BAA available",
	},
	{
		name: "Microsoft 365 Verified",
		body: "Microsoft Partner Network",
		description: "Verified Azure Marketplace app. Reviewed and approved by Microsoft security teams.",
		icon: CheckCircle2,
		badge: "Verified",
	},
];

const INFRASTRUCTURE = [
	{
		icon: Server,
		title: "Multi-region hosting",
		desc: "Deployed on Azure across US (East/West), EU (West Europe), and APAC (Southeast Asia). Enterprise customers select their data residency region at account creation.",
	},
	{
		icon: Database,
		title: "Encryption at rest & in transit",
		desc: "All data encrypted at rest with AES-256. All data in transit encrypted with TLS 1.3. Encryption keys managed in Azure Key Vault with automatic rotation.",
	},
	{
		icon: Zap,
		title: "99.97% uptime SLA",
		desc: "Contractual uptime guarantee backed by real-time monitoring. Automatic failover across availability zones. Status page updates within 5 minutes of any incident.",
	},
	{
		icon: Key,
		title: "Customer-managed encryption keys",
		desc: "Enterprise customers can supply their own encryption keys via Azure Key Vault BYOK. We never have access to unencrypted customer data with CMEK enabled.",
	},
	{
		icon: Eye,
		title: "Full audit logging",
		desc: "Every action — ticket view, status change, export, config update — is logged with timestamp, user, IP, and user-agent. Logs retained for 7 years by default.",
	},
	{
		icon: AlertTriangle,
		title: "Penetration testing",
		desc: "Annual third-party penetration tests conducted by an independent security firm. Results and remediation timelines shared with Enterprise customers on request.",
	},
];

const ACCESS_CONTROLS = [
	"Role-based access control (RBAC) with custom permission sets",
	"Microsoft 365 SSO and SAML 2.0 on Professional and Enterprise",
	"Mandatory MFA enforcement at the organization level",
	"IP allowlisting for agent access",
	"Session timeout and device trust policies",
	"Least-privilege API token scopes",
	"Automated anomalous login detection and alerting",
	"Offboarding automation — deprovisioning in under 60 seconds",
];

const DATA_HANDLING = [
	{
		title: "Data residency",
		desc: "Choose where your data lives: United States, European Union, or Asia-Pacific. Data never crosses regions without explicit customer consent.",
		icon: Globe,
	},
	{
		title: "Data retention",
		desc: "Configure custom retention periods per ticket type. Automatic deletion workflows run nightly. Customers can trigger immediate deletion via API.",
		icon: Database,
	},
	{
		title: "Data portability",
		desc: "Export your full data archive at any time in JSON or CSV format. On account termination, data export window stays open for 90 days.",
		icon: FileText,
	},
	{
		title: "Subprocessors",
		desc: "Full list of subprocessors published and kept up to date. 30-day advance notice for any new subprocessor. Opt-out available for Enterprise customers.",
		icon: Users,
	},
];

const RESPONSIBLE_DISCLOSURE = [
	"Report a vulnerability to security@supportdesk365.io",
	"We acknowledge receipt within 24 hours",
	"We assess severity and begin remediation within 72 hours for critical issues",
	"We credit researchers in our Hall of Fame upon fix publication",
	"We do not pursue legal action against good-faith researchers",
];

export default function SecurityPage() {
	return (
		<SiteLayout>
			{/* Hero */}
			<section className="py-20 md:py-28 border-b border-border bg-muted/10">
				<div className="container mx-auto px-4 text-center max-w-3xl">
					<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
						<Shield className="size-3.5" />
						SOC 2 Type II · GDPR · HIPAA
					</div>
					<h1 className="text-4xl md:text-6xl font-bold mb-5 text-balance">Security you can stake your reputation on</h1>
					<p className="text-xl text-muted-foreground leading-relaxed text-pretty mb-8">
						We treat security as a first-class product requirement — not an afterthought. Every layer of SupportDesk 365 is designed to protect your
						customers' data and your team's trust.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/contact">
								Request security review
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="mailto:security@supportdesk365.io">Contact security team</a>
						</Button>
					</div>
				</div>
			</section>

			{/* Trust stats */}
			<section className="border-b border-border">
				<div className="container mx-auto px-4">
					<div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border max-w-5xl mx-auto">
						{[
							{ value: "99.97%", label: "Uptime SLA" },
							{ value: "AES-256", label: "Encryption at rest" },
							{ value: "0", label: "Data breaches to date" },
							{ value: "3", label: "Data residency regions" },
						].map(({ value, label }) => (
							<div
								key={label}
								className="flex flex-col items-center justify-center gap-1 bg-card py-10 text-center hover:bg-primary/5 transition-colors">
								<div className="text-3xl font-black">{value}</div>
								<div className="text-sm text-muted-foreground">{label}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Certifications */}
			<section className="py-20 md:py-28">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center mb-12">
						<h2 className="text-3xl font-bold mb-3">Certifications & compliance</h2>
						<p className="text-muted-foreground leading-relaxed">
							Independently verified by third-party auditors. Full audit reports available to Enterprise customers under NDA.
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
						{CERTIFICATIONS.map(({ name, body, description, icon: Icon, badge }) => (
							<div
								key={name}
								className="flex flex-col gap-4 p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
								<div className="flex items-start justify-between gap-3">
									<div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
										<Icon className="size-5 text-primary" />
									</div>
									<span
										className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
											badge === "Certified" || badge === "Compliant" || badge === "Verified" || badge === "BAA available"
												? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
												: "bg-amber-500/10 text-amber-600 border-amber-500/20"
										}`}>
										{badge}
									</span>
								</div>
								<div>
									<h3 className="font-bold mb-0.5">{name}</h3>
									<p className="text-xs text-primary font-medium">{body}</p>
								</div>
								<p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Infrastructure */}
			<section className="border-y border-border bg-muted/10 py-20 md:py-28">
				<div className="container mx-auto px-4">
					<div className="max-w-3xl mx-auto text-center mb-12">
						<h2 className="text-3xl font-bold mb-3">Infrastructure security</h2>
						<p className="text-muted-foreground leading-relaxed">
							Built on Azure with defense-in-depth. Every layer is hardened and independently audited.
						</p>
					</div>
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
						{INFRASTRUCTURE.map(({ icon: Icon, title, desc }) => (
							<div
								key={title}
								className="flex flex-col gap-4 p-7 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
								<div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center">
									<Icon className="size-5 text-primary" />
								</div>
								<h3 className="font-bold">{title}</h3>
								<p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Access controls */}
			<section className="py-20 md:py-28">
				<div className="container mx-auto px-4 max-w-5xl">
					<div className="grid md:grid-cols-2 gap-16 items-start">
						<div>
							<h2 className="text-3xl font-bold mb-4">Access controls</h2>
							<p className="text-muted-foreground leading-relaxed mb-8">
								Granular controls so the right people have access to exactly what they need — and nothing more.
							</p>
							<ul className="space-y-3">
								{ACCESS_CONTROLS.map((item) => (
									<li key={item} className="flex items-start gap-3 text-sm">
										<CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
										<span className="text-muted-foreground leading-relaxed">{item}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="flex flex-col gap-5">
							<h2 className="text-3xl font-bold">Data handling</h2>
							<p className="text-muted-foreground leading-relaxed mb-2">Your data belongs to you. Full stop.</p>
							{DATA_HANDLING.map(({ title, desc, icon: Icon }) => (
								<div key={title} className="flex gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
									<div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
										<Icon className="size-4 text-primary" />
									</div>
									<div>
										<p className="font-semibold text-sm mb-1">{title}</p>
										<p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* Responsible disclosure */}
			<section className="border-y border-border bg-muted/10 py-16">
				<div className="container mx-auto px-4 max-w-3xl">
					<div className="flex items-start gap-5">
						<div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
							<AlertTriangle className="size-6 text-primary" />
						</div>
						<div>
							<h2 className="text-2xl font-bold mb-2">Responsible disclosure</h2>
							<p className="text-muted-foreground text-sm leading-relaxed mb-5">
								We take every security report seriously. If you believe you have found a vulnerability in SupportDesk 365, please contact us
								before disclosing publicly.
							</p>
							<ul className="space-y-2.5">
								{RESPONSIBLE_DISCLOSURE.map((item) => (
									<li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
										<CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
										{item}
									</li>
								))}
							</ul>
							<div className="mt-6">
								<Button variant="outline" asChild>
									<a href="mailto:security@supportdesk365.io">
										Report a vulnerability
										<ArrowRight className="ml-2 size-4" />
									</a>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="py-20">
				<div className="container mx-auto px-4 text-center max-w-2xl">
					<h2 className="text-3xl font-bold mb-4">Security review for enterprise teams</h2>
					<p className="text-muted-foreground mb-8 leading-relaxed">
						Need a custom security review, DPA, or audit report? Our security team works directly with enterprise customers and their InfoSec teams.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<Button size="lg" asChild className="group h-12 px-8">
							<a href="/contact">
								Request a review
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="lg" variant="outline" asChild className="h-12 px-8">
							<a href="/status">View status page</a>
						</Button>
					</div>
				</div>
			</section>
		</SiteLayout>
	);
}
