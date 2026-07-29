import { createFileRoute } from "@tanstack/react-router";
import BlogPage from "@/features/frontend/blog";

export const Route = createFileRoute("/{-$lang}/blog")({
	component: () => <BlogPage />,
});
