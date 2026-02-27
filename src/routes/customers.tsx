import { createFileRoute } from "@tanstack/react-router";
import CustomersPage from "@/features/frontend/customers";

export const Route = createFileRoute("/customers")({
	component: () => <CustomersPage />,
});
