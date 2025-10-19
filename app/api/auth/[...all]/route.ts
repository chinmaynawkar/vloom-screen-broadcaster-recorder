/**
 * API route for central authentication handler.
 * Role: Enforces Arcjet security (email validation, rate limiting, shield)
 * to protect all auth-related API operations.
 * Arcjet blocks disposable/invalid emails and limits abuse.
 */

import aj, {
  ArcjetDecision,
  shield,
  slidingWindow,
  validateEmail,
} from "@/lib/arcjet";
import ip from "@arcjet/ip";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest } from "next/server";

/** Validates email (blocks disposable, invalid, and no MX records) */
const emailValidation = aj.withRule(
  validateEmail({
    mode: "LIVE",
    block: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
  })
);

/** Limits sign-in attempts (2 per 2 mins per fingerprint) */
const rateLimit = aj.withRule(
  slidingWindow({
    mode: "LIVE",
    interval: "2m",
    max: 2,
    characteristics: ["fingerprint"],
  })
);

/** Arcjet shield for generic protection (e.g. sign-out) */
const shieldValidation = aj.withRule(
  shield({
    mode: "LIVE",
  })
);

/**
 * Protects auth routes using Arcjet (email on sign-in,
 * rate limiting elsewhere, shield fallback).
 */
const protectedAuth = async (req: NextRequest): Promise<ArcjetDecision> => {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  let userId: string;
  if (session?.user.id) {
    userId = session.user.id;
  } else {
    userId = ip(req) || "127.0.0.1";
  }
  if (req.nextUrl.pathname.startsWith("/api/auth/sign-in")) {
    const body = await req.clone().json();
    if (typeof body.email === "string") {
      return emailValidation.protect(req, {
        email: body.email,
      });
    }
  }
  if (!req.nextUrl.pathname.startsWith("/api/auth/sign-out")) {
    return rateLimit.protect(req, {
      fingerprint: userId,
    });
  }
  return shieldValidation.protect(req);
};

/** Next.js-compliant auth route handlers */
const authHandlers = toNextJsHandler(auth.handler);

export const { GET } = authHandlers;

/**
 * Handles POST auth requests, denying on Arcjet failure.
 */
export const POST = async (req: NextRequest) => {
  const decision = await protectedAuth(req);
  if (decision.isDenied()) {
    if (decision.reason.isEmail()) {
      throw new Error("Email validation failed");
    }
    if (decision.reason.isRateLimit()) {
      throw new Error("Rate limit exceeded");
    }
    if (decision.reason.isShield()) {
      throw new Error("Shield validation failed");
    }
  }
  return authHandlers.POST(req);
};
