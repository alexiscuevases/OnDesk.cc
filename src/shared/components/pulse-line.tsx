/**
 * Animated EKG line. Renders a faint base trace + a bright traveling signal.
 * The traveling stroke is driven by the `ekg-path` animation in index.css.
 */
export function PulseLine({ className = "", strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
	const d =
		"M0 20 H70 L82 20 L90 6 L100 34 L108 20 H190 L200 15 L208 20 H290 L302 20 L310 2 L322 38 L330 20 H430 L442 26 L450 20 H600";
	return (
		<svg viewBox="0 0 600 40" preserveAspectRatio="none" className={className} aria-hidden="true">
			<path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} opacity={0.18} />
			<path d={d} fill="none" stroke="currentColor" strokeWidth={strokeWidth} pathLength={100} className="ekg-path" />
		</svg>
	);
}
