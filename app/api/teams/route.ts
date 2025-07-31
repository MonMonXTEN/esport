import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const teams = await db.team.findMany({
    orderBy: { id: "asc" }
  })
  return NextResponse.json(teams)
}