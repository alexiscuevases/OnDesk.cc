import { ArrowRight, Shield, Lock, Server, Eye, Globe, Users, CheckCircle2, FileText, Zap, Key, AlertTriangle, Database } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, SectionRule, Cross, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Certification names are the standards themselves, so they stay here along with
// icons, badge ids and ordering. Bodies and descriptions come from the dictionary.

type CertKey = keyof Dictionary["security"]["compliance"]["items"];
type BadgeId = keyof Dictionary["security"]["compliance"]["badges"];
type InfraKey = keyof Dictionary["security"]["infrastructure"]["items"];
type DataKey = keyof Dictionary["security"]["accessAndData"]["dataHandling"];

const CERTIFICATIONS: { key: CertKey; name: string; icon: React.ElementType; badge: BadgeId; green: boolean }[] = [
	{ key: "soc2", name: "SOC 2 Type II", icon: Shield, badge: "certified", green: true },
	{ key: "gdpr", name: "GDPR", icon: Globe, badge: "compliant", green: true },
	{ key: "ccpa", name: "CCPA", icon: Eye, badge: "compliant", green: true },
	{ key: "iso27001", name: "ISO 27001", icon: FileText, badge: "inProgress", green: false },
	{ key: "hipaa", name: "HIPAA", icon: Lock, badge: "baaAvailable", green: true },
	{ key: "microsoft", name: "Microsoft 365 Verified", icon: CheckCircle2, badge: "verified", green: true },
];

const INFRASTRUCTURE: { key: InfraKey; icon: React.ElementType }[] = [
	{ key: "hosting", icon: Server },
	{ key: "encryption", icon: Database },
	{ key: "uptime", icon: Zap },
	{ key: "cmek", icon: Key },
	{ key: "audit", icon: Eye },
	{ key: "pentest", icon: AlertTriangle },
];

const DATA_HANDLING: { key: DataKey; icon: React.ElementType }[] = [
	{ key: "residency", icon: Globe },
	{ key: "retention", icon: Database },
	{ key: "portability", icon: FileText },
	{ key: "subprocessors", icon: Users },
];

// ── Page ──

export default function SecurityPage() {
	const { dict, locale, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.security, path: "/security", locale });

	const hero = dict.security.hero;
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
								{hero.eyebrow}
								<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-5xl md:text-7xl font-black leading-[1.02] tracking-tighter mb-8 text-balance">
							{hero.headline.lead}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{hero.headline.highlight}
							</span>
							{hero.headline.trail && <> {hero.headline.trail}</>}
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/contact">
								{hero.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href="mailto:security@pulse.cc" variant="outline">
								{hero.ctaSecondary}
							</CtaLink>
						</div>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{
									value: `${num(c9997 / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
									label: hero.stats.uptime,
								},
								{ value: hero.stats.encryption.value, label: hero.stats.encryption.label },
								{ value: num(0), label: hero.stats.breaches },
								{ value: num(c3), label: hero.stats.regions },
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

				<CertificationsSection />
				<InfrastructureBand />
				<AccessAndDataSection />
				<DisclosureSection />

				<DarkCta
					tag={dict.security.finalCta.tag}
					headline={
						<>
							{dict.security.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.security.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.security.finalCta.desc}
					primary={{ href: "/contact", label: dict.security.finalCta.primary }}
					secondary={{ href: "/status", label: dict.security.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function CertificationsSection() {
	const { dict } = useI18n();
	const c = dict.security.compliance;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<SectionRule index="01" label={c.sectionLabel} title={c.sectionTitle} right={c.sectionRight} />
			<p className="px-6 md:px-12 pb-10 text-lg text-muted-foreground max-w-2xl">{c.intro}</p>

			<div className="relative border-t border-border">
				<Cross className="-top-2 -left-1.5" />
				<Cross className="-top-2 -right-1.5" />
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border-b border-border">
					{CERTIFICATIONS.map(({ key, name, icon: Icon, badge, green }, i) => {
						const copy = c.items[key];
						return (
							<div
								key={key}
								className={`group relative bg-background px-6 md:px-8 py-8 flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
								style={{ transitionDelay: `${i * 80}ms` }}>
								<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
								<div className="flex items-center justify-between mb-6">
									<Icon className="size-5 text-accent" />
									<span
										className={`font-mono text-[9px] tracking-[0.2em] border px-2 py-1 font-bold ${green ? "text-accent border-accent/40" : "text-amber-600 border-amber-500/40"}`}>
										{c.badges[badge]}
									</span>
								</div>
								<h3 className="font-black text-lg tracking-tight mb-0.5">{name}</h3>
								<p className="font-mono text-[10px] tracking-[0.15em] uppercase text-primary font-semibold mb-3">{copy.body}</p>
								<p className="text-sm text-muted-foreground leading-relaxed">{copy.description}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function InfrastructureBand() {
	const { dict } = useI18n();
	const inf = dict.security.infrastructure;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="relative text-white border-b border-border" style={{ background: "var(--pulse-ink)" }}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10">
				<span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: "var(--pulse-lime)" }}>
					{inf.sectionLabel}
				</span>
				<span className="hidden sm:block font-mono text-[11px] tracking-[0.25em] text-white/40">{inf.sectionRight}</span>
			</div>

			<div className={`px-6 md:px-12 pt-14 pb-4 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<h2 className="text-4xl md:text-6xl font-black tracking-tight text-balance max-w-3xl mb-3">
					{inf.headline.lead} <span style={{ color: "var(--pulse-lime)" }}>{inf.headline.highlight}</span>
				</h2>
				<p className="text-white/50 text-lg">{inf.subhead}</p>
			</div>

			<div className="px-6 md:px-12 pt-8" style={{ color: "var(--pulse-lime)" }}>
				<PulseLine className="w-full h-9 block" strokeWidth={1.2} />
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-3 border-t border-white/10">
				{INFRASTRUCTURE.map(({ key, icon: Icon }, i) => (
					<div
						key={key}
						className={`px-6 md:px-12 py-10 border-b lg:nth-last-[-n+3]:border-b-0 md:nth-last-[-n+2]:border-b-0 border-white/10 md:border-r md:nth-[2n]:border-r-0 lg:nth-[2n]:border-r lg:nth-[3n]:border-r-0 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
						style={{ transitionDelay: `${i * 80 + 150}ms` }}>
						<div className="flex items-center justify-between mb-6">
							<span className="font-mono text-[11px] tracking-[0.25em] text-white/25">0{i + 1}</span>
							<Icon className="size-5" style={{ color: "var(--pulse-lime)" }} />
						</div>
						<h3 className="text-lg font-bold mb-2.5">{inf.items[key].title}</h3>
						<p className="text-sm text-white/50 leading-relaxed">{inf.items[key].desc}</p>
					</div>
				))}
			</div>
		</section>
	);
}

function AccessAndDataSection() {
	const { dict } = useI18n();
	const a = dict.security.accessAndData;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{a.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{a.sectionRight}</MonoTag>
			</div>

			<div className="grid lg:grid-cols-2">
				{/* access controls */}
				<div className={`px-6 md:px-12 py-12 lg:border-r border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">{a.accessTitle}</h2>
					<p className="text-muted-foreground leading-relaxed mb-8">{a.accessIntro}</p>
					<ul className="divide-y divide-border border-y border-border">
						{a.accessControls.map((item) => (
							<li key={item} className="flex items-start gap-3 py-3 text-sm">
								<CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
								<span className="text-muted-foreground leading-relaxed">{item}</span>
							</li>
						))}
					</ul>
				</div>

				{/* data handling */}
				<div className={`px-6 md:px-12 py-12 border-t lg:border-t-0 border-border transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-3">{a.dataTitle}</h2>
					<p className="text-muted-foreground leading-relaxed mb-8">{a.dataIntro}</p>
					<div className="border border-border divide-y divide-border">
						{DATA_HANDLING.map(({ key, icon: Icon }) => (
							<div key={key} className="flex gap-4 px-5 py-4">
								<Icon className="size-4 text-accent shrink-0 mt-1" />
								<div>
									<p className="font-bold text-sm mb-1">{a.dataHandling[key].title}</p>
									<p className="text-sm text-muted-foreground leading-relaxed">{a.dataHandling[key].desc}</p>
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
	const { dict } = useI18n();
	const d = dict.security.disclosure;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>} className="border-b border-border">
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{d.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{d.sectionRight}</MonoTag>
			</div>

			<div className={`px-6 md:px-12 py-12 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
				<div className="flex items-center gap-3 mb-3">
					<AlertTriangle className="size-5 text-accent" />
					<h2 className="text-2xl md:text-3xl font-black tracking-tight">{d.title}</h2>
				</div>
				<p className="text-muted-foreground leading-relaxed mb-8 max-w-2xl">{d.intro}</p>

				<div className="border border-border divide-y divide-border max-w-2xl mb-8">
					{d.steps.map((item, i) => (
						<div key={item} className="flex items-center gap-4 px-5 py-3.5">
							<span className="font-mono text-[10px] tracking-[0.2em] text-accent font-bold shrink-0">0{i + 1}</span>
							<p className="text-sm text-muted-foreground">{item}</p>
						</div>
					))}
				</div>

				<div className="flex flex-col sm:flex-row gap-3">
					<CtaLink href="mailto:security@pulse.cc">
						{d.ctaPrimary} <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
					</CtaLink>
					<CtaLink href="/contact" variant="outline">
						{d.ctaSecondary}
					</CtaLink>
				</div>
			</div>
		</section>
	);
}
