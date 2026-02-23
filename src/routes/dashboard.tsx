import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "@/shell/dashboard-shell";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: ({ location }) => {
		if (location.pathname === "/dashboard" || location.pathname === "/dashboard/") {
			throw redirect({ to: "/dashboard/overview" });
		}
	},
	component: DashboardShell,
});
