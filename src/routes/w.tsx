import { createFileRoute, Outlet } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/w")({
	beforeLoad: async ({ location }) => {
		const user = await apiMe();
		if (!user) {
			// Hand off to OnDesk instead of to a local sign-in screen. A full page
			// navigation, not a router redirect — the flow leaves this origin.
			window.location.href = `/api/auth/sso/start?next=${encodeURIComponent(location.href)}`;
			// Stall the route load; the navigation above is already in flight.
			await new Promise(() => {});
		}
	},
	component: () => <Outlet />,
});
