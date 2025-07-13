'use client'

import { useRouter } from "next/navigation";

interface LoginButtonProps {
  children: React.ReactNode
  mode?: "modal" | "redirect"
}

export function LoginButton ({
  children,
  mode = "redirect",
}: LoginButtonProps) {
  const router = useRouter()

  function onClick() {
    router.push("/login")
  }

  if (mode === "modal") {
    return (
      <span>
        TODO: Implement Modal
      </span>
    )
  }

  return (
    <span onClick={onClick}>
      {children}
    </span>
  )
}