# Restructure: Bulletproof-React Layout, Penamaan & Clean Code

Status: **DONE — 123/127 task selesai per 2026-10-02 (tersisa 11.6 = PR fase-11); siap eksekusi, mulai dari P-1 di `plan/restructure-tasks.md`**
Checklist eksekusi per task: **`plan/restructure-tasks.md`** (127 task, dicentang saat selesai)
Tanggal: 2026-09-30 · Terkait: `progress.md` (Session 44+), `feature_list.json`

---

## 0. Tujuan

Menyusun ulang struktur folder, penamaan, dan standar kode seolah proyek dimulai
dari awal — mengikuti pola repository layout bulletproof-react
(`alan2207/bulletproof-react`) yang disesuaikan dengan Next.js App Router
full-stack ini — **tanpa mengubah perilaku aplikasi dan tanpa memutus URL**.

Ukuran sukses:

1. Satu folder = satu konsep (`features/` berisi UI + logika + backend per fitur).
2. Tidak ada lagi tumpang-tindih (`lib` vs `shared` vs `hooks`; schema kembar).
3. Standar penamaan & bahasa berlaku seragam dan dikunci tooling.
4. Aplikasi tetap hijau di setiap batch: `./init.sh` EXIT 0 + `npm run build` sukses.

### Batas rewrite — apa yang disentuh, apa yang tidak

| Lapisan kode halaman/komponen | Direwrite? | Kapan |
|---|---|---|
| Struktur JSX **di kode** (ekstrak subkomponen, komposisi ulang, flatten ternary, pecah halaman raksasa) | ✅ **boleh** — selama tag, kelas, urutan, & teks yang dirender **identik** (refactor murni) | ③b / rewrite unit (D-15) |
| Tampilan di layar: markup, styling, urutan section, teks UI | ❌ **tidak** — itu perubahan desain, bukan clean code; butuh persetujuan + verifikasi browser per kasus | — |
| Path import | ✅ → `@/` (mekanis, tanpa ubah perilaku) | ① pindah |
| Tipe props (`.jsx` → `.tsx`) | ✅ tambah tipe saja, logika tetap | ② konversi |
| Ambil data `useEffect`+fetch (47 file / 104 panggilan) | ✅ **kode pindah** ke `api/` + hook; komponen tinggal panggil | ③ ekstrak |
| State lokal → reducer (checkout, wizard private, admin) | ✅ perilaku sama, struktur baru + unit-test | ③ ekstrak |
| Nama, magic number, early return, ukuran fungsi | ✅ poles — commit refactor terpisah | ③b clean code |
| Halaman publik → Server Component | ✅ **rewrite terbesar**: halaman jadi server + anak interaktif tetap client; data via repository | ④ SSR |
| Logika bisnis, response API, perilaku, URL, database | ❌ **tidak pernah** | — |

Jaminan anti-regresi: tiap jenis rewrite = **commit sendiri** (bisa direview & direvert
per langkah); tangga §8 + 50 unit test + `verify:checkout` + crawl `<title>` jaring
pengaman tiap paket.

## 1. Prinsip kerja

1. **Satu batch = satu jenis perubahan.** Pindah file ≠ rename ≠ ubah logika ≠
   hapus komentar. Digabung jadi satu commit hanya jika keduanya menyentuh file
   yang sama persis, dan tetap dipisah sebagai commit berurutan.
2. **`git mv` selalu** supaya history (`git log --follow`) terjaga; rollback =
   revert satu commit.
3. **Murni pemindahan** — beda diff minimal 90% rename; tanpa perubahan perilaku.
4. **Zona beku tidak disentuh** (lihat §2).
5. **Tanpa CI** → tangga verifikasi lokal wajib dijalankan tiap batch (lihat §8).
6. Berhenti dan revert apabila `npm run build` merah di tengah batch.
7. **Rewrite = per unit, bukan per proyek.** Mengganti seluruh kode sekaligus
   menghapus referensi perilaku (yang jadi spesifikasi tinggal 50 test) dan membuat
   diff tak bisa dibuktikan mekanis. Boleh menulis ulang satu komponen/hook/halaman
   dari nol **di dalam paket**, dengan syarat: file lama tetap jadi acuan ·
   tangga §8 + test + uji domain hijau · unit cukup kecil diverifikasi 1 sesi (D-15).

## 2. Zona risiko

| Zona | Isi | Risiko | Aturan |
|---|---|---|---|
| 🔴 Beku | `src/app/api/**` (58 URL) | 53 `fetch("/api/...")` = string literal, tak dicek `tsc` | jangan diubah; kunci juga di `api-policy.ts` (proxy + audit test) |
| 🔴 Beku | `src/proxy.ts` | matcher global auth (feat-080) — salah ubah = seluruh route salah proteksi | jangan diubah; terkait `api-policy.ts` + `npm run audit:api` |
| 🔴 Beku | Skema DB & data | migrasi = risiko nyata | sentuh hanya di Fase 2, setelah drift diverifikasi |
| 🟡 Hati-hati | URL halaman | link = string literal | hanya Fase 10, wajib `redirects()` + crawl |
| 🟢 Bebas | `src/components`, `src/lib`, `src/hooks`, `src/modules`, `src/shared` | import error ketahuan `tsc` detik | pindahan massal diperbolehkan |
| 🟢 Bebas (URL identik) | `src/app` via route group `(x)` & folder privat `_x` | nol | Fase 9 |

**Luar cakupan restructure (jangan disentuh, kecuali task eksplisit):** `public/`
(aset), `uploads/` (data runtime — bukti pembayaran dilayani `/api/uploads/[...path]`),
`drizzle/` (riwayat migrasi SQL), konfigurasi deploy (`vercel.json`,
`ecosystem.config.cjs`, `drizzle.config.ts`, `components.json`), `design.md`,
`docs/`, `README.md`, `session-handoff.md`. Tooling pribadi: `.agents/`,
`.commandcode/`, `.vscode/`.

## 3. Struktur target

```
src/
├── app/                          # ROUTING (App Router)
│   ├── (auth)/                   #   login, register, forbidden
│   ├── (public)/                 #   trips, blog, contact, checkout, private-trip
│   ├── (account)/                #   profile, my-trips
│   ├── (admin)/                  #   admin/* + _components/ (halaman gemuk)
│   ├── api/                      #   🔴 ZONA BEKU — 58 URL tak berubah
│   ├── layout.tsx, page.tsx      #   dari .jsx → .tsx; render SiteChrome (Navbar+Footer) — lihat Fase 3c
│   └── (tiap group)/ error.tsx, not-found.tsx, loading.tsx
├── features/                     # ← gabungan modules/ + components/<domain>/ + hooks
│   └── <fitur>/  index.ts        #   public API (larang import deep)
│                api/             #   fetch client — keluar dari komponen
│                components/      #   UI fitur (PascalCase)
│                hooks/           #   use-<fitur>.ts (kebab) — semua hook pindah ke sini
│                types.ts
│                *.schema / *.repository / *.service / *.controller
├── components/                   # shared dumb UI saja
│   ├── ui/                       #   shadcn (kebab — ikut upstream, jangan diubah)
│   └── layout/                   #   Navbar/Sidebar (fan-in 29)
├── lib/                          # tooling: auth-client, mail, db, errors, env, guards
├── utils/                        # pure fn: format-rupiah, sanitize, password, image-guard
├── hooks/                        # shared hooks: use-mobile, use-notifications
├── db/                           # schema + seed (lihat Fase 2)
├── testing/                      # infra test: setup-tests.ts, mocks (gaya bulletproof)
├── types/                        # ambient (.d.ts)
└── shared/                       # ❌ DIHAPUS — dilebur ke lib/ utils/ features/
```

Domain UI yang masuk `features/` — urutan paket (§7.1, ukuran + risiko naik):
`profile` → `checkout` → `my-trips` → `private` → `destinasi` (→ `features/trip/`)
→ `blog` → `landing` → `admin`.
`components/ui` dan `components/layout` **tetap** (shared); `landing/Subs`
(fan-in 8, dipakai lintas halaman) → `features/newsletter`.

## 4. Standar penamaan

### 4.1 File & folder

| Objek | Standar | Contoh | Catatan |
|---|---|---|---|
| Folder (semua) | kebab-case | `private-trips`, `my-trips` | sudah 99% rapi |
| Modul, util, schema, config, api | kebab-case | `promo-value.ts`, `api-policy.ts` | |
| Komponen fitur | PascalCase | `PaymentStep.tsx` | 70 file mayoritas — tidak diubah |
| `components/ui/*` | kebab (shadcn) | `sidebar.tsx` | dibiarkan, ikut upstream |
| Hook | `use-<nama>.ts` kebab (ikut bulletproof `use-disclosure`), 1 folder | `use-checkout.ts` (export tetap `useCheckout`) | 2 folder → 1 (`features/<f>/hooks`); `useNotifications` → `use-notifications` |
| Test | gaya bulletproof: `<dir>/__tests__/<nama>.test.ts` | `components/__tests__/login-form.test.tsx` | infra test → `src/testing/` (`setup-tests.ts`, `mocks/`); `src/__tests__` & `src/__mocks__` dihapus |
| Public API fitur | `index.ts` | `features/checkout/index.ts` | prinsip bulletproof |
| Tipe | `types.ts` per fitur | | ambient tetap `src/types/` |

Rename kecil wajib: `src/lib/Destination.js` & `Order.js` (Pascal) → kebab;
`formatRupiah.js` → `format-rupiah.ts`; `db/schema/private_trip.ts` (satu-satunya
snake_case) → `private-trip.ts`; `helpers/helpers.js` (nama = nama folder).

Nama komponen & spec (dikerjakan saat Paket 5 / Fase 10):

- `Emptystate` → `EmptyState` · `Resultsbar` → `ResultsBar` (kapitalisasi rusak;
  import di `DestinationGrid` sudah menulis benar — cukup rename file)
- `DestinasiHeader` → `DestinationListHeader` (⚠️ jangan `DestinationHeader` —
  sudah dipakai `detail/DestinationHeader`; 1 importer: `app/trips/page.jsx`)
- `UlasanSection` → audit dulu (pemakaian terakhir tidak terdeteksi — jika mati →
  hapus; jika hidup → nama Inggris non-bentrok, mis. `ReviewsListSection`)
- `e2e/admin/pesanan.spec.ts` → `bookings.spec.ts` (Fase 10, bersama URL-nya)
- `horeca` dibiarkan (istilah domain, konsisten dengan URL & API)

### 4.2 Nama halaman (URL) — KEPUTUSAN DISETUJUI

| Sekarang | Menjadi | Alasan | Mekanisme |
|---|---|---|---|
| `/admin/pesanan` | `/admin/bookings` | 1-satunya rute berbahasa Indonesia | `redirects()` 301 |
| `/dashboard` | **dihapus** | 0 link menunjuk (yatim) | `redirects()` → `/admin` |
| `/private` | `/private-trip` | ambigu; sinkron dgn domain `private-trip` | `redirects()` 301 |

Rute lain tidak diubah (setiap rename = hutang redirect selamanya).
API `/api/private-trip` vs `/api/private-trips` **tidak diubah** (zona beku).

### 4.3 Halaman Next (konvensi yang belum dipakai)

Kondisi: `error.tsx`, `not-found.tsx`, `loading.tsx` = **0**.

- **Fase 0.5 (ditarik ke depan):** `app/error.tsx` + `app/not-found.tsx` **root**
  saja — menambah file, tidak mengubah URL, nol risiko (lihat D-12).
- **Fase 9:** `error/not-found/loading.tsx` per route group + `<ErrorBoundary>`
  widget (perlu verifikasi perilaku fallback di browser → tidak ditarik).

### 4.4 Standar import (D-14)

1. **Alias tunggal `@/*` → `src/*`** (sudah ada di `tsconfig.json`; Next baca
   tsconfig; Vitest membaca via `vite-tsconfig-paths`) — semua import lintas-folder
   memakai `@/...`.
2. **Tidak menambah alias kategori** (`@features/`, `@components/`, …) — satu
   konsep satu ejaan; dua ejaan untuk file sama = ambigu.
3. **`./` hanya untuk folder yang sama; `../` dilarang.** Kondisi sekarang:
   80 pemakaian `../` di 31 file (terbanyak `db/schema/index.ts` 15 — habis
   otomatis di Fase 2; `../auth/auth.schema` — habis di Fase 3; sisanya
   dibersihkan per paket domain, langkah ①/②).
4. Enforcement `check-structure` **R9** dengan pola **ratchet**: baseline dihitung
   di Fase 0 → gagal jika naik → baseline diturunkan tiap berkurang → target 0 di
   Fase 11. Selama paket berjalan, rewrite `../` → `@/` dilakukan bersamaan
   dengan `git mv` (satu commit mekanis).

## 5. Standar kode

### 5.1 Clean code — TANPA KOMENTAR

Kondisi: **569 komentar** di `src/` (±199 baris berbahasa Indonesia).

Aturan:

1. **Default nol komentar.** Kode wajib bisa dibaca sendiri; kalau butuh komentar
   untuk menjelaskan, kode-nya yang harus dipecah jadi fungsi/const bernama.
2. Pengecualian tunggal: **komentar "why" non-obvious** (invariant, trade-off,
   batasan pihak ketiga) — maksimal 1 baris, bahasa Inggris. Tanpa "what/where".
3. JSDoc hanya untuk ekspor publik `features/<f>/index.ts`, 1 baris.
4. Nama panjang lebih baik dari pendek; fungsi satu maksud; magic number jadi
   const bernama; early return; error lewat `toPublicError` (tanpa teks duplikat).
5. Komentar naratif & berbahasa Indonesia **dihapus semua** pada Fase 1.

Enforcement (`check-structure.ts`): baris komentar yang mengandung kata sinyal
Bahasa Indonesia → error (target 0).

### 5.2 Bahasa — KONSISTEN BAHASA INGGRIS

| Permukaan | Bahasa | Status |
|---|---|---|
| Identifier (fungsi/variabel) | Inggris | ✅ sudah (`formatRupiah` = istilah mata uang, sah) |
| Komentar | Inggris (dan target nol) | ❌ 569 → dibersihkan Fase 1 |
| Log server | Inggris | ✅ sudah |
| Nama file/folder | Inggris kebab | ✅ sudah (kecuali daftar §4.1) |
| Pesan error API | **Indonesia** (muncul di toast user) — D-4 ✅ | ⚠️ 99 ID / 48 EN → dinormalkan Fase 1 (kecuali `Unauthorized`/`Forbidden` tetap teknis) |
| Teks UI (JSX) | **Indonesia** (produk untuk lansia Indonesia) | ✅ tidak diubah |
| Dokumen proyek (`docs/`, `plan/`, `progress.md`) | **Indonesia** | ✅ tidak diubah |
| Commit message & PR | Inggris | ⚠️ sebagian masih Indonesia |

### 5.3 Hal yang TIDAK diubah

- Teks UI & PRD berbahasa Indonesia (keputusan produk, bukan teknis).
- Skema DB, alur auth, URL API, 70 komponen PascalCase, `components/ui` shadcn.

### 5.4 Modern React (React 19.2 — sudah terpasang)

Kondisi: `use`/`useTransition`/`useDeferredValue`/`useOptimistic`/`useActionState`/
`useFormStatus`/`Activity` = **0 pemakaian**; `componentDidCatch` = 0; pola lama
`useEffect`+`fetch` = 47 file / 104 panggilan.

| API | Nilai untuk repo ini | Fase |
|---|---|---|
| `error.tsx` (error boundary per segmen) | Saat ini **0 boundary** + ada `dangerouslySetInnerHTML` (blog), hugerte, map-picker → 1 crash = halaman mati | 0.5 (root), 9 (per group) |
| `<ErrorBoundary>` kelas reusable (±30 baris, tanpa dep) | Isolasi widget pihak ketiga (wysiwyg, map, konten blog) — perlu verifikasi browser | 9 |
| `<Suspense>` partial + `loading.tsx` | Streaming HTML: skeleton per bagian (ulasan, galeri) di halaman publik | ④ paket 5 · Fase 9 |
| `React.cache()` | Dedup pemanggilan repository antara page & `generateMetadata` | ④ paket 5–7 |
| `use(promise)` | Anak komponen klien baca data dari Server Component tanpa `useEffect`+`fetch` | ④ paket 5–7 |
| `useFormStatus` (react-dom) | Tombol "Memproses…" checkout/kontak/newsletter tanpa `useState(isSubmitting)` manual | ③–④ (paket 2, 7) |
| `useDeferredValue` + `useTransition` | Filter pencarian `FilterPanel` & tabel admin tidak memblokir UI | ④ paket 5 & 8 |
| `useOptimistic` | Voucher/counter pax & notifikasi "tandai dibaca" langsung responsif | ③ paket 2 · paket 8 |
| `<Activity>` | Sembunyikan subtree tanpa unmount — pilot untuk widget mahal (map-picker, editor) | 9–11 (eksperimen) |
| React Compiler | Auto-memo; **butuh 1 dependency baru** → lihat D-8 | tertunda |

Urutan penting: ekstrak fetch dulu (langkah ③ tiap paket), baru ganti pola ambil
data dengan `use()`/RSC (langkah ④, sesudah ③) — jangan dibalik, agar tiap batch
tetap bisa dibatalkan.
Yang TIDAK diadopsi: server actions menggantikan API route (D-7), `<Profiler>`,
overhaul seluruh form ke `useActionState` sebelum layout stabil.

Keduanya kini berjalan **di dalam tiap paket domain** (§7.1): ③ekstrak → ④SSR.

### 5.5 State management — prinsip Flux, tanpa library Flux

Kondisi: `useState` 68 file · `useReducer` **0** · `createContext` 1 (sidebar)
· library state tidak ada · `useCheckout.js` (524 baris, 28 setState/ref/callback)
= "store" tak resmi satu-satunya.

Keputusan (D-10):

1. **Tidak memakai library Flux/Redux/Zustand sekarang** — data aplikasi hidup di
   Postgres; store client berisi salinan data server = risiko drift (paralel
   dengan temuan #1: 35 tabel didefinisikan 2×).
2. **Mengadopsi prinsip Flux lewat `useReducer`** — Paket 2 (langkah ③) mengubah
   `useCheckout` menjadi `checkoutReducer(state, action)` murni
   (`SET_PAX`, `APPLY_VOUCHER`, `SET_CUSTOMER`, `SET_STEP`) + hook tipis;
   view → dispatch → reducer → state, satu arah by construction, unit-testable.
3. **Gerbang evaluasi:** bila nanti ada kebutuhan state client lintas-rute
   nyata (realtime, draft offline, panel admin terpisah) → evaluasi Zustand
   dengan bukti kebutuhan. Tanpa kebutuhan: tidak ditambah.

### 5.6 State container per UI ("hook seperti useCheckout, tapi benar")

Kondisi: komponen publik relatif sehat (10/86 campur fetch+state), tetapi
**18/18 halaman admin berat** (912/837/606 baris, 14–18 `useState`, 4–8 `fetch`).
`useCheckout` lama (524 baris, 28 setter, fetch+logika+navigasi tercampur) =
anti-pattern versi lama — yang ditiru **ide**-nya (fitur punya wadah state
sendiri), bukan implementasinya.

Pola target — satu fitur punya wadah state sendiri:

```
features/<fitur>/
├── hooks/use-<fitur>.ts      # state container tipis: useReducer + selectors
├── <fitur>.reducer.ts        # murni → unit-test
├── api/<fitur>-api.ts        # semua fetch
└── components/*.tsx          # dumb: render + dispatch saja
```

Tiga aturan batas:

1. **Ekstrak kalau sudah bayar** — wajib punya hook jika ada logika selain setter,
   dipakai >1 komponen, atau halaman ratusan baris. State 3 baris tetap `useState`.
2. **State server bukan milik hook UI** — hook memanggil `api/`, bukan jadi cache;
   mencegah salinan data ganda (paralel temuan #1).
3. **Deteksi pengulangan dulu** — 18 halaman admin = 1 pola → **2–3 hook generik**
   (`useAdminTable`, `useAdminCrud`, `useConfirmDialog`) + konfigurasi tipis,
   bukan 18 hook khusus.

Target inventaris **±10–12 hook** (bukan 86): checkout, admin generik ×2–3,
`useTripFilter`, my-trips ×3, referral ×2, newsletter, notifikasi (pindah).
`features/admin/` baru (UI-only feature) = rumah hook generik admin.
Ekstrak hook = **prasyarat** memecah halaman admin raksasa (Fase 11).

### 5.7 Test — ikut unit, ikut URL, tidak pernah turun

Kondisi: **6 suite / 50 test** unit (promo 6 · payment 14 · error 12 · audit API 10 ·
booking service 4 · PaymentStep 4) + **19 spec / 68 test** e2e Playwright (tak dijalankan
lokal di mesin 8GB — tetap dipelihara sebagai spesifikasi perilaku).

Aturan:

1. **Test = bagian dari unit (D-16)** — unit ditulis ulang → test-nya ikut ditulis
   ulang di PR yang sama; unit baru (reducer/hook/api) wajib punya test sejak lahir
   (langkah ③ paket).
2. **Test pindah bersama kodenya** — colocation (Fase 3.5) + import `@/`
   (`promo-value.test.ts` masih pakai `../` = pelanggar R9 pertama).
3. **Jumlah test tidak pernah turun** (tangga §8); tiap paket menambah test reducer/
   hook baru → coverage baseline dicatat di Fase 0.10 dan tidak boleh turun.
4. **e2e spec = spesifikasi perilaku** — di-update saat URL berubah (Fase 10:
   `/admin/pesanan`, `/private`) dan saat perilaku berubah secara disengaja.
5. Mock tetap di `src/testing/mocks/` (path `resolve.alias` di `vitest.config.mts`; gaya bulletproof) — **tidak** ganti library test lagi.
6. **Rewrite test = tingkat file, bukan tingkat kasus** (keputusan 2026-09-30): keenam
   file test **boleh ditulis ulang dari kosong** (judul Inggris, tanpa komentar, helper
   rapi — Fase 1.3b) **asal case parity 1:1** — setiap kasus regresi lama (bug dashboard
   HTTP 500, fix BCA, parser promo, kebijakan auth) wajib punya pengganti; jumlah test
   tidak pernah turun. Yang dilarang: membuang kasus/intent regresi.

**Peta lokasi test** — gaya bulletproof-react (D-18): test selalu di subfolder
`__tests__/` milik folder sumbernya; dijalankan di Fase 3.5 + P2 (saat Fase 3.5
induk sudah di tempat final, jadi sekali jalan). Vitest me-resolve `@/*` via
`vite-tsconfig-paths` dari tsconfig; mock modul via `resolve.alias` — kebal
pindahan dalam `src/`:

| Test sekarang | Lokasi target | Task |
|---|---|---|
| `__tests__/api-auth-audit.test.ts` | `lib/auth/__tests__/api-auth-audit.test.ts` | 3.5 |
| `modules/booking/dashboard.service.test.ts` | `features/booking/__tests__/dashboard.service.test.ts` | 3.5 |
| `shared/errors/to-public-error.test.ts` | `lib/errors/__tests__/to-public-error.test.ts` | 3.5 |
| `shared/payment/payment-account.test.ts` | `features/payment/__tests__/payment-account.test.ts` | 3.5 |
| `shared/promo/promo-value.test.ts` | `features/promotion/__tests__/promo-value.test.ts` | 3.5 |
| `components/checkout/PaymentStep.test.tsx` | `components/checkout/__tests__/PaymentStep.test.tsx` → ikut P2-① ke `features/checkout/components/__tests__/` | 3.5 + P2-① |
| test baru reducer/hook/api | `features/<f>/__tests__/<f>.reducer.test.ts`, `<dir>/hooks/__tests__/use-*.test.ts(x)`, `<dir>/api/__tests__/*.test.ts` | ③ paket |
| `src/__mocks__/` (7 mock) | `src/testing/mocks/` + update path di `resolve.alias` | 3.5 |
| `e2e/` (19 spec) | **tetap** `e2e/<area>/` — ekstensi `e2e/tests/` bulletproof (19 spec vs 2, dikelompok area; tinjau bila bermasalah) | — |
| `__tests__/setup.ts` | `src/testing/setup-tests.ts` (gaya bulletproof) + update `test.setupFiles` di `vitest.config.mts`; `src/__tests__` dihapus | 3.5 |

**Runner: Vitest + jsdom** — menggantikan Jest di Fase 0.9b sesuai panduan resmi
Next (`01-app/02-guides/testing/vitest.md`) sekaligus standar bulletproof (D-19);
helper render/data kelak menempati `src/testing/` (setara
`test-utils.tsx` / `data-generators.ts` milik bulletproof).

## 6. Inventaris temuan (hasil audit 2026-09-30)

| # | Temuan | Bukti | Fase |
|---|---|---|---|
| 1 | **Skema Drizzle kembar** | 35 tabel didefinisikan 2× (`db/schema` vs `modules`); 13 tabel hanya di modules; `drizzle.config` baca `db/schema/index.ts` saja | 2 |
| 2 | **SSR/SEO lemah** | 30/33 page `"use client"`, `generateMetadata` 0 | ④ paket 5–7 |
| 3 | **Route tebal** | 46/58 `route.ts` inline logic, 12 delegasi controller | 11 |
| 4 | Konvensi Next tak dipakai | `error/not-found/loading.tsx` = 0 | 0.5 & 9 |
| 5 | Sisa template shadcn | `team-switcher`, `nav-user`, `nav-projects` ≈ 0 pemakai (wajib verifikasi) | 0 (audit) |
| 6 | `process.env` tersebar | ±15 akses langsung (`SMTP_PASS`, `DATABASE_URL`) | 3 |
| 7 | `/api/meeting-points` tak ada | admin/meeting-points memanggil route yang tidak ada | 0 (audit) |
| 8 | Endpoint mati | `GET /api/trips/[id]/active-group` 0 konsumen | 11 |
| 9 | Halaman yatim | `/dashboard` 0 link | 10 |
| 10 | 2 folder hook, 2 gaya nama | `hooks/use-mobile` vs `hooks/useNotifications` vs `lib/hooks/useCheckout` | 3 |
| 11 | Bentrok `shared/auth.ts` vs `shared/auth/` | 39 vs 3 importer | 3 |
| 12 | 2 lokasi test | `__tests__/` vs colocated | 3 |
| 13 | **0 error boundary** | `componentDidCatch`=0 + `dangerouslySetInnerHTML` di blog, hugerte, map-picker | 0.5 & 9 |
| 14 | API React 19 belum dipakai | `use`/`Suspense`/`useTransition`/`useFormStatus`/`Activity` ≈ 0; pola lama 47 file/104 fetch | ④ paket & 9 |
| 15 | Tanpa pola reducer | `useReducer` = 0; `useCheckout.js` (524 baris) jadi "store" tak resmi | paket 2/4/8 |
| 16 | Komponen lintas domain | `landing/Subs` fan-in 8 (dipakai lintas halaman); UI blog menempel di `app/blog/*.jsx`; 18 halaman admin = 1 pola berulang | paket 6–8 |
| 17 | **Chrome per-halaman** | root `layout.jsx` hanya `{children}`; Navbar+Footer diimpor 11 halaman + `SuccessState` (kandidat dobel render); WhatsAppFloat cuma 5/11; `login`/`register`/`forbidden`/`dashboard` tanpa chrome | 3c |

## 7. Roadmap

| Fase | Isi | Risiko | Verifikasi khusus |
|---|---|---|---|
| **0** | Tools: `check-structure.ts`, `check-routes.ts`, `check-schema-drift.ts`; baseline `npm run build` + snapshot rute; audit dead code & `/api/meeting-points`; bersih-bersih root (0.6b); **migrasi Vitest (0.9b)** + **better-auth 1.7.6 (0.9c)**; **hitung baseline ratchet impor `../` (80)** + baseline coverage (0.10) | nol | tools hijau di kondisi sekarang (atau daftar baseline) |
| **0.5** | `app/error.tsx` + `app/not-found.tsx` (root) — halaman error & 404 sendiri alih-alih blank/halaman bawaan | 🟢 | `npm run build` sukses; curl URL tak dikenal → 404 konten custom |
| **1** | Purge komentar (569 → ~0), normalisasi pesan error (D-4), tulis ulang 6 file test case-parity (1.3b), commit bahasa Inggris | 🟢 | diff = deletions saja; `init.sh` 0 |
| **2** | Skema Drizzle: satu sumber kebenaran (verifikasi drift → pilih sumber → update `drizzle.config`) | 🟡 | drift checker = 0 selisih; migrasi tak berubah |
| **3** | `modules`→`features`; lebur `shared`+`lib`→`lib`/`utils`; hook→`features/<f>/hooks` (atau `hooks/` shared); rename ±15 file; test ke `__tests__` + `src/testing/` (3.5) | 🟢 | `tsc` + `lint` + `vitest` + `build` |
| **3b** | Kumpulkan ±15 akses `process.env` → `lib/env.ts` (commit terpisah dari Fase 3) | 🟢 | `tsc` + `build` + smoke login |
| **3c** | **Chrome global**: `SiteChrome` (client) di root layout → Navbar+Footer conditional; hapus impor per-halaman (11 halaman + `SuccessState`); WhatsAppFloat sesuai D-17; aturan R10 | 🟢 | grep 0 impor per-halaman; manifest identik; **cek visual 15 halaman** (dengan/tanpa chrome) |
| **D×8** | **Loop 8 paket domain** — lihat §7.1; tiap paket: ① `git mv` UI → `features/<f>/components/` ② `.jsx→.tsx` ③ ekstrak `api/` + state container (reducer/hook generik) + unit-test ④ SSR/SEO (domain publik: `generateMetadata`, `<Suspense>`, `React.cache()`) | 🟢→🟡 | tangga §8 per commit; `verify:checkout` (paket 2); curl `<title>` (paket 5–7) |
| **9** | Route groups `(auth)(public)(account)(admin)` + `error/not-found/loading.tsx` + `<ErrorBoundary>` reusable (widget pihak ketiga); pilot `<Activity>` | 🟢 | **manifest rute wajib identik 100%** |
| **10** | Rename halaman (§4.2) + `redirects()` | 🟡 tertinggi | crawl: URL lama 301→200, URL baru 200, link internal 0 patah |
| **11** | Route tipis (46 → guard + controller); enforcement penuh; `allowJs:false` setelah `.jsx` habis | 🟢 | `check-structure` wajib lolos |

### 7.1 Strategi eksekusi: GLOBAL → PER DOMAIN → GLOBAL (D-13)

```
0 → 0.5 → 1 → 2 → 3 → 3b → 3c  # prasyarat global (sekali)
╔ paket 1 … paket 8 ╝         # loop domain, urut ukuran + risiko naik
9 → 10 → 11                   # penutup global (sekali)
```

Alasan:

- **Prasyarat global dulu** — tooling mengunci aturan sebelum gerakan massal;
  skema tunggal sebelum `features/` diisi; komentar habis → diff pindah murni
  rename; rename besar (`modules`→`features`) cukup 1×.
- **Loop per domain** — satu domain selesai *total* (pindah + tsx + hook + SSR)
  sebelum berikutnya → satu PR per paket (reviewable), bug terisolasi per domain,
  dan boleh berhenti kapan pun tanpa kondisi setengah-setengah.
- **Penutup global** — route groups, rename URL, enforcement menyentuh seluruh
  pohon aplikasi; tak bisa dipecah per domain.

| # | Paket domain | Ukuran | Isi khusus |
|---|---|---|---|
| 1 | `profile` | 6 file / 560 baris | termudah — memvalidasi pola paket |
| 2 | `checkout` | 12 / 1363 | `useCheckout` → reducer; jalur `verify:checkout` |
| 3 | `my-trips` | 7 / 889 | modal galeri, booking card |
| 4 | `private` | 15 / 1788 | wizard form multi-langkah |
| 5 | `destinasi` → `features/trip` | 18 / 1364 | SSR tertinggi: `trips`, `trips/[id]` |
| 6 | `blog` | 2 `page.jsx` + hugerte | SSR `blog/[slug]` + `generateMetadata` |
| 7 | `landing` | 7 / 1028 | `Subs` fan-in 8 → ekstrak `features/newsletter` |
| 8 | `admin` | 18 halaman | `useAdminTable`/`useAdminCrud`; pecah halaman gemuk |

Catatan:

- Tiap paket = **satu PR**; di dalamnya commit tetap dipisah per jenis perubahan
  (pindah ≠ konversi ≠ ekstrak ≠ SSR) — **domain = cakupan, bukan alasan
  mencampur**; aturan §1 tetap berlaku.
- Paket 8 (admin) boleh paralel dengan paket publik (file tak tumpang-tindih).
- PR #103 feat-080 **sudah merge** (`a5268af`, 30 Sep) ✅ — tak ada blocker antar-PR.
- Konversi seluruh `.jsx` (74 file) melekat di langkah ② tiap paket.

## 8. Verifikasi tanpa CI (tangga wajib per batch)

1. `npx tsc --noEmit` — import putus, tipe
2. `npm run lint` — baseline **0 error / 78 warning**
3. `npx vitest run` — saat ini 6 suites / 50 tests (wajib naik, tidak pernah turun); coverage baseline Fase 0.10 tidak turun
4. **`npm run build`** — boundary server/client, file hilang, rute rusak
5. `node scripts/check-structure.ts` — aturan §9
6. Khusus sentuh `app/`: `check-routes.ts` (diff manifest) + crawl URL
7. Khusus sentuh schema: `check-schema-drift.ts`
8. Sesi besar ditutup `./init.sh` EXIT 0

## 9. Tooling (tanpa dependency baru)

| Script | Fungsi | Aturan inti |
|---|---|---|
| `check-structure.ts` | kunci standar | R1 komentar berbahasa Indonesia = error · R2 `.jsx/.js` baru = error · R3 import deep `@/features/*/*` = error · R4 `components/` hanya `ui/`,`layout/` · R5 `route.ts` wajib tipis (guard+controller) · R6 gaya nama file per kategori · R7 tidak ada `src/lib/hooks`/`src/shared` liar · R8 identifier berbahasa Indonesia = error · R9 impor lintas-folder wajib `@/`, `../` = error (ratchet baseline 80 → 0) · R10 `components/layout/{Navbar,Footer,WhatsAppFloat}` hanya boleh diimpor `SiteChrome`/file layout (bukan halaman) |
| `check-routes.ts` | jaring pengaman URL | diff manifest `appPathRoutes` (Fase 9 wajib 0 selisih; Fase 10 selisih harus persis sesuai daftar yang disetujui §4.2) + crawl semua URL hasil build → bukan 404 |
| `check-schema-drift.ts` | integritas DB | bandingkan definisi `pgTable` kembar di dua lokasi → selisih kolom = error |

Ketiga script dipasang di `package.json` dan **ditambahkan ke `./init.sh`**
(setelah Fase 0) supaya ikut terkunci di jalur verifikasi standar.

## 10. Log keputusan

| ID | Keputusan | Status |
|---|---|---|
| D-1 | `modules/` → `features/` (rename, 62 importer) | ✅ disetujui |
| D-2 | Komponen fitur tetap PascalCase; `ui/` shadcn tetap kebab (tidak diseragamkan kebab semua) | ✅ disetujui (default) |
| D-3 | `/admin/pesanan`→`/admin/bookings`, `/dashboard` dihapus, `/private`→`/private-trip` | ✅ disetujui |
| D-4 | Pesan error API: **Indonesia** (user-facing); `Unauthorized`/`Forbidden` tetap teknis | ✅ disetujui (jawaban: Indonesia) |
| D-5 | Komentar: nol + pengecualian 1 baris "why" Inggris | ✅ disetujui (boleh diperketat jadi nol total) |
| D-6 | Dokumen proyek tetap Indonesia; kode/log/identifier Inggris | ✅ default |
| D-7 | Server actions, React Query, ganti ORM, i18n, monorepo | ❌ ditolak (alasan §5.3); **pengecualian tunggal: Vitest → D-19** (menggantikan Jest, atas izin user) |
| D-8 | React Compiler (auto-memo) | ⏳ tunda — butuh 1 dependency baru (`babel-plugin-react-compiler`); dievaluasi setelah Fase 11 |
| D-9 | Modern React (§5.4): `error.tsx`, `<Suspense>`, `use()`, `useFormStatus`, `useDeferredValue`, `useOptimistic` | ✅ disetujui; urutan dalam paket: ③ekstrak → ④SSR; boundary & route groups = Fase 9 |
| D-10 | State management: **tidak pakai library Flux/Redux/Zustand**; prinsip Flux (action+reducer satu arah) via `useReducer` di paket domain (P2-③, P4-③, P8-④); evaluasi Zustand hanya jika ada kebutuhan lintas-rute nyata | ✅ disetujui |
| D-11 | **State container per UI/fitur** (§5.6): ±10–12 hook per fitur, 2–3 hook generik untuk 18 halaman admin, `features/admin/` baru, dengan 3 aturan batas | ✅ disetujui |
| D-12 | Error boundary: **root `error.tsx` + `not-found.tsx` ditarik ke Fase 0.5** (menambah file saja, nol risiko); `<ErrorBoundary>` widget (hugerte/map/blog) tetap Fase 9 karena perlu verifikasi browser | ✅ disetujui (keputusan pengganti: "terserah") |
| D-13 | Strategi eksekusi (§7.1): **global (prasyarat) → loop 8 paket domain → global (penutup)**; satu domain = satu PR selesai total; commit dalam paket tetap per jenis perubahan; SSR & ekstrak fetch masuk paket domain | ✅ disetujui (diajukan user, dirapikan) |
| D-14 | Standar import (§4.4): **alias tunggal `@/*`** (tanpa alias kategori lain); `../` dilarang → semua lintas-folder `@/`; enforcement R9 ratchet 80 → 0 | ✅ disetujui (diajukan user) |
| D-15 | Rewrite: ❌ **setingkat proyek** (spesifikasi = kode lama, diff tak mekanis, PR & 32 fitur tertahan, kondisi tengah = dua konvensi); ✅ **setingkat unit dalam paket** (halaman admin gemuk, `useCheckout` → reducer baru, fungsi kusut) dengan syarat §1.7 | ✅ disetujui |
| D-16 | Test (§5.7): rewrite unit → **test ikut ditulis ulang** (PR sama); test pindah bersama unit (colocated + `@/`); jumlah test + coverage tidak turun; e2e spec ikut diperbarui saat URL berubah; **rewrite file test = boleh (Fase 1.3b) dengan case parity 1:1 — kasus tak boleh hilang** | ✅ disetujui (diajukan user) |
| D-17 | **Chrome di layout (temuan #17)**: Navbar+Footer hanya lewat `SiteChrome` di root layout — tersembunyi di `/login`, `/register`, `/forbidden`, `/admin`, `/dashboard`; impor per-halaman dihapus (nol perubahan visual utk 11 halaman); WhatsAppFloat: **opsi A (dipilih)** — 5 path lama; ketiganya tetap dirender oleh `SiteChrome` di root layout, dikonfigurasi di satu tempat; disederhanakan jadi layout per route group di Fase 9 | ✅ disetujui |
| D-18 | **Letak test ikut standar bulletproof-react**: test di `<dir>/__tests__/` (bukan samping sumber); infra test di `src/testing/` (`setup-tests.ts`, `mocks/`, `test-utils`); `src/__tests__` & `src/__mocks__` dihapus; runner pindah ke **Vitest** (D-19); e2e `e2e/<area>/` = ekstensi `e2e/tests/` (19 spec vs 2, dikelompok area) | ✅ diajukan & disetujui user |
| D-19 | **Unit test runner: Jest → Vitest** (syarat user "kalau Next support" — Next 16.2.11 punya panduan resmi `testing/vitest.md` ✅): ikuti panduan — install `vitest` `@vitejs/plugin-react` `jsdom` `vite-tsconfig-paths` `@vitest/coverage-v8` (RTL sudah ada), `vitest.config.mts` (jsdom, `globals`, `setupFiles`, **`exclude: e2e`**), mock → `resolve.alias`; port 6 suite (`jest.*`→`vi.*`, ~19 panggilan); hapus dep `jest`/`ts-jest`/`jest-environment-jsdom`/`@types/jest` + `jest.config.cjs` + `tsconfig.jest.json`; `init.sh` → `npx vitest run`; jalankan di Fase **0.9b** — **pengecualian terukur D-7 (dep baru menggantikan dep lama), atas izin user** | ✅ diajukan user |
| D-20 | **Penyegaran dependensi (hasil verifikasi “jika support”)**: (a) **better-auth 1.6.23 → 1.7.6 = ✅ masuk plan** (stable; peer `next ^16` ✓ `react 19` ✓ `drizzle ^0.45.2||>=1.0.0-rc` ✓) — breaking 1.7 diaudit di task 0.9c: config `joins`/captcha/MCP **tidak dipakai** ✓, **Google OAuth → wajib backfill `Account.issuer`** + `npx auth@latest generate`; (b) **TypeScript 7 ditunda** — Next 16 lolos (hanya min 5.1.0), **tapi typescript-eslint semua versi peer `<6.1.0`** (8.71.0 terbaru, tak ada v9) → rantai lint belum siap; (c) **Drizzle v1 ditunda** — stable belum rilis (latest 0.45.3); setelah better-auth 1.7.6 pintu peer v1 terbuka → tinggal tunggu rilis stable, PR terpisah dari restructure | ✅ diajukan user (kondisi “jika support”)
| D-21 | **Sumber kebenaran skema (Fase 2, task 2.1–2.2)**: `src/db/schema/` = satu-satunya tempat `pgTable()` (dirujuk `drizzle.config.ts`); **arbiter akhir tabel yang sudah ada = struktur DB live** — bukan salinan migrasi. Bukti: `drizzle/` tertinggal (journal 3 dari 7 file SQL; kolom live > migrasi 0000). 4 drift diselesaikan ke bentuk live: booking_participants (+`emergency_contact_*`), health_declarations (bentuk form baru: `has_vertigo`/`mobility_option`/`no_conditions`/`has_joint_bone_disease`; kolom lama `has_allergies`/`other_conditions`/`needs_wheelchair`/`needs_walking_stick` **tak ada di live**), payments (+`proof_url`/`bank_name`/`account_number`/`account_holder`/`admin_note`/`reviewed_*`) → sisi modules; terms_acceptances → sisi `db/schema` (modules kurang `id`/`booking_id`). Folder `drizzle/` **tetap beku** (tak menulis migrasi); selisih live-vs-folder = temuan pra-ada → dicat di progress, di luar restructure | ✅ keputusan 2.1 dengan bukti `information_schema` DB live |

## 11. Definition of Done

**Per batch:** perubahan sesuai rencana batch · tangga §8 hijau · commit message
Inggris · `progress.md` diperbarui · tree bersih.

**Global (restructure selesai):** seluruh fase 0–11 · `check-*` terpasang di
`init.sh` · `src/shared`, `src/lib/hooks` & `src/__tests__` tidak ada, `src/testing/` (gaya
bulletproof) ada · `jest.config.cjs` & `tsconfig.jest.json` tidak ada (Vitest) · `features/<f>/index.ts`
ada di semua fitur · `allowJs:false` · rute & URL sesuai §4.2 dengan redirect aktif.
