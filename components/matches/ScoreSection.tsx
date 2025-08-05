import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Expand, Trophy } from "lucide-react"

interface ScoreSectionProps {
  teamName?: string
  teams: "blue" | "red"
  signImage?: string
  onClickSign: () => void
  bestOf: 1 | 3 | 5
  score: number
  setScore: (score: number) => void
}

export default function ScoreSection({
  teamName,
  teams,
  signImage,
  onClickSign,
  bestOf,
  score,
  setScore,
}: ScoreSectionProps) {

  // สำหรับรอบ BO3, BO5
  const getScoreOptions = (bestOf: number) => {
    if (bestOf === 3) return [0, 1, 2]
    if (bestOf === 5) return [0, 1, 2, 3]
    return []
  }

  // สำหรับ BO1
  if (bestOf === 1) {
    return (
      <section className="space-y-2">
        <Label className="text-sm font-medium">
          เลือก
        </Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={score === 1 ? "ghost" : "outline"}
            onClick={() => setScore(1)}
            className={`w-full cursor-pointer ${score === 1 && "bg-green-500 hover:bg-green-400 text-white hover:text-white font-bold"}`}
          >
            {score === 1 && (<Trophy />)}
            {teamName ?? `(N/A) : ${teams} Team`}
          </Button>
        </div>
        <div>
          <Label className="text-sm font-medium">
            ลายเซ็น
          </Label>
          {signImage ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClickSign}
              asChild
            >
              <div className="relative w-full h-20 md:h-32 bg-white border rounded cursor-pointer group overflow-hidden">
                <Image
                  src={signImage}
                  alt={`${teams} Signature`}
                  width={128}
                  height={64}
                  className="w-full h-full object-contain"
                  title="คลิกเพื่อขยาย"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <p className="flex items-center justify-center gap-2 text-white text-sm">
                    <Expand /> คลิกเพื่อขยาย
                  </p>
                </div>
              </div>
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClickSign}
              asChild
            >
              <div className="w-full h-20 md:h-32 bg-white border rounded cursor-pointer">
                <p className="flex items-center justify-center gap-2 text-gray-400">
                  <Expand /> คลิกเพื่อขยาย
                </p>
              </div>
            </Button>
          )}
        </div>
      </section>
    )
  }

  // สำหรับ BO3, BO5
  const scoreOptions = getScoreOptions(bestOf)
  return (
    <section className="space-y-2">
      <Label className="text-sm font-medium">
        {teamName ?? `(N/A) : ${teams} Team`}
      </Label>
      <div>
        <Select value={score.toString()} onValueChange={v => setScore(Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="เลือกคะแนน" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {scoreOptions.map(option => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        {signImage ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClickSign}
            asChild
          >
            <div className="relative w-full h-20 md:h-32 bg-white border rounded cursor-pointer group overflow-hidden">
              <Image
                src={signImage}
                alt={`${teams} Signature`}
                width={128}
                height={64}
                className="w-full h-full object-contain"
                title="คลิกเพื่อขยาย"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <p className="flex items-center justify-center gap-2 text-white text-sm">
                  <Expand /> คลิกเพื่อขยาย
                </p>
              </div>
            </div>
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onClickSign}
            asChild
          >
            <div className="w-full h-20 md:h-32 bg-white border rounded cursor-pointer">
              <p className="flex items-center justify-center gap-2 text-gray-400">
                <Expand /> คลิกเพื่อขยาย
              </p>
            </div>
          </Button>
        )}
      </div>
    </section>
  )
}