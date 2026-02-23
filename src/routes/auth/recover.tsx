import { createFileRoute } from "@tanstack/react-router";
import { RecoverView } from "@/features/auth";

export const Route = createFileRoute("/auth/recover")({
	component: RecoverView,
});
