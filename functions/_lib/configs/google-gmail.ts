export const GOOGLE_GMAIL_CONFIG = {
	AUTH_ENDPOINT: "https://accounts.google.com/o/oauth2/v2/auth",
	TOKEN_ENDPOINT: "https://oauth2.googleapis.com/token",
	USERINFO_URL: "https://www.googleapis.com/oauth2/v2/userinfo",
	GMAIL_BASE_URL: "https://gmail.googleapis.com/gmail/v1",
	OAUTH_SCOPE: [
		"https://www.googleapis.com/auth/gmail.readonly",
		"https://www.googleapis.com/auth/gmail.send",
		"https://www.googleapis.com/auth/gmail.modify",
		"https://www.googleapis.com/auth/userinfo.email",
		"openid",
	].join(" "),
	WATCH_TTL_MS: 7 * 24 * 60 * 60 * 1000,
} as const;
