'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoveLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  footerLabel?: string
}

export function CardWrapper({
  children,
  headerLabel,
  footerLabel
}: CardWrapperProps) {
  return (
    <Card className={cn("w-full max-w-full xs:max-w-md rounded-none xs:rounded-xl relative")}>
      <CardHeader>
        <div className="absolute left-5 top-5">
          <Link href='/'>
            <Button variant='ghost' className="cursor-pointer"><MoveLeft /></Button>
          </Link>
        </div>
        <CardTitle className="text-center text-xl">
          {headerLabel}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
      {footerLabel && (
        <CardFooter>
          <CardDescription className="w-full text-center">
            {footerLabel}
          </CardDescription>
        </CardFooter>
      )}
    </Card>
  )
}