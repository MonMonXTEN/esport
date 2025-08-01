import TeamTable from "@/components/team/TeamTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams",
}

export default function Team() {
  return (
    <div className='p-2'>
      <TeamTable />
    </div>
  )
}
