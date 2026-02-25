const TOKEN_ENDPOINT = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

export interface GraphTokenResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface GraphUserProfile {
	id: string;
	mail: string | null;
	userPrincipalName: string;
}

export interface GraphSubscription {
	id: string;
	expirationDateTime: string;
}

export interface GraphMessage {
	id: string;
	subject: string | null;
	bodyPreview: string;
	body: { content: string; contentType: string };
	from: { emailAddress: { name: string; address: string } };
	internetMessageId: string;
	conversationId: string;
	receivedDateTime: string;
}

export async function exchangeCodeForTokens(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<GraphTokenResponse> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		code,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
		scope: "User.Read Mail.Read Mail.ReadWrite Mail.Send offline_access",
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
		scope: "User.Read Mail.Read Mail.ReadWrite Mail.Send offline_access",
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
	// Mail subscriptions expire after max ~3 days
	const expirationDateTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

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
	const expirationDateTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

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
	bodyHtml: string
): Promise<void> {
	// Resolve the stable mailbox message ID from the RFC 2822 internetMessageId
	const mailboxMessageId = await findMessageByInternetId(accessToken, internetMessageId);
	if (!mailboxMessageId) {
		throw new Error(`Message not found in mailbox for internetMessageId: ${internetMessageId}`);
	}

	const res = await fetch(`${GRAPH_BASE}/me/messages/${mailboxMessageId}/createReply`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			message: {
				body: { contentType: "HTML", content: bodyHtml },
			},
		}),
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

export interface SendGraphMailResult {
	conversationId: string;
	internetMessageId: string;
}

export async function sendGraphMail(
	accessToken: string,
	to: { name: string; address: string },
	subject: string,
	bodyHtml: string,
	inReplyToMessageId?: string
): Promise<SendGraphMailResult> {
	const draftPayload: Record<string, unknown> = {
		subject,
		body: { contentType: "HTML", content: bodyHtml },
		toRecipients: [{ emailAddress: { name: to.name, address: to.address } }],
	};

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
	const fields = "id,subject,bodyPreview,body,from,internetMessageId,conversationId,receivedDateTime";
	const res = await fetch(`${GRAPH_BASE}/me/messages/${messageId}?$select=${fields}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get message: ${err}`);
	}

	return res.json() as Promise<GraphMessage>;
}
