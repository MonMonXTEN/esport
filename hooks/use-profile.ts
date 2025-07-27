import useSWR from "swr"
const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function useProfile() {
  return useSWR("/api/user/profile", fetcher)
}
