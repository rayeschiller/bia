/** Shape of GET /api/me. */
export interface MeResponse {
  /** False when the AUTH_* or Redis env vars are missing: the app is local-only. */
  enabled: boolean;
  user: AccountUser | null;
}

export interface AccountUser {
  name: string | null;
  email: string | null;
  image: string | null;
}
