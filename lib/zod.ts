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