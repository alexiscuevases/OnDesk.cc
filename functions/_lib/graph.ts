import type {
	GraphTokenResponse,
	GraphUserProfile,
	GraphSubscription,
	GraphMessage,
	SendGraphMailResult,
} from "./types";
import { MICROSOFT_GRAPH_CONFIG } from "./configs";

const TOKEN_ENDPOINT = MICROSOFT_GRAPH_CONFIG.TOKEN_ENDPOINT;
const GRAPH_BASE = MICROSOFT_GRAPH_CONFIG.GRAPH_BASE_URL;

export async function exchangeCodeForTokens(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<GraphTokenResponse> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		code,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
		scope: MICROSOFT_GRAPH_CONFIG.OAUTH_SCOPE,
	});

	const res = await fetch(TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Token exchange failed: ${err}`);
	}

	return res.json() as Promise<GraphTokenResponse>;
}

export async function refreshAccessToken(clientId: string, clientSecret: string, refreshToken: string): Promise<GraphTokenResponse> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		grant_type: "refresh_token",
		scope: MICROSOFT_GRAPH_CONFIG.OAUTH_SCOPE,
	});

	const res = await fetch(TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Token refresh failed: ${err}`);
	}

	return res.json() as Promise<GraphTokenResponse>;
}

export async function getGraphUserProfile(accessToken: string): Promise<GraphUserProfile> {
	const res = await fetch(`${GRAPH_BASE}/me?$select=id,mail,userPrincipalName`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get user profile: ${err}`);
	}

	return res.json() as Promise<GraphUserProfile>;
}

export async function createGraphSubscription(accessToken: string, notificationUrl: string, clientState: string): Promise<GraphSubscription> {
	const expirationDateTime = new Date(
		Date.now() + MICROSOFT_GRAPH_CONFIG.MAIL_SUBSCRIPTION_TTL_DAYS * 24 * 60 * 60 * 1000,
	).toISOString();

	const res = await fetch(`${GRAPH_BASE}/subscriptions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			changeType: "created",
			notificationUrl,
			resource: "me/mailFolders('Inbox')/messages",
			expirationDateTime,
			clientState,
		}),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to create subscription: ${err}`);
	}

	return res.json() as Promise<GraphSubscription>;
}

export async function renewGraphSubscription(accessToken: string, subscriptionId: string): Promise<GraphSubscription> {
	const expirationDateTime = new Date(
		Date.now() + MICROSOFT_GRAPH_CONFIG.MAIL_SUBSCRIPTION_TTL_DAYS * 24 * 60 * 60 * 1000,
	).toISOString();

	const res = await fetch(`${GRAPH_BASE}/subscriptions/${subscriptionId}`, {
		method: "PATCH",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ expirationDateTime }),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to renew subscription: ${err}`);
	}

	return res.json() as Promise<GraphSubscription>;
}

export async function deleteGraphSubscription(accessToken: string, subscriptionId: string): Promise<void> {
	const res = await fetch(`${GRAPH_BASE}/subscriptions/${subscriptionId}`, {
		method: "DELETE",
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	// 404 means already expired/deleted — treat as success
	if (!res.ok && res.status !== 404) {
		const err = await res.text();
		throw new Error(`Failed to delete subscription: ${err}`);
	}
}

// Find a message in the mailbox by its RFC 2822 internetMessageId
async function findMessageByInternetId(accessToken: string, internetMessageId: string): Promise<string | null> {
	const filter = encodeURIComponent(`internetMessageId eq '${internetMessageId}'`);
	const res = await fetch(`${GRAPH_BASE}/me/messages?$filter=${filter}&$select=id&$top=1`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});
	if (!res.ok) return null;
	const data = await res.json() as { value: { id: string }[] };
	return data.value?.[0]?.id ?? null;
}

export async function replyGraphMail(
	accessToken: string,
	internetMessageId: string,
	bodyHtml: string,
	cc?: { name: string; address: string }[],
	bcc?: { name: string; address: string }[],
): Promise<void> {
	// Resolve the stable mailbox message ID from the RFC 2822 internetMessageId
	const mailboxMessageId = await findMessageByInternetId(accessToken, internetMessageId);
	if (!mailboxMessageId) {
		throw new Error(`Message not found in mailbox for internetMessageId: ${internetMessageId}`);
	}

	const messageOverride: Record<string, unknown> = {
		body: { contentType: "HTML", content: bodyHtml },
	};
	if (cc && cc.length > 0) {
		messageOverride.ccRecipients = cc.map((r) => ({ emailAddress: { name: r.name, address: r.address } }));
	}
	if (bcc && bcc.length > 0) {
		messageOverride.bccRecipients = bcc.map((r) => ({ emailAddress: { name: r.name, address: r.address } }));
	}

	const res = await fetch(`${GRAPH_BASE}/me/messages/${mailboxMessageId}/createReply`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message: messageOverride }),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to create reply: ${err}`);
	}

	const draft = await res.json() as { id: string };

	const sendRes = await fetch(`${GRAPH_BASE}/me/messages/${draft.id}/send`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!sendRes.ok) {
		const err = await sendRes.text();
		throw new Error(`Failed to send reply: ${err}`);
	}
}

export async function sendGraphMail(
	accessToken: string,
	to: { name: string; address: string },
	subject: string,
	bodyHtml: string,
	inReplyToMessageId?: string,
	cc?: { name: string; address: string }[],
	bcc?: { name: string; address: string }[],
): Promise<SendGraphMailResult> {
	const draftPayload: Record<string, unknown> = {
		subject,
		body: { contentType: "HTML", content: bodyHtml },
		toRecipients: [{ emailAddress: { name: to.name, address: to.address } }],
	};
	if (cc && cc.length > 0) {
		draftPayload.ccRecipients = cc.map((r) => ({ emailAddress: { name: r.name, address: r.address } }));
	}
	if (bcc && bcc.length > 0) {
		draftPayload.bccRecipients = bcc.map((r) => ({ emailAddress: { name: r.name, address: r.address } }));
	}

	if (inReplyToMessageId) {
		draftPayload.internetMessageHeaders = [
			{ name: "In-Reply-To", value: inReplyToMessageId },
			{ name: "References", value: inReplyToMessageId },
		];
	}

	// Create as draft first so we can read conversationId before sending
	const createRes = await fetch(`${GRAPH_BASE}/me/messages`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(draftPayload),
	});

	if (!createRes.ok) {
		const err = await createRes.text();
		throw new Error(`Failed to create draft: ${err}`);
	}

	const draft = await createRes.json() as { id: string; conversationId: string; internetMessageId: string };

	const sendRes = await fetch(`${GRAPH_BASE}/me/messages/${draft.id}/send`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!sendRes.ok) {
		const err = await sendRes.text();
		throw new Error(`Failed to send email: ${err}`);
	}

	return {
		conversationId: draft.conversationId,
		internetMessageId: draft.internetMessageId,
	};
}

export async function getGraphMessage(accessToken: string, messageId: string): Promise<GraphMessage> {
	const fields = "id,subject,bodyPreview,body,from,ccRecipients,internetMessageId,conversationId,receivedDateTime";
	const res = await fetch(`${GRAPH_BASE}/me/messages/${messageId}?$select=${fields}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get message: ${err}`);
	}

	return res.json() as Promise<GraphMessage>;
}
