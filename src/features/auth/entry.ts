/**
 * The two places a visitor can enter from the marketing site.
 *
 * Both are server routes, not client routes: `/auth/signin` and `/auth/signup`
 * no longer exist in Pulse. Authentication happens on OnDesk, and
 * `/api/auth/sso/start` is what kicks off the OIDC round trip — it mints the
 * PKCE verifier and state before redirecting, which is why the browser has to
 * hit it rather than jumping straight to ondesk.cc.
 *
 * `/api` is in the i18n UNLOCALIZED_PREFIXES list, so passing these through
 * `useLocalizedHref()` or `path()` leaves them alone. Safe either way.
 */

/** Existing account. Lands on OnDesk's sign-in screen. */
export const SIGN_IN_HREF = "/api/auth/sso/start";

/**
 * New account. `prompt=create` is the OIDC "Initiating User Registration"
 * parameter — OnDesk's authorize endpoint reads it and opens the sign-up screen
 * instead of sign-in, so a "Start free trial" CTA doesn't dump people on a login
 * form they have no credentials for.
 */
export const SIGN_UP_HREF = "/api/auth/sso/start?prompt=create";
