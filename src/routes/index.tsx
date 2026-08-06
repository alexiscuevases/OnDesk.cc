import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";

/**
 * Pulse no longer serves a marketing site — that all lives on OnDesk now.
 * `/` sends a signed-in visitor to their workspaces and everyone else to the
 * product page on the marketing origin.
 */
export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const user = await apiMe().catch(() => null);
		if (user) throw redirect({ to: "/workspaces" });
		window.location.href = `${import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc"}/products/pulse`;
		// Block route resolution while the browser navigates away.
		await new Promise(() => {});
	},
	component: () => null,
});
