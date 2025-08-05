import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { scoreSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

async function advanceBracket(
  matchId: number,
  winnerId: number,
  loserId: number
) {
  await db.$transaction(async (tx) => {
    const m = await tx.match.findUnique({
      where: { id: matchId },
      select: {
        round: true,
        sequence: true,
        parentMatchId: true,       // winner → next
        thirdPlaceMatchId: true,   // loser  → 3rd place (only SF)
      },
    })
    if (!m) return

    /* ① ผู้ชนะ → parentMatch (ทุกรอบ) */
    if (m.parentMatchId) {
      const isLeft = m.sequence % 2 === 0
      await tx.match.update({
        where: { id: m.parentMatchId },
        data: isLeft ? { blueTeamId: winnerId } : { redTeamId: winnerId },
      })
    }

    /* ② ผู้แพ้ SF → thirdPlaceMatch */
    if (m.round === "SF" && m.thirdPlaceMatchId) {
      const isLeft = m.sequence % 2 === 0
      await tx.match.update({
        where: { id: m.thirdPlaceMatchId },
        data: isLeft ? { blueTeamId: loserId } : { redTeamId: loserId },
      })
    }
  })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  // auth
  const session = await auth()
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

  // parse
  const parse = scoreSchema.safeParse(await req.json())
  if (!parse.success) return NextResponse.json({ message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 })
  const { blueScore, redScore, signatures } = parse.data

  // fetch match + teams
  const matchId = Number((await params).id)
  const match = await db.match.findUnique({
    where: { id: matchId },
    include: { blueTeam: true, redTeam: true, signatures: true }
  })
  if (!match) return NextResponse.json({ message: "ไม่พบแมตช์" }, { status: 404 })
  if (match.status !== "PENDING") return NextResponse.json({ message: "ไม่สามารถบันทึกซํ้าได้" }, { status: 400 })

  // validate score
  const maxGames = match.bestOf
  if (blueScore + redScore > maxGames) return NextResponse.json({ message: `กรุณากรอกคะแนนให้ถูกต้อง (BO${maxGames})` }, { status: 400 })
  if (Math.max(blueScore, redScore) <= Math.floor(maxGames / 1)) return NextResponse.json({ message: "คะแนนไม่ถูกต้อง" }, { status: 400 })

  const winnerTeamId = blueScore > redScore ? match.blueTeamId! : match.redTeamId!
  const loserTeamId = blueScore > redScore ? match.redTeamId! : match.blueTeamId!
  await db.$transaction(async tx => {
    await tx.match.update({
      where: { id: matchId },
      data: {
        blueScore,
        redScore,
        winnerTeamId,
        status: "DONE",
        refereeId: Number(session.user.id),
      }
    })

    // save signatures
    if (match.signatures.length) await tx.signature.deleteMany({ where: { matchId } })
    await tx.signature.createMany({
      data: signatures.map(s => ({
        matchId,
        teamId: s.teamId,
        imageUrl: s.imageUrl,
      })),
      skipDuplicates: true,
    })

    // advance bracket
    if (winnerTeamId) await advanceBracket(matchId, winnerTeamId, loserTeamId)
  })

  io?.emit("match:update", { matchId })
  return NextResponse.json({ message: "บันทึกคะแนนแล้ว" }, { status: 200 })
}

export function OPTIONS() {
  return NextResponse.json({}, { status: 204 });
}