import { createFileRoute } from "@tanstack/react-router";
import SignUpView from "@/components/auth/signup-view";

export const Route = createFileRoute("/auth/signup")({
	component: SignUpView,
});
