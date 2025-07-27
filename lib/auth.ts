import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "@/lib/zod"
import bcrypt from "bcryptjs"
import db from "@/lib/db"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { z } from "zod"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {}
      },
      authorize: async (credentials) => {
        try {
          if (!credentials.username || !credentials.password) throw new Error("Username and password are required")

          const { username, password } = await signInSchema.parseAsync(credentials)

          const user = await db.user.findUnique({
            where: { username: username }
          })

          if (user && (await bcrypt.compare(password, user.password))) {
            return {
              id: user.id.toString(),
              username: user.username,
              role: user.role,
            }
          } else {
            if (process.env.NODE_ENV === "development") {
              console.log(`Invalid email or password | ${credentials.username}}`)
              return null
            }
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            return null
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 *60,
    updateAge: 20 * 60,
  },
  jwt: {
    maxAge: 4 * 60 * 60,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        // token.name = user?.name
        token.role = user.role
      }
       return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username
        // session.user.name = token.name
        session.user.role = token.role
      }
      return session
    }
  }
})