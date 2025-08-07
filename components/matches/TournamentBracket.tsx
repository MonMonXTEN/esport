import useMatches from '@/hooks/useMatches';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';
import { useMemo, useState, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import ScoreDialog from './ScoreDialog';
import useTournaments from '@/hooks/useTournaments';
import ActionsButton from './ActionsButton';

export type TournamentStatus = "DRAFT" | "LIVE" | "FINISHED"
export type Round = "R32" | "R16" | "QF" | "SF" | "THIRD_PLACE" | "FINAL"

export interface MatchWithTeams {
  id: number
  sequence: number
  round: Round
  status: "PENDING" | "DONE"
  bestOf: 1 | 3 | 5
  blueTeam?: { id: number; name: string } | null
  redTeam?: { id: number; name: string } | null
  blueScore?: number | null
  redScore?: number | null
}

export interface Tournaments {
  id: number
  name: string
  status: "DRAFT" | "LIVE" | "FINISHED"
  active: boolean
}

const ROUND_ORDER: Round[] = [
  "R32", "R16", "QF", "SF", "FINAL", "THIRD_PLACE"
]
const ROUND_LABEL: Record<Round, string> = {
  R32: "รอบ 32 ทีม",
  R16: "รอบ 16 ทีม",
  QF: "รอบ 8 ทีม",
  SF: "รอบรองชนะเลิศ",
  THIRD_PLACE: "อันดับที่ 3",
  FINAL: "รอบชิงชนะเลิศ",
}
const ROUND_COL: Record<Round, number> = {
  R32: 1,
  R16: 2,
  QF: 3,
  SF: 4,
  THIRD_PLACE: 5,
  FINAL: 5,
}

export default function TournamentBracket({ tournamentId }: { tournamentId: number }) {
  const { matches, isLoading } = useMatches(tournamentId)
  const { tournament } = useTournaments(tournamentId)
  const [openMatch, setOpenMatch] = useState<MatchWithTeams | null>(null)

  const columns = [...new Set(Object.values(ROUND_COL))]

  const matchesByRound = useMemo(() => {
    const map: Record<Round, MatchWithTeams[]> = {
      R32: [], R16: [], QF: [], SF: [], THIRD_PLACE: [], FINAL: [],
    }
    for (const m of matches ?? []) map[m.round].push(m)
    ROUND_ORDER.forEach(r => map[r].sort((a, b) => a.sequence - b.sequence))
    return map
  }, [matches])

  const containerRef = useRef<HTMLDivElement | null>(null);
  // เก็บ ref ของการ์ดแต่ละใบ: key = `${round}-${indexในรอบ}`
  const matchRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // L-shape line
  type LLine = { points: string; dashed?: boolean };
  const [lines, setLines] = useState<LLine[]>([]);

  // ช่วยอ่านตำแหน่ง
  const getCenter = (el: HTMLElement, side: 'left' | 'right', containerRect: DOMRect) => {
    const r = el.getBoundingClientRect();
    const x = side === 'left' ? r.left : r.right;
    const y = r.top + r.height / 2;
    return { x: x - containerRect.left, y: y - containerRect.top };
  };

  // คำนวณจุดหักมุมรูป L
  const orthogonalPoints = (p1: { x: number; y: number }, p2: { x: number; y: number }, ratio = 0.5) => {
    const midX = p1.x + (p2.x - p1.x) * ratio; // 50% กลางทาง (ปรับได้)
    // ออกขวาจาก p1 -> วิ่งแนวนอนถึง midX -> ขึ้น/ลงแนวตั้งถึง y ของ p2 -> วิ่งเข้าซ้ายของ p2
    return `${p1.x},${p1.y} ${midX},${p1.y} ${midX},${p2.y} ${p2.x},${p2.y}`;
  };

  // รอบที่เชื่อมต่อกัน (ซ้าย -> ขวา)
  const chain = useMemo<Round[]>(() => ["R32", "R16", "QF", "SF", "FINAL"], [])
  const buildLines = useCallback(() => {
    const c = containerRef.current;
    if (!c) {
      setLines([]);
      return;
    }
    const crect = c.getBoundingClientRect();
    const out: { points: string; dashed?: boolean }[] = [];

    // เชื่อม R32→R16→QF→SF→FINAL (2 คู่รวมเป็น 1)
    for (let i = 0; i < chain.length - 1; i++) {
      const fromRound = chain[i] as Round;
      const toRound = chain[i + 1] as Round;

      const fromArr = matchesByRound[fromRound] ?? [];
      const toArr = matchesByRound[toRound] ?? [];

      for (let j = 0; j < fromArr.length; j++) {
        const targetIndex = Math.floor(j / 2);
        if (targetIndex >= toArr.length) continue;

        const fromEl = matchRefs.current[`${fromRound}-${j}`];
        const toEl = matchRefs.current[`${toRound}-${targetIndex}`];
        if (!fromEl || !toEl) continue;

        const p1 = getCenter(fromEl, 'right', crect);
        const p2 = getCenter(toEl, 'left', crect);

        const points = orthogonalPoints(p1, p2, 0.5);
        out.push({ points });
      }
    }

    // (ออปชัน) เชื่อมจาก 2 คู่ของ SF ไป THIRD_PLACE (เส้นประ)
    if ((matchesByRound.THIRD_PLACE?.length ?? 0) > 0) {
      const thirdEl = matchRefs.current[`THIRD_PLACE-0`];
      if (thirdEl) {
        for (let k = 0; k < 2; k++) {
          const sfEl = matchRefs.current[`SF-${k}`];
          if (!sfEl) continue;
          const p1 = getCenter(sfEl, 'right', crect);
          const p2 = getCenter(thirdEl, 'left', crect);
          const points = orthogonalPoints(p1, p2, 0.5);
          out.push({ points, dashed: true });
        }
      }
    }

    setLines(out);
  }, [matchesByRound, chain])

  // คำนวณตอน render และเวลา resize
  useLayoutEffect(() => {
    buildLines();
  }, [buildLines]);

  // resize หน้าต่าง
  useEffect(() => {
    const onResize = () => buildLines();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [buildLines]);

  // ResizeObserver ของ container
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => buildLines());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [buildLines]);


  if (isLoading) return <p className="p-6 text-center">Loading…</p>


  return (
    <>
      <ActionsButton tournamentId={tournamentId} />
      <div className="bg-gray-900 text-gray-200 p-4 md:p-8 min-h-screen">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white tracking-wider">
          {tournament?.name}
        </h1>

        <div className="overflow-x-auto pb-8">
          <div ref={containerRef} className="relative">
            <div className="grid auto-cols-auto grid-flow-col gap-x-8">
              {columns.map((col) => {
                // ความสูงพื้นที่คอลัมน์ และช่องไฟของแต่ละรอบ (ปรับให้เหมาะกับ UI คุณได้)
                const AREA_H_BY_COL: Record<number, string> = {
                  1: "110rem", // R32
                  2: "110rem", // R16
                  3: "110rem", // QF
                  4: "110rem", // SF
                  5: "110rem", // FINAL + BRONZE
                };
                const GAP_BY_COL: Record<number, string> = {
                  1: "1rem",
                  2: "7.63rem",
                  3: "20.89rem",
                  4: "47.41rem",
                };

                // คอลัมน์ FINAL + THIRD_PLACE (อยู่คอลัมน์เดียวกัน)
                if (col === 5) {
                  return (
                    <div key={col} className="space-y-8">
                      {/* หัวข้อรอบของคอลัมน์ (คงไว้ด้านบนที่เดิม) */}
                      <div className="flex flex-col items-center">
                        <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                          {ROUND_LABEL.FINAL}
                        </h2>

                        {/* พื้นที่คอลัมน์ (relative) */}
                        <div
                          className="relative w-full"
                          style={{ minHeight: AREA_H_BY_COL[5] }}
                        >
                          {/* FINAL: กึ่งกลางคอลัมน์ */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                            style={{ top: "47%" }}
                          >
                            <div
                              className="flex flex-col items-center"
                              style={{ gap: GAP_BY_COL[5] }}
                            >
                              {matchesByRound.FINAL.map((match, idx) => (
                                <div
                                  key={match.id}
                                  ref={(el) => {
                                    matchRefs.current[`FINAL-${idx}`] = el;
                                  }}
                                  className="relative"
                                >
                                  <Matchup
                                    match={match}
                                    round={col}
                                    onClick={() => {
                                      if (tournament?.status !== "LIVE") {
                                        toast.error("กรุณาเริ่มการแข่งขันก่อน")
                                        return
                                      }
                                      setOpenMatch(match);
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* BRONZE: ใต้ลงมาจาก FINAL (มีหัวข้อย่อยเฉพาะตรงนี้) */}
                          <div
                            className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
                            style={{ top: "85%" }} // ปรับตำแหน่งได้
                          >
                            <h3 className="text-base font-semibold mb-3 text-cyan-400">
                              {ROUND_LABEL.THIRD_PLACE}
                            </h3>
                            {matchesByRound.THIRD_PLACE.map((match, idx) => (
                              <div
                                key={match.id}
                                ref={(el) => {
                                  matchRefs.current[`THIRD_PLACE-${idx}`] = el;
                                }}
                                className="relative"
                              >
                                <Matchup
                                  match={match}
                                  round={col}
                                  onClick={() => {
                                    if (tournament?.status !== "LIVE") {
                                      toast.error("กรุณาเริ่มการแข่งขันก่อน");
                                      return;
                                    }
                                    setOpenMatch(match);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // คอลัมน์อื่น ๆ (R32, R16, QF, SF): ให้กลุ่มการ์ดอยู่กึ่งกลางแนวตั้ง
                return (
                  <div key={col} className="space-y-8">
                    {ROUND_ORDER.filter((r) => ROUND_COL[r] === col).map((round) => (
                      <div key={round} className="flex flex-col items-center">
                        {/* หัวข้อรอบอยู่ด้านบน */}
                        <h2 className="text-xl font-semibold mb-4 text-cyan-400">
                          {ROUND_LABEL[round]}
                        </h2>

                        {/* พื้นที่คอลัมน์ (relative) */}
                        <div
                          className="relative w-full"
                          style={{ minHeight: AREA_H_BY_COL[col] }}
                        >
                          {/* กลุ่มการ์ดอยู่กึ่งกลางแนวตั้งของพื้นที่คอลัมน์ */}
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center"
                            style={{ gap: GAP_BY_COL[col] }}
                          >
                            {matchesByRound[round].map((match, idx) => (
                              <div
                                key={match.id}
                                ref={(el) => {
                                  matchRefs.current[`${round}-${idx}`] = el;
                                }}
                                className="relative"
                              >
                                <Matchup
                                  match={match}
                                  round={col}
                                  onClick={() => {
                                    if (tournament?.status !== "LIVE") {
                                      toast.error("กรุณาเริ่มการแข่งขันก่อน");
                                      return;
                                    }
                                    setOpenMatch(match);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>

            {/* ถ้าคุณมี SVG วาดเส้นอยู่แล้ว คงไว้ได้เลย */}
            <svg
              className="pointer-events-none absolute inset-0 w-full h-full bg-transparent"
              style={{ background: "transparent" }}
            >
              {lines.map((ln, i) => (
                <polyline
                  key={i}
                  points={ln.points}
                  stroke="white"
                  strokeWidth={2}
                  fill="none"
                  strokeDasharray={ln.dashed ? "6 6" : undefined}
                />
              ))}
            </svg>
          </div>

          {openMatch && (
            <ScoreDialog
              open={!!openMatch}
              match={openMatch}
              onOpenChange={() => setOpenMatch(null)}
            />
          )}
        </div>

      </div>
    </>
  )
}

function Matchup({
  match,
  round,
  onClick,
}: {
  match: MatchWithTeams
  round: number
  onClick: () => void
}) {
  const { blueTeam, redTeam, blueScore, redScore, status } = match
  const done = status === "DONE"
  const blueWin = done && (blueScore ?? 0) > (redScore ?? 0)
  const redWin = done && (redScore ?? 0) > (blueScore ?? 0)

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-gray-800 border border-gray-600 rounded-lg shadow-lg w-52 min-h-[80px]",
        "flex flex-col justify-center cursor-pointer transition hover:ring-2 hover:ring-primary",
        done && "opacity-70"
      )}
    >
      {/* BLUE / TEAM A */}
      <div
        className={cn(
          "flex justify-between items-center p-2 border-b border-gray-600 gap-2",
          blueWin ? "font-bold text-white" : "text-gray-400"
        )}
      >
        <span className="flex items-center space-x-2 truncate">
          {blueWin && round === 5 && <Crown size={16} className="text-yellow-400" />}
          <span>{blueTeam?.name}</span>
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded",
            blueWin ? "bg-green-500 text-white" : "bg-gray-700"
          )}
        >
          {blueScore}
        </span>
      </div>

      {/* RED / TEAM B */}
      <div
        className={cn(
          "flex justify-between items-center p-2 gap-2",
          redWin ? "font-bold text-white" : "text-gray-400"
        )}
      >
        <span className="flex items-center space-x-2 truncate">
          {redWin && round === 5 && <Crown size={16} className="text-yellow-400" />}
          <span>{redTeam?.name}</span>
        </span>
        <span
          className={cn(
            "px-2 py-0.5 rounded",
            redWin ? "bg-green-500 text-white" : "bg-gray-700"
          )}
        >
          {redScore}
        </span>
      </div>
    </div>
  )
}