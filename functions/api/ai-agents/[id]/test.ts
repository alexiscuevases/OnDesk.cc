import { withWorkspace } from "../../../_lib/middleware";
import { jsonOk, jsonError } from "../../../_lib/response";
import { findAiAgentById, findAgentTools, findWorkspaceById, getWorkspaceMemberRole } from "../../../_lib/db";
import { buildToolsSection, buildFullSystemPrompt } from "../../../_lib/ai-agent-testing-utils";
import { runAgenticLoop } from "../../../_lib/ai-agent-runtime";
import { createMethodRouter, parseJsonBody } from "../../../_lib/http";

// POST /api/ai-agents/:id/test?workspace_id=
export const onRequest = withWorkspace<"id">(async ({ request, env, payload, params, workspaceId }) => {
  return createMethodRouter(request.method, {
    POST: async () => {
      const agentId = params.id;

      const role = await getWorkspaceMemberRole(env.DB, workspaceId, payload.sub);
      if (role !== "owner" && role !== "admin") {
        return jsonError("Only workspace owners and admins can test AI agents", 403);
      }

      const agent = await findAiAgentById(env.DB, agentId);
      if (!agent) return jsonError("AI agent not found", 404);
      if (agent.workspace_id !== workspaceId) return jsonError("Forbidden", 403);

      const workspace = await findWorkspaceById(env.DB, workspaceId);
      if (!workspace) return jsonError("Workspace not found", 404);

      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const body = parsed.body as { message?: string; history?: { role: string; content: string }[] };
      const incomingMessage = body.message?.trim();
      const rawHistory = Array.isArray(body.history) ? body.history : [];
      const history = rawHistory
        .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

      if (!incomingMessage && history.length === 0) {
        return jsonError("A message is required to test the agent");
      }

      const agentTools = await findAgentTools(env.DB, agent.id);
      const toolsSection = buildToolsSection(agentTools);

      const systemPrompt = buildFullSystemPrompt({
        agentName: agent.name,
        workspacePrompt: workspace.workspace_prompt ?? null,
        agentSystemPrompt: agent.system_prompt,
        workspace: {
          name: workspace.name,
          description: workspace.description,
        },
        toolsSection,
        conversationBlock: history.length > 0 ? history.map((m) => `[${m.role}]: ${m.content}`).join("\n\n") : "No history.",
      });

      try {
        const result = await runAgenticLoop({
          env,
          systemPrompt,
          history,
          incomingMessage,
          agentTools,
          collectTraces: true,
        });

        return jsonOk({
          traces: result.traces,
          history: result.messages.slice(1),
        });
      } catch (err: unknown) {
        console.error("AI test pipeline failed", err);
        return jsonError(`AI model call failed: ${(err as Error)?.message || "Unknown error"}`, 500);
      }
    },
  });
});
