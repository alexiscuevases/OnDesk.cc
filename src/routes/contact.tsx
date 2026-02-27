import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/features/frontend/contact";

export const Route = createFileRoute("/contact")({
	component: () => <ContactPage />,
});
