import {
  Home,
  UserCog,
  Shield,
} from "lucide-react"

export const sidebarItems = [
  {
    title: "แดชบอร์ด",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "รายชื่อทีม",
    url: "/dashboard/team",
    icon: Shield,
  },
  {
    title: "รายชื่อกรรมการ",
    url: "/dashboard/staff",
    icon: UserCog,
  },
]