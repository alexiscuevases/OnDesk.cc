import { jsonOk, jsonError } from "../../_lib/response";
import { scanSlaBreaches, findTicketById } from "../../_lib/db";
import type { SlaBreach } from "../../_lib/db/sla";
import type { Env } from "../../_lib/types/env";
import type { PagesFunction } from "@cloudflare/workers-types";
import { buildTicketAudience, notify, ticketDetails } from "../../_lib/notify";

// POST /api/cron/sla — invoked externally with Authorization: Bearer CRON_SECRET
export const onRequest: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
	if (request.method !== "POST") return jsonError("Method not allowed", 405);
	const auth = request.headers.get("Authorization");
	const expected = `Bearer ${env.CRON_SECRET ?? ""}`;
	if (!env.CRON_SECRET || auth !== expected) return jsonError("Unauthorized", 401);

	const result = await scanSlaBreaches(env.DB);

	if (result.breaches.length > 0) {
		waitUntil(notifySlaBreaches(env, result.breaches));
	}

	return jsonOk({ scanned: result.scanned, breached: result.breached });
};

async function notifySlaBreaches(env: Env, breaches: SlaBreach[]): Promise<void> {
	for (const breach of breaches) {
		try {
			const ticket = await findTicketById(env.DB, breach.ticket_id);
			if (!ticket) continue;

			const label = breach.kind === "response" ? "First response" : "Resolution";
			const audience = await buildTicketAudience(env.DB, ticket, {
				selfPref: "sla_breach",
				teamPref: "sla_breach",
			});

			await notify(env, {
				workspaceId: ticket.workspace_id,
				recipients: audience,
				type: "sla",
				title: `SLA breached — ${label.toLowerCase()} overdue`,
				description: `"${ticket.subject}" missed its ${label.toLowerCase()} target.`,
				resourceId: ticket.id,
				email: {
					subject: `[#${ticket.number}] SLA breached: ${ticket.subject}`,
					heading: `SLA breached — ${label.toLowerCase()} overdue`,
					body: "This ticket has passed its SLA target and needs attention.",
					warning: `${label} was due ${new Date(breach.due_at * 1000).toUTCString()}.`,
					details: ticketDetails(ticket),
					ticketId: ticket.id,
					ctaLabel: "Open ticket",
				},
			});
		} catch (err) {
			console.error("cron/sla: failed to notify breach for ticket", breach.ticket_id, err);
		}
	}
}
