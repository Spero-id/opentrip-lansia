import fs from "node:fs";
import path from "node:path";

type Baseline = {
  R1: number;
  R2: string[];
  R3: number;
  R4: string[];
  R5: string[];
  R6: string[];
  R7: string[];
  R8: number;
  R9: number;
  R10: number;
  R11: number;
};

const BASELINE: Baseline = {
  R1: 0,
  R2: [
    "src/app/blog/[slug]/page.jsx",
    "src/app/blog/page.jsx",
    "src/app/checkout/page.jsx",
    "src/app/checkout/pay/[id]/page.jsx",
    "src/app/contact/page.jsx",
    "src/app/login/page.jsx",
    "src/app/my-trips/page.jsx",
    "src/app/page.jsx",
    "src/app/private/page.jsx",
    "src/app/profile/page.jsx",
    "src/app/register/page.jsx",
    "src/app/trips/[id]/page.jsx",
    "src/app/trips/page.jsx",
    "src/components/checkout/BookingCard.jsx",
    "src/components/checkout/BookingSummary.jsx",
    "src/components/checkout/CustomerForm.jsx",
    "src/components/checkout/DetailsStep.jsx",
    "src/components/checkout/MeetingPointInfo.jsx",
    "src/components/checkout/ParticipantCard.jsx",
    "src/components/checkout/PaymentStep.jsx",
    "src/components/checkout/PriceBreakdown.jsx",
    "src/components/checkout/ReferralInput.jsx",
    "src/components/checkout/StepProgress.jsx",
    "src/components/checkout/TermsModal.jsx",
    "src/components/checkout/VoucherCard.jsx",
    "src/components/destinasi/DestinasiHeader.jsx",
    "src/components/destinasi/DestinationCard.jsx",
    "src/components/destinasi/DestinationGrid.jsx",
    "src/components/destinasi/Emptystate.jsx",
    "src/components/destinasi/FilterPanel.jsx",
    "src/components/destinasi/Resultsbar.jsx",
    "src/components/destinasi/SearchBar.jsx",
    "src/components/destinasi/detail/AboutSection.jsx",
    "src/components/destinasi/detail/AccessibilitySection.jsx",
    "src/components/destinasi/detail/BookingCard.jsx",
    "src/components/destinasi/detail/DestinationGallery.jsx",
    "src/components/destinasi/detail/DestinationHeader.jsx",
    "src/components/destinasi/detail/DestinationTabs.jsx",
    "src/components/destinasi/detail/ItinerarySection.jsx",
    "src/components/destinasi/detail/Lightbox.jsx",
    "src/components/destinasi/detail/ReviewsSection.jsx",
    "src/components/destinasi/detail/SectionHeading.jsx",
    "src/components/destinasi/detail/UlasanSection.jsx",
    "src/components/landing/DestinationSection.jsx",
    "src/components/landing/FAQSection.jsx",
    "src/components/landing/HeroSection.jsx",
    "src/components/landing/MarketingSection.jsx",
    "src/components/landing/Subs.jsx",
    "src/components/landing/TestimonialsSection.jsx",
    "src/components/landing/TutorialSection.jsx",
    "src/components/layout/Footer.jsx",
    "src/components/layout/MobileMenu.jsx",
    "src/components/layout/Navbar.jsx",
    "src/components/layout/WhatsAppFloat.jsx",
    "src/components/my-trips/EmptyState.jsx",
    "src/components/my-trips/FeedbackModal.jsx",
    "src/components/my-trips/GalleryModal.jsx",
    "src/components/my-trips/OpenTripBookingCard.jsx",
    "src/components/my-trips/ParsedPreferences.jsx",
    "src/components/my-trips/ProposalCard.jsx",
    "src/components/my-trips/RequestCard.jsx",
    "src/components/my-trips/constants.js",
    "src/components/private/BookingInformationSection.jsx",
    "src/components/private/DestinationCard.jsx",
    "src/components/private/DestinationModal.jsx",
    "src/components/private/FacilitiesSection.jsx",
    "src/components/private/Field.jsx",
    "src/components/private/PageHeader.jsx",
    "src/components/private/Radio.jsx",
    "src/components/private/SectionCard.jsx",
    "src/components/private/SelectedDestination.jsx",
    "src/components/private/SubmitBar.jsx",
    "src/components/private/SuccessState.jsx",
    "src/components/private/TermsModal.jsx",
    "src/components/private/TripDetailSection.jsx",
    "src/components/private/TripFromSection.jsx",
    "src/components/private/TripOptionSection.jsx",
    "src/components/private/helpers/constants.js",
    "src/components/private/helpers/helpers.js",
    "src/components/private/helpers/initialState.js",
    "src/components/private/helpers/validation.js",
    "src/lib/data.js",
    "src/lib/destination.js",
    "src/lib/format.js",
    "src/lib/order.js",
  ],
  R3: 53, // rename 3.1 exposed pre-existing @/modules deep imports as @/features deep; +4 client-safe deep (barrels mix server code)
  R4: [
    "app-sidebar.tsx",
    "checkout",
    "destinasi",
    "landing",
    "my-trips",
    "nav-main.tsx",
    "private",
  ],
  R5: [
    "src/app/api/admin/dashboard/route.ts",
    "src/app/api/admin/notifications/[id]/read/route.ts",
    "src/app/api/admin/notifications/read-all/route.ts",
    "src/app/api/admin/notifications/route.ts",
    "src/app/api/admin/site-settings/referral-bonus/route.ts",
    "src/app/api/admin/site-settings/route.ts",
    "src/app/api/blogs/[id]/route.ts",
    "src/app/api/blogs/route.ts",
    "src/app/api/bookings/[id]/route.ts",
    "src/app/api/checkout/route.ts",
    "src/app/api/checkout/validate-referral/route.ts",
    "src/app/api/commissions/[id]/route.ts",
    "src/app/api/commissions/route.ts",
    "src/app/api/destinations/categories/route.ts",
    "src/app/api/galleries/[id]/route.ts",
    "src/app/api/galleries/route.ts",
    "src/app/api/horeca-types/route.ts",
    "src/app/api/horeca/[id]/route.ts",
    "src/app/api/horeca/route.ts",
    "src/app/api/payments/[paymentId]/review/route.ts",
    "src/app/api/payments/accounts/route.ts",
    "src/app/api/payments/route.ts",
    "src/app/api/payments/upload/route.ts",
    "src/app/api/promotions/[id]/route.ts",
    "src/app/api/promotions/route.ts",
    "src/app/api/referrals/history/route.ts",
    "src/app/api/reviews/[id]/route.ts",
    "src/app/api/reviews/route.ts",
    "src/app/api/trips/[id]/active-group/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/activate/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/complete/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/gallery/media/[mediaId]/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/gallery/media/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/gallery/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/participants/route.ts",
    "src/app/api/trips/[id]/groups/[groupId]/route.ts",
    "src/app/api/trips/[id]/groups/route.ts",
    "src/app/api/upload/route.ts",
    "src/app/api/uploads/[...path]/route.ts",
    "src/app/api/user/referral/history/route.ts",
    "src/app/api/user/referral/route.ts",
    "src/app/api/users/[id]/route.ts",
    "src/app/api/users/route.ts",
    "src/app/api/vendor-types/route.ts",
    "src/app/api/vendors/[id]/route.ts",
    "src/app/api/vendors/route.ts",
  ],
  R6: [
    "src/app/admin/AdminShell.tsx",
    "src/components/private/helpers/initialState.js",
  ],
  R7: [],
  R8: 480,
  R9: 42,
  R10: 0,
  R11: 0,
};

const ID_COMMENT_WORDS = [
  "adalah", "agar", "akan", "atau", "bahkan", "bila", "bisa", "belum", "berikut",
  "contoh", "dalam", "dapat", "dari", "dengan", "digunakan", "guna", "gunakan",
  "hanya", "harus", "hasil", "hingga", "ini", "itu", "jika", "juga", "karena",
  "ketika", "khusus", "lalu", "lebih", "masing", "menggunakan", "misalnya", "pada",
  "paling", "sebagai", "sebelum", "sementara", "semua", "sendiri", "sesuai",
  "setelah", "seperti", "sehingga", "serta", "sudah", "supaya", "tersebut",
  "tidak", "untuk", "wajib", "walau", "walaupun", "yang", "yaitu",
];

const ID_IDENTIFIER_WORDS = new Set([
  "alamat", "baca", "batal", "biaya", "belum", "cari", "daftar", "destinasi",
  "dengan", "dihapus", "dipakai", "dipilih", "diperbarui", "disimpan", "ditambah",
  "dp", "fasilitas", "harga", "hapus", "jika", "jumlah", "karena", "kembali",
  "kelayakan", "keterangan", "kota", "lanjut", "masuk", "keluar", "metode",
  "nama", "pemesan", "pengguna", "penumpang", "peserta", "pesanan", "pilih",
  "rk", "rupiah", "selesai", "sisa", "simpan", "tanggal", "tamu", "tulis",
  "ubah", "untuk", "urutan", "ulasan", "wilayah", "yang",
]);

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx"]);
const DOTTED_KEBAB = /^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)*$/;
const PASCAL = /^[A-Z][A-Za-z0-9]*$/;
const PASCAL_TEST = /^[A-Z][A-Za-z0-9]*(\.(test|spec))?$/;
const ID_COMMENT_RE = new RegExp("\\b(?:" + ID_COMMENT_WORDS.join("|") + ")\\b", "i");
const TOKEN_RE = /[A-Za-z_$][A-Za-z0-9_$]*/g;
const FEATURE_DEEP_RE = /(?:from\s*|import\s*\(\s*|require\s*\(\s*)['"]@\/features\/[^'"]+\/[^'"]+['"]/g;
const REL_IMPORT_RE = /(?:from\s*|import\s*\(\s*|require\s*\(\s*)['"]\.\.\/[^'"]+['"]/g;
const CHROME_RE = /from\s*['"][^'"]*components\/layout\/(Navbar|Footer|WhatsAppFloat)['"]/;
const CONTROLLER_DELEGATE_RE = /from\s*['"][^'"]*\.controller['"]/
const LEGACY_DIRS = ["src/shared", "src/lib/hooks"];

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const MAX_SAMPLES = 5;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function rel(p: string): string {
  return path.relative(ROOT, p).split(path.sep).join("/");
}

function countNl(s: string): number {
  let n = 0;
  for (const ch of s) if (ch === "\n") n++;
  return n;
}

function lineAt(text: string, index: number): number {
  return countNl(text.slice(0, index)) + 1;
}

function mask(src: string): { code: string; comments: { text: string; line: number }[] } {
  const out = src.split("");
  const comments: { text: string; line: number }[] = [];
  let i = 0;
  let line = 1;
  const blank = (a: number, b: number) => {
    for (let k = a; k < b && k < out.length; k++) if (out[k] !== "\n") out[k] = " ";
  };
  while (i < src.length) {
    const c = src[i];
    if (c === "\n") {
      i++;
      line++;
      continue;
    }
    if (c === "/" && src[i + 1] === "/" && src[i - 1] !== ":") {
      const start = i;
      const startLine = line;
      while (i < src.length && src[i] !== "\n") i++;
      comments.push({ text: src.slice(start, i), line: startLine });
      blank(start, i);
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      const start = i;
      const startLine = line;
      i += 2;
      while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++;
      const end = i < src.length ? i + 2 : src.length;
      const text = src.slice(start, end);
      comments.push({ text, line: startLine });
      line += countNl(text);
      blank(start, end);
      i = end;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      const start = i;
      const quote = c;
      i++;
      while (i < src.length) {
        if (src[i] === "\\") {
          i += 2;
          continue;
        }
        if (src[i] === quote) {
          i++;
          break;
        }
        if (quote !== "`" && src[i] === "\n") break;
        i++;
      }
      const text = src.slice(start, i);
      line += countNl(text);
      blank(start, i);
      continue;
    }
    i++;
  }
  return { code: out.join(""), comments };
}

function idSegments(token: string): string[] {
  return token
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[_\s]+/)
    .map((s) => s.toLowerCase());
}

function isAllowedName(relPath: string, base: string): boolean {
  const segments = relPath.split("/");
  const inComponents = segments.includes("components") || segments.includes("_components");
  if (inComponents) return DOTTED_KEBAB.test(base) || PASCAL.test(base) || PASCAL_TEST.test(base);
  return DOTTED_KEBAB.test(base);
}

type RuleState = {
  id: keyof Baseline;
  title: string;
  current: number | string[];
  baseline: number | string[];
  samples: string[];
};

function main(): void {
  if (!fs.existsSync(SRC)) {
    console.error("src/ not found — run from repository root");
    process.exit(2);
  }

  const files = walk(SRC)
    .filter((p) => CODE_EXT.has(path.extname(p)))
    .sort();

  let r1 = 0;
  const r1Samples: string[] = [];
  const r2: string[] = [];
  let r3 = 0;
  const r3Samples: string[] = [];
  const r5: string[] = [];
  const r6: string[] = [];
  let r8 = 0;
  const r8Samples: string[] = [];
  let r9 = 0;
  const r9Samples: string[] = [];

  for (const p of files) {
    const r = rel(p);
    const ext = path.extname(p);
    const base = path.basename(p, ext);
    const src = fs.readFileSync(p, "utf8");
    const { code, comments } = mask(src);

    if (ext === ".jsx" || ext === ".js") r2.push(r);

    for (const c of comments) {
      const lines = c.text.split("\n");
      lines.forEach((text, idx) => {
        if (ID_COMMENT_RE.test(text)) {
          r1++;
          if (r1Samples.length < MAX_SAMPLES) r1Samples.push(`${r}:${c.line + idx}`);
        }
      });
    }

    const deep = [...src.matchAll(FEATURE_DEEP_RE)];
    r3 += deep.length;
    for (const m of deep) {
      if (r3Samples.length < MAX_SAMPLES) r3Samples.push(`${r}:${lineAt(src, m.index ?? 0)}`);
    }

    if (base === "route" && !CONTROLLER_DELEGATE_RE.test(src)) r5.push(r);
    if (!isAllowedName(r, base)) r6.push(r);

    const tokens = code.match(TOKEN_RE) || [];
    for (const tok of tokens) {
      if (idSegments(tok).some((seg) => ID_IDENTIFIER_WORDS.has(seg))) {
        r8++;
        if (r8Samples.length < MAX_SAMPLES) r8Samples.push(`${r}: ${tok}`);
      }
    }

    const relImports = [...src.matchAll(REL_IMPORT_RE)];
    r9 += relImports.length;
    for (const m of relImports) {
      if (r9Samples.length < MAX_SAMPLES) r9Samples.push(`${r}:${lineAt(src, m.index ?? 0)}`);
    }
  }

  const componentsDir = path.join(SRC, "components");
  const r4 = fs.existsSync(componentsDir)
    ? fs
        .readdirSync(componentsDir)
        .filter((n) => n !== "ui" && n !== "layout")
        .sort()
    : [];

  const r7 = LEGACY_DIRS.filter((d) => fs.existsSync(path.join(ROOT, d)));

  const r10Samples: string[] = [];
  for (const f of walk(SRC)) {
    const r = rel(f);
    if (!CODE_EXT.has(path.extname(f))) continue;
    if (r === "src/components/layout/SiteChrome.tsx") continue;
    if (/(^|\/)layout\.(tsx|jsx)$/.test(r)) continue;
    const src = fs.readFileSync(f, "utf8");
    const m = src.match(CHROME_RE);
    if (m) r10Samples.push(`${r}: ${m[0].slice(0, 60)}`);
  }
  const r10 = r10Samples.length;

  const ENV_SERVER = "src/lib/env.server.ts";
  const STATIC_IMPORT_RE = /(?:import|export)[^'"]*?from\s*["']([^"']+)["']/g;
  const importCache = new Map<string, string[]>();
  function resolveLocal(fromFile: string, spec: string): string | null {
    let base: string;
    if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
    else if (spec.startsWith(".")) base = path.resolve(path.dirname(fromFile), spec);
    else return null;
    const cands = [base, `${base}.ts`, `${base}.tsx`, `${base}.jsx`, `${base}.js`,
      path.join(base, "index.ts"), path.join(base, "index.tsx")];
    for (const c of cands) {
      try {
        if (fs.statSync(c).isFile()) return c;
      } catch {
        continue;
      }
    }
    return null;
  }
  function localImports(file: string): string[] {
    const hit = importCache.get(file);
    if (hit) return hit;
    const out: string[] = [];
    const text = fs.readFileSync(file, "utf8");
    STATIC_IMPORT_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = STATIC_IMPORT_RE.exec(text)) !== null) {
      const r = resolveLocal(file, m[1]);
      if (r) out.push(r);
    }
    importCache.set(file, out);
    return out;
  }
  const r11Samples: string[] = [];
  for (const f of walk(SRC)) {
    if (!CODE_EXT.has(path.extname(f))) continue;
    if (!fs.readFileSync(f, "utf8").slice(0, 200).includes('"use client"')) continue;
    const seen = new Set<string>([f]);
    const queue: string[] = [f];
    let bad = false;
    while (queue.length && !bad) {
      const cur = queue.shift() as string;
      for (const dep of localImports(cur)) {
        if (rel(dep) === ENV_SERVER) {
          bad = true;
          break;
        }
        if (!seen.has(dep)) {
          seen.add(dep);
          queue.push(dep);
        }
      }
    }
    if (bad) r11Samples.push(rel(f));
  }
  const r11 = r11Samples.length;

  const rules: RuleState[] = [
    { id: "R1", title: "Indonesian comment lines (target 0)", current: r1, baseline: BASELINE.R1, samples: r1Samples },
    { id: "R2", title: "legacy .jsx/.js files (ratchet)", current: r2, baseline: BASELINE.R2, samples: [] },
    { id: "R3", title: "deep @/features/*/* imports (target 0)", current: r3, baseline: BASELINE.R3, samples: r3Samples },
    { id: "R4", title: "src/components entries other than ui|layout", current: r4, baseline: BASELINE.R4, samples: [] },
    { id: "R5", title: "thick route.ts (no *.controller delegation)", current: r5, baseline: BASELINE.R5, samples: [] },
    { id: "R6", title: "misnamed files (kebab-case; components Pascal)", current: r6, baseline: BASELINE.R6, samples: [] },
    { id: "R7", title: "legacy dirs present (src/shared, src/lib/hooks)", current: r7, baseline: BASELINE.R7, samples: [] },
    { id: "R8", title: "Indonesian identifier segments", current: r8, baseline: BASELINE.R8, samples: r8Samples },
    { id: "R9", title: "relative ../ imports (ratchet)", current: r9, baseline: BASELINE.R9, samples: r9Samples },
    { id: "R10", title: "chrome imports outside SiteChrome/layout (target 0)", current: r10, baseline: BASELINE.R10, samples: r10Samples },
    { id: "R11", title: "client bundle reaches env.server (target 0)", current: r11, baseline: BASELINE.R11, samples: r11Samples },
  ];

  if (process.argv.includes("--print-baseline")) {
    const snapshot: Record<string, number | string[]> = {};
    for (const rule of rules) snapshot[rule.id] = rule.current;
    console.log(JSON.stringify(snapshot, null, 2));
    process.exit(0);
  }

  console.log("check-structure — rules R1-R11 (strategy §9)");
  console.log("(status FAIL = current above baseline; ratchet may only go down)\n");

  let failed = 0;
  for (const rule of rules) {
    if (typeof rule.current === "number" && typeof rule.baseline === "number") {
      const over = rule.current > rule.baseline;
      if (over) failed++;
      const status = over ? "FAIL" : rule.current < rule.baseline ? "ok (lower baseline)" : "ok";
      const pad = String(rule.current).padStart(4);
      console.log(`${rule.id}  ${rule.title.padEnd(50)} ${pad} vs ${String(rule.baseline).padStart(4)}  ${status}`);
      for (const s of rule.samples) console.log(`        ${s}`);
      if (rule.samples.length && over) console.log(`        ... (${rule.current} total)`);
    } else {
      const current = rule.current as string[];
      const baseline = rule.baseline as string[];
      const baseSet = new Set(baseline);
      const curSet = new Set(current);
      const added = current.filter((x) => !baseSet.has(x));
      const stale = baseline.filter((x) => !curSet.has(x));
      const over = added.length > 0;
      if (over) failed++;
      const status = over ? `FAIL new: ${added.length}` : "ok";
      const note = stale.length > 0 ? ` (stale baseline: ${stale.length})` : "";
      console.log(`${rule.id}  ${rule.title.padEnd(50)} ${String(current.length).padStart(4)} vs ${String(baseline.length).padStart(4)}  ${status}${note}`);
      for (const s of added.slice(0, MAX_SAMPLES)) console.log(`        + ${s}`);
      if (added.length > MAX_SAMPLES) console.log(`        ... (${added.length} new total)`);
    }
  }

  console.log("");
  if (failed > 0) {
    console.log(`${failed} rule(s) above baseline — fill BASELINE via --print-baseline (tasks 0.5 / 0.9)`);
    process.exit(1);
  }
  console.log("all rules within baseline");
}

main();
