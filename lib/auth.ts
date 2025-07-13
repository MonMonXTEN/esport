import NextAuth from "next-auth"
import { z } from "zod"
import Credentials from "next-auth/providers/credentials"
import { signInSchema } from "./zod"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@/lib/generated/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"

const prisma = new PrismaClient()

export const { auth, handlers } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {}
      },
      authorize: async (credentials) => {
        try {
          if (!credentials) return null

          const { username, password } = await signInSchema.parseAsync(credentials)

          const user = await prisma.user.findUnique({
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
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.name = user.name
        token.role = user.role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    }
  }
})