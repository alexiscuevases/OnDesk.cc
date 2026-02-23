import { createFileRoute } from "@tanstack/react-router";
import { SignUpView } from "@/features/auth";

export const Route = createFileRoute("/auth/signup")({
	component: SignUpView,
});
