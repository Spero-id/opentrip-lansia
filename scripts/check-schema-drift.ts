import fs from "node:fs";
import path from "node:path";

type TableDef = { table: string; file: string; cols: Set<string> };

const ROOT = process.cwd();
const SCHEMA_DIR = path.join(ROOT, "src", "db", "schema");
const MODULES_DIR = path.join(ROOT, "src", "modules");

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

function rel(p: string): string {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function extractTables(file: string): TableDef[] {
  const src = fs.readFileSync(file, "utf8");
  const out: TableDef[] = [];
  const defRe = /pgTable\s*\(\s*["']([^"']+)["']\s*,\s*\{/g;
  let m: RegExpExecArray | null;
  while ((m = defRe.exec(src)) !== null) {
    let i = defRe.lastIndex;
    let depth = 1;
    while (i < src.length && depth > 0) {
      const ch = src[i];
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      i++;
    }
    const body = src.slice(defRe.lastIndex, Math.max(defRe.lastIndex, i - 1));
    const cols = new Set<string>();
    const colRe = /^\s*([A-Za-z_$][\w$]*)\s*:/gm;
    let c: RegExpExecArray | null;
    while ((c = colRe.exec(body)) !== null) cols.add(c[1]);
    out.push({ table: m[1], file: rel(file), cols });
  }
  return out;
}

function main(): void {
  const files = [...walk(SCHEMA_DIR), ...walk(MODULES_DIR)].sort();
  const groups = new Map<string, TableDef[]>();
  for (const file of files) {
    for (const def of extractTables(file)) {
      const list = groups.get(def.table) || [];
      list.push(def);
      groups.set(def.table, list);
    }
  }

  const drift: string[] = [];
  const identical: string[] = [];
  const onlyModules: string[] = [];
  let total = 0;

  for (const [table, defs] of [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    total++;
    const inSchema = defs.some((d) => d.file.startsWith("src/db/schema/"));
    const inModules = defs.some((d) => d.file.startsWith("src/modules/"));
    if (!inSchema && inModules) {
      onlyModules.push(table);
      continue;
    }
    if (defs.length < 2) continue;

    const union = new Set<string>();
    for (const d of defs) for (const c of d.cols) union.add(c);
    const mismatched = defs.some((d) => d.cols.size !== union.size || [...union].some((c) => !d.cols.has(c)));
    if (!mismatched) {
      identical.push(table);
      continue;
    }
    drift.push(table);
    console.log(`DRIFT  ${table}`);
    for (const d of defs) {
      const missing = [...union].filter((c) => !d.cols.has(c)).sort();
      const extra = missing.length === 0 ? "" : `  missing: ${missing.join(", ")}`;
      console.log(`  ${d.file} (${d.cols.size} cols)${extra}`);
    }
  }

  console.log("");
  console.log(`tables found          : ${total}`);
  console.log(`identical duplicates  : ${identical.length} (dedupe in Fase 2)`);
  console.log(`only in src/modules   : ${onlyModules.length} (move to src/db/schema in Fase 2)`);
  if (onlyModules.length > 0) console.log(`  ${onlyModules.join(", ")}`);
  console.log(`column drift          : ${drift.length}`);

  if (drift.length > 0) {
    console.log("");
    console.log("FAIL — duplicated tables disagree; decide the source of truth manually (task 2.1)");
    process.exit(1);
  }
  console.log("OK — no column drift between duplicate definitions");
}

main();
