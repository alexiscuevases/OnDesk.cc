import { jsonOk, jsonError } from "../../_lib/response";
import { findNotificationsByUser, findRecentNotifications, markAllNotificationsRead } from "../../_lib/db";
import type { NotificationFilter } from "../../_lib/db/notifications";
import { withWorkspace } from "../../_lib/middleware";
import { createMethodRouter } from "../../_lib/http";

// GET  /api/notifications?workspace_id=&filter=all|unread&page=&page_size=
// GET  /api/notifications?workspace_id=&recent=1&limit=
// POST /api/notifications?workspace_id=&action=read-all  (mark all read)
export const onRequest = withWorkspace(async ({ request, env, workspaceId, payload }) => {
	return createMethodRouter(request.method, {
		GET: async () => {
			const url = new URL(request.url);

			if (url.searchParams.get("recent") === "1") {
				const limitRaw = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
				const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 10;
				const notifications = await findRecentNotifications(env.DB, payload.sub, workspaceId, limit);
				return jsonOk({ notifications });
			}

			const filterRaw = url.searchParams.get("filter");
			const filter: NotificationFilter = filterRaw === "unread" ? "unread" : "all";

			const pageRaw = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
			const pageSizeRaw = Number.parseInt(url.searchParams.get("page_size") ?? "25", 10);
			const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
			const pageSize = Number.isFinite(pageSizeRaw) ? Math.min(Math.max(pageSizeRaw, 1), 100) : 25;
			const offset = (page - 1) * pageSize;

			const { notifications, total } = await findNotificationsByUser(
				env.DB,
				payload.sub,
				workspaceId,
				filter,
				{ limit: pageSize, offset },
			);
			return jsonOk({ notifications, total, page, page_size: pageSize });
		},
		POST: async () => {
			const url = new URL(request.url);
			const action = url.searchParams.get("action");
			if (action === "read-all") {
				await markAllNotificationsRead(env.DB, payload.sub, workspaceId);
				return jsonOk({ ok: true });
			}
			return jsonError("Unknown action");
		},
	});
});
