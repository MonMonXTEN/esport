"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import SignaturePadDialog from "./SignaturePadDialog"
import { toast } from "sonner"
import { TriangleAlert } from "lucide-react"
import ScoreSection from "./ScoreSection"
import { MatchWithTeams } from "./TournamentBracket"

export default function ScoreDialog({
  open,
  match,
  onOpenChange
}: {
  open: boolean
  match: MatchWithTeams
  onOpenChange: () => void
}) {
  const [blueSign, setBlueSign] = useState<string | undefined>()
  const [redSign, setRedSign] = useState<string | undefined>()
  const [whichPad, setWhichPad] = useState<"blue" | "red" | null>(null)
  const [blueScore, setBlueScore] = useState<number>(0)
  const [redScore, setRedScore] = useState<number>(0)

  const [loading, setLoading] = useState(false)

  const isScoreValid = () => {
    if (match.bestOf === 1) return blueScore !== redScore && (blueScore === 1 || redScore === 1)
    if (match.bestOf === 3) return (blueScore === 2 || redScore === 2) && (blueScore + redScore <= 3)
    if (match.bestOf === 5) return (blueScore === 3 || redScore === 3) && (blueScore + redScore <= 5)
    return false
  }

  const onSubmit = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tournaments/matches/${match.id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueScore,
          redScore,
          signatures: [
            { teamId: match.blueTeam?.id, imageUrl: blueSign },
            { teamId: match.redTeam?.id, imageUrl: redSign },
          ],
        }),
      })
      if (!res.ok) throw new Error((await res.json()).message)
      toast.success("บันทึกคะแนนสำเร็จ")
      onOpenChange()
    } catch (err: unknown) {
      toast.error((err as Error).message || "บันทึกไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl overflow-y-auto max-h-[calc(100vh-150px)]">
        <DialogHeader className="space-y-1">
          <DialogTitle className="font-medium text-lg text-center">
            ลงคะแนน
          </DialogTitle>
          <DialogDescription className="flex flex-col justify-center items-center gap-2 text-md font-bold text-black text-xl">
            <div>{match.blueTeam?.name} <span className="text-gray-600 text-sm">VS</span> {match.redTeam?.name}</div>
            <Badge variant="default" className="bg-blue-600 rounded-full">BO{match.bestOf}</Badge>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={e => {
          e.preventDefault()
          if (!isScoreValid()) return toast.error("คะแนนไม่ถูกต้อง")
          onSubmit()
        }}
          className="space-y-6">

          {/* Score Blue Team */}
          <ScoreSection
            teamName={match.blueTeam?.name}
            teams="blue"
            signImage={blueSign}
            onClickSign={() => setWhichPad("blue")}
            bestOf={match.bestOf}
            score={blueScore}
            otherScore={redScore}
            setScore={match.bestOf === 1
              ? () => { setBlueScore(1); setRedScore(0); }
              : setBlueScore
            }
          />

          {/* Score Red Team */}
          <ScoreSection
            teamName={match.redTeam?.name}
            teams="red"
            signImage={redSign}
            onClickSign={() => setWhichPad("red")}
            bestOf={match.bestOf}
            score={redScore}
            otherScore={blueScore}
            setScore={match.bestOf === 1
              ? () => { setBlueScore(0); setRedScore(1); }
              : setRedScore
            }
          />

          {match.status === "DONE" && (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertTitle>คำเตือน</AlertTitle>
              <AlertDescription>
                การแข่งขันนี้มีการบันทึกคะแนนแล้ว และจะไม่สามารถบันทึกคะแนนได้อีก
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading || match.status !== "PENDING"} className={`w-full cursor-pointer`}>
            {loading ? "กำลังบันทึก…" : "บันทึกคะแนน"}
          </Button>
        </form>
        <SignaturePadDialog
          open={whichPad === "blue"}
          onClose={() => setWhichPad(null)}
          onSave={img => setBlueSign(img)}
        />
        <SignaturePadDialog
          open={whichPad === "red"}
          onClose={() => setWhichPad(null)}
          onSave={img => setRedSign(img)}
        />
        <DialogFooter className={cn("items-center sm:justify-center")}>
          <p className="flex justify-center items-center gap-2 text-sm text-gray-500"><TriangleAlert size="14" />ไม่สามารถแก้ไขได้หากบันทึกคะแนนแล้ว</p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}