import type { AuthUser } from "@/context/auth-context";

const API_BASE = "/api/auth";

export interface AuthResponse {
	user: AuthUser;
}

export type LoginResponse =
	| { user: AuthUser; requiresTwoFactor?: false }
	| { requiresTwoFactor: true; twoFactorToken: string };

export async function apiLogin(
	email: string,
	password: string,
	rememberMe: boolean
): Promise<LoginResponse> {
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
	return res.json() as Promise<LoginResponse>;
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
	return apiLogin(email, password, false) as Promise<AuthResponse>;
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

export async function apiForgotPassword(email: string): Promise<void> {
	const res = await fetch(`${API_BASE}/forgot-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Request failed");
	}
}

export async function apiResetPassword(token: string, password: string): Promise<void> {
	const res = await fetch(`${API_BASE}/reset-password`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ token, password }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Reset failed");
	}
}

export async function apiVerify2FA(
	twoFactorToken: string,
	code: string,
	rememberMe: boolean
): Promise<AuthResponse> {
	const res = await fetch(`${API_BASE}/2fa/verify`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ twoFactorToken, code, rememberMe }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Verification failed");
	}
	return res.json() as Promise<AuthResponse>;
}

export async function apiResend2FA(twoFactorToken: string): Promise<void> {
	const res = await fetch(`${API_BASE}/2fa/send`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ twoFactorToken }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to resend code");
	}
}

export async function apiToggle2FA(enabled: boolean): Promise<void> {
	const res = await fetch(`${API_BASE}/2fa/toggle`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "include",
		body: JSON.stringify({ enabled }),
	});
	if (!res.ok) {
		const err = (await res.json()) as { error: string };
		throw new Error(err.error ?? "Failed to update 2FA");
	}
}
