import { Tournaments } from "@/components/matches/TournamentBracket"
import { socket } from "@/lib/socketClient"
import { useEffect } from "react"
import useSWR from "swr"

export default function useTournaments(tournamentId: number) {
  const url = `/api/tournaments/${tournamentId}`
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  const { data, mutate, error, isLoading } = useSWR<Tournaments>(url, fetcher)

  useEffect(() => {
    const handler = () => mutate()
    socket.on("tournament:start", handler)

    return () => {
      socket.off("tournament:start", handler)
    }
  }, [mutate])
  return { tournament: data, error, isLoading, mutate }
}