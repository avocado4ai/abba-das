import NextAuth, { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      groups?: string[];
    } & DefaultSession["user"]
  }
  interface Profile {
    groups?: string[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    {
      id: "authelia",
      name: "Authelia",
      type: "oidc",
      issuer: process.env.AUTH_AUTHELIA_ISSUER,
      clientId: process.env.AUTH_AUTHELIA_ID,
      clientSecret: process.env.AUTH_AUTHELIA_SECRET,
      authorization: {
        params: { scope: "openid profile email groups" },
      },
    },
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile && profile.groups) {
        token.groups = profile.groups;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.groups = token.groups as string[] | undefined;
      }
      return session;
    },
  },
})