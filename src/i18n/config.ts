// ─── locale registry ─────────────────────────────────────────────────────────
// The default locale is served unprefixed (`/pricing`); every other locale
// lives behind its own path segment (`/es/pricing`) so each language has a
// distinct, indexable URL.

export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that carry a path prefix (everything except the default). */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

export const LOCALE_META: Record<Locale, { native: string; english: string; short: string; htmlLang: string }> = {
	en: { native: "English", english: "English", short: "EN", htmlLang: "en" },
	es: { native: "Español", english: "Spanish", short: "ES", htmlLang: "es" },
};

/** Cookie holding an *explicit* user choice. Region detection never writes it. */
export const LOCALE_COOKIE = "pulse_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

/** Set once the visitor dismisses the "view this in <lang>" bar. */
export const LOCALE_HINT_DISMISSED_KEY = "pulse_locale_hint_dismissed";

// ─── region → locale ─────────────────────────────────────────────────────────
// Keyed by ISO 3166-1 alpha-2, as returned by Cloudflare's `request.cf.country`.
// Only Spanish-speaking countries need an entry; everything else falls through
// to the default locale.

export const COUNTRY_LOCALE: Readonly<Record<string, Locale>> = {
	AR: "es", // Argentina
	BO: "es", // Bolivia
	CL: "es", // Chile
	CO: "es", // Colombia
	CR: "es", // Costa Rica
	CU: "es", // Cuba
	DO: "es", // Dominican Republic
	EC: "es", // Ecuador
	ES: "es", // Spain
	GQ: "es", // Equatorial Guinea
	GT: "es", // Guatemala
	HN: "es", // Honduras
	MX: "es", // Mexico
	NI: "es", // Nicaragua
	PA: "es", // Panama
	PE: "es", // Peru
	PR: "es", // Puerto Rico
	PY: "es", // Paraguay
	SV: "es", // El Salvador
	UY: "es", // Uruguay
	VE: "es", // Venezuela
};

// ─── guards ──────────────────────────────────────────────────────────────────

export function isLocale(value: unknown): value is Locale {
	return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Narrows an arbitrary BCP-47 tag to a supported locale by primary subtag,
 * so `es-419`, `es-MX` and `ES` all resolve to `es`.
 */
export function normalizeLocale(tag: string | null | undefined): Locale | null {
	if (!tag) return null;
	const primary = tag.trim().toLowerCase().split(/[-_]/)[0];
	return isLocale(primary) ? primary : null;
}

export function localeFromCountry(country: string | null | undefined): Locale | null {
	if (!country) return null;
	return COUNTRY_LOCALE[country.trim().toUpperCase()] ?? null;
}

// ─── path helpers ────────────────────────────────────────────────────────────

/**
 * Splits a pathname into its locale prefix and the remaining route.
 * `/es/pricing` → `{ locale: "es", path: "/pricing" }`
 * `/pricing`    → `{ locale: null, path: "/pricing" }`
 */
export function splitLocalePath(pathname: string): { locale: Locale | null; path: string } {
	const [, first = "", ...rest] = pathname.split("/");
	if (isLocale(first) && first !== DEFAULT_LOCALE) {
		return { locale: first, path: `/${rest.join("/")}`.replace(/\/$/, "") || "/" };
	}
	return { locale: null, path: pathname || "/" };
}

/**
 * Route subtrees that live *outside* the `{-$lang}` layout and therefore have no
 * locale-prefixed URL. Prefixing one of these would produce a 404, so
 * `localizePath` passes them through untouched.
 *
 * As each area gets localized (auth is next), move its routes under
 * `src/routes/{-$lang}/` and delete the entry here.
 */
const UNLOCALIZED_PREFIXES = ["/auth", "/w", "/workspaces", "/api"] as const;

function isUnlocalized(path: string): boolean {
	return UNLOCALIZED_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

/**
 * Rewrites an unprefixed app path for the given locale. Pass paths as they are
 * authored in the codebase (`/pricing`, `/solutions/agencies`); the default
 * locale is returned untouched so English URLs never change.
 */
export function localizePath(path: string, locale: Locale): string {
	// Tolerate already-prefixed input so callers can localize a live pathname.
	const { path: bare } = splitLocalePath(path);
	const normalized = bare.startsWith("/") ? bare : `/${bare}`;

	if (locale === DEFAULT_LOCALE || isUnlocalized(normalized)) return normalized;
	return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

/** Absolute URL for a path in a given locale — used for canonical/hreflang. */
export function localizeUrl(path: string, locale: Locale, origin: string): string {
	return `${origin.replace(/\/$/, "")}${localizePath(path, locale)}`;
}
