import db from "@/lib/db"
import z from "zod"
import { staffSchema } from "@/lib/zod"

const updateStaffSchema = staffSchema.omit({
  username: true,
  password: true,
}).extend({
  id: z.number(),
})

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const { id, name, role } = updateStaffSchema.parse(body)

    await db.user.update({
      where: { id },
      data: {
        name: name?.trim() === "" ? null : name ?? null,
        role,
      }
    })
    return Response.json({
      message: "อัปเดตข้อมูลสำเร็จ"
    }, { status: 200 })
  } catch (err) {
    // if (err instanceof z.ZodError) {
    //   return Response.json({ message: err.issues }, { status: 422 })
    // }

    console.error("[updateStaff]", err)
    return Response.json({ message: "Internal Server Error" }, { status: 500 })
  }
}