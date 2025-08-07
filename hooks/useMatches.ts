import { MatchWithTeams } from "@/components/matches/TournamentBracket"
import { socket } from "@/lib/socketClient"
import { useEffect } from "react"
import useSWR from "swr"

export default function useMatches(tournamentId: number) {
  const url = `/api/tournaments/${tournamentId}/matches`
  const fetcher = (url: string) => fetch(url).then(r => r.json())
  const { data, mutate, error, isLoading } = useSWR<MatchWithTeams[]>(url, fetcher)

  useEffect(() => {
    const handler = () => mutate()
    socket.on("match:update", handler)

    return () => {
      socket.off("match:update", handler)
    }
  }, [mutate])
  return { matches: data, error, isLoading, mutate }
}
