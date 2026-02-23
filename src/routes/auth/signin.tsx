import { createFileRoute } from "@tanstack/react-router";
import SignInView from "@/components/auth/signin-view";

export const Route = createFileRoute("/auth/signin")({
	component: SignInView,
});
