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
| Fase 1 — Komentar & pesan error | 0 | 7 |
| Fase 2 — Skema Drizzle tunggal | 0 | 8 |
| Fase 3 — Rename & lebur global | 0 | 10 |
| Fase 3b — `lib/env.ts` | 0 | 2 |
| Fase 3c — Chrome ke root layout | 0 | 6 |
| Paket domain 1–8 | 0 | 55 |
| Fase 9 — Route groups & boundary | 0 | 6 |
| Fase 10 — Rename URL | 0 | 6 |
| Fase 11 — Route tipis & enforcement | 0 | 6 |
| **Total** | **21** | **127** |

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

- [ ] **1.1** Hapus komentar berbahasa Indonesia (±199 baris) — diff = deletions
- [ ] **1.2** Purge sisa komentar → target ~0; daftarkan komentar "why" 1-baris Inggris yang dipertahankan di deskripsi PR
- [ ] **1.3** Normalisasi 48 pesan error API Inggris → Indonesia (kecuali `Unauthorized`/`Forbidden` teknis); **status code tidak berubah**
- [ ] **1.3b** **Tulis ulang isi 6 file test dari kosong** (judul `it()`/`test()` → Inggris, komentar dihapus, helper dirapikan, struktur segar) dengan **case parity 1:1**: petakan tiap kasus lama → kasus baru; **jumlah test ≥50 sebelum & sesudah (turun = gagal batch)**; `verify:checkout` + `check:structure` tetap hijau
- [ ] **1.4** R1 (komentar Indonesia = error) & R8 (identifier Indonesia = error) aktif di `check:structure`
- [ ] **1.5** Verifikasi: tangga §8 + `check:structure`; konfirmasi diff komentar dominan deletions
- [ ] **1.6** Commit + `progress.md`

## Fase 2 — Satu sumber skema Drizzle (temuan #1)

- [ ] **2.1** Jalankan `check:schema-drift` → daftar 35 tabel kembar + selisih kolom; **jika ada selisih kolom: STOP, putuskan manual mana yang benar**
- [ ] **2.2** Tetapkan sumber kebenaran = `src/db/schema/` (sesuai `drizzle.config.ts`); catat di dokumen strategi
- [ ] **2.3** 13 tabel yang hanya ada di `src/modules/*` → pindah ke `src/db/schema/` (file per domain sesuai konvensi yang ada)
- [ ] **2.4** Redirect semua import skema → `@/db/schema` (tanpa `../`)
- [ ] **2.5** Hapus definisi duplikat di `src/modules/*`; file schema modul cukup re-export dari `@/db/schema` bila masih dibutuhkan
- [ ] **2.6** `npx drizzle-kit generate` **tidak** menghasilkan migrasi baru (definisi identik dengan migrasi yang ada)
- [ ] **2.7** `check:schema-drift` = 0 selisih; tangga §8 hijau
- [ ] **2.8** Commit

## Fase 3 — Rename & lebur global (D-1, D-2, D-14)

- [ ] **3.1** `git mv src/modules src/features` + rewrite 62 importer (satu commit mekanis)
- [ ] **3.2a** Lebur autentikasi: `shared/auth.ts` + `shared/auth/` + `shared/auth-server.ts` + `lib/auth-client.ts` → `src/lib/auth/` (`index.ts` publik; 39 importer `auth.ts`)
- [ ] **3.2b** Lebur `shared/db` → `lib/db` · `shared/errors` → `lib/errors` · `shared/utils` → `src/utils/` · `shared/types` → `src/types/`
- [ ] **3.2c** `shared/promo` → `features/promotion/` (diekspor via `index.ts`) · `shared/payment` → `features/payment/`; `src/shared/` **dihapus total**
- [ ] **3.3** Hook: `lib/hooks/useCheckout.js` → `features/checkout/hooks/use-checkout.ts` (rename kebab); `src/hooks` tetap untuk shared + rename `useNotifications.ts` → `use-notifications.ts`; folder `src/lib/hooks` dihapus
- [ ] **3.4** Rename nama outlier: `lib/Destination.js`→`destination.js`, `lib/Order.js`→`order.js`, `lib/formatRupiah.js`→`format-rupiah.ts` (konversi), `db/schema/private_trip.ts`→`private-trip.ts`
- [ ] **3.5** Test gaya bulletproof (D-18; peta tujuan: §5.7 dokumen strategi): `setup.ts` → **`src/testing/setup-tests.ts`** + update `test.setupFiles` di `vitest.config.mts` (hapus `src/__tests__/`); `src/__mocks__/` → **`src/testing/mocks/`** + update 7 path di `resolve.alias`; semua test pindah ke **subfolder `__tests__/`** di folder sumbernya (tujuan final — induk sudah pindah di 3.1–3.4); **update import test ke `@/`** (`promo-value.test.ts` masih pakai `../`); `npx vitest run` tetap 6 suite / 50 test hijau
- [ ] **3.6** Konversi `src/app/layout.jsx` → `layout.tsx` — **commit terpisah** dari rename
- [ ] **3.7** R7 aktif (`src/shared`, `src/lib/hooks` = error) + turunkan baseline ratchet R9 (catat angka baru di `progress.md`)
- [ ] **3.8** Tangga §8 hijau + `check:structure`; commit per langkah di atas

## Fase 3b — `lib/env.ts` (temuan #6)

- [ ] **3b.1** Kumpulkan ±15 akses `process.env` → `src/lib/env.ts` (baca + validasi + fallback), ubah seluruh pemakaian
- [ ] **3b.2** Tangga §8 + smoke login; **commit terpisah** dari Fase 3

## Fase 3c — Chrome global ke root layout (temuan #17, D-17)

- [ ] **3c.1** Buat `src/components/layout/SiteChrome.tsx` (client): render Navbar + Footer; daftar path tersembunyi: `/login`, `/register`, `/forbidden`, `/admin`, `/dashboard` (berbasis `usePathname`, prefix-safe — `/admin` ≠ `/administrator`)
- [ ] **3c.2** Root layout (`layout.tsx`, setelah task 3.6) render `<SiteChrome>{children}</SiteChrome>` — layout admin (`admin/layout.tsx`) tetap sendiri, tidak kena
- [ ] **3c.3** Hapus impor Navbar/Footer dari **11 halaman** + `components/private/SuccessState.jsx` (sekalian periksa & perbaiki render dobel di alur sukses private trip)
- [ ] **3c.4** WhatsAppFloat = **opsi A (dipilih, D-17)**: 5 path lama (`/`, `/blog` list saja, `/private`, `/trips` + detail) — tetap dirender `SiteChrome`, konfigurasi di satu tempat
- [ ] **3c.5** R10 aktif di `check:structure`: `Navbar`/`Footer`/`WhatsAppFloat` hanya boleh diimpor `SiteChrome`/file layout — grep lokal wajib 0
- [ ] **3c.6** Verifikasi: grep 0 impor per-halaman · `check:routes` manifest identik · **cek visual**: 11 halaman publik (Navbar+Footer muncul) · `login`/`register`/`forbidden` (tanpa chrome) · admin (sidebar sendiri) · WA di path sesuai opsi · commit

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

- [ ] **P1-①** `git mv` → `features/profile/components/` (`features/profile/` baru, UI-only; backend pakai modul `auth`/`referral` yang ada)
- [ ] **P1-②** Konversi 6 `.jsx` → `.tsx`
- [ ] **P1-③** Ekstrak `features/profile/api/` + hook (`useProfileStats`, `useReferralHistory`) + unit-test
- [ ] **P1-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P1-④** SSR minimal: `generateMetadata` halaman profil (authed, tanpa indeks)
- [ ] **P1-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + uji edit profil (login `user@otl.id`)
- [ ] **P1-⑥** PR digabung + `progress.md`

### Paket 2 — `checkout` (12 jsx + 2 page.jsx, 1363 baris)

- [ ] **P2-①** `git mv` → `features/checkout/components/` (termasuk `__tests__/PaymentStep.test.tsx`)
- [ ] **P2-②** Konversi 12 komponen + `checkout/page.jsx` + `checkout/pay/[id]/page.jsx` → `.tsx`
- [ ] **P2-③** `checkoutReducer(state, action)` murni (`SET_PAX`, `APPLY_VOUCHER`, `SET_CUSTOMER`, `SET_STEP`) + hook tipis + `features/checkout/api/` + unit-test reducer; **tulis ulang `PaymentStep.test.tsx`** (mock hook baru)
- [ ] **P2-③b** Clean code (§5.1): nama fungsi/variabel jelas · magic number → const bernama · early return · satu maksud per fungsi · error lewat `toPublicError` · komentar = 0 · **rombak struktur JSX (ekstrak subkomponen/flatten) selama markup/kelas/urutan/teks dirender identik**; perbaikan = commit refactor terpisah
- [ ] **P2-④** `npm run verify:checkout` hijau (jalur promo + BCA tetap benar)
- [ ] **P2-⑤** **Test akhir: `npx vitest run` hijau** + tangga §8 + ratchet R9 turun
- [ ] **P2-⑥** PR digabung + `progress.md`

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
