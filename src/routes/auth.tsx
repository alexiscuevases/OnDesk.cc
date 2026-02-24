import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/auth")({
	beforeLoad: async () => {
		const user = await apiMe();
		if (user) {
			throw redirect({ to: "/workspaces" });
		}
	},
	component: () => <Outlet />,
});
