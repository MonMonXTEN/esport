"use client"

import { useEffect, useState } from "react"
import BracketView, { TournamentStatus } from "@/components/matches/BracketView"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import ActionsButton from "@/components/matches/ActionsButton"
import TournamentBracket from "@/components/matches/TournamentBracket"

type APIRes = { id: number; name: string; status: TournamentStatus }

export default function TournamentPage() {
  const router = useRouter()
  const [tour, setTour] = useState<APIRes | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tournaments/")
      .then(r => r.json().then(j => r.ok ? j : Promise.reject(j.message)))
      .then((active: { id: number }) =>
        fetch(`/api/tournaments/${active.id}`)
      )
      .then(r => r.json().then(j => r.ok ? j : Promise.reject(j.message)))
      .then((data: APIRes) => setTour(data))
      .catch(e => setErr(String(e)))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )

  if (err || !tour)
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{err ?? "No tournament"}</AlertDescription>
        </Alert>
        <Button onClick={() => router.refresh()}>Reload</Button>
      </div>
    )

  return (
    <main className="">
      <ActionsButton tournamentId={tour.id} />
      {/* ส่ง status ลงไป */}
      <TournamentBracket
        tournamentId={tour.id}
        title={tour.name}
        tournamentStatus={tour.status}
      />
    </main>
  )
}
