import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "staff" | "admin"
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    username: string
    role: "staff" | "admin"
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string | number
    username: string
    role: "staff" | "admin"
  }
}