import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type AddButtonProps = { onClick: () => void }

export default function AddButton({ onClick }: AddButtonProps) {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-2 cursor-pointer"
      onClick={onClick}
    >
      <Plus />
      <span className="hidden lg:inline">เพิ่ม</span>
    </Button>
  )
}