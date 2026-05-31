import { NextRequest, NextResponse } from "next/server";

const BYPASS_COOKIE = "y_vault_bypass";
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export function middleware(req: NextRequest) {
  if (process.env.MAINTENANCE_MODE !== "1") return NextResponse.next();

  const url = req.nextUrl;
  const pathname = url.pathname;

  if (pathname === "/maintenance") return NextResponse.next();

  const expectedToken = process.env.MAINTENANCE_BYPASS_TOKEN;
  const bypassParam = url.searchParams.get("bypass");

  if (bypassParam && expectedToken && bypassParam === expectedToken) {
    const clean = new URL(url);
    clean.searchParams.delete("bypass");
    const res = NextResponse.redirect(clean);
    res.cookies.set(BYPASS_COOKIE, expectedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: BYPASS_COOKIE_MAX_AGE,
    });
    return res;
  }

  const cookieVal = req.cookies.get(BYPASS_COOKIE)?.value;
  if (cookieVal && expectedToken && cookieVal === expectedToken) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, error: "service under maintenance" },
      { status: 503, headers: { "Cache-Control": "no-store", "Retry-After": "3600" } }
    );
  }

  const res = NextResponse.rewrite(new URL("/maintenance", url.origin));
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Retry-After", "3600");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|avif)).*)"],
};
