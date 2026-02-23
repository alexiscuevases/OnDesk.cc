import { createFileRoute } from "@tanstack/react-router";
import RecoverView from "@/components/auth/recover-view";

export const Route = createFileRoute("/auth/recover")({
	component: RecoverView,
});
