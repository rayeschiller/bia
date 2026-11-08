/**
 * Server-only feature detection. Accounts & sync are optional: when any of
 * these env vars is missing the app stays local-only and hides sign-in.
 * Read at request time (never at build time), so builds need none of them.
 */

export function isAuthConfigured(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET && env.AUTH_SECRET);
}

/** Vercel's Upstash integration injects KV_REST_API_*; plain Upstash uses UPSTASH_REDIS_REST_*. */
export function redisCredentials(env: NodeJS.ProcessEnv = process.env): { url: string; token: string } | null {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

/** Sign-in is only offered when there is somewhere to sync to. */
export function isSyncEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return isAuthConfigured(env) && redisCredentials(env) !== null;
}
