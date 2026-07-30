export interface Env {
	APP_URL: string;
	/** Signs pulse's own session cookies (HS256). These never leave this origin. */
	JWT_SECRET: string;
	// ── OnDesk SSO ──────────────────────────────────────────────────────────
	// Pulse authenticates nobody: it is an OIDC Relying Party of the control
	// plane. See functions/_lib/sso.ts.
	/** Defaults to https://ondesk.cc when unset. */
	ONDESK_ISSUER?: string;
	ONDESK_CLIENT_ID: string;
	ONDESK_CLIENT_SECRET: string;
	/** Verifies inbound mirror-sync webhooks from ondesk. */
	ONDESK_WEBHOOK_SECRET: string;
	// Cloudflare Email Sending (REST API — Pages Functions have no send_email binding)
	CF_ACCOUNT_ID: string;
	EMAIL_API_TOKEN: string;
	EMAIL_FROM: string;
	EMAIL_FROM_NAME?: string;
	// Cloudfalre
	DB: D1Database;
	STORAGE: R2Bucket;
	AI: Ai;
	VECTORIZE_TICKETS: VectorizeIndex;
	VECTORIZE_MESSAGES: VectorizeIndex;
	VECTORIZE_CONTACTS: VectorizeIndex;
	VECTORIZE_COMPANIES: VectorizeIndex;
	VECTORIZE_MEMORIES: VectorizeIndex;
	VECTORIZE_KB?: VectorizeIndex;
	// Microsoft
	MS_CLIENT_ID: string;
	MS_CLIENT_SECRET: string;
	// Google
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GOOGLE_PUBSUB_TOPIC: string;
	GOOGLE_PUBSUB_SECRET: string;
	// Stripe
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
	STRIPE_STARTER_MONTHLY_PRICE_ID: string;
	STRIPE_STARTER_ANNUAL_PRICE_ID: string;
	STRIPE_CORE_MONTHLY_PRICE_ID: string;
	STRIPE_CORE_ANNUAL_PRICE_ID: string;
	STRIPE_ENTERPRISE_MONTHLY_PRICE_ID: string;
	STRIPE_ENTERPRISE_ANNUAL_PRICE_ID: string;
	// Cron / scheduled jobs (bearer token sent in Authorization header)
	CRON_SECRET?: string;
	// AES-GCM key material for marketplace connector credentials at rest.
	// Falls back to JWT_SECRET when unset (rotating it invalidates stored creds).
	CREDENTIALS_SECRET?: string;
}
