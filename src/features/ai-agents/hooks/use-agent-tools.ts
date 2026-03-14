import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/crud-api";
import type { PublicWorkspaceProduct } from "../../../../functions/_lib/types";

export const useAgentTools = (agentId: string) => {
	return useQuery({
		queryKey: ["agents", agentId, "tools"],
		queryFn: async () => {
			const res = await apiFetch(`/api/ai-agents/${agentId}/tools`);
			if (!res.ok) throw new Error("Failed to fetch agent tools");
			const data = await res.json();
			return data.tools as PublicWorkspaceProduct[];
		},
		enabled: !!agentId,
	});
};

export const useAssignTool = (agentId: string) => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (workspaceProductId: string) => {
			const res = await apiFetch(`/api/ai-agents/${agentId}/tools`, {
				method: "POST",
				body: JSON.stringify({ workspaceProductId }),
			});
			if (!res.ok) throw new Error("Failed to assign tool");
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
			if (!res.ok) throw new Error("Failed to remove tool");
			return res.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents", agentId, "tools"] });
		},
	});
};
