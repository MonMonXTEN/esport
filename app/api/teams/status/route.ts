import db from "@/lib/db";
import z from "zod";
import { teamSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

// export const runtime = "nodejs"

const updateTeamStatusSchema = teamSchema.omit({
  name: true,
}).extend({
  id: z.number()
})

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const data = updateTeamStatusSchema.safeParse(body)
    if (!data.success) return NextResponse.json({ error: data.error.message }, { status: 400 })

    const { id, status } = data.data
    await db.team.update({
      where: { id },
      data: {
        status
      }
    })
    io?.emit("teams:update")
    return Response.json({ success: true }, { status: 200 })
  } catch (err) {
    console.error("[updateStatusTeam]", err)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }
}