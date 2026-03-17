import { jsonError } from "./response";

export type MethodHandler = () => Promise<Response> | Response;

export function createMethodRouter(
  method: string,
  handlers: Partial<Record<string, MethodHandler>>
): Response | Promise<Response> {
  const handler = handlers[method];
  if (!handler) {
    return jsonError("Method not allowed", 405);
  }
  return handler();
}

export async function parseJsonBody(
  request: Request
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false; response: Response }> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { ok: false, response: jsonError("Invalid JSON body") };
    }
    return { ok: true, body: body as Record<string, unknown> };
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body") };
  }
}

export function asTrimmedString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function asNullableTrimmedString(value: unknown): string | null | undefined {
  if (value === null) return null;
  return asTrimmedString(value);
}
