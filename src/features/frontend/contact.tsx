import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, MessageSquare, Phone, CheckCircle2, Clock, MapPin, Zap, ArrowRight } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useCounter, useMountVisible, PulseLine, MonoTag, Cross } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Submitted values stay here; labels come from the dictionary.

const CHANNELS = [
	{ key: "general", icon: MessageSquare, email: "hello@pulse.cc" },
	{ key: "sales", icon: Mail, email: "sales@pulse.cc" },
	{ key: "enterprise", icon: Phone, email: "enterprise@pulse.cc" },
	{ key: "press", icon: Zap, email: "press@pulse.cc" },
] as const;

const OFFICE_KEYS = ["london", "seattle"] as const;
const RESPONSE_KEYS = ["sales", "enterprise", "general", "press"] as const;
const TEAM_SIZE_VALUES = ["1-10", "11-50", "51-200", "200+"] as const;
const REASON_VALUES = ["general", "sales", "enterprise", "technical", "partnership", "other"] as const;

type ReasonValue = (typeof REASON_VALUES)[number];
type ContactDict = Dictionary["contact"];

const INPUT_SQUARE = "rounded-none";

// ── Page ──

export default function ContactPage() {
	const { dict, locale, num } = useI18n();
	useLocalizedSeo({ ...dict.meta.contact, path: "/contact", locale });

	const hero = dict.contact.hero;
	const visible = useMountVisible();
	const [submitted, setSubmitted] = useState(false);
	const [reason, setReason] = useState<ReasonValue | "">("");
	const { ref: statsRef, inView: statsInView } = useInView();
	const c1200 = useCounter(1200, 1300, statsInView);
	const c9997 = useCounter(9997, 1400, statsInView);

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
						</h1>

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">{hero.subhead}</p>
					</div>

					{/* stats row */}
					<div ref={statsRef as React.RefObject<HTMLDivElement>} className="relative border-t border-border">
						<Cross className="-top-2 -left-1.5" />
						<Cross className="-top-2 -right-1.5" />
						<div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-border">
							{[
								{ value: hero.stats.response.value, label: hero.stats.response.label },
								{ value: hero.stats.soc2.value, label: hero.stats.soc2.label },
								{ value: `${num(c1200)}+`, label: hero.stats.customers },
								{
									value: `${num(c9997 / 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
									label: hero.stats.uptime,
								},
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

				<ChannelsSection />
				<FormSection submitted={submitted} setSubmitted={setSubmitted} reason={reason} setReason={setReason} />
			</div>
		</SiteLayout>
	);
}

// ── Sections ──

function ChannelsSection() {
	const { dict } = useI18n();
	const c = dict.contact.channels;
	const { ref, inView } = useInView();

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{c.sectionLabel}</MonoTag>
				<MonoTag className="hidden sm:block">{c.sectionRight}</MonoTag>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border-b border-border">
				{CHANNELS.map(({ key, icon: Icon, email }, i) => {
					const option = c.options[key];
					return (
						<div
							key={key}
							className={`group relative bg-background px-6 py-8 flex flex-col transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
							style={{ transitionDelay: `${i * 80}ms` }}>
							<span className="absolute top-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-accent" />
							<div className="flex items-center justify-between mb-6">
								<Icon className="size-5 text-accent" />
								<span className="font-mono text-[9px] tracking-[0.2em] border border-accent/40 text-accent px-2 py-1 font-bold">
									{option.badge}
								</span>
							</div>
							<h3 className="font-black text-lg tracking-tight mb-2">{option.title}</h3>
							<p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{option.desc}</p>
							<a
								href={`mailto:${email}`}
								className="font-mono text-[11px] text-primary hover:text-accent transition-colors border-t border-border pt-4">
								{email}
							</a>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function FormSection({
	submitted,
	setSubmitted,
	reason,
	setReason,
}: {
	submitted: boolean;
	setSubmitted: (v: boolean) => void;
	reason: ReasonValue | "";
	setReason: (v: ReasonValue) => void;
}) {
	const { dict, path } = useI18n();
	const f: ContactDict["form"] = dict.contact.form;
	const { ref, inView } = useInView();

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmitted(true);
	}

	const placeholder = reason ? f.reasonHints[reason] : f.messagePlaceholder;

	return (
		<section ref={ref as React.RefObject<HTMLElement>}>
			<div className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
				<MonoTag className="text-primary">{f.sectionLabel}</MonoTag>
				<span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground">
					<span className="size-1.5 rounded-full bg-accent animate-pulse" />
					{f.sectionRight}
				</span>
			</div>

			<div className="grid lg:grid-cols-12 border-b border-border">
				{/* form */}
				<div
					className={`lg:col-span-7 lg:border-r border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
					<div className="flex items-center justify-between px-6 md:px-12 py-3 border-b border-border">
						<span className="font-mono text-[10px] tracking-[0.25em] text-primary">{f.newMessage}</span>
						<span className="font-mono text-[10px] tracking-widest text-muted-foreground/60">{f.encrypted}</span>
					</div>

					<div className="px-6 md:px-12 py-10">
						{submitted ? (
							<div className="py-10">
								<p className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent font-bold mb-4">
									{f.success.tag}
									<span className="blink-cursor">_</span>
								</p>
								<div className="inline-flex items-center justify-center size-14 border border-accent/40 bg-accent/5 mb-6">
									<CheckCircle2 className="size-7 text-accent" />
								</div>
								<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{f.success.title}</h2>
								<p className="text-muted-foreground mb-8">{f.success.desc}</p>
								<div className="flex flex-col sm:flex-row gap-3 max-w-md">
									<Button
										variant="outline"
										className="flex-1 h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold"
										onClick={() => setSubmitted(false)}>
										{f.success.sendAnother}
									</Button>
									<Button asChild className="flex-1 h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold">
										<a href={path("/help")}>{f.success.helpCenter}</a>
									</Button>
								</div>
							</div>
						) : (
							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="mb-8">
									<h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">{f.title}</h2>
									<p className="text-sm text-muted-foreground">{f.subtitle}</p>
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="first-name">{f.firstName}</Label>
										<Input id="first-name" placeholder={f.firstNamePlaceholder} required className={INPUT_SQUARE} />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="last-name">{f.lastName}</Label>
										<Input id="last-name" placeholder={f.lastNamePlaceholder} required className={INPUT_SQUARE} />
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="email">{f.email}</Label>
									<Input id="email" type="email" placeholder={f.emailPlaceholder} required className={INPUT_SQUARE} />
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<div className="space-y-1.5">
										<Label htmlFor="company">{f.company}</Label>
										<Input id="company" placeholder={f.companyPlaceholder} className={INPUT_SQUARE} />
									</div>
									<div className="space-y-1.5">
										<Label htmlFor="team-size">{f.teamSize}</Label>
										<Select>
											<SelectTrigger id="team-size" className={INPUT_SQUARE}>
												<SelectValue placeholder={f.teamSizePlaceholder} />
											</SelectTrigger>
											<SelectContent>
												{TEAM_SIZE_VALUES.map((value) => (
													<SelectItem key={value} value={value}>
														{f.teamSizes[value]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="reason">{f.reason}</Label>
									<Select onValueChange={(v) => setReason(v as ReasonValue)}>
										<SelectTrigger id="reason" className={INPUT_SQUARE}>
											<SelectValue placeholder={f.reasonPlaceholder} />
										</SelectTrigger>
										<SelectContent>
											{REASON_VALUES.map((value) => (
												<SelectItem key={value} value={value}>
													{f.reasons[value]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="message">{f.message}</Label>
									<Textarea id="message" placeholder={placeholder} rows={5} required className={`resize-none ${INPUT_SQUARE}`} />
								</div>
								<Button
									type="submit"
									size="lg"
									className="w-full h-12 rounded-none font-mono text-xs tracking-[0.15em] uppercase font-semibold group">
									{f.submit}
									<ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
								</Button>
								<p className="text-xs text-center text-muted-foreground">
									{f.privacyPrefix}{" "}
									<a href={path("/privacy")} className="underline underline-offset-2 hover:text-foreground transition-colors">
										{f.privacyLink}
									</a>
									.
								</p>
							</form>
						)}
					</div>
				</div>

				<FormSidebar />
			</div>
		</section>
	);
}

function FormSidebar() {
	const { dict, path } = useI18n();
	const s = dict.contact.sidebar;
	const { ref, inView } = useInView();

	return (
		<div
			ref={ref as React.RefObject<HTMLDivElement>}
			className={`lg:col-span-5 border-t lg:border-t-0 border-border transition-all duration-700 delay-150 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
			{/* offices */}
			<div className="border-b border-border">
				<div className="px-6 md:px-10 py-3 border-b border-border">
					<span className="font-mono text-[10px] tracking-[0.25em] text-primary">{s.officesTitle}</span>
				</div>
				<div className="divide-y divide-border">
					{OFFICE_KEYS.map((key) => (
						<div key={key} className="flex items-start gap-3 px-6 md:px-10 py-4">
							<MapPin className="size-4 text-accent shrink-0 mt-0.5" />
							<div>
								<p className="text-sm font-bold">{s.offices[key].city}</p>
								<p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground mt-1">{s.offices[key].address}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* response times */}
			<div className="border-b border-border">
				<div className="flex items-center gap-2 px-6 md:px-10 py-3 border-b border-border">
					<Clock className="size-3 text-accent" />
					<span className="font-mono text-[10px] tracking-[0.25em] text-primary">{s.responseTitle}</span>
				</div>
				<div className="divide-y divide-border">
					{RESPONSE_KEYS.map((key) => (
						<div key={key} className="flex items-center justify-between px-6 md:px-10 py-3 font-mono text-[10px] tracking-[0.2em]">
							<span className="text-muted-foreground">{s.responseTimes[key].channel}</span>
							<span className="text-primary font-bold">{s.responseTimes[key].time}</span>
						</div>
					))}
				</div>
			</div>

			{/* help center promo */}
			<div className="px-6 md:px-10 py-8">
				<Zap className="size-5 text-accent mb-4" />
				<p className="font-bold text-sm mb-1">{s.promoTitle}</p>
				<p className="text-sm text-muted-foreground leading-relaxed mb-5">{s.promoDesc}</p>
				<a
					href={path("/help")}
					className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase font-semibold text-primary hover:text-accent transition-colors">
					{s.promoCta} <ArrowRight className="size-3" />
				</a>
			</div>
		</div>
	);
}
