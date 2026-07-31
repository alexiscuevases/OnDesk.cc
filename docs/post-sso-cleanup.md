# Post-SSO cleanup — handoff

Pulse has been converted from a standalone app into an OIDC Relying Party of the
OnDesk control plane. The conversion works end to end in production. What remains
is removing the code and data that the old model left behind, and updating the UI
that still assumes Pulse owns identity, tenancy and billing.

Architecture and rationale: `ondesk/docs/platform-architecture.md`.

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
| pulse | 34 errors (all pre-existing) | 1 (pre-existing, `ai-agent-runtime.ts:59`) |
| ondesk | 0 | 0 |

Pulse's 34 are pre-existing TanStack Form / recharts type errors that predate this
work. Confirm any number you see against these before assuming you broke something:
`npx tsc -p tsconfig.app.json --noEmit 2>&1 | grep -c "error TS"`.

---

## Task A — dead code in pulse

Verified dead. Every one of these refers to a table that no longer exists or an
endpoint that returns 405.

**Backend**

- `functions/_lib/db/invitations.ts` — every function queries
  `workspace_invitations`, dropped. Delete the file and its re-export in
  `functions/_lib/db/index.ts`.
- `functions/_lib/types/workspaces.ts` — `WorkspaceInvitationRow` and
  `PublicInvitation` have no table behind them.
- `functions/_lib/email.ts` — `invitationEmail`, `twoFactorCodeEmail`,
  `passwordResetEmail`, `accountLockedEmail`. All four are auth emails that ondesk
  now sends. **Keep** `sendEmail`, `notificationEmail`, `escapeHtml`, `excerpt`
  and the base template: pulse still sends ticket notifications.
- `functions/_db/schema.sql` — grep for `invitation` and `two_factor`; leftover
  comments referencing tables that are gone.

**Frontend**

- `src/features/users/api/users-api.ts:22` — `INVITATIONS_BASE =
  "/api/invitations"`. This is the only live call to a deleted endpoint in the
  whole app. Inviting someone creates an OnDesk account, which a product cannot
  do; this has to become a link out to ondesk.
- `src/features/users/hooks/use-user-mutations.ts`, `use-user-queries.ts` — the
  hooks wrapping it.
- `src/context/auth-context.tsx` — `two_factor_enabled` on `AuthUser`.
  `/api/auth/me` no longer returns it.
- `src/features/profile/components/profile-view.tsx` — 2FA reference.

**Dependencies**

- `stripe` in `package.json` — **zero** imports remain in `src/` or `functions/`.
  Billing is entirely ondesk's. Remove it.
- `@tanstack/zod-form-adapter` — still imported by 6 files. It is dead upstream
  (TanStack Form v1 consumes Standard Schema directly) and is the cause of several
  of the 34 baseline errors. Removing it means reworking those forms the way
  ondesk's were: drop `validatorAdapter`, drop `.default()` from the zod schemas,
  pass the schema straight to `validators.onChange`. Optional, but it is how you
  get the baseline down.

**Not dead — do not remove**

- Stripe in `src/features/marketplace/modals/*` — the Stripe *API* as an example
  marketplace connector. Unrelated to billing.
- Stripe in `src/i18n/locales/*` — marketing copy.
- `createWorkspace`-looking names in `automations`, `business-hours`,
  `canned-replies` etc. — the generic `crud-api.ts` factory, false positives.

---

## Task B — pulse-db

The schema is already correct. What is left is one inconsistency in the data and
one thing that was never cleaned:

- **`plan = 'professional'`** exists in `workspace_entitlements` but is not in
  `SubscriptionPlan` (`starter | core | enterprise`) and has no row in ondesk's
  `app_prices`. Decide whether it maps to `core` or `enterprise` and normalise it
  in **both** databases — ondesk's `subscriptions` is the source of truth, so fix
  it there first or the next mirror sync will overwrite whatever you change here.
- **8 unused Stripe secrets on the pulse Pages project**: `STRIPE_SECRET_KEY`,
  `STRIPE_WEBHOOK_SECRET` and the 6 price IDs. Nothing reads them and
  `subscriptions` no longer exists. A live Stripe secret key reachable from a
  project that has no business touching billing is worth deleting.
- `functions/_db/migrations/003_ondesk_sso.sql` was applied in two halves on the
  live database, because the additive half had already run and SQLite has no
  `ADD COLUMN IF NOT EXISTS`. The file as committed is still correct for a
  database that has not been touched. Leave it alone.

---

## Task C — UI that still assumes the old model

This is the substantial piece. The API is done; the screens are not.

**`configurations/` sections** — `agents`, `users-companies`, `roles`, `general`

- `agents-section.tsx` + `modals/add-agent-modal.tsx` drive the invite flow
  against the dead `/api/invitations`. Members are managed on ondesk now
  (`/api/workspaces/:id/members`, `/api/invitations`). Turn these into a
  read-only member list plus a link out, the way `security-section.tsx` and
  `billing-section.tsx` were already reworked — follow those two as the pattern.
- `general-section.tsx` — check whether it still edits name/description/logo.
  Those are mirrored from ondesk and any local write is overwritten on the next
  sync. `PATCH /api/workspaces/:slug` now accepts **only** `workspace_prompt`.
- `roles-section.tsx` stays: `workspace_roles` is Pulse's own permission model,
  unrelated to tenancy.

**`profile/`**

- `profile-security-section.tsx` is already reworked to link out.
- `profile-view.tsx` still references 2FA; the account tab should point at
  ondesk for anything about the identity itself.

**Workspace shell**

- `workspace-selector-view.tsx` and `workspace-sidebar.tsx` already link out to
  ondesk for workspace creation. Verify the empty state reads sensibly for a user
  whose only workspaces have lapsed entitlements — they now see an empty list
  with no explanation of why.

**Overview / dashboard**

- `overview-view.tsx` reads tickets, contacts and companies only. Nothing to fix
  for correctness. If you want it to surface plan and seat usage, the data is in
  `workspace_entitlements` via `GET /api/billing?workspace_id=`, which also
  returns `manage_url` pointing at ondesk.

---

## Known gaps

- **`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are empty on ondesk.**
  `alexis.cuevases@gmail.com` is an OAuth-only Google account with no password —
  **that user cannot sign in at all** until these are set. This is the one active
  blocker.
- **ondesk has no workspace UI.** The API is complete (workspaces, members,
  invitations, checkout, portal) but the frontend only has `/`, `/dashboard` and
  `/auth/*`. `authorize.ts` redirects a user with no workspace to
  `/workspaces/new`, which does not exist — a new signup dead-ends there.
- **`ondesk.cc` as an email sending domain is unconfirmed.** The API token
  authenticates against the send endpoint (verified), but I could not confirm the
  domain is onboarded. If 2FA codes never arrive, that is why. Check the dashboard
  under Email → Email Sending.
- **`https://pulse.ondesk.cc/w/alex` returned a 403** from the edge — an HTML
  error page, not one of ours (ours are JSON). Never diagnosed. Suspect Cloudflare
  Access or a WAF rule on the hostname.
- **Nothing is committed.** All of this work is in the working tree of both repos.

---

## Invariants — breaking these breaks the platform

1. **IDs are global.** A `user_id` or `workspace_id` means the same thing in
   ondesk, pulse and vault. The mirror works without an ID-mapping table only
   because the migration preserved every primary key.
2. **Only `functions/_lib/db/mirror.ts` writes `users`, `workspaces` and
   `workspace_members`.** Any other write path diverges silently, and the
   divergence is invisible until a JOIN starts returning wrong rows.
3. **`workspace_entitlements` is the access gate.** `findWorkspacesByUserId`
   joins it and filters on `status IN ('active','trialing','past_due')`. A
   workspace missing from that table is invisible to the whole app.
4. **Pulse never authenticates anyone.** No passwords, no OAuth identities, no
   2FA. If a change needs any of those, it belongs in ondesk.
