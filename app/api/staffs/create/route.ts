import db from "@/lib/db"
import bcrypt from "bcryptjs"
import { staffSchema } from "@/lib/zod"
import z from "zod"

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
      }
    })

    return Response.json({
      message: `สร้างบัญชีผู้ใช้สำเร็จ (#ID ${newUser.id})`,
    }, { status: 201 })

  } catch (err) {
    // if (err instanceof z.ZodError) {
    //   return Response.json({ message: err.issues }, { status: 422 });
    // }

    console.error("[createStaff]", err);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}