import { useEffect } from "react";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, localizePath, type Locale } from "./config";

const BRAND = "Pulse";
const MANAGED_ATTR = "data-i18n-managed";

function upsertMeta(selector: string, attrs: Record<string, string>): void {
	let el = document.head.querySelector<HTMLMetaElement>(selector);
	if (!el) {
		el = document.createElement("meta");
		el.setAttribute(MANAGED_ATTR, "");
		document.head.appendChild(el);
	}
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

function upsertLink(selector: string, attrs: Record<string, string>): void {
	let el = document.head.querySelector<HTMLLinkElement>(selector);
	if (!el) {
		el = document.createElement("link");
		el.setAttribute(MANAGED_ATTR, "");
		document.head.appendChild(el);
	}
	for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

interface SeoInput {
	/** Page title. ` — Pulse` is appended unless the title already brands itself. */
	title: string;
	description: string;
	/** Unprefixed canonical path for this page, e.g. `/pricing` or `/`. */
	path: string;
	locale: Locale;
}

/**
 * Keeps the document head in sync with the rendered locale.
 *
 * This app is client-rendered, so the head is written on mount rather than
 * served in the HTML. Crawlers execute JS and will read it, but if organic
 * traffic to the localized pages ever becomes business-critical, the durable
 * fix is to inject these tags at the edge with HTMLRewriter in a Pages
 * Function — see docs/i18n.md.
 */
export function useLocalizedSeo({ title, description, path, locale }: SeoInput): void {
	useEffect(() => {
		const fullTitle = title.startsWith(BRAND) ? title : `${title} — ${BRAND}`;
		const origin = window.location.origin;

		document.documentElement.lang = LOCALE_META[locale].htmlLang;
		document.title = fullTitle;

		upsertMeta('meta[name="description"]', { name: "description", content: description });

		// Open Graph / social previews
		upsertMeta('meta[property="og:title"]', { property: "og:title", content: fullTitle });
		upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
		upsertMeta('meta[property="og:url"]', { property: "og:url", content: origin + localizePath(path, locale) });
		upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: LOCALE_META[locale].htmlLang });

		upsertLink('link[rel="canonical"]', { rel: "canonical", href: origin + localizePath(path, locale) });

		// hreflang alternates — every locale points at its own URL for this page,
		// plus x-default for language-agnostic crawlers.
		document.head.querySelectorAll("link[rel='alternate'][hreflang]").forEach((el) => el.remove());
		for (const l of LOCALES) {
			const link = document.createElement("link");
			link.setAttribute(MANAGED_ATTR, "");
			link.rel = "alternate";
			link.hreflang = LOCALE_META[l].htmlLang;
			link.href = origin + localizePath(path, l);
			document.head.appendChild(link);
		}
		const xDefault = document.createElement("link");
		xDefault.setAttribute(MANAGED_ATTR, "");
		xDefault.rel = "alternate";
		xDefault.hreflang = "x-default";
		xDefault.href = origin + localizePath(path, DEFAULT_LOCALE);
		document.head.appendChild(xDefault);
	}, [title, description, path, locale]);
}
