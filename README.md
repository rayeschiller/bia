# Bia (بیا)

Mobile-first web app for learning conversational Farsi (Next.js App Router, TypeScript, Tailwind v4).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
npm test        # Vitest unit tests (answer checking, lesson flow, review)
```

- Shared content/progress contract: `src/lib/types.ts` (do not edit without agreement)
- Design tokens and components: see [DESIGN.md](./DESIGN.md)
- Mock data for screen shells: `src/lib/mock.ts` (search for `TODO(wiring)`)

Note: `next/font/google` downloads Vazirmatn and Nunito at build time, so the build needs access to fonts.googleapis.com.

## Accounts & sync setup

Signing in is optional. Without the env vars below the app is local-only (progress in `localStorage`), the sign-in UI is hidden, and `npm run build` needs none of them. With them, learners can **Continue with Google** (Settings → Account, or the nudge after a lesson) and their progress syncs across devices.

How it works: Auth.js v5 (`next-auth@beta`) with Google, JWT session in an httpOnly cookie, no database adapter. Progress is stored in Upstash Redis under `bia:progress:<googleSub>` (Progress JSON + `updatedAt`) via `GET/PUT /api/progress`. On load the client merges local and cloud progress (`src/lib/progress/merge.ts`), then pushes changes (debounced, flushed when the app is hidden). Signing out keeps progress on the device.

What the owner must configure:

1. **Google Cloud OAuth client** (Google Cloud Console → APIs & Services → Credentials → Create credentials → OAuth client ID; set up the OAuth consent screen first if asked):
   - Application type: **Web application**
   - Authorized JavaScript origin: `https://bia-beige.vercel.app`
   - Authorized redirect URI: `https://bia-beige.vercel.app/api/auth/callback/google`
   - (For local testing also add `http://localhost:3000` and `http://localhost:3000/api/auth/callback/google`.)
2. **Upstash Redis** via Vercel: project → Storage (or Marketplace) → Upstash for Redis → create and **connect it to the Bia project**. This injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` also work).
3. **Env vars** in Vercel → Project → Settings → Environment Variables (Production, and Preview if wanted):

   | Name | Value |
   | --- | --- |
   | `AUTH_GOOGLE_ID` | OAuth client ID from step 1 |
   | `AUTH_GOOGLE_SECRET` | OAuth client secret from step 1 |
   | `AUTH_SECRET` | random secret: `npx auth secret` or https://generate-secret.vercel.app/32 |

   `AUTH_URL` is not needed on Vercel (the host is trusted automatically). Set `AUTH_URL=https://bia-beige.vercel.app` only if you serve the app behind another proxy/domain.
4. Redeploy. Settings should now show "Save your progress" with a Continue with Google button.

For local development put the same variables in `.env.local` (git-ignored). In `npm run dev` without them, Settings shows an "Account · Coming soon" placeholder.
