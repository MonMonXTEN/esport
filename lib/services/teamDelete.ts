export default async function deleteTeams(ids: number[]) {
  if (ids.length === 0) return

  const res = await fetch("/api/teams/delete", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  })

  if (!res.ok) {
    const { error } = await res.json().catch(() => ({}))
    throw new Error(error || "เกิดข้อผิดพลาด")
  }
}