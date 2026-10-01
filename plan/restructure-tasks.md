# Restructure — Checklist Eksekusi per Task

Strategi, alasan, dan keputusan (D-1…D-20): **`plan/restructure-bulletproof.md`**.  
File ini = daftar tugas yang dicentang saat selesai.

## Cara pakai

- `[ ]` belum · `[x]` selesai — **centang hanya setelah verifikasi di task itu hijau**, dengan commit/PR yang bisa ditelusuri.
- Tangga verifikasi standar: `npx tsc --noEmit` → `npm run lint` → `npx vitest run` → `npm run build` → `./init.sh` (+ `check-routes` / `check-schema-drift` bila relevan).
- Satu commit = satu jenis perubahan (§1 dokumen strategi). **Review = per fase/paket, bukan per task**: tiap selesai task/batch → commit; tiap **fase global** (0, 0.5, 1, 2, 3, 3b, 3c, 9, 10, 11) → **1 PR**; tiap **paket domain** (1–8) → **1 PR** (± 19 PR total untuk seluruh restructure); di dalam 1 PR commit tetap dipisah per jenis perubahan.
- Stop & revert bila `npm run build` merah di tengah batch.

## Persiapan — urutan eksekusi pertama

- [x] **P-1** Commit kedua dokumen plan (`plan/restructure-bulletproof.md` + `plan/restructure-tasks.md`) di branch **`docs/restructure-plan`** (dari `main`) → push → PR
- [x] **P-2** PR plan digabung ke `main` (PR #104 — `f967ae7`; PR #103 feat-080 sebelumnya `a5268af`)
- [x] **P-3** Buka branch **`restructure/fase-0`** dari `main` → mulai task 0.1 (`check-structure.ts`)

Catatan: PR #103 **sudah merge** (`a5268af`) — tak ada blocker antar-PR; `main` lokal **sudah di-sync** dengan origin (audit 30 Sep).
Pembagian kerja: langkah mekanis & verifikasi alat = agent + tangga §8; **verifikasi
visual per paket (⑤) = dev server, oleh Anda** — tanpa Playwright, mata = detektor terakhir.

## Progres

| Bagian | Selesai | Total |
|---|---|---|
| Persiapan (commit plan & buka cabang) | 3 | 3 |
| Fase 0 — Tools & baseline | 14 | 14 |
| Fase 0.5 — Boundary root | 4 | 4 |
| Fase 1 — Komentar & pesan error | 7 | 7 |
| Fase 2 — Skema Drizzle tunggal | 8 | 8 |
| Fase 3 — Rename & lebur global | 10 | 10 |
| Fase 3b — `lib/env.ts` | 2 | 2 |
| Fase 3c — Chrome ke root layout | 6 | 6 |
| Paket domain 1–8 | 14 | 55 |
| Fase 9 — Route groups & boundary | 0 | 6 |
| Fase 10 — Rename URL | 0 | 6 |
| Fase 11 — Route tipis & enforcement | 0 | 6 |
| **Total** | **68** | **127** |

---

## Fase 0 — Tools & baseline (risiko nol)

- [x] **0.1** `scripts/check-structure.ts` — aturan R1–R9 (§9 dokumen strategi) + npm script `check:structure`
- [x] **0.2** `scripts/check-routes.ts` — mode `--snapshot` & diff manifest `appPathRoutes` + mode crawl + npm script `check:routes`
- [x] **0.3** `scripts/check-schema-drift.ts` — deteksi `pgTable` kembar di `db/schema` vs `modules` + selisih kolom + npm script `check:schema-drift`
- [x] **0.4** Baseline: `npm run build` sukses pertama kali; simpan snapshot manifest rute (`npm run check:routes -- --snapshot`)
- [x] **0.5** Simpan baseline ratchet impor `../` = **82 (ukuran alat; angka plan 80 = audit awal — rinci: 81 `from` + 1 type-import, 73 ts/tsx + 8 js/jsx)** (dipakai R9; disimpan di `BASELINE` `scripts/check-structure.ts`, komit `25adfd7`)
- [x] **0.6** Audit dead code: `team-switcher.tsx`, `nav-user.tsx`, `nav-projects.tsx` — **bukti 0 pemakai (grep src+e2e) → dihapus** (komit `4e2f0aa`); `app-sidebar` & `nav-main` dipertahankan (dipakai admin & dashboard)
- [x] **0.6b** **Bersih-bersih artefak root (hasil audit folder)**: hapus `nul` + baris `nul` di `.gitignore`, `test.md` (0 byte), folder `anti-slop/` (kosong); `todo.md` → serap 2 idenya (Master Trip: max peserta & master meeting point) ke catatan lalu hapus; `jira-export.json` → arsip `docs/archive/` atau hapus; `migrate-schema.ts` → hapus bila migrasi `is_senior_friendly` sudah pernah jalan (cek riwayat) atau pindah `scripts/`; **rename package `temp-app` → `opentrip-lansia`**; catat di `progress.md`: `.agents/` `.commandcode/` = tooling pribadi, `uploads/` = data runtime (jangan disentuh); `plan/roadmap.md` **kosong (0 baris)** padahal dirujuk `README.md` + `overview.md` — isi ringkas urutan kerja atau hapus rujukannya; **commit terpisah**
- [x] **0.7** Audit `/api/meeting-points` (halaman admin memanggil route yang tak ada) — **putusan: buat backend di luar scope → `feat-102` (to_do)**; halaman = yatim tanpa nav; catat ke `progress.md` + `feature_list.json`
- [x] **0.8** Pasang ketiga `check-*` ke `package.json` **dan** `./init.sh` (check:routes kondisional — jalan bila manifest build ada; komit terpisah)
- [x] **0.9** Tools hijau di kondisi sekarang (daftar baseline tersimpan) — `./init.sh` EXIT 0 **(dikerjakan sebelum 0.8 agar wiring langsung hijau)**
- [x] **0.9b** **Migrasi runner test Jest → Vitest** (D-19; ikuti panduan resmi Next `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`): install `vitest` `@vitejs/plugin-react` `jsdom` `vite-tsconfig-paths` `@vitest/coverage-v8` (+ `@testing-library/dom` bila jadi peer) — **menggantikan 4 dep Jest**; buat `vitest.config.mts` (jsdom, `globals:true`, `setupFiles`, **`exclude: e2e`**, mock → `resolve.alias`, `@/*` via tsconfig-paths); port 6 suite (`jest.*` → `vi.*` ~19 panggilan, setup → `@testing-library/jest-dom/vitest`, hati-hati hoisting `vi.mock`); hapus `jest.config.cjs` + `tsconfig.jest.json` + dep `jest`/`ts-jest`/`jest-environment-jsdom`/`@types/jest`; script `test`/`test:watch`/`test:coverage` → vitest; `init.sh` → `npx vitest run --passWithNoTests`; **wajib: 6 suite / 50 test hijau + `./init.sh` EXIT 0** — ✅ komit `84281e4`: vitest di-pin ke lini **v4** (peer better-auth 1.6.23 hanya ^2–^4), `@types/node` ^20 → ^24 (mengikuti runtime Node 24); 9 mapper mock lama ternyata menunjuk `src/__mocks__` yang **tidak pernah ada** (dead, tak dipindah); `identity-obj-proxy` ikut dihapus (tak ada test yang import css); 6 suite / 50 test + `./init.sh` EXIT 0
- [x] **0.9c** **Upgrade better-auth 1.6.23 → 1.7.6** (D-20; support diverifikasi — peer next^16 / drizzle^0.45.2 ✓): baca changelog 1.7 penuh → audit `src/modules/auth.auth.config.ts` → `npx auth@latest generate` → **smoke login live** (admin `admin@otl.id` + user, dev server) → `npx vitest run` + `./init.sh` EXIT 0; **commit terpisah** — ✅ komit `5ddf2e2`: **backfill `Account.issuer` BATAL tidak perlu** — 1.7.3 memulihkan kompatibilitas DB 1.6 (identitas akun kembali `(providerId, accountId)`; kita tak pernah lewat 1.7.0–1.7.2, DB tanpa kolom `issuer`); `npx auth generate` membuktikan kolom 4 tabel **identik** (tak ada migrasi drizzle; index `*_userId_idx` + `$onUpdate` = saran opsional → backlog); validasi skema runtime 1.7.3 **lulus** (smoke: admin 200 + get-session 200, user 200, salah sandi 401, log bersih); build sempat gagal karena `.next/dev/types/validator.ts` **korup akibat taskkill di tengah write** — hapus folder itu lalu build hijau (quirk tooling, bukan upgrade)
- [x] **0.10** Catat baseline `npx vitest run --coverage` (informasi awal; coverage & jumlah test tidak boleh turun — §5.7) — ✅ 2026-09-30: **Statements 47.65% (274/575) · Branches 55.98% (215/384) · Functions 29.67% (46/155) · Lines 50.81% (250/492)**, exit 0 (tanpa threshold — patokan jangan-turun pasca-rewrite test 1.3b)
- [x] **0.11** Commit (pesan Inggris) + update `progress.md` — ✅ penutup Fase 0: 14/14, `./init.sh` EXIT 0, Session 44 lengkap di `progress.md`

## Fase 0.5 — Error & 404 root (D-12)

- [x] **0.5.1** `src/app/error.tsx` — client component, tombol `reset`, teks UI bahasa Indonesia — ✅ komit `1396b01`; **catatan Next 16**: prop boundary kini **`retry`** (stabil 16.3), `reset` tak lagi disarankan — tombol tetap aksi reset ("Coba Lagi"), tampil kode `error.digest` bila ada
- [x] **0.5.2** `src/app/not-found.tsx` — 404 custom + link ke beranda — ✅ komit `1396b01`
- [x] **0.5.3** `npm run build` sukses; curl URL tak dikenal → konten 404 custom tampil — ✅ prod: `/url-tak-dikenal-9f8g7` & `/definitely/not/route` → **HTTP 404** + konten kustom; `/blog/tidak-ada` → 200 (streamed `notFound()` — status sesuai perilaku Next); `./init.sh` EXIT 0
- [x] **0.5.4** Commit — ✅ `1396b01` (error.tsx + not-found.tsx + ignore `coverage/**` di eslint agar baseline 78 tetap); **blind spot R8**: wordlist kena prosa JSX (mask tak strip teks antar-tag) → copy UI ditulis tanpa kata terdaftar (R8 tetap 480); perbaikan mask → backlog Fase 11

## Fase 1 — Komentar & pesan error (D-4, D-5)

- [x] **1.1** Hapus komentar berbahasa Indonesia (±199 baris) — diff = deletions — ✅ R1 **250 → 0 baris**; bagian dari **488 blok** komentar dihapus (komit `2710199`, isi **107 file +26/−873**)
- [x] **1.2** Purge sisa komentar → target ~0; daftarkan komentar "why" 1-baris Inggris yang dipertahankan di deskripsi PR — ✅ **488 blok** (pass TypeScript AST 306 + pass scanner karakter sadar-string/template 182 + 2 manual di uploads route); **keep-list: 5 baris why-EN** (`eslint.config.mjs` ×2, `playwright.config.ts` ×1, `next.config.ts` ×1, `globals.css` ×1) **+ 7 direktif tool** (`eslint-disable/enable` — instruksi mesin, mengangkatnya mengubah perilaku lint) → daftar penuh di deskripsi PR; insiden: scanner sempat memotong baris regex `sanitize.ts` → tertangkap tsc, dipulihkan + aturan backslash ditambah
- [x] **1.3** Normalisasi 48 pesan error API Inggris → Indonesia (kecuali `Unauthorized`/`Forbidden` teknis); **status code tidak berubah** — ✅ komit `f13bc97`: temuan final **9 pesan murni Inggris (13 lokasi)** di `private-trip.controller/service` + `uploads/[...path]` + copy halaman private; `Unauthorized`/`Forbidden` tetap teknis; diff 4 file **14/14 baris**, status code tak tersentuh; (angka 48 = inventaris PRD lama, sebagian sudah ID sejak itu)
- [x] **1.3b** **Tulis ulang isi 6 file test dari kosong** (judul `it()`/`test()` → Inggris, komentar dihapus, helper dirapikan, struktur segar) dengan **case parity 1:1**: petakan tiap kasus lama → kasus baru; **jumlah test ≥50 sebelum & sesudah (turun = gagal batch)**; `verify:checkout` + `check:structure` tetap hijau — ✅ komit `83d3826`: paritas ketat per file **4/4/12/14/6/10 = 50 → 50**; judul Inggris, helper terdedup (`queueSelectResults`, `renderPaymentStep`+`stubAccountsFetch`), `toPublicError` dikelompokkan passthrough/redaction/fallback; **coverage identik baseline 0.10** (S 47.65 · B 55.98 · F 29.67 · L 50.81); `verify:checkout` exit 0
- [x] **1.4** R1 (komentar Indonesia = error) & R8 (identifier Indonesia = error) aktif di `check:structure` — ✅ baseline R1 **250 → 0** (`d6872bb`); **probe membuktikan keduanya gagal saat dilanggar**: komentar ID → R1 `1 vs 0 FAIL`; identifier `alamatDestinasiBaru` → R8 `481 vs 480 FAIL` (lalu probe dihapus, hijau lagi); legenda `FAIL` diparenthesis agar run hijau tak terbaca gagal (`9074bb0`)
- [x] **1.5** Verifikasi: tangga §8 + `check:structure`; konfirmasi diff komentar dominan deletions — ✅ tsc **0** · lint **0E/78W** · vitest **6/50** · coverage identik · `npm run build` **EXIT 0** · `check:routes` **96→96 identik** · `check:schema-drift` OK (4 known) · `verify:checkout` **exit 0** · `./init.sh` **EXIT 0**; diff `main...HEAD` = **110 file, +202/−1073** (deletions dominan ✓)
- [x] **1.6** Commit + `progress.md` — ✅ 5 komit (`2710199` `f13bc97` `83d3826` `d6872bb` `9074bb0`); Session 46 di `progress.md`

## Fase 2 — Satu sumber skema Drizzle (temuan #1)

- [x] **2.1** Jalankan `check:schema-drift` → daftar 35 tabel kembar + selisih kolom; **jika ada selisih kolom: STOP, putuskan manual mana yang benar** (4 drift diputuskan vs `information_schema` live → D-21)
- [x] **2.2** Tetapkan sumber kebenaran = `src/db/schema/` (sesuai `drizzle.config.ts`); catat di dokumen strategi (D-21 di §10)
- [x] **2.3** 13 tabel yang hanya ada di `src/modules/*` → pindah ke `src/db/schema/` (file per domain sesuai konvensi yang ada)
- [x] **2.4** Redirect semua import skema → `@/db/schema` (tanpa `../`) — 80 specifier di 51 file + 3 import `scripts/` manual
- [x] **2.5** Hapus definisi duplikat di `src/modules/*`; file schema modul cukup re-export dari `@/db/schema` bila masih dibutuhkan (12 file murni dihapus; contact/newsletter/notification = stub zod/consts + re-export)
- [x] **2.6** `npx drizzle-kit generate` **tidak** menghasilkan migrasi baru (definisi identik dengan migrasi yang ada) — 0 file `drizzle/` ditulis; jalannya mentok di prompt konflik nama pra-ada, identik dgn baseline sebelum perubahan (folder beku utuh)
- [x] **2.7** `check:schema-drift` = 0 selisih; tangga §8 hijau — 48/0/0/0 exit 0 · tsc 0 · lint 0E/78W · vitest 6/50 · build 0 · routes 96→96 · init 0 · verify:checkout 0 (KNOWN_DRIFT dikosongkan)
- [x] **2.8** Commit (465e47f docs · b54233b pindah · e30d9b8 redirect/hapus · 861ca08 drift-clear · komit docs sesi ini)

## Fase 3 — Rename & lebur global (D-1, D-2, D-14)

- [x] **3.1** `git mv src/modules src/features` + rewrite 62 importer (satu commit mekanis) — 66 specifier + string path api-policy + `check-schema-drift`
- [x] **3.2a** Lebur autentikasi: `shared/auth.ts` + `shared/auth/` + `shared/auth-server.ts` + `lib/auth-client.ts` → `src/lib/auth/` (`index.ts` publik; 39 importer `auth.ts`) — client tetap `lib/auth/client.ts` terpisah
- [x] **3.2b** Lebur `shared/db` → `lib/db` · `shared/errors` → `lib/errors` · `shared/utils` → `src/utils/` · `shared/types` → `src/types/` (114 file importer)`
- [x] **3.2c** `shared/promo` → `features/promotion/` (diekspor via `index.ts`) · `shared/payment` → `features/payment/`; `src/shared/` **dihapus total**
- [x] **3.3** Hook: `lib/hooks/useCheckout.js` → `features/checkout/hooks/use-checkout.ts` (rename kebab); `src/hooks` tetap untuk shared + rename `useNotifications.ts` → `use-notifications.ts`; folder `src/lib/hooks` dihapus (`@ts-nocheck` wajib baris-1; `../Order` → `@/lib/order` final di 3.4)
- [x] **3.4** Rename nama outlier: `lib/Destination.js`→`destination.js`, `lib/Order.js`→`order.js`, `lib/formatRupiah.js`→`format-rupiah.ts` (konversi + anotasi `(value: number)`), `db/schema/private_trip.ts`→`private-trip.ts` (nama tabel DB tak berubah)
- [x] **3.5** Test gaya bulletproof (D-18; peta tujuan: §5.7 dokumen strategi): `setup.ts` → **`src/testing/setup-tests.ts`** + update `test.setupFiles` di `vitest.config.mts` (hapus `src/__tests__/`); `src/__mocks__/` → **`src/testing/mocks/`** + update 7 path di `resolve.alias` (**vacuous: `__mocks__` tak pernah ada, tanpa alias di config**); semua test pindah ke **subfolder `__tests__/`** di folder sumbernya (tujuan final — induk sudah pindah di 3.1–3.4); **update import test ke `@/`** (`promo-value.test.ts` masih pakai `../`); `npx vitest run` tetap 6 suite / 50 test hijau
- [x] **3.6** Konversi `src/app/layout.jsx` → `layout.tsx` — **commit terpisah** dari rename (`Metadata` + `ReactNode` typed)
- [x] **3.7** R7 aktif (`src/shared`, `src/lib/hooks` = error) + turunkan baseline ratchet R9 (catat angka baru di `progress.md`) — R7 `[]`, R9 82→**43**, R2 refresh 91, R6→2, koreksi ukur R3 0→49
- [x] **3.8** Tangga §8 hijau + `check:structure`; commit per langkah di atas — tsc 0 · lint 0E/78W · vitest 6/50 · build 0 · routes 96→96 · drift 0 · structure 9/9 · init 0 · verify:checkout 0

## Fase 3b — `lib/env.ts` (temuan #6)

- [x] **3b.1** Kumpulkan ±15 akses `process.env` → `src/lib/env.ts` (baca + validasi + fallback), ubah seluruh pemakaian — 18 var / 28 situs / 12 file; `required()` untuk DATABASE_URL + BETTER_AUTH_SECRET, sisanya fallback identik
- [x] **3b.2** Tangga §8 + smoke login; **commit terpisah** dari Fase 3 — tsc 0 · lint 0E/78W · vitest 6/50 · build 0 · routes 96→96 · drift 0 · structure 9/9 · init 0 · login 200/401/200+session · verify:checkout 0

## Fase 3c — Chrome global ke root layout (temuan #17, D-17)

- [x] **3c.1** Buat `src/components/layout/SiteChrome.tsx` (client): render Navbar + Footer; daftar path tersembunyi: `/login`, `/register`, `/forbidden`, `/admin`, `/dashboard` (berbasis `usePathname`, prefix-safe — `/admin` ≠ `/administrator`)
- [x] **3c.2** Root layout (`layout.tsx`, setelah task 3.6) render `<SiteChrome>{children}</SiteChrome>` — layout admin (`admin/layout.tsx`) tetap sendiri, tidak kena
- [x] **3c.3** Hapus impor Navbar/Footer dari **11 halaman** + `components/private/SuccessState.jsx` (sekalian periksa & perbaiki render dobel di alur sukses private trip) — 65 baris (29 import + 36 tag); dobel navbar di success state hilang bersama impornya
- [x] **3c.4** WhatsAppFloat = **opsi A (dipilih, D-17)**: 5 path lama (`/`, `/blog` list saja, `/private`, `/trips` + detail) — tetap dirender `SiteChrome`, konfigurasi di satu tempat (exact `/`,`/blog`,`/private` + prefix `/trips`)
- [x] **3c.5** R10 aktif di `check:structure`: `Navbar`/`Footer`/`WhatsAppFloat` hanya boleh diimpor `SiteChrome`/file layout — grep lokal wajib 0 (probe: suntik import → FAIL 1 vs 0 → revert hijau)
- [x] **3c.6** Verifikasi: grep 0 impor per-halaman · `check:routes` manifest identik · **cek visual**: 11 halaman publik (Navbar+Footer muncul) · `login`/`register`/`forbidden` (tanpa chrome) · admin (sidebar sendiri) · WA di path sesuai opsi · commit — tsc 0 · lint 0E/78W · vitest 6/50 · build 0 · routes 96→96 · drift 0 · structure 10/10 · init 0 · curl `/` ada logo+Float · visual browser = user

---

## Loop paket domain (D-13)

Urutan wajib dalam tiap paket — **commit terpisah per langkah**:

1. **① Pindah** — `git mv` UI → `features/<f>/components/` + rewrite import (`../`→`@/`)
2. **② Konversi** — `.jsx` domain → `.tsx` (batch kecil, `tsc` tiap langkah)
3. **③ Ekstrak** — fetch → `features/<f>/api/`; state container per fitur (reducer/hook, §5.6) + unit-test logika murni; **unit lama yang ditulis ulang → test-nya ikut ditulis ulang di PR yang sama, jumlah test tidak turun (D-16)**
4. **③b Clean code** — poles kode yang tersentuh sesuai §5.1 (nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **boleh ekstrak subkomponen dari JSX panjang selama tag/kelas/urutan/teks dirender identik**); perbaikan = commit refactor terpisah
5. **④ SSR/SEO** — hanya domain publik: `generateMetadata`, `<Suspense>`, `React.cache()`; verifikasi curl tanpa JS
6. **⑤ Verifikasi** — tangga §8 (**`npx vitest run` wajib hijau di akhir setiap task domain**) + `check:structure` (ratchet R9 turun) + uji khusus domain + **cek visual cepat halaman yang disentuh di dev server** (tanpa Playwright — mata jadi detektor terakhir)
7. **⑥ PR** — satu paket = satu PR; `progress.md` diperbarui setelah merge

> **Batas rewrite:** struktur JSX **di kode** BOLEH dirombak di ③b (ekstrak subkomponen,
> flatten ternary, pecah halaman panjang jadi bagian-bagian) **selama tag/kelas/urutan/
> teks yang dirender identik** — itu bagian dari clean code. Yang TIDAK boleh tanpa
> persetujuan: tampilan di layar (markup/styling/urutan section/teks) = perubahan desain,
> verifikasi browser wajib per kasus. Wiring (import, tipe, ambil data, state) diubah di
> ①–③; halaman publik jadi Server Component di ④. Tabel lengkap: "Batas rewrite" §0 dokumen strategi.

### Paket 1 — `profile` (6 jsx, 560 baris) — memvalidasi pola

- [x] **P1-①** `git mv` → `features/profile/components/` (`features/profile/` baru, UI-only; backend pakai modul `auth`/`referral` yang ada)
- [x] **P1-②** Konversi 6 `.jsx` → `.tsx` (+`types.ts`, barrel `index.ts`; page impor barrel)
- [x] **P1-③** Ekstrak `features/profile/api/` + hook (`useProfileStats`, `useReferralHistory`) + unit-test (10 test baru: 7 api + 3 hooks)
- [x] **P1-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 (diterapkan: `DEFAULT_HISTORY_LIMIT`, `COPY_FEEDBACK_MS`, guard `copyCode`): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [x] **P1-④** SSR minimal: `generateMetadata` halaman profil (authed, tanpa indeks) — via `profile/layout.tsx` (page tetap client)
- [x] **P1-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + uji edit profil (login `user@otl.id`) — 8/60; baselines R2 85, R4−profile, R9 42; uji: sign-in + referral shape + `/profile` 200 (tanpa endpoint edit profil di scope)
- [x] **P1-⑥** PR digabung + `progress.md`

### Paket 2 — `checkout` (12 jsx + 2 page.jsx, 1363 baris)

- [x] **P2-①** `git mv` → `features/checkout/components/` (termasuk `__tests__/PaymentStep.test.tsx`)
- [x] **P2-②** Konversi 12 komponen + `checkout/page.jsx` + `checkout/pay/[id]/page.jsx` → `.tsx` (+`types.ts`: DestinationSummary, Participant, Customer, AppliedVoucher/Referral, CheckoutStep)
- [x] **P2-③** `checkoutReducer(state, action)` murni (`SET_PAX`, `APPLY_VOUCHER`, `SET_CUSTOMER`, `SET_STEP`) + hook tipis + `features/checkout/api/` + unit-test reducer; **tulis ulang `PaymentStep.test.tsx`** (mock hook baru) — reducer 26 aksi + `pricing.ts` + `api/client.ts` + `usePaymentAccounts` + barrel; 59 test baru (28 reducer + 12 pricing + 15 api + 4 paritas PaymentStep)
- [x] **P2-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah (diterapkan: `MIN_PAX`/`MAX_PAX`, hapus `console.error` ×2 + `showHealth` mati)
- [x] **P2-④** `npm run verify:checkout` hijau (jalur promo + BCA tetap benar) — exit 0 OK incl. kasus AEZAKMI max-discount
- [x] **P2-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + ratchet R9 turun — 11/115; R9 42→38, R2 85→71, R4 −checkout, R3 tetap 53, R8 tetap 480
- [x] **P2-⑥** PR digabung + `progress.md`

### Paket 3 — `my-trips` (7 jsx, 889 baris)

- [ ] **P3-①** `git mv` → `features/my-trips/components/`
- [ ] **P3-②** Konversi 7 `.jsx` → `.tsx`
- [ ] **P3-③** Ekstrak `api/` + hook (`useOpenTripBooking`, `useGalleryModal`)
- [ ] **P3-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P3-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + uji My Trips (lihat booking, buka galeri)
- [ ] **P3-⑥** PR digabung + `progress.md`

### Paket 4 — `private` (15 jsx, 1788 baris)

- [ ] **P4-①** `git mv` → `features/private-trip/components/` (sinkron modul `private-trip`); rename `components/private/helpers/helpers.js` sesuai isi (audit dulu)
- [ ] **P4-②** Konversi 15 `.jsx` + `private/page.jsx` → `.tsx`
- [ ] **P4-③** Wizard → `privateTripReducer` (aksi per langkah) + `api/` + unit-test reducer
- [ ] **P4-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P4-④** SSR/SEO: `generateMetadata` halaman `private-trip` (publik, lead form)
- [ ] **P4-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + submit form private trip end-to-end
- [ ] **P4-⑥** PR digabung + `progress.md`

### Paket 5 — `destinasi` → `features/trip` (18 jsx, 1364 baris) — SSR tertinggi

- [ ] **P5-①** `git mv` → `features/trip/components/`; **rename nama Indonesia/kapitalisasi**: `DestinasiHeader`→`DestinationListHeader` (⚠️ `DestinationHeader` sudah dipakai), `UlasanSection`→audit (mati? hapus : nama Inggris non-bentrok), `Emptystate`→`EmptyState`, `Resultsbar`→`ResultsBar`
- [ ] **P5-②** Konversi 18 `.jsx` + `trips/page.jsx` + `trips/[id]/page.jsx` → `.tsx`
- [ ] **P5-③** Ekstrak `api/` + `useTripFilter`; review/ulasan pakai `useOptimistic`
- [ ] **P5-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P5-④** SSR/SEO: `generateMetadata` `trips` & `trips/[id]` + `<Suspense>` (ulasan, galeri) + `React.cache()`; curl HTML: `<title>` & data ada tanpa JS
- [ ] **P5-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + crawl 10 URL trip utama
- [ ] **P5-⑥** PR digabung + `progress.md`

### Paket 6 — `blog` (2 `page.jsx` + hugerte)

- [ ] **P6-①** Pindahkan bagian non-route blog → `features/blog/components/` (wrapper wysiwyg hugerte)
- [ ] **P6-②** Konversi `blog/page.jsx` + `blog/[slug]/page.jsx` → `.tsx`
- [ ] **P6-③** Ekstrak `features/blog/api/` (komentar/related bila ada)
- [ ] **P6-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P6-④** SSR/SEO: `generateMetadata` `blog` & `blog/[slug]` (panggil repository server-side) + sanitasi konten tetap utuh
- [ ] **P6-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + curl `<title>` + render 3 postingan
- [ ] **P6-⑥** PR digabung + `progress.md`

### Paket 7 — `landing` (7 jsx, 1028 baris; `Subs` fan-in 8)

> **Keputusan (2026-09-30):** `src/lib/design-tokens.js` sudah **dilebur inline** ke `src/app/contact/page.jsx` (satu-satunya pemakai) lalu dihapus (R2 95→94). Sumber kebenaran token ke depan = **`globals.css`** — **jangan bikin modul token JS baru**.

- [ ] **P7-①** `git mv` → `features/landing/components/`; **`Subs` → `features/newsletter/components/`** (dipakai Footer + lintas halaman)
- [ ] **P7-②** Konversi 7 `.jsx` + halaman root (bila `.jsx`) → `.tsx`
- [ ] **P7-③** Ekstrak `api/` newsletter (`useNewsletter`) + landing sections
- [ ] **P7-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P7-④** SSR/SEO: `generateMetadata` halaman root/landing + cek Lighthouse-ish manual (title/description)
- [ ] **P7-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + submit newsletter dari Footer & landing
- [ ] **P7-⑥** PR digabung + `progress.md`

### Paket 8 — `admin` (18 halaman, sudah `.tsx`) — terbesar

- [ ] **P8-①** Buat `features/admin/`: `useAdminTable` (cari/filter/sort/pagination) + `useAdminCrud` (create/edit/delete + confirm) + `useConfirmDialog`
- [ ] **P8-②** Batch A (10 halaman): `blogs`, `galleries`, `horeca`, `vendors`, `meeting-points`, `notifications`, `commissions`, `promotions`, `referrals`, `reviews` → pakai hook generik, jadi konfigurasi tipis
- [ ] **P8-③** Batch B (4 halaman): `users`, `pesanan`, `private-trips`, `private-trips/[id]` → hook generik + pecah jadi `app/admin/_components/`
- [ ] **P8-④** Batch C (4 halaman raksasa): `trips` (912), `trips/[id]/groups` (837), `.../gallery` (421), `admin/page.tsx` → reducer + hook generik + komponen colocation
- [ ] **P8-④b** Clean code (§5.1) untuk seluruh 18 halaman: nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (pecah halaman raksasa jadi subkomponen) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P8-⑤** **Test akhir: `npx vitest run` hijau** + verifikasi CRUD manual semua batch (login `admin@otl.id`) + tangga §8
- [ ] **P8-⑥** PR digabung + `progress.md`

---

## Fase 9 — Route groups & boundary global (D-12)

- [ ] **9.1** `git mv` halaman ke route groups `(auth)` `(public)` `(account)` `(admin)` — **`check:routes`: manifest identik 100%**
- [ ] **9.2** `error.tsx` + `loading.tsx` + `not-found.tsx` per route group (root sudah dari Fase 0.5)
- [ ] **9.2b** Konvensi paling idiomatik: panggil `SiteChrome` dari layout `(public)`/`(account)` — `login`/`register` tanpa chrome **tanpa daftar path**; daftar sembunyi `usePathname` dihapus dari root layout; manifest tetap identik + cek visual ulang
- [ ] **9.3** `<ErrorBoundary>` reusable (±30 baris, kelas) dipasang di: hugerte (blog), map-picker, konten `dangerouslySetInnerHTML`
- [ ] **9.4** Pilot `<Activity>` pada 1 widget mahal (map/editor) — catat hasil eksperimen
- [ ] **9.5** Crawl semua URL → tanpa perubahan; tangga §8; commit/PR

## Fase 10 — Rename URL (D-3, risiko tertinggi)

- [ ] **10.1** Tambah `redirects()`: `/admin/pesanan`→`/admin/bookings` (301), `/dashboard`→`/admin`, `/private`→`/private-trip` (301)
- [ ] **10.2** Pindah halaman ke folder URL baru: `admin/bookings/`, hapus `dashboard/`, `private-trip/`
- [ ] **10.3** Update semua link internal (grep `"/admin/pesanan"`, `"/dashboard"`, `"/private"`) **+ spec e2e**: `git mv e2e/admin/pesanan.spec.ts` → `bookings.spec.ts` + `page.goto` → `/admin/bookings`, `private-trip.spec.ts` → `/private-trip`
- [ ] **10.4** Buktikan 0 link tersisa ke URL lama (grep + crawl)
- [ ] **10.5** Crawl: URL lama 301→200, URL baru 200, link internal 0 patah; `check:routes` selisih = **persis** daftar §4.2
- [ ] **10.6** PR digabung + `progress.md`

## Fase 11 — Route tipis & enforcement (temuan #3, #8)

- [ ] **11.1** 46 `route.ts` tebal → guard + controller (batch per domain; 12 route yang sudah delegating jadi referensi)
- [ ] **11.2** Putuskan `GET /api/trips/[id]/active-group` (0 konsumen): hapus + perbarui `api-policy` & audit, **atau** tetap — catat keputusannya di `progress.md`
- [ ] **11.3** `.jsx` habis → `allowJs: false` di `tsconfig.json`; R2 jadi error penuh
- [ ] **11.4** Enforcement penuh `check:structure` tanpa baseline; ratchet R9 = **0** `../`
- [ ] **11.5** `./init.sh` EXIT 0 + tangga lengkap + `npm run build` hijau
- [ ] **11.6** `progress.md` + `feature_list.json` final; tutup restructure (status dokumen FINAL → DONE)
