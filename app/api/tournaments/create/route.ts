import db from "@/lib/db";
import { seedR32Matches } from "@/lib/services/bracket";
import { NextResponse } from "next/server";
import z from "zod";

const BodySchema = z.object({
  name: z.string().min(1, "ต้องกรอกชื่อทัวร์นาเมนต์"),
  teamIds: z
    .array(
      z.preprocess(
        (v) => (typeof v === "string" ? Number(v) : v),
        z.number().int().positive()
      )
    )
    .min(2, "เลือกทีมอย่างน้อย 2")
    .max(32, "เลือกได้สูงสุด 32 ทีม"),
})
// const BodySchema = z.object({
//   name: z.string().min(1),
//   teamIds: z.array(z.number().int().positive().min(2).max(32))
// })

export async function POST(req: Request) {
  const parse = BodySchema.safeParse(await req.json())
  if (!parse.success) return NextResponse.json({ message: "ข้อมูลไม่ถูกต้อง" }, { status: 400 })

  const { name, teamIds } = parse.data
  const tournament = await db.tournament.create({
    data: {
      name,
      tournamentTeams: {
        createMany: {
          data: teamIds.map((id) => ({ teamId: id })),
          skipDuplicates: true
        }
      }
    },
  })
  await seedR32Matches(tournament.id, teamIds)
  return NextResponse.json({ id: tournament.id }, { status: 201 })
}