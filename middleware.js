import { NextResponse } from "next/server";

/**
 * Optional password wall. Set BASIC_AUTH_USER and BASIC_AUTH_PASS in your
 * environment to lock the page to staff. Leave them blank and the page is open.
 */
export function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;
  if (!user || !pass) return NextResponse.next();

  const header = request.headers.get("authorization") || "";
  const [scheme, encoded] = header.split(" ");

  if (scheme === "Basic" && encoded) {
    const [u, p] = atob(encoded).split(":");
    if (u === user && p === pass) return NextResponse.next();
  }

  return new NextResponse("Staff only.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Caliente Reward Desk"' },
  });
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
