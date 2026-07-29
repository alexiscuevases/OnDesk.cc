import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/crud-api";
import type { PublicWorkspaceProduct } from "../../../../functions/_lib/types";

async function readError(res: Response, fallback: string): Promise<never> {
	const data = (await res.json().catch(() => null)) as { error?: string } | null;
	throw new Error(data?.error ?? fallback);
}

export const useAgentTools = (agentId: string) => {
	return useQuery({
		queryKey: ["agents", agentId, "tools"],
		queryFn: async () => {
			const res = await apiFetch(`/api/ai-agents/${agentId}/tools`);
			if (!res.ok) await readError(res, "Failed to fetch agent tools");
			const data = (await res.json()) as { tools: PublicWorkspaceProduct[] };
			return data.tools;
		},
		enabled: !!agentId,
	});
};

export const useAssignTool = (agentId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (input: string | { workspaceProductId: string; allowedActions?: string[] | null }) => {
			const body = typeof input === "string" ? { workspaceProductId: input } : input;
			const res = await apiFetch(`/api/ai-agents/${agentId}/tools`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});
			if (!res.ok) await readError(res, "Failed to assign tool");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", agentId, "tools"] });
		},
	});
};

/** Restricts which actions of an assigned connector the agent may call. */
export const useUpdateToolActions = (agentId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			workspaceProductId,
			allowedActions,
		}: {
			workspaceProductId: string;
			allowedActions: string[] | null;
		}) => {
			const res = await apiFetch(`/api/ai-agents/${agentId}/tools`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ workspaceProductId, allowedActions }),
			});
			if (!res.ok) await readError(res, "Failed to update tool actions");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", agentId, "tools"] });
		},
	});
};

export const useRemoveTool = (agentId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (workspaceProductId: string) => {
			const res = await apiFetch(`/api/ai-agents/${agentId}/tools?workspaceProductId=${workspaceProductId}`, {
				method: "DELETE",
			});
			if (!res.ok) await readError(res, "Failed to remove tool");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", agentId, "tools"] });
		},
	});
};
