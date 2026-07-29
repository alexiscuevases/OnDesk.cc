import { createContext, useContext } from "react";
import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import type { PluralForms } from "./format";

// Context + hooks live in their own module (no JSX) so the provider file can
// export components only — keeps Fast Refresh working in dev.

export interface I18nValue {
	locale: Locale;
	dict: Dictionary;
	/** Rewrites an authored app path (`/pricing`) for the active locale. */
	path: (path: string) => string;
	/** Fills `{name}` placeholders in a dictionary string. */
	t: (template: string, vars?: Record<string, string | number>) => string;
	/**
	 * Picks a plural form by the locale's own rules, then fills placeholders.
	 * `pl(dict.x.releasesFound, n)` with `{ one: "{count} release", other: "{count} releases" }`.
	 */
	pl: (forms: PluralForms, count: number, vars?: Record<string, string | number>) => string;
	/** Locale-aware number grouping. */
	num: (value: number, options?: Intl.NumberFormatOptions) => string;
	/** USD amount with locale-aware grouping and an unambiguous symbol. */
	usd: (value: number) => string;
	/** Records the choice and reloads the same page in the new locale. */
	switchLocale: (next: Locale) => void;
}

export const I18nContext = createContext<I18nValue | null>(null);

export function useI18n(): I18nValue {
	const ctx = useContext(I18nContext);
	if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
	return ctx;
}

/** Active locale without pulling in the dictionary. */
export function useLocale(): Locale {
	return useI18n().locale;
}
