import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { BASE_URL } from "@/lib/env";

const ROOT = process.cwd();
const BUILD_MANIFEST = path.join(ROOT, ".next", "app-path-routes-manifest.json");
const SNAPSHOT_FILE = path.join(ROOT, "scripts", "baselines", "routes-snapshot.json");

type Manifest = Record<string, string>;

function loadManifest(): Manifest {
  if (!fs.existsSync(BUILD_MANIFEST)) {
    console.error("missing .next/app-path-routes-manifest.json — run `npm run build` first");
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(BUILD_MANIFEST, "utf8")) as Manifest;
}

function loadSnapshot(): Manifest {
  if (!fs.existsSync(SNAPSHOT_FILE)) {
    console.error("missing scripts/baselines/routes-snapshot.json — run `npm run check:routes -- --snapshot` after a build");
    process.exit(2);
  }
  return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, "utf8")) as Manifest;
}

function takeSnapshot(): void {
  const manifest = loadManifest();
  fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(manifest, null, 2) + "\n");
  const routes = [...new Set(Object.values(manifest))].sort();
  console.log(`snapshot written: scripts/baselines/routes-snapshot.json`);
  console.log(`${Object.keys(manifest).length} app paths, ${routes.length} distinct routes`);
}

function diffSnapshot(): void {
  const current = loadManifest();
  const snapshot = loadSnapshot();
  const curRoutes = new Set(Object.values(current));
  const snapRoutes = new Set(Object.values(snapshot));

  const addedPaths = Object.keys(current).filter((k) => !(k in snapshot));
  const removedPaths = Object.keys(snapshot).filter((k) => !(k in current));
  const changed = Object.keys(current).filter((k) => k in snapshot && current[k] !== snapshot[k]);
  const addedRoutes = [...curRoutes].filter((r) => !snapRoutes.has(r)).sort();
  const removedRoutes = [...snapRoutes].filter((r) => !curRoutes.has(r)).sort();

  console.log("check-routes — diff vs snapshot");
  console.log(`  app paths : ${Object.keys(snapshot).length} -> ${Object.keys(current).length}`);
  console.log(`  routes    : ${snapRoutes.size} -> ${curRoutes.size}`);

  if (addedPaths.length === 0 && removedPaths.length === 0 && changed.length === 0) {
    console.log("manifest identical — 0 differences");
    return;
  }

  console.log("");
  for (const r of addedRoutes) console.log(`  + ${r}`);
  for (const r of removedRoutes) console.log(`  - ${r}`);
  for (const k of changed) console.log(`  ~ ${k}: ${snapshot[k]} -> ${current[k]}`);
  console.log("");
  console.log(`${addedRoutes.length + removedRoutes.length + changed.length} difference(s)`);
  console.log("Fase 9: must be 0. Fase 10: must match the approved URL list (strategy §4.2)");
  process.exit(1);
}

async function crawl(baseUrl: string): Promise<void> {
  const manifest = loadSnapshot();
  const routes = [...new Set(Object.values(manifest))]
    .filter((r) => !r.includes("["))
    .sort();
  const skipped = [...new Set(Object.values(manifest))].filter((r) => r.includes("["));
  console.log(`crawl ${routes.length} static routes from ${baseUrl}`);
  console.log(`${skipped.length} dynamic routes skipped (test manually per packet)\n`);

  const bad: string[] = [];
  for (const route of routes) {
    let status = 0;
    try {
      const res = await fetch(baseUrl + route, { redirect: "follow" });
      status = res.status;
    } catch {
      status = -1;
    }
    const failed = status === 404 || status === -1;
    if (failed) bad.push(`${route} -> ${status === -1 ? "unreachable" : status}`);
    console.log(`  ${failed ? "FAIL" : "ok  "} ${String(status).padStart(3)} ${route}`);
  }

  console.log("");
  if (bad.length > 0) {
    console.log(`${bad.length} route(s) broken:`);
    for (const b of bad) console.log(`  ${b}`);
    process.exit(1);
  }
  console.log("all static routes reachable (no 404)");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--snapshot")) {
    takeSnapshot();
    return;
  }
  if (args.includes("--crawl")) {
    const idx = args.indexOf("--base");
    const base = idx >= 0 ? args[idx + 1] : BASE_URL;
    await crawl(base);
    return;
  }
  diffSnapshot();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
