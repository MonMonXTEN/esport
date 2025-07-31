import { NextResponse } from "next/server";
import db from "@/lib/db";
import { teamSchema } from "@/lib/zod";

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = teamSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }
    const { name } = data.data
    if (!name?.trim()) return NextResponse.json({ error: "กรุณาใส่ชื่อทีม!" }, { status: 400 })
      
    const teams = await db.team.create({ data: { name }, select: { name: true } })

    io?.emit("teams:update")
    return NextResponse.json({ message: `เพิ่มทีม ${teams.name} สำเร็จ`, success: true}, { status: 201 })
  } catch (err) {
    console.error("[createTeam]", err)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}