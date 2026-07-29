import { SiteLayout } from "./site-layout";
import { Bell } from "lucide-react";
import { useState } from "react";
import { useInView, useMountVisible, PulseLine, MonoTag, CtaLink, DarkCta } from "./shared";
import { useI18n, useLocalizedSeo, type Dictionary } from "@/i18n";

// ── Structure ──
// Version numbers, release tiers and per-change types are release facts, so they
// stay here. Only labels and change text come from the dictionary.

type FilterId = keyof Dictionary["changelog"]["filters"];
type ReleaseVersion = keyof Dictionary["changelog"]["releases"];
type ChangeType = keyof Dictionary["changelog"]["changeTypes"];

interface ReleaseConfig {
	version: ReleaseVersion;
	tier: Exclude<FilterId, "all">;
	/** Pairs by index with the dictionary's `changes` array. */
	types: ChangeType[];
}

const RELEASES: ReleaseConfig[] = [
	{ version: "3.5.0", tier: "minor", types: ["new", "new", "new", "new", "improvement", "fix"] },
	{ version: "3.4.0", tier: "major", types: ["new", "new", "new", "improvement", "improvement", "fix"] },
	{ version: "3.3.2", tier: "patch", types: ["fix", "fix", "improvement"] },
	{ version: "3.3.0", tier: "minor", types: ["new", "new", "new", "improvement", "fix"] },
	{ version: "3.2.0", tier: "minor", types: ["new", "new", "improvement", "improvement", "fix"] },
	{ version: "3.1.0", tier: "minor", types: ["new", "new", "improvement", "fix"] },
	{ version: "3.0.0", tier: "major", types: ["new", "new", "new", "new", "new"] },
];

const FILTER_IDS: readonly FilterId[] = ["all", "major", "minor", "patch"];

const TYPE_CLASSES: Record<ChangeType, string> = {
	new: "text-accent border-accent/40",
	improvement: "text-primary border-primary/30",
	fix: "text-amber-600 border-amber-500/40",
};

const TIER_CLASSES: Record<Exclude<FilterId, "all">, string> = {
	major: "bg-primary text-primary-foreground border-primary",
	minor: "text-primary border-primary/40",
	patch: "text-muted-foreground border-border",
};

export default function ChangelogPage() {
	const { dict, locale, pl } = useI18n();
	useLocalizedSeo({ ...dict.meta.changelog, path: "/changelog", locale });

	const hero = dict.changelog.hero;
	const [filter, setFilter] = useState<FilterId>("all");
	const visible = useMountVisible();
	const filtered = filter === "all" ? RELEASES : RELEASES.filter((r) => r.tier === filter);

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

						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10">{hero.subhead}</p>

						<div className="flex flex-col sm:flex-row gap-3">
							<CtaLink href="/auth/signup">
								{hero.cta} <Bell className="size-3.5" />
							</CtaLink>
						</div>
					</div>

					{/* EKG divider */}
					<div className="border-t border-border text-accent">
						<PulseLine className="w-full h-10 block" />
					</div>
				</section>

				{/* ── FILTER BAR ── */}
				<div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-12 py-4 border-b border-border">
					<div className="flex gap-2 flex-wrap">
						{FILTER_IDS.map((id) => (
							<button
								key={id}
								onClick={() => setFilter(id)}
								aria-pressed={filter === id}
								className={`px-4 py-2 border font-mono text-[11px] tracking-[0.15em] uppercase font-semibold transition-colors duration-200 ${
									filter === id
										? "bg-primary text-primary-foreground border-primary"
										: "text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
								}`}>
								{dict.changelog.filters[id]}
							</button>
						))}
					</div>
					<MonoTag>{pl(dict.changelog.releasesFound, filtered.length)}</MonoTag>
				</div>

				<VersionLog releases={filtered} filter={filter} />

				<DarkCta
					tag={dict.changelog.finalCta.tag}
					headline={
						<>
							{dict.changelog.finalCta.headline.lead}{" "}
							<span style={{ color: "var(--pulse-lime)" }}>{dict.changelog.finalCta.headline.highlight}</span>
						</>
					}
					desc={dict.changelog.finalCta.desc}
					primary={{ href: "/contact", label: dict.changelog.finalCta.primary }}
					secondary={{ href: "/auth/signup", label: dict.changelog.finalCta.secondary }}
				/>
			</div>
		</SiteLayout>
	);
}

function VersionLog({ releases, filter }: { releases: ReleaseConfig[]; filter: FilterId }) {
	const { dict } = useI18n();
	const { ref, inView } = useInView({ threshold: 0.02 });

	return (
		<section ref={ref as React.RefObject<HTMLElement>} key={filter} className="animate-in fade-in duration-300">
			{releases.map((release, i) => {
				const copy = dict.changelog.releases[release.version];
				return (
					<article
						key={release.version}
						className={`grid lg:grid-cols-12 border-b border-border transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
						style={{ transitionDelay: `${Math.min(i, 4) * 80}ms` }}>
						{/* version rail */}
						<div className="lg:col-span-3 px-6 md:px-12 lg:pr-8 pt-10 pb-4 lg:pb-10 lg:border-r border-border">
							<div className="lg:sticky lg:top-24">
								<div className="flex lg:flex-col items-center lg:items-start gap-4 lg:gap-3">
									<h2 className="text-3xl font-black tracking-tighter" style={{ fontVariantNumeric: "tabular-nums" }}>
										v{release.version}
									</h2>
									<span className="font-mono text-[10px] tracking-[0.25em] text-muted-foreground">{copy.date}</span>
									<span className={`font-mono text-[9px] tracking-[0.25em] border px-2 py-1 font-bold ${TIER_CLASSES[release.tier]}`}>
										{dict.changelog.filters[release.tier].toUpperCase()}
									</span>
								</div>
							</div>
						</div>

						{/* changes */}
						<div className="lg:col-span-9 px-6 md:px-12 pt-2 lg:pt-10 pb-10">
							<h3 className="text-xl md:text-2xl font-black tracking-tight mb-6 text-balance">{copy.headline}</h3>
							<ul className="divide-y divide-border border-y border-border">
								{copy.changes.map((text, ci) => {
									const type = release.types[ci] ?? "improvement";
									return (
										<li key={ci} className="flex items-start gap-4 py-3 group/item">
											<span
												className={`shrink-0 w-22 text-center font-mono text-[9px] tracking-[0.2em] border px-1.5 py-1 font-bold mt-0.5 ${TYPE_CLASSES[type]}`}>
												{dict.changelog.changeTypes[type]}
											</span>
											<span className="text-sm text-muted-foreground leading-relaxed group-hover/item:text-foreground transition-colors duration-200">
												{text}
											</span>
										</li>
									);
								})}
							</ul>
						</div>
					</article>
				);
			})}
		</section>
	);
}
