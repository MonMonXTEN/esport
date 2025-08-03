import db from "@/lib/db";
import { seedR32Matches } from "@/lib/services/bracket";
import { NextResponse } from "next/server";

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Check Tournament
  const tournamentId = Number((await params).id)
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true },
  })
  if (!tournament) return NextResponse.json({ message: "ไม่พบการแข่งขัน" }, { status: 404 })
  if (tournament.status !== "DRAFT") return NextResponse.json({ message: "ไม่สามารถสุ่มได้ หากเริ่มการแข่งขันแล้ว" }, { status: 400 })

  const teamIds = await db.tournamentTeam.findMany({
    where: { tournamentId },
    select: { teamId: true },
  }).then((arr) => arr.map((t) => t.teamId))
  if (teamIds.length < 2) return NextResponse.json({ message: "การแข่งขันไม่สามารถดำเนินต่อได้ เนื่องจากมีจำนวนทีมน้อยเกินไป" }, { status: 400 })
  if (teamIds.length > 32) return NextResponse.json({ message: "การแข่งขันไม่รองรับมากกว่า 32 ทีม" }, { status: 400 })

  const r32Matches = await db.match.findMany({
    where: { tournamentId, round: "R32" },
    orderBy: { sequence: "asc" },
    select: { id: true, sequence: true },
  })

  // shuffle teams
  if (r32Matches.length) {
    const shuffled: (number | null)[] = shuffle(teamIds)
    if (shuffled.length % 2 === 1) shuffled.push(null)
    while (shuffled.length < 32) shuffled.push(null)

    await db.$transaction(r32Matches.map((m, idx) => db.match.update({
      where: { id: m.id },
      data: {
        blueTeamId: shuffled[idx * 2] ?? null,
        redTeamId: shuffled[idx * 2 + 1] ?? null,
      },
    })))
    io?.emit("match:update")
    return NextResponse.json({ message: "สุ่มสลับทีมเรียบร้อย" }, { status: 200 })
  }

  await seedR32Matches(tournamentId, teamIds)
  return NextResponse.json({ message: "สร้างรอบ 32 และสุ่มเรียบร้อย" }, { status: 200 })
}

export function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 204 });
}