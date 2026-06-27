/**
 * Environment loader — MUST be the first import in index.js.
 *
 * On Vercel (production): env vars are injected by Vercel directly into
 * process.env, so dotenv is not needed and the file load is skipped silently.
 *
 * Locally: loads variables from the .env file next to index.js.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Only attempt to load .env when NOT on Vercel (i.e., local development)
if (!process.env.VERCEL) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(__dirname, "..", ".env");

  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.warn("[env] Warning: Could not load .env file:", result.error.message);
  } else {
    console.log("[env] Environment variables loaded from:", envPath);
  }
} else {
  console.log("[env] Running on Vercel — using injected environment variables.");
}
