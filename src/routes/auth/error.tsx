import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { startSignIn } from "@/features/auth";

const MESSAGES: Record<string, string> = {
	access_denied: "You cancelled the sign-in, or OnDesk declined the request.",
	state_mismatch: "The sign-in request didn't match the one that started it. Please try again.",
	missing_state: "The sign-in took too long to complete. Please try again.",
	missing_code: "OnDesk didn't return an authorization code.",
	exchange_failed: "We couldn't complete the sign-in with OnDesk. Please try again.",
};

export const Route = createFileRoute("/auth/error")({
	validateSearch: (search: Record<string, unknown>) => ({
		reason: typeof search.reason === "string" ? search.reason : undefined,
	}),
	component: AuthErrorView,
});

/**
 * Where a failed SSO round trip lands. Pulse has no sign-in form to fall back
 * on, so the only action is to start the flow again.
 */
function AuthErrorView() {
	const { reason } = useSearch({ from: "/auth/error" });

	return (
		<div className="flex min-h-svh items-center justify-center p-6">
			<div className="flex max-w-sm flex-col items-center gap-4 text-center">
				<h1 className="text-lg font-semibold tracking-tight">Sign-in didn't complete</h1>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{(reason && MESSAGES[reason]) ?? "Something went wrong signing you in."}
				</p>
				<Button onClick={() => startSignIn("/workspaces")}>Try again</Button>
			</div>
		</div>
	);
}
