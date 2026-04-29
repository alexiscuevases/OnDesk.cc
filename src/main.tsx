import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { routeTree } from "./routeTree.gen";
import { AuthProvider, type AuthUser } from "@/context/auth-context";
import { apiMe } from "@/features/auth/api/auth-api";
import { Toaster } from "@/components/ui/sonner";

// Bootstrap: attempt to restore session before rendering.
// apiMe() tries the access token, silently refreshes if expired.
// Returns null if no valid session exists.
const initialUser: AuthUser | null = await apiMe().catch(() => null);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutos
			retry: 1,
		},
	},
});

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AuthProvider initialUser={initialUser}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider router={router} />
				<Toaster />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</AuthProvider>
	</StrictMode>,
);
