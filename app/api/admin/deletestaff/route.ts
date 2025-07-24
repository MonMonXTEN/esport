import db from "@/lib/db"

export async function DELETE(req: Request) {
  const { ids } = await req.json()
  if(!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ message: 'ไม่พบหมายเลขผู้ใช้' }, { status: 400 });
  }

  await db.user.deleteMany({
    where: { id: { in: ids} }
  })

  return Response.json({ message: "ลบบัญชีผู้ใช้สำเร็จ" }, { status: 200 })
}
