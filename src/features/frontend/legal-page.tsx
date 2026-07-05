import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "./site-layout";
import { useInView, useMountVisible, PulseLine, MonoTag, CtaLink } from "./shared";

// ─────────────────────────────────────────────────────────────────────────────
// Shared editorial layout for legal documents (privacy, terms).
// Sections render as numbered clauses (§ 01 …) with a sticky mono index rail.
// ─────────────────────────────────────────────────────────────────────────────

export type LegalBodyPart = string | string[];

export interface LegalSection {
	id: string;
	title: string;
	body: LegalBodyPart[];
}

interface LegalPageProps {
	/** Mono doc code shown in the hero eyebrow, e.g. `PRIVACY_POLICY` */
	code: string;
	/** Headline before the highlighted word */
	heading: string;
	/** Word(s) rendered in the inverted primary block */
	headingHighlight: string;
	lastUpdated: string;
	entity: string;
	description: string;
	secondaryLink: { href: string; label: string };
	aside: { title: string; desc: string; email: string };
	sections: LegalSection[];
}

function SectionBody({ body }: { body: LegalBodyPart[] }) {
	return (
		<div className="space-y-4">
			{body.map((part, i) =>
				Array.isArray(part) ? (
					<ul key={i} className="space-y-2.5">
						{part.map((item, j) => (
							<li key={j} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
								<span className="mt-2 size-1.5 shrink-0 bg-accent" />
								{item}
							</li>
						))}
					</ul>
				) : (
					<p key={i} className="text-sm text-muted-foreground leading-relaxed">
						{part}
					</p>
				),
			)}
		</div>
	);
}

function Clause({ section, index }: { section: LegalSection; index: number }) {
	const { ref, inView } = useInView({ threshold: 0.05 });
	const num = String(index + 1).padStart(2, "0");
	return (
		<div
			ref={ref as React.RefObject<HTMLDivElement>}
			id={section.id}
			className={`scroll-mt-24 border-b border-border px-6 md:px-12 py-10 transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
			<div className="flex items-baseline gap-4 mb-5">
				<span className="font-mono text-[11px] tracking-[0.25em] text-accent font-bold shrink-0">§ {num}</span>
				<h2 className="text-xl md:text-2xl font-black tracking-tight">{section.title}</h2>
			</div>
			<div className="md:pl-14 max-w-3xl">
				<SectionBody body={section.body} />
			</div>
		</div>
	);
}

export function LegalPage({
	code,
	heading,
	headingHighlight,
	lastUpdated,
	entity,
	description,
	secondaryLink,
	aside,
	sections,
}: LegalPageProps) {
	const visible = useMountVisible();
	const [activeId, setActiveId] = useState<string>(sections[0].id);

	// Scroll spy
	useEffect(() => {
		const observers: IntersectionObserver[] = [];
		sections.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (!el) return;
			const obs = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) setActiveId(id);
				},
				{ rootMargin: "-20% 0px -70% 0px" },
			);
			obs.observe(el);
			observers.push(obs);
		});
		return () => observers.forEach((o) => o.disconnect());
	}, [sections]);

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
						className={`relative px-6 md:px-12 pt-16 md:pt-20 pb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
						<div className="flex items-center gap-3 mb-10">
							<span className="relative flex size-2">
								<span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 animate-ping" />
								<span className="relative inline-flex size-2 rounded-full bg-accent" />
							</span>
							<MonoTag className="text-foreground/70">
								LEGAL — {code}<span className="blink-cursor text-accent">_</span>
							</MonoTag>
						</div>

						<h1 className="max-w-4xl text-4xl md:text-6xl font-black leading-[1.04] tracking-tighter mb-6 text-balance">
							{heading}{" "}
							<span className="relative inline-block px-2 text-primary-foreground" style={{ background: "var(--color-primary)" }}>
								{headingHighlight}
							</span>
						</h1>

						<div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-6">
							<span>
								LAST UPDATED: <span className="text-foreground font-bold">{lastUpdated}</span>
							</span>
							<span>{entity}</span>
							<span>{sections.length} CLAUSES</span>
						</div>

						<p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">{description}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/contact">
								Questions? Contact us <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
							</CtaLink>
							<CtaLink href={secondaryLink.href} variant="outline">
								{secondaryLink.label}
							</CtaLink>
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── BODY: index rail + clauses ── */}
				<div className="grid lg:grid-cols-12">
					{/* Sticky index */}
					<aside className="hidden lg:block lg:col-span-3 border-r border-border">
						<div className="sticky top-24 px-6 py-8">
							<p className="font-mono text-[10px] tracking-[0.25em] text-primary mb-5">INDEX</p>
							<nav>
								{sections.map(({ id, title }, i) => {
									const isActive = activeId === id;
									return (
										<a
											key={id}
											href={`#${id}`}
											className={`flex items-baseline gap-3 py-2 border-l-2 pl-3 -ml-px text-[13px] leading-snug transition-colors duration-200 ${
												isActive
													? "border-accent text-foreground font-semibold"
													: "border-transparent text-muted-foreground hover:text-foreground"
											}`}>
											<span className={`font-mono text-[10px] shrink-0 ${isActive ? "text-accent font-bold" : "text-muted-foreground/50"}`}>
												{String(i + 1).padStart(2, "0")}
											</span>
											{title}
										</a>
									);
								})}
							</nav>

							{/* contact card */}
							<div className="mt-8 border border-border">
								<div className="px-4 py-2.5 border-b border-border">
									<span className="font-mono text-[9px] tracking-[0.25em] text-primary">{aside.title}</span>
								</div>
								<div className="px-4 py-3">
									<p className="text-xs text-muted-foreground mb-2">{aside.desc}</p>
									<a
										href={`mailto:${aside.email}`}
										className="font-mono text-[11px] text-primary hover:text-accent transition-colors">
										{aside.email}
									</a>
								</div>
							</div>
						</div>
					</aside>

					{/* Clauses */}
					<div className="lg:col-span-9">
						{sections.map((section, i) => (
							<Clause key={section.id} section={section} index={i} />
						))}

						{/* end-of-document mark */}
						<div className="flex items-center justify-between px-6 md:px-12 py-5 font-mono text-[10px] tracking-[0.25em] text-muted-foreground/60">
							<span>END OF DOCUMENT</span>
							<span>
								SIG.END<span className="blink-cursor text-accent">▌</span>
							</span>
						</div>
					</div>
				</div>
			</div>
		</SiteLayout>
	);
}
