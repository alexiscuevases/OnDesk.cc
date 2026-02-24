import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { apiLogin, apiRegister, apiLogout, apiMe } from "../api/auth-api";
import { apiGetWorkspaces } from "@/features/workspaces/api/workspaces-api";

export const authQueryKeys = {
	me: ["auth", "me"] as const,
};

/** Fetch the current user. Stale time is slightly under the 15-min JWT TTL. */
export function useCurrentUser() {
	return useQuery({
		queryKey: authQueryKeys.me,
		queryFn: apiMe,
		staleTime: 1000 * 60 * 14, // 14 minutes
		retry: false,
	});
}

async function navigateAfterLogin(
	navigate: ReturnType<typeof useNavigate>
): Promise<void> {
	const workspaces = await apiGetWorkspaces().catch(() => []);
	if (workspaces.length === 0) {
		navigate({ to: "/workspaces/new" });
	} else if (workspaces.length === 1) {
		navigate({ to: "/w/$slug/overview", params: { slug: workspaces[0].slug } });
	} else {
		navigate({ to: "/workspaces" });
	}
}

export function useLoginMutation() {
	const { setUser } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			email,
			password,
			rememberMe,
		}: {
			email: string;
			password: string;
			rememberMe: boolean;
		}) => apiLogin(email, password, rememberMe),
		onSuccess: async ({ user }) => {
			setUser(user);
			queryClient.setQueryData(authQueryKeys.me, user);
			await navigateAfterLogin(navigate);
		},
	});
}

export function useRegisterMutation() {
	const { setUser } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			name,
			email,
			password,
		}: {
			name: string;
			email: string;
			password: string;
		}) => apiRegister(name, email, password),
		onSuccess: async ({ user }) => {
			setUser(user);
			queryClient.setQueryData(authQueryKeys.me, user);
			await navigateAfterLogin(navigate);
		},
	});
}

export function useLogoutMutation() {
	const { clearUser } = useAuth();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: apiLogout,
		onSettled: () => {
			clearUser();
			queryClient.clear(); // Wipe all cached data on logout
			navigate({ to: "/auth/signin" });
		},
	});
}
