import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth-context";
import { apiLogin, apiRegister, apiLogout, apiMe } from "../api/auth-api";

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
		onSuccess: ({ user }) => {
			setUser(user);
			queryClient.setQueryData(authQueryKeys.me, user);
			navigate({ to: "/dashboard/overview" });
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
		onSuccess: ({ user }) => {
			setUser(user);
			queryClient.setQueryData(authQueryKeys.me, user);
			navigate({ to: "/dashboard/overview" });
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
