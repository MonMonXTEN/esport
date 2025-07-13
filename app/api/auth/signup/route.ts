import { PrismaClient } from "@/lib/generated/prisma"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, username, password } = await request.json()
    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        password: hashedPassword
      }
    })
    return Response.json({
      message: "create user ok",
      data: {
        newUser
      }
    })
  } catch (error) {
    return Response.json({
      error
    }, { status: 500 })
  }
}