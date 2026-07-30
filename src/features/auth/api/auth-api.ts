import type { AuthUser } from "@/context/auth-context";

const API_BASE = "/api/auth";

/**
 * Pulse's session client.
 *
 * Authentication itself happens on OnDesk — there is no login form here any
 * more. What remains is reading the local session that the SSO callback issued,
 * refreshing it, and ending it.
 */

/** Sends the browser to OnDesk to authenticate, then back to `next`. */
export function startSignIn(next: string = window.location.pathname): void {
	window.location.href = `${API_BASE}/sso/start?next=${encodeURIComponent(next)}`;
}

export async function apiLogout(): Promise<void> {
	await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<AuthUser | null> {
	let res = await fetch(`${API_BASE}/me`, { credentials: "include" });

	if (res.status === 401) {
		const refreshRes = await fetch(`${API_BASE}/refresh`, {
			method: "POST",
			credentials: "include",
		});
		if (!refreshRes.ok) return null;
		res = await fetch(`${API_BASE}/me`, { credentials: "include" });
		if (!res.ok) return null;
	}

	if (!res.ok) return null;
	const data = (await res.json()) as { user: AuthUser };
	return data.user;
}
