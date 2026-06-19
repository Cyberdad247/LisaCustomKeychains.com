/** Cookie holding the per-request OAuth `state` nonce for CSRF protection. */
export const META_OAUTH_STATE_COOKIE = "lisa_meta_oauth_state";

/** How long the OAuth handshake (and its state nonce) stays valid. */
export const META_OAUTH_STATE_TTL_SECONDS = 60 * 10; // 10 minutes
