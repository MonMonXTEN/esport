'use client'

import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface CardWrapperProps {
  children: React.ReactNode
  headerLabel: string
  footerLabel?: string
}

export default function CardWrapper({
  children,
  headerLabel,
  footerLabel
}: CardWrapperProps) {
  return (
    <Card className={cn("w-full max-w-full xs:max-w-md rounded-none xs:rounded-xl")}>
      <CardHeader>
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