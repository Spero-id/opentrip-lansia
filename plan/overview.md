# Overview — OpenTrip Lansia (OTL)

> Dokumen ini adalah ringkasan tingkat tinggi proyek: visi, status saat ini,
> arsitektur, dan sumber referensi. Untuk detail per fitur lihat `plan/spec-fitur/`,
> untuk urutan kerja lihat `plan/roadmap.md`.

## 1. Ringkasan

**OpenTrip Lansia (OTL)** adalah platform digital untuk pemesanan open trip yang
difokuskan untuk lansia (lanjut usia). Platform ini mempertemukan penyelenggara
open trip dengan peserta lansia, menyediakan pengalaman perjalanan yang aman,
nyaman, dan sesuai kebutuhan fisik lansia.

- **Versi:** MVP (Phase 1-10)
- **Framework:** Next.js 16 (App Router)
- **Bahasa:** TypeScript + JSX/TSX
- **Database:** Neon PostgreSQL + Drizzle ORM
- **Auth:** Better Auth (email/password, Google OAuth)
- **UI:** Tailwind CSS + ShadCN components
- **Payment:** Midtrans (manual transfer)

## 2. Visi & Tujuan

| Tujuan | Keterangan |
|---|---|
| Platform lansia-friendly | Interface yang mudah diakses untuk lansia (60+ tahun) |
| Open trip booking | Pemesanan trip terbuka untuk umum dengan kuota minimal |
| Private trip | Request custom trip dengan proposal dari admin |
| Sistem referral | Agen dapat mereferensikan dan mendapat komisi |
| Payment gateway | Integrasi Midtrans untuk pembayaran online |

### Non-goals (saat ini)

- Bukan aplikasi mobile native (responsive web dulu)
- Belum ada integrasi travel agent eksternal
- Belum ada chat/realtime messaging

## 3. Status saat ini (per September 2026)

### Fitur inti (sudah selesai)

- ✅ Landing page dengan hero section dan daftar trip
- ✅ Auth pages (login/register) + Navbar + Footer
- ✅ Trip listing & detail public pages
- ✅ Checkout page (multi-step dengan Midtrans)
- ✅ Booking history page (`/my-trips`)
- ✅ Profile page dengan info user
- ✅ Private trip request form
- ✅ Admin dashboard dengan sidebar

### Admin CRUD (sudah selesai)

- ✅ Trip CRUD (list, create, edit, archive)
- ✅ Itinerary management
- ✅ HORECA management
- ✅ Vendors management
- ✅ Promotions management
- ✅ Galleries management
- ✅ Reviews management
- ✅ Commissions management
- ✅ Blogs management
- ✅ Users management

### Fitur lanjutan (sudah selesai)

- ✅ Kuota Open Trip di UI (progress bar, badge status)
- ✅ Halaman Blog Publik (`/blog`, `/blog/[slug]`)
- ✅ Metode Pembayaran BCA saja
- ✅ Playwright E2E Test Suite (81 tests)

### Yang masih dalam pengerjaan

- 🔄 **Referral System** — Kode referral di profile, input di checkout, history
- 🔄 **Commission Payout** — Sistem pencairan komisi agen
- 🔄 **Loyalty Points** — Poin loyalitas untuk user

### Gap / tech debt yang masih terbuka

- ⚠️ API auth middleware belum terpasang di semua endpoint (57 endpoint public)
- ⚠️ Payment gateway integration (webhook Midtrans belum aktif)
- ⚠️ File upload system (media/gallery) belum ada
- ⚠️ Email/WhatsApp notifications belum ada

## 4. Arsitektur

### Struktur Folder

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin pages (13 halaman)
│   ├── api/                # API routes (25+ endpoints)
│   ├── blog/               # Public blog pages
│   ├── checkout/           # Checkout flow
│   ├── login/              # Auth pages
│   ├── profile/            # User profile
│   └── ...
├── modules/                # Feature modules (controller/service/repository)
│   ├── auth/               # Authentication
│   ├── booking/            # Booking system
│   ├── referral/           # Referral & commission
│   ├── trip/               # Trip management
│   └── promotion/          # Promotions
├── components/             # Shared UI components
│   ├── checkout/           # Checkout components
│   ├── profile/            # Profile components
│   └── layout/             # Layout (Navbar, Footer)
├── lib/                    # Utilities
│   ├── hooks/              # Custom hooks
│   └── auth-client.ts      # Auth client
└── db/                     # Database
    ├── schema/             # Drizzle schema (11 files)
    └── seed.ts             # Database seeder
```

### Pattern: Module Architecture

Setiap module di `src/modules/` mengikuti pattern:

```
*.schema.ts     → Database schema (Drizzle)
*.repository.ts → Database queries
*.service.ts    → Business logic
*.controller.ts → API handlers
index.ts        → Public exports
```

### Database Tables (35+ tabel)

| Domain | Tables |
|--------|--------|
| Users & Auth | `users`, `profiles`, `auth_tokens`, `user_sessions` |
| Master Data | `destinations`, `horeca`, `vendors`, `media` |
| Trip Catalog | `trips`, `trip_departures`, `trip_prices`, `itinerary_items` |
| Booking & Payment | `bookings`, `booking_items`, `payments`, `refunds` |
| Reviews | `reviews`, `review_media` |
| Referral & Commission | `referrals`, `commissions`, `commission_rules`, `commission_payouts` |
| Promotions | `promotions`, `promotion_usages` |
| Blog | `blogs`, `blog_categories` |
| Private Trip | `private_trip_requests`, `private_trip_proposals` |

## 5. Tech Stack Detail

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| UI Components | ShadCN, Lucide Icons |
| State Management | React hooks, TanStack Table |
| Backend | Next.js API Routes |
| Database | Neon PostgreSQL (pooled) |
| ORM | Drizzle ORM |
| Auth | Better Auth (email/password, Google OAuth) |
| Payment | Midtrans (manual transfer) |
| Testing | Playwright (E2E), Vitest (unit) |
| Deployment | Vercel / Self-hosted |

## 6. Sumber Referensi

| Dokumen | Lokasi |
|---------|--------|
| PRD | `docs/PRD.md` |
| Flow Diagrams | `docs/flow.md` |
| Database Schema | `docs/database/erd_revisi.mermaid` |
| Database Guide | `docs/database/PANDUAN_DATABASE.md` |
| Feature Tracker | `feature_list.json` |
| Progress Log | `progress.md` |

---

*Last updated: 6 September 2026*
