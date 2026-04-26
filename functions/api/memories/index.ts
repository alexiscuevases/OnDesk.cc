import { jsonOk, jsonCreated, jsonError } from "../../_lib/response";
import { createMemory, findMemoriesByWorkspace, findMemoriesByContact, findMemoriesByIds } from "../../_lib/db";
import { withWorkspace } from "../../_lib/middleware";
import { asTrimmedString, createMethodRouter, parseJsonBody } from "../../_lib/http";
import { upsertMemory, isDuplicateMemory, searchMemories } from "../../_lib/vectorize";

// GET  /api/memories?workspace_id=&contact_id=&q=
// POST /api/memories
export const onRequest = withWorkspace(async ({ request, env, workspaceId }) => {
  return createMethodRouter(request.method, {
    GET: async () => {
      const url = new URL(request.url);
      const contactId = url.searchParams.get("contact_id");
      const q = url.searchParams.get("q")?.trim();

      if (q) {
        const ids = await searchMemories(env, q, workspaceId, contactId ?? null, 10);
        const memories = await findMemoriesByIds(env.DB, ids);
        return jsonOk({ memories });
      }

      const memories = contactId
        ? await findMemoriesByContact(env.DB, workspaceId, contactId)
        : await findMemoriesByWorkspace(env.DB, workspaceId);
      return jsonOk({ memories });
    },
    POST: async () => {
      const parsed = await parseJsonBody(request);
      if (!parsed.ok) return parsed.response;

      const { content, contact_id, expires_at } = parsed.body;
      const normalizedContent = asTrimmedString(content);
      if (!normalizedContent) return jsonError("content is required");

      const contactId = typeof contact_id === "string" ? contact_id : null;
      const expiresAt = typeof expires_at === "number" ? expires_at : null;

      const duplicate = await isDuplicateMemory(env, normalizedContent, workspaceId, contactId);
      if (duplicate) return jsonError("A similar memory already exists", 409);

      const memory = await createMemory(env.DB, workspaceId, normalizedContent, contactId, expiresAt);
      void upsertMemory(env, memory);
      return jsonCreated({ memory });
    },
  });
});
