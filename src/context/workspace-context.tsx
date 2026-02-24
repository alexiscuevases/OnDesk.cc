import { createContext, useContext, type ReactNode } from "react";
import type { Workspace } from "@/features/workspaces/api/workspaces-api";

interface WorkspaceContextValue {
	workspace: Workspace;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
	children,
	workspace,
}: {
	children: ReactNode;
	workspace: Workspace;
}) {
	return (
		<WorkspaceContext.Provider value={{ workspace }}>
			{children}
		</WorkspaceContext.Provider>
	);
}

export function useWorkspace(): WorkspaceContextValue {
	const ctx = useContext(WorkspaceContext);
	if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
	return ctx;
}
