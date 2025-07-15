import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ selectedCount }: { selectedCount: number }) {
  return (
    <Button
      variant="destructive"
      size="sm"
      className="ml-2"
      disabled={!selectedCount}
      onClick={() => {
        // Todo
      }}
    >
      <Trash2 />
      <span className="hidden lg:inline">Delete {selectedCount ? `(${selectedCount})` : ""}</span>
    </Button>
  )
}