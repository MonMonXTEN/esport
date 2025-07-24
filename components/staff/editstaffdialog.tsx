import { useEffect, useState } from "react"
import { Staff } from "./staff-table"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { staffSchema } from "@/lib/zod"

const editStaffSchema = staffSchema.omit({ username: true, password: true })

interface EditStaffDialogProps {
  open: boolean
  onClose: () => void
  staff: Staff | null
  onUpdated: () => void
}

export default function EditStaffDialog({
  open,
  onClose,
  staff,
  onUpdated,
}: EditStaffDialogProps) {
  const [loading, setLoading] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm<z.infer<typeof editStaffSchema>>({
    resolver: zodResolver(editStaffSchema),
    defaultValues: {
      name: "",
      role: "staff",
    },
  })

  useEffect(() => {
    if (open && staff) {
      reset({
        name: staff.name ?? "",
        role: staff.role,
      });
    }
  }, [open, staff, reset])

  const onSubmit = async (data: z.infer<typeof editStaffSchema>) => {
    if (!staff) return
    setLoading(true)

    try {
      const res = await fetch("/api/admin/updatestaff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: staff.id, ...data }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || "อัปเดตไม่สำเร็จ")
      localStorage.setItem("toastStore", JSON.stringify({ type: "success", msg: json.message }))
      onUpdated()
      onClose()
    } catch {
      toast.error("อัปเดตไม่สำเร็จ ลองใหม่ภายหลัง");
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>แก้ไขรายชื่อกรรมการ</DialogTitle>
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



    // <Dialog open={open} onOpenChange={onClose}>
    //   <DialogContent className="sm:max-w-md">
    //     <DialogHeader>
    //       <DialogTitle>แก้ไขกรรมการ</DialogTitle>
    //     </DialogHeader>
    //     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    //       {/* Name */}
    //       <Input {...register("name")} placeholder="ชื่อ" disabled={loading} />
    //       {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}

    //       {/* Username */}
    //       <Input {...register("username")} placeholder="Username" disabled={loading} />
    //       {errors.username && <p className="text-destructive text-xs mt-1">{errors.username.message}</p>}

    //       {/* Role */}
    //       <Select
    //         value={watch("role")}
    //         onValueChange={(v) => setValue("role", v as "staff" | "admin", { shouldValidate: true })}
    //         disabled={loading}
    //       >
    //         <SelectTrigger>
    //           <SelectValue placeholder="เลือก Role" />
    //         </SelectTrigger>
    //         <SelectContent>
    //           <SelectItem value="staff">Staff</SelectItem>
    //           <SelectItem value="admin">Admin</SelectItem>
    //         </SelectContent>
    //       </Select>
    //       {errors.role && <p className="text-destructive text-xs mt-1">{errors.role.message}</p>}

    //       {/* Actions */}
    //       <div className="flex justify-end gap-2">
    //         <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
    //           ยกเลิก
    //         </Button>
    //         <Button type="submit" disabled={loading}>
    //           {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
    //           บันทึก
    //         </Button>
    //       </div>
    //     </form>
    //   </DialogContent>
    // </Dialog>
  )
}
