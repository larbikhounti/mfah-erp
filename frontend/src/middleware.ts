import { NextResponse, type NextRequest } from "next/server";

/**
 * Serves the driver portal at the root of its own subdomain
 * (driver.<domain>, proxied by nginx to this same Next.js app): any path
 * not already under /driver is rewritten into it, so the staff dashboard
 * is unreachable from the driver host. Other hosts are untouched.
 */
const DRIVER_HOST_PREFIX = "driver.";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (!host.startsWith(DRIVER_HOST_PREFIX)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  if (pathname === "/driver" || pathname.startsWith("/driver/")) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/driver" : `/driver${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and static files (icons, manifest, service worker).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};
