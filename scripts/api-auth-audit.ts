/**
 * Inventaris proteksi auth seluruh endpoint API.
 *
 * Jalankan: npx tsx scripts/api-auth-audit.ts   (atau: npm run audit:api)
 *
 * Pemindainya ada di src/shared/auth/api-auth-audit.ts dan kebijakannya di
 * src/shared/auth/api-policy.ts — keduanya juga dipakai oleh test
 * src/__tests__/api-auth-audit.test.ts supaya tak ada regresi.
 */
import { auditRoutes, isAllowedByPolicy } from "../src/shared/auth/api-auth-audit";

const rows = auditRoutes();
const violations = rows.filter((r) => !isAllowedByPolicy(r));
const downgraded = rows.filter((r) => {
  const rank = { public: 0, session: 1, admin: 2 } as const;
  return rank[r.level] < rank[r.required];
});

const count = (p: (r: (typeof rows)[number]) => boolean) => rows.filter(p).length;

console.log(`Total handler : ${rows.length}`);
console.log(`Public        : ${count((r) => r.required === "public")}`);
console.log(`Session       : ${count((r) => r.required === "session")}`);
console.log(`Admin         : ${count((r) => r.required === "admin")}`);
console.log(`Terlindungi   : ${count((r) => r.guarded)}`);
console.log(`Melanggar     : ${violations.length} | turun level: ${downgraded.length}\n`);

console.log("=== MELANGGAR KEBIJAKAN ===");
for (const r of violations) {
  console.log(`  ${r.route.padEnd(52)} required=${r.required} ${r.file}:${r.line}`);
}
if (violations.length === 0) console.log("  (tidak ada — semua endpoint terlindungi)");

console.log("\n=== PUBLIC BY DESIGN ===");
for (const r of rows.filter((r) => r.required === "public")) {
  console.log(`  ${r.route.padEnd(52)} ${r.guarded ? "(conditional admin)" : "(tanpa guard)"}`);
}

if (process.argv.includes("--md")) {
  console.log("\n=== MARKDOWN ===");
  console.log("| Route | Level | Required | File |");
  console.log("|---|---|---|---|");
  for (const r of rows) {
    console.log(`| \`${r.route}\` | ${r.level} | ${r.required} | ${r.file}:${r.line} |`);
  }
}
