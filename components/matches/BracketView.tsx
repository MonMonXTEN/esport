"use client"

import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import useMatches from "@/hooks/useMatches"
import ScoreDialog from "./ScoreDialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export type TournamentStatus = "DRAFT" | "LIVE" | "FINISHED"
export type Round = "R32" | "R16" | "QF" | "SF" | "THIRD_PLACE" | "FINAL"

export interface MatchWithTeams {
  id: number
  sequence: number
  round: Round
  status: "PENDING" | "DONE"
  blueTeam?: { id: number; name: string } | null
  redTeam?: { id: number; name: string } | null
  blueScore?: number | null
  redScore?: number | null
}

const ROUND_ORDER: Round[] = [
  "R32", "R16", "QF", "SF", "FINAL", "THIRD_PLACE"
]
const ROUND_LABEL: Record<Round, string> = {
  R32: "รอบ 32 ทีม",
  R16: "รอบ 16 ทีม",
  QF: "รอบ 8 ทีม",
  SF: "รอบรองชนะเลิศ",
  FINAL: "รอบชิงชนะเลิศ",
  THIRD_PLACE: "อันดับที่ 3",
}

const COL: Record<Round, number> = {
  R32: 1,
  R16: 2,
  QF: 3,
  SF: 4,
  FINAL: 5,
  THIRD_PLACE: 5,
}
const columns = [...new Set(Object.values(COL))]


export default function BracketView({
  tournamentId,
  tournamentStatus,
}: {
  tournamentId: number
  tournamentStatus: TournamentStatus
}) {
  const { matches, isLoading } = useMatches(tournamentId)
  const [openMatch, setOpenMatch] = useState<MatchWithTeams | null>(null)

  const matchesByRound = useMemo(() => {
    const map: Record<Round, MatchWithTeams[]> = {
      R32: [], R16: [], QF: [], SF: [], THIRD_PLACE: [], FINAL: [],
    }
    for (const m of matches ?? []) map[m.round].push(m)
    ROUND_ORDER.forEach(r => map[r].sort((a, b) => a.sequence - b.sequence))
    return map
  }, [matches])

  if (isLoading)
    return <p className="p-6 text-center">Loading…</p>

  return (
    <>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(5, 220px)" }}
      >
        {columns.map((col) => (
          <div key={col} className="space-y-8">
            {ROUND_ORDER.filter((r) => COL[r] === col).map((round) => (
              <div
                key={round}
                className={round === "THIRD_PLACE" ? "mt-24" : ""}   // ⬅️ เลื่อนลง
              >
                <h3 className="mb-1 text-center text-sm font-semibold">
                  {ROUND_LABEL[round]}
                </h3>

                {matchesByRound[round].map((m) => (
                  <MatchCard key={m.id} match={m} onClick={() => ({})} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {openMatch && (
        <Dialog open onOpenChange={() => setOpenMatch(null)}>
          <DialogContent className="max-w-xl">
            <ScoreDialog match={openMatch} />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function MatchCard({
  match,
  onClick,
}: {
  match: MatchWithTeams
  onClick: () => void
}) {
  const { blueTeam, redTeam, blueScore, redScore, status } = match
  const done = status === "DONE"
  const blueWin = done && (blueScore ?? 0) > (redScore ?? 0)
  const redWin = done && (redScore ?? 0) > (blueScore ?? 0)

  const row = (
    name: string | undefined,
    score: number | null | undefined,
    isWinner: boolean,
  ) => (
    <div
      className={cn(
        "flex justify-between text-xs rounded px-2 py-1",
        name ? "" : "italic text-muted-foreground",
        isWinner && "font-bold",
      )}
    >
      <span>{name ?? "TBD"}</span>
      <span>{score ?? "-"}</span>
    </div>
  )

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition hover:ring-2 hover:ring-primary",
        done && "opacity-80",
      )}
    >
      <CardContent className="p-3 space-y-2">
        {row(blueTeam?.name, blueScore, blueWin)}
        {row(redTeam?.name, redScore, redWin)}
        <div className="flex justify-end">
          <Badge variant={done ? "secondary" : "outline"}>
            {done ? "DONE" : "PENDING"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
