import { DEFAULT_LOCALE, type Locale } from "./config";
import type en from "./locales/en";

/** Shape every locale must satisfy. English is the source of truth. */
export type Dictionary = typeof en;

// Each locale is a separate dynamic import, so a visitor only downloads the
// language they're actually reading.
const loaders: Record<Locale, () => Promise<{ default: Dictionary }>> = {
	en: () => import("./locales/en"),
	es: () => import("./locales/es"),
};

const cache = new Map<Locale, Dictionary>();

export async function loadDictionary(locale: Locale): Promise<Dictionary> {
	const cached = cache.get(locale);
	if (cached) return cached;

	try {
		const mod = await loaders[locale]();
		cache.set(locale, mod.default);
		return mod.default;
	} catch (err) {
		// A missing chunk must not blank the page — fall back to English.
		if (locale === DEFAULT_LOCALE) throw err;
		console.error(`[i18n] failed to load "${locale}" dictionary, falling back to ${DEFAULT_LOCALE}`, err);
		return loadDictionary(DEFAULT_LOCALE);
	}
}

/** Synchronous read for code paths that know the dictionary is already loaded. */
export function peekDictionary(locale: Locale): Dictionary | undefined {
	return cache.get(locale);
}
