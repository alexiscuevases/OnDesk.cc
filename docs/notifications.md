# Notifications

Pulse's is the oldest of four. Vault, Orbit and Nexus now have the same system
against their own data, and the cross-product rules — how each resolves its
audience, and why three of the four put less in the email than they could — are in
`ondesk/docs/platform-architecture.md` § "The three shell systems". Two things about
this document are worth knowing before reading it as a template:

- The **defect** at the bottom of this file (`ticket_status` off by default is fine;
  `workspace_members.permissions NOT NULL DEFAULT '[]'` is the live one, recorded in
  the architecture doc) has not been fixed.
- The `preview` block in `functions/_lib/email.ts` quotes the message that triggered
  the email. That is right here and wrong in Vault and Nexus — see the architecture
  doc. Do not copy it into a product where the content is a credential or a private
  conversation.

Every notification in Pulse goes through one dispatcher: `functions/_lib/notify.ts`.
It writes the in-app notification row **and** sends the matching email, so a new
event only has to be added in one place.

```
event site  ──▶  buildTicketAudience()  ──▶  notify()  ──┬─▶ createNotification()  (in-app bell)
                 (who cares about this)                  └─▶ sendEmail()           (Cloudflare Email Sending)
```

## Audience resolution

`buildTicketAudience(db, ticket, opts)` answers "who should hear about this
ticket?" and tags each recipient with the preference key that justifies the
delivery:

| Ticket state | Recipients | Preference key used |
| --- | --- | --- |
| Has an assignee | the assignee | `opts.selfPref` |
| Has a team | team members + team leader | `opts.teamPref` |
| Both | assignee under `selfPref`, rest of the team under `teamPref` | — |
| Neither | every workspace member (the shared inbox) | `opts.teamPref` |

The assignee's entry always wins over their team entry, so nobody is emailed
twice for the same event. Pass `workspaceFallback: false` to suppress the
shared-inbox fan-out — used for agent-initiated changes, where an unassigned,
teamless ticket is nobody's news yet.

Use `exclude: [actorId]` so the person who caused the event never emails
themselves.

## Events wired up

| Event | Source | Preference key |
| --- | --- | --- |
| Ticket created and assigned to you | `api/tickets/index.ts` | `ticket_assigned_to_me` |
| Ticket created for your team | `api/tickets/index.ts` | `ticket_assigned_to_team` |
| Inbound email opens a ticket | `api/webhooks/{gmail,microsoft-graph}.ts` | `ticket_assigned_to_team` |
| Ticket reassigned to you | `api/tickets/[id].ts` | `ticket_assigned_to_me` |
| Ticket reassigned to your team | `api/tickets/[id].ts` | `ticket_assigned_to_team` |
| Automation routes a ticket to you | `_lib/automations-runner.ts` | `ticket_assigned_to_me` |
| Automation routes a ticket to your team | `_lib/automations-runner.ts` | `ticket_assigned_to_team` |
| Customer replies | `api/webhooks/{gmail,microsoft-graph}.ts` | `reply_on_my_ticket` / `reply_on_team_ticket` |
| Teammate replies | `api/tickets/[id]/messages.ts` | `reply_on_my_ticket` / `reply_on_team_ticket` |
| You were @mentioned | `api/tickets/[id]/messages.ts` | `mention` |
| AI agent escalates to a human | `_lib/ai-agent-pipeline.ts` | `escalation` |
| Automation escalates to a human | `_lib/automations-runner.ts` | `escalation` |
| SLA target missed | `api/cron/sla.ts` | `sla_breach` |
| Ticket resolved / closed | `api/tickets/[id].ts` | `ticket_status` |
| Priority changed | `api/tickets/[id].ts` | `ticket_status` |

A mentioned user is dropped from the reply audience for that same message — the
mention email is the more specific one, so they get exactly one email.

`notify()` resolves every recipient id against `workspace_members` before it
writes anything, so ids that aren't members of the workspace are silently
dropped. That matters for mentions: `data-mention-id` comes from client-supplied
TipTap HTML, and a forged id must not be able to email an arbitrary user.

## Preferences

One row per (user, workspace) in `notification_preferences`. **A missing row
means all defaults**, so email works before a user ever opens the settings
screen — `findRecipientProfiles()` applies `DEFAULT_NOTIFICATION_PREFERENCES` to
the `NULL`s a `LEFT JOIN` produces.

Defaults are on for everything except `ticket_status`, which is chatty.
`email_enabled` is the master switch: off silences every email, in-app
notifications keep working.

- API: `GET`/`PATCH /api/notifications/preferences?workspace_id=`
- UI: Profile → Notifications (`src/features/profile/components/profile-notifications-section.tsx`)

To add a new toggle: add the column in a migration **and** `schema.sql`, add the
key to `NotificationPrefKey` / `NOTIFICATION_PREF_KEYS` /
`DEFAULT_NOTIFICATION_PREFERENCES` in `functions/_lib/types/notifications.ts`,
mirror it in `src/features/notifications/api/notifications-api.ts`, and add a row
to `emailPrefs` in the profile section. `PREF_COLUMNS` in
`functions/_lib/db/notifications.ts` derives the SQL from the key list, so no
query needs editing.

## Delivery

Email goes out through `sendEmail()` (Cloudflare Email Sending REST API — see the
setup notes in `wrangler.toml`). When `CF_ACCOUNT_ID` / `EMAIL_API_TOKEN` /
`EMAIL_FROM` are unset, `notify()` logs a warning and delivers in-app only, so
local development never fails on a missing mailer.

`notify()` never throws: a notification failure must not fail the request that
triggered it. Individual sends are `Promise.allSettled`, so one bad address does
not block the rest.

Request handlers pass `notify()` to `ctx.waitUntil` (threaded through
`withAuth`/`withWorkspace`) so the fan-out happens after the response is sent.
Webhook and cron paths already run inside `waitUntil`, so they `await` directly.

Links are built from `APP_URL` + the workspace slug:
`{APP_URL}/w/{slug}/tickets/{id}`. All contact- and user-supplied strings are
escaped by `notificationEmail()` — inbound email subjects and sender names reach
these templates directly.

## Migration

```
npm run db:migrate:notifprefs:local
npm run db:migrate:notifprefs:remote
```
