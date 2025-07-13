import { z } from "zod"

export const signInSchema = z.object({
  username: z.string().min(1, {
    error: "ระบุชื่อผู้ใช้"
  }),
  password: z.string().min(1, {
    error: "ระบุรหัสผ่าน"
  })
})