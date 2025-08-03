/* src/components/ScoreDialog.tsx */
"use client"

import { useRef, useState } from "react"
import SignaturePad from "react-signature-canvas"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MatchWithTeams } from "@/components/matches/BracketView"
import { toast } from "sonner"

const schema = z.object({
  blueScore: z.preprocess(Number, z.number().int().min(0)),
  redScore:  z.preprocess(Number, z.number().int().min(0)),
})
type FormData = z.infer<typeof schema>

export default function ScoreDialog({ match }: { match: MatchWithTeams }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const bluePad = useRef<SignaturePad>(null)
  const redPad  = useRef<SignaturePad>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormData) => {
    const blueImg = bluePad.current?.getTrimmedCanvas().toDataURL("image/png")
    const redImg  = redPad.current?.getTrimmedCanvas().toDataURL("image/png")
    if (!blueImg || !redImg) {
      toast.error("กรุณาเซ็นทั้งสองฝั่ง")
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/tournaments/matches/${match.id}/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueScore: data.blueScore,
          redScore:  data.redScore,
          signatures: [
            { teamId: match.blueTeam?.id, imageUrl: blueImg },
            { teamId: match.redTeam?.id, imageUrl: redImg },
          ],
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success("บันทึกคะแนนสำเร็จ")
    } catch (err: unknown) {
      toast.error((err as Error).message || "บันทึกไม่สำเร็จ")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ฝั่งน้ำเงิน */}
      <section className="space-y-2">
        <label className="text-sm font-medium block">
          {match.blueTeam?.name ?? "Blue"}
        </label>
        <Input
          type="number"
          className="w-24"
          {...register("blueScore")}
          aria-invalid={!!errors.blueScore}
        />
        <SignaturePad
          ref={bluePad}
          canvasProps={{ className: "border w-full h-24 rounded" }}
        />
      </section>

      {/* ฝั่งแดง */}
      <section className="space-y-2">
        <label className="text-sm font-medium block">
          {match.redTeam?.name ?? "Red"}
        </label>
        <Input
          type="number"
          className="w-24"
          {...register("redScore")}
          aria-invalid={!!errors.redScore}
        />
        <SignaturePad
          ref={redPad}
          canvasProps={{ className: "border w-full h-24 rounded" }}
        />
      </section>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "กำลังบันทึก…" : "บันทึกคะแนน"}
      </Button>
    </form>
  )
}