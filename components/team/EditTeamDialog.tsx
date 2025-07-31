import { useEffect, useState } from "react"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Team } from "@/lib/types/team"
import { teamSchema } from "@/lib/zod"

const editTeamSchema = teamSchema.omit({ status: true })

interface EditTeamDialogProps {
  open: boolean
  onClose: () => void
  team: Team | null
}

export default function EditTeamDialog({
  open,
  onClose,
  team,
}: EditTeamDialogProps) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof editTeamSchema>>({
    resolver: zodResolver(editTeamSchema),
  })

  useEffect(() => {
    if (open && team) {
      reset({
        name: team.name ?? "",
      })
    }
  }, [open, team, reset])

  const onSubmit = async (data: z.infer<typeof editTeamSchema>) => {
    if (!team) return
    setLoading(true)

    try {
      const res = await fetch("/api/teams/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: team.id, ...data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "อัปเดตไม่สำเร็จ")
      if (res.ok && json.success) toast.success(json.message)
      onClose()
    } catch {
      toast.error("อัปเดตไม่สำเร็จ กรุณาลองใหม่ภายหลัง")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Badge variant="destructive">#ID {team?.id}</Badge><span>แก้ไขชื่อทีม</span></DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-3">ชื่อทีม</Label>
            <Input
              {...register("name")}
              placeholder="Team"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button className="cursor-pointer" variant="outline" type="button" onClick={onClose} disabled={loading}>
              ยกเลิก
            </Button>
            <Button className="cursor-pointer" type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              บันทึก
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}