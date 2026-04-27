import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../_lib/types";
import {
	findMailboxIntegrationsByEmailOnly,
	findEmailTicketByMessageId,
	findTicketByConversationId,
	updateMailboxTokens,
	updateMailboxLastHistoryId,
	updateMailboxSubscription,
	markEmailAsTicket,
	findOrCreateContact,
	createTicket,
	createTicketMessage,
	findWorkspaceMemberIds,
	createNotification,
	findActiveAgentForMailbox,
	findTicketById,
} from "../../_lib/db";
import {
	refreshGmailAccessToken,
	listGmailHistory,
	getGmailMessage,
	extractGmailBody,
	extractGmailHeader,
	watchGmailMailbox,
} from "../../_lib/gmail";
import { runAiAgentPipeline } from "../../_lib/ai-agent-pipeline";
import { createMethodRouter } from "../../_lib/http";

interface PubSubMessage {
	message: {
		data: string; // base64({ emailAddress, historyId })
		messageId: string;
		publishTime: string;
	};
	subscription: string;
}

// POST /api/webhooks/gmail?secret=
export const onRequest: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
	// Verify the shared secret to prevent unauthorized pushes
	const url = new URL(request.url);
	const secret = url.searchParams.get("secret");
	if (!secret || secret !== env.GOOGLE_PUBSUB_SECRET) {
		return new Response(null, { status: 401 });
	}

	return createMethodRouter(request.method, {
		POST: async () => {
			let body: PubSubMessage;
			try {
				body = await request.json() as PubSubMessage;
			} catch {
				return new Response(null, { status: 204 });
			}

			const rawData = body.message?.data;
			if (!rawData) return new Response(null, { status: 204 });

			let notification: { emailAddress: string; historyId: string };
			try {
				const decoded = atob(rawData.replace(/-/g, "+").replace(/_/g, "/"));
				notification = JSON.parse(decoded) as { emailAddress: string; historyId: string };
			} catch {
				return new Response(null, { status: 204 });
			}

			const { emailAddress, historyId: newHistoryId } = notification;
			if (!emailAddress || !newHistoryId) return new Response(null, { status: 204 });

			// Process asynchronously so we return 204 fast
			waitUntil(processGmailNotification(env, emailAddress, newHistoryId));

			return new Response(null, { status: 204 });
		},
	}) as unknown as Response;
};

async function processGmailNotification(env: Env, emailAddress: string, newHistoryId: string): Promise<void> {
	const mailboxes = await findMailboxIntegrationsByEmailOnly(env.DB, emailAddress);
	if (!mailboxes.length) return;

	const nowSecs = () => Math.floor(Date.now() / 1000);

	for (const mailbox of mailboxes) {
		try {
			if (!mailbox.last_history_id) continue;

			// Refresh token if needed
			let accessToken = mailbox.access_token;
			if (mailbox.token_expires_at < nowSecs() + 60) {
				const refreshed = await refreshGmailAccessToken(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, mailbox.refresh_token);
				accessToken = refreshed.access_token;
				await updateMailboxTokens(env.DB, mailbox.id, {
					access_token: refreshed.access_token,
					refresh_token: refreshed.refresh_token ?? mailbox.refresh_token,
					token_expires_at: nowSecs() + refreshed.expires_in,
				});
			}

			// Renew watch if expiring within 24 hours
			if (mailbox.subscription_expires_at !== null && mailbox.subscription_expires_at - nowSecs() < 86400) {
				try {
					const watch = await watchGmailMailbox(accessToken, env.GOOGLE_PUBSUB_TOPIC);
					const subExpiresAt = Math.floor(Number(watch.expiration) / 1000);
					await updateMailboxSubscription(env.DB, mailbox.id, {
						subscription_id: watch.historyId,
						subscription_expires_at: subExpiresAt,
					});
					await updateMailboxLastHistoryId(env.DB, mailbox.id, watch.historyId);
				} catch {
					// Non-fatal
				}
			}

			// Fetch history since last processed
			let historyRes;
			try {
				historyRes = await listGmailHistory(accessToken, mailbox.last_history_id);
			} catch (err) {
				// historyId too old (410 Gone) — reset by re-watching
				console.error("Gmail history fetch failed:", err);
				try {
					const watch = await watchGmailMailbox(accessToken, env.GOOGLE_PUBSUB_TOPIC);
					await updateMailboxLastHistoryId(env.DB, mailbox.id, watch.historyId);
				} catch {
					// ignore
				}
				continue;
			}

			// Advance history cursor regardless of whether there are new messages
			await updateMailboxLastHistoryId(env.DB, mailbox.id, newHistoryId);

			if (!historyRes.history?.length) continue;

			// Collect all newly added message IDs
			const messageIds = new Set<string>();
			for (const record of historyRes.history) {
				for (const added of record.messagesAdded ?? []) {
					messageIds.add(added.message.id);
				}
			}

			for (const messageId of messageIds) {
				try {
					await processGmailMessage(env, accessToken, mailbox.id, mailbox.workspace_id, messageId, mailbox);
				} catch (err) {
					console.error("Error processing Gmail message:", err);
				}
			}
		} catch (err) {
			console.error("Error processing Gmail notification for mailbox:", mailbox.id, err);
		}
	}
}

async function processGmailMessage(
	env: Env,
	accessToken: string,
	mailboxId: string,
	workspaceId: string,
	gmailMessageId: string,
	mailbox: Awaited<ReturnType<typeof findMailboxIntegrationsByEmailOnly>>[number],
): Promise<void> {
	// Deduplication check (use Gmail message id as the internet_message_id key)
	const existing = await findEmailTicketByMessageId(env.DB, mailboxId, gmailMessageId);
	if (existing) return;

	// Fetch full message
	const message = await getGmailMessage(accessToken, gmailMessageId);

	// Skip messages sent by the mailbox owner (to avoid processing outbound emails)
	const fromHeader = extractGmailHeader(message, "From");
	const fromAddress = fromHeader.match(/<([^>]+)>/)?.[1] ?? fromHeader;
	if (fromAddress.toLowerCase() === mailbox.email.toLowerCase()) return;

	const subject = extractGmailHeader(message, "Subject") || "(no subject)";
	const senderName = fromHeader.replace(/<[^>]+>/, "").trim().replace(/"/g, "") || fromAddress;
	const ccHeader = extractGmailHeader(message, "CC");
	const messageIdHeader = extractGmailHeader(message, "Message-ID");
	const content = extractGmailBody(message);
	const threadId = message.threadId;

	// Find or create contact
	const contact = await findOrCreateContact(env.DB, workspaceId, {
		name: senderName,
		email: fromAddress.toLowerCase(),
	});

	// Find existing ticket by threadId (Gmail thread = MS conversationId)
	const existingTicket = await findTicketByConversationId(env.DB, workspaceId, threadId);

	let ticketId: string;
	if (existingTicket) {
		ticketId = existingTicket.id;

		if (existingTicket.assignee_id) {
			await createNotification(env.DB, {
				user_id: existingTicket.assignee_id,
				workspace_id: workspaceId,
				type: "message",
				title: "Customer replied",
				description: `${contact.name} replied to "${existingTicket.subject}".`,
				resource_id: existingTicket.id,
			});
		}
	} else {
		const ccList = ccHeader
			? ccHeader.split(",").map((entry) => {
					const addr = entry.match(/<([^>]+)>/)?.[1] ?? entry.trim();
					const name = entry.replace(/<[^>]+>/, "").trim().replace(/"/g, "");
					return { name: name || addr, address: addr };
				})
			: [];

		const ticket = await createTicket(env.DB, workspaceId, {
			subject,
			contact_id: contact.id,
			status: "open",
			priority: "medium",
			channel: "email",
			conversation_id: threadId,
			cc_addresses: ccList.length > 0 ? JSON.stringify(ccList) : undefined,
		});
		ticketId = ticket.id;

		const memberIds = await findWorkspaceMemberIds(env.DB, workspaceId);
		await Promise.all(
			memberIds.map((uid) =>
				createNotification(env.DB, {
					user_id: uid,
					workspace_id: workspaceId,
					type: "ticket",
					title: "New ticket received",
					description: `${contact.name} opened "${subject}".`,
					resource_id: ticket.id,
				}),
			),
		);
	}

	// Store message — graph_message_id holds Gmail message id for reply threading
	await createTicketMessage(env.DB, {
		ticket_id: ticketId,
		author_id: contact.id,
		author_type: "contact",
		type: "message",
		content,
		graph_message_id: gmailMessageId,
	});

	// Dedup record
	await markEmailAsTicket(env.DB, {
		mailbox_integration_id: mailboxId,
		internet_message_id: gmailMessageId,
		ticket_id: ticketId,
	});

	// AI agent routing
	const aiAgent = await findActiveAgentForMailbox(env.DB, mailboxId);
	if (aiAgent) {
		const ticket = await findTicketById(env.DB, ticketId);
		if (ticket) {
			runAiAgentPipeline(env, {
				ticket,
				mailbox,
				aiAgent,
				contact,
				isNewTicket: !existingTicket,
			}).catch((err) => console.error("AI agent pipeline error:", err));
		}
	}
}
