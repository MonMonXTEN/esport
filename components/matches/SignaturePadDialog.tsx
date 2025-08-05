import { useRef } from "react"
import SignaturePad from "react-signature-canvas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export default function SignaturePadDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (img: string) => void
}) {
  const padRef = useRef<SignaturePad>(null)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <SignaturePad
          ref={padRef}
          canvasProps={{ className: "border rounded w-full h-64 bg-white" }}
        />
        <div className="flex justify-between mt-2 gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => padRef.current?.clear()}
          >
            ล้าง
          </Button>
          <Button
            type="button"
            onClick={() => {
              const img = padRef.current?.isEmpty()
                ? undefined
                : padRef.current?.getTrimmedCanvas().toDataURL("image/png")
              if (img) {
                onSave(img)
                onClose()
              }
            }}
          >
            บันทึก
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}