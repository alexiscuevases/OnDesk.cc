export interface GmailTokenResponse {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	token_type: string;
}

export interface GmailUserProfile {
	id: string;
	email: string;
}

export interface GmailWatchResponse {
	historyId: string;
	expiration: string; // milliseconds epoch as string
}

export interface GmailMessagePart {
	mimeType: string;
	body: { data?: string; size: number };
	parts?: GmailMessagePart[];
	headers?: { name: string; value: string }[];
}

export interface GmailMessage {
	id: string;
	threadId: string;
	payload: GmailMessagePart & { headers: { name: string; value: string }[] };
	snippet: string;
	internalDate: string; // milliseconds epoch as string
}

export interface GmailHistoryListResponse {
	history?: {
		messagesAdded?: { message: { id: string; threadId: string } }[];
	}[];
	historyId: string;
	nextPageToken?: string;
}

export interface GmailSendResult {
	conversationId: string; // maps to threadId
	internetMessageId: string; // Gmail message id
}
