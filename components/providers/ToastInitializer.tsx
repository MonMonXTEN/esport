"use client"

import { useEffect } from "react"
import { toast } from "sonner"

const toastKeys = ["success", "error", "info", "warning", "loading"] as const
type ToastKey = typeof toastKeys[number]
interface StoredToast {
  type: ToastKey | "default"
  msg: string
  duration?: number
}

const STORAGE_KEY = "toastStore"

export default function ToastInitializer() {
  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    let stored: StoredToast | null = null
    try {
      stored = JSON.parse(raw) as StoredToast
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    const { type, msg, duration } = stored
    if (!msg) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    if (type === "default") {
      toast(msg, { duration })
    } else if (toastKeys.includes(type as ToastKey)) {
      const key = type as ToastKey
      toast[key](msg, { duration })
    }

    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return null
}