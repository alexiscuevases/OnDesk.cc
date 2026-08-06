import { createFileRoute, Outlet } from "@tanstack/react-router";
import { apiMe, startSignIn } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/w")({
	beforeLoad: async ({ location }) => {
		const user = await apiMe();
		if (!user) {
			// Hand off to OnDesk instead of to a local sign-in screen. A full page
			// navigation, not a router redirect — the flow leaves this origin, so
			// return_to has to be the absolute URL of where we stand.
			startSignIn(`${window.location.origin}${location.href}`);
			// Stall the route load; the navigation above is already in flight.
			await new Promise(() => {});
		}
	},
	component: () => <Outlet />,
});
