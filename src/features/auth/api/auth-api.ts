import type { AuthUser } from "@/context/auth-context";

const API_BASE = "/api/auth";

export interface AuthResponse {
	user: AuthUser;
}

export async function apiLogin(
	email: string,
	password: string,
	rememberMe: boolean
): Promise<AuthResponse> {
	const res = await fetch(`${API_BASE}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ email, password, rememberMe }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Login failed");
	}
	return res.json() as Promise<AuthResponse>;
}

export async function apiRegister(
	name: string,
	email: string,
	password: string
): Promise<AuthResponse> {
	const res = await fetch(`${API_BASE}/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ name, email, password }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Registration failed");
	}
	// register returns 201 with { user }, no cookies — login separately
	const data = (await res.json()) as { user: AuthUser };
	// Auto-login after successful registration
	return apiLogin(email, password, false);
}

export async function apiLogout(): Promise<void> {
	await fetch(`${API_BASE}/logout`, { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<AuthUser | null> {
	let res = await fetch(`${API_BASE}/me`, { credentials: "include" });

	if (res.status === 401) {
		// Try silent token refresh once
		const refreshRes = await fetch(`${API_BASE}/refresh`, {
			method: "POST",
			credentials: "include",
		});
		if (!refreshRes.ok) return null;

		// Retry /me with the new access token cookie
		res = await fetch(`${API_BASE}/me`, { credentials: "include" });
		if (!res.ok) return null;
	}

	if (!res.ok) return null;

	const data = (await res.json()) as { user: AuthUser };
	return data.user;
}
