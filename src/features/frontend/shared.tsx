/**
 * Shared utilities for all frontend (marketing) pages.
 *
 * Import hooks, components and style helpers from here instead of
 * copy-pasting them into each page file.
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

/** Fires once when the observed element enters the viewport. */
export function useInView(options?: IntersectionObserverInit) {
    const ref = useRef<HTMLElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.1, ...options },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return { ref, inView };
}

/** Animates a number from 0 → target once `active` flips to true. */
export function useCounter(target: number, duration = 1200, active = false) {
    const [value, setValue] = useState(0);
    useEffect(() => {
        if (!active) return;
        let start = 0;
        const step = target / (duration / 16);
        const id = setInterval(() => {
            start += step;
            if (start >= target) {
                setValue(target);
                clearInterval(id);
            } else {
                setValue(Math.floor(start));
            }
        }, 16);
        return () => clearInterval(id);
    }, [target, duration, active]);
    return value;
}

/** Returns true after the first animation frame – used for mount-in transitions. */
export function useMountVisible() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const id = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(id);
    }, []);
    return visible;
}

/** Tracks mouse position – used for hero glow effects. */
export function useMouseGlow() {
    const [pos, setPos] = useState({ x: -1000, y: -1000 });
    const onMove = useCallback((e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY }), []);
    useEffect(() => {
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, [onMove]);
    return pos;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Pill badge shown above section headings. */
export function SectionBadge({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex justify-center mb-5">
            <span className="site-section-badge">
                <Icon className="size-3.5" />
                {label}
            </span>
        </div>
    );
}

/**
 * Wraps children in a primary→accent gradient text span.
 * Usage: <GradientText>speed of AI</GradientText>
 */
export function GradientText({ children }: { children: React.ReactNode }) {
    return (
        <span className="gradient-text">
            {children}
        </span>
    );
}

/**
 * Hover radial-gradient glow overlay – place as the *first* child inside a
 * `relative overflow-hidden group` card container.
 */
export function CardGlow({ intensity = 7 }: { intensity?: number }) {
    return (
        <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
                background: `radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--color-primary) ${intensity}%, transparent), transparent 70%)`,
            }}
        />
    );
}

/**
 * Hover inset-border overlay – place after CardGlow inside `relative group`
 * card containers.
 */
export function CardBorder({ opacity = 25 }: { opacity?: number }) {
    return (
        <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--color-primary) ${opacity}%, transparent)` }}
        />
    );
}

/**
 * Standard hero section background.
 * Includes: linear gradient, mouse-following glow, and dot grid.
 */
export function HeroBg({ mousePos }: { mousePos: { x: number; y: number } }) {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-linear-to-br from-primary/6 via-background to-accent/4" />
            <div
                className="absolute size-150 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] transition-all duration-700 ease-out"
                style={{ left: mousePos.x, top: mousePos.y, background: "color-mix(in srgb, var(--color-primary) 10%, transparent)" }}
            />
            <div className="dot-grid absolute inset-0 opacity-[0.025]" />
        </div>
    );
}

/**
 * Standard CTA section decorative overlays (white dot grid + blobs).
 * Render inside a `relative overflow-hidden` wrapper that already has the
 * gradient background applied via `cta-gradient` class or inline style.
 */
export function CtaDecorations() {
    return (
        <>
            <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />
            <div className="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 size-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        </>
    );
}

/**
 * Icon container used in feature/info cards.
 * Sizes: sm (size-9), md (size-11, default), lg (size-12).
 */
export function IconBox({
    icon: Icon,
    size = "md",
}: {
    icon: React.ElementType;
    size?: "sm" | "md" | "lg";
}) {
    const boxSize = size === "sm" ? "size-9" : size === "lg" ? "size-12" : "size-11";
    const iconSize = size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5";
    return (
        <div
            className={`${boxSize} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0`}
            style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
        >
            <Icon className={`${iconSize} text-primary`} />
        </div>
    );
}
