import StaffPageClient from "@/components/staff/StaffPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staffs",
}

export default function Staff() {
  return (
    <div className="p-2">
      <StaffPageClient />
    </div>
  )
}