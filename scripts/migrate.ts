/**
 * Migrador con driver HTTP de Neon (el mismo que usa la app en runtime).
 * `drizzle-kit migrate` usa WebSocket y se cuelga con URLs pooled,
 * así que ejecutamos las migraciones explícitamente vía HTTP.
 *
 * Uso:  pnpm db:migrate
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL no está definido");
  }

  const sql = neon(url);
  const db = drizzle(sql);

  console.log("Aplicando migraciones desde ./drizzle ...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("✓ Migraciones aplicadas");
}

main().catch((err) => {
  console.error("Error aplicando migraciones:", err);
  process.exit(1);
});
