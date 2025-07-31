import db from "@/lib/db"
import { teamSchema } from "@/lib/zod"
import { NextResponse } from "next/server"
import z from "zod"

const updateTeamSchema = teamSchema.extend({
  id: z.number(),
}).omit({
  status: true,
})

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const data = updateTeamSchema.safeParse(body)
    if (!data.success) {
      return NextResponse.json({ error: data.error.message }, { status: 400 })
    }
    const { id, name } = data.data
    if (!name?.trim()) return NextResponse.json({ error: "กรุณาใส่ชื่อทีม!" }, { status: 400 })

    await db.team.update({
      where: { id },
      data: {
        name,
      }
    })
    io?.emit("teams:update")
    return NextResponse.json({
      message: "อัปเดตข้อมูลสำเร็จ",
      success: true
    }, { status: 200 })
  } catch (err) {
    console.error("[updateTeam]", err)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}