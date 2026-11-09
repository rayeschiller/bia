/**
 * Auth.js v5: Google sign-in, JWT sessions in an httpOnly cookie, no database.
 * Env (read by Auth.js at request time): AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET,
 * AUTH_SECRET; optional AUTH_URL. trustHost is on: Vercel sets the Host header.
 */
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token, account }) {
      // Without an adapter Auth.js gives the user a random id; key data by Google's
      // stable account id ("sub") instead so it's the same on every device.
      if (account?.provider === "google" && account.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});

/** Google `sub` of the signed-in user, or null. Never throws. */
export async function currentUserId(): Promise<string | null> {
  try {
    const session = await auth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
