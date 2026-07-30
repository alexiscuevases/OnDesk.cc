import { jsonOk, jsonError } from "../../_lib/response";
import { findNotificationPreferences, upsertNotificationPreferences } from "../../_lib/db";
import type { NotificationPreferences } from "../../_lib/types";
import { NOTIFICATION_PREF_KEYS } from "../../_lib/types";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter, parseJsonBody } from "../../_lib/http";

const EDITABLE_KEYS = ["email_enabled", ...NOTIFICATION_PREF_KEYS] as const;

// GET   /api/notifications/preferences?workspace_id=
// PATCH /api/notifications/preferences?workspace_id=   body: { <key>: boolean, ... }
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const preferences = await findNotificationPreferences(env.DB, payload.sub, workspaceId);
			return jsonOk({ preferences });
		},
		PATCH: async () => {
			const parsed = await parseJsonBody(request);
			if (!parsed.ok) return parsed.response;

			const updates: Partial<NotificationPreferences> = {};
			for (const key of EDITABLE_KEYS) {
				const value = parsed.body[key];
				if (value === undefined) continue;
				if (typeof value !== "boolean") return jsonError(`${key} must be a boolean`);
				updates[key] = value;
			}

			if (Object.keys(updates).length === 0) {
				return jsonError(`At least one of: ${EDITABLE_KEYS.join(", ")} is required`);
			}

			const preferences = await upsertNotificationPreferences(env.DB, payload.sub, workspaceId, updates);
			return jsonOk({ preferences });
		},
	});
});
