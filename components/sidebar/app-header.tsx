import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "../ui/sidebar";

export default function AppHeader() {
  return (
    <div className="flex items-center h-14 p-3">
      <SidebarTrigger className="mr-2" />
      <Separator orientation="vertical" className="" />
      <div className="mx-4">Dashboard</div>
    </div>
  )
}