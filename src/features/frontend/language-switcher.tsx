import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES, LOCALE_META, useI18n } from "@/i18n";

/**
 * Language selector in the editorial system's voice: hairline border, mono
 * uppercase label, no rounded corners.
 *
 * `variant="dark"` is for the ink-coloured footer; `"light"` for the navbar.
 * The menu opens away from the nearest page edge — down in the navbar, up in
 * the footer.
 */
export function LanguageSwitcher({
	variant = "light",
	open: openDirection = variant === "dark" ? "up" : "down",
}: {
	variant?: "light" | "dark";
	open?: "up" | "down";
}) {
	const { locale, dict, switchLocale } = useI18n();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const onDown = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDown);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("mousedown", onDown);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const dark = variant === "dark";

	return (
		<div ref={ref} className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				aria-label={dict.common.language.select}
				aria-expanded={open}
				className={`flex items-center gap-1.5 px-2.5 py-1.5 border font-mono text-[10px] tracking-[0.2em] uppercase font-semibold transition-colors duration-200 ${
					dark
						? "border-white/15 text-white/55 hover:border-(--pulse-lime) hover:text-(--pulse-lime)"
						: "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
				}`}>
				<Globe className="size-3" />
				{LOCALE_META[locale].short}
				<ChevronDown className={`size-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
			</button>

			{open && (
				<div
					className={`absolute right-0 w-44 border shadow-[0_20px_50px_-16px_rgba(0,34,25,0.3)] animate-in fade-in duration-200 ${
						openDirection === "up" ? "bottom-full mb-1 slide-in-from-bottom-1" : "top-full mt-1 slide-in-from-top-1"
					} ${dark ? "border-white/15" : "border-border bg-background"}`}
					style={dark ? { background: "var(--pulse-ink-deep)" } : undefined}>
					<div
						className={`px-3 py-2 border-b font-mono text-[10px] tracking-[0.25em] ${
							dark ? "border-white/10 text-(--pulse-lime)" : "border-border text-primary"
						}`}>
						{dict.common.language.mono}
					</div>

					{LOCALES.map((l) => {
						const active = l === locale;
						return (
							<button
								key={l}
								onClick={() => {
									setOpen(false);
									if (!active) switchLocale(l);
								}}
								lang={LOCALE_META[l].htmlLang}
								className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors duration-150 ${
									dark
										? active
											? "text-white bg-white/5 font-medium"
											: "text-white/60 hover:text-white hover:bg-white/5"
										: active
											? "text-foreground bg-accent/5 font-medium"
											: "text-muted-foreground hover:text-foreground hover:bg-muted/50"
								}`}>
								<span className={`font-mono text-[10px] tracking-widest ${active ? "text-accent" : "opacity-50"}`}>
									{LOCALE_META[l].short}
								</span>
								<span className="flex-1">{LOCALE_META[l].native}</span>
								{active && <Check className="size-3.5 text-accent shrink-0" />}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
