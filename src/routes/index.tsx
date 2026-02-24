import { createFileRoute, redirect } from "@tanstack/react-router";
import { apiMe } from "@/features/auth/api/auth-api";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const user = await apiMe();
		throw redirect({ to: user ? "/dashboard/overview" : "/auth/signin" });
	},
});
