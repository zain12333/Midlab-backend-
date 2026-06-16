/**
 * This module MUST be the very first import in index.js.
 * It loads environment variables from .env before any other module
 * accesses process.env — required because ES module imports are hoisted.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn("[env] Warning: Could not load .env file:", result.error.message);
} else {
  console.log("[env] Environment variables loaded from:", envPath);
}
