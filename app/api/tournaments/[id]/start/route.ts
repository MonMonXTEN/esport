import db from "@/lib/db"
import { NextResponse } from "next/server"

export async function POST(_req: Request, { params } : { params: Promise<{ id: string }> }) {
  const tournamentId = Number((await params).id)

  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
  })
  if(!tournament) return NextResponse.json({ message: "ไม่พบการแข่งขัน" }, { status: 404 })
  if (tournament.status !== "DRAFT") return NextResponse.json({ message: "เกิดข้อผิดพลาด ในการเริ่มแข่งขัน" }, { status: 400 })

  await db.tournament.update({
    where: { id: tournamentId },
    data: { status: "LIVE" },
  })

  io?.emit("tournament:start")
  return NextResponse.json({ message: "เริ่มการแข่งขันแล้ว" }, { status: 200 })
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}