# Post-SSO cleanup — handoff

Pulse has been converted from a standalone app into an OIDC Relying Party of the
OnDesk control plane. The conversion works end to end in production. What remains
is removing the code and data that the old model left behind, and updating the UI
that still assumes Pulse owns identity, tenancy and billing.

Architecture and rationale: `ondesk/docs/platform-architecture.md`.

> **Revised 2026-07-30.** Tasks A and B are done, and the ondesk workspace UI
> that blocked new signups now exists. Several claims in the previous revision
> were stale and are corrected inline below — check anything here against the
> live system before trusting it, which is how those errors were found.

---

## Where things stand

**Done and verified in production**

- Auth moved to ondesk. `pulse.ondesk.cc/api/auth/sso/start` → OIDC authorize →
  ondesk sign-in → callback → pulse issues its own session. Verified live.
- Old endpoints return 405: `/api/auth/{login,register,2fa/verify,oauth/*}`.
- `/api/platform/webhook` rejects unsigned (401); `/api/platform/reconcile`
  rejects untokened (403).
- Data migrated to `ondesk-db` with **primary keys preserved**: 2 users, 2 OAuth
  identities, 3 workspaces, 3 members, 3 subscriptions, 3 Stripe customers, 1
  pending invitation, 3 audit entries.
- `pulse-db` migrated: identity tables dropped, credential columns dropped,
  `workspace_entitlements` populated, `workspaces.audit_log_enabled` mirrored,
  550 tickets untouched.
- Secrets set on both Pages projects.

**Typecheck baselines** — do not let these regress:

| | app | functions |
| --- | --- | --- |
| pulse | 33 errors (all pre-existing) | 1 (pre-existing, `ai-agent-runtime.ts:59`) |
| ondesk | 0 | 0 |

Pulse's remaining errors are pre-existing TanStack Form / recharts type errors
that predate this work. The count was 34 until `agent-form.tsx` was deleted in
Task A. Confirm any number you see against these before assuming you broke
something:
`npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep -c "error TS"`.

---

## Task A — dead code in pulse ✅ done

Every claim below was re-verified against the tree before deleting; two claims in
the previous revision were already stale.

**Backend — removed**

- `functions/_lib/db/invitations.ts` — deleted, with its re-export in
  `functions/_lib/db/index.ts`. Had zero call sites.
- `functions/_lib/types/workspaces.ts` — `WorkspaceInvitationRow` and
  `PublicInvitation` removed.
- `functions/_lib/email.ts` — `invitationEmail`, `twoFactorCodeEmail`,
  `passwordResetEmail`, `accountLockedEmail` removed, plus the now-orphaned
  `.code-box` / `.code` CSS. `sendEmail`, `notificationEmail`, `escapeHtml`,
  `excerpt`, `baseTemplate` and `.warning` stay — ticket notifications use them.
- `functions/_db/schema.sql` — **nothing to do.** The previous revision said to
  grep for `invitation` and `two_factor` leftovers; there are none.

**Frontend — removed**

- `src/features/users/api/users-api.ts` — every `/api/invitations` call gone.
  The file is now read-only: `apiGetWorkspaceMembers` alone.
- `src/features/users/hooks/use-user-mutations.ts` — deleted (all five hooks were
  used only by `agents-section.tsx`).
- `use-user-queries.ts` — `useWorkspaceInvitations` removed. `useWorkspaceMembers`
  **stays**: nine other screens read it and `GET /api/users` is alive.
- `src/context/auth-context.tsx` — `two_factor_enabled` removed from `AuthUser`.
- Deleted as newly unreachable: `modals/{add,edit,delete}-agent-modal.tsx`,
  `forms/agent-form.tsx`.

**Dependencies**

- `stripe` — removed from `package.json`. Zero imports; the only match was an
  example URL in a validation message.
- `@tanstack/zod-form-adapter` — **still there**, still imported by the form files
  that hold most of the remaining 33 errors. Unchanged from the previous
  revision: optional, and the way to get the baseline down.

**Not dead — do not remove**

- Stripe in `src/features/marketplace/modals/*` — the Stripe *API* as an example
  marketplace connector. Unrelated to billing.
- Stripe in `src/i18n/locales/*` — marketing copy.
- `createWorkspace`-looking names in `automations`, `business-hours`,
  `canned-replies` etc. — the generic `crud-api.ts` factory, false positives.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` **on the pulse project** — these are
  the Gmail mailbox integration (ticket ingestion), not sign-in. In active use.

---

## Task A.1 — invariant #2 was being violated ⚠️ fixed

Not in the previous revision, and worse than the dead invite endpoint because it
failed silently rather than erroring.

`PATCH` and `DELETE` on pulse's `/api/users` called `updateWorkspaceMemberRole`
and `removeWorkspaceMember`, which write `workspace_members` — a mirrored table
only `mirror.ts` may write. Changing a role or removing a teammate from inside
Pulse returned success, wrote pulse-db only, and was then reverted by the next
mirror event or reconcile pass, with nothing surfaced to the user.

- `functions/api/users/index.ts` is now GET-only.
- `functions/_lib/db/workspaces.ts` — `updateWorkspaceMemberRole`,
  `removeWorkspaceMember`, `addWorkspaceMember`, `createWorkspace` and
  `slugExists` removed; all were unreachable once the handlers went. Each site
  carries a comment saying where the write side actually lives.

---

## Task B — pulse-db ✅ done

- **`plan = 'professional'`** normalised to **`core`**. Both rows were
  `status = 'canceled'` (workspaces `okj` and `acm`, `agent_count` 1), so there
  was no billing consequence and both were already invisible to Pulse via the
  `status IN ('active','trialing','past_due')` gate. `core` over `enterprise`
  because `professional` was the old middle tier. Applied to ondesk's
  `subscriptions` first, then pulse's `workspace_entitlements` — 2 rows each,
  verified. The only active subscription is `alex` on `enterprise/annual`.
  To reverse: set `plan='professional'` where `status='canceled'`.
- **The 8 unused Stripe secrets were already gone.** The previous revision called
  a live `STRIPE_SECRET_KEY` on the pulse project the main risk here;
  `wrangler pages secret list --project-name pulse` shows no Stripe secret of any
  kind. Nothing to delete.
- `functions/_db/migrations/003_ondesk_sso.sql` was applied in two halves on the
  live database, because the additive half had already run and SQLite has no
  `ADD COLUMN IF NOT EXISTS`. The file as committed is still correct for a
  database that has not been touched. Leave it alone.

---

## Task C — UI that still assumes the old model (partly done)

**Done**

- `configurations/agents-section.tsx` — now a read-only member list plus
  "Manage on OnDesk", following `billing-section.tsx`. The invite flow and the
  role/remove controls are gone (see Task A.1: they never worked).
- `profile/account-section.tsx` — was three forms (change email, change password,
  delete account) with **no handlers wired to anything**. Now states where
  identity lives and links out.
- `profile-view.tsx` — tab descriptions no longer advertise 2FA as a Pulse
  feature.

**Still to do**

- `general-section.tsx` — unchecked. Confirm whether it still edits
  name/description/logo. Those are mirrored from ondesk and any local write is
  overwritten on the next sync. `PATCH /api/workspaces/:slug` now accepts **only**
  `workspace_prompt`. This is the last place the Task A.1 class of bug could still
  be hiding.
- `profile-security-section.tsx` — `activeSessions` is hardcoded fake data
  (two invented devices in Buenos Aires) rendered as if real.
- `workspace-selector-view.tsx` — verify the empty state reads sensibly for a user
  whose only workspaces have lapsed entitlements; they currently see an empty list
  with no explanation.
- `overview-view.tsx` — nothing to fix for correctness. To surface plan and seat
  usage, the data is in `workspace_entitlements` via
  `GET /api/billing?workspace_id=`, which also returns `manage_url`.
- `roles-section.tsx` stays: `workspace_roles` is Pulse's own permission model,
  unrelated to tenancy.

---

## ondesk — the missing workspace UI ✅ built

The API was complete but the frontend had only `/`, `/dashboard` and `/auth/*`,
so `authorize.ts` redirected every workspace-less user to `/workspaces/new`,
which did not exist. Three routes now do:

- **`/workspaces/new`** — the onboarding target. Creates the workspace, then, when
  `?app=` is present, continues into checkout for that product. Both halves are
  needed: a workspace with no subscription is invisible to every product, so
  stopping after creation would have dead-ended the user just as effectively.
  `workspace-selector-view.tsx:99` and `workspace-sidebar.tsx:116` in pulse
  already linked here, so those two buttons were 404s and now work.
- **`/workspaces/:slug/billing`** — the checkout `success_url` / `cancel_url`
  target, which was also a 404. Polls for the subscription on return, because the
  Stripe webhook may not have landed yet, and links onward to the product.
- **`/workspaces/:slug/members`** — membership management, the destination Pulse
  now links out to.
- **`/apps/:id`** — the product page and subscribe flow. This is where
  `pulse/functions/api/auth/sso/callback.ts:68` sends anyone whose tenant has no
  Pulse entitlement, and it was a 404, so *every* unsubscribed tenant hit a dead
  end immediately after signing in. Handles the `incomplete` subscription case:
  checkout pre-creates that row before handing off to Stripe, so an abandoned
  checkout leaves one behind and the workspace must still be offered for sale.
- **`/workspaces`** — the workspace list. This is the `manage_url` that pulse's
  own `/api/billing` returns, so the "Manage on OnDesk" button in
  `billing-section.tsx` pointed here; also a 404.
- **`/account/security`** — 2FA toggle and password reset, the destination of the
  three identity links in Pulse. Deliberately limited to what the API supports:
  there is no change-password endpoint (only the emailed reset flow) and nothing
  exposes connected OAuth identities, so neither appears.

**How these were missed the first time.** The initial sweep grepped `APP_URL`
across *ondesk's* functions. It found the redirects ondesk makes to itself and
missed every link *pulse* makes to ondesk, which use `ONDESK_ISSUER` or
`VITE_ONDESK_URL`. When adding a cross-app redirect, grep both repos:

```
grep -rnE "\$\{(ONDESK_URL|ONDESK_ISSUER)[^}]*\}[^\"'\`)]*|https://ondesk\.cc[^\"'\`)]*" pulse/src pulse/functions
```

**Invitations could not be accepted at all.** The previous revision listed the
invitations API as complete. It could send invites and nothing could redeem them:
`/api/invitations` had only GET and POST, and the `?invite=` token the email
links to was parsed in `routes/auth.tsx` and then dropped.

- `functions/api/invitations/accept.ts` — new. Validates status, expiry and that
  the signed-in address matches the invited one (a forwarded invite link must not
  join whoever opens it), is idempotent, and emits `workspace.member_added` so
  products mirror the new member.
- `src/features/auth/invite.ts` + both auth mutations — the token is redeemed
  after sign-in/sign-up and **before** the post-auth navigation, or a parked
  authorize would bounce the new member into onboarding for the very workspace
  they were invited to.
- Auth screens now carry `invite` and `return_to` across the signin↔signup links.

---

## Known gaps

- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are absent on ondesk** — not
  empty, as the previous revision said: they are not set at all.
  `alexis.cuevases@gmail.com` is an OAuth-only Google account with no password and
  **still cannot sign in.** This remains the one active blocker and needs a Google
  Cloud OAuth client:

  ```
  wrangler pages secret put GOOGLE_CLIENT_ID     --project-name ondesk
  wrangler pages secret put GOOGLE_CLIENT_SECRET --project-name ondesk
  ```

  The authorised redirect URI is `${APP_URL}/api/auth/oauth/google/callback`.
  Do **not** reuse pulse's Google credentials: those are scoped to the Gmail
  mailbox integration, and signing in would show every visitor a Gmail consent
  screen. Until the secrets exist, `/api/auth/oauth/google/start` now fails on our
  side with `oauth_unconfigured` and a real message, instead of handing Google an
  empty `client_id` and letting it render its own error page. The same guard was
  added to the Microsoft route.
- **No ondesk frontend route is known to be missing any more.** Every
  ondesk-bound destination referenced from either repo now resolves; the grep
  above is the check to re-run after adding one.
- **`ondesk.cc` as an email sending domain is unconfirmed.** The API token
  authenticates against the send endpoint (verified), but I could not confirm the
  domain is onboarded. If 2FA codes or invitation emails never arrive, that is
  why. Check the dashboard under Email → Email Sending.
- **`https://pulse.ondesk.cc/w/alex` returned a 403** from the edge — an HTML
  error page, not one of ours (ours are JSON). Never diagnosed. Suspect Cloudflare
  Access or a WAF rule on the hostname.
- **Committed, but unpushed and untested in a browser.** The previous revision's
  claim that nothing was committed was wrong even then: the SSO conversion was
  already in `b564827` (pulse) and `705f307` (ondesk). The work described in this
  revision landed as `54ad9fd` (pulse) and `6d53a24` (ondesk). Neither is pushed,
  and none of the three new ondesk routes has been exercised against a running
  app — they typecheck, lint and build, which is not the same thing.

---

## Invariants — breaking these breaks the platform

1. **IDs are global.** A `user_id` or `workspace_id` means the same thing in
   ondesk, pulse and vault. The mirror works without an ID-mapping table only
   because the migration preserved every primary key.
2. **Only `functions/_lib/db/mirror.ts` writes `users`, `workspaces` and
   `workspace_members`.** Any other write path diverges silently, and the
   divergence is invisible until a JOIN starts returning wrong rows. This was
   being violated by `/api/users` — see Task A.1. When auditing for more of these,
   grep for writes to those three tables, not for the endpoints that look risky.
3. **`workspace_entitlements` is the access gate.** `findWorkspacesByUserId`
   joins it and filters on `status IN ('active','trialing','past_due')`. A
   workspace missing from that table is invisible to the whole app.
4. **Pulse never authenticates anyone.** No passwords, no OAuth identities, no
   2FA. If a change needs any of those, it belongs in ondesk.
