// Our schema for the database
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

/**
 * The User table defines the core user profile for Vloom.
 * 
 * - Each user is uniquely identified by `id`.
 * - Stores user name, email (which is unique), optional image, and verification status.
 * - `createdAt` and `updatedAt` indicate account lifecycle.
 * - Key relationships:
 *   - Referenced by other tables via `user_id` (e.g., session, account, videos).
 * 
 * Purpose: To represent application users and their authentication identity.
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * The Session table tracks each active user session (login/persistence).
 * 
 * - Each session is uniquely identified by `id` and `token`.
 * - Captures session expiration (`expiresAt`), creation, and update times.
 * - Records the IP address and user agent for the session.
 * - Key relationships:
 *   - `userId` references the User table, cascading on delete.
 * 
 * Purpose: To manage active/logged-in user sessions, enabling multi-device login/logout.
 */
export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

/**
 * The Account table abstracts federated auth providers and credentials for a user.
 * 
 * - Each record ties a user to an external auth provider (OAuth, email/password, etc).
 * - Stores provider identifiers, secret tokens, token expiration, and optional password hash.
 * - Records time of creation and update.
 * - Key relationships:
 *   - `userId` references the User table, cascading on delete.
 * 
 * Purpose: To allow users to connect multiple third-party accounts or credentials to their profile.
 */
export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * The Verification table supports email/token verification flows.
 * 
 * - Temporarily stores tokens/codes sent to users for email or credential verification.
 * - Has an expiration for each verification, along with timestamps.
 * - Not directly connected to other tables (holds temporary, magic-link or code verifications).
 * 
 * Purpose: To securely manage verification (sign-up, password reset, critical flows).
 */
export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

/**
 * The Videos table is central to Vloom's content system.
 * 
 * - Each video is uniquely identified by a UUID.
 * - Stores video metadata, URLs, associated user, and stats such as views and duration.
 * - The `userId` field forms a foreign key relationship to the User table.
 * - Visibility stores whether the video is "public" or "private".
 * - Created/updated timestamps support sorting and recency.
 * 
 * Purpose: To represent and manage all uploaded videos and their properties.
 */
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url").notNull(),
  videoId: text("video_id").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  visibility: text("visibility").$type<"public" | "private">().notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  views: integer("views").notNull().default(0),
  duration: integer("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Main schema object for Drizzle usage.
 * 
 * Contains all core tables, omitting `videos` for now if not needed for certain processes.
 */
export const schema = {
  user,
  session,
  account,
  verification,
};
