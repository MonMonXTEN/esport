import db, { Round } from "@/lib/db";
import { querySchema } from "@/lib/zod";
import { NextResponse } from "next/server";

const roundOrder: Record<Round, number> = {
  R32: 0,
  R16: 1,
  QF: 2,
  SF: 3,
  THIRD_PLACE: 4,
  FINAL: 5,
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // parse query string
  const qs = Object.fromEntries(new URL(req.url).searchParams.entries())
  const parse = querySchema.safeParse(qs)
  if (!parse.success) return NextResponse.json({ message: "queryParams ไม่ถูกต้อง" }, { status: 400 })

  const { round, withSignatures } = parse.data
  const includeSign = withSignatures === "true"

  // check tournament
  const tournamentId = Number((await params).id)
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true },
  })
  if (!tournament) return NextResponse.json({ message: "ไม่พบการแข่งขัน" }, { status: 404 })

  const whereClause = round ? { tournamentId, round } : { tournamentId }
  const matches = await db.match.findMany({
    where: whereClause,
    orderBy: [
      { round: "asc" },
      { sequence: "asc" },
    ],
    include: {
      blueTeam: true,
      redTeam: true,
      winnerTeam: true,
      signatures: includeSign ? { include: { team: true } } : false,
    }
  })

  matches.sort((a, b) => roundOrder[a.round] - roundOrder[b.round] || a.sequence - b.sequence)

  return NextResponse.json(matches, { status: 200 })
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}