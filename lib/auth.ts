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
              id: user.id,
              username: user.username,
              name: user.name,
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
  },
  callbacks: {
    jwt({ token, user }) {
      const clonedToken = token
      if (user) {
        clonedToken.id = user.id
        clonedToken.username = user.username
        clonedToken.name = user?.name
        clonedToken.role = user.role
      }
       return clonedToken
    },
    session({ session, token }) {
      const clonedSession = session
      if (clonedSession.user) {
        clonedSession.user.id = token.id as string
        clonedSession.user.username = token.username
        clonedSession.user.name = token.name
        clonedSession.user.role = token.role
      }
      return clonedSession
    }
  }
  // callbacks: {
  //   jwt: async ({ token, user }) => {
  //     if (user) {
  //       token.id = user.id
  //       token.username = user.username
  //       token.name = user.name
  //       token.role = user.role
  //     }
  //     return token
  //   },
  //   session: async ({ session, token }) => {
  //     if (session.user) {
  //       session.user.id = token.id as string
  //       session.user.username = token.username as string
  //       session.user.name = token.name as string
  //       session.user.role = token.role as string
  //     }
  //     return session
  //   }
  // }
})