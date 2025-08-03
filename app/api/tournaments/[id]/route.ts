import db from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const tournament = await db.tournament.findUnique({
    where: { id: Number((await params).id) },
    select: { id: true, name: true, status: true }
  })
  if (!tournament) return NextResponse.json({ message: "ไม่พบทัวร์นาเมนต์" }, { status: 404 })
    
  return NextResponse.json(tournament)
}