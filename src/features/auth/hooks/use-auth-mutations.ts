import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { apiLogout } from "../api/auth-api";
import { ondeskUrl } from "@/lib/ondesk";

/**
 * Signing out calls OnDesk's logout, which revokes the platform refresh token
 * and clears the shared `.ondesk.cc` cookies — one call ends the session for
 * every app at once. There is no local session to clear any more; what's left
 * is dropping in-memory state and landing on the sign-in screen.
 */
export function useLogoutMutation() {
	const queryClient = useQueryClient();
	const { clearUser } = useAuth();

	return useMutation({
		mutationFn: apiLogout,
		onSuccess: () => {
			clearUser();
			queryClient.clear();
			window.location.href = `${ondeskUrl()}/auth/signin`;
		},
	});
}
