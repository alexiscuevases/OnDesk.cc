import { createFileRoute } from "@tanstack/react-router";
import TwoFactorView from "@/features/auth/components/two-factor-view";

export const Route = createFileRoute("/auth/two-factor")({
	component: TwoFactorView,
});
