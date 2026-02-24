import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";
import { apiGetWorkspaces } from "@/features/workspaces/api/workspaces-api";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const user = await apiMe();
		if (!user) {
			throw redirect({ to: "/auth/signin" });
		}
		const workspaces = await apiGetWorkspaces().catch(() => []);
		if (workspaces.length === 0) {
			throw redirect({ to: "/workspaces/new" });
		}
		if (workspaces.length === 1) {
			throw redirect({ to: "/w/$slug/overview", params: { slug: workspaces[0].slug } });
		}
		throw redirect({ to: "/workspaces" });
	},
});
