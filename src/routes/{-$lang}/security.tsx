import { createFileRoute } from "@tanstack/react-router";
import SecurityPage from "@/features/frontend/security";

export const Route = createFileRoute("/{-$lang}/security")({
	component: () => <SecurityPage />,
});
