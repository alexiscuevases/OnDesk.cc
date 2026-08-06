import type { AuthUser } from "@/context/auth-context";
import { ondeskUrl, signInUrl } from "@/lib/ondesk";

/**
 * Pulse's session client.
 *
 * Authentication happens on OnDesk — there is no login form in this app, and
 * since the session cookie lives on `.ondesk.cc` there is no local session
 * either. Every call here goes to ondesk's own /api/auth endpoints,
 * cross-origin with credentials (ondesk's middleware answers the CORS side).
 * Pulse's `/api/auth/*` routes are gone on purpose: auth routes are exclusive
 * to ondesk.
 */

/** Sends the browser to OnDesk to authenticate, then back to `returnTo`. */
export function startSignIn(returnTo: string = window.location.href): void {
	window.location.href = signInUrl(returnTo);
}

/** Ends the platform session — for this app and every other one at once. */
export async function apiLogout(): Promise<void> {
	await fetch(`${ondeskUrl()}/api/auth/logout`, { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<AuthUser | null> {
	const base = `${ondeskUrl()}/api/auth`;
	let res = await fetch(`${base}/me`, { credentials: "include" });

	if (res.status === 401) {
		const refreshRes = await fetch(`${base}/refresh`, { method: "POST", credentials: "include" });
		if (!refreshRes.ok) return null;
		res = await fetch(`${base}/me`, { credentials: "include" });
		if (!res.ok) return null;
	}

	if (!res.ok) return null;
	const data = (await res.json()) as { user: AuthUser };
	return data.user;
}
