import { createFileRoute } from "@tanstack/react-router";
import ChangelogPage from "@/features/frontend/changelog";

export const Route = createFileRoute("/changelog")({
	component: () => <ChangelogPage />,
});
