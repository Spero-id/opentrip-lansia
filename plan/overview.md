# Overview — OpenTrip Lansia (OTL)

> Ringkasan tingkat tinggi proyek: visi, arsitektur, status, dan sumber referensi.
> Detail per fitur ada di `plan/spec-fitur/`. Status fitur terkini adalah
> `feature_list.json` (source of truth), bukan dokumen ini.

## 1. Ringkasan

**OpenTrip Lansia (OTL)** adalah platform pemesanan open trip yang difokuskan
untuk peserta lanjut usia. Di UI, brand yang dipakai adalah **Jelajah Memoria**.

- **Versi:** MVP (Phase 1–10)
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Auth:** Better Auth (email/password + Google OAuth)
- **UI:** Tailwind CSS v4, shadcn/Base UI, Heroicons/Lucide
- **Email:** Resend (sejak migrasi dari nodemailer/SMTP)
- **Payment:** Midtrans (manual transfer saat ini; webhook gateway belum aktif)
- **Test:** Vitest (unit) + Playwright (e2e)
- **Deploy:** self-hosted / PM2 — lihat `docs/DEPLOY.md`

## 2. Visi & Tujuan

| Tujuan | Keterangan |
|---|---|
| Platform lansia-friendly | Interface yang mudah diakses untuk lansia (60+ tahun) |
| Open trip booking | Pemesanan trip terbuka dengan kuota minimal |
| Private trip | Request custom trip dengan proposal dari admin |
| Sistem referral | Agen dapat mereferensikan dan mendapat komisi |
| Payment gateway | Integrasi Midtrans untuk pembayaran online |

### Non-goals (saat ini)

- Bukan aplikasi mobile native (responsive web dulu)
- Belum ada integrasi travel agent eksternal
- Belum ada chat/realtime messaging

## 3. Status per 9 Oktober 2026

`feature_list.json`: **56 fitur** — 26 `completed`, 20 `in_review`, 10 `to_do`.

### Selesai (`completed`)

- Landing page, auth pages, trip listing & detail, blog publik
- Admin dashboard + CRUD trip, itinerary, HORECA, vendors, promotions,
  galleries, reviews, commissions, blogs, users
- Group Trip Management (`feat-011b`) — banyak grup per trip, grup aktif, galeri per grup
- Kuota open trip di UI (progress bar, badge status)
- **API auth middleware & RBAC** (`feat-080`) — seluruh handler API punya guard
  (public/session/admin), proxy cek cookie di edge
- **Security Phase 2** — sanitasi XSS (`feat-084`), bcrypt + kuota atomik
  (`feat-085`), sanitasi pesan error API (`feat-086`)
- **Email Resend** — contact form & newsletter memakai Resend
  (menggantikan nodemailer/SMTP)

### Dalam review (`in_review`)

- Booking flow & form, payment manual transfer, promo code, metode pembayaran BCA
- Referral system (`feat-073`), agent dashboard (`feat-070`), loyalty points (`feat-072`)
- File upload media/galeri (`feat-081`), audit log (`feat-082`)

### Belum dikerjakan (`to_do`) / gap

- Payment gateway Midtrans (`feat-032`), commission payout (`feat-071`)
- Email/WhatsApp notifications (`feat-083`) — email dasar sudah ada, WA & notifikasi
  transaksional belum
- Meeting points, shared UI library, halaman FAQ/About, loading & empty states,
  audit mobile responsiveness, lupa password (`feat-090`–`feat-096`)

### Utang teknis yang diketahui

- Sebagian test Playwright belum selaras dengan kode saat ini (ekspektasi API 401
  setelah `feat-080`, selector UI berubah). Lihat `progress.md` Session 86.
- Integrasi Midtrans/webhook belum aktif; pembayaran masih alur manual.

## 4. Arsitektur

### Struktur folder

```
src/
├── app/                      # Next.js App Router
│   ├── (public)/             # halaman publik (landing, trips, contact, checkout, blog)
│   ├── (admin)/admin/        # halaman admin
│   ├── (account)/            # halaman akun (profile, my-trips)
│   ├── (auth)/               # login/register
│   └── api/                  # API routes
├── features/                 # modul per fitur (controller/service/repository/schema)
├── components/               # komponen UI bersama (ui, layout)
├── db/
│   ├── schema/               # Drizzle schema (13 file, ~35 tabel)
│   ├── seed.ts               # seeder
│   └── index.ts              # koneksi
├── lib/
│   ├── auth/                 # session, password, auth-server
│   ├── db/                   # helper DB
│   ├── env/                  # validasi env (server & client) via @t3-oss/env-nextjs
│   ├── html/                 # sanitasi HTML
│   └── mail/                 # Resend + template email
├── hooks/, types/, utils/, testing/
scripts/                      # skrip verifikasi & audit
e2e/                          # Playwright (public, admin, api)
```

### Pattern per fitur

Setiap fitur di `src/features/<fitur>/` mengikuti:

```
*.schema.ts     → validasi/tipe input (zod)
*.repository.ts → akses database (Drizzle)
*.service.ts    → business logic
*.controller.ts → handler API
index.ts        → public exports
```

### Email (Resend)

- `src/lib/env/server.ts`: `RESEND_API_KEY` (wajib), `RESEND_EMAIL_FROM`
  (default `onboarding@resend.dev`).
- `src/lib/mail/index.ts`: `sendContactEmail`, `sendSubscriptionConfirmationEmail`.
- Kegagalan kirim email **tidak** membatalkan penyimpanan data (di-`try/catch` di service).
- Untuk produksi: verifikasi domain di Resend, lalu ganti `RESEND_EMAIL_FROM`.

## 5. Tech Stack Detail

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| UI Components | shadcn/Base UI, Heroicons, Lucide |
| Backend | Next.js API Routes |
| Database | Neon PostgreSQL (pooled) |
| ORM | Drizzle ORM |
| Auth | Better Auth (email/password, Google OAuth) |
| Email | Resend |
| Payment | Midtrans (manual transfer) |
| Env | `@t3-oss/env-nextjs` + zod |
| Testing | Vitest (unit), Playwright (e2e) |
| Deploy | PM2 / self-hosted |

## 6. Testing & Verifikasi

Perintah standar:

```bash
npx tsc --noEmit          # cek tipe
npm run lint              # eslint
npx vitest run            # unit test
npm run check:structure   # aturan struktur (R1–R12)
npm run build             # build produksi
npx playwright test       # e2e (butuh browser + dev server)
```

Status terakhir diverifikasi (9 Oktober 2026):

| Verifikasi | Hasil |
|---|---|
| `npx vitest run` | 379 test lulus / 46 file |
| `npx tsc --noEmit` | 0 error |
| `npm run lint` | 0 error (80 warning, baseline) |
| `npm run build` | sukses |
| `npm run check:structure` | semua rule dalam baseline |
| Playwright | 78 test / 19 file — sebagian masih usang (lihat catatan utang teknis) |

## 7. Sumber Referensi

| Dokumen | Lokasi |
|---------|--------|
| PRD | `docs/PRD.md` |
| Flow Diagrams | `docs/flow.md` |
| Database Schema | `docs/database/erd_revisi.mermaid` |
| Database Guide | `docs/database/PANDUAN_DATABASE.md` |
| Deploy | `docs/DEPLOY.md` |
| Feature Tracker | `feature_list.json` |
| Progress Log | `progress.md` |
| Spec per fitur | `plan/spec-fitur/` |

---

*Terakhir diperbarui: 9 Oktober 2026*
