'use client'

import { z } from "zod"
import { signInSchema } from "@/lib/zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { signIn } from "next-auth/react"

import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { CardWrapper } from "./card-wrapper";
import { Button } from "../ui/button"
import { FormError } from "@/components/auth/form-error"
import { FormSuccess } from "@/components/auth/form-success"
import { useRouter } from "next/navigation"

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [isPending, setIsPending] = useState<boolean>(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  })

  const onSubmit = async (values: z.infer<typeof signInSchema>) => {
    setIsPending(true)
    setError("")
    setSuccess("")

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: values.username,
        password: values.password,
      })

      if (res?.error) {
        // Login Fail
        if (res.error === 'CredentialsSignin') {
          setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")
        } else {
          setSuccess("เกิดข้อผิดพลาด กรุณาลองใหม่ในภายหลัง")
        }
        setIsPending(false)
      } else if (res.ok) {
        // Login Success
        setSuccess("เข้าสู่ระบบสำเร็จ กำลังเปลี่ยนเส้นทาง...")
        router.push("/dashboard")
      }
    } catch {
      setError("Internal Error")
      setIsPending(false)
    }
  }

  return (
    <CardWrapper headerLabel="ลงชื่อเข้าใช้" footerLabel="หากมีปัญหาในการลงชื่อเข้าใช้ โปรดติดต่อผู้ดูแลระบบ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="py-2">ชื่อผู้ใช้</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="ระบุชื่อผู้ใช้"
                      type="text"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="py-2">รหัสผ่าน</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="******"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button
            disabled={isPending}
            type="submit"
            className="w-full"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            เข้าสู่ระบบ
          </Button>
        </form>
      </Form>
    </CardWrapper>
  )
}