import type { Env } from "./env";
import type { JwtPayload } from "./auth";

export interface AuthContext {
	request: Request;
	env: Env;
	params: Record<string, string>;
	payload: JwtPayload;
}

export interface WorkspaceContext extends AuthContext {
	workspaceId: string;
}
