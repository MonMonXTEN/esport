"use client"
import deleteTeams from "@/lib/services/teamDelete"
import { useState, useCallback } from "react"
import { toast } from "sonner"

export default function useDeleteTeams(
  afterSuccess?: () => void,
  afterFinally?: () => void
) {
  const [deleteLoading, setDeleteLoading] = useState(false)

  const deleteTeamsByIds = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return
      setDeleteLoading(true)
      try {
        await deleteTeams(ids)
        toast.success(`ลบ ${ids.length} รายการเรียบร้อย`)
        afterSuccess?.()
      } catch (e: unknown) {
        toast.error((e as Error).message || "ลบไม่สำเร็จ")
      } finally {
        setDeleteLoading(false)
        afterFinally?.()
      }
    },
    [afterSuccess, afterFinally]
  )

  return { deleteLoading, deleteTeamsByIds }
}
