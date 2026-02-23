import { createFileRoute } from "@tanstack/react-router";
import { SignInView } from "@/features/auth";

export const Route = createFileRoute("/auth/signin")({
	component: SignInView,
});
