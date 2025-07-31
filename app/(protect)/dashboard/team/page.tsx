import TeamTable from "@/components/team/TeamTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team",
}

export default function Team() {
  return (
    <div className='p-2'>
      <TeamTable />
    </div>
  )
}
