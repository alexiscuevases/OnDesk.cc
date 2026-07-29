import {
	DEFAULT_LOCALE,
	LOCALE_COOKIE,
	LOCALE_COOKIE_MAX_AGE,
	LOCALE_HINT_DISMISSED_KEY,
	isLocale,
	localeFromCountry,
	normalizeLocale,
	type Locale,
} from "./config";

// The URL is always the source of truth for which locale renders. Detection
// only decides (a) where to send a returning visitor who already picked a
// language, and (b) whether to offer the switch to a first-time visitor.

// ─── explicit choice (cookie) ────────────────────────────────────────────────

export function readStoredLocale(): Locale | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
	if (!match) return null;
	const value = decodeURIComponent(match[1]);
	return isLocale(value) ? value : null;
}

export function storeLocale(locale: Locale): void {
	if (typeof document === "undefined") return;
	const secure = window.location.protocol === "https:" ? "; Secure" : "";
	document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(locale)}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

// ─── browser preference ──────────────────────────────────────────────────────

export function localeFromNavigator(): Locale | null {
	if (typeof navigator === "undefined") return null;
	const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
	for (const tag of tags) {
		const locale = normalizeLocale(tag);
		if (locale) return locale;
	}
	return null;
}

// ─── region (Cloudflare) ─────────────────────────────────────────────────────

const GEO_CACHE_KEY = "pulse_geo_locale";

interface GeoResponse {
	country: string | null;
	locale: string;
}

/**
 * Resolves a locale from the visitor's country via `/api/geo`, which reads
 * Cloudflare's `request.cf.country` at the edge. Cached per tab session so a
 * multi-page visit costs a single request. Never throws.
 */
export async function fetchRegionLocale(): Promise<Locale | null> {
	if (typeof window === "undefined") return null;

	try {
		const cached = sessionStorage.getItem(GEO_CACHE_KEY);
		if (cached) return isLocale(cached) ? cached : null;
	} catch {
		// sessionStorage unavailable (private mode / blocked) — fall through.
	}

	try {
		const res = await fetch("/api/geo", { headers: { Accept: "application/json" } });
		if (!res.ok) return null;
		const data = (await res.json()) as GeoResponse;
		const locale = localeFromCountry(data.country) ?? normalizeLocale(data.locale);

		try {
			sessionStorage.setItem(GEO_CACHE_KEY, locale ?? "");
		} catch {
			// ignore write failures
		}
		return locale;
	} catch {
		return null;
	}
}

// ─── suggestion bar state ────────────────────────────────────────────────────

export function hasDismissedLocaleHint(): boolean {
	if (typeof localStorage === "undefined") return false;
	try {
		return localStorage.getItem(LOCALE_HINT_DISMISSED_KEY) === "1";
	} catch {
		return false;
	}
}

export function dismissLocaleHint(): void {
	try {
		localStorage.setItem(LOCALE_HINT_DISMISSED_KEY, "1");
	} catch {
		// ignore
	}
}

/**
 * Best locale for this visitor from signals alone, ignoring the current URL:
 * explicit choice → browser language → region → default.
 *
 * `region` is passed in because it needs an async fetch; callers that only
 * have synchronous signals can omit it.
 */
export function preferredLocale(region?: Locale | null): Locale {
	return readStoredLocale() ?? localeFromNavigator() ?? region ?? DEFAULT_LOCALE;
}
