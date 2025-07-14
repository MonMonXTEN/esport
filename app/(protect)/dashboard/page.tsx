import { Metadata } from "next";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default async function Dashboard() {
  const session = await auth()
  return (
    <div className="p-4 border rounded-lg bg-secondary text-secondary-foreground">
      <h2 className="text-lg font-semibold">Session Data:</h2>
      <pre className="mt-2 text-sm whitespace-pre-wrap">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}