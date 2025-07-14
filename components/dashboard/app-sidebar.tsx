import {
  Home,
  UserCog,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import LogoSidebar from "./logo-sidebar"

const items = [
  {
    title: "แดชบอร์ด",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "รายชื่อกรรมการ",
    url: "/dashboard/staff",
    icon: UserCog,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <LogoSidebar />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Staff Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item)=> (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        FOOTER
      </SidebarFooter>
    </Sidebar>
  )
}