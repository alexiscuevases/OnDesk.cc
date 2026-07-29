export {
	LOCALES,
	PREFIXED_LOCALES,
	DEFAULT_LOCALE,
	LOCALE_META,
	LOCALE_COOKIE,
	COUNTRY_LOCALE,
	isLocale,
	normalizeLocale,
	localeFromCountry,
	splitLocalePath,
	localizePath,
	localizeUrl,
	type Locale,
} from "./config";

export { loadDictionary, peekDictionary, type Dictionary } from "./dictionaries";

export { I18nProvider, LocaleLink } from "./context";
export { useI18n, useLocale, type I18nValue } from "./i18n-context";

export { interpolate, formatNumber, formatUsd } from "./format";

export { useLocalizedSeo } from "./seo";

export {
	readStoredLocale,
	storeLocale,
	localeFromNavigator,
	fetchRegionLocale,
	preferredLocale,
	hasDismissedLocaleHint,
	dismissLocaleHint,
} from "./detect";
