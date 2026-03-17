import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Lock, Server, Eye, Globe, Users, CheckCircle2, FileText, Zap, Key, AlertTriangle, Database } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMouseGlow, SectionBadge, CtaDecorations } from "./shared";

// -- Data --

const CERTIFICATIONS = [
	{
		name: "SOC 2 Type II",
		body: "AICPA",
		description: "Independently audited annually. Covers security, availability, processing integrity, confidentiality, and privacy.",
		icon: Shield,
		badge: "Certified",
		green: true,
	},
	{
		name: "GDPR",
		body: "EU Regulation 2016/679",
		description: "Full compliance with EU data protection regulation. DPA available for all customers. EU data residency included in Enterprise.",
		icon: Globe,
		badge: "Compliant",
		green: true,
	},
	{
		name: "CCPA",
		body: "California Consumer Privacy Act",
		description: "Data subject rights fully supported. Deletion, export, and opt-out requests handled within 72 hours.",
		icon: Eye,
		badge: "Compliant",
		green: true,
	},
	{
		name: "ISO 27001",
		body: "In progress  Q3 2025",
		description: "Information security management system audit underway. Expected certification Q3 2025.",
		icon: FileText,
		badge: "In progress",
		green: false,
	},
	{
		name: "HIPAA",
		body: "US Healthcare",
		description: "BAA available for healthcare customers. Audit logging, data encryption at rest and in transit, and strict access controls.",
		icon: Lock,
		badge: "BAA available",
		green: true,
	},
	{
		name: "Microsoft 365 Verified",
		body: "Microsoft Partner Network",
		description: "Verified Azure Marketplace app. Reviewed and approved by Microsoft security teams.",
		icon: CheckCircle2,
		badge: "Verified",
		green: true,
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
		desc: "Every action  ticket view, status change, export, config update  is logged with timestamp, user, IP, and user-agent. Logs retained for 7 years by default.",
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
	"Offboarding automation  deprovisioning in under 60 seconds",
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
	"Report a vulnerability to security@ondesk.cc",
	"We acknowledge receipt within 24 hours",
	"We assess severity and begin remediation within 72 hours for critical issues",
	"We credit researchers in our Hall of Fame upon fix publication",
	"We do not pursue legal action against good-faith researchers",
];

// -- Sections --

function CertificationsSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center mb-12">
					<SectionBadge icon={Shield} label="Compliance" />
					<h2 className="text-3xl md:text-4xl font-bold mb-3">Certifications & compliance</h2>
					<p className="text-muted-foreground leading-relaxed">
						Independently verified by third-party auditors. Full audit reports available to Enterprise customers under NDA.
					</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
					{CERTIFICATIONS.map(({ name, body, description, icon: Icon, badge, green }, i) => (
						<div
							key={name}
							className={`group relative flex flex-col gap-4 p-7 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
							/>
							<div className="flex items-start justify-between gap-3">
								<div
									className="size-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
									style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
									<Icon className="size-5" style={{ color: "var(--color-primary)" }} />
								</div>
								<span
									className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${green ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}`}>
									{badge}
								</span>
							</div>
							<div>
								<h3 className="font-bold mb-0.5">{name}</h3>
								<p className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
									{body}
								</p>
							</div>
							<p className="text-sm text-muted-foreground leading-relaxed flex-1">{description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function InfrastructureSection() {
	const { ref, inView } = useInView();
	return (
		<section
			className="py-20 md:py-28 border-b border-border"
			style={{ background: "color-mix(in srgb, var(--color-muted) 40%, var(--color-background))" }}
			ref={ref}>
			<div className="container mx-auto px-4">
				<div className="max-w-3xl mx-auto text-center mb-12">
					<SectionBadge icon={Server} label="Infrastructure" />
					<h2 className="text-3xl md:text-4xl font-bold mb-3">Infrastructure security</h2>
					<p className="text-muted-foreground leading-relaxed">
						Built on Azure with defense-in-depth. Every layer is hardened and independently audited.
					</p>
				</div>
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
					{INFRASTRUCTURE.map(({ icon: Icon, title, desc }, i) => (
						<div
							key={title}
							className={`group relative flex flex-col gap-4 p-7 rounded-2xl border border-border bg-card overflow-hidden transition-all duration-700 hover:-translate-y-1 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<div
								className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{
									background: "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 6%, transparent), transparent 70%)",
								}}
							/>
							<div
								className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--color-primary) 25%, transparent)" }}
							/>
							<div
								className="size-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
								style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
								<Icon className="size-5" style={{ color: "var(--color-primary)" }} />
							</div>
							<h3 className="font-bold">{title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function AccessAndDataSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-20 md:py-28 border-b border-border" ref={ref}>
			<div className="container mx-auto px-4 max-w-5xl">
				<div className="grid md:grid-cols-2 gap-16 items-start">
					<div className={`transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
						<SectionBadge icon={Key} label="Access controls" />
						<h2 className="text-3xl font-bold mb-4">Access controls</h2>
						<p className="text-muted-foreground leading-relaxed mb-8">
							Granular controls so the right people have access to exactly what they need — and nothing more.
						</p>
						<ul className="space-y-3">
							{ACCESS_CONTROLS.map((item, i) => (
								<li
									key={item}
									className={`flex items-start gap-3 text-sm transition-all duration-500 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
									style={{ transitionDelay: `${200 + i * 60}ms` }}>
									<CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
									<span className="text-muted-foreground leading-relaxed">{item}</span>
								</li>
							))}
						</ul>
					</div>
					<div
						className={`flex flex-col gap-5 transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
						<SectionBadge icon={Database} label="Data handling" />
						<h2 className="text-3xl font-bold -mt-2">Data handling</h2>
						<p className="text-muted-foreground leading-relaxed">Your data belongs to you. Full stop.</p>
						{DATA_HANDLING.map(({ title, desc, icon: Icon }, i) => (
							<div
								key={title}
								className={`group relative flex gap-4 p-5 rounded-xl border border-border bg-card overflow-hidden transition-all duration-500 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
								style={{ transitionDelay: `${300 + i * 80}ms` }}>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
									style={{
										background:
											"radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) 5%, transparent), transparent 70%)",
									}}
								/>
								<div
									className="size-9 rounded-lg flex items-center justify-center shrink-0"
									style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
									<Icon className="size-4" style={{ color: "var(--color-primary)" }} />
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
	);
}

function DisclosureSection() {
	const { ref, inView } = useInView();
	return (
		<section
			className="py-16 border-b border-border"
			style={{ background: "color-mix(in srgb, var(--color-muted) 40%, var(--color-background))" }}
			ref={ref}>
			<div className="container mx-auto px-4 max-w-3xl">
				<div className={`flex items-start gap-5 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					<div
						className="size-12 rounded-xl flex items-center justify-center shrink-0"
						style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
						<AlertTriangle className="size-6" style={{ color: "var(--color-primary)" }} />
					</div>
					<div>
						<h2 className="text-2xl font-bold mb-2">Responsible disclosure</h2>
						<p className="text-muted-foreground text-sm leading-relaxed mb-5">
							We take every security report seriously. If you believe you have found a vulnerability in OnDesk.cc, please contact us before
							disclosing publicly.
						</p>
						<ul className="space-y-2.5">
							{RESPONSIBLE_DISCLOSURE.map((item, i) => (
								<li
									key={item}
									className={`flex items-start gap-2.5 text-sm text-muted-foreground transition-all duration-500 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
									style={{ transitionDelay: `${150 + i * 70}ms` }}>
									<CheckCircle2 className="size-4 shrink-0 mt-0.5" style={{ color: "var(--color-primary)" }} />
									{item}
								</li>
							))}
						</ul>
						<div className="flex flex-wrap gap-3 mt-6">
							<Button size="lg" asChild className="group">
								<a href="mailto:security@ondesk.cc">
									Report a vulnerability
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button size="lg" variant="outline" asChild className="">
								<a href="/contact">Talk to our security team</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function SecurityCtaSection() {
	const { ref, inView } = useInView();
	return (
		<section className="py-24 md:py-32" ref={ref}>
			<div className="container mx-auto px-4">
				<div
					className={`cta-gradient relative overflow-hidden rounded-3xl p-12 md:p-20 text-center transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
					<CtaDecorations />
					<div className="relative z-10">
						<p className="text-white/70 text-sm font-semibold tracking-widest uppercase mb-4">Enterprise teams</p>
						<h2 className="text-3xl md:text-5xl font-black text-white mb-5 text-balance">Security review for your InfoSec team</h2>
						<p className="text-white/75 text-lg leading-relaxed max-w-xl mx-auto mb-10">
							Need a custom security review, DPA, or audit report? Our security team works directly with enterprise customers and their InfoSec
							teams.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Button
								size="xl"
								className="group font-semibold border-0 hover:opacity-90 transition-opacity"
								style={{ background: "white", color: "var(--color-primary)" }}
								asChild>
								<a href="/contact">
									Request a review
									<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
								</a>
							</Button>
							<Button
								size="xl"
								variant="outline"
								className="font-semibold text-white border-white/35 hover:bg-white/10 hover:border-white/50 transition-all"
								asChild>
								<a href="/status">View status page</a>
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

// -- Page --

export default function SecurityPage() {
	const [heroVisible, setHeroVisible] = useState(false);
	useEffect(() => {
		const id = requestAnimationFrame(() => setHeroVisible(true));
		return () => cancelAnimationFrame(id);
	}, []);
	const mousePos = useMouseGlow();
	const statsRef = useInView();
	const c9997 = useCounter(9997, 1400, statsRef.inView);
	const c0 = useCounter(0, 800, statsRef.inView);
	const c3 = useCounter(3, 900, statsRef.inView);

	return (
		<SiteLayout>
			{/* Hero */}
			<section className="relative overflow-hidden py-24 md:py-36 border-b border-border">
				<div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
				<div
					className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
					style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
				/>
				<div
					className="absolute inset-0 opacity-[0.025] pointer-events-none"
					style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
				/>
				<div className="relative container mx-auto px-4 text-center max-w-3xl">
					<div className={`transition-all duration-700 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<SectionBadge icon={Shield} label="SOC 2 Type II  GDPR  HIPAA" />
					</div>
					<h1
						className={`text-4xl md:text-6xl font-black mb-6 text-balance leading-tight transition-all duration-700 delay-100 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						Security you can{" "}
						<span
							style={{
								background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
								backgroundClip: "text",
							}}>
							stake your reputation on
						</span>
					</h1>
					<p
						className={`text-xl text-muted-foreground leading-relaxed text-pretty mb-10 transition-all duration-700 delay-200 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						We treat security as a first-class product requirement not an afterthought. Every layer of OnDesk.cc is designed to protect your
						customers' data and your team's trust.
					</p>
					<div
						className={`flex flex-col sm:flex-row justify-center gap-3 transition-all duration-700 delay-300 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<Button size="xl" asChild className="group">
							<a href="/contact">
								Request security review
								<ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
							</a>
						</Button>
						<Button size="xl" variant="outline" asChild>
							<a href="mailto:security@ondesk.cc">Contact security team</a>
						</Button>
					</div>

					<div
						ref={statsRef.ref as React.RefObject<HTMLDivElement>}
						className={`grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-14 transition-all duration-1000 delay-400 ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						{[
							{ icon: Zap, displayValue: `${(c9997 / 100).toFixed(2)}%`, label: "Uptime SLA" },
							{ icon: Lock, displayValue: "AES-256", label: "Encryption at rest" },
							{ icon: Shield, displayValue: `${c0}`, label: "Data breaches to date" },
							{ icon: Server, displayValue: `${c3}`, label: "Data residency regions" },
						].map(({ icon: Icon, displayValue, label }, i) => (
							<div
								key={label}
								className={`group relative flex flex-col items-center gap-1.5 py-6 px-4 rounded-2xl border transition-all duration-700 hover:-translate-y-1 hover:shadow-lg overflow-hidden cursor-default ${statsRef.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ background: "var(--color-card)", borderColor: "var(--color-border)", transitionDelay: `${i * 80}ms` }}>
								<div
									className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
									style={{
										background:
											"radial-gradient(circle at 50% 100%, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)",
									}}
								/>
								<Icon className="size-4 text-primary mb-0.5 group-hover:scale-110 transition-transform duration-300 relative z-10" />
								<span
									className="text-2xl font-black relative z-10"
									style={{ color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
									{displayValue}
								</span>
								<span className="text-xs text-muted-foreground relative z-10">{label}</span>
							</div>
						))}
					</div>
				</div>
			</section>
			<CertificationsSection />
			<InfrastructureSection />
			<AccessAndDataSection />
			<DisclosureSection />
			<SecurityCtaSection />
		</SiteLayout>
	);
}
