import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/w")({
	beforeLoad: async ({ location }) => {
		const user = await apiMe();
		if (!user) {
			throw redirect({ to: "/auth/signin", search: { redirect: location.href } });
		}
	},
	component: () => <Outlet />,
});
