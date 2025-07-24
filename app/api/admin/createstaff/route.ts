import db from "@/lib/db"
import bcrypt from "bcryptjs"
import { staffSchema } from "@/lib/zod"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = staffSchema.safeParse(body)

    if (!data.success) {
      return new Response(JSON.stringify({ error: data.error.message }), { status: 400 });
    }

    let { name } = data.data
    const { username, password, role } = data.data
    if (!name || name.trim() === "") {
      name = username;
    }

    const existed = await db.user.findUnique({ where: { username: username } })
    if (existed) {
      return Response.json({ error: "Username นี้ถูกใช้งานแล้ว" }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await db.user.create({
      data: {
        name: name,
        username: username,
        password: hashedPassword,
        role: role,
      },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        createdAt: true,
      }
    });

    return Response.json({
      message: "create user ok",
      data: newUser,
    }, { status: 201 })

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown error", error);
    }
  }
}