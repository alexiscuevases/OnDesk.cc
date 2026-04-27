import type {
	GmailTokenResponse,
	GmailUserProfile,
	GmailWatchResponse,
	GmailMessage,
	GmailMessagePart,
	GmailHistoryListResponse,
	GmailSendResult,
} from "./types";
import { GOOGLE_GMAIL_CONFIG } from "./configs";

const GMAIL_BASE = GOOGLE_GMAIL_CONFIG.GMAIL_BASE_URL;

// ─── Base64url helpers (Cloudflare Workers compatible) ────────────────────────

function base64urlEncode(input: string): string {
	const bytes = new TextEncoder().encode(input);
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function base64urlDecode(data: string): string {
	const base64 = data.replace(/-/g, "+").replace(/_/g, "/");
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder().decode(bytes);
}

// ─── Token management ─────────────────────────────────────────────────────────

export async function exchangeGmailCodeForTokens(
	clientId: string,
	clientSecret: string,
	code: string,
	redirectUri: string,
): Promise<GmailTokenResponse> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		code,
		redirect_uri: redirectUri,
		grant_type: "authorization_code",
	});

	const res = await fetch(GOOGLE_GMAIL_CONFIG.TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gmail token exchange failed: ${err}`);
	}

	return res.json() as Promise<GmailTokenResponse>;
}

export async function refreshGmailAccessToken(
	clientId: string,
	clientSecret: string,
	refreshToken: string,
): Promise<GmailTokenResponse> {
	const body = new URLSearchParams({
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		grant_type: "refresh_token",
	});

	const res = await fetch(GOOGLE_GMAIL_CONFIG.TOKEN_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Gmail token refresh failed: ${err}`);
	}

	return res.json() as Promise<GmailTokenResponse>;
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getGmailUserProfile(accessToken: string): Promise<GmailUserProfile> {
	const res = await fetch(GOOGLE_GMAIL_CONFIG.USERINFO_URL, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get Gmail user profile: ${err}`);
	}

	return res.json() as Promise<GmailUserProfile>;
}

// ─── Push notification watch ──────────────────────────────────────────────────

export async function watchGmailMailbox(
	accessToken: string,
	topicName: string,
): Promise<GmailWatchResponse> {
	const res = await fetch(`${GMAIL_BASE}/users/me/watch`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			topicName,
			labelIds: ["INBOX"],
		}),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to start Gmail watch: ${err}`);
	}

	return res.json() as Promise<GmailWatchResponse>;
}

export async function stopGmailWatch(accessToken: string): Promise<void> {
	const res = await fetch(`${GMAIL_BASE}/users/me/stop`, {
		method: "POST",
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	// 404 / 400 = already stopped — treat as success
	if (!res.ok && res.status !== 404 && res.status !== 400) {
		const err = await res.text();
		throw new Error(`Failed to stop Gmail watch: ${err}`);
	}
}

// ─── History (incremental sync) ───────────────────────────────────────────────

export async function listGmailHistory(
	accessToken: string,
	startHistoryId: string,
): Promise<GmailHistoryListResponse> {
	const params = new URLSearchParams({
		startHistoryId: String(Math.floor(Number(startHistoryId))),
		historyTypes: "messageAdded",
		labelId: "INBOX",
	});

	const res = await fetch(`${GMAIL_BASE}/users/me/history?${params}`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to list Gmail history: ${err}`);
	}

	return res.json() as Promise<GmailHistoryListResponse>;
}

// ─── Message fetching & parsing ───────────────────────────────────────────────

export async function getGmailMessage(accessToken: string, messageId: string): Promise<GmailMessage> {
	const res = await fetch(`${GMAIL_BASE}/users/me/messages/${messageId}?format=full`, {
		headers: { Authorization: `Bearer ${accessToken}` },
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to get Gmail message: ${err}`);
	}

	return res.json() as Promise<GmailMessage>;
}

function findBodyPart(part: GmailMessagePart, preferredType: string): string | null {
	if (part.mimeType === preferredType && part.body?.data) {
		return base64urlDecode(part.body.data);
	}
	if (part.parts) {
		for (const child of part.parts) {
			const found = findBodyPart(child, preferredType);
			if (found) return found;
		}
	}
	return null;
}

export function extractGmailBody(message: GmailMessage): string {
	return (
		findBodyPart(message.payload, "text/html") ??
		findBodyPart(message.payload, "text/plain") ??
		message.snippet
	);
}

export function extractGmailHeader(message: GmailMessage, name: string): string {
	return message.payload.headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";
}

// ─── Sending email ────────────────────────────────────────────────────────────

function buildMimeMessage(fields: {
	from?: string;
	to: string;
	cc?: string;
	subject: string;
	bodyHtml: string;
	inReplyTo?: string;
	references?: string;
}): string {
	const lines: string[] = [
		`MIME-Version: 1.0`,
		`Content-Type: text/html; charset=UTF-8`,
		`To: ${fields.to}`,
		`Subject: ${fields.subject}`,
	];
	if (fields.from) lines.push(`From: ${fields.from}`);
	if (fields.cc) lines.push(`CC: ${fields.cc}`);
	if (fields.inReplyTo) lines.push(`In-Reply-To: ${fields.inReplyTo}`);
	if (fields.references) lines.push(`References: ${fields.references}`);
	lines.push("", fields.bodyHtml);
	return lines.join("\r\n");
}

export async function sendGmailMail(
	accessToken: string,
	to: { name: string; address: string },
	subject: string,
	bodyHtml: string,
	inReplyToMessageId?: string,
	cc?: { name: string; address: string }[],
): Promise<GmailSendResult> {
	const toHeader = to.name ? `${to.name} <${to.address}>` : to.address;
	const ccHeader = cc?.length ? cc.map((r) => (r.name ? `${r.name} <${r.address}>` : r.address)).join(", ") : undefined;

	const raw = buildMimeMessage({
		to: toHeader,
		cc: ccHeader,
		subject,
		bodyHtml,
		inReplyTo: inReplyToMessageId,
		references: inReplyToMessageId,
	});

	const res = await fetch(`${GMAIL_BASE}/users/me/messages/send`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ raw: base64urlEncode(raw) }),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to send Gmail message: ${err}`);
	}

	const sent = await res.json() as { id: string; threadId: string };
	return { conversationId: sent.threadId, internetMessageId: sent.id };
}

export async function replyGmailMail(
	accessToken: string,
	gmailMessageId: string,
	bodyHtml: string,
	cc?: { name: string; address: string }[],
): Promise<void> {
	// Fetch original to get threadId and reply headers
	const original = await getGmailMessage(accessToken, gmailMessageId);
	const threadId = original.threadId;
	const messageIdHeader = extractGmailHeader(original, "Message-ID");
	const referencesHeader = extractGmailHeader(original, "References");
	const fromHeader = extractGmailHeader(original, "From");
	const subjectHeader = extractGmailHeader(original, "Subject");
	const subject = subjectHeader.startsWith("Re:") ? subjectHeader : `Re: ${subjectHeader}`;

	const references = [referencesHeader, messageIdHeader].filter(Boolean).join(" ");
	const ccHeader = cc?.length ? cc.map((r) => (r.name ? `${r.name} <${r.address}>` : r.address)).join(", ") : undefined;

	const raw = buildMimeMessage({
		to: fromHeader,
		cc: ccHeader,
		subject,
		bodyHtml,
		inReplyTo: messageIdHeader || undefined,
		references: references || undefined,
	});

	const res = await fetch(`${GMAIL_BASE}/users/me/messages/send`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${accessToken}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ raw: base64urlEncode(raw), threadId }),
	});

	if (!res.ok) {
		const err = await res.text();
		throw new Error(`Failed to send Gmail reply: ${err}`);
	}
}
