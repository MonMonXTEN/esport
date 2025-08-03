import { Flag, Play, Shuffle } from "lucide-react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useState } from "react";


export default function ActionsButton({ tournamentId }: { tournamentId: number }) {
  const [isloading, setIsLoading] = useState(false)

  const handleRandomize = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/tournaments/${tournamentId}/randomize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      toast.success("สุ่มทีมสำเร็จ")
    } catch (err: unknown) {
      toast.error((err as Error).message || "สุ่มไม่สำเร็จ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStart = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/tournaments/${tournamentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      toast.success("เริ่มเกมแล้ว")
    } catch (err: unknown) {
      toast.error((err as Error).message || "ไม่สามารถเริ่มเกมได้")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="relative">
      <div className="flex gap-3 absolute left-3 top-3">
        <Button variant="secondary" size="icon" className="cursor-pointer" onClick={handleStart} disabled={isloading}>
          <Play />
        </Button>
        <Button variant="secondary" size="icon" className="cursor-pointer" onClick={handleRandomize} disabled={isloading}>
          <Shuffle />
        </Button>
        <Button variant="secondary" size="icon" className="cursor-pointer">
          <Flag />
        </Button>
      </div>
    </div>
  )
}
