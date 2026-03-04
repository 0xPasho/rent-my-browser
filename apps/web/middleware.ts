import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "change-me-to-a-real-secret",
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("rmb_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-account-id", payload.accountId as string);
    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Invalid/expired token — clear cookie and redirect
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("rmb_session");
    return response;
  }
}

export const config = {
  matcher: "/dashboard/:path*",
};
