import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AddButton() {
  return (
    <Button
      variant="secondary"
      size="sm"
      className="ml-2"
      onClick={() => {
        // Todo
      }}
    >
      <Plus />
      <span className="hidden lg:inline">Add Staff</span>
    </Button>
  )
}