import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl
  

  if (!req.auth && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (req.auth && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
  ],
}