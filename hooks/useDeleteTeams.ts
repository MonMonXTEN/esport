"use client"
import deleteTeams from "@/lib/services/deleteTeams"
import { useState, useCallback } from "react"
import { toast } from "sonner"

export default function useDeleteTeams(
  afterSuccess?: () => void,
) {
  const [deleteLoading, setDeleteLoading] = useState(false)

  const deleteTeamsByIds = useCallback(
    async (ids: number[]) => {
      if (ids.length === 0) return
      setDeleteLoading(true)
      try {
        await deleteTeams(ids)
        toast.success(`ลบ ${ids.length} รายการเรียบร้อยแล้ว`)
        afterSuccess?.()
      } catch (e: unknown) {
        toast.error((e as Error).message || "ลบไม่สำเร็จ")
      } finally {
        setDeleteLoading(false)
      }
    },
    [afterSuccess]
  )

  return { deleteLoading, deleteTeamsByIds }
}
