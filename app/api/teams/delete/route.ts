import db from "@/lib/db"

export async function DELETE(req: Request) {
  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: 'ไม่พบหมายเลขทีม' }, { status: 400 })
  }
  try {
    await db.team.deleteMany({
      where: { id: { in: ids } }
    })
    io?.emit("teams:update")
    return Response.json({ message: "ลบทีมเรียบร้อยแล้ว" }, { status: 200 })
  } catch (err) {
    console.error("[deleteTeams]", err)
    return Response.json({ error: "Internal Server Error" }, { status: 500 })
  }

}