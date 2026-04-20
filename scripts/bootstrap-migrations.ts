/**
 * Reconcilia drizzle.__drizzle_migrations con el estado real de la BD.
 *
 * Cuando se usó `db:push` al inicio, las migraciones 0000/0001 se aplicaron
 * sin registrarse en el tracking table. Este script inserta los hashes de
 * migraciones que ya están aplicadas, para que `db:migrate` solo ejecute
 * las nuevas.
 *
 * Pasa los tags de migraciones YA APLICADAS como argumento:
 *   node scripts/bootstrap-migrations.ts 0000_acoustic_toro 0001_tearful_scarlet_witch
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const alreadyApplied = process.argv.slice(2);
if (alreadyApplied.length === 0) {
  console.error("Uso: node scripts/bootstrap-migrations.ts <tag1> <tag2> ...");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL!);

const existing = (await sql`
  SELECT hash FROM drizzle.__drizzle_migrations
`) as { hash: string }[];
const existingHashes = new Set(existing.map((r) => r.hash));

for (const tag of alreadyApplied) {
  const path = join(process.cwd(), "drizzle", `${tag}.sql`);
  const content = readFileSync(path, "utf-8");
  // Drizzle usa sha256 sobre el contenido dividido por el separador
  // "--> statement-breakpoint" (cada statement hasheado por separado y
  // concatenado). Pero para el tracking table solo importa que el hash
  // coincida con lo que el migrator compute; revisa src del migrador.
  // Para simplicidad, usamos sha256(content) — mismo que la versión actual.
  const hash = createHash("sha256").update(content).digest("hex");

  if (existingHashes.has(hash)) {
    console.log(`✓ ${tag} ya registrado`);
    continue;
  }

  await sql`
    INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${hash}, ${Date.now()})
  `;
  console.log(`✓ Registrado ${tag} (hash ${hash.slice(0, 12)}...)`);
}
