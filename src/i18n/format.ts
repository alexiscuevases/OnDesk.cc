import type { Locale } from "./config";

/**
 * Fills `{name}` placeholders in a dictionary string.
 * Unknown placeholders are left untouched so a typo is visible rather than
 * silently rendering an empty gap.
 */
export function interpolate(template: string, vars: Record<string, string | number> = {}): string {
	return template.replace(/\{(\w+)\}/g, (match, key: string) =>
		key in vars ? String(vars[key]) : match,
	);
}

/**
 * Plural forms a dictionary entry must supply. English only distinguishes
 * one/other, which covers Spanish too; a language with more categories (Polish,
 * Arabic, …) would add its keys here and `pluralize` would pick them up.
 */
export interface PluralForms {
	one: string;
	other: string;
}

const pluralRulesCache = new Map<Locale, Intl.PluralRules>();

/**
 * Picks the right plural form for `count` using the locale's own rules, rather
 * than the `count !== 1 ? "s" : ""` trick, which only works in English.
 */
export function pluralize(forms: PluralForms, count: number, locale: Locale): string {
	let rules = pluralRulesCache.get(locale);
	if (!rules) {
		rules = new Intl.PluralRules(locale);
		pluralRulesCache.set(locale, rules);
	}
	const category = rules.select(count);
	// Fall back to `other` for any category this entry doesn't define.
	return category === "one" ? forms.one : forms.other;
}

// Formatters are cached — constructing Intl objects per render is measurably slow.
const numberCache = new Map<string, Intl.NumberFormat>();

function numberFormatter(locale: Locale, options: Intl.NumberFormatOptions = {}): Intl.NumberFormat {
	const key = `${locale}:${JSON.stringify(options)}`;
	let fmt = numberCache.get(key);
	if (!fmt) {
		fmt = new Intl.NumberFormat(locale, options);
		numberCache.set(key, fmt);
	}
	return fmt;
}

/** Locale-aware digit grouping: 1,200 (en) vs 1.200 (es). */
export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
	return numberFormatter(locale, options).format(value);
}

/**
 * Currency symbol per locale. A bare `$` is ambiguous across Latin America
 * (it reads as the local peso), so Spanish gets the explicit `US$` form.
 *
 * Written out rather than delegating to `Intl` currency style on purpose: es-ES
 * would render `9 US$` with the symbol trailing, which breaks the pricing
 * page's oversized-numeral layout. The symbol stays a prefix in every locale.
 */
const USD_SYMBOL: Record<Locale, string> = {
	en: "$",
	es: "US$",
};

/**
 * Prices are billed in USD in every locale — only digit grouping and the symbol
 * form change, so the amount a visitor reads always matches what they pay.
 */
export function formatUsd(value: number, locale: Locale): string {
	return `${USD_SYMBOL[locale]}${formatNumber(value, locale)}`;
}
