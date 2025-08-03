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
}

const ROUND_ORDER: Round[] = [
  "R32", "R16", "QF", "SF", "THIRD_PLACE", "FINAL",
]
const ROUND_LABEL: Record<Round, string> = {
  R32: "รอบ 32 ทีม",
  R16: "รอบ 16 ทีม",
  QF: "รอบ 8 ทีม",
  SF: "รอบรองชนะเลิศ",
  THIRD_PLACE: "อันดับที่ 3",
  FINAL: "รอบชิงชนะเลิศ",
}

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
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(6,220px)" }}>
        {ROUND_ORDER.map(round => (
          <div key={round} className="space-y-4">
            <h3 className="text-center text-sm font-semibold">{ROUND_LABEL[round]}</h3>
            {matchesByRound[round].map(match => (
              <MatchCard
                key={match.id}
                match={match}
                // ถ้าตอนนี้ยังไม่ LIVE ให้ onClick เป็น noop + toast
                onClick={() => {
                  if (tournamentStatus !== "LIVE") {
                    toast.error("กรุณาเริ่มการแข่งขันก่อน");
                    return;
                  }
                  setOpenMatch(match);
                }}
              />
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
  const done = match.status === "DONE"
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition hover:ring-2 hover:ring-primary",
        done && "opacity-70"
      )}
    >
      <CardContent className="p-3 space-y-2">
        <div className={cn("text-xs rounded px-2 py-1", match.blueTeam ? "" : "italic text-muted-foreground")}>
          {match.blueTeam?.name ?? "TBD"}
        </div>
        <div className={cn("text-xs rounded px-2 py-1", match.redTeam ? "" : "italic text-muted-foreground")}>
          {match.redTeam?.name ?? "TBD"}
        </div>
        <div className="flex justify-end">
          <Badge variant={done ? "secondary" : "outline"}>
            {done ? "DONE" : "PENDING"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
