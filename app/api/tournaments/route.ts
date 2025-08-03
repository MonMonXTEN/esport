import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const list = await db.tournament.findMany({
    where: { active: true, status: { in: ["DRAFT", "LIVE"] } },
    select: { id: true, name: true }
  })
  if (list.length > 1) return NextResponse.json({ message: "ทัวร์นาเมนต์มีมากกว่า 1 รายการ" }, { status: 409 })
  if (list.length === 0) return NextResponse.json({ message: "ไม่พบทัวร์นาเมนต์ที่กำลังแข่งขัน" }, { status: 404 })

  return NextResponse.json(list[0], { status: 200 })
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}