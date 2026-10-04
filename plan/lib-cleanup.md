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
| `src/lib/format.ts:5` `formatRupiah` | `number → string` | `features/trip/components/detail/BookingCard.tsx` |
| `src/lib/format-rupiah.ts:3` `formatRupiah` | identik | `features/trip/components/DestinationCard.tsx` |
| `src/lib/order.ts:21` `OrderDomain.formatPrice` | identik | `features/checkout/*` (7 call site) |
| `src/features/private-trip/components/helpers/formatting.ts:1` | `null → ""` | 2 komponen |
| `src/features/my-trips/components/constants.tsx:69` | `toLocaleString("id-ID")`, `null → null` | 3 komponen |
| `src/features/private-trip/components/SuccessState.tsx:13` | lokal | 1 |
| `src/app/(admin)/admin/page.tsx:21` | lokal, arg `string` | 1 |
| `src/app/(admin)/admin/notifications/page.tsx:110` | lokal | 1 |
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
```

## Commit

### 1 — Bubarkan pola `*Domain`

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

### 2 — Satukan 12 implementasi format uang

`src/utils/format.ts` (dibuat di commit 1) menjadi satu-satunya sumber:

- `formatNumber(value: number | string): string`
- `formatRupiah(value: number | string | null | undefined): string | null`

Perilaku yang harus dipertahankan per pemanggil, bukan diseragamkan paksa:
- Input yang sudah berawalan `"Rp "` atau berisi pemisah ribuan → dikembalikan apa adanya (source `admin/*`, `my-trips`, `private-trip` menerima string dari DB).
- `null`/`undefined`/`""` → `null` (bukan `"Rp 0"`).
- angka desimal → `Math.floor`, sama seperti sekarang.

Hapus: `src/lib/format.ts` (seluruhnya — isinya sudah pindah ke `src/utils/format.ts`), `src/lib/format-rupiah.ts`, `src/utils/helpers.ts#formatCurrency`, `src/utils/helpers.ts#parseAmount` (0 pemakai, sudah dibuang di commit 1).

Sisa 9 implementasi lokal (4 di `app/(admin)`, 4 di `features/*`, 1 di `features/trip/components/FilterPanel.tsx`) memakai `formatRupiah` dari `@/utils/format`.

Verifikasi wajib: `PriceBreakdown` (`features/checkout/components`) dan `admin/page.tsx` dicek visual sebelum/sesudah — ini tempat output paling mungkin bergeser. Commit: `refactor(format): single formatRupiah implementation, drop duplicates`.

### 3 — Pindahkan `data.ts` ke `features/landing`

`src/lib/data.ts` → `src/features/landing/content/index.ts`. Update 3 import: `FAQSection.tsx`, `MarketingSection.tsx`, `TestimonialsSection.tsx` (jadi lokal relatif — R9 tetap 0).

`data.ts` satu-satunya file di `src/lib/` yang punya 0 dependensi framework dan 100% konten UI. Commit: `refactor(landing): move marketing content out of lib`.

### 4 — Pindahkan `lib/errors/` ke `utils/errors/`

33 file mengimpor `@/lib/errors/*`; semua berubah satu baris. `__tests__/to-public-error.test.ts` ikut pindah.

`src/lib/db/utils.ts` tetap di `lib/db/` agar `db` tidak terpecah dua tempat.

Verifikasi: `check-structure` R7 (`src/shared`, `src/lib/hooks`) tidak tersentuh. Commit: `refactor(utils): move error classes to src/utils/errors`.

### 5 — `lib/env/` jadi dua file + T3 Env

```
src/lib/env/
├── client.ts   NEXT_PUBLIC_BETTER_AUTH_URL · NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
│               NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION · NEXT_PUBLIC_WHATSAPP_*
└── server.ts   DATABASE_URL · BETTER_AUTH_* · GOOGLE_CLIENT_* · SMTP_*
                ADMIN_EMAIL · BASE_URL
```

Baru setelah itu, migrasi ke `@t3-oss/env-core` + `@t3-oss/env-nextjs` + `zod`: `client.ts` = `createEnv({ client, shared, runtimeEnv })`, `server.ts` = `createEnv({ server, client, runtimeEnv, extends: env })`. Values saat ini **nol validasi** selain `required()` 2 var — `DATABSE_URL` typo lolos diam-diam sampai query gagal.

**Jebakan yang harus ditangani di commit ini:**
- `scripts/check-structure.ts:269` hardcode `const ENV_SERVER = "src/lib/env.server.ts"` untuk ratchet R11. Harus jadi `src/lib/env/server.ts`, plus guard baru: `client.ts` tidak boleh mengimpor `server.ts`.
- 13 file mengimpor `@/lib/env` atau `@/lib/env.server`; setelah split, tiap import harus eksplisit memilih client atau server.
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` dipakai komponen client (`WhatsAppFloat.tsx`) → harus tetap dari `client.ts`.

Commit: `feat(env): split env into client/server modules with T3 Env validation`.

## Di luar scope

- `src/lib/mail/` (pecah `transporter` module-scope jadi lazy + pisahkan template HTML) — dicatat, dikerjakan di ticket sendiri.
- `src/utils/helpers.ts#formatCurrency` sebagai API publik — dibuang di commit 2, tidak ada penggantinya; `formatRupiah` menutup kebutuhan itu.
- Mengganti vendor email (Resend/SES) — ticket sendiri setelah `mail/` dipecah.
- R1/R8 baseline — tidak boleh naik; kalau commit tertentu memaksa naik, commit itu dipecah.
