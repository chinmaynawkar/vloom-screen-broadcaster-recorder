/**
 * middleware.ts
 *
 * Role:
 *   - Enforces authentication for protected routes in the Next.js app.
 *   - Redirects unauthenticated users to the sign-in page.
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * Middleware function for session authentication.
 * Redirects unauthenticated users to /sign-in page.
 */
export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // This line defines which routes the middleware applies to 
  // using a negative lookahead regular expression.
  // The matcher protects all paths except those starting with 'api', 
  // '_next/static', '_next/image', 'favicon.ico', 'sign-in', or 'assets'.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};

// ⨯ [TypeError: Body is unusable: Body has already been read]
