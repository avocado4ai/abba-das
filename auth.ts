import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

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
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
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
      client: {
        token_endpoint_auth_method: "client_secret_post",
      },
    },
    Credentials({
      credentials: {
        username: { label: "שם משתמש", type: "text" },
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        const username = (credentials?.username as string | undefined)?.trim()
        const password = credentials?.password as string | undefined

        if (!username || !password) return null

        const validUsername = process.env.ADMIN_USERNAME
        const validHash = process.env.ADMIN_PASSWORD_HASH

        if (!validUsername || !validHash) return null
        if (username !== validUsername) return null

        const ok = await bcrypt.compare(password, validHash)
        if (!ok) return null

        return {
          id: username,
          name: "Hadas",
          email: "hadas@avocado4ai.com",
          groups: ["abba-das_admins"],
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, user }) {
      if (profile?.groups) {
        token.groups = profile.groups
      }
      // Credentials provider returns groups on the user object
      if ((user as any)?.groups) {
        token.groups = (user as any).groups
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.groups = token.groups as string[] | undefined
      }
      return session
    },
  },
})
