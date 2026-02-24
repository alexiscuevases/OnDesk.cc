import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "@/shell/dashboard-shell";
import { apiMe } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ location }) => {
		const user = await apiMe();
		if (!user) {
			throw redirect({ to: "/auth/signin", search: { redirect: location.href } });
		}
		if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
			throw redirect({ to: "/dashboard/overview" });
		}
	},
	component: DashboardShell,
});
