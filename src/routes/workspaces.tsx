import { createFileRoute, Outlet } from "@tanstack/react-router";
import { apiMe, startSignIn } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/workspaces")({
	beforeLoad: async ({ location }) => {
		const user = await apiMe();
		if (!user) {
			startSignIn(`${window.location.origin}${location.href}`);
			await new Promise(() => {});
		}
	},
	component: () => <Outlet />,
});
