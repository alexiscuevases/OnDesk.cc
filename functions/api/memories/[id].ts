import { jsonOk, jsonError } from "../../_lib/response";
import { findMemoryById, deleteMemory, isWorkspaceMember } from "../../_lib/db";
import { withAuth } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";
import { deleteMemoryVector } from "../../_lib/vectorize";

// DELETE /api/memories/:id
export const onRequest = withAuth<"id">(async ({ request, env, params, payload }) => {
  const memoryId = params.id;
  const memory = await findMemoryById(env.DB, memoryId);
  if (!memory) return jsonError("Memory not found", 404);

  const member = await isWorkspaceMember(env.DB, memory.workspace_id, payload.sub);
  if (!member) return jsonError("Forbidden", 403);

  return createMethodRouter(request.method, {
    DELETE: async () => {
      await deleteMemory(env.DB, memoryId);
      void deleteMemoryVector(env, memoryId);
      return jsonOk({ success: true });
    },
  });
});
