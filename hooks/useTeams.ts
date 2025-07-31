import { socket } from "@/lib/socketClient";
import { Team } from "@/lib/types/team";
import { useEffect } from "react";
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function useTeams() {
  const {
    data: teams = [],
    mutate,
    isLoading,
    error
  } = useSWR<Team[]>("/api/teams", fetcher, {
    keepPreviousData: true,
  })

  useEffect(() => {
    const handler = () => mutate()
    socket.on("teams:update", handler)
    return () => {
      socket.off("teams:update", handler)
    }
  }, [mutate])
  return { teams, isLoading, error, mutate }
}