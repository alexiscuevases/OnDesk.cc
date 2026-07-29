# Marketplace / connectors

The marketplace lets an authorized workspace admin point Pulse at **any REST API**
— Calendly, Stripe, an internal enterprise service — describe it endpoint by
endpoint, and hand a controlled subset of those endpoints to an AI agent as tools.

## Model

```
products                 connector definition: base URL + auth + config fields
  └── product_actions    one row per registered endpoint = one AI tool
workspace_products       an install: this workspace's credentials (encrypted)
  └── agent_tools        which agent may use which install (and which actions)
tool_call_logs           audit trail of every outbound call
```

- `products.workspace_id IS NULL AND is_public = 1` → catalog template shipped by
  Pulse (Stripe, Calendly). Read-only; workspaces install them as-is.
- `products.workspace_id = <ws>` → private connector built by that workspace.
  Fully editable by its owners/admins, invisible to everyone else.
- Credentials **never** live on the product. They live on the install, in
  `workspace_products.credentials`, AES-256-GCM encrypted (see below).

## Auth strategies

`products.auth_config` is a discriminated union; `token_field` and friends name a
key from `config_fields`, so the connector says *where* the secret goes and the
install supplies *what* it is.

| type | effect |
| --- | --- |
| `none` | no auth |
| `bearer` | `Authorization: Bearer <field>` |
| `api_key_header` | `<header>: <prefix> <field>` |
| `api_key_query` | `?<param>=<field>` |
| `basic` | `Authorization: Basic base64(user:pass)` |
| `custom` | arbitrary headers, values templated with `{{field}}` |

`config_fields` entries with `secret: true` are encrypted; the rest are stored in
`workspace_products.settings` and can be interpolated as `{{key}}` into the base
URL, headers, and action parameter **defaults**. That covers multi-tenant
internal APIs (`https://{{tenant}}.erp.example.com`).

## Registering an endpoint

One `product_actions` row = one tool. `path` may contain `{placeholders}`, each of
which must have a matching parameter with `in: "path"`. Parameters declare where
they travel: `path`, `query`, `body`, or `header`. `content_type` picks the body
encoding — `json`, `form` (bracket notation, Stripe-compatible), or `none`.

`response_path` projects a slice of the response (`data`, `collection`) so the
model only sees what matters; anything over ~6 KB is truncated with a marker.

Endpoints can be typed in by hand or imported:

- **cURL** — paste a working request; method, path, query and JSON/form body
  fields are inferred. Credential-looking headers are dropped with a warning.
- **OpenAPI 3 (JSON)** — resolves local `$ref`s and one level of `allOf`, then
  lets you pick which operations to import.

Both go through the same validation as hand-written actions.

## Safety model

- **Write gating** — non-GET actions default to `requires_confirmation = 1`. An
  agent that asks for one is refused and told to escalate; only a human running it
  from the console (`confirm: true`) can fire it. That is the line between "check
  my payment" and "issue a refund".
- **SSRF guard** — outbound calls must be `https://` to a public host. Loopback,
  RFC1918, CGNAT, link-local (incl. `169.254.169.254`) and `.internal`/`.local`
  hosts are refused. Internal APIs must be published (API gateway, Cloudflare
  Tunnel).
- **No prompt-injection exfiltration** — `{{...}}` interpolation is applied to
  connector-authored strings only (base URL, headers, parameter defaults), never
  to values the model supplies.
- **Placeholder rejection** — `{id}`, `<id>`, `null`, `TODO` and friends coming
  from the model are treated as missing, so the agent has to fetch a real value.
- **Per-agent scoping** — `agent_tools.allowed_actions` limits an agent to a
  subset of a connector's actions (e.g. read-only Stripe).
- **Kill switch** — disabling an install (`status = 'disabled'`) or an action
  (`enabled = 0`) removes it from every agent's prompt on the next turn.
- **Timeouts/limits** — 15 s per call, 256 KB read from upstream.
- Every call is written to `tool_call_logs` with the URL (secrets masked), params,
  status, duration and error — surfaced in Marketplace → Activity.

## Encryption at rest

`encryptSecret`/`decryptSecret` in `functions/_lib/crypto.ts` use AES-256-GCM with
a key derived (SHA-256, domain-separated) from `env.CREDENTIALS_SECRET`, falling
back to `env.JWT_SECRET`. Ciphertext format: `aesgcm.v1.<iv_b64>.<ct_b64>`.

Set a dedicated secret in production:

```sh
npx wrangler pages secret put CREDENTIALS_SECRET
```

> Rotating that value makes existing stored credentials undecryptable — admins
> would have to re-enter them.

## API

| method | route | purpose |
| --- | --- | --- |
| GET/POST | `/api/marketplace/products?workspace_id=` | list / create connectors |
| GET/PATCH/DELETE | `/api/marketplace/products/:id` | read / edit / delete a connector |
| GET/POST | `/api/marketplace/products/:id/actions` | list / register endpoints |
| PATCH/DELETE | `/api/marketplace/products/:id/actions/:actionId` | edit / remove an endpoint |
| POST | `/api/marketplace/products/:id/import` | cURL / OpenAPI import (`preview: true` to dry-run) |
| POST | `/api/marketplace/run?workspace_id=` | run one action as the current user |
| GET | `/api/marketplace/logs?workspace_id=` | audit trail |
| GET/POST/PATCH/DELETE | `/api/workspaces/:slug/products` | installs: list / install / configure / uninstall |
| GET/POST/PATCH/DELETE | `/api/ai-agents/:id/tools` | assign / scope / remove agent tools |

Mutations require the `owner` or `admin` workspace role.

## Migration

The marketplace tables were rebuilt; the migration drops and recreates them
(safe — there was no product-creation API before, so they held no user data).

```sh
npm run db:migrate:marketplace:local     # then :remote
npm run db:seed:marketplace:local        # Stripe + Calendly templates
```

Fresh databases get everything from `functions/_db/schema.sql`; the seeds are
still needed for the catalog templates.

## Adding a catalog template

Append to `functions/_db/seeds/marketplace_templates.sql` with
`workspace_id = NULL`, `is_public = 1`, `created_by = NULL` and a stable
`tpl-<name>` id, then re-run the seed (it uses `INSERT OR REPLACE`).
