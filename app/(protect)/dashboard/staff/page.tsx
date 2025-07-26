import StaffPageClient from "@/components/staff/StaffPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff",
}

export default function Staff() {
  return <StaffPageClient />
}