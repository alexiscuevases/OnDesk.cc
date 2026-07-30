import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiLogout } from "../api/auth-api";

export const authQueryKeys = {
	me: ["auth", "me"] as const,
};

/**
 * Signing out clears the local Pulse session and then hands off to OnDesk's
 * end-session endpoint, which drops the platform session and revokes every
 * product refresh token. Stopping at the local logout would leave the user
 * silently signed back in on the next visit.
 */
export function useLogoutMutation() {
	const queryClient = useQueryClient();
	const { clearUser } = useAuth();

	return useMutation({
		mutationFn: apiLogout,
		onSuccess: () => {
			clearUser();
			queryClient.clear();
			const issuer = import.meta.env.VITE_ONDESK_URL ?? "https://ondesk.cc";
			window.location.href = `${issuer}/api/oidc/logout?client_id=pulse&post_logout_redirect_uri=${encodeURIComponent(
				`${window.location.origin}/`,
			)}`;
		},
	});
}
