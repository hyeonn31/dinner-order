import { cpSync, existsSync } from "node:fs";

if (existsSync("dist/public")) {
  cpSync("dist/public", "public", { recursive: true });
  console.log("Copied dist/public → public (for Vercel static assets)");
}
