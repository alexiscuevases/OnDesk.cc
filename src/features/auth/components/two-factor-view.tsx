import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "../hooks/use-auth-mutations";
import { apiVerify2FA, apiResend2FA } from "../api/auth-api";
import { apiGetWorkspaces } from "@/features/workspaces/api/workspaces-api";
import { AuthLayout } from "./auth-layout";

export default function TwoFactorView() {
	const [code, setCode] = useState("");
	const [resent, setResent] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();
	const { setUser } = useAuth();
	const queryClient = useQueryClient();

	const pending = (() => {
		try {
			const raw = sessionStorage.getItem("2fa_pending");
			return raw ? (JSON.parse(raw) as { token: string; rememberMe: boolean }) : null;
		} catch {
			return null;
		}
	})();

	useEffect(() => {
		if (!pending) navigate({ to: "/auth/signin" });
		inputRef.current?.focus();
	}, []);

	const verifyMutation = useMutation({
		mutationFn: () => apiVerify2FA(pending!.token, code, pending!.rememberMe),
		onSuccess: async ({ user }) => {
			sessionStorage.removeItem("2fa_pending");
			setUser(user);
			queryClient.setQueryData(authQueryKeys.me, user);
			const workspaces = await apiGetWorkspaces().catch(() => []);
			if (workspaces.length === 0) {
				navigate({ to: "/workspaces/new" });
			} else if (workspaces.length === 1) {
				navigate({ to: "/w/$slug/overview", params: { slug: workspaces[0].slug } });
			} else {
				navigate({ to: "/workspaces" });
			}
		},
	});

	const resendMutation = useMutation({
		mutationFn: () => apiResend2FA(pending!.token),
		onSuccess: () => {
			setResent(true);
			setCode("");
			inputRef.current?.focus();
			setTimeout(() => setResent(false), 5000);
		},
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (code.trim().length === 6) verifyMutation.mutate();
	}

	return (
		<AuthLayout orbVariant="center" backLink={{ to: "/auth/signin", label: "Back to sign in" }}>
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center size-16 rounded-full bg-primary/10 mb-6">
					<ShieldCheck className="size-8 text-primary" />
				</div>
				<h1 className="text-3xl font-bold mb-2">Check your email</h1>
				<p className="text-muted-foreground">
					We sent a 6-digit code to <span className="text-foreground font-medium">{pending?.token ? "your email" : "…"}</span>
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Input
						ref={inputRef}
						type="text"
						inputMode="numeric"
						pattern="[0-9]*"
						maxLength={6}
						placeholder="000000"
						value={code}
						onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
						className="text-center text-2xl tracking-[0.5em] h-14 font-mono"
					/>
				</div>

				{verifyMutation.error && (
					<p className="text-sm text-destructive text-center">{verifyMutation.error.message}</p>
				)}
				{resent && (
					<p className="text-sm text-primary text-center">A new code was sent to your email.</p>
				)}
				{resendMutation.error && (
					<p className="text-sm text-destructive text-center">{resendMutation.error.message}</p>
				)}

				<Button
					type="submit"
					className="w-full h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300"
					size="lg"
					disabled={verifyMutation.isPending || code.length !== 6}>
					{verifyMutation.isPending ? "Verifying…" : "Verify"}
				</Button>
			</form>

			<div className="mt-6 text-center text-sm text-muted-foreground">
				Didn't receive the code?{" "}
				<button
					type="button"
					onClick={() => resendMutation.mutate()}
					disabled={resendMutation.isPending || !pending}
					className="text-primary hover:text-primary/80 font-medium transition-colors disabled:opacity-50">
					{resendMutation.isPending ? "Sending…" : "Resend code"}
				</button>
			</div>

			<div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
				<p className="text-xs text-muted-foreground text-center">
					The code expires in 10 minutes. Never share it with anyone.
				</p>
			</div>
		</AuthLayout>
	);
}
