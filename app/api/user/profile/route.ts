import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({error: "Unauthorized"}, {status: 401})

  const user = await db.user.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      id: true,
      name: true,
      username: true,
      role: true
    }
  })
  return NextResponse.json(user)
}