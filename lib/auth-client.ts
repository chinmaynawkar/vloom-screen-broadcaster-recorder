/**
 * lib/auth-client.ts
 *
 * Role:
 *   - Exposes a client-side authentication helper for React components/pages using Better Auth.
 *   - Centralizes the creation of an `authClient` to handle login, logout, session access,
 *     and any other authentication-related interactions from the browser (client-side).
 *   - Automatically points to the base authentication API route, using NEXT_PUBLIC_BASE_URL,
 *     to facilitate secure and consistent auth workflows app-wide.
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, ''),
});
