import { useEffect, useState } from "react";
import { X, Languages } from "lucide-react";
import {
	LOCALE_META,
	dismissLocaleHint,
	fetchRegionLocale,
	hasDismissedLocaleHint,
	interpolate,
	loadDictionary,
	localeFromNavigator,
	readStoredLocale,
	useI18n,
	type Locale,
} from "@/i18n";

/**
 * Offers — never forces — a language switch when the visitor's region suggests
 * a different one than the URL is serving.
 *
 * Deliberately not a redirect: the URL stays authoritative, so a shared or
 * indexed link always renders the language it names. An explicit choice
 * (the cookie) always wins over region detection, so this never nags someone
 * who already picked.
 */
export function LocaleHint() {
	const { locale, switchLocale } = useI18n();

	// An explicit prior choice settles it without any async work: either they're
	// already where they want to be, or we point them back to it. Derived at
	// mount because neither the cookie nor the URL changes without a reload.
	const [suggested, setSuggested] = useState<Locale | null>(() => {
		if (hasDismissedLocaleHint()) return null;
		const stored = readStoredLocale();
		return stored && stored !== locale ? stored : null;
	});
	const [copy, setCopy] = useState<{ message: string; action: string; dismiss: string } | null>(null);

	useEffect(() => {
		// Only ask the edge when the visitor hasn't chosen for themselves.
		if (hasDismissedLocaleHint() || readStoredLocale()) return;

		let cancelled = false;
		(async () => {
			// Region first (that's the signal we're keying off), browser as fallback.
			const best = (await fetchRegionLocale()) ?? localeFromNavigator();
			if (!cancelled && best && best !== locale) setSuggested(best);
		})();
		return () => {
			cancelled = true;
		};
	}, [locale]);

	// Show the offer in the language being offered — someone who reads Spanish
	// should not have to parse an English sentence to find the Spanish site.
	useEffect(() => {
		if (!suggested) return;
		let cancelled = false;
		loadDictionary(suggested)
			.then((dict) => {
				if (cancelled) return;
				setCopy({
					message: interpolate(dict.common.localeHint.message, { language: LOCALE_META[suggested].native }),
					action: dict.common.localeHint.action,
					dismiss: dict.common.localeHint.dismiss,
				});
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, [suggested]);

	if (!suggested || !copy) return null;

	const close = () => {
		dismissLocaleHint();
		setSuggested(null);
	};

	return (
		<div
			role="region"
			aria-label={copy.message}
			className="fixed bottom-4 left-4 z-60 max-w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-2 duration-300 border border-white/10 text-white shadow-[0_24px_60px_-16px_rgba(0,34,25,0.45)]"
			style={{ background: "var(--pulse-ink)" }}>
			<div className="flex items-center gap-3 px-4 py-3">
				<Languages className="size-4 shrink-0" style={{ color: "var(--pulse-lime)" }} />
				<p className="text-sm text-white/85">{copy.message}</p>

				<button
					onClick={() => switchLocale(suggested)}
					className="shrink-0 px-3 py-1.5 font-mono text-[11px] tracking-[0.15em] uppercase font-bold text-(--pulse-ink-deep) transition-opacity duration-200 hover:opacity-85"
					style={{ background: "var(--pulse-lime)" }}>
					{copy.action}
				</button>

				<button
					onClick={close}
					aria-label={copy.dismiss}
					className="shrink-0 p-1 text-white/40 hover:text-white transition-colors">
					<X className="size-4" />
				</button>
			</div>
		</div>
	);
}
