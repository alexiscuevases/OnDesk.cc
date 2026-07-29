import { createFileRoute, notFound, redirect, Outlet } from "@tanstack/react-router";
import { DEFAULT_LOCALE, I18nProvider, isLocale, loadDictionary } from "@/i18n";
import { LocaleHint } from "@/features/frontend/locale-hint";

// Optional path param: this single layout serves both `/pricing` (default
// locale, unprefixed) and `/es/pricing`. Adding a language means adding it to
// LOCALES and shipping a dictionary — no new route files.

export const Route = createFileRoute("/{-$lang}")({
	loader: async ({ params, location }) => {
		const raw = params.lang;

		// No prefix → default locale.
		if (raw === undefined) {
			return { locale: DEFAULT_LOCALE, dict: await loadDictionary(DEFAULT_LOCALE) };
		}

		// `/en/pricing` would duplicate `/pricing`; send it to the canonical URL
		// rather than serving the same content at two addresses.
		if (raw === DEFAULT_LOCALE) {
			const rest = location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
			throw redirect({ href: rest + location.searchStr, statusCode: 301 });
		}

		// A prefix we don't ship isn't a page — let the 404 boundary handle it.
		if (!isLocale(raw)) throw notFound();

		return { locale: raw, dict: await loadDictionary(raw) };
	},
	component: LocaleLayout,
});

function LocaleLayout() {
	const { locale, dict } = Route.useLoaderData();
	return (
		<I18nProvider locale={locale} dict={dict}>
			<LocaleHint />
			<Outlet />
		</I18nProvider>
	);
}
