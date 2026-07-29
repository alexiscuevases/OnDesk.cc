import { createFileRoute } from "@tanstack/react-router";
import TermsPage from "@/features/frontend/terms";

export const Route = createFileRoute("/{-$lang}/terms")({
	component: () => <TermsPage />,
});
