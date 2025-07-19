import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function DELETE(req: Request) {
  const { ids } = await req.json()
  if(!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'No ids provided' }, { status: 400 });
  }

  await db.user.deleteMany({
    where: { id: { in: ids} }
  })

  return NextResponse.json({ success: true })
}
