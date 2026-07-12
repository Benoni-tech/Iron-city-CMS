import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("icc_session")?.value

  if (!sessionCookie) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("next", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}