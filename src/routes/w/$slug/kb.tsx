import { createFileRoute } from "@tanstack/react-router";
import { KbView } from "@/features/kb";

export const Route = createFileRoute("/w/$slug/kb")({
	component: KbRoute,
});

function KbRoute() {
	return <KbView />;
}
