import { createFileRoute, Outlet } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/workspaces")({
	beforeLoad: async ({ location }) => {
		const user = await apiMe();
		if (!user) {
			window.location.href = `/api/auth/sso/start?next=${encodeURIComponent(location.href)}`;
			await new Promise(() => {});
		}
	},
	component: () => <Outlet />,
});
