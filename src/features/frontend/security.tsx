import { ArrowRight, Shield, Lock, Server, Eye, Globe, Users, CheckCircle2, FileText, Zap, Key, AlertTriangle, Database } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";

// ── Data ──

const CERTIFICATIONS = [
	{
		name: "SOC 2 Type II",
		body: "AICPA",
		description: "Independently audited annually. Covers security, availability, processing integrity, confidentiality, and privacy.",
		icon: Shield,
		badge: "CERTIFIED",
		green: true,
	},
	{
		name: "GDPR",
		body: "EU Regulation 2016/679",
		description: "Full compliance with EU data protection regulation. DPA available for all customers. EU data residency included in Enterprise.",
		icon: Globe,
		badge: "COMPLIANT",
		green: true,
	},
	{
		name: "CCPA",
		body: "California Consumer Privacy Act",
		description: "Data subject rights fully supported. Deletion, export, and opt-out requests handled within 72 hours.",
		icon: Eye,
		badge: "COMPLIANT",
		green: true,
	},
	{
		name: "ISO 27001",
		body: "In progress — Q3 2025",
		description: "Information security management system audit underway. Expected certification Q3 2025.",
		icon: FileText,
		badge: "IN PROGRESS",
		green: false,
	},
	{
		name: "HIPAA",
		body: "US Healthcare",
		description: "BAA available for healthcare customers. Audit logging, data encryption at rest and in transit, and strict access controls.",
		icon: Lock,
		badge: "BAA AVAILABLE",
		green: true,
	},
	{
		name: "Microsoft 365 Verified",
		body: "Microsoft Partner Network",
		description: "Verified Azure Marketplace app. Reviewed and approved by Microsoft security teams.",
		icon: CheckCircle2,
		badge: "VERIFIED",
		green: true,
	},
];

const INFRASTRUCTURE = [
	{
		icon: Server,
		title: "Multi-region hosting",
		desc: "Deployed on Azure across US (East/West), EU (West Europe), and APAC (Southeast Asia). Data residency region selection is available on the Enterprise plan.",
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
		desc: "Enterprise plan customers can choose their data residency region: United States, European Union, or Asia-Pacific. Data never crosses regions without explicit consent.",
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
	"Report a vulnerability to security@pulse.cc",
	"We acknowledge receipt within 24 hours",
	"We assess severity and begin remediation within 72 hours for critical issues",
	"We credit researchers in our Hall of Fame upon fix publication",
	"We do not pursue legal action against good-faith researchers",
];

// ── Page ──

export default function SecurityPage() {
	const visible = useMountVisible();
	const { ref: statsRef, inView: statsInView } = useInView();
	const c9997 = useCounter(9997, 1400, statsInView);
	const c3 = useCounter(3, 900, statsInView);

	return (
		<SiteLayout>
			<div className="mx-auto max-w-350 border-x border-border">
				{/* ── HERO ── */}
				<section className="relative border-b border-border overflow-hidden">
					<div
						className="absolute top-0 right-0 w-1/2 h-full opacity-[0.04] pointer-events-none"
						style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
					/>

					<div
						className={`relative px-6 md:px-12 pt-16 md:pt-24 pb-14 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<div className="flex items-center gap-3 mb-10">
							<span className="relative flex size-2">
								<span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
								<span className="relative inline-flex size-2 rounded-full bg-accent" />
							</span>
							<MonoTag className="text-foreground/70">
								SECURITY_DOSSIER — SOC 2 / GDPR / HIPAA<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							Security you can{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								stake your reputation
							</span>{" "}
							on
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
							Built for everyone — from solo operators to global enterprises. Every layer is designed to protect your customers' data,
							with controls that scale to your needs.
						</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/contact">
								Request security review <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="mailto:security@pulse.cc" variant="outline">
								Contact security team
							</CtaLink>
						</div>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: `${(c9997 / 100).toFixed(2)}%`, label: "UPTIME SLA" },
								{ value: "AES-256", label: "ENCRYPTION AT REST" },
								{ value: "0", label: "DATA BREACHES TO DATE" },
								{ value: `${c3}`, label: "DATA RESIDENCY REGIONS" },
							].map(({ value, label }, i) => (
								<div
									key={label}
									className={`px-4 md:px-10 py-8 transition-all duration-700 ${statsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
									style={{ transitionDelay: `${i * 100}ms` }}>
									<div className="text-3xl md:text-4xl font-black tracking-tighter mb-2" style={{ fontVariantNumeric: "tabular-nums" }}>
										{value}
									</div>
									<div className="font-mono text-[10px] tracking-[0.2em] text-primary font-semibold">{label}</div>
								</div>
							))}
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── COMPLIANCE ── */}
				<CertificationsSection />

				{/* ── INFRASTRUCTURE — dark vault band ── */}
				<InfrastructureBand />

				{/* ── ACCESS & DATA ── */}
				<AccessAndDataSection />

				{/* ── DISCLOSURE ── */}
				<DisclosureSection />

				{/* ── CTA ── */}
				<DarkCta
					tag="05 — REVIEW · DPA / AUDIT REPORTS / NDA"
					headline={
						<>
							Security review for your <span style={{ color: "var(--pulse-lime)" }}>team.</span>
						</>
					}
					desc="Need a custom security review, DPA, or audit report? Our security team is here to help — solo operator to global enterprise."
					primary={{ href: "/contact", label: "Request a review" }}
					secondary={{ href: "/status", label: "View status page" }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function CertificationsSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="01" label="COMPLIANCE" title="Certifications & compliance" right="INDEPENDENTLY AUDITED" />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">
				Independently verified by third-party auditors. Full audit reports available to Enterprise customers under NDA.
			</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border">
					{CERTIFICATIONS.map(({ name, body, description, icon: Icon, badge, green }, i) => (
						<div
							key={name}
							className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
							<div className="flex items-center justify-between mb-6">
								<Icon className="size-5 text-accent" />
								<span
									className={`font-mono text-[9px] tracking-[0.2em] border px-2 py-1 font-bold ${green ? "text-accent border-accent/40" : "text-amber-600 border-amber-500/40"}`}>
									{badge}
								</span>
							</div>
							<h3 className="font-black text-lg tracking-tight mb-0.5">{name}</h3>
							<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary font-semibold mb-3">{body}</p>
							<p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function InfrastructureBand() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-b border-border" style={{ background: "var(--pulse-ink)" }}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					02 — INFRASTRUCTURE
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">DEFENSE IN DEPTH</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl mb-3">
					Every layer, <span style={{ color: "var(--pulse-lime)" }}>hardened.</span>
				</h2>
				<p className="text-white/50 text-lg">Built on Azure with defense-in-depth. Independently audited.</p>
			</div>

			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-white/10">
				{INFRASTRUCTURE.map(({ icon: Icon, title, desc }, i) => (
					<div
						key={title}
						className={`px-6 md:px-12 py-10 border-b lg:nth-last-[-n+3]:border-b-0 md:nth-last-[-n+2]:border-b-0 border-white/10 md:border-r md:nth-[2n]:border-r-0 lg:nth-[2n]:border-r lg:nth-[3n]:border-r-0 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 80 + 150}ms` }}>
						<div className="flex items-center justify-between mb-6">
							<span className="font-mono text-[11px] tracking-[0.25em] text-white/25">0{i + 1}</span>
							<Icon className="size-5" style={{ color: "var(--pulse-lime)" }} />
						</div>
						<h3 className="text-lg font-bold mb-2.5">{title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function AccessAndDataSection() {
	const { ref, inView } = useInView();
	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">03 — ACCESS & DATA</MonoTag>
				<MonoTag className="hidden sm:block">YOUR DATA BELONGS TO YOU</MonoTag>
			</div>

			<div className="grid lg:grid-cols-2">
				{/* access controls */}
				<div className={`px-6 md:px-12 py-12 lg:border-r border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Access controls</h2>
					<p className="text-muted-foreground leading-relaxed mb-8">
						Granular controls so the right people have access to exactly what they need — and nothing more.
					</p>
					<ul className="divide-y divide-border border-y border-border">
						{ACCESS_CONTROLS.map((item) => (
							<li key={item} className="flex items-start gap-3 py-3 text-sm">
								<CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
								<span className="text-muted-foreground leading-relaxed">{item}</span>
							</li>
						))}
					</ul>
				</div>

				{/* data handling */}
				<div className={`px-6 md:px-12 py-12 border-t lg:border-t-0 border-border transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">Data handling</h2>
					<p className="text-muted-foreground leading-relaxed mb-8">Your data belongs to you. Full stop.</p>
					<div className="border border-border divide-y divide-border">
						{DATA_HANDLING.map(({ title, desc, icon: Icon }) => (
							<div key={title} className="flex gap-4 px-5 py-4">
								<Icon className="size-4 text-accent shrink-0 mt-1" />
								<div>
									<p className="font-bold text-sm mb-1">{title}</p>
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
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">04 — DISCLOSURE</MonoTag>
				<MonoTag className="hidden sm:block">GOOD-FAITH RESEARCH WELCOME</MonoTag>
			</div>

			<div className={`px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<div className="flex items-center gap-3 mb-3">
					<AlertTriangle className="size-5 text-accent" />
					<h2 className="text-2xl md:text-3xl font-black tracking-tight">Responsible disclosure</h2>
				</div>
				<p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">
					We take every security report seriously. If you believe you have found a vulnerability in Pulse, please contact us before
					disclosing publicly.
				</p>

				<div className="border border-border divide-y divide-border max-w-2xl mb-8">
					{RESPONSIBLE_DISCLOSURE.map((item, i) => (
						<div key={item} className="flex items-center gap-4 px-5 py-3.5">
							<span className="font-mono text-[10px] tracking-[0.2em] text-accent font-bold shrink-0">0{i + 1}</span>
							<p className="text-sm text-muted-foreground">{item}</p>
						</div>
					))}
				</div>

				<div className="flex flex-col sm:flex-row gap-3">
					<CtaLink href="mailto:security@pulse.cc">
						Report a vulnerability <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
					</CtaLink>
					<CtaLink href="/contact" variant="outline">
						Talk to our security team
					</CtaLink>
				</div>
			</div>
		</section>
	);
}
