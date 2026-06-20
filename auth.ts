import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  providers: [
    Credentials({
      credentials: {
        password: { label: "סיסמה", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password as string | undefined
        if (!password) return null

        const validPassword = process.env.ADMIN_PASSWORD
        if (!validPassword) return null
        if (password !== validPassword) return null

        return {
          id: "admin",
          name: "Hadas",
          email: "hadas@avocado4ai.com",
        }
      },
    }),
  ],
})
