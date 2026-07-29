import { useMemo, useCallback, type ReactNode } from "react";
import { localizePath, splitLocalePath, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import { storeLocale } from "./detect";
import { formatNumber, formatUsd, interpolate, pluralize } from "./format";
import { I18nContext, useI18n, type I18nValue } from "./i18n-context";

export function I18nProvider({
	locale,
	dict,
	children,
}: {
	locale: Locale;
	dict: Dictionary;
	children: ReactNode;
}) {
	const path = useCallback((p: string) => localizePath(p, locale), [locale]);

	/**
	 * A full document load is intentional: the marketing site links with plain
	 * anchors, and reloading guarantees the `<head>`, the `<html lang>` and the
	 * dictionary chunk all agree with the new URL.
	 */
	const switchLocale = useCallback((next: Locale) => {
		storeLocale(next);
		if (typeof window === "undefined") return;
		const { path: bare } = splitLocalePath(window.location.pathname);
		window.location.assign(localizePath(bare, next) + window.location.search + window.location.hash);
	}, []);

	const value = useMemo<I18nValue>(
		() => ({
			locale,
			dict,
			path,
			t: interpolate,
			pl: (forms, count, vars) =>
				interpolate(pluralize(forms, count, locale), { count: formatNumber(count, locale), ...vars }),
			num: (v, options) => formatNumber(v, locale, options),
			usd: (v) => formatUsd(v, locale),
			switchLocale,
		}),
		[locale, dict, path, switchLocale],
	);

	return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Locale-aware anchor. Same API as `<a>`, but `href` is authored unprefixed and
 * rewritten for the active locale. External and hash hrefs pass through as-is.
 */
export function LocaleLink({
	href,
	children,
	...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
	const { path } = useI18n();
	const isInternal = href.startsWith("/") && !href.startsWith("//");
	return (
		<a href={isInternal ? path(href) : href} {...rest}>
			{children}
		</a>
	);
}
