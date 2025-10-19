/**
 * drizzle.config.ts
 * 
 * Purpose:
 *   - This configuration file sets up Drizzle Kit for managing database schema and migrations in the Vloom project.
 *   - It loads environment variables and specifies options for codegen, migrations, and database connection.
 * 
 * Configuration:
 *   - schema: Path to the TypeScript schema definitions for Drizzle ORM models (source of truth for DB structure).
 *   - out: Directory where Drizzle Kit writes generated migration files.
 *   - dialect: Specifies which database dialect Drizzle should target (here, PostgreSQL).
 *   - dbCredentials: Provides the database URL; here, it pulls the connection string from the environment variable `DATABASE_URL_POSTGRES`.
 */

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
config({ path: "./.env" });

export default defineConfig({
  schema: "./drizzle/schema.ts",       // Path to main DB schema definitions
  out: "./drizzle/migrations",         // Output directory for migration files
  dialect: "postgresql",               // SQL dialect for the project
  dbCredentials: {
    url: process.env.DATABASE_URL_POSTGRES!, // Connection string from .env for Postgres DB
  },
});
