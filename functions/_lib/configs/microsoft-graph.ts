export const MICROSOFT_GRAPH_CONFIG = {
	TOKEN_ENDPOINT: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
	GRAPH_BASE_URL: "https://graph.microsoft.com/v1.0",
	OAUTH_SCOPE: "User.Read Mail.Read Mail.ReadWrite Mail.Send offline_access",
	MAIL_SUBSCRIPTION_TTL_DAYS: 3,
} as const;
