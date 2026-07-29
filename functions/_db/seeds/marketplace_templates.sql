-- ─────────────────────────────────────────────────────────────────────────────
-- Marketplace catalog templates (workspace_id = NULL, is_public = 1)
--
-- These are connector DEFINITIONS only — no credentials. Each workspace that
-- installs one supplies its own token, which is encrypted per install.
--
-- Idempotent: re-running replaces the templates in place.
--
--   npm run db:seed:marketplace:local
--   npm run db:seed:marketplace:remote
-- ─────────────────────────────────────────────────────────────────────────────

-- ═══ Stripe ══════════════════════════════════════════════════════════════════
-- Lets the agent verify payments, invoices and subscriptions when a customer
-- writes "I have a problem with my payment". Refunds are gated behind a human.

INSERT OR REPLACE INTO products
  (id, workspace_id, name, description, logo_url, category, docs_url, base_url,
   auth_type, auth_config, config_fields, default_headers, is_public, created_by)
VALUES (
  'tpl-stripe',
  NULL,
  'Stripe',
  'Look up customers, charges, invoices and subscriptions so the agent can verify payment problems before escalating.',
  NULL,
  'payments',
  'https://docs.stripe.com/api',
  'https://api.stripe.com',
  'bearer',
  '{"type":"bearer","token_field":"secret_key"}',
  '[{"key":"secret_key","label":"Secret key","type":"password","secret":true,"required":true,"placeholder":"sk_live_...","help":"Stripe dashboard > Developers > API keys. A restricted key with read access to customers, charges, invoices and subscriptions is enough unless you enable refunds."}]',
  '{}',
  1,
  NULL
);

INSERT OR REPLACE INTO product_actions
  (id, product_id, name, description, method, path, content_type, parameters, headers,
   response_path, requires_confirmation, is_read_only, enabled, sort_order)
VALUES
  ('tpl-stripe-find-customer', 'tpl-stripe', 'find_customer_by_email',
   'Find a Stripe customer by email address. Use this first to get the customer id needed by the other payment actions.',
   'GET', '/v1/customers', 'none',
   '[{"name":"email","in":"query","type":"string","required":true,"description":"Exact email address of the customer"},{"name":"limit","in":"query","type":"number","required":false,"default":5,"description":"How many customers to return (max 100)"}]',
   '{}', 'data', 0, 1, 1, 0),

  ('tpl-stripe-get-customer', 'tpl-stripe', 'get_customer',
   'Retrieve one Stripe customer by id, including default payment method and account balance.',
   'GET', '/v1/customers/{customer_id}', 'none',
   '[{"name":"customer_id","in":"path","type":"string","required":true,"description":"Stripe customer id, e.g. cus_123"}]',
   '{}', NULL, 0, 1, 1, 1),

  ('tpl-stripe-list-charges', 'tpl-stripe', 'list_charges',
   'List recent charges (payment attempts) for a customer, with status, amount and failure reason. Use this to verify whether a payment went through.',
   'GET', '/v1/charges', 'none',
   '[{"name":"customer","in":"query","type":"string","required":true,"description":"Stripe customer id"},{"name":"limit","in":"query","type":"number","required":false,"default":10,"description":"How many charges to return (max 100)"}]',
   '{}', 'data', 0, 1, 1, 2),

  ('tpl-stripe-get-payment-intent', 'tpl-stripe', 'get_payment_intent',
   'Retrieve one payment intent by id to see its exact status and the last payment error.',
   'GET', '/v1/payment_intents/{payment_intent_id}', 'none',
   '[{"name":"payment_intent_id","in":"path","type":"string","required":true,"description":"Payment intent id, e.g. pi_123"}]',
   '{}', NULL, 0, 1, 1, 3),

  ('tpl-stripe-list-invoices', 'tpl-stripe', 'list_invoices',
   'List invoices for a customer, including amount due, status and hosted invoice URL.',
   'GET', '/v1/invoices', 'none',
   '[{"name":"customer","in":"query","type":"string","required":true,"description":"Stripe customer id"},{"name":"status","in":"query","type":"string","required":false,"enum":["draft","open","paid","uncollectible","void"],"description":"Filter by invoice status"},{"name":"limit","in":"query","type":"number","required":false,"default":10,"description":"How many invoices to return (max 100)"}]',
   '{}', 'data', 0, 1, 1, 4),

  ('tpl-stripe-get-invoice', 'tpl-stripe', 'get_invoice',
   'Retrieve one invoice by id, including line items and payment status.',
   'GET', '/v1/invoices/{invoice_id}', 'none',
   '[{"name":"invoice_id","in":"path","type":"string","required":true,"description":"Invoice id, e.g. in_123"}]',
   '{}', NULL, 0, 1, 1, 5),

  ('tpl-stripe-list-subscriptions', 'tpl-stripe', 'list_subscriptions',
   'List a customer subscriptions with plan, status, current period and cancellation state.',
   'GET', '/v1/subscriptions', 'none',
   '[{"name":"customer","in":"query","type":"string","required":true,"description":"Stripe customer id"},{"name":"status","in":"query","type":"string","required":false,"enum":["active","past_due","unpaid","canceled","incomplete","trialing","all"],"description":"Filter by subscription status"},{"name":"limit","in":"query","type":"number","required":false,"default":10,"description":"How many subscriptions to return"}]',
   '{}', 'data', 0, 1, 1, 6),

  ('tpl-stripe-create-refund', 'tpl-stripe', 'create_refund',
   'Refund a charge or payment intent. This moves real money, so it always requires human approval.',
   'POST', '/v1/refunds', 'form',
   '[{"name":"payment_intent","in":"body","type":"string","required":false,"description":"Payment intent to refund, e.g. pi_123"},{"name":"charge","in":"body","type":"string","required":false,"description":"Charge to refund, e.g. ch_123. Use this or payment_intent"},{"name":"amount","in":"body","type":"number","required":false,"description":"Amount in the smallest currency unit. Omit for a full refund"},{"name":"reason","in":"body","type":"string","required":false,"enum":["duplicate","fraudulent","requested_by_customer"],"description":"Reason recorded on the refund"}]',
   '{}', NULL, 1, 0, 1, 7);

-- ═══ Calendly ════════════════════════════════════════════════════════════════
-- Lets the agent answer "when is my appointment?" and look up bookings.

INSERT OR REPLACE INTO products
  (id, workspace_id, name, description, logo_url, category, docs_url, base_url,
   auth_type, auth_config, config_fields, default_headers, is_public, created_by)
VALUES (
  'tpl-calendly',
  NULL,
  'Calendly',
  'Read event types, scheduled meetings and invitees so the agent can confirm, look up or cancel appointments.',
  NULL,
  'scheduling',
  'https://developer.calendly.com/api-docs',
  'https://api.calendly.com',
  'bearer',
  '{"type":"bearer","token_field":"personal_access_token"}',
  '[{"key":"personal_access_token","label":"Personal access token","type":"password","secret":true,"required":true,"placeholder":"eyJra...","help":"Calendly > Integrations > API and webhooks > Personal access tokens."},{"key":"user_uri","label":"User URI","type":"text","secret":false,"required":false,"placeholder":"https://api.calendly.com/users/AAAAAAAAAAAAAAAA","help":"Optional. Run get_current_user once to find it, then paste it here so the agent does not have to look it up every time."}]',
  '{}',
  1,
  NULL
);

INSERT OR REPLACE INTO product_actions
  (id, product_id, name, description, method, path, content_type, parameters, headers,
   response_path, requires_confirmation, is_read_only, enabled, sort_order)
VALUES
  ('tpl-calendly-current-user', 'tpl-calendly', 'get_current_user',
   'Get the Calendly account that owns the token, including its user URI and organization URI. Call this first when you need those values.',
   'GET', '/users/me', 'none', '[]', '{}', 'resource', 0, 1, 1, 0),

  ('tpl-calendly-list-event-types', 'tpl-calendly', 'list_event_types',
   'List the bookable event types (meeting templates) with their names, durations and scheduling links.',
   'GET', '/event_types', 'none',
   '[{"name":"user","in":"query","type":"string","required":true,"default":"{{user_uri}}","description":"User URI whose event types to list"},{"name":"active","in":"query","type":"boolean","required":false,"description":"Only active event types"},{"name":"count","in":"query","type":"number","required":false,"default":20,"description":"How many to return (max 100)"}]',
   '{}', 'collection', 0, 1, 1, 1),

  ('tpl-calendly-list-scheduled-events', 'tpl-calendly', 'list_scheduled_events',
   'List scheduled meetings with start and end times and status. Use this to tell a customer when their appointment is.',
   'GET', '/scheduled_events', 'none',
   '[{"name":"user","in":"query","type":"string","required":true,"default":"{{user_uri}}","description":"User URI whose meetings to list"},{"name":"invitee_email","in":"query","type":"string","required":false,"description":"Only meetings booked by this email address"},{"name":"status","in":"query","type":"string","required":false,"enum":["active","canceled"],"description":"Filter by meeting status"},{"name":"min_start_time","in":"query","type":"string","required":false,"description":"ISO 8601 timestamp lower bound, e.g. 2026-01-01T00:00:00Z"},{"name":"max_start_time","in":"query","type":"string","required":false,"description":"ISO 8601 timestamp upper bound"},{"name":"count","in":"query","type":"number","required":false,"default":20,"description":"How many to return (max 100)"}]',
   '{}', 'collection', 0, 1, 1, 2),

  ('tpl-calendly-get-scheduled-event', 'tpl-calendly', 'get_scheduled_event',
   'Retrieve one scheduled meeting by its UUID, including location and cancellation details.',
   'GET', '/scheduled_events/{event_uuid}', 'none',
   '[{"name":"event_uuid","in":"path","type":"string","required":true,"description":"UUID at the end of the event URI"}]',
   '{}', 'resource', 0, 1, 1, 3),

  ('tpl-calendly-list-invitees', 'tpl-calendly', 'list_event_invitees',
   'List the invitees of a scheduled meeting, including their email, timezone and answers to booking questions.',
   'GET', '/scheduled_events/{event_uuid}/invitees', 'none',
   '[{"name":"event_uuid","in":"path","type":"string","required":true,"description":"UUID of the scheduled meeting"},{"name":"email","in":"query","type":"string","required":false,"description":"Only the invitee with this email address"},{"name":"count","in":"query","type":"number","required":false,"default":20,"description":"How many invitees to return"}]',
   '{}', 'collection', 0, 1, 1, 4),

  ('tpl-calendly-cancel-event', 'tpl-calendly', 'cancel_scheduled_event',
   'Cancel a scheduled meeting with a reason. This affects the customer calendar, so it always requires human approval.',
   'POST', '/scheduled_events/{event_uuid}/cancellation', 'json',
   '[{"name":"event_uuid","in":"path","type":"string","required":true,"description":"UUID of the meeting to cancel"},{"name":"reason","in":"body","type":"string","required":true,"description":"Reason shown to the invitee"}]',
   '{}', 'resource', 1, 0, 1, 5);
