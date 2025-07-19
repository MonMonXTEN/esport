import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
  selectedCount: number
  onClick?: () => void
  loading?: boolean
}

export default function DeleteButton({
  selectedCount,
  onClick,
}: DeleteButtonProps) {
  return (
    <Button
      variant="destructive"
      size="sm"
      className="ml-2 cursor-pointer"
      disabled={!selectedCount}
      onClick={onClick}
    >
      <Trash2 />
      <span className="hidden lg:inline">Delete {selectedCount ? `(${selectedCount})` : ""}</span>
    </Button>
  )
}