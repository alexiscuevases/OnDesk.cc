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

export interface GraphEmailAddress {
	emailAddress: { name: string; address: string };
}

export interface GraphMessage {
	id: string;
	subject: string | null;
	bodyPreview: string;
	body: { content: string; contentType: string };
	from: { emailAddress: { name: string; address: string } };
	ccRecipients: GraphEmailAddress[];
	internetMessageId: string;
	conversationId: string;
	receivedDateTime: string;
}

export interface SendGraphMailResult {
	conversationId: string;
	internetMessageId: string;
}
