/**
 * lib/auth.ts
 *
 * This file sets up the authentication layer for the project using Better Auth.
 * 
 * Responsibilities:
 * - Configures and exports the `auth` object which centralizes authentication logic.
 * - Integrates with the Drizzle ORM via the drizzleAdapter for session, user, and account storage in PostgreSQL.
 * - Registers supported social providers (Google in this configuration).
 * - Sets up plugin(s) for server/serverless-side session and cookie management (Next.js integration).
 * - Reads runtime environment variables for credentials and base URL.
 *
 * Usage:
 * Import and use the exported `auth` object for secure authentication workflows, session management,
 * user identity access, and integration with both OAuth and database-backed login flows throughout the app.
 */
import { db } from "@/drizzle/db";
import { schema } from "@/drizzle/schema";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});
