/**
 * Where the control plane lives, from the browser's point of view.
 *
 * Every link out of Pulse that concerns identity, tenancy or billing should go
 * through here. Centralised because these URLs are easy to get wrong and easy
 * to miss when grepping — nexus, orbit and vault carry the same module, and
 * pulse's post-SSO cleanup lost a day to not having it (see
 * pulse/docs/post-sso-cleanup.md).
 *
 * Set VITE_ONDESK_URL in .env for local development (e.g. http://localhost:8789).
 */
export function ondeskUrl(): string {
	return (import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc").replace(/\/$/, "");
}

/**
 * OnDesk's sign-in screen, parked to come back to `returnTo` (a full URL —
 * sign-in happens on another origin, so a bare path would strand the user on
 * ondesk). The session cookie lives on `.ondesk.cc`; once it exists there is
 * nothing product-specific left to do.
 */
export function signInUrl(returnTo: string): string {
	return `${ondeskUrl()}/auth/signin?return_to=${encodeURIComponent(returnTo)}`;
}

/** The same, for people who don't have an account yet. */
export function signUpUrl(returnTo: string): string {
	return `${ondeskUrl()}/auth/signup?return_to=${encodeURIComponent(returnTo)}`;
}

/** The workspace list on the OnDesk console. */
export function workspacesUrl(): string {
	return `${ondeskUrl()}/workspaces`;
}

/**
 * The product lineup, for the app switcher. `href` takes the current workspace
 * slug so a hop lands in the same tenant — every product serves its workspaces
 * under /w/:slug. Overridable per app for local development, where each one
 * runs on its own port.
 */
export interface PlatformApp {
	id: "nexus" | "orbit" | "pulse" | "vault";
	name: string;
	tagline: string;
	url: string;
}

function productUrl(id: string, fallback: string): string {
	const override = (import.meta.env as Record<string, string | undefined>)[
		`VITE_${id.toUpperCase()}_URL`
	];
	return (override ?? fallback).replace(/\/$/, "");
}

export function platformApps(): PlatformApp[] {
	return [
		{ id: "nexus", name: "Nexus", tagline: "Team messaging", url: productUrl("nexus", "https://nexus.ondesk.cc") },
		{ id: "orbit", name: "Orbit", tagline: "Projects & tasks", url: productUrl("orbit", "https://orbit.ondesk.cc") },
		{ id: "pulse", name: "Pulse", tagline: "Customer support", url: productUrl("pulse", "https://pulse.ondesk.cc") },
		{ id: "vault", name: "Vault", tagline: "Documents & files", url: productUrl("vault", "https://vault.ondesk.cc") },
	];
}
