"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { sidebarItems } from "./SidebarItems"

export default function NavHeader() {
  const pathname = usePathname()
  const current = sidebarItems.reduce((matched, item) => {
    if (pathname.startsWith(item.url)) {
      if (!matched || item.url.length > matched.url.length) {
        return item;
      }
    }
    return matched;
  }, null as null | typeof sidebarItems[number]);
  const title = current ? current.title : "Dashboard";
  return (
    <div className="flex items-center h-14 p-3">
      <SidebarTrigger className="mr-2" />
      <Separator orientation="vertical" />
      <div className="mx-4">{title}</div>
    </div>
  )
}


