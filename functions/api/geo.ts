import { jsonOk } from "../_lib/response";
import { createMethodRouter } from "../_lib/http";

// GET /api/geo — public endpoint used by the frontend to pick a default
// language. Returns the visitor's country as seen by Cloudflare's edge plus a
// best-effort locale from the Accept-Language header. Deliberately unauthed and
// PII-free: a two-letter country code and a language tag, nothing else.

const SPANISH_COUNTRIES = new Set([
	"AR", "BO", "CL", "CO", "CR", "CU", "DO", "EC", "ES", "GQ", "GT",
	"HN", "MX", "NI", "PA", "PE", "PR", "PY", "SV", "UY", "VE",
]);

/** Highest-weighted language tag from an Accept-Language header. */
function parseAcceptLanguage(header: string | null): string {
	if (!header) return "en";
	const best = header
		.split(",")
		.map((part) => {
			const [tag, ...params] = part.trim().split(";");
			const q = params.find((p) => p.trim().startsWith("q="));
			return { tag: tag.trim(), q: q ? Number.parseFloat(q.split("=")[1]) || 0 : 1 };
		})
		.filter((entry) => entry.tag && entry.tag !== "*")
		.sort((a, b) => b.q - a.q)[0];
	return best?.tag ?? "en";
}

export const onRequest: PagesFunction = async ({ request }) => {
	return createMethodRouter(request.method, {
		GET: () => {
			const country = request.cf?.country ?? request.headers.get("CF-IPCountry");
			const normalized = typeof country === "string" && country.length === 2 ? country.toUpperCase() : null;

			return jsonOk(
				{
					country: normalized,
					// Region wins over the browser header: someone browsing in Mexico
					// with an English-configured browser should still be offered Spanish.
					locale: normalized && SPANISH_COUNTRIES.has(normalized) ? "es" : parseAcceptLanguage(request.headers.get("Accept-Language")),
				},
				{
					// Country-dependent, so it must vary per visitor. A short private
					// cache keeps repeat navigations cheap without cross-user bleed.
					"Cache-Control": "private, max-age=3600",
					Vary: "Accept-Language",
				},
			);
		},
	});
};
