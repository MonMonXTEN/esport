import db from "@/lib/db"
import bcrypt from "bcryptjs"
import { staffSchema } from "@/lib/zod"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = staffSchema.parse(body)

    const existed = await db.user.findUnique({ where: { username: data.username } });
    if (existed) {
      return Response.json({ error: "Username นี้ถูกใช้งานแล้ว" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await db.user.create({
      data: {
        name: data.name,
        username: data.username,
        password: hashedPassword,
        role: data.role,
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
    }, { status: 201 });

  } catch (error: any) {
    if (error.name === "ZodError") {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    return Response.json({
      error: error?.message || error
    }, { status: 500 });
  }
}