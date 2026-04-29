import { useEffect } from "react";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
	oauth_denied: "Sign-in was cancelled.",
	oauth_invalid_state: "The sign-in session expired. Please try again.",
	oauth_token_failed: "We couldn't complete sign-in with the provider. Please try again.",
	oauth_profile_failed: "We couldn't read your profile from the provider.",
};

export function useOAuthErrorToast() {
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const error = params.get("error");
		if (!error) return;

		toast.error(ERROR_MESSAGES[error] ?? "Sign-in failed. Please try again.");

		params.delete("error");
		const search = params.toString();
		const newUrl = window.location.pathname + (search ? `?${search}` : "");
		window.history.replaceState(null, "", newUrl);
	}, []);
}
