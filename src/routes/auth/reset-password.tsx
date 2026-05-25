import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordView from "@/features/auth/components/reset-password-view";

export const Route = createFileRoute("/auth/reset-password")({
	validateSearch: (search: Record<string, unknown>) => ({
		token: (search.token as string) ?? "",
	}),
	component: function ResetPasswordPage() {
		const { token } = Route.useSearch();
		return <ResetPasswordView token={token} />;
	},
});
