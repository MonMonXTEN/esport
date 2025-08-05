import { z } from "zod"

export const signInSchema = z.object({
  username: z.string().min(1, {
    error: "ระบุชื่อผู้ใช้"
  }),
  password: z.string().min(1, {
    error: "ระบุรหัสผ่าน"
  })
})

export const staffSchema = z.object({
  name: z.string().optional(),
  username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
  role: z.enum(["staff", "admin"], { error: "กรุณาเลือก Role" }),
})

export const teamSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อทีม"),
  status: z.boolean().optional(),
})

export const scoreSchema = z.object({
  blueScore: z.number().int().min(0),
  redScore: z.number().int().min(0),
  signatures: z.array(
    z.object({
      teamId: z.number().int().positive(),
      imageUrl: z.url().optional(),
    })
  ).min(1).max(2),
})

export const querySchema = z.object({
  round: z
    .enum(["R32", "R16", "QF", "SF", "THIRD_PLACE", "FINAL"])
    .optional(),
  withSignatures: z
    .enum(["true", "false"])
    .optional()
    .default("false"),
})