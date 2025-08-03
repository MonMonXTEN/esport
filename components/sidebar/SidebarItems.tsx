import {
  Home,
  UserCog,
  Shield,
  Dices,
  Settings,
} from "lucide-react"

export const sidebarItems = [
  {
    title: "แดชบอร์ด",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "แมตช์",
    url: "/dashboard/matches",
    icon: Dices,
  },
  {
    title: "รายชื่อทีม",
    url: "/dashboard/teams",
    icon: Shield,
  },
  {
    title: "รายชื่อกรรมการ",
    url: "/dashboard/staffs",
    icon: UserCog,
  },
  {
    title: "ทดสอบระบบ",
    url: "/dashboard/test",
    icon: Settings,
  },
]