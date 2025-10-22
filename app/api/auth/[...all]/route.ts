/**
 * API route for central authentication handler.
 * Role: Handles authentication without Arcjet to reduce bundle size.
 * TODO: Implement alternative security measures if needed.
 */

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

/** Next.js-compliant auth route handlers */
const authHandlers = toNextJsHandler(auth.handler);

export const { GET } = authHandlers;

/**
 * Handles POST auth requests.
 * TODO: Add alternative rate limiting/security if needed.
 */
export const POST = async (req: NextRequest) => {
  // Security validation temporarily disabled to reduce bundle size
  // TODO: Implement alternative security measures
  return authHandlers.POST(req);
};
