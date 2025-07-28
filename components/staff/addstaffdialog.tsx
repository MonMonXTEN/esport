import { useState } from "react"
import { useForm } from "react-hook-form"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { staffSchema } from "@/lib/zod"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AddStaffDialogProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export default function AddStaffDialog({
  open,
  onClose,
  onCreated,
}: AddStaffDialogProps) {
  const [loading, setLoading] = useState(false)
  const [hasCreated, setHasCreated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<z.infer<typeof staffSchema>>({
    resolver: zodResolver(staffSchema),
    defaultValues: { name: "", username: "", password: "", role: "staff" },
  })

  const handleDialogClose = () => {
    onClose()
    if (hasCreated) {
      onCreated()
      setHasCreated(false)
    }
  }

  const onSubmit = async (data: z.infer<typeof staffSchema>) => {
    setLoading(true)
    try {
      const res = await fetch("/api/staff/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error()
      toast.success(json.message || "สร้างบัญชีผู้ใช้สำเร็จ")
      setHasCreated(true)
      reset()
    } catch {
      toast.error("บันทึกไม่สำเร็จ ลองใหม่ภายหลัง")
    } finally {
      setLoading(false)
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เพิ่มกรรมการ</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label className="mb-3">ชื่อ <span className="text-gray-400 font-normal">(ไม่จำเป็นต้องระบุ)</span></Label>
            <Input
              {...register("name")}
              placeholder="Name"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-3">ชื่อผู้ใช้</Label>
            <Input
              {...register("username")}
              placeholder="Username"
              disabled={loading}
            />
            {errors.username && (
              <p className="text-destructive text-xs mt-1">{errors.username.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-3">รหัสผ่าน</Label>
            <Input
              type="password"
              {...register("password")}
              placeholder="Password"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label className="mb-3">หน้าที่</Label>
            <Select
              value={watch("role")}
              onValueChange={v => setValue("role", v as "staff" | "admin", { shouldValidate: true })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-destructive text-xs mt-1">{errors.role.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button className="cursor-pointer" variant="outline" type="button" onClick={handleDialogClose} disabled={loading}>
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