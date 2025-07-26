import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmDeleteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
  loading?: boolean
}

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  count,
  loading = false
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ยืนยันการลบ</DialogTitle>
        </DialogHeader>
        <p className="py-4">คุณต้องการลบรายการจำนวน {count} รายการใช่หรือไม่?</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className="cursor-pointer" disabled={loading} onClick={onClose}>
            ยกเลิก
          </Button>
          <Button variant="destructive" className="cursor-pointer" disabled={loading} onClick={onConfirm}>
            <span className="flex items-center gap-2">
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              ลบ
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
