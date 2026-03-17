export interface Env {
	DB: D1Database;
	STORAGE: R2Bucket;
	AI: Ai;
	JWT_SECRET: string;
	MS_CLIENT_ID: string;
	MS_CLIENT_SECRET: string;
	APP_URL: string;
}
