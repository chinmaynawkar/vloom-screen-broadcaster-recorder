/**
 * middleware.ts
 *
 * Role:
 *   - Enforces authentication, security, and bot detection for protected routes in the Next.js app.
 *   - Redirects unauthenticated users to the sign-in page.
 *   - Integrates Arcjet rules for shielding and bot detection.
 */

/** 
 * Import NextRequest and NextResponse for handling HTTP requests/responses in middleware.
 * Import headers utility to access request headers in a server environment.
 * Import Arcjet instance and helpers for middleware rules, bot detection, and shielding.
 * Import auth object to perform session retrieval and authentication checks.
 */
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import aj, { createMiddleware, detectBot, shield } from "./lib/arcjet";

/**
 * Top-level middleware function for session authentication.
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

/**
 * Compose Arcjet rules (shield and bot detection) for runtime request protection.
 */
const validate = aj
  .withRule(
    shield({
      mode: "LIVE",
    })
  )
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE", "G00G1E_CRAWLER"], // allow other bots if desired
    })
  );

/**
 * Export the composed middleware using Arcjet's createMiddleware helper.
 */
export default createMiddleware(validate);

export const config = {
  // This line defines which routes the middleware applies to 
  // using a negative lookahead regular expression.
  // The matcher protects all paths except those starting with 'api', 
  // '_next/static', '_next/image', 'favicon.ico', 'sign-in', or 'assets'.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};

// ⨯ [TypeError: Body is unusable: Body has already been read]
