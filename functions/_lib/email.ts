import type { Env } from "./types";

interface EmailOptions {
	to: string;
	subject: string;
	html: string;
	/** Plain-text alternative. Derived from `html` when omitted. */
	text?: string;
}

/** Slice of Env that Cloudflare Email Sending needs. */
type EmailEnv = Pick<Env, "CF_ACCOUNT_ID" | "EMAIL_API_TOKEN" | "EMAIL_FROM" | "EMAIL_FROM_NAME">;

interface SendResponse {
	success: boolean;
	errors?: { code: number; message: string }[];
	result?: { delivered?: string[]; permanent_bounces?: string[]; queued?: string[] } | null;
}

const DEFAULT_FROM_NAME = "OnDesk";

export function emailConfigured(env: EmailEnv): boolean {
	return Boolean(env.CF_ACCOUNT_ID && env.EMAIL_API_TOKEN && env.EMAIL_FROM);
}

/**
 * Sends a transactional email through the Cloudflare Email Sending REST API.
 * Pages Functions can't use the `send_email` Workers binding, so we call the
 * account-scoped REST endpoint with an API token instead.
 */
export async function sendEmail(env: EmailEnv, opts: EmailOptions): Promise<void> {
	if (!emailConfigured(env)) {
		throw new Error("Email is not configured (CF_ACCOUNT_ID, EMAIL_API_TOKEN, EMAIL_FROM)");
	}

	const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.EMAIL_API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: { address: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME ?? DEFAULT_FROM_NAME },
			to: opts.to,
			subject: opts.subject,
			html: opts.html,
			text: opts.text ?? htmlToText(opts.html),
		}),
	});

	const body = (await res.json().catch(() => null)) as SendResponse | null;

	if (!res.ok || !body?.success) {
		const detail = body?.errors?.map((e) => `${e.code} ${e.message}`).join("; ") || `HTTP ${res.status}`;
		throw new Error(`Email delivery failed (${res.status}): ${detail}`);
	}

	const bounced = body.result?.permanent_bounces;
	if (bounced?.length) {
		throw new Error(`Email permanently bounced: ${bounced.join(", ")}`);
	}
}

/** Plain-text fallback so messages aren't HTML-only (helps spam scoring). */
function htmlToText(html: string): string {
	return html
		.replace(/<(style|script|head)\b[\s\S]*?<\/\1>/gi, "")
		.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n\n")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&apos;/g, "'")
		.replace(/&amp;/g, "&")
		.replace(/[ \t]+/g, " ")
		.replace(/^ +| +$/gm, "")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

// ─── Templates ───────────────────────────────────────────────────────────────

function baseTemplate(title: string, content: string): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 40px 16px; color: #18181b; }
    .card { background: #ffffff; border-radius: 12px; max-width: 480px; margin: 0 auto; padding: 40px 36px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .logo { font-size: 20px; font-weight: 700; margin-bottom: 32px; color: #18181b; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; }
    p { font-size: 15px; color: #52525b; line-height: 1.6; margin: 0 0 20px; }
    .btn { display: inline-block; background: #18181b; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 28px; border-radius: 8px; margin: 8px 0 24px; }
    .code-box { background: #f4f4f5; border-radius: 8px; text-align: center; padding: 20px; margin: 8px 0 24px; }
    .code { font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #18181b; font-family: monospace; }
    .footer { font-size: 12px; color: #a1a1aa; margin-top: 32px; border-top: 1px solid #f4f4f5; padding-top: 20px; }
    .warning { background: #fef2f2; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #b91c1c; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">OnDesk</div>
    ${content}
    <div class="footer">If you didn't request this, you can safely ignore this email.</div>
  </div>
</body>
</html>`;
}

export function passwordResetEmail(appUrl: string, resetUrl: string, name: string): string {
	return baseTemplate("Reset your password", `
    <h1>Reset your password</h1>
    <p>Hi ${name}, we received a request to reset the password for your account.</p>
    <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetUrl}" class="btn">Reset password</a>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:13px;color:#71717a;">${resetUrl}</p>
  `);
}

export function accountLockedEmail(appUrl: string, name: string): string {
	return baseTemplate("Account locked", `
    <h1>Account temporarily locked</h1>
    <p>Hi ${name}, your account has been locked after <strong>5 failed sign-in attempts</strong>.</p>
    <div class="warning">Your account will automatically unlock after <strong>30 minutes</strong>.</div>
    <p>If this was you, simply wait 30 minutes and try again. If you've forgotten your password, you can reset it below.</p>
    <a href="${appUrl}/auth/recover" class="btn">Reset password</a>
    <p>If this wasn't you, please reset your password immediately to secure your account.</p>
  `);
}

export function invitationEmail(inviteUrl: string, role: string): string {
	return `
            <p>You've been invited to join a workspace on <strong>OnDesk.cc</strong> as <strong>${role}</strong>.</p>
            <p><a href="${inviteUrl}" style="background:#000;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Accept Invitation</a></p>
            <p>This invitation expires in 7 days. If you did not expect this, you can ignore this email.</p>
          `;
}

export function twoFactorCodeEmail(code: string, name: string): string {
	return baseTemplate("Your sign-in code", `
    <h1>Sign-in verification code</h1>
    <p>Hi ${name}, use the code below to complete your sign-in. It expires in <strong>10 minutes</strong>.</p>
    <div class="code-box">
      <div class="code">${code}</div>
    </div>
    <p>Never share this code with anyone — OnDesk will never ask for it.</p>
  `);
}
