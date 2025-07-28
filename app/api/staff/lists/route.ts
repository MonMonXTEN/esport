import db from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? "1");
  const pageSize = Number(searchParams.get("size") ?? "10");
  const sortBy = searchParams.get("sortBy") ?? "name";
  const order = searchParams.get("order") ?? "asc";
  const skip = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    db.user.findMany({
      skip,
      take: pageSize,
      orderBy: { [sortBy]: order },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
      }
    }),
    db.user.count(),
  ]);

  return NextResponse.json({
    rows,
    total,
    page,
    pageSize,
  });
}