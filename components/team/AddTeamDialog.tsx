import { useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { teamSchema } from "@/lib/zod"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddTeamDialogProps {
  open: boolean
  onClose: () => void
}

export default function AddTeamDialog({
  open,
  onClose,
}: AddTeamDialogProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", status: true },
  })

  const onSubmit = async (data: z.infer<typeof teamSchema>) => {
    setLoading(true)
    try {
      const res = await fetch("/api/teams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "เกิดข้อผิดพลาด")
      if (res.ok && json.success) {
        reset()
        return toast.success(json.message || "สร้างทีมสำเร็จ")
      }
    } catch (err: unknown) {
      toast.error((err as Error).message || "บันทึกไม่สำเร็จ กรุณาลองใหม่ในภายหลัง")
    } finally {
      setLoading(false)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มทีม</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-3">ชื่อทีม</Label>
            <Input
              {...register("name")}
              placeholder="Name"
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