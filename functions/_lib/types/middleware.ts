import type { Env } from "./env";
import type { JwtPayload } from "./auth";

export interface AuthContext {
	request: Request;
	env: Env;
	params: Record<string, string>;
	payload: JwtPayload;
	/** Keeps the Worker alive for side effects (notification emails) after the response is sent. */
	waitUntil: (promise: Promise<unknown>) => void;
}

export interface WorkspaceContext extends AuthContext {
	workspaceId: string;
}
