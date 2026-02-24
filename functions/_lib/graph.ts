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
	receivedDateTime: string;
}

export async function exchangeCodeForTokens(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<GraphTokenResponse> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		code,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
		scope: "User.Read Mail.Read Mail.Send offline_access",
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
		scope: "User.Read Mail.Read Mail.Send offline_access",
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

export async function sendGraphMail(
	accessToken: string,
	to: { name: string; address: string },
	subject: string,
	bodyHtml: string,
	inReplyToMessageId?: string
): Promise<void> {
	const message: Record<string, unknown> = {
		subject,
		body: { contentType: "HTML", content: bodyHtml },
		toRecipients: [{ emailAddress: { name: to.name, address: to.address } }],
	};

	if (inReplyToMessageId) {
		message.internetMessageHeaders = [
			{ name: "In-Reply-To", value: inReplyToMessageId },
			{ name: "References", value: inReplyToMessageId },
		];
	}

	const res = await fetch(`${GRAPH_BASE}/me/sendMail`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ message, saveToSentItems: true }),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to send email: ${err}`);
	}
}

export async function getGraphMessage(accessToken: string, messageId: string): Promise<GraphMessage> {
	const fields = "id,subject,bodyPreview,body,from,internetMessageId,receivedDateTime";
	const res = await fetch(`${GRAPH_BASE}/me/messages/${messageId}?$select=${fields}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get message: ${err}`);
	}

	return res.json() as Promise<GraphMessage>;
}
