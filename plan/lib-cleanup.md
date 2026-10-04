# Plan — lib-cleanup (rapikan `src/lib/` dan `src/utils/`)

Status per 2026-10-03 · Branch: `refactor/lib-cleanup` (dari `main` post-merge PR #127)

## Batasan

- **Nol komentar baru** di kode mana pun. R1 (`scripts/check-structure.ts`) sudah 0; jangan naikkan.
- **Tanpa perubahan perilaku.** Refactor murni: signature, output string, dan rendering harus identik.
- **Satu concern per commit.** Kalau sebuah commit butuh uraian panjang, itu artinya belum layak jadi satu.
- **Tanpa dependensi baru** sampai commit 5 (T3 Env). Cleanup tidak boleh menarik vendor baru.
- Ikuti pola yang sudah ada: feature module = `*.service.ts` → barrel `@/features/<name>`. **R3** (deep import `@/features/*/*`) ratchet 217 — impor lintas fitur wajib lewat barrel, boleh turun, tidak boleh naik.
- Tiap commit harus lolos: `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `node scripts/check-structure.ts`.

## Kondisi awal (fakta terverifikasi)

### Duplikasi format uang — 12 implementasi

Tiga di antaranya **duplikat persis** (regex identik `"Rp " + Math.floor(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")`):

| File | Bentuk | Pemakai |
|---|---|---|
| `src/lib/format.ts` | `formatRupiah` | `features/trip/components/detail/BookingCard.tsx` | → `formatIDR` di `@/utils/format` |
| `src/lib/format-rupiah.ts:3` `formatRupiah` | identik | `features/trip/components/DestinationCard.tsx` | → `formatIDR` |
| `src/lib/order.ts:21` `OrderDomain.formatPrice` | identik | `features/checkout/*` (7 call site) | → `formatIDR` |
| `src/features/private-trip/components/helpers/formatting.ts:1` | `null → ""` | 2 komponen |
| `src/features/my-trips/components/constants.tsx:69` | `toLocaleString("id-ID")`, `null → null` | 3 komponen |
| `src/features/private-trip/components/SuccessState.tsx:13` | lokal | 1 |
| `src/app/(admin)/admin/page.tsx:21` | lokal, arg `string`, satuan ringkas | 1 | → `formatIDRCompact` |
| `src/app/(admin)/admin/notifications/page.tsx:110` | lokal, `Intl` currency | 1 | → `formatIDR` |
| `src/app/(admin)/admin/AdminShell.tsx:102` | lokal | 1 |
| `src/app/(admin)/admin/private-trips/[id]/page.tsx:244` | lokal | 1 |
| `src/features/trip/components/FilterPanel.tsx:77` | lokal | 1 |
| `src/utils/helpers.ts#formatCurrency` | `Intl` id-ID, beda output | 2 |

Plus `src/lib/format.ts#formatNumber` (`features/trip/components/detail/DestinationHeader.tsx`) yang sehat dan ikut expires.

Risiko nyata: konsumen berbeda mendapat output berbeda (`Math.floor` vs `Intl` vs regex, `null → ""` vs `null` vs `"Rp 0"`).

### Kode mati di `src/lib/` (0 pemakai di seluruh `src/`)

`src/lib/order.ts`: `AVAILABLE_VOUCHERS`, `OrderDomain.calculateTotal`, `OrderDomain.generateParticipantId`
`src/lib/destination.ts`: `RawTripData`, `DEFAULT_RATING`, `DestinationDomain.calculateTotalPrice`
`src/utils/helpers.ts`: `parseAmount`

### Domain menyasar di `src/lib/`

- `src/lib/destination.ts` → `toDetail` (dipakai `features/trip/api/client.ts`, `app/(public)/checkout/page.tsx`), `DestinationDomain.getShortLocation` (dipakai `app/(public)/trips/[id]/page.tsx`). Pindah: `features/trip`.
- `src/lib/order.ts` → `OrderDomain` (dipakai `features/checkout/{components,hooks,pricing}`). Pindah: `features/checkout`.

### Data presentasi di `src/lib/`

`src/lib/data.ts` (229 baris) — `reviews`, `destinations`, `features`, `faqs`. Dipakai 3 komponen di `features/landing/`. Pindah: `features/landing/content`.

### Batas `src/lib/` ↔ `src/utils/` yang dihasilkan

| Lokasi | Isi | Alasan |
|---|---|---|
| `src/lib/` | `auth/`, `db/`, `env/`, `mail/`, `utils.ts` | adapter integrasi pihak ketiga (Better Auth, Drizzle, nodemailer, shadcn) |
| `src/utils/` | `errors/`, `format.ts`, `helpers.ts`, `password.ts`, `sanitize.ts`, `image-guard.ts` | util generik, tanpa dependency framework |

`src/utils.ts` (shadcn `cn()`) tetap di `src/lib/` — ikut upstream shadcn, tidak disentuh.

## Struktur akhir

```
src/lib/
├── auth/    api-policy · api-auth-audit · session · client · auth-server
├── db/      index · retry · utils
├── env/     client · server
├── mail/    index · transport · nodemailer · templates
└── utils.ts

src/utils/
├── errors/  app-error · to-public-error
├── format.ts
├── helpers.ts
├── image-guard.ts
├── password.ts
└── sanitize.ts

src/features/checkout/
└── order-id.ts   generateOrderId()

src/features/trip/
└── trip-mapper.ts   toDetail() · getShortLocation()

src/features/landing/components/
└── content.ts   reviews · destinations · features · faqs
```

## Commit

### 1 — Bubarkan pola `*Domain` ✅ `52afe99`

`OrderDomain` dan `DestinationDomain` adalah **dua-satunya objek `*Domain` di seluruh codebase**; sisa domain sudah mengikuti pola repo (`*.service.ts` / `*.repository.ts`, atau file datar seperti `pricing.ts`, `reducer.ts`). Dua file dihapus sepenuhnya.

Sisa method yang benar-benar dipakai:

| Dari | Ke | Pemakai |
|---|---|---|
| `OrderDomain.generateOrderId` | `generateOrderId()` di `src/features/checkout/order-id.ts` | `features/checkout/hooks/use-checkout.ts:205` |
| `DestinationDomain.getShortLocation` | ikut `features/trip/trip-mapper.ts` | `app/(public)/trips/[id]/page.tsx:68` |

`toDetail` masuk `features/trip/trip-mapper.ts` juga — dua-duanya pembentuk tampilan dari data trip mentah, dan `getShortLocation` dibaca dari hasil `toDetail`, jadi satu unit koheren. Barrel `@/features/trip` dan `@/features/checkout` dieksporkan accordingly (R3 tidak boleh naik).

Method mati ikut hilang di commit ini: `OrderDomain.calculateTotal`, `OrderDomain.generateParticipantId`, `OrderDomain.formatPrice`, `DestinationDomain.calculateTotalPrice`, `AVAILABLE_VOUCHERS`, `RawTripData`, `DEFAULT_RATING`, `OrderItem`.

`formatPrice` sebenarnya masih dipakai 7× di komponen checkout, jadi **penggantinya (`formatRupiah`) harus siap di commit ini juga** — kalau tidak, output uang checkout ikut hilang. Urutan di dalam commit: `formatRupiah` masuk ke `src/utils/format.ts` lebih dulu, baru call site dihitung. Prinsipnya: 7 call site `OrderDomain.formatPrice` → `formatRupiah`, identik perilakunya karena keduanya `Math.floor` + regex ribuan yang sama.

Commit: `refactor(lib): dissolve OrderDomain and DestinationDomain into feature modules`.

### 2 — Satukan 12 implementasi format uang ✅ `612e9bd`

Hasil di lapangan: nama kanonik **`formatIDR`**, bukan `formatRupiah`, karena `"rupiah"` ada di `ID_IDENTIFIER_WORDS` (`check-structure.ts:54`) — memakai `formatRupiah` menambah R8 di tiap call site. R8 turun 504 → 468.

`src/utils/format.ts` (dibuat di commit 1) menjadi satu-satunya sumber:

- `formatNumber(value: number | string): string`
- `formatIDR(value: number | string | null | undefined): string | null`
- `formatIDRCompact(value)` — ringkasan satuan (`Rp 1.8Jt`, `Rp 2.5M`) yang sebelumnya inline di `admin/page.tsx`; **bukan** duplikat, jadi tetap fungsi terpisah

Perilaku yang dipertahankan, decided di call site:
- Input yang **sudah** berawalan `"Rp "` atau memakai pemisah ribuan → dikembalikan apa adanya (source `admin/*`, `my-trips`, `private-trip` menerima string dari DB). Regex hanya menerima digit bulat, `"1.250.000"` tidak boleh terbaca sebagai desimal — ini jebakan yang ketahuan lewat test.
- `null`/`undefined`/`""` → `null`, dan `null` tidak di-render React sama dengan `""` lama, jadi tampilan tidak bergeser.
- angka desimal → `Math.floor`, sama seperti sekarang.
- Fallback yang dulu menumpang di dalam fungsi dipindah ke call site: `?? "-"` (private-trips/[id], SuccessState), `?? "Rp 0"` (FilterPanel).

Hapus: `src/lib/format-rupiah.ts`, `formatCurrency`/`parseAmount` di `src/utils/helpers.ts`, `my-trips/constants#formatRupiah`, `private-trip/components/helpers/formatting#formatRupiah`, dan 7 implementasi lokal lain.

Test baru `src/utils/__tests__/format.test.ts` (9 test).

Catatan output: `"Rp 350.000"` dari `Intl` currency memakai non-breaking space, kini regular space. Rendering identik, hanya byte berbeda.

Commit: `refactor(format): unify 12 money formatters into utils/format`.

### 3 — Pindahkan `data.ts` ke `features/landing` ✅ `31c089c`

`src/lib/data.ts` → `src/features/landing/components/content.ts`. Update 3 import: `FAQSection.tsx`, `MarketingSection.tsx`, `TestimonialsSection.tsx`.

Ditempatkan di `components/` (bukan `features/landing/content/`) mengikuti preseden `my-trips/components/constants.tsx` dan `private-trip/components/helpers/`: alias `@/features/landing/content` menambah R3, `../content` menambah R9. Import sibling `"./content"` membuat keduanya tetap 0.

### 4 — Pindahkan `lib/errors/` ke `utils/errors/` ✅ `5a56938`

33 file mengimpor `@/lib/errors/*` (11 × `app-error`, 26 × `to-public-error`); semua berubah satu baris. `__tests__/to-public-error.test.ts` ikut pindah.

`src/lib/db/utils.ts` tetap di `lib/db/` agar `db` tidak terpecah dua tempat.

Commit: `refactor(utils): move error classes to src/utils/errors`.

### 5 — `lib/env/` jadi dua file + T3 Env ✅ `a10f5ee`

```
src/lib/env/
├── client.ts   NEXT_PUBLIC_BETTER_AUTH_URL · NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
│               NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION · NEXT_PUBLIC_WHATSAPP_*
└── server.ts   DATABASE_URL · BETTER_AUTH_* · GOOGLE_CLIENT_* · SMTP_*
                ADMIN_EMAIL · BASE_URL
```

Baru setelah itu, migrasi ke `@t3-oss/env-core` + `@t3-oss/env-nextjs` + `zod`: `client.ts` = `createEnv({ client, shared, runtimeEnv })`, `server.ts` = `createEnv({ server, client, runtimeEnv })`. Values saat ini **nol validasi** selain `required()` 2 var — `DATABSE_URL` typo lolos diam-diam sampai query gagal.

**Tiga jebakan yang ternyata muncul (semua sudah ditangani):**
- `createEnv` T3 Env **tidak menerima `clientPrefix`**, dan `extends` eksplisit berbentuk **array** (`extends: [client]`) yang memicu konflik tipe dengan `runtimeEnv`. Solusi: `server.ts` mendeklarasikan ulang `client: clientSchema` dengan runtimeEnv gabungan.
- **7 test server harus pindah ke `environment: "node"`** (docblock `// @vitest-environment node`). T3 Env menentukan `isServer` dari `typeof window === "undefined"`, sedangkan suite ini default `jsdom` — tanpa itu, import `lib/db` → `env/server` melempar "Attempted to access a server-side environment variable on the client". File yang butuh jsdom (6 file testing-library) tidak diubah.
- **`BASE_URL` bentrok dengan konstanta bawaan Vite.** Vite meng-inject `BASE_URL="/"` ke `process.env`, menabrak nama variabel aplikasi → `z.url()` gagal di seluruh test. Diperbaiki di `vitest.config.mts` lewat `env: { BASE_URL: "http://localhost:3000" }`. Nama variabel tidak diubah demi kompatibilitas deployment; kalau nanti mau bebas, rename ke `SITE_URL`.
- `check-structure.ts` ENV_SERVER → `src/lib/env/server.ts`, plus guard baru `client.ts` tidak boleh mengimpor `server.ts`.

Commit: `feat(env): split env into client/server modules with T3 Env validation`.

## Di luar scope

- `src/lib/mail/` (pecah `transporter` module-scope jadi lazy + pisahkan template HTML) — dicatat, dikerjakan di ticket sendiri.
- `src/utils/helpers.ts#formatCurrency` sebagai API publik — dibuang di commit 2, tidak ada penggantinya; `formatRupiah` menutup kebutuhan itu.
- Mengganti vendor email (Resend/SES) — ticket sendiri setelah `mail/` dipecah.
- R1/R8 baseline — tidak boleh naik; kalau commit tertentu memaksa naik, commit itu dipecah.
