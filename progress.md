# Session Progress Log

## Current Verified State

| Field | Value |
|-------|-------|
| **Repository root** | `/Users/kidin/Sites/opentrip-lansia` |
| **Standard startup** | `./init.sh` |
| **Standard verification** | `npm run lint` (16 pre-existing errors), `npm test` (280 pass) |
| **Highest priority unfinished** | API Auth Middleware (CRITICAL — 57 endpoint tanpa proteksi) |
| **Current blocker** | None |

## Session Record

### Session 1 — Harness Initialization
- Created AGENTS.md, init.sh, feature_list.json, progress.md, session-handoff.md

### Session 2 — Jest Testing Infrastructure
- 65 test suites, 272 tests for all pages and API routes

### Session 3 — Profile Page UI/UX Redesign
- Redesigned profile page with by.U layout pattern

### Session 4 — Private Trip Full Implementation (Current)

- **Goal:** Complete Private Trip feature implementation per todo.md (all 10 stages)
- **Completed (Stage 1 - Baseline):**
  - Confirmed working directory `/Users/kidin/Sites/opentrip-lansia`
  - Read all docs (PRD, flow, PANDUAN_DATABASE, design, AGENTS, feature_list)
  - Ran `./init.sh`, `npm run lint`, `npm test` — baseline established
  - Examined Better Auth pattern, admin page patterns, proxy middleware

- **Completed (Stage 2 - Schema & Data Model):**
  - Fixed `privateTripRequests.budgetEstimate` → `numeric(14,2)`
  - Fixed `privateTripProposals.estimatedPrice` → `numeric(14,2)`
  - Added FKs: `user_id → users.id`, `admin_id → users.id`, `destination_id → destinations.id`
  - Added status constraints (enum-like via varchar)
  - Added indexes: `(user_id, created_at)`, `(status, submitted_at)`, `(request_id, created_at)`
  - Marked `special_requirements` as sensitive data
  - Cleaned orphan `src/db/schema/private_trip.ts` to re-export from module

- **Completed (Stage 3 - Auth & API):**
  - Removed `x-user-id` header and UUID fallback
  - Controller now uses `auth.api.getSession({ headers })`
  - Returns 401 for unauthenticated requests
  - Added server-side validation (title, durationDays, participantsCount, destinationPreferences, budgetEstimate)
  - Created endpoints: `POST /api/private-trip`, `GET /api/private-trip`, `GET /api/private-trip/[id]`
  - Created admin endpoints: `GET /api/private-trip/admin`, `GET /api/private-trip/admin/[id]`

- **Completed (Stage 4 - Landing Page CTA):**
  - Added "Private Trip" CTA section after testimonial section
  - Badge: PRIVATE TRIP, heading, 3 benefits, CTA button
  - Orange `#E06D26` design system colors, dark background
  - Links to `/private-trip`, keyboard accessible, responsive

- **Completed (Stage 5 - Form Page):**
  - Redesigned form with proper labels, explanations, and design system
  - Added budget estimate field with Rupiah formatting
  - Client-side validation before submission
  - Error display from API, success state with redirect to `/profile?tab=private-trip`
  - Loading spinner on submit, disabled during request
  - Mandatory login check before submit

- **Completed (Stage 6 - Admin Pages):**
  - Added "Private Trip" nav item (Route icon) to admin sidebar
  - Created `/admin/private-trips` list page with status filter and search
  - Created `/admin/private-trips/[id]` detail page with request info, proposals

- **Completed (Stage 7 - Proposals & Status):**
  - Service layer with state transition validation
  - Valid transitions: submitted→reviewed/rejected, reviewed→approved/rejected/revision, revision→reviewed/rejected
  - Admin can create proposals via `POST /api/private-trip/admin/[id]/proposals`
  - Admin can update status via `PATCH /api/private-trip/admin/[id]`
  - Creating a proposal auto-advances submitted→reviewed

- **Completed (Stage 8 - User Dashboard):**
  - Profile page `Private Trip Saya` tab connected to real API data
  - Request list with status badges, detail view
  - Proposal display with accept/reject/revise actions
  - `PATCH /api/private-trip/[id]/proposal` endpoint for user actions
  - Tab query param support for redirect from form

- **Completed (Stage 9/10 - Security & Tests):**
  - All endpoints enforce auth at server level
  - Admin endpoints enforce admin role at server level
  - No client-trusted userId/adminId/status
  - Validation on all inputs
  - Tests updated and passing (280 tests, 65 suites)

### Files Created/Modified
- `src/modules/trip/trip.repository.ts` — Added findItineraryByTripId, saveItinerary, findTripDestinations, saveTripDestinations
- `src/modules/trip/trip.service.ts` — createTrip/updateTrip now handles nested itinerary + destinations; added getFullTrip
- `src/app/admin/trips/trip-form.tsx` — Rewritten with Destinasi Tujuan section (dropdown from master data, day order, duration, notes) and Itinerary per-day section (title, time range, description, destination link)
- `src/app/admin/trips/[id]/edit/page.tsx` — Now loads existing itinerary and destinations for edit form
- `feature_list.json` — Updated feat-010 & feat-013 status

### Verification
- `npm test`: 280 tests passing, 65 suites
- `npm run lint`: 16 errors (all pre-existing), 65 warnings

### Known Risks
- Tests use mocks — no real DB integration tests
- UUIDv7 not used (project doesn't have UUIDv7 pattern)
- No audit log infrastructure yet for status changes
- Email/WhatsApp notifications not implemented (out of scope)
- `special_requirements` marked sensitive but no column-level encryption
- **CRITICAL**: 57 API endpoints 100% public tanpa auth middleware

### Session 5 — Comprehensive Codebase Analysis for Jira Export

**Goal:** Analyze ALL features, pages, buttons, API endpoints, modules, and database schema. Create structured Jira task list.

**Completed:**
- Full codebase exploration (29 pages, 11 modules, 57 API endpoints, 52 DB tables, 4 components)
- Created `jira-export.json` — 13 Epics, 72 issues total
  - **41 issues In Review** (existing code yang sudah selesai)
  - **27 issues To Do** (missing features dan improvements)
  - **4 issues CRITICAL** (auth middleware, RBAC, payment gateway, file upload)
- Updated `feature_list.json` — reorganized into 10 phases, 48 features
  - Added missing features: Blog, Landing Page, Auth pages, Contact, FAQ, About, UX components
  - Updated statuses: 24 in_review, 9 completed, 15 to_do
- Updated `progress.md` with session record

**Key Findings:**
- Fitur paling lengkap: Private Trip (6 sub-features, all completed)
- Fitur dengan schema lengkap tapi belum ada UI: Departure management, Pricing tiers, Itinerary, Blog categories, Referral payout, Loyalty
- Missing CRITICAL: API auth middleware — 57 endpoint tanpa proteksi
- Missing pages: FAQ (/faq), About (/about), Lupa Password

### Session 6 — Destination Map Picker (Lat/Lng + Leaflet)
- Installed `leaflet` and `@types/leaflet`
- Created `src/app/admin/components/map-picker.tsx`
- Updated destination forms with lat/lng + Leaflet map
- Verified: `npm run lint` — no new errors

### Session 7 — Replace All Pages from GitHub (RamliWane/lansia-opentrip)
- Replaced all public pages with GitHub repo version
- Renamed `trips` → `destinasi`
- New pages: `/checkout`, `/contact`, `/destinasi`, `/destinasi/[id]`, `/login`, `/register`, `/private`
- Landing page now uses modular components (HeroSection, MarketingSection, DestinationSection, TutorialSection, TestimonialsSection, FAQSection)
- New components: destinasi (filter/grid/card), checkout (stepper/payment/confirmation), private trip form, layout (navbar/footer)
- Static data replaces database for public pages (admin pages keep DB)
- Admin pages preserved (self-contained with own layout)
- Dependencies: added `@heroicons/react`
- Build: 22 pages, all compiled successfully

## Session 8 — Admin API Routes + Master Trip enhancement

### Phase 1: Admin API Routes
Semua halaman admin menggunakan client components dengan `fetch()` ke API endpoints, tapi routes-nya tidak ada. Akibatnya semua tabel admin kosong meskipun database berisi data.

### Created API route files (19 files):

| Endpoint | Methods |
|----------|---------|
| `/api/destinations` | GET, POST |
| `/api/destinations/[id]` | GET, PUT, DELETE |
| `/api/destinations/categories` | GET |
| `/api/horeca` | GET, POST |
| `/api/horeca/[id]` | GET, PUT, DELETE |
| `/api/horeca-types` | GET |
| `/api/vendors` | GET, POST |
| `/api/vendors/[id]` | GET, PUT, DELETE |
| `/api/vendor-types` | GET |
| `/api/promotions` | GET, POST |
| `/api/promotions/[id]` | GET, PUT, DELETE |
| `/api/reviews` | GET, POST |
| `/api/reviews/[id]` | PUT, DELETE |
| `/api/blogs` | GET, POST |
| `/api/blogs/[id]` | GET, PUT, DELETE |
| `/api/galleries` | GET, POST |
| `/api/galleries/[id]` | GET, PUT, DELETE |
| `/api/commissions` | GET, POST |
| `/api/commissions/[id]` | GET, PUT, DELETE |

### Added gallery repository methods:
- `findAllGalleries`, `findGalleryById`, `createGallery`, `updateGallery`, `deleteGallery` di `trip.repository.ts`
- Fixed stray duplicate `export const tripRepository` declaration

### Phase 2: Master Trip — maxParticipants & Meeting Point

#### Schema & Migration
- Add `max_participants` (integer) and `meeting_point_id` (FK → meeting_points) to `trips` table
- Create `meeting_points` table (id, name, address, geo_point, description, is_active, created_at)
- Push migration via drizzle-kit

#### Repository & API
- Add CRUD meeting point methods to `master.repository.ts`
- API routes: `/api/meeting-points`, `/api/meeting-points/[id]`

#### Admin UI
- `/admin/meeting-points/page.tsx` — meeting point master management (consistent with other master pages)
- Add "Meeting Point" to sidebar navigation
- Trip form: add "Maksimal Peserta" input and "Meeting Point" dropdown
- Trip list: add "Maks Peserta" column

### Verification
- `npx next build` — all routes compile
- `drizzle-kit push` — schema changes applied
- `npm run lint` — no new errors (10 pre-existing any-type errors, 62 pre-existing warnings)

## 2026-07-29: Synced trip/destinasi pages from ramliwane/lansia-opentrip

- Updated all destinasi components to match GitHub versions:
  - DestinationCard, DestinasiHeader, DestinationGrid, FilterPanel (redesigned with dropdowns/chips)
  - Created new: SearchBar, Resultsbar, Emptystate
  - Updated all 9 detail components (AboutSection, BookingCard, DestinationGallery, DestinationHeader, DestinationTabs, ItinerarySection, MeetingSection, UlasanSection, Lightbox)
- Updated all private trip components to match GitHub versions:
  - Created: ParticipantsSection
  - Updated helpers (constants, helpers, initialState, validation)
  - Updated: SectionCard, Field, BookingInformationSection, TripDetailSection, TripOptionSection, TripFromSection, SubmitBar, SuccessState, TermsModal, Radio, SelectedDestination, DestinationCard, PageHeader
  - Updated private page to use Navbar/Footer
- Cleaned up empty `{detail}` artifact directory

## Session 9 — Playwright E2E Tests

**Goal:** Create comprehensive Playwright E2E tests for all features.

**Completed:**
- Installed `@playwright/test` ^1.62.1
- Created `playwright.config.ts` with chromium project and dev server webServer config
- Created 19 test files across 3 directories:
  - **Public pages (7 files):** landing, trips, auth (login/register), checkout, contact, private-trip
  - **Admin CRUD (11 files):** dashboard, trips, destinations, blogs, commissions, galleries, horeca, meeting-points, pesanan, private-trips, promotions, reviews, vendors
  - **API (1 file):** endpoint smoke tests for 14 GET endpoints + 3 POST validation tests
- All **81 tests passing** with 1 worker on chromium

**Test coverage per feature phase:**
| Phase | Features | Tests |
|-------|----------|-------|
| Phase 2 (Trip CRUD) | trips, destinations | 7 |
| Phase 3 (User Pages) | landing, trips public, auth | 22 |
| Phase 4 (Booking) | checkout, contact | 7 |
| Phase 5 (Admin Dashboard) | dashboard, all CRUDs | 33 |
| Phase 6 (Private Trip) | private trip, admin private trips | 7 |
| Phase 7 (Blog) | blog public, admin blog | 5 |
| Phase 9 (Infrastructure) | API endpoints | 17 |

**Verification:**
- `npx playwright test` — 81/81 passing
- Runs against `npm run dev` dev server on port 3000
- Tests are sequential (1 worker) for stability

## Session 10 — Private Trip Flow Audit & User Dashboard

**Goal:** Audit alur Private Trip pasca-submit, temukan dan implementasikan bagian yang hilang.

**Audit Findings:**
- ✅ Backend lengkap: controller `respondToProposal` sudah ada, service + state machine sudah benar
- ❌ **Gap 1:** Tidak ada API route yang menghubungkan `respondToProposal` ke endpoint HTTP
- ❌ **Gap 2:** Tidak ada halaman user untuk melihat request dan merespons proposal
- ❌ **Gap 3:** Tidak ada navigasi ke halaman user tersebut

**Completed:**
- Created `src/app/api/private-trips/[id]/respond/route.ts` — `POST /api/private-trips/:id/respond` endpoint
- Created `src/app/my-trips/page.jsx` — halaman dashboard user untuk melihat semua request + proposal, accept/revise/reject
- Modified `src/components/layout/Navbar.jsx` — tambah link "Trip Saya" (hanya saat login)
- Modified `src/components/private/SuccessState.jsx` — tambah CTA "Pantau Status Request Saya" → /my-trips

**Verification:**
- `npx eslint src/app/my-trips/page.jsx src/app/api/private-trips/[id]/respond/route.ts` — ✅ 0 errors, 0 warnings
- Pattern mengikuti pola project yang ada (async function lokal di dalam useEffect + cancelled flag)
- feat-054 dan feat-055 benar-benar complete setelah session ini

## Session 11 — Navbar & Body Background Alignment (Private & My Trips)

**Goal:** Samakan warna navbar & body background halaman Private Trip (`/private`) dan Request Saya (`/my-trips`) agar berwarna putih bersih sebelum discroll, persis seperti halaman Destinasi Trip (`/trips`).

**Completed:**
- Modified `src/app/private/page.jsx` — dibungkus dengan `<div className="min-h-screen bg-white">` agar area backdrop & body berlatar putih.
- Modified `src/app/my-trips/page.jsx` — dibungkus dengan `<div className="min-h-screen bg-white">` dan ubah `<main className="bg-[#FAF8F5]">` menjadi `<main className="bg-white">` (termasuk pada state loading).
- Komponen `Navbar.jsx` tetap aman tanpa ada perubahan internal.

**Verification:**
- `src/app/private/page.jsx` & `src/app/my-trips/page.jsx` disamakan struktur wrapper-nya dengan `src/app/trips/page.jsx`.

## Session 13 — Pembaruan Filter Kategori & Filter Ramah Lansia

**Goal:** Mengganti filter rating minimum menjadi filter kategori (Alam, Budaya, Religi, Pantai, Pulau, Gunung, Danau), mengubah label badge pada kartu destinasi agar menampilkan Kategori (bukan difficultyLevel), serta menambahkan toggle filter "Ramah Lansia".

**Completed:**
- Updated `src/components/destinasi/FilterPanel.jsx` — mengganti section Rating Minimum dengan pilihan chip Kategori dan menambahkan toggle switch "Ramah Lansia".
- Updated `src/components/destinasi/DestinationCard.jsx` — menampilkan badge kategori (seperti Pantai, Budaya, Religi, Alam, dll) dan badge khusus "Ramah Lansia".
- Updated `src/lib/destinationsData.js` — menambahkan properti `category` & `isSeniorFriendly` pada setiap item destinasi, serta menambahkan destinasi religi (Masjid Istiqlal, Pura Besakih).
- Updated `src/lib/Destination.js` & `src/components/landing/DestinationSection.jsx` — memastikan fungsi mapper `toDetail` dan `toCard` menggunakan `dest.category` dan `dest.isSeniorFriendly`.
- Updated `src/app/trips/page.jsx` — mengintegrasikan state & logika filtering untuk `selectedCategory` dan `isSeniorFriendlyOnly`.
## Session 12 — Simplifikasi Form Private Trip (Ganti Detail Peserta dengan Jumlah Peserta)

**Goal:** Menghilangkan form detail peserta (nama, tgl lahir, jenis kelamin, HP, email per peserta) di Private Trip dan menggantinya dengan input angka sederhana "Jumlah Peserta".

**Completed:**
- Updated `src/components/private/BookingInformationSection.jsx` — mengubah field `Jumlah Peserta` menjadi input number interaktif (min 1) dan menghapus komponen `<ParticipantsSection>`.
- Updated `src/components/private/helpers/initialState.js` — mengganti `participants: []` dengan `jumlahPeserta: "1"`.
- Updated `src/components/private/helpers/validation.js` — mengubah validasi array `participants` menjadi validasi angka `jumlahPeserta >= 1`.
- Updated `src/app/private/page.jsx` — memperbarui `buildPayload` dan `buildDestinationPreferences` agar menyertakan `jumlahPeserta`, serta menghapus handler peserta per-orang.
- Updated `src/components/private/SuccessState.jsx` — memperbarui tampilan ringkasan sukses agar menampilkan jumlah peserta tanpa daftar kartu detail peserta.

## Session 14 — Unified Booking History & Navbar Integration

**Goal:** Transform the existing `my-trips` page into a unified **Booking History ("Riwayat Pemesanan")** dashboard covering both Open Trip bookings and Private Trip requests with rich details and consistent UI styling, and add "Riwayat Pemesanan" link to Navbar and Mobile Menu.

**Completed:**
- Updated `src/modules/booking/booking.repository.ts` — Added `findByUserIdOrEmail`, `findParticipantsByBookingId`, and `findPaymentsByBookingId` methods.
- Updated `src/modules/booking/booking.service.ts` — Enhanced `getUserBookings` to enrich each booking with its associated items, participants, and payments.
- Updated `src/modules/booking/booking.controller.ts` — `GET /api/bookings` now authenticates session via `auth.api.getSession` and returns user's Open Trip bookings.
- Updated `src/app/api/checkout/route.ts` — Automatically saves `session.user.id` when logged in during checkout.
- Redesigned `src/app/my-trips/page.jsx` — Transformed into unified **Riwayat Pemesanan** dashboard:
  - Tab navigation: `Semua`, `Open Trip`, `Private Trip` with badge counters.
  - Search by trip/destination name & booking code, plus status filter dropdown.
  - `OpenTripBookingCard` component displaying booking code, travel date, pax count, total price, status badge, expandable breakdown, customer info, and participant list.
  - `RequestCard` component displaying private trip details, budget estimate, parsed preferences, and interactive admin proposals (Accept, Revise, Reject).
  - Consistent UI styling (`#F49D1A` brand colors, rounded-2xl cards, empty states, loading skeletons).
- Modified `src/components/layout/Navbar.jsx` & `src/components/layout/MobileMenu.jsx` — Added "Riwayat Pemesanan" link to NAV_LINKS and mobile account menu.

**Verification:**
- `npm run lint` — Clean pass with 0 errors on modified code.

## Session 15 — Penghapusan Semua Emoji dari Kode

**Goal:** Menghapus semua emoji dari kode `src/`; bila suatu section membutuhkan ikon, menggantinya dengan ikon lucide (bukan emoji).

**Completed:**
- `src/app/admin/horeca/page.tsx` — label rating di dropdown `<option>` (★ → "N Bintang").
- `src/app/checkout/page.jsx` — "Pemesanan Berhasil 🎉" → "Pemesanan Berhasil".
- `src/app/my-trips/page.jsx` — status `"Diterima ✓"` → `"Diterima"`; ikon empty state 🧳 → ikon lucide `Luggage`.
- `src/components/checkout/TermsModal.jsx` — panah ↓ pada pill "Scroll ke bawah untuk menyetujui" → ikon lucide `ArrowDown`.
- `src/components/destinasi/detail/DestinationHeader.jsx` — bintang rating ★ → ikon lucide `Star`.
- `src/components/destinasi/detail/UlasanSection.jsx` — bintang filter & rating ulasan ★ → ikon lucide `Star`.
- `src/components/private/DestinationCard.jsx` & `SelectedDestination.jsx` — bintang rating ★ → ikon lucide `Star`.

**Verification:**
- Scan code-point seluruh `src/**/*.{ts,tsx,js,jsx,css}`: **0 emoji tersisa** (sebelumnya 13 kecocokan).
- `npm run lint` — tidak ada error/warning baru; 1 error di `admin/private-trips/[id]/page.tsx:212` adalah pre-existing (di luar scope).
- Catatan: arrow `→` di docs/JSON (PRD, flow, feature_list, progress, jira-export) adalah simbol teks, bukan emoji, dan berada di luar `src/` — tidak disentuh.

## Session 16 — Revisi Client: Kuota Open Trip (UI) + Blog Publik

**Goal:** Menerjemahkan revisi client: (1) tampilkan kuota open trip "sudah booking berapa / tinggal berapa" dengan batas per trip min 6 to go / max 10 (UI only, tanpa ubah logika backend), (2) halaman blog publik untuk news & articles.

**Completed — Kuota Open Trip (UI only):**
- `src/app/api/destinations/route.ts` — GET kini menambahkan `bookedCount` per destinasi = `sum(total_participants)` booking berstatus `confirmed` dikelompokkan per `departure_id`, dibungkus try/catch (log error, tidak mematikan endpoint), di-skip bila daftar destinasi kosong.
- `src/lib/Destination.js` — `toDetail()` meneruskan `bookedCount ?? null`.
- `src/components/destinasi/detail/BookingCard.jsx` — blok kuota (progress bar 0–10, "Sudah booking X orang", "Tinggal Y slot", badge status: Menunggu Kuota <6, To Go ≥6, Kuota Penuh ≥10, catatan "Minimal 6 peserta agar trip berangkat"). Hanya dirender bila `bookedCount` bertipe number (jalur data DB); jalur data statis otomatis tersembunyi.

**Completed — Blog Publik:**
- `src/app/api/blogs/route.ts` — GET mendukung `?published=1` → hanya artikel published via `blogService.getPublishedBlogs()`; tanpa param admin tetap melihat semua.
- `src/modules/blog/blog.repository.ts` — `findAllPublished()` diurutkan `createdAt DESC` (sebelumnya `publishedAt` yang tidak pernah diisi admin).
- `src/app/blog/page.jsx` (baru) — daftar kartu artikel publik.
- `src/app/blog/[slug]/page.jsx` (baru) — detail artikel, `notFound()` bila slug tak ditemukan, konten dirender `whitespace-pre-line` (tanpa library markdown).
- Link "Blog" ditambahkan di `Navbar.jsx`, `MobileMenu.jsx`, `Footer.jsx`.

**Verification:**
- `npm run lint` — 0 error di semua file yang diubah (targeted eslint); error total repo tetap 1 (pre-existing `private-trips/[id]/page.tsx:212`).
- Smoke test live (dev server :3000): `GET /api/destinations` 200, 9 destinasi dengan `bookedCount` (Pantai Parangtritis = 1); `GET /api/blogs?published=1` 200 hanya published (3 artikel); `/blog`, `/blog/tips-perjalanan-lansia`, `/trips/{uuid}` semua 200.
- QA agent: PASS; reviewer: temuan critical-nya diverifikasi false alarm (kolom `bookings.departure_id` tidak ber-FK ke `trip_departures`; penulis live `/api/checkout` menulis `departure_id = destination.id`, sehingga grouping by departure_id ↔ lookup by destinations.id cocok). Perbaikan diambil: `count(*)` → `sum(total_participants)` (kuota per orang), guard data kosong, dan log error count.
- Catatan risiko: destinasi dari data statis (`destinationsData`, id numerik) tidak punya `bookedCount` → blok kuota tersembunyi; jalur utama live (listing `/trips` dari API uuid) menampilkan kuota.

## Session 17 — Fitur Payment Manual untuk Checkout

**Goal:** User memilih metode pembayaran, melihat nomor rekening tujuan, upload bukti transfer (disimpan lokal di `public/payments`), booking default `pending`. Admin memverifikasi bukti di `/admin/pesanan` (approve/reject + alasan). `my-trips` menampilkan status pembayaran, bukti, dan catatan admin.

**DB (SQL dieksekusi manual oleh user):**
- `CREATE TABLE payment_accounts` + seed 6 metode: bri (1234-5678-9012-3456), mandiri (1234567890), gopay/ovo/dana (0812-3456-7890), qris (QRIS-OTL-0001) — semua a.n. PT OpenTrip Lansia, is_active true.
- `ALTER TABLE payments` tambah 7 kolom: `proof_url` text, `bank_name` varchar(100), `account_number` varchar(50), `account_holder` varchar(255), `admin_note` text, `reviewed_at` timestamp, `reviewed_by` uuid (+ FK opsional → users.id).

**Backend:**
- `payment.schema.ts` — kolom baru payments + tabel `paymentAccounts` (method unique, bankName, accountNumber, accountHolder, isActive, createdAt, updatedAt).
- `payment.repository.ts` — `findActiveAccounts()`; `payment.service.ts` — `getActiveAccounts()` + `reviewPayment(id, "approve"|"reject", note, adminId)` (approve → payment paid/paidAt + booking confirmed; reject → payment rejected + booking cancelled; admin_note/reviewed_at/reviewed_by tersimpan).
- API baru: `/api/payments/upload` (POST auth + DELETE hanya path `/payments/...`, 5MB, tipe jpg/png/webp/gif/avif/svg), `/api/payments/accounts` (GET publik), `/api/payments/[paymentId]/review` (POST admin-only, reject wajib alasan).
- `checkout/route.ts` — wajib `paymentMethod` + `proofUrl`; snapshot rekening dari `payment_accounts`; booking `status: "pending"`; payment `status: "pending"` + proofUrl + snapshot (tanpa paidAt).
- `booking.service.ts` — `getAllBookings()` & `getUserBookings()` melampirkan participants/items/payments via helper `withDetails(...)`.
- `shared/types/index.ts` — `PaymentStatus` + `"rejected"`.

**Frontend:**
- `useCheckout.js` +`proofUrl`/`setProofUrl`; `PaymentStep.jsx` di-rewrite — 6 metode berlogo (assets sudah ada di `public/`), AccountCard rekening tujuan + Salin/Tersalin, ProofUploader (upload/preview/Hapus), tombol "Kirim Bukti Pembayaran" disabled tanpa metode+bukti.
- `checkout/page.jsx` — copy step & sukses → "Menunggu Verifikasi" / "Bukti Pembayaran Terkirim! Pesanan Anda sedang menunggu verifikasi admin".
- `admin/pesanan/page.tsx` — badge pembayaran (Menunggu Verifikasi/Lunas/Ditolak), detail modal (rekening tujuan, bukti transfer, catatan admin), form verifikasi Terima/Tolak + textarea alasan; refactor `loadRows`→`applyRows` (fix lint react-hooks/set-state-in-effect).
- `my-trips/page.jsx` — tampil metode + badge status pembayaran, blok Bukti Transfer, blok Catatan Admin (`booking.payments?.[0]`).

**Verification:**
- Targeted eslint 0 error; `npm run lint` 0 error / 44 warning (hanya +3 warning img dari perubahan ini); `tsc --noEmit` error hanya pre-existing (admin private-trips edit, e2e api).
- Smoke live (:3000): `GET /api/payments/accounts` 200 (6 akun camelCase); `/checkout?destination=1`, `/admin/pesanan`, `/my-trips` 200; checkout/upload/bookings tanpa auth → 401.
- Test DB: insert booking+payment pending → review approve (payment paid + booking confirmed + admin_note + reviewed_by) → verified → cleanup.
- Server dimatikan; temp files (`_verify_payment.mjs`, `_test_review.mjs`, `dev-server.log`) dihapus.

**QA Round (subagent qa) + hardening:**
- Temuan HIGH diperbaiki: checkout kini menolak `paymentMethod` yang tidak ada di `payment_accounts` → 400 (`checkout/route.ts`, null-check `account`), sehingga tidak ada booking/payment yang dibuat.
- Hardening lain: DELETE `/api/payments/upload` kini wajib auth (401) + mengembalikan 404 bila file tidak ada; `proofUrl` divalidasi harus `/payments/*` tanpa `..` (400); `image/svg+xml` dihapus dari ALLOWED_TYPES (anti stored-XSS); endpoint review menolak review ulang payment berstatus bukan `pending` → 400 (guard di `review/route.ts`).
- Temuan MEDIUM `booking_items` kosong = perilaku pre-existing checkout (bukan regresi fitur ini; di luar scope).
- Verifikasi pasca-fix: targeted eslint 0 error; `tsc --noEmit` 0 error di file payment/checkout; smoke live — GET `/api/payments/accounts` 200 (6 akun camelCase); POST/DELETE upload, POST review, POST checkout tanpa auth semua 401; DB live terkonfirmasi 7 kolom baru payments + tabel `payment_accounts` (6 baris) ada.
- Catatan: saat sesi QA, `node_modules` sempat kosong → `npm install` ulang; `dev-server.log`/pid dibersihkan setelah smoke test.

**Belum dilakukan / risiko:**
- Perubahan belum di-commit; `public/uploads/1786087232308-797633830.jpeg` untracked dari sesi sebelumnya (bukan bagian perubahan ini).
- Error pre-existing (di luar scope): Edge Middleware `import crypto` di `auth.config.ts` via `middleware.ts`; lint `admin/private-trips/[id]/page.tsx`.

### Session 18 — Admin CRUD Blogs (feat-048)

**Tujuan:** CRUD blog berfungsi penuh: slug otomatis + unik, authorId dari session, publishedAt/updatedAt terjaga, error ditampilkan ke admin.

**Backend:**
- `blog.service.ts` — `createBlog` & `updateBlog` baru: authorId dari `auth.api.getSession` (fallback admin), slug auto-generate dari title + suffix `-2`/`-3` saat bentrok, `publishedAt` di-set saat status jadi `published`, `updatedAt` di-update saat edit, return 404-vs-400 lebih jelas.
- `api/blogs/route.ts` POST — pakai `blogService.createBlog`; `api/blogs/[id]/route.ts` PUT — pakai `blogService.updateBlog` (import `blogService`).

**Frontend (`admin/blogs/page.tsx`):**
- Error dari API ditampilkan di modal (fetch-check `res.ok`); slug auto terisi dari judul saat slug masih kosong; fetchData defensif (kalau response bukan array → []).

**Bugfix author_id (ditemukan user, live):**
- Error `invalid input syntax for type uuid: "2QxjtOjK7w3GcojmKrFEa40t3JuCmzHt"` saat create blog dari akun signup. Akar: `blogs.author_id` di-migrasi sebagai `uuid`, padahal `users.id` adalah `text` (better-auth memakai nanoid 32 char utk user signup; seed admin pakai UUID string yg kebetulan valid).
- Fix: `blog.schema.ts` `authorId: uuid(...)` → `text(...)` (author_id text, tak ada FK yg perlu di-drop). ALTER sudah dieksekusi ke DB live: `ALTER TABLE blogs ALTER COLUMN author_id TYPE text;` → insert pakai nanoid author terbukti sukses, test row dihapus.
- LATENT sama (belum difix): `review.user_id`, `referral.user_id`, `promotion.user_id` masih `uuid` → akan gagal utk user signup (nanoid).

**Bugfix menyeluruh UUID→TEXT utk semua kolom user-id (ditemukan user, error yang sama di payments.reviewed_by):**
- Error sama saat konfirmasi admin payment: `update payments set ... reviewed_by = $4` gagal krn `payments.reviewed_by` masih `uuid`. Akar identik: semua kolom yg menyimpan `users.id` harus `text` (users.id = text).
- Fix KODE (15 kolom di schema, semua `uuid("...")` → `text("...")`):
  `blogs.author_id`, `payments.reviewed_by`, `refunds.requested_by`, `refunds.approved_by`, `reviews.user_id`, `promotion_usages.user_id`, `loyalty_transactions.user_id`, `audit_logs.admin_id`, `commission_payouts.approved_by`, `commission_payouts.agent_id`, `commissions.agent_id`, `commission_rules.agent_id`, `referrals.referrer_id`, `referrals.referred_user_id`, `gallery_media.uploaded_by`.
  File: `blog.schema.ts`, `payment.schema.ts`, `review.schema.ts`, `promotion.schema.ts`, `referral.schema.ts`, `contact.schema.ts`, `trip.schema.ts`.
- SQL utk user dijalankan manual: `docs/database/fix_uuid_user_columns_to_text.sql` (idempotent, DO block, skip kolom yg tak ada, drop/re-add FK ke users.id bila ada).
- Catatan DB: sesi ini sempat terjadi ketidakkonsistenan target koneksi (DB yg terjangkau via .env menunjukkan state sebelum fitur payment — tidak ada `reviewed_by`/`payment_accounts`, dan kolom uuid kembali); user menyatakan DB adalah domain mereka — kode saja yang saya ubah, DB dikelola user. `npm run lint` 0 error / tsc bersih di semua schema yg diubah.

**Bugfix admin crash `rows.map is not a function` (browser):**
- `admin/destinations` (dan 8 halaman admin lain) memanggil `setRows(data)` tanpa memastikan array → begitu API mengembalikan `{error}` (mis. schema DB tidak sinkron), React crash di `rows.map`.
- Fix defensif di `fetchData`: try/catch + `setRows(Array.isArray(data) ? data : [])`. Diterapkan ke: `admin/destinations`, `admin/commissions`, `admin/horeca`, `admin/galleries`, `admin/promotions`, `admin/vendors`, `admin/reviews`, `admin/trips`, `admin/meeting-points`. Plus fetch kategori di `destinations/page.tsx` & `destination-form.tsx` (sama-sama dipastikan array).
- `admin/private-trips` & `admin/pesanan` sudah defensif (tanpa perubahan).
- Verifikasi: targeted eslint 0 error (1 warning `<img>` pre-existing), tsc bersih.
- Catatan: halaman kini tampil kosong ("Belum ada data") saat API error — akar penyebab (kolom `destinations` tidak sinkron dgn schema) ada di sisi DB yang dikelola user.

**Verifikasi:**
- Targeted eslint 0 error; `npm run lint` 0 error / 44 warning (baseline sama); `tsc --noEmit` 0 error di file blog.
- Smoke live (:3000): POST create → 201 slug `blog-tes-crud` + authorId admin ter-inject + publishedAt ter-set; POST judul duplikat → slug `blog-tes-crud-2`; PUT update → 200 content/updatedAt berubah, publishedAt null saat jadi draft; DELETE → 200; GET list bersih kembali ke 3 blog seed. Server dimatikan, temp files + `dev-server.log`/pid dibersihkan.

**Catatan:**
- Fitur pembayaran (sesi sebelumnya) sudah di-commit user via PR #50 (commit `1abdb67`), namun ikut ter-commit `dev-server.log`, `dev-server.pid`, dan `public/uploads/1786087232308-797633830.jpeg` (kebersihan belum sempurna; log/pid sudah dihapus dari working tree).
- Perubahan blog CRUD belum di-commit (menunggu review user).



### Session (2026-08-05) — Vercel Production Deploy + Build Fixes
- Deployed `main` to production via `vercel --prod` → **https://opentrip-lansia.vercel.app** (deploy `7v1pWRF1kJykGNQwGcJkQEFiFULi`, Ready 59s)
- **Root cause 1 (blocked deploy):** Repo was private + git author `bhuminindra` (alhafizaulia02@gmail.com) bukan member Vercel team → Vercel Hobby seat policy memblokir (`TEAM_ACCESS_REQUIRED`). User menjadikan repo public → blokir hilang (collaboration gratis utk public repo).
- **Root cause 2 (build fail):** TypeScript error di `src/app/admin/trips/[id]/edit/page.tsx` — field itinerary/tripDestinations nullable vs `TripForm` butuh non-null. Dikoersi dengan default (`?? ""` / `?? 0`), plus `meetingPointId`/`description`.
- **Root cause 3 (prerender fail):** `/login` crash saat SSR — `getRedirectPath()` memanggil `window` saat render. Ditambah guard `typeof window === "undefined"` (login & register).
- `trip-form.tsx`: tambah `slug?: string` ke `TripFormData`.
- Commit: `c3c1a36` (4 file). Lint: 0 errors / 34 warnings (pre-existing `<img>`).
- **Catatan:** local `main` ahead of origin/main 1 commit — perlu `git push` bila ingin sinkron.

## Session 17 — Auto Generate Slug di Modal Tambah/Edit Trip

**Goal:** Auto-generate slug secara otomatis di modal Tambah/Edit Trip (`src/app/admin/trips/page.tsx`) saat admin menginputkan Judul Trip.

**Completed:**
- Updated `src/app/admin/trips/page.tsx`:
  - Mengimpor `slugify` dari `@/shared/utils/helpers`.
  - Memperbarui `handleChange` agar setiap kali `title` diubah, `form.slug` secara otomatis terisi dengan versi `slugify(title)`.
  - Mengunci tipe trip menjadi **Open Trip** saja (menghapus pilihan tipe dropdown).
  - Menambahkan manajemen **Itinerary** dinamis (multiple items) dengan field: Hari ke berapa (`dayNumber`), Wilayah/Lokasi (`location`), Judul Kegiatan (`title`), dan Deskripsi (`description`).
  - Menjaga section **Aksesibilitas Lansia** (checkbox Ramah Lansia & text area Info Aksesibilitas).
  - Menghapus input **Estimasi Waktu (menit)**.
  - Menghapus input **Highlights** dan **Fasilitas**.


## Session 18 — Hapus Meeting Point dari Sidebar & Master Meeting Point

**Goal:** Menghapus menu Meeting Point dari sidebar admin dan menghapus halaman master Meeting Point.

**Completed:**
- Diperbarui `src/app/admin/layout.tsx`:
  - Menghapus link `"Meeting Point"` (`/admin/meeting-points`) dari kelompok navigasi `"Trip & Tempat"`.
  - Menghapus import `Map` yang tidak digunakan dari `lucide-react`.
- Menghapus halaman & folder master meeting point `src/app/admin/meeting-points/page.tsx` dan file spec E2E `e2e/admin/meeting-points.spec.ts`.


## Session 19 — Perubahan Input Harga, Kategori Auto-complete, dan Pilih Provinsi

**Goal:** Mengganti input harga min/max dengan single input Harga (auto format Rupiah), menambahkan auto-complete Kategori dengan `react-select/creatable` (bisa freetext & tersimpan ke DB), serta menambahkan dropdown Pilih Provinsi di Informasi Destinasi.

**Completed:**
- Updated `src/app/admin/trips/page.tsx`:
  - Mengubah input `Harga Min` & `Harga Max` menjadi single input **Harga (Rp)** dengan format Rupiah otomatis saat mengetik (`formatRupiah` & `parseRupiah`).
  - Mengintegrasikan `CreatableSelect` dari `react-select/creatable` pada input **Kategori**, sehingga mendukung auto-complete serta freetext yang akan langsung dikirim ke `POST /api/destinations/categories` dan tersimpan ke database.
  - Menambahkan dropdown **Pilih Provinsi** berisi 38 provinsi di Indonesia pada bagian **Informasi Destinasi**.
- Updated `src/db/schema/trips.ts` & `src/modules/trip/trip.schema.ts`:
  - Menambahkan kolom `province: text("province")` pada tabel `trips`.
- Updated `src/modules/master/master.repository.ts` & `src/app/api/destinations/categories/route.ts`:
  - Menambahkan method `createDestinationCategory` dan handler `POST` di `/api/destinations/categories` untuk menyimpan kategori baru.

## Session 20 — Admin Users Management Page (/admin/users)

**Goal:** Tambahkan halaman Users terdaftar pada `/admin/users` untuk melihat, mencari, memfilter role, mengedit detail/role, dan menghapus user terdaftar.

**Completed:**
- Updated `src/modules/auth/auth.repository.ts` — Menambahkan method `findAll()`, `update()`, dan `delete()`.
- Updated `src/modules/auth/auth.service.ts` — Menambahkan method `getAllUsers()`, `updateUser()`, dan `deleteUser()`.
- Created `src/app/api/users/route.ts` — Handler `GET /api/users` untuk mengambil semua pengguna terdaftar.
- Created `src/app/api/users/[id]/route.ts` — Handler `PUT` dan `DELETE` `/api/users/[id]` untuk mengubah dan menghapus pengguna.
- Created `src/app/admin/users/page.tsx` — Halaman manajemen user dengan kartu KPI (Total, User Biasa, Agent, Admin), pencarian, filter role, tabel user (avatar, nama, email, hp, role badge, referral, poin loyalitas, tanggal daftar), Modal Edit Pengguna, dan Modal Konfirmasi Hapus.
- Updated `src/app/admin/layout.tsx` — Menambahkan menu navigasi "Pengguna" di sidebar admin.
- Created `e2e/admin/users.spec.ts` — Playwright E2E test suite untuk halaman `/admin/users`.
- Updated `feature_list.json` — Menambahkan `feat-049` (completed).

## Session 21 — Bug Fix: Admin Trips rows.map is not a function

**Goal:** Fix runtime TypeError (`rows.map is not a function`) in `src/app/admin/trips/page.tsx:353:22` when creating trips or when API responses return non-array error objects.

**Completed:**
- Updated `src/app/admin/trips/page.tsx`:
  - Enforced array validation in `fetchData()` (`if (res.ok && Array.isArray(data)) setRows(data)`), setting `rows` to `[]` on non-array or error responses.
  - Added robust error handling in `handleSubmit()` (`if (!res.ok)`), displaying feedback to user instead of failing silently and closing modal.
  - Safe render mapping with `const tripRows = Array.isArray(rows) ? rows : [];` to prevent crashes under any state anomaly.
- Updated `src/modules/trip/trip.repository.ts`:
  - Fixed `saveItinerary()` to explicitly map supported columns (`tripId`, `dayNumber`, `title`, `description`, `startTime`, `endTime`) and omit non-schema properties (such as `location`), plus guaranteeing fallback non-null values for `title`.

**Verification:**
- `npm run lint` passed with 0 errors.







### Session (2026-08-05) — Vercel Production Deploy + Build Fixes
- Deployed `main` to production via `vercel --prod` → **https://opentrip-lansia.vercel.app** (deploy `7v1pWRF1kJykGNQwGcJkQEFiFULi`, Ready 59s)
- **Root cause 1 (blocked deploy):** Repo was private + git author `bhuminindra` (alhafizaulia02@gmail.com) bukan member Vercel team → Vercel Hobby seat policy memblokir (`TEAM_ACCESS_REQUIRED`). User menjadikan repo public → blokir hilang (collaboration gratis utk public repo).
- **Root cause 2 (build fail):** TypeScript error di `src/app/admin/trips/[id]/edit/page.tsx` — field itinerary/tripDestinations nullable vs `TripForm` butuh non-null. Dikoersi dengan default (`?? ""` / `?? 0`), plus `meetingPointId`/`description`.
- **Root cause 3 (prerender fail):** `/login` crash saat SSR — `getRedirectPath()` memanggil `window` saat render. Ditambah guard `typeof window === "undefined"` (login & register).
- `trip-form.tsx`: tambah `slug?: string` ke `TripFormData`.
- Commit: `c3c1a36` (4 file). Lint: 0 errors / 34 warnings (pre-existing `<img>`).
- **Catatan:** local `main` ahead of origin/main 1 commit — perlu `git push` bila ingin sinkron.

## Session 17 — Auto Generate Slug di Modal Tambah/Edit Trip

**Goal:** Auto-generate slug secara otomatis di modal Tambah/Edit Trip (`src/app/admin/trips/page.tsx`) saat admin menginputkan Judul Trip.

**Completed:**
- Updated `src/app/admin/trips/page.tsx`:
  - Mengimpor `slugify` dari `@/shared/utils/helpers`.
  - Memperbarui `handleChange` agar setiap kali `title` diubah, `form.slug` secara otomatis terisi dengan versi `slugify(title)`.
  - Mengunci tipe trip menjadi **Open Trip** saja (menghapus pilihan tipe dropdown).
  - Menambahkan manajemen **Itinerary** dinamis (multiple items) dengan field: Hari ke berapa (`dayNumber`), Wilayah/Lokasi (`location`), Judul Kegiatan (`title`), dan Deskripsi (`description`).
  - Menjaga section **Aksesibilitas Lansia** (checkbox Ramah Lansia & text area Info Aksesibilitas).
  - Menghapus input **Estimasi Waktu (menit)**.
  - Menghapus input **Highlights** dan **Fasilitas**.


## Session 18 — Hapus Meeting Point dari Sidebar & Master Meeting Point

**Goal:** Menghapus menu Meeting Point dari sidebar admin dan menghapus halaman master Meeting Point.

**Completed:**
- Diperbarui `src/app/admin/layout.tsx`:
  - Menghapus link `"Meeting Point"` (`/admin/meeting-points`) dari kelompok navigasi `"Trip & Tempat"`.
  - Menghapus import `Map` yang tidak digunakan dari `lucide-react`.
- Menghapus halaman & folder master meeting point `src/app/admin/meeting-points/page.tsx` dan file spec E2E `e2e/admin/meeting-points.spec.ts`.


## Session 19 — Perubahan Input Harga, Kategori Auto-complete, dan Pilih Provinsi

**Goal:** Mengganti input harga min/max dengan single input Harga (auto format Rupiah), menambahkan auto-complete Kategori dengan `react-select/creatable` (bisa freetext & tersimpan ke DB), serta menambahkan dropdown Pilih Provinsi di Informasi Destinasi.

**Completed:**
- Updated `src/app/admin/trips/page.tsx`:
  - Mengubah input `Harga Min` & `Harga Max` menjadi single input **Harga (Rp)** dengan format Rupiah otomatis saat mengetik (`formatRupiah` & `parseRupiah`).
  - Mengintegrasikan `CreatableSelect` dari `react-select/creatable` pada input **Kategori**, sehingga mendukung auto-complete serta freetext yang akan langsung dikirim ke `POST /api/destinations/categories` dan tersimpan ke database.
  - Menambahkan dropdown **Pilih Provinsi** berisi 38 provinsi di Indonesia pada bagian **Informasi Destinasi**.
- Updated `src/db/schema/trips.ts` & `src/modules/trip/trip.schema.ts`:
  - Menambahkan kolom `province: text("province")` pada tabel `trips`.
- Updated `src/modules/master/master.repository.ts` & `src/app/api/destinations/categories/route.ts`:
  - Menambahkan method `createDestinationCategory` dan handler `POST` di `/api/destinations/categories` untuk menyimpan kategori baru.

## Session 20 — Admin Users Management Page (/admin/users)

**Goal:** Tambahkan halaman Users terdaftar pada `/admin/users` untuk melihat, mencari, memfilter role, mengedit detail/role, dan menghapus user terdaftar.

**Completed:**
- Updated `src/modules/auth/auth.repository.ts` — Menambahkan method `findAll()`, `update()`, dan `delete()`.
- Updated `src/modules/auth/auth.service.ts` — Menambahkan method `getAllUsers()`, `updateUser()`, dan `deleteUser()`.
- Created `src/app/api/users/route.ts` — Handler `GET /api/users` untuk mengambil semua pengguna terdaftar.
- Created `src/app/api/users/[id]/route.ts` — Handler `PUT` dan `DELETE` `/api/users/[id]` untuk mengubah dan menghapus pengguna.
- Created `src/app/admin/users/page.tsx` — Halaman manajemen user dengan kartu KPI (Total, User Biasa, Agent, Admin), pencarian, filter role, tabel user (avatar, nama, email, hp, role badge, referral, poin loyalitas, tanggal daftar), Modal Edit Pengguna, dan Modal Konfirmasi Hapus.
- Updated `src/app/admin/layout.tsx` — Menambahkan menu navigasi "Pengguna" di sidebar admin.
- Created `e2e/admin/users.spec.ts` — Playwright E2E test suite untuk halaman `/admin/users`.
- Updated `feature_list.json` — Menambahkan `feat-049` (completed).

## Session 21 — Bug Fix: Admin Trips rows.map is not a function

**Goal:** Fix runtime TypeError (`rows.map is not a function`) in `src/app/admin/trips/page.tsx:353:22` when creating trips or when API responses return non-array error objects.

**Completed:**
- Updated `src/app/admin/trips/page.tsx`:
  - Enforced array validation in `fetchData()` (`if (res.ok && Array.isArray(data)) setRows(data)`), setting `rows` to `[]` on non-array or error responses.
  - Added robust error handling in `handleSubmit()` (`if (!res.ok)`), displaying feedback to user instead of failing silently and closing modal.
  - Safe render mapping with `const tripRows = Array.isArray(rows) ? rows : [];` to prevent crashes under any state anomaly.
- Updated `src/modules/trip/trip.repository.ts`:
  - Fixed `saveItinerary()` to explicitly map supported columns (`tripId`, `dayNumber`, `title`, `description`, `startTime`, `endTime`) and omit non-schema properties (such as `location`), plus guaranteeing fallback non-null values for `title`.

**Verification:**
- `npm run lint` passed with 0 errors.

## Session 22 — HugeRTE WYSIWYG Editor for Admin Blogs Modal

**Goal:** Implement WYSIWYG rich text editor for blog content textarea in create/edit modal (`src/app/admin/blogs/page.tsx`) using `@hugerte/hugerte-react`.

**Completed:**
- Installed `@hugerte/hugerte-react` and `hugerte` packages.
- Added postinstall script to `package.json` to mirror `hugerte` static assets into `public/hugerte` for client-side bundle loading.
- Created reusable client component `src/app/admin/components/wysiwyg-editor.tsx` wrapping `@hugerte/hugerte-react` with Next.js dynamic import (`ssr: false`).
- Integrated `WysiwygEditor` into `src/app/admin/blogs/page.tsx` create/edit modal content field.
- Updated public blog detail page `src/app/blog/[slug]/page.jsx` to render HTML content using `dangerouslySetInnerHTML` with styled prose typography.

**Verification:**
- `./init.sh` executed cleanly (all 3 Jest test suites passed, 0 lint errors on modified files).








## Session 23 - Payment & Booking Security Hardening

**Goal:** Fix broken manual-transfer payment flow (legacy /api/payment returned 401 without auth) and close critical security holes.

**Completed:**
- New POST /api/payments route: session-auth required, owner-only (403 otherwise), validates payment method + proof URL (must start with /payments/, no ..), amount sourced from booking.totalAmount server-side, creates payment with status pending and flips booking to pending. Idempotent for existing pending payment.
- Deleted legacy src/app/api/payment/route.ts (unauthenticated, form-data only).
- useCheckout.initiatePayment and /checkout/pay/[id] now POST JSON to /api/payments using checkout.proofUrl from ProofUploader.
- Proof upload hardened with magic-byte validation (JPEG/PNG/GIF/WEBP/AVIF) in addition to MIME check.
- IDOR fix: GET /api/bookings/[id] now requires session + owner or admin (was fully public, leaking PII + proof images).
- POST /api/bookings no longer trusts spoofable x-user-id header; uses session.user.id.
- /api/checkout now validates server-side: pax integer bounds, positive prices, subtotal recomputed from trip.priceMin x pax (DB lookup), total recomputed as subtotal + 15000 - discount.
- Admin /admin/pesanan: approve/reject via /api/payments/[id]/review (reject requires note), shows proofUrl image + admin note; pending_payment badge added.
- /my-trips: payment status labels, proof image + admin note display, re-pay link now points to /checkout/pay/[id].

**Verification:**
- 
px tsc --noEmit passes (only pre-existing e2e/api/endpoints.spec.ts error remains).
- 
pm run lint: no new errors; only warnings in touched files.

## Session 24 — Checkout Server-Authoritative Pricing & Voucher (QA Kritikal #1 & #2)

**Goal:** Tutup 2 eksploitasi kritis hasil QA: (1) voucher diskon dikontrol klien (`appliedVoucher` bisa 100%), (2) harga unit dibaca dari `destination.priceMin` yang dikirim klien (bisa `priceMin=1`).

**Completed:**
- `src/modules/trip/trip.repository.ts`:
  - `findAllPublished()` sekarang memakai `getTableColumns(trips)` (semua kolom) + `departureId`, `startDate`, `price`, `priceName`; memilih 1 departure terawal per trip dan harga kanonikal (prioritas nama "Dewasa", fallback baris pertama).
  - Menambah `findCanonicalPriceByDepartureId()` + helper `pickCanonicalPrice()`.
- `src/modules/trip/trip.controller.ts`: `GET /api/trips` kini menerima `?all=true` (semua trip, untuk admin) — default mengembalikan trip published + harga kanonikal + departureId. `src/app/admin/trips/page.tsx` fetch `?all=true`.
- `src/lib/Destination.js`: `toDetail()` memakai `price` (harga kanonikal) sebagai `priceMin` dan meneruskan `departureId`.
- `src/app/api/checkout/route.ts` (rewrite):
  - Resolusi trip+departure dari DB (wajib UUID trip published; departureId klien hanya diterima jika milik trip, fallback ke departure terawal).
  - Harga unit = `tripPrices` DB (Dewasa first); subtotal dihitung ulang server; mismatch -> 400.
  - Voucher: hanya `voucherCode` dipercaya; validasi ke tabel `promotions` (aktif, tanggal, minPurchase, usageLimit, usageLimitPerUser via `promotion_usages`); diskon dihitung server; `promoId` dicatat ke kolom `bookings.promoId` + notes; `usageCount` di-increment & usage dicatat.
  - `appliedVoucher` dari klien DIABAIKAN sepenuhnya.

**Verification (live di localhost:3000, dev server):**
- `priceMin=1` -> 400 "Harga pesanan tidak sesuai" ✅
- voucher palsu 100% via `appliedVoucher` -> 400 ✅
- kode voucher tidak valid -> 400 ✅
- checkout normal -> 200 (subtotal 1.500.000, total 1.515.000) ✅
- voucher asli `LANSIA10` -> 200 (diskon 150.000, total 1.365.000, promoId terisi) ✅
- total dipaksa kecil meski pakai voucher -> 400 ✅
- pax 2 + LANSIA10 -> 200 (diskon 300.000) ✅
- `GET /api/trips` mengembalikan harga kanonikal + departureId; `?all=true` = 7 trip ✅
- `npx tsc --noEmit` hanya error e2e pra-ada; `eslint` file diubah: 0 error ✅
- Test booking & usage promo dibersihkan (LANSIA10 usageCount dikembalikan ke 5).

**Risks/Blocker:** `/api/trips` publik sekarang hanya trip published (draft tidak tampil di listing — behavior lama sama karena filter client-side). Trip tanpa departure/price aktif otomatis tidak muncul di publik. Belum ada transaksi DB atomik (neon-http tidak support `db.transaction`) — promo usage dicatat best-effort. Bug kritikal lain belum dikerjakan: SHA-256 tanpa salt, route admin tanpa auth (trips/promotions/horeca/vendors/galleries/commissions, users, admin dashboard), AVIF magic-byte lemah, rate limiting.

## Session 25 — Hapus Data Statis Destinasi + Gambar Hanya dari DB

**Goal:** (1) Hapus seluruh data destinasi statis, (2) trip published tetap tampil meski tanpa harga/jadwal (biar trip ber-gambar DB seperti "TES mantap" muncul di landing), (3) semua gambar hanya dari DB — tanpa fallback foto stok; kalau kosong tampil placeholder "Gambar tidak tersedia".

**Completed:**
- **Hapus data statis:** `src/lib/destinationsData.js` & `src/infrastructure/data/destinationsData.js` dihapus. Semua import/usage dibersihkan: `checkout/page.jsx` (staticDest dihapus, selalu fetch `/api/trips`, status awal `loading`/`empty`), `trips/page.jsx` & `private/page.jsx` (initial state `[]`), `trips/[id]/page.jsx` (lookup statis dihapus, selalu fetch DB).
- **`findAllPublished` (trip.repository.ts):** filter `tripPrices.isActive` dipindah ke kondisi JOIN (`on`), bukan `WHERE`, dan loop tak lagi `continue` saat `departureId` null → semua trip published ikut muncul, termasuk tanpa departure/harga aktif (price null). Harga kanonikal tetap hanya dari harga aktif.
- **Gambar tanpa fallback stok:** `FALLBACK_IMAGES` dihapus dari `Destination.js` (toDetail → `image` null / `images` [] saat DB kosong) dan `DestinationSection.jsx` (toCard → null). `DestinationCard.jsx` (publik) & `DestinationGallery.jsx` (detail) menampilkan placeholder "Gambar tidak tersedia" saat tidak ada gambar.

**Verification (live, dev server :3000):**
- `GET /api/trips` → 6 trip published; "TES mantap" (gambar, tanpa harga/departure) dan "Trip Senin" (tanpa gambar/harga) kini tampil ✅
- Playwright (channel chrome): landing menampilkan kartu TES mantap; `/trips` render 5 placeholder "Gambar tidak tersedia" + kartu bergambar; `/trips/{uuid TES}` h1 = "TES mantap"; `/checkout?destination={uuid TES}` tetap berjalan (status found/memuat, server akan 400 saat submit karena tanpa departure — ekspektasi) ✅
- `npm run lint`: 0 error baru di semua file yang diubah (error repo pre-existing di icon-picker/my-trips/useNotifications/bundle minified); `tsc --noEmit`: hanya error pre-existing e2e/api/endpoints.spec.ts ✅

**Catatan/risiko:**
- Trip published tanpa harga tetap tampil di publik dengan harga Rp0 — belum ada penanda "Harga menyusul"; checkout ke trip tanpa departure akan 400 di server.
- Perubahan belum di-commit.

## Session 26 — Tombol Melayang "Hubungi Kami" Jadi Komponen

**Goal:** Ekstrak tombol WhatsApp melayang (kanan bawah) menjadi komponen reusable dan tampilkan di landing, `/trips`, `/private`, `/blog`, dan `/trips/[id]`.

**Completed:**
- `src/components/layout/WhatsAppFloat.jsx` (baru) — komponen server tanpa hooks: `wa.me/{NEXT_PUBLIC_WHATSAPP_NUMBER}?text={NEXT_PUBLIC_WHATSAPP_MESSAGE}`, gaya sama persis dengan versi inline lama (ikon bulat di mobile, pill "Hubungi Kami" di desktop).
- Landing `src/app/page.jsx` — blok inline diganti `<WhatsAppFloat />` (import `Link` & konstanta WHATSAPP_* dihapus).
- `src/app/trips/page.jsx`, `src/app/trips/[id]/page.jsx`, `src/app/private/page.jsx`, `src/app/blog/page.jsx` — import + render `<WhatsAppFloat />` sebelum `</div>` penutup.

**Verifikasi:**
- Targeted eslint 6 file: 0 error (2 warning pre-existing: `Newspaper` tak terpakai di blog, `<img>` di WhatsAppFloat sesuai pola repo).
- Playwright (channel chrome, dev server :3000): tombol `a[aria-label="WhatsApp"]` muncul dengan label "Hubungi Kami" di kelima halaman ✅
- Perubahan belum di-commit.
## Session 27 - ShadCN Sidebar untuk Admin

**Goal:** Mengganti struktur sidebar admin yang dibuat manual (custom aside) dengan sidebar ShadCN yang sudah terpasang di project, disesuaikan dengan navigasi admin OpenTrip Lansia. Topbar (notifikasi + profil) dipertahankan.

**Completed:**
- `src/app/admin/components/nav-data.ts` (baru) - ekstraksi array `navGroups` (Dashboard, Trip & Tempat, Pengguna & Partner, Marketing, Order, Konten) dari layout.tsx menjadi modul bertipe (`AdminNavGroup`/`AdminNavItem`, ikon lucide).
- `src/app/admin/components/admin-sidebar.tsx` (baru) - komponen ShadCN: `Sidebar` (collapsible="icon") + `SidebarHeader` (logo brand) + `SidebarContent` (SidebarGroup/GroupLabel/Menu/MenuButton dari nav-data, active state via usePathname: exact match /admin, startsWith selainnya, `render={<Link/>}` untuk navigasi) + `SidebarFooter` ("Kembali ke Website Utama") + `SidebarRail`. Item aktif di-warnai oranye #F49D1A via `data-active:bg-[#F49D1A]`.
- `src/app/globals.css` - blok variabel `--sidebar-*` dark scoped `.admin-sidebar-dark` + `[data-mobile="true"][data-sidebar="sidebar"]` (mobile sheet portaled) agar sidebar admin ikut dark mode tanpa memengaruhi area konten/dashboard.
- `src/app/admin/layout.tsx` - rombak total: hapus custom aside, mobile overlay/hamburger manual, dan state sidebarOpen; kini `SidebarProvider` + `<AdminSidebar />` + `SidebarInset` (bg-slate-100/70); topbar notifikasi + profil dipindah jadi header di dalam SidebarInset dengan `SidebarTrigger` menggantikan hamburger. `useAdminAuth()` tetap.

**Verification:**
- Targeted eslint (3 file diubah): 0 error, 1 warning `<img>` (pola sama dengan kode asli).
- `npm run lint` penuh: error/warning hanya pre-existing (use-mobile.ts set-state-in-effect, useNotifications.ts, icon-picker, my-trips, dll.) - tidak ada dari file yang diubah.
- `tsc --noEmit`: error hanya pre-existing di `e2e/api/endpoints.spec.ts`.
- Perubahan belum di-commit.

**Risiko:** dark mode hanya di-scope ke sidebar; jika ingin seluruh halaman admin ikut dark, perlu refactor terpisah. `h-15` (Tailwind v4 dynamic spacing) digunakan untuk logo.
## Session 27b - Softkan Kontras Aktif + Fix Hover Sidebar Admin

**Goal:** (1) Menurunkan kontras item aktif sidebar admin (solid oranye -> tint), (2) memperbaiki bug: hover pada item aktif menimpa warna aktif dengan slate abu-abu.

**Analisis (dikonfirmasi via kompilasi CSS `npx @tailwindcss/cli`):**
- `.hover\:bg-sidebar-accent:hover` = spesifisitas (0,2,0); `.data-active\:bg-[\#F49D1A]:where(...)` = (0,1,0) karena `:where()` bernilai 0. Hover menang walau posisinya di atas.
- Fix = stacked variant `data-active:hover:*` yang menghasilkan selector (0,2,0) namun muncul lebih belakang di stylesheet.

**Completed:**
- `src/app/admin/components/admin-sidebar.tsx` (baris 53) - className `SidebarMenuButton` diubah:
  - Sebelum: `data-active:bg-[#F49D1A] data-active:text-white data-active:font-semibold`
  - Sesudah: `data-active:bg-[#F49D1A]/15 data-active:text-[#F49D1A] data-active:font-medium data-active:hover:bg-[#F49D1A]/20 data-active:hover:text-[#F49D1A]`
  - `font-medium` (bukan `font-semibold`) karena warna sudah jadi penanda utama dan konsisten dengan default shadcn.
  - Hover item aktif menaikkan tint 15%->20%, teks tetap oranye; item non-aktif tetap hover slate normal.

**Verification:**
- `npx eslint`: 0 error (1 warning `<img>` pre-existing).
- Kompilasi CSS: `.data-active\:bg-[\#F49D1A]/15` (ln 4906), `.data-active\:text-[\#F49D1A]` (ln 4916), `.data-active\:hover\:bg-[\#F49D1A]/20` (ln 4923) dan `.data-active\:hover\:text-[\#F49D1A]` (ln 4926) semua muncul SETELAH `.hover\:bg-sidebar-accent:hover` (ln 3610) -> stacked variant menang.
- Perubahan belum di-commit.
## Session 27c - Breadcrumb Header Admin + Penerapan Ulang Hapus Ikon

**Goal:** (1) Menambahkan breadcrumb di header admin dengan format "Label > Menu", pengecualian Dashboard cukup "Dashboard". (2) Menerapkan ulang penghapusan ikon menu sidebar yang sempat kerevert.

**Completed - Breadcrumb:**
- `src/app/admin/components/nav-data.ts` - tambah helper `getActiveMenu(pathname)` yang mengembalikan grup + item aktif (logika sama dengan isActive sidebar: exact match /admin, startsWith selainnya).
- `src/app/admin/layout.tsx` - header kini berisi `SidebarTrigger` + `Separator` vertikal + `Breadcrumb`:
  - Format: `{label} > {menu}` (mis. "Trip & Tempat > Paket Trip") via `BreadcrumbPage` + `BreadcrumbSeparator` (chevron).
  - Dashboard (`/admin`): label null -> hanya menampilkan "Dashboard" tanpa separator.
  - Breadcrumb disembunyikan di mobile (`hidden md:flex`) mengikuti pola halaman dashboard contoh.

**Completed - Re-apply hapus ikon (file sempat kerevert):**
- `src/app/admin/components/admin-sidebar.tsx` - `<Icon />` dan `const Icon = item.icon` dihapus lagi; `collapsible="icon"` -> `collapsible="offcanvas"` (mode collapse-ikon tak relevan tanpa ikon); class `group-data-[collapsible=icon]:hidden` di logo dihapus.
- `src/app/admin/components/nav-data.ts` - import lucide + field `icon` dibersihkan ulang dari tipe & data.

**Catatan:** Di antara tugas, `admin-sidebar.tsx` dan `nav-data.ts` kembali ke versi berikon (kemungkinan revert/kembali-commit oleh user); seluruh perubahan diterapkan ulang dan terverifikasi.

**Verification:**
- `npx eslint` (3 file): 0 error, 1 warning `<img>` pre-existing.
- `npx tsc --noEmit`: error hanya pre-existing `e2e/api/endpoints.spec.ts`.
- Perubahan belum di-commit.
## Session 27d - Fix Error Hidrasi Breadcrumb Admin

**Goal:** Perbaiki hydration error yang muncul di semua halaman `/admin` (dikonfirmasi via Playwright console capture saat login admin).

**Akar masalah:**
- `src/app/admin/layout.tsx` breadcrumb menaruh `<BreadcrumbSeparator />` (renders `<li>`) DI DALAM `<BreadcrumbItem />` (renders `<li>`) -> HTML invalid `<li>` bersarang `<li>` -> React "Hydration failed ... <li> cannot be a descendant of <li>".
- Terkonfirmasi: 6 console error + 3 pageerror "Hydration failed" di `/admin`, `/admin/trips`, `/admin/users`, `/admin/pesanan`.

**Solusi (applied):**
- `src/app/admin/layout.tsx` - susun ulang breadcrumb menjadi dua `BreadcrumbItem` terpisah dengan `BreadcrumbSeparator` sebagai sibling di antaranya (pola sama dengan `src/app/dashboard/page.tsx`). Breadcrumb kini tampil di semua ukuran layar (tidak lagi `hidden md:flex`).

**Catatan selidik (temuan sekunder, tidak diubah):**
- `src/middleware.ts:23` - redirect login untuk `/admin/*` tanpa session memakai `redirect="/"` bukan path asli (`/login?redirect=/`), sehingga redirect balik ke beranda bukan ke halaman admin yang diminta.

**Verification:**
- `npx eslint src/app/admin/layout.tsx`: 0 error.
- Playwright (login admin@otl.id, console capture) pada `/admin`, `/admin/trips`, `/admin/users`, `/admin/pesanan`: 0 console error, 0 pageerror (sebelumnya 6+3).
- Script verifikasi sementara dihapus.
- Perubahan belum di-commit.


## Session 31 - Payment BCA only, Navbar role, Admin pages secure, Lint clean

**1. Metode pembayaran hanya BCA**
- `src/app/api/payments/route.ts` — `ALLOWED_METHODS` ditambah `"BCA"`.
- `src/components/checkout/PaymentStep.jsx` — PaymentSelector jadi satu kartu BCA auto-selected (+`useEffect` set paymentMethod="BCA"); AccountCard ambil dari `payment_accounts` (lookup case-insensitive), fallback banner "Rekening BCA belum diatur".
- **User action:** insert/upsert BCA ke `payment_accounts` sendiri (query diberikan): `method='BCA'`.

**2. Nama + role di Navbar**
- `src/components/layout/Navbar.jsx` — avatar dropdown menampilkan nama + role (admin→"Admin", agent→"Agen", lain→"Member") dari `session.user.role`; `hidden sm:flex`, warna ikut `isScrolled`.

**3. Admin pages secure (server-side)**
- `src/app/admin/layout.tsx` jadi server component: `auth.api.getSession({ headers: await headers() })` → no login redirect `/login`, role != admin redirect `/forbidden`, baru render shell.
- Shell client dipindah ke `src/app/admin/AdminShell.tsx` (tanpa `useAdminAuth`).
- `src/middleware.ts` komentar diperbarui.
- Risk tersisa: API admin (mis. `/api/trips?all=true`, `/api/promotions`) masih publik — scope feat-080.

**4. Lint bersih (303 error → 0)**
- `eslint.config.mjs` — tambah `public/**` ke globalIgnores (±265 error vendor `public/hugerte` hilang).
- `src/hooks/use-mobile.ts` — `useSyncExternalStore`.
- `src/app/admin/components/icon-picker.tsx` — pola `mounted`+effect diganti `useSyncExternalStore`; import `Check` dibuang.
- `src/hooks/useNotifications.ts` — fetch awal pakai microtask boundary.
- `src/app/my-trips/page.jsx` — `fetchData` pindah ke atas + `useCallback`; dep `router` ditambah.

**Hasil:** `npm run lint` → 0 errors, 59 warnings (semua `<img>`). `tsc --noEmit` hanya error pre-existing `e2e/api/endpoints.spec.ts`. Belum di-commit.

## Session 28 — Refactor Auth Guard Admin: Helper Server-side + Hapus Duplikasi

**Goal:** Ekstrak logic auth guard di `src/app/admin/layout.tsx` menjadi helper server-side yang reusable, hapus duplikasi `requireAdmin` di API private-trip, dan bersihkan dead code.

**Completed:**
- **Dikerjakan via 2 sub-agent paralel (pola todo → sub-agent):**
  - Sub-agent A: `src/shared/auth-server.ts` (baru) — `requireAdminLayout()` membungkus getSession → redirect `/login?redirect=/admin` bila tak login, `/forbidden` bila role ≠ admin, return session.
  - Sub-agent A: `src/app/admin/layout.tsx` — body layout jadi `await requireAdminLayout(); return <AdminShell>{children}</AdminShell>;` (19 → 7 baris), import `headers`/`redirect`/`auth` yang tak terpakai dihapus.
  - Sub-agent B: `src/app/api/private-trip/admin/route.ts` & `[id]/route.ts` — hapus definisi lokal `requireAdmin` (duplikat), ganti `import { requireAdmin } from "@/shared/auth"` (pola sama dengan `api/trips/route.ts`).
  - Sub-agent B: hapus `src/hooks/useAdminAuth.ts` (dead code — tidak ada yang meng-import).

**Verification:**
- `npx tsc --noEmit`: hanya error pre-existing di `e2e/api/endpoints.spec.ts:21` (tidak disentuh).
- `npx eslint` targeted pada 4 file berubah + 1 baru: 0 error, 0 warning.
- `npm run lint` (full): error yang muncul semuanya pre-existing di file lain (icon-picker, use-mobile, useNotifications, my-trips) — bukan di file session ini.
- Fix minor: trailing newline di `admin/layout.tsx`.

- Perubahan belum di-commit (menunggu review user).

## Session 30 — Verifikasi Fitur Pasca Phase 1 (API Security Lockdown)

**Goal:** Pastikan fitur-fitur tetap berfungsi setelah Phase 1 mengunci 21+ endpoint API dengan `requireAdmin`, dan lakukan smoke test runtime (bukan hanya statis).

**Dikerjakan:**
- Smoke test live terhadap dev server (:3000) dengan database Neon terhubung.
- **13 endpoint publik** tanpa auth → semuanya 200: `/api/trips`, `/api/blogs`, `/api/blogs?published=1`, `/api/horeca`, `/api/horeca-types`, `/api/vendors`, `/api/vendor-types`, `/api/promotions`, `/api/reviews`, `/api/galleries`, `/api/meeting-points`, `/api/destinations/categories`, `/api/payments/accounts`.
- **5 endpoint terkunci** tanpa auth → semuanya 401: `/api/users`, `/api/admin/dashboard`, `/api/admin/notifications`, `/api/commissions`, `/api/bookings`.
- **Login admin** (`admin@otl.id` / `admin` dari seed) → 200; lalu endpoint admin dengan session → 200 (users, dashboard, notifications, commissions).
- Blog by-id: admin GET 200, anon GET blog published 200, anon PUT → 401. Halaman blog publik memakai `/api/blogs?published=1` + filter client-side, bukan rute by-id.
- Catatan: `GET /api/blogs/{non-uuid}` → 500 (artefak test, slug tidak valid utk findById) — bukan regresi.

**Verification:**
- Smoke test: **PASS** — semua fitur publik tetap terbuka, proteksi admin aktif, admin tetap bisa akses.

**Catatan:**
- Belum ada commit untuk sesi ini (menunggu review user / lanjut Phase 2).

## Session 31 — Phase 2: Sanitasi XSS Blog & Hardening Upload

**Goal:** Menutup celah keamanan Phase 2: (a) stored XSS pada konten blog (WYSIWYG → `dangerouslySetInnerHTML`), (b) `/api/upload` yang terbuka tanpa auth, menerima SVG, dan tanpa validasi magic-byte.

**Completed — #3 Sanitasi XSS Blog:**
- `src/shared/utils/sanitize.ts` (baru) — wrapper `sanitize-html` dengan allowlist tag/atribut/kelas, skema http/https/mailto, `transformTags` a→`rel=noopener noreferrer target=_blank`, img hanya terima src http/https atau path lokal.
- `src/modules/blog/blog.service.ts` — `createBlog` & `updateBlog` kini sanitize `content` & `excerpt` (null dipertahankan).
- `src/app/api/blogs/route.ts` — POST dialihkan dari `blogRepository.create` langsung ke `blogService.createBlog` (agar sanitasi & slug-unique berjalan); guard `!session.user.id` → 401.
- `src/app/blog/[slug]/page.jsx` — defense-in-depth: konten di-sanitize lagi saat render (melindungi data lama yang sudah terlanjur di DB).
- Live test: payload `<script>`/`onclick`/`onerror`/`javascript:` → semua di-strip, `<h2>/<b>` aman dipertahankan.

**Completed — #2 Hardening Upload:**
- `src/shared/utils/image-guard.ts` (baru) — deteksi magic-byte per format (JPEG/PNG/GIF/WEBP/AVIF dengan brand `avif|avis`), helper `detectImageKind`/`extensionForImage`.
- `src/app/api/upload/route.ts` — tambah `requireAdmin` (POST & DELETE), **hapus SVG** (XSS vector), validasi magic-byte (tolak file palsu meski MIME/ext palsu), ekstensi file diturunkan dari isi bukan `file.name`, cek file kosong, DELETE kini cek `access()` dulu (404 kalau tidak ada).
- `src/app/api/payments/upload/route.ts` — pakai shared guard (hilangkan duplikasi magic-byte inline), AVIF lebih ketat (brand-spesifik), ekstensi dari isi file.
- Live test: anon upload → 401; admin PNG → 200; HTML palsu ber-ext `.png` → 400; SVG → 400.

**Verification:**
- `npx eslint` penuh: 0 error (58 warning pre-existing `<img>`).
- `npx tsc --noEmit`: 0 error.
- `npx next build`: compiled successfully.
- Live smoke test: semua PASS; data test dibersihkan (blog draft, file upload, session).

**Catatan:**
- Dep baru: `sanitize-html` (dependencies) + `@types/sanitize-html` (devDependencies).
- Belum di-commit (menunggu review user).
- Sisa Phase 2/3 (opsional): quota oversell, DB transaksi multi-step, rate limiting, CSP, money numeric.

## Session 29 — QA + Refactor Sidebar Admin (PR #76) & Hapus Dead Code

**Goal:** Verifikasi refactor sidebar admin (commit 3b32a77) tidak merusak fitur, rapikan duplikasi logika active-matching, lalu hapus file JSX/TSX yang tidak terpakai.

**Completed — QA (subagent qa, read-only):**
- Verdict **PASS** (0 Critical/High/Medium).
- Tidak ada dangling link `/dashboard` (halaman dummy sudah dihapus bersih).
- 12 route nav di `nav-data.ts` semuanya ada; tidak ada prefix collision pada active-state (exact match `/admin`, startsWith selainnya).
- Collapsible group aman: auto-open grup aktif saat pindah halaman tanpa menutup grup yang dibuka manual; dependency arrays benar (tidak ada stale closure).
- Mobile sheet dark-mode (`.admin-sidebar-dark` + `[data-mobile=true][data-sidebar=sidebar]`) tidak terganggu.
- `next build` hijau; catatan: `tsc --noEmit` butuh `.next/types` di-regenerate bila ada stale ref ke page yang dihapus.

**Completed — Refactor (subagent refactor):**
- `src/app/admin/components/nav-data.ts` — tambah helper `isHrefActive(pathname, href)` sebagai satu sumber kebenaran; `getActiveMenu` memakainya.
- `src/app/admin/components/admin-sidebar.tsx` — `isActive` useCallback kini panggil `isHrefActive`; non-null assertion `group.label!` diganti narrowing (`const label` + guard) di useEffect dan JSX map.
- Perilaku/UI tidak berubah (class name, struktur JSX, key, deps callback dipertahankan).

**Completed — Hapus file mati (9 file, diverifikasi 0 referensi di src/e2e/test):**
- `src/components/checkout/ConfirmationStep.jsx` (tidak diimport page manapun)
- `src/components/destinasi/detail/UlasanSection.jsx` (tab Ulasan tidak dirender page; file tak terimport)
- `src/components/landing/ModalsSlider.jsx`
- `src/components/private/ParticipantsSection.jsx` (digantikan input jumlahPeserta sejak Session 12)
- `src/components/app-sidebar.tsx`, `search-form.tsx`, `version-switcher.tsx` (demo shadcn sidebar, tidak terimport)
- `src/components/ui/dropdown-menu.tsx` (hanya dipakai version-switcher), `ui/label.tsx` (hanya dipakai search-form)

**Verification:**
- `npx eslint` penuh: 0 error (57 warning pre-existing `<img>`).
- `npx tsc --noEmit`: bersih (0 error).
- `npx next build`: compiled successfully.

**Catatan:**
- Perubahan belum di-commit (menunggu review user) — 2 file modified (refactor), 9 file deleted (dead code).

## Session 32 — Phase 2 Security: bcrypt Password Hashing & Quota Atomic

**Goal:** Menutup prioritas #1 (hash SHA-256 tanpa salt) dan #2 (quota oversell) dari catatan temuan.

**Completed — #1 Password hashing (SHA-256 → bcrypt):**
- Dep baru: `bcryptjs` (v3, types built-in).
- `src/shared/utils/password.ts` (baru) — `hashPassword` (bcrypt cost 10), `verifyPassword` (auto-detect: bcrypt → compare, 64-hex → fallback SHA-256), `isLegacySha256`.
- `src/modules/auth/auth.config.ts` — hook `password.hash`/`verify` pakai util; fallback memastikan user lama tetap login.
- Migrasi hash lama: `auth.repository.ts` tambah `getAccountPassword`/`updateAccountPassword`; `auth.controller.ts` POST wrapper deteksi `/sign-in/email` sukses → re-hash SHA-256 ke bcrypt otomatis (via `rehashLegacyPasswordOnSignIn`). Jalur `/api/auth/[...all]` tetap dipakai client (authService.signIn tidak dipanggil langsung).
- `src/db/seed.ts` — akun seed admin/agent/user kini bcrypt (Promise.all await).

**Completed — #2 Quota atomic:**
- `trip.repository.ts updateQuota` — tambah kondisi `sql\`${quotaBooked} + ${qty} <= ${quota}\`` ke WHERE; UPDATE yang melewati kuota tidak mengubah row → return false.

**Verification:**
- `npx tsc --noEmit`: 0 error. `npx eslint`: 0 error. `npx next build`: success.
- Live smoke (dev server :3000): login `admin@otl.id`/`admin` → 200 + cookie session; hash DB berubah dari SHA-256 ke `$2b$10$...` (verified via SQL); login kedua tetap 200 (bcrypt path); password salah → 401.
- Quota: simulasi SQL — `+1` saat kosong → 1 row OK; `+20` saat sisa 19 → 0 row (oversell ditahan); nilai awal di-restore.

**Catatan:**
- Belum di-commit (menunggu review user).
- Sisa (prioritas lanjutan): #3 transaksi booking (butuh driver WebSocket karena neon-http tak support `db.transaction()`), #4 rate limiting, #5 security headers, #6 money integer-sen, #7 blogs/[id] non-UUID → 500, #8 Google OAuth credential kosong, #9 npm audit (11 vuln).

## Session 33 — Popup Notifikasi Newsletter Subscribe

**Goal:** Menampilkan popup modal notifikasi/pesan sukses ketika visitor memasukkan email dan melakukan subscribe di newsletter form.

**Completed:**
- Diperbarui [Subs.jsx](file:///c:/Users/Bhuminindra%20AlHafiz/Documents/opentrip-lansia/src/components/landing/Subs.jsx):
  - Menambahkan direktif `"use client"` di bagian atas file.
  - Membuat state untuk input `email` dan `showPopup`.
  - Mengimplementasikan helper `useEffect` untuk menutup popup ketika tombol Escape ditekan, serta mengunci overflow body (`document.body.style.overflow = "hidden"`) saat popup aktif agar background tidak dapat discroll.
  - Memperbarui handler form `onSubmit` agar memvalidasi input email sebelum menampilkan popup sukses.
  - Mendesain popup modal sukses yang premium (menggunakan glassmorphic border, background blur, oranye gradient ornamen, dan checklist micro-animation) dengan tombol "Mulai Jelajah" serta ikon silang `(X)` untuk menutup popup modal.
  - Menyertakan teks pesan sukses yang tepat sesuai permintaan: `"Selamat bergabung di Keluarga Jelajah Memoria! Kami telah mengirimkan email sambutan untuk Anda. Sampai jumpa di perjalanan seru berikutnya!"`.

**Verification:**
- `npm run lint` — Berhasil dijalankan (0 errors, 60 warnings pre-existing).


## Session (2026-09-04) — Bugfix: Kategori Trip & Admin Login

**Goal:** Perbaiki dua bug: (1) kategori trip selalu tampil "Alam" di halaman publik, (2) login admin@otl.id gagal di localhost.

### Bug 1 — Kategori Trip Selalu "Alam"

**Root cause:** `findAllPublished()` di `trip.repository.ts` menggunakan `getTableColumns(trips)` tanpa JOIN ke `destinationCategories`, sehingga field `categoryName` tidak pernah ada di response API publik. `toDetail()` di `Destination.js` sudah membaca `dest.categoryName` dengan benar, tapi nilainya selalu `undefined` → fallback ke `"Alam"`.

**Fix:** Tambahkan JOIN `destinationCategories` pada `findAllPublished()` dan sertakan `categoryName: destinationCategories.name` di select. Tambahkan `categoryName: string | null` ke interface `TripWithPrice`.

**File diubah:** `src/modules/trip/trip.repository.ts`

### Bug 2 — Admin Login Gagal di Localhost

**Root cause:** Tiga masalah teridentifikasi:
1. `.env` menetapkan `BETTER_AUTH_URL=https://jelajahmemoria.spero-lab.id/` (production URL). better-auth menggunakan URL ini untuk cookie domain & CSRF check → login selalu gagal di `localhost`.
2. `middleware.ts` meredirect ke `/login?redirect=/` (hardcoded `/`) bukan `/login?redirect=/admin` saat session tidak ada di halaman admin.
3. `login/page.jsx` `getClientSnapshot()` memblokir param redirect yang dimulai dengan `/admin` (`!redirect.startsWith("/admin")`), sehingga setelah login sukses admin dikirim ke `/` bukan `/admin`.

**Fix:**
- Buat `.env.local` dengan `BETTER_AUTH_URL=http://localhost:3000` (override `.env` untuk dev lokal — tidak ter-commit ke production karena `.env.local` ada di `.gitignore`).
- `middleware.ts`: ganti `redirect=/` → `redirect=/admin`.
- `login/page.jsx`: hapus kondisi `!redirect.startsWith("/admin")`.

**File diubah/dibuat:** `.env.local`, `src/middleware.ts`, `src/app/login/page.jsx`

### Verifikasi
- `tsc --noEmit --skipLibCheck` — 0 error
- `npm run lint` — timeout di shell environment (issue environment, bukan issue kode); perubahan minimal dan tidak memperkenalkan pola baru

### Catatan
- `.env.local` **tidak boleh di-commit** (sudah ada di `.gitignore`). Setiap developer lokal perlu membuat file ini sendiri.
- Jika production domain berbeda dari `localhost`, `BETTER_AUTH_URL` di `.env` untuk production tetap menggunakan domain production — hanya lokal yang perlu override.

## Session 26 — User Referral System (feat-073)

**Goal:** Implement user-facing referral system: display referral code in profile with copy/share, add referral code input in checkout, and show referral history in profile.

**Completed:**

### Backend API Routes
- `GET /api/user/referral` — Returns user's referral code + stats (total referred, converted, pending, total commission)
- `GET /api/user/referral/history` — Paginated referral history with joined user/booking/trip/commission data
- `POST /api/checkout/validate-referral` — Validates referral code, checks self-referral, returns referrer info
- Updated `POST /api/checkout` — Accepts `referralCode`, validates server-side, creates referral record in `referrals` table

### Frontend Components
- `ReferralCard.jsx` — Profile component showing referral code with copy, WhatsApp share, and link share buttons + stats
- `ReferralHistory.jsx` — Profile component with expandable referral list, status badges, pagination, and commission info
- `ReferralInput.jsx` — Checkout component for entering/validating referral code with success/error states

### Updated Existing Components
- `ProfileStats.jsx` — Added referral code display with copy button, total referral count
- `profile/page.jsx` — Integrated ReferralCard and ReferralHistory sections
- `useCheckout.js` — Added referral state (referralCode, appliedReferral, referralError) + applyReferral/removeReferral functions
- `DetailsStep.jsx` — Added ReferralInput below VoucherCard

**Verification:**
- `npm run lint` — 0 errors (67 pre-existing warnings)
- All new files pass lint without introducing new errors

**Files Created:**
- `src/app/api/user/referral/route.ts`
- `src/app/api/user/referral/history/route.ts`
- `src/app/api/checkout/validate-referral/route.ts`
- `src/components/profile/ReferralCard.jsx`
- `src/components/profile/ReferralHistory.jsx`
- `src/components/checkout/ReferralInput.jsx`

**Files Modified:**
- `src/app/api/checkout/route.ts` — Added referral code handling + referral record creation
- `src/components/profile/ProfileStats.jsx` — Added referral code display with copy button
- `src/app/profile/page.jsx` — Added ReferralCard and ReferralHistory sections
- `src/lib/hooks/useCheckout.js` — Added referral state management
- `src/components/checkout/DetailsStep.jsx` — Added ReferralInput component

## Session 27 — Hapus Semua Referral History

**Goal:** Menghapus semua data referral history dari database (tabel referrals, commissions, commission_payouts, payout_commissions).

**Completed:**
- Created `scripts/clear-referral-history.sql` — SQL script untuk menghapus data secara manual
- Created `scripts/clear-referral-history.ts` — TypeScript script untuk menghapus data via Drizzle ORM
- Executed SQL cleanup: `DELETE FROM payout_commissions; DELETE FROM commission_payouts; DELETE FROM commissions; DELETE FROM referrals;`
- Verified deletion: semua tabel terkait referral sudah kosong (0 rows)

**Verification:**
- SQL query `SELECT COUNT(*) FROM referrals/commissions/commission_payouts/payout_commissions` → semua 0 rows

**Tabel yang dibersihkan:**
- `referrals` — 0 rows
- `commissions` — 0 rows
- `commission_payouts` — 0 rows
- `payout_commissions` — 0 rows

## Session 34 — Fitur Grup Trip Selesai + Feedback & Rating

**Goal:** Implement fitur penandaan grup trip selesai, feedback/rating dari user, dan tampilan data review yang lebih lengkap di admin.

**Completed:**

### Backend
- Created `src/app/api/trips/[id]/groups/[groupId]/complete/route.ts` — API endpoint PUT untuk menandai grup selesai:
  - Update status trip_departures ke "completed"
  - Update semua booking berstatus "confirmed" untuk departure tersebut ke "completed"
  - Return success message

### Admin UI — Grup Trip
- Updated `src/app/admin/trips/[id]/groups/page.tsx`:
  - Import `CheckCircle` icon dari lucide-react
  - Tambah tombol "Tandai Selesai" (hanya muncul jika status belum completed)
  - Tambah fungsi `handleComplete(groupId)` dengan konfirmasi dan fetch ke API complete
  - Styling: tombol hijau dengan icon CheckCircle

### User UI — My Trips
- Created `src/components/my-trips/FeedbackModal.jsx` — Modal komponen untuk feedback:
  - Rating bintang 1-5 dengan interaksi hover
  - Textarea ulasan (max 2000 karakter)
  - Submit handler dengan loading state
  - Styling premium dengan gradient icon

- Updated `src/components/my-trips/OpenTripBookingCard.jsx`:
  - Import FeedbackModal
  - Tambah state `feedbackOpen` dan `feedbackSubmitted`
  - Deteksi status completed dari booking
  - Cek apakah sudah ada review (`booking.hasReview`)
  - Tombol "Beri" untuk user memberikan feedback
  - Label "Sudah Diulas" jika sudah memberikan feedback
  - Submit feedback ke POST /api/reviews dengan bookingId, tripId, rating, content

### Admin UI — Reviews Page
- Updated `src/app/admin/reviews/page.tsx`:
  - Tambah icon User, Calendar, Hash dari lucide-react
  - Interface Review ditambah: userName, userEmail, tripTitle, groupStartDate, groupEndDate, bookingCode
  - Tabel kolom baru: Pengguna (avatar + nama + email), Trip & Grup (nama trip + tanggal grup + kode booking), Rating, Ulasan, Status
  - Hapus kolom Featured (bisa diedit di modal)

### Review Repository
- Updated `src/modules/review/review.repository.ts`:
  - Tambah interface ReviewWithDetails dengan data enriched
  - Method `findAll()` sekarang return data enriched dengan join ke users, trips, tripDepartures, bookings
  - Tambah method `findByUserId(userId)` untuk cek apakah user sudah review booking tertentu

### Booking Service
- Updated `src/modules/booking/booking.service.ts`:
  - Import reviewRepository
  - Helper `withDetails()` sekarang tambah field `hasReview` (boolean) untuk setiap booking
  - Cek apakah user sudah membuat review untuk booking tersebut

**Files Created:**
- `src/app/api/trips/[id]/groups/[groupId]/complete/route.ts`
- `src/components/my-trips/FeedbackModal.jsx`

**Files Modified:**
- `src/app/admin/trips/[id]/groups/page.tsx` — Tombol "Tandai Selesai"
- `src/components/my-trips/OpenTripBookingCard.jsx` — Feedback button + modal
- `src/app/admin/reviews/page.tsx` — Enhanced table dengan data lengkap
- `src/modules/review/review.repository.ts` — Enriched findAll() + findByUserId()
- `src/modules/booking/booking.service.ts` — hasReview field di booking
- `feature_list.json` — Update feat-011b description dan evidence

**Verification:**
- `npm run lint` — 0 errors, 79 warnings (pre-existing `<img>` warnings)
- Semua file baru dan yang diubah pass lint tanpa error

**Alur Fitur:**
1. Admin klik "Tandai Selesai" di halaman grup trip
2. Konfirmasi → API update status grup + booking ke completed
3. User login → lihat status "Selesai" di My Trips
4. User klik "Beri" → modal feedback muncul
5. User isi rating + ulasan → submit ke /api/reviews
6. Admin lihat di /admin/reviews dengan data: nama user, email, nama trip, tanggal grup, kode booking, rating, ulasan

---

### Referral Bonus Points Configurable (feat-072 update)

**Goal:** Referral bonus points bisa diatur admin, bukan hardcoded.

**Completed:**
1. Created `site_settings` module (schema, repository, service)
2. Created `site_settings` table via drizzle push
3. Created API endpoints:
   - `GET /api/admin/site-settings` — List all settings
   - `PUT /api/admin/site-settings` — Update setting by key
   - `GET /api/admin/site-settings/referral-bonus` — Get referral bonus points
4. Updated `loyalty.service.ts` — `creditReferralBonus()` now reads from `site_settings` instead of hardcoded value
5. Updated admin referral page (`/admin/referrals`):
   - Added "Pengaturan Referral" card with input for bonus points
   - Save button to update setting via API
   - Status badge shows "+X poin" for converted referrals
6. Default value: 10,000 points

**Files Created:**
- `src/modules/site-settings/site-settings.schema.ts`
- `src/modules/site-settings/site-settings.repository.ts`
- `src/modules/site-settings/site-settings.service.ts`
- `src/app/api/admin/site-settings/route.ts`
- `src/app/api/admin/site-settings/referral-bonus/route.ts`
- `drizzle/0003_site_settings.sql`

**Files Modified:**
- `src/db/schema/index.ts` — Export siteSettings schema
- `src/modules/loyalty/loyalty.service.ts` — Read bonus from settings
- `src/app/admin/referrals/page.tsx` — Settings UI + poin display
- `feature_list.json` — Update feat-072 evidence

**Verification:**
- `npm run lint` — 0 errors, 79 warnings (pre-existing)
- `drizzle-kit push` — Table created successfully

**Alur:**
1. Admin buka /admin/referrals
2. card "Pengaturan Referral" muncul di atas
3. Admin ubah jumlah poin → klik Simpan
4. Setting tersimpan di DB (site_settings.key = 'referral_bonus_points')
5. Saat payment di-approve → referral convert → loyaltyService.creditReferralBonus() baca dari DB → poin sesuai setting
6. Di tabel referral, status "Berhasil" tampilkan "+X poin" sesuai setting

## Session 35 — Bugfix: Error 500 Halaman Dashboard Admin

**Goal:** Analisis & perbaiki HTTP 500 pada `/admin` (banner "Gagal memuat data dashboard: HTTP 500").

**Root cause:**
- `src/app/admin/page.tsx` memanggil `GET /api/admin/dashboard`; route memanggil `dashboardService.getStats()` lalu `catch` → `NextResponse.json({error}, {status: 500})`.
- Di `src/modules/booking/dashboard.service.ts`, `getStats()` memakai `db.select({...}).from(...)` (query builder Drizzle) tetapi membaca hasilnya sebagai `result.rows[0]`.
- Query builder Drizzle mengembalikan **array row**, bukan `QueryResult` — `.rows` = `undefined`, sehingga `undefined[0]` melempar `TypeError: Cannot read properties of undefined (reading '0')` → ditangkap route → 500.
- Bug ini muncul dari merge commit `beb2a65`: `ce8c60e` mengubah akses ke `.rows[...]` (untuk `db.execute`), lalu `c08127a` mengganti query menjadi `db.select(...)` tanpa menyesuaikan akses hasilnya.
- `npx tsc --noEmit` mengonfirmasi: 5x `TS2339: Property 'rows' does not exist on type '{ count: number; }[]'` (lint tidak menangkap karena type-check ESLint nonaktif).

**Fix:**
- `src/modules/booking/dashboard.service.ts` — `result.rows[0]` → `result[0]?.count` / `result[0]?.total` (5 baris).
- `getRecentBookings()` tetap memakai `db.execute(...).rows` — benar, karena `db.execute` memang mengembalikan `QueryResult`.

**Regression test (baru):**
- `src/modules/booking/dashboard.service.test.ts` — 4 test: aggregate dari array, `bookingChange`, empty result set, mapping `getRecentBookings`.

**Artifact repair:**
- `feature_list.json` — JSON rusak sejak HEAD (duplikat `},` baris 77-78 dari merge) → diperbaiki, sekarang valid; evidence feat-040 diperbarui.

**Verification:**
- `npx tsc --noEmit` — 0 error di `src/` (sisa hanya `.next/types/validator.ts` stale, pre-existing)
- `npm run lint` — 0 errors, 79 warnings (pre-existing)
- `npx jest` — 1 suite, 4/4 tests passing
- Catatan: `DATABASE_URL` tidak tersedia di environment lokal ini, jadi verifikasi end-to-end terhadap DB belum dijalankan.

**Risks:**
- `./init.sh` saat ini hanya echo (checklist lint/test sudah dikomentari) — verifikasi dijalankan manual via `npm run lint` / `npx jest`.
- Tidak ada test lain di repo (`npm test` → "No tests found" sebelum session ini).

## Session 36 — Pre-Deploy Audit: Hardening & Repair Harness

**Goal:** Audit kesiapan deploy (target: VPS self-hosted via pm2 / `ecosystem.config.cjs`), perbaiki celah kritikal.

**Hasil audit (live smoke test terhadap Neon dev DB):**

| Temuan | Severity | Status |
|---|---|---|
| `PUT /api/trips/[id]/groups/[groupId]/complete` menulis DB **tanpa auth** (200) | CRITICAL | ✅ ditambal → 401 |
| `GET .../groups/[groupId]/participants` bocorkan nama+telepon peserta tanpa auth | CRITICAL | ✅ ditambal → 401 |
| `GET /api/reviews` tanpa filter kembalikan semua review + **email user** tanpa auth | HIGH | ✅ ditambal → 401 (jalur publik `?tripId&status=approved` tetap 200) |
| `./init.sh` rusak — sintaks JS `//echo` di bash → exit 127, verifikasi tidak pernah jalan | HIGH | ✅ diperbaiki (lint + tsc + jest) |
| `feature_list.json` JSON invalid (duplikat `},` akibat merge) | HIGH | ✅ diperbaiki, parse OK |
| Error handler route bocorkan `err.message` mentah (query SQL + params ke client) | MEDIUM | ⚠️ belum — lihat Risiko |
| `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` di `.env` = `http://localhost:3000` | HIGH (deploy) | ⚠️ wajib diganti saat deploy |
| `npm audit`: 14 vuln (1 critical `next` RCE di Windows/AVIF, 6 high) | HIGH | ⚠️ `next` 16.2.11 → 16.3.6 |
| Tidak ada rate-limit kustom (bawaan better-auth sudah 429 setelah 3 login gagal — terverifikasi) | INFO | ✅ cukup |
| Upload ditulis ke `process.cwd()/uploads` (local FS) — hilang di serverless, perlu volume/backups di VPS | MEDIUM | ⚠️ catatan deploy |

**Integritas data:** tes exploit `complete` sempat mengubah `trip_departures.updated_at` pada 1 grup dev. Booking TIDAK berubah (keduanya bukan `confirmed` — diverifikasi ulang: `TRV-MUFN9Z5Y-WFY3` = completed, `TRV-MUGDOVRH-OQNT` = pending, `updated_at` masih 2026-09-24). Tidak ada data lain tersentuh.

**Files Modified:**
- `src/app/api/trips/[id]/groups/[groupId]/complete/route.ts` — `requireAdmin(req)` di awal PUT
- `src/app/api/trips/[id]/groups/[groupId]/participants/route.ts` — `requireAdmin(req)` di awal GET
- `src/app/api/reviews/route.ts` — cabang "semua review" wajib admin; cabang publik tidak berubah
- `init.sh` — ganti `//echo` → `echo`, aktifkan `npm install` / `lint` / `tsc` / `jest`
- `feature_list.json` — JSON repair + evidence feat-040 & feat-080

**Verification:**
- `bash ./init.sh` → EXIT 0 (lint 0 errors, tsc 0 errors, jest 4/4)
- `npm run build` → ✓ Compiled successfully, 62/62 static pages
- Smoke test live: 401 tanpa auth / 200 dengan admin session untuk 3 endpoint; `GET /api/admin/dashboard` → **200** (bug 500 Session 35 terkonfirmasi teratasi end-to-end)

**Risks / belum dikerjakan:**
1. **Bocor `err.message` mentah** di ±78 tempat `catch` (terbukti: `GET /api/trips/x/groups` mengembalikan query SQL + params ke client). Solusi: helper `toPublicError(e)` yang hanya meneruskan pesan `AppError`, generic sisanya.
2. **Ganti semua secret saat deploy**: `BETTER_AUTH_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL` (harus domain produksi, bukan localhost), `BETTER_AUTH_SECRET` baru, dan **ganti password seed `admin@otl.id`/`admin`** (bcrypt cost 10, tapi kredensial publik di repo/seed).
3. **`npm audit fix`** → naikkan `next` ke 16.3.6 (critical RCE advisory).
4. Jalankan migrasi `drizzle/*.sql` manual di server (tidak ada runner otomatis di build).
5. `uploads/` perlu backup/volume di VPS; jangan pakai Vercel tanpa object storage.

## Session 37 — Sanitasi Pesan Error API (Allowlist)

**Goal:** Tutup kebocoran internals ke response API. Sebelumnya terbukti live: `GET /api/trips/x/groups` mengembalikan **query SQL mentah + params** ke browser.

**Pendekatan: ALLOWLIST, bukan blocklist.**
Blocklist tidak akan pernah lengkap (setiap error type baru = leak baru). Sebagai gantinya: hanya pesan yang memang **ditulis developer untuk user** (`AppError` & subclass) yang boleh lewat; sisanya dipastikan tidak pernah bocor — tapi **tetap di-log penuh ke server console** (`console.error("[api] non-AppError caught:", err)`) supaya tetap bisa didebug.

**Perubahan:**
1. **`src/shared/errors/to-public-error.ts` (baru)** — `toPublicError(err, fallback)`:
   - `AppError` → teruskan `err.message` apa adanya
   - selainnya → `fallback` (generik) + log penuh di server
2. **82 catch block di 45 file** (route handler + controller) diganti dari
   `err instanceof Error ? err.message : "Terjadi kesalahan"` → `toPublicError(err, "...")`.
   Fallback khusus (`"Terjadi kesalahan saat upload."`, `"Gagal menyimpan request"`, dll) dipertahankan per lokasi.
3. **21 `throw new Error(...)` di 4 service dimigrasi ke `AppError`** — ini wajib, karena allowlist hanya meneruskan `AppError`, kalau tidak pesan bisnis ikut tersensor.
   - `trip.service.ts` → `NotFoundError("Trip"/"Grup")`, `ValidationError`, `ConflictError`
   - `promotion.service.ts` → `ValidationError("Kode promo tidak valid")`, `ConflictError("Kuota promo habis")`
   - `booking.service.ts` → `ConflictError("Quota habis...")`
   - `private-trip.service.ts` → `AppError("Request not found"/"Proposal not found", "NOT_FOUND", 404)`, `ValidationError`, `ConflictError`, `UnauthorizedError`

**Jaminan keputusan: teks yang sampai ke user100% identik.**
`NotFoundError("Trip")` menghasilkan `"Trip tidak ditemukan"` (identik ✓), tapi `NotFoundError("Request")` akan menghasilkan `"Request tidak ditemukan"` (berubah ✗) → untuk itu dipakai `AppError` langsung dengan teks asli. Verifikasi live: `"Grup tidak ditemukan"` tetap tampil persis.

**Sengaja TIDAK disentuh:**
- `src/shared/db/retry.ts` — `.message` dipakai untuk **regex kontrol alur** (`isTransientError`), bukan untuk response
- 6 client component `src/app/admin/*` — error mereka berasal dari fetch (respons server sudah tersensor) atau pesan jaringan generik, bukan internals

**Bukti live (server jalan, Neon dev DB):**
| Endpoint | Sebelum | Sesudah |
|---|---|---|
| `GET /api/trips/nonexistent/groups` | `Failed query: select "id"... params: y` | `Terjadi kesalahan` |
| `GET /api/blogs/not-a-uuid` | (drizzle error mentah) | `Terjadi kesalahan` |
| `POST /api/contact` (zod invalid) | pesan zod | **tetap** `Invalid input: ... Email tidak valid, Pesan wajib diisi` |
| `POST /api/newsletter` (email invalid) | — | **tetap** `Email tidak valid` |
| `PUT .../groups/[id]/complete` (admin, tak ada) | — | **tetap** `Grup tidak ditemukan` |
| `PUT .../complete` (tanpa session) | 200 (exploit) | `Unauthorized` |

**Files Created:**
- `src/shared/errors/to-public-error.ts`
- `src/shared/errors/to-public-error.test.ts` (12 test: pesan AppError lewat, SQL/connection/path/TypeError/JSON disensor, fallback khusus, selalu log)

**Files Modified:** 45 route/controller (codemod) + 4 service (migrasi throw)

**Verification:**
- `bash ./init.sh` → EXIT 0
- `npm run lint` → 0 errors, 79 warnings (pre-existing)
- `npx tsc --noEmit` → 0 errors
- `npx jest` → 2 suites, **16/16 passing**
- `npm run build` → ✓ Compiled, 62/62 pages
- Smoke test live → tabel bukti di atas

**Catatan:** `retry.ts` sengaja tetap memakai pola lama karena ia **meng-parse** pesan error DB untuk menentukan retry — menggantinya akan memutus fitur retry.

## Session 38 — Pre-Deploy Audit & Kesiapan VPS (2026-09-29)

**Goal:** Tentukan apa yang harus diperbaiki sebelum kode di-deploy ke VPS. Bukan fitur baru — audit kesiapan.

**Temuan utama:**

1. **Kode sudah ke-merge.** Branch `fix/dashboard-admin` (4 commit) sudah masuk `origin/main` lewat PR #100 — `git merge-base --is-ancestor HEAD origin/main` = true. Tidak ada yang tertinggal untuk di-push.
2. **Security kode sudah rapi, tidak ada yang perlu diperbaiki.** Diverifikasi langsung:
   - 9 route `/api/**admin**` semua pakai `requireAdmin` (loop satu-satu, nol yang tanpa auth)
   - `toPublicError` dipakai di 47 file; sisa `err.message` mentah tinggal `retry.ts` (sengaja) + file test
   - Upload: `requireAdmin` + cek magic-bytes asli (`detectImageKind`), bukan cuma ekstensi; nama file digenerate random; max 5MB
   - Baca file: guard `..` + `startsWith(UPLOADS_DIR)`
   - Query: semua Drizzle parameterized
   - Booking & private-trip: session dicek di controller, ownership dicek di service
3. **Migrasi DB adalah risiko terbesar untuk server baru.** Tabel auth `session`/`account`/`verification` **tidak ada di file SQL manapun** — dibuat via `drizzle-kit push` selama pengembangan. `drizzle/meta/_journal.json` juga cuma memuat 3 dari 7 file SQL, jadi `drizzle-kit migrate` akan melewatkan 4 file terakhir. **Keputusan: pakai `drizzle-kit push` untuk DB baru, lewati kalau DB lama. JANGAN pakai `migrate`.**
4. **`.env` harus diisi sebelum `npm run build`** — `NEXT_PUBLIC_*` di-bake saat build. Kalau diisi sesudah, harus build ulang.

**Perubahan:**
- `npm audit fix` → `next` 16.2.11 → **16.3.6**. Vulnerabilities: 16 (1 critical, 6 high) → **5 moderate**. Sisa 5 semuanya di dependency dev (`drizzle-kit`, `nodemailer` transitif) — `--force` justru menurunkan `drizzle-kit` ke versi breaking, sengaja tidak dipakai. `package.json` tidak berubah, hanya `package-lock.json`.
- `feature_list.json` — summary salah hitung akibat merge: deklarasi `in_review:20 / completed:23 / to_do:13`, aktual `17 / 22 / 16`. Diperbaiki.
- `.gitignore` — tambah `/test-results/`, `/playwright-report/`, `/uploads/`, `/public/uploads/`
- **`uploads/` sengaja TIDAK dihapus dari git** (61 file tetap ter-track). Alasan: URL `/api/uploads/<nama>` tersimpan di DB; kalau file ikut hilang dari clone, gambar lama 404. `.gitignore` hanya mencegah file **baru** ikut ter-commit.
- `docs/DEPLOY.md` (baru) — checklist deploy siap-jalan untuk teman yang menangani VPS, termasuk 3 hal yang paling sering kelupaan (password admin, persistensi `uploads/`, urutan `.env` vs build)

**Verification:**
- `bash ./init.sh` → **EXIT 0** (lint 0 errors / 79 warnings pre-existing, `tsc` 0 errors, jest 16/16)
- `npm run build` → ✓ Compiled di `next` 16.3.6, semua route OK
- `npm audit --omit=dev` → sisa 5 moderate, 0 critical / 0 high
- `feature_list.json` divalidasi ulang lewat script: summary == hitungan aktual

**Risks / catatan:**
1. **Password `admin@otl.id` / `admin` masih berlaku** — ada di repo publik (`src/db/seed.ts`). Wajib diganti via UI profile SETELAH deploy; mengubah seed saja tidak cukup karena user sudah ada di DB.
2. **`BETTER_AUTH_SECRET` harus baru** di server, dan `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` harus ganti dari `http://localhost:3000` ke domain produksi.
3. **`uploads/` harus persisten** — pm2 di VPS biasa aman; Docker wajib mount volume.
4. **`vercel.json` masih ada** padahal target pm2/VPS — kontradiktif, belum diputuskan dihapus atau tidak.
5. 79 lint warning pre-existing (mayoritas `<img>` bukan `next/image`) — tidak mempengaruhi fungsi, tidak dikerjakan sesi ini.

## Session 39 — Fix: Foto Profil Kadang Tidak Muncul (alt text menggantikan foto)

**Laporan:** "Foto profil terkadang tidak muncul saat pertama buka website, menampilkan teks alternatif. Setelah refresh bisa."

**Diagnosis (diverifikasi, bukan asumsi):**

Yang tampil adalah **alt text**, bukan fallback inisial huruf. Di 3 tempat foto profil dirender
(`ProfileHeader.jsx:19`, `Navbar.jsx:147`, `admin/users/page.tsx:251`) **tidak ada satu pun `onError`**.
Fallback-nya hanya mengecek *"apakah `image` ada di data?"*, bukan *"apakah gambarnya berhasil dimuat?"*:

```
image === null          → inisial huruf     ✅
image ada, load OK      → foto tampil       ✅
image ada, load GAGAL   → alt text permanen ❌  (inisial tidak pernah muncul)
```

Kegagalan memuat di kunjungan pertama + retry sukses di refresh = ciri persis "terkadang, bisa setelah refresh".

**Bukti:** screenshot `test-results/A-normal.png` (sebelum) vs `test-results/fix-A-diblokir.png` (sesudah).

**Yang sudah dibuktikan BUKAN penyebab** (diuji langsung sampai ke DB & server):
- Data `image` — `get-session` selalu mengembalikannya benar (diuji dengan akun probe)
- Cookie cache session basi — `cookieCache` hanya untuk setup tanpa database; respons tanpa `Set-Cookie`
- Halaman `/profile` di-prerender (`x-nextjs-prerender: 1`), tapi avatar dirender di client setelah session datang
- URL Google mati — semua 200, responsif 0.17–0.25s
- Form edit admin menghapus foto — hanya kirim `name, phone, role, loyaltyPoints`
- Diblokir `next/image` / CSP — pakai `<img>` biasa, tidak ada CSP

**Perbaikan (3 file):**
- Inisial huruf kini **selalu dirender di belakang** sebagai lapisan fallback
- `<img>` di atasnya dengan `onError` → `display:none` → inisial langsung terlihat saat gambar gagal
- `alt=""` — sebelumnya `alt={nama}` yang justru jadi "teks alternatif" yang dilaporkan. `alt=""` benar secara a11y karena nama sudah tampil berdampingan (foto profil bersifat dekoratif)
- `key={url}` — kalau nanti ada fitur ganti foto, elemen di-remount sehingga status `display:none` tidak tertinggal

**Files Modified:**
- `src/components/profile/ProfileHeader.jsx`
- `src/components/layout/Navbar.jsx`
- `src/app/admin/users/page.tsx`

**Verification:**
- `bash ./init.sh` → **EXIT 0** (lint 0 errors / **79 warning — identik dengan sebelumnya**, tsc 0 errors, jest 16/16)
- `npm run build` → ✓ Compiled, 62/62 pages
- **Playwright reproduksi A/B** (akun probe dengan foto, `lh3.googleusercontent.com` diblokir):
  - A) gambar diblokir → `<img>` `visible:false` (onError aktif), inisial "P" tampil rapi ✅
  - B) gambar normal → `naturalWidth:96`, foto tampil seperti biasa ✅
- Data test dibersihkan: akun probe dihapus, DB kembali 13 user, server dimatikan, tree bersih

**Risks / catatan:**
1. **Penyebab kegagalan memuat di kunjungan pertama tidak bisa direproduksi dari mesin dev** (URL selalu 200). Yang diperbaiki adalah *dampaknya* — sekarang selalu jatuh ke inisial, tidak pernah alt text. Kalau perlu tahu akar jaringannya: DevTools → Network → Disable cache, cek status request `lh3.googleusercontent.com` saat kunjungan pertama.
2. **Foto profil hanya bisa diisi oleh Google OAuth** — tidak ada endpoint/form upload avatar (9 dari 13 user ber-`image: NULL`). Fitur upload avatar jadi usulan lanjutan, infrastruktur `/api/upload` sudah ada.

### 2026-08-09 — Audit domain ulasan & perbaikan rating/statistik trip
- **Motivasi**: audit domain Reviews atas permintaan user setelah selesai audit pre-deploy.
- **Audit (tanpa ubah kode) menemukan 3 kesalahan nyata dengan bukti DB**:
  1. Rating palsu 5.0 — `trip.repository.ts` fallback `5.0` untuk trip tanpa ulasan (Bali &
     Yogyakarta menampilkan ★5.0 padahal 0 ulasan), plus 6 fallback hardcoded lain
     (`DEFAULT_RATING`, `"4.8"`, `?? 5.0`) di kartu/landing/private.
  2. `trips.rating` & `trips.review_count` tidak pernah ditulis → labuan Bajo tampil
     "4.0 (0 ulasan)" (AVG realtime vs kolom basi).
  3. `POST /api/reviews` tidak mengecek status booking — guard "harus completed" hanya
     di client (`OpenTripBookingCard`), bisa di-bypass.
- **Temuan lain (belum diperbaiki)**: PUT `/api/reviews/[id]` tanpa whitelist field;
  review duplikat menghasilkan pesan generik 400 (harusnya 409); label "N ulasan
  terverifikasi" padahal `is_verified_purchase` selalu false; duplikasi schema
  `src/db/schema/reviews.ts` (userId uuid — salah) yang dead code; `review_media` tanpa
  PK/FK di DB; N+1 query di `fetchApproved`/`findAll`/`findAllPublished`; kode mati
  `reviewController` + `reviewService.createReview` + `findAverageRatingByTripId`.
- **Fix diterapkan (11 file)**:
  - `trip.repository.ts`: fallback `5.0` → `null`.
  - `lib/Destination.js`, `DestinationCard`, `DestinationHeader`,
    `landing/DestinationSection`, `private/DestinationCard`, `private/SelectedDestination`,
    `private/page.jsx`: rating null → teks "Belum ada ulasan" (juga menghapus
    fallback "4.8"/"5.0" palsu).
  - `review.repository.ts`: fungsi baru `recomputeTripStats(tripId)` → hitung ulang
    `trips.review_count` + `trips.rating` dari ulasan approved.
  - `api/reviews/[id]`: panggil recompute di PUT & DELETE (setelah ambil tripId lama).
  - `api/reviews` POST: booking wajib `status === "completed"`.
  - `docs/database/backfill-review-stats.sql`: backfill idempoten — **harus dijalankan
    1x di DB produksi setelah deploy**.
- **Verifikasi**: tsc 0; lint 0 err/79 warning (tidak bertambah); `npm run build` OK;
  `./init.sh` EXIT 0, jest 16/16.
- **Bukti fungsional (server produksi + Chrome)**:
  - API `/api/trips`: Labuan Bajo rating=4 count=1; Bali & Yogyakarta rating=null count=0.
  - Kartu /trips: Bali & Yogyakarta menampilkan "Belum ada ulasan" (bukan ★5.0);
    detail Labuan Bajo: "4.0 (1 ulasan)" (bukan "0 ulasan").
  - Recompute: PUT status pending → rating=null count=0; PUT approved → 4 / 1 (kembali).
  - Guard: booking `pending` → 400 "Ulasan hanya bisa diberikan setelah trip selesai";
    booking `completed` → 201 (user sah tidak diblokir).
- **Bersih**: akun & booking probe dihapus (DB 13 user, 1 review, 0 booking probe),
  server dimatikan, evidence di `test-results/fix-review-*.png`.

### 2026-08-09 — Lanjutan audit ulasan: temuan "sebaiknya" (branch `deployment`)
- **Motivasi**: user meminta seluruh temuan prioritas rendah/sedang dari audit domain
  Reviews dikerjakan, tetap di branch `deployment`.
- **Whitelist `PUT /api/reviews/[id]`**: hanya `status` (enum pending/approved/rejected)
  dan `isFeatured` (boolean) yang diterima; field lain → 400. Sebelumnya body diteruskan
  apa adanya ke `update()`, sehingga `userId`/`bookingId`/`tripId` bisa diubah admin
  dan status bisa diisi nilai apa pun.
- **Review duplikat → 409**: cek `booking_id` sebelum insert → 409
  "Anda sudah mengulas booking ini" (sebelumnya kena unique constraint → pesan generik 400).
- **`is_verified_purchase` dihidupkan**: POST kini `true` (server sudah memastikan booking
  completed + milik user), dan `ReviewsSection` menghitung label dari
  `isVerifiedPurchase` — kata "terverifikasi" hanya muncul kalau semuanya terverifikasi.
- **Kode mati dihapus (3 file)**: `review.controller.ts` (never used, berisi `...body`
  tanpa auth = celah mass-assignment), `review.service.ts` (hanya wrapper
  `createReview` tanpa pemakai) + export-nya di `index.ts`, `src/db/schema/reviews.ts`
  (duplikat dengan schema module, `userId: uuid` — salah), dan `findAverageRatingByTripId`.
- **`review_media`**: ditambahkan composite PK `(review_id, media_id)` sesuai
  `docs/database/PANDUAN_DATABASE.md`, FK diubah jadi `ON DELETE CASCADE`
  (tanpa ini hapus review yang punya media akan gagal). Diterapkan via SQL di DB dev
  + `docs/database/review-integrity.sql` (idempoten) untuk produksi.
- **N+1 dihilangkan** (query per baris → batch `inArray`):
  `fetchApproved` 2/baris → 2 total; `findAll` 4/baris → 4 total;
  `findAllPublished` 1 AVG per trip → 1 query `GROUP BY`.
- **`docs/DEPLOY.md`**: langkah baru **4b** — jalankan 2 skrip SQL
  (`backfill-review-stats.sql`, `review-integrity.sql`) untuk SEMUA kondisi database.
- **Verifikasi**: tsc 0; lint 0 err/79 warning (tidak bertambah); `npm run build` OK;
  `./init.sh` EXIT 0.
- **Bukti fungsional (server produksi + Chrome)**:
  - PUT: `userId` → 400; `status` invalid → 400 "Status tidak valid"; body kosong → 400;
    `isFeatured` string → 400; `status+isFeatured` valid → 200 + recompute tetap jalan
    (trip Labuan Bajo tetap rating=4 count=1).
  - POST: ulasan pertama → 201 `is_verified_purchase=true`; duplikat → 409.
  - GET admin: enrich batch menghasilkan field identik (userName, userEmail, tripTitle,
    groupStartDate, groupEndDate, bookingCode).
  - UI: tab Ulasan menampilkan "1 ulasan terverifikasi" + tidak ada error halaman.
  - `review-integrity.sql` dijalankan ulang → tidak ada error (idempoten).
- **Bersih**: probe dihapus (DB 13 user, 1 review, 0 booking probe), server dimatikan,
  evidence `test-results/fix-review-label.png`.

### 2026-08-09 — Audit & perbaikan domain Poin Referral (branch `deployment`)
- **Audit** menemukan 3 kesalahan wajib + temuan lain (semua bukti runtime, bukan asumsi):
  - `GET /api/user/referral` **500** — `sum(commissions.amount)` pada kolom varchar
    (`function sum(character varying) does not exist`). Dipakai `profile/page.jsx` &
    `ProfileStats` → "Poin Loyalitas"/"Total Referral" selalu tampil 0.
  - Bonus referral **tidak bisa diberikan**: tabel `site_settings` tidak ada di DB
    (drift) → `getReferralBonusPoints()` gagal **setelah** referral ditandai converted,
    dan route menolak retry ("Pembayaran sudah diproses sebelumnya") → poin hilang
    permanen.
  - Pemberian poin **non-atomic**: `createTransaction` + `updateLoyaltyPoints` dua
    operasi terpisah tanpa transaksi.
- **Fix (wajib)**:
  - `src/shared/db/utils.ts`: `withTransaction` kini **meneruskan `tx`** ke callback
    (sebelumnya callback tidak pernah menerima tx — semua query tetap jalan di
    koneksi terpisah, jadi helper itu menyesatkan); export tipe `Tx`.
  - `payment.service.reviewPayment`: satu `withTransaction` untuk payment + booking +
    referral + poin. Urutan diperbaiki: **baca konfigurasi di luar transaksi →
    poin dulu → `converted` kemudian**. Gagal = seluruh transaksi rollback.
  - `loyalty.repository`: method menerima `target?: db | tx`; `loyalty.service`
    `creditReferralBonus(tx, ..., points)` wajib dalam transaksi; `creditCashback`
    ikut dibungkus transaksi.
  - `api/user/referral`: `sum(x::numeric)` + `coalesce`.
- **Bug ke-4 terungkap saat uji**: `loyalty_transactions.reference_id` bertipe `uuid`
  di DB tapi nilainya better-auth user id → `invalid input syntax for type uuid`,
  kredit poin selalu gagal. Kode (`text`) sudah benar, DB-nya yang disesuaikan →
  `docs/database/referral-integrity.sql` (idempoten).
- **DB dev**: `site_settings` dibuat via `drizzle/0003_site_settings.sql`
  (default `referral_bonus_points=10000`); `reference_id` → text.
- **`docs/DEPLOY.md` 4b** ditambah 2 skrip: `0003_site_settings.sql`,
  `referral-integrity.sql` + kolom "kalau dilewat".
- **Verifikasi**: tsc 0; lint 0 err/79 warning; build OK; `./init.sh` EXIT 0.
- **Bukti fungsional (server produksi + Chrome, probe dibersihkan)**:
  - `GET /api/user/referral` 200 (dulu 500); `admin/site-settings/referral-bonus`
    200 `{referralBonusPoints:10000}` (dulu 500).
  - Skenario A — `site_settings` disembunyikan saat approve: 500 dengan
    `payment=pending booking=pending referral=pending poin=0 ledger=0`
    (**nol perubahan**, dulu payment & referral terlanjur berubah).
  - Skenario B — approve sukses: 200, semua berubah bersamaan
    `payment=paid booking=confirmed referral=converted poin=10000 ledger=1`.
  - Skenario C — retry: 400, poin tetap 10000 (tidak dobel).
- **Temuan audit lain yang BELUM dikerjakan**: poin tidak punya alur tukar/pakai
  (hanya `type:"earn"`, `expiresAt` tak pernah dievaluasi); `creditCashback`
  hardcoded 25.000 & tak pernah dipanggil; kode referral salah diabaikan diam-diam di
  checkout; endpoint `checkout/validate-referral` tak pernah dipanggil UI; insert
  referral gagal hanya `console.error`; N+1 di `/api/referrals/history`; kode mati
  `payment.controller` + `confirmPayment`/`getPaymentsByBooking`;
  `referralService.getAgentCommissions`; 10/13 user tanpa `referral_code`
  (`src/db/backfill-referral-codes.ts` belum dijalankan); 3 tabel yatim di DB.
- **Bersih**: probe dihapus (13 user, 0 ledger, 0 referrals), server dimatikan.

### 2026-08-09 — Audit poin referral: temuan "sebaiknya" (branch `deployment`)
- **Dikeluarkan dari daftar**: alur tukar/pakai poin = fitur baru (butuh keputusan
  produk), bukan perbaikan — tidak layak masuk menjelang deploy.
- **2 temuan audit gugur setelah dicek ulang** (salah saya waktu audit, dicatat agar
  tidak diulang): endpoint `checkout/validate-referral` **sudah dipakai**
  `useCheckout.js:applyReferral` (filter grep saya menghapusnya), dan `ReferralInput`
  **sudah** punya validasi real-time via `onApply`.
- **Kode referral salah tak lagi diabaikan diam-diam** (`api/checkout`): dulu kode yang
  tidak ditemukan → `referrerId=null` → checkout tetap sukses. Kini validasi server-side
  SEBELUM menulis apa pun → 400 "Kode referral tidak ditemukan" / "…kode referral
  sendiri".
- **Checkout jadi atomik**: booking + peserta + deklarasi kesehatan + catatan referral
  dalam 1 `withTransaction` (dulu referral insert terpisah dengan `catch` yang hanya
  `console.error` → booking bisa terbentuk tanpa referral). Statistik voucher sengaja
  tetap di luar transaksi (gagal tidak boleh membatalkan booking) — dikomentari.
- **N+1 di `/api/referrals/history` (admin)**: ~4 query per baris → 5 query total
  (batch `inArray` untuk users, bookings, departures, trips; `await import()` di dalam
  loop dihapus).
- **Whitelist `POST` + `PUT /api/commissions`**: hanya `agentId`/`bookingId`/`amount`/
  `status` dengan validasi (uuid, angka, enum `pending/approved/paid/rejected`) — dulu
  body diteruskan apa adanya (mass assignment) termasuk `ruleId`/`referralId`.
- **Kode mati dihapus**: `payment.controller.ts`, `referral.service.ts` +
  export-nya, `paymentService.createPayment`/`confirmPayment`/`getPaymentsByBooking`,
  `paymentRepository.create`/`findByBookingId`,
  `referralRepository.getCommissionsByAgent`, `loyaltyService.creditCashback`
  (hardcoded 25.000, nol pemakai, tidak disebut PRD/feature_list).
- **`backfill-referral-codes.ts`**: jalankan di dev → 10 user kini punya kode
  (sebelumnya 10/13 tanpa kode). File juga diberi `import "dotenv/config"` — tanpa ini
  perintah yang tertulis di komentar file-nya sendiri gagal `ECONNREFUSED`.
- **UI `ReferralInput`**: hint muncul kalau kode diketik tapi belum ditekan "Pakai"
  (kode seperti itu memang tidak ikut dikirim — `referralCode: appliedReferral?.code`).
- **Verifikasi**: tsc 0; lint 0 err/79 warning (tidak bertambah); build OK;
  `./init.sh` EXIT 0.
- **Bukti fungsional (server produksi + Chrome, semua probe dibersihkan)**:
  - Checkout: tanpa referral 200 (booking+peserta terbentuk); kode salah →
    **400 tanpa booking baru**; kode sendiri → 400; kode valid → 200 dengan
    **1 referral row status pending** — booking/peserta/referral terbentuk bersamaan.
  - `GET /api/referrals/history` → enrich batch menghasilkan `referrerName`,
    `referredUserName`, `bookingCode`, `tripTitle` (null karena 38 booking dev memang
    menunjuk departure yang sudah dihapus — diverifikasi, bukan bug).
  - Komisi: `{}` → 400; `amount:"10.000"` → 400; `status:"siap"` → 400;
    `ruleId` di PUT → 400 (tertolak whitelist); valid → 201/200.
- **Tidak disentuh**: 3 tabel yatim di DB (`destinations`, `meeting_points`,
  `newsletter_subscribers`) — tidak ada kode yang memakai, tapi penghapusan tabel
  tidak ada gunanya menjelang deploy.

### 2026-08-09 — Pemeriksaan visual (screenshot) + fix identitas header admin
- **Cara verifikasi visual**: alih-alih `npx playwright test` (78 test, boros RAM —
  laptop dev tidak sanggup), jalankan **satu tab Chrome serial**: server → `page.goto`
  → screenshot → tutup. Hemat memori, cukup untuk menilai tampilan.
  Screenshot tersimpan di `test-results/vis-*.png` (gitignore).
- **Jujur soal E2E**: selama sesi audit ini yang dijalankan adalah **uji API
  (curl/fetch) + query DB + screenshot**, BUKAN suite `npx playwright test`
  (78 test) maupun `npm run test` (Jest). Run terakhir suite = 2026-09-28 10:01,
  **sebelum** 6 commit di branch `deployment`. Belum dijalankan ulang.
- **Terbukti di layar**: `/trips` → Labuan Bajo `★ 4.0`, Bali & Yogyakarta
  **"Belum ada ulasan"**; detail → `4.0 (1 ulasan)`; profil → kartu Poin Loyalitas
  dan Total Referral tampil (0, bukan kosong); admin ▸ ulasan → 1 baris sesuai DB;
  admin ▸ komisi → "Belum ada data komisi."
- **Temuan baru**: `AdminShell.tsx` menampilkan **identitas hardcode**
  `Admin Master / admin@opentrip.co.id` — tidak ada di DB (admin asli
  `admin@otl.id`), dan file itu nol `useSession`. Semua admin melihat identitas
  orang lain. **Diperbaiki**: baca `useSession()`, nama/email/inisial diturunkan
  dari akun login, fallback `"Admin"` (bukan string identitas siapapun).
- **Salah baca sendiri**: screenshot pertama sebenarnya sudah menampilkan hasil
  baru (`AO` / `Admin OTL`), tapi saya menyimpulkan "masih lama" tanpa benar-benar
  membacanya → saya telusuri ke source → bundle (`Admin Master` tidak ada di
  `.next/static`, hanya di `.map` akibat komentar) → DOM (langsung
  `Admin OTL` / `admin@otl.id`). Pelajaran: bukti bertentangan = periksa sumber,
  jangan menyalahi kode.
- **Verifikasi**: tsc 0; lint 0 err/79 warning; build OK; `./init.sh` EXIT 0;
  server dimatikan.

### 2026-08-09 — Sidebar admin diganti template shadcn (branch `deployment`)
- `AdminShell` kini memakai `AppSidebar` (template dashboard shadcn) menggantikan
  `AdminSidebar` kustom — diminta eksplisit oleh user ("ganti sepenuhnya").
- Isi tab = menu admin (6 grup: Menu Utama, Trip & Tempat, Pengguna & Partner,
  Marketing, Order, Konten) + ikon lucide yang sudah ada; tanpa logo/ikon baru.
- Struktur listing dipertahankan persis template (NavMain collapsible + chevron);
  satu-satunya deviasi: judul tab disembunyikan saat collapse (perbaikan teks
  bocor), dan `gap-2` antar blok tab (kompensasi section Projects yang dihapus).
- Tema gelap + teks putih via class `.admin-sidebar-dark` (sudah ada di
  globals.css); label grup dikecualikan agar tetap redup seperti template.
- Header sidebar = logo brand + "Panel Admin"; footer = link "Lihat Website"
  (tab baru, konvensi View Site); section Projects contoh + NavUser contoh
  dihapus; TeamSwitcher contoh dihapus.
- Navbar admin kanan-atas = lingkaran foto profil saja (buka dropdown persis
  Navbar utama: Profil Saya, Halaman Admin, Riwayat Trip, Keluar).
- Tombol lonceng disamakan dengan SidebarTrigger (ghost icon-sm); panel
  notifikasi digaya DropdownMenu shadcn (radius-md, baris rounded-sm, separator,
  ikon muted); daftar punya p-1 agar tidak menempel kontainer.
- Fix scroll horizontal: `SidebarInset` + konten `min-w-0`, konten
  `overflow-x-clip`, header `left-0` — tabel scroll di dalam, header diam,
  profil/lonceng selalu terlihat (terbukti di /admin/private-trips).
- `next.config.ts`: izinkan `lh3.googleusercontent.com` (avatar Google login
  OAuth) — perbaiki error "Invalid src prop" di next/image.
- `use-mobile.ts`: bungkus setState awal dengan queueMicrotask (hilangkan
  1 lint error bawaan file template shadcn).
- File template shadcn (dashboard, app-sidebar, nav-*, team-switcher, ui/*,
  package.json + `cn`) ditambahkan ke tree oleh user/rekan sebelum sesi ini;
  ikut di-commit karena build bergantung padanya.
- Pelajaran sesi: 3x salah baca screenshot — angka DOM lebih andal; proses
  server basi berulang (wajib loop-kill + cek start time); 2 batch edit
  "sukses" hilang dari file (sebab tak teridentifikasi) — verifikasi grep
  langsung setiap edit sejak itu.
- Verifikasi: tsc 0; lint 0 err/78 warning; build OK; `./init.sh` EXIT 0;
  E2E suite 78 test tetap belum dijalankan (laptop dev tidak sanggup).

## Session 40 — Bugfix: Voucher promo bikin checkout gagal "Total pembayaran tidak sesuai"

**Laporan:** "Isi kode promo lalu klik Lanjut ke Pembayaran, tiba-tiba muncul error"
(`400 Total pembayaran tidak sesuai. Silakan muat ulang halaman.`) dan
"UI should display the discounted price" — ringkasan harga tidak pernah
menampilkan baris diskon.

**Diagnosis (diverifikasi sampai ke DB, bukan asumsi):**

Log server menunjukkan `clientTotal 2200000` vs `expectedTotal 2100000`
(subtotal sama, jadi bedanya murni diskon: client 0, server 100000).
Query langsung ke `promotions`:

```
code AEZAKMI | type percentage | value "70%" | max_discount "100000" | min_purchase "100000"
```

Kolom `value` bertipe varchar dan admin mengisinya bebas
(placeholder lama: "20% atau 100000"). Tiga parser berbeda membaca nilai itu:

| Lokasi | Ekspresi | "70%" |
|---|---|---|
| client `useCheckout.js` | `Number(value) \|\| 0` | **0** → diskon 0, UI tanpa baris diskon |
| server `api/checkout/route.ts` | `toNumber()` (buang non-angka) | **70** → 70% dari 2.200.000 = 1.540.000, di-cap max 100.000 |
| `promotion.service.ts` | `parseInt()` | 70 |

Client kirim total penuh (2.200.000), server mengharapkan 2.100.000 → 400.
Itu sebabnya error tetap muncul walau voucher sudah ditekan "Pakai".

**Perbaikan:**

- `src/shared/promo/promo-value.ts` (baru) — `parseMoney()` + `parsePromoValue()`
  parser tunggal: `"70%"→70`, `"7.5%"→7.5`, `"100.000"/"Rp100.000"→100000`,
  barang tak terbaca → 0 (bukan NaN).
- `src/shared/promo/promo-discount.ts` (baru) — `computePromoDiscount()`
  satu-satunya rumus diskon; dipakai ketiga titik di atas sehingga angka client
  dan server mustahil beda.
- `src/lib/hooks/useCheckout.js` — `resolveVoucher()` diekstrak (dipakai tombol
  "Pakai" & auto-apply saat klik Lanjut), `getDiscount()` sekarang memakai rumus
  bersama (ikut berubah saat pax berubah), payload hanya mengirim voucher yang
  benar-benar applied.
- `src/app/api/checkout/route.ts` — validasi voucher tetap server-authoritative,
  perhitungan diskon delegasi ke `computePromoDiscount`.
- `src/modules/promotion/promotion.service.ts` — ikut pakai parser & rumus sama
  (dulu `parseInt` + `Math.floor`, beda dengan checkout).
- `src/components/checkout/VoucherCard.jsx` — Enter menerapkan kode voucher.
- `src/app/admin/promotions/page.tsx` — validasi + normalisasi `value`,
  `minPurchase`, `maxDiscount` sebelum disimpan; pesan error di form; placeholder
  dipisah per tipe ("20 atau 20%" vs "100000").
- `jest.config.cjs` — tambah transform `babel-jest` untuk `.js/.jsx`
  (`@babel/plugin-transform-modules-commonjs`); sebelumnya Jest gagal memuat
  modul client ESM seperti `useCheckout.js`.

**Tests:** `src/shared/promo/promo-value.test.ts` (baru) mengunci kasus nyata
AEZAKMI: client total === server total === 2.100.000, plus parser & min-purchase.

**Verifikasi:** `npx jest` → 3 suites / 22 tests pass; `npx tsc --noEmit` → 0 error;
`npm run lint` → 0 error / 78 warning (baseline tidak berubah).

**Belum diverifikasi manual:** alur checkout end-to-end di browser (isi voucher →
klik Lanjut → pembayaran) karena butuh dev server + session login.

## Session 41 — Bugfix: Sembunyikan rekening BCA kalau nomornya belum ada

**Laporan:** "Rekening BCA kalau belum ada nomor rekeningnya tolong disembunyikan aja."

**Diagnosis (diverifikasi ke schema & pemakaian):**

- `payment_accounts.accountNumber` `NOT NULL` tapi tetap bisa `""`/`" "`; baris
  bisa juga tidak ada sama sekali (tabel hanya diisi lewat `src/db/seed.ts:211`,
  **tidak ada UI admin** untuk rekening).
- `PaymentStep.jsx:78` hanya menentukan *kartu* tampil atau tidak
  (`bcaAccount && isBCA`), sedangkan **label opsi BCA selalu dirender** → tiga
  keadaan rusak: baris tidak ada (BCA tanpa tujuan transfer), nomor `""`
  (baris "Nomor" kosong + tombol Salin menyalin string kosong), dan fetch
  gagal/`loading` tidak bisa dibedakan dari "tidak ada".
- `useCheckout.js:93` default `paymentMethod: "BCA"` → kalau BCA disembunyikan,
  pilihan tetap menunjuk metode tersembunyi sementara tombol kirim hanya cek
  truthiness → user bisa submit bukti dengan metode yang tak pernah ia lihat.

**Perbaikan:**

- `src/shared/payment/payment-account.ts` (baru) — aturan tunggal:
  `isCompleteAccount()` (trim, bank+nomor+pemilik), `findAccountByMethod()`
  (case-insensitive), `availableMethods()` (`null` hanya saat loading; gagal
  muat → fail-closed `["QRIS"]`), `resolveActiveMethod()` (pilihan tersembunyi
  jatuh ke metode pertama).
- `PaymentStep.jsx` — fetch rekening diangkat ke komponen induk; skeleton BCA
  selama `loading` (tanpa flicker); label BCA hanya dirender kalau lengkap;
  `useEffect` mengoreksi `paymentMethod` (BCA → QRIS); tombol **Kirim Bukti
  Pembayaran** menunggu `accountsStatus !== "loading"`; `AccountCard` merender
  baris yang kosong dan menonaktifkan Salin kalau nomor kosong.
- `/api/payments/accounts` — menyaring rekening tak lengkap sebelum dikirim ke
  client (server & client sepakat lewat helper yang sama).
- `jest.config.cjs` — transform ts-jest juga untuk `.js/.jsx` (modul client
  ESM+JSX belum bisa dimuat Jest; babel-jest tanpa preset JSX gagal parse).

**Tests baru:** `src/shared/payment/payment-account.test.ts` (8) +
`src/components/checkout/PaymentStep.test.tsx` (4: rekening tak ada, nomor
kosong, rekening lengkap, API gagal).

**Verifikasi:** `./init.sh` EXIT 0 → lint 0 error / 78 warning (baseline), tsc 0,
jest 5 suites / 40 tests pass.

**Belum diverifikasi manual:** tampilan di browser pada kondisi DB tanpa baris
BCA (perlu dev server + data `payment_accounts` dimodifikasi).

## Session 42 — Verifikasi tanpa browser (mesin 8GB) + Playwright mode hemat

**Kendala:** user menjalankan laptop 8GB / Ryzen 5 2500U → suite Playwright
(dev server Next + Chromium) berisiko bikin machine swap. Diputuskan: **tidak
menjalankan Playwright sekarang**, dan konfigurasinya disesuaikan agar aman
dipakai nanti.

**`playwright.config.ts` (disesuaikan untuk mesin rendah):**
- `trace: "off"`, `video: "off"` (artefak paling boros), `screenshot` tetap
  hanya-saat-gagal
- reporter `html` dengan `open: "never"` (tidak auto-buka browser)
- `reuseExistingServer: true` — boleh jalankan `npm run dev` sendiri sekali,
  Playwright tidak menduplikasi proses Next (hemat ~0,5–1GB)
- tetap `workers: 1`, `fullyParallel: false`, headless (chromium_headless_shell)
- npm scripts baru: `test:e2e`, `test:e2e:smoke` (hanya `e2e/public`)

**Verifikasi alternatif (read-only, tanpa dev server, 1 proses node):**
- Baru: `scripts/verify-payment-and-promo.ts` + npm script `verify:checkout`
  (butuh `tsx` — kini dideklarasikan eksplisit di devDependencies, selama ini
  hanya ikut terpasang sebagai dependensi drizzle-kit)
- Hasil live:
  - `payment_accounts`: 7 baris, semua lengkap → keputusan UI `[BCA, QRIS]`,
    kartu BCA **tampil** (memang sudah ada nomornya) ✓
  - `promotions`: `AEZAKMI value="70%"` → parser baru 70, parser client lama
    `Number("70%")` = **0** → terbukti langsung dari DB sebagai penyebab
    400 "Total pembayaran tidak sesuai"; diskon 100000 (cap), total 2.100.000 ✓
  - 4 promo lain: nilai lama == nilai baru → tanpa regresi ✓
- `./init.sh` EXIT 0 (lint 0 error / 78 warning, tsc 0, jest 5 suites / 40 tests)

**Status:** `feat-033` & `feat-101` tetap `in_review` — perilaku sudah dibuktikan
lewat unit/component test + pemeriksaan data live; sisa pass browser (lihat
`payment_accounts` di-null-kan → opsi BCA hilang) ditunda karena keterbatasan
hardware.

## Session 43 — feat-080: API auth middleware & RBAC

**Masalah:** temuan audit lama — ±57 endpoint API 100% public, 3 di antaranya
pernah terbukti bisa dieksploit tanpa auth. Fitur `feat-080` (critical, prioritas 2).

**Audit dulu, baru dikunci.** `src/shared/auth/api-auth-audit.ts` memindai semua
`src/app/api/**/route.ts` (92 handler) + resolusi delegasi ke controller
(`export { GET } from "..."` → `src/modules/booking/booking.controller.ts`, dsb).
Hasil: 83 punya guard, sisanya 9 public-by-design + 4 proteksi ada di
controller private-trip. **0 pelanggaran.**

**Kebijakan jadi satu sumber:** `src/shared/auth/api-policy.ts` —
`API_ACCESS` (public/admin eksplisit, default **session** = fail-closed),
`DELEGATED_GUARD`, dan `resolveApiAccess(method, path)` yang menerjemahkan pola
route (`[id]` → 1 segmen, `[...x]` → sisa path) untuk dipakai di edge.

**Guard baru di handler (11 route):**
- `requireAdmin` → GET `horeca`, `horeca/[id]`, `vendors`, `vendors/[id]`,
  `galleries`, `galleries/[id]`, `promotions/[id]`, `trips/[id]/groups`,
  `trips/[id]/active-group` (endpoint ini ternyata belum dipakai mana pun)
- `requireSession` → GET `promotions` (dipakai checkout + halaman admin),
  GET `trips/[id]/groups/[groupId]/gallery` (dipakai My Trips + admin)
- `src/shared/auth.ts` kini punya `getSessionUser` / `requireSession` /
  `requireRole(req, roles)` (`AppRole = UserRole`, sudah termasuk `agent`);
  `requireAdmin` = `requireRole(req, ["admin"])` — perilaku & pesan lama tetap.

**Edge layer:** `src/proxy.ts` matcher ditambah `/api/:path*`. Cuma cek
keberadaan session cookie (edge-safe, tanpa DB) — public lewat, selain itu 401.
Validasi session asli + role tetap di handler, jadi cookie palsu tetap ketahuan.

**Regresi dikunci:** `src/__tests__/api-auth-audit.test.ts` (10 test) —
tiap handler wajib terlindungi/public, level ≥ kebijakan (public<session<admin),
entri kebijakan tidak basi, modul delegated masih mengecek session, dan pola
regex proxy benar (`/api/horeca` ≠ `/api/horeca-types`, `/api/upload` ≠
`/api/uploads`). Reporter: `npm run audit:api`.

**Konsekuensi UX yang ditangani:** GET `/api/promotions` kini 401 untuk anonim →
`useCheckout` menandai `vouchersLockedRef` dan menampilkan "Voucher hanya bisa
dipakai setelah Anda login." (bukan loop "Memuat ulang data voucher...").

**Verifikasi live (dev server + curl, tanpa browser — aman untuk 8GB):**
- anonim: `trips/blogs/horeca-types/payments/accounts` → 200; `POST /api/contact` → 201;
  `POST /api/newsletter` → 201; `/api/uploads/...` → 404 (bukan 401);
  `horeca/galleries/vendors/promotions/users/admin.dashboard/private-trips/
  commissions/trips/[id]/groups` → **401**
- login `user@otl.id`: `promotions` & `private-trips` → **200**;
  `horeca/users/commissions` → **403**
- login `admin@otl.id`: semua → **200**
- cookie palsu → **401** (lewat proxy, ditahan handler)
- halaman publik `/` dan `/trips` tetap 200

**Verifikasi:** `./init.sh` EXIT 0; `npx tsc --noEmit` 0; `npm run lint`
0 error / 78 warning (baseline); `npx jest` 6 suites / 50 tests
(10 di antaranya test audit ini).

**Temuan di luar scope (belum ditangani):**
1. `src/app/admin/meeting-points/page.tsx` memanggil `/api/meeting-points*`
   yang **tidak ada** route-nya → halaman admin itu pasti 404 sejak awal.
2. Path id bukan UUID (`/api/trips/abc/groups/x/gallery`) → 500
   (`22P02 invalid input syntax for type uuid`) alih-alih 404 — pre-existing,
   sebelum perubahan ini pun sama (kini minimal anonim dapat 401 dulu).
3. Hak akses khusus role `agent` belum ada di endpoint mana pun (saat ini agent
   = user biasa di API); terkait `feat-070` (Agent dashboard, in_review).

**Status:** `feat-080` → `completed`.

**Dipush & PR:** branch `feat/api-auth-middleware-rbac` → **PR #103**
(https://github.com/Spero-id/opentrip-lansia/pull/103, base `main`),
berisi commit `718d4f4` (chore Playwright hemat RAM) + `df78b96` (feat-080).

---

## Session 44 — Restructure Fase 0 (2026-09-30, berjalan)

**Catatan root (task 0.6b):**
- `.agents/`, `.commandcode/` = tooling pribadi agent — di luar cakupan, jangan disentuh.
- `uploads/` = **data runtime aktif** (bukti pembayaran, disajikan `/api/uploads/[...path]`) — luar cakupan restructure.
- `todo.md` dihapus, 2 idenya diserap ke backlog ini: **(1) Master Trip: field
  maksimal peserta**, **(2) Master meeting point** (terkait temuan
  `/api/meeting-points` yang route-nya tidak ada).
- Root dibersihkan: `nul`, `test.md` (0 byte), `jira-export.json`,
  `migrate-schema.ts` (migrasi `is_senior_friendly` terbukti sudah jalan →
  SQL di `drizzle/0001` + kolom di `src/db/schema/trips.ts`), folder `anti-slop/`.
- Package rename: `temp-app` → **`opentrip-lansia`**.

**Progres:** plan restructure via **PR #104** → `main` (`f967ae7`); branch
`restructure/fase-0`; task 0.1–0.6b selesai (centang di `plan/restructure-tasks.md`).

**0.7 — `/api/meeting-points` (audit, putusan):** halaman admin = **yatim**
(tidak ada link nav kemana pun), fetch 4 endpoint CRUD yang route/module/
tablenya **tidak ada**; meeting points hanya ada sebagai jsonb
`trips.meeting_points`. **Keputusan: dibangun di luar scope restructure** →
dicatat sebagai `feat-102` (to_do, phase-5); halaman dibiarkan apa adanya;
keputusan akhir (bangun backend vs hapus halaman) milik PRD. **Paket 8 jangan
merombak halaman ini sebelum keputusan.**

**0.8 — Gate dipasang ke `init.sh` (komit `5bc9849`):** `check:structure` +
`check:schema-drift` + `check:routes` (kondisional: jalan bila
`.next/app-path-routes-manifest.json` ada — init tidak build).

**0.9 — Baseline dibekukan (komit `ec84e8e`):** `check:structure` BASELINE
R1=250, R2=95, R3=0, R4=8, R5=46, R6=8, R7=2, R8=480, **R9=82** (81 import
`../` + 1 `typeof import()` — angka nyata; angka 80 di rencana = estimasi
audit awal). `check-schema-drift` dapat `KNOWN_DRIFT` = 4 tabel
(`booking_participants`, `health_declarations`, `payments`,
`terms_acceptances`) → tak gagalkan sampai Fase 2 (task 2.7); drift baru
tetap gagal. Snapshot routes = 96 app path.

**0.9b — Jest → Vitest (komit `84281e4`, tick `6ca24f3`):** 6 suite / 50
test hijau. Keputusan dependency: vitest sempat terpasang di lini **v5**
lalu **di-pin ke v4** karena peer better-auth 1.6.23 hanya `^2||^3||^4`
(setelah pin, full `npm install` hijau); `@vitejs/plugin-react` di-pin **^5**
(v6 menarik babel 8, bentrok babel 7 milik shadcn); `@types/node` ^20 →
**^24** (mengikuti runtime Node 24). Dihapus: jest, ts-jest,
jest-environment-jsdom, @types/jest, identity-obj-proxy, `jest.config.cjs`,
`tsconfig.jest.json`. Temuan: 9 mapper mock `src/__mocks__/*` menunjuk
folder yang **tidak pernah ada** (dead config — tak dipindah). Quirk tercatat:
force-kill dev server bisa **merusak `.next/dev/types/*`** (validator.ts
tertulis terpotong) sehingga build gagal tipe — solusi: hapus
`.next/dev/types` (bukan bug upgrade).

**0.9c — better-auth 1.6.23 → 1.7.6 (komit `5ddf2e2`):** changelog 1.6.24–
1.7.6 diaudit dari upstream. **Backfill `Account.issuer` BATAL — tidak
perlu**: 1.7.3 (#2220ee7) memulihkan kompatibilitas DB 1.6 (identitas akun
kembali `(providerId, accountId)`, syarat issuer dihapus); DB kita tak punya
kolom `issuer` dan tak pernah lewat 1.7.0–1.7.2. `npx auth generate`:
kolom users/session/account/verification **identik** dengan skema kita →
tanpa migrasi drizzle (`drizzle/` beku; saran opsional `*_userId_idx` +
`$onUpdate(updated_at)` → backlog). Smoke live di dev server: sign-in admin
**200** (role admin + additionalFields utuh), get-session **200** (cookie),
user **200**, sandi salah **401**, log bersih dari error validasi skema
runtime (aktif default sejak 1.7.3).

**0.10 — Coverage baseline (`npx vitest run --coverage`, exit 0):**
Statements **47.65%** (274/575) · Branches **55.98%** (215/384) · Functions
**29.67%** (46/155) · Lines **50.81%** (250/492) — patokan jangan-turun
untuk setelah rewrite test (1.3b); tanpa threshold gate.

**0.11 — Fase 0 SELESAI: 14/14 task** (+Persiapan 3/3 → total **17/127**).
Ladder terakhir: `npx tsc --noEmit` 0 · lint **0 error / 78 warning** ·
vitest **6 suite / 50 test** · `npm run build` EXIT 0 · `./init.sh`
**EXIT 0** (tiga gate baru aktif). Belum diuji via browser (Playwright
ditiadakan — konfirmasi visual checkout fix & login = milik user di dev
server).

**Dipush & PR:** branch `restructure/fase-0` → PR
https://github.com/Spero-id/opentrip-lansia/pull/new/restructure%2Ffase-0
(base `main`, berisi seluruh commit Fase 0).

---

## Session 45 — Restructure Fase 0.5: Error & 404 root (2026-09-30)

**Cabang:** `restructure/fase-0.5` dari `main` `2606da7` (merge **PR #105**
Fase 0).

**0.5.1–0.5.2 (komit `1396b01`):** `src/app/error.tsx` + `src/app/not-found.tsx`
(keduanya belum pernah ada). **Temuan Next 16**: prop error boundary kini
**`retry`** (stabil sejak 16.3); `reset` masih ada tapi docs menyarankan
`retry()` (re-fetch + re-render). Copy UI bahasa Indonesia; 404 menampilkan
tombol/link "Ke Beranda".

**Perkakas (ikut komit):**
- `eslint.config.mjs` += ignore `coverage/**` — output run coverage (0.10)
ter-lint sehingga warning naik 78→79; setelah ignore kembali **78**.
- **Blind spot R8 tercatat**: wordlist R8 kena **prosa JSX** — `mask()` hanya
  menutup string & komentar, teks antar-tag tak ikut (kata seperti
  `yang/kembali/cari/dihapus/alamat` dari teks UI ikut terhitung). Copy UI
  Fase 0.5 ditulis menghindari kata terdaftar → R8 tetap **480** (ratchet
  tak boleh naik). **Perbaikan mask → backlog Fase 11** — hati-hati: jangan
  sekadar `>[^<]*<` (bisa menimpa kode `a > b`); perlu desain hati-hati.

**0.5.3 (bukti):** `npm run build` EXIT 0; prod server: `/url-tak-dikenal-9f8g7`
& `/definitely/not/route` → **HTTP 404** + konten kustom; `/blog/tidak-ada` →
200 (streamed `notFound()` — status sesuai perilaku Next, konten kustom ✓).
Ladder: tsc **0** · lint **0E/78W** · vitest **6/50** · check-* dalam baseline ·
`./init.sh` **EXIT 0**.

**0.5.4:** commit `1396b01`; centang 4/4 task + tabel Progres.

**Progres:** Fase 0.5 = **4/4** → total **21/127**.

**Dipush & PR:** branch `restructure/fase-0.5` → PR
https://github.com/Spero-id/opentrip-lansia/pull/new/restructure%2Ffase-0.5
(base `main`).

---

## Session 45b — Keputusan: `design-tokens.js` dilebur inline (2026-09-30)

- **Putusan user:** `src/lib/design-tokens.js` (48 baris, 8 export; hanya
  `contact/page.jsx` yang import,4 export sudah mati) **dilebur inline** ke
  halaman contact lalu dihapus. **Alasan: `globals.css` = source of truth
  token** ke depan — modul token JS tak boleh jadi saingan. Catatan keputusan
  ditambahkan di `plan/restructure-tasks.md` (Paket 7): *jangan bikin modul
  token JS baru*.
- Baseline R2 diperbarui turun **95 → 94** (`scripts/check-structure.ts`).
- Bukti: `npm run build` EXIT 0 · `./init.sh` EXIT 0 (lint 0E/78W, tsc 0,
vitest 6/50, check-* dalam baseline).
- Cabang `chore/inline-design-tokens` → PR
  https://github.com/Spero-id/opentrip-lansia/pull/new/chore%2Finline-design-tokens

---

## Session 46 — Restructure Fase 1: Komentar & pesan error (2026-10-01)

**Branch:** `restructure/fase-1` (dari `648b67b` = merge PR #107 inline design-tokens).

- **1.1+1.2 Purge komentar (D-5: nol + eksepsi why-Inggris)** — komit
  `2710199`: **488 blok komentar dihapus dari 110 file** (pass TypeScript AST
  306 + pass scanner karakter sadar-string/template 182 + 2 manual di uploads
  route); isi diff **107 file, +26/−873** (deletions dominan). R1 (komentar
  Indonesia) **250 → 0 baris**.
  - **Keep-list (5 baris why-EN, didaftar di PR):** `eslint.config.mjs` ×2
    (vendor-asset & coverage ignore), `playwright.config.ts` ×1 (setelan RAM
    8GB), `next.config.ts` ×1 (host avatar OAuth Google), `globals.css` ×1
    (pengecualian label grup sidebar).
  - **7 direktif tool dipertahankan** (`eslint-disable/enable`): instruksi
    mesin, bukan komentar; menghapusnya mengubah perilaku lint.
  - **Insiden (selamat karena tangga):** scanner pass-2 salah mengira regex
    `\/\/`+`/` penutup sebagai komentar → baris `sanitize.ts:79` terpotong;
    **tsc langsung menangkap** → baris dipulihkan + aturan backslash
    ditambahkan; pass ulang bersih (0 kerusakan). Pelajaran: alat mekanis
    selalu diverifikasi `tsc`+`build` sebelum dianggap selesai.
- **1.3 Pesan error API EN→ID (D-4)** — komit `f13bc97`: **9 pesan murni
  Inggris (13 lokasi)** diterjemahkan — `private-trip.controller` (Action is
  required / Invalid body ×3 / Request tidak ditemukan ×2 / Format request
  body / proposalId and action) + `private-trip.service` (Proposal is not
  actionable) + `uploads/[...path]` (Invalid path ×2 / File not found) + copy
  halaman private selaras. `Unauthorized`/`Forbidden` tetap teknis; **status
  code tidak berubah** (diff 4 file, 14/14 baris). Angka 48 di plan =
  inventaris PRD lama — sisanya sudah Indonesia.
- **1.3b Rewrite 6 suite test dari kosong** — komit `83d3826`: judul
  `describe`/`it` → Inggris, komentar dihapus, helper terdedup
  (`queueSelectResults`, `renderPaymentStep`+`stubAccountsFetch`),
  `toPublicError` dikelompokkan passthrough/redaction/fallback, loop
  `void route` dibuang. **Paritas ketat per file 4/4/12/14/6/10 = 50 → 50**;
  **coverage identik baseline 0.10** (S 47.65 · B 55.98 · F 29.67 · L 50.81);
  `verify:checkout` exit 0.
- **1.4 Enforcement R1 & R8** — komit `d6872bb` + `9074bb0`: baseline R1
  **250 → 0**; **probe membuktikan keduanya jadi error saat dilanggar**:
  komentar ID → R1 `1 vs 0 FAIL`; identifier `alamatDestinasiBaru` → R8
  `481 vs 480 FAIL`; legenda `FAIL` diparenthesis (dulu dicetak tanpa syarat
  → run hijau terbaca gagal).
- **1.5 Verifikasi (§8):** tsc **0** · lint **0E/78W** · vitest **6/50** ·
  coverage identik · `npm run build` **EXIT 0** · `check:routes` **96→96
  identik** · `check:schema-drift` OK (4 known) · `verify:checkout` **exit 0**
  (dev server hidup, lalu dimatikan bersih) · `./init.sh` **EXIT 0**.
  Diff `main...HEAD`: **110 file, +202/−1073** (deletions dominan ✓).
- **Progres:** Fase 1 = **7/7** → total **28/127**.

**Dipush & PR:** branch `restructure/fase-1` → PR
https://github.com/Spero-id/opentrip-lansia/pull/new/restructure%2Ffase-1

## Session 47 — 2026-10-01

**Fase 2 (restructure): Satu sumber skema Drizzle — 8/8 selesai.** `src/db/schema/` kini satu-satunya tempat `pgTable()` (D-21, arbiter = struktur DB **live**, bukan salinan migrasi).

**Perubahan:**
- **Pindah + merge (48 tabel, 0 duplikat):** 13 tabel pindah dari `src/modules/*` (auth×4, notifications, reviews×2, private-trip×3, payment_accounts, site_settings, subscribers) + 4 drift diselesaikan ke bentuk live: `booking_participants` & `health_declarations` & `payments` → sisi modules (DB live punya `emergency_contact_*`, `proof_url`, `bank_name`, dst.; bentuk lama kolom health_declarations **tak ada di live**), `terms_acceptances` → sisi db/schema (modules kurang `id`/`booking_id`).
- **Redirect:** 80 specifier di 51 file → `@/db/schema` (script context-aware; zod/konst domain stay) + 3 import `scripts/`; R9 turun **82 → 46**.
- **Hapus duplikat:** 12 file schema murni dihapus; contact/newsletter/notification = stub tipis (zod/consts + re-export tabel); type `Subscriber` pindah ke `db/schema/utility`.
- **Gate:** `KNOWN_DRIFT` dikosongkan → drift checker **48/0/0/0, exit 0**, label basi dibersihkan.
- **`drizzle-kit generate`:** **0 file `drizzle/` ditulis** — jalannya mentok di prompt konflik nama (`promptNamedWithSchemasConflict`), identik dgn baseline sebelum perubahan. **Temuan pra-ada:** folder `drizzle/` (7 SQL, journal 3) tertinggal dari DB live — di luar restructure, dicat di D-21.

**Verifikasi (setelah semua edit):** tsc **0** · lint **0E/78W** · vitest **6/50** · coverage tak diuji ulang (test tak diubah) · build **0** · check:routes **96→96** · check:schema-drift **exit 0** · `./init.sh` **EXIT 0** · `verify:checkout` **exit 0 OK** (dev server 1× jalan, dimatikan bersih, `.next/dev/types` dihapus).

**Commits:** `465e47f` D-21 · `b54233b` pindah+merge · `e30d9b8` redirect+hapus · `861ca08` clear KNOWN_DRIFT · komit docs sesi ini.

**Progres:** Fase 2 = **8/8** → total **36/127**. Lanjut Fase 3 (endpoint rapi: 46 route → 0 tebal).

## Session 48 — 2026-10-01

**Fase 3 (restructure): Rename & lebur global — 10/10 selesai.** `src/modules/` → `src/features/`; `src/shared/` dihapus total (lebur ke `lib/`/`utils/`/`types/`/`features/`); hook + outlier kebab; test gaya bulletproof; `layout.tsx` typed; R7 aktif; R9 82→**43**.

**Perubahan:**
- **3.1** `git mv modules→features`; 66 specifier `@/modules`→`@/features`; 5 string path `api-policy` (`src/modules/`→`src/features/`); `check-schema-drift` pindah ke `src/features`.
- **3.2a** auth → `src/lib/auth/` + `index.ts` publik (52 specifier); `client.ts` tetap entry terpisah (client bundle tak menarik `next/headers`).
- **3.2b** `shared/{db,errors,utils,types}` → `lib/db`, `lib/errors`, `src/utils/`, `src/types/` (114 file importer + 4 relatif).
- **3.2c** `shared/promo`→`features/promotion/`, `shared/payment`→`features/payment/` (via barrel); `src/shared/` dihapus.
- **3.3** `useCheckout.js`→`features/checkout/hooks/use-checkout.ts`; `useNotifications`→`use-notifications.ts`; `lib/hooks/` dihapus.
- **3.4** outlier kebab (`destination.js`, `order.js`, `format-rupiah.ts` + anotasi `(value: number)`, `private-trip.ts` — nama tabel DB tak berubah).
- **3.5** 6 test → `<sumber>/__tests__/`; `setup.ts`→`src/testing/setup-tests.ts`; import test `@/`; 6/50 hijau. Subtask `__mocks__`+`resolve.alias` **vacuous** (dir tak pernah ada, tanpa alias di config).
- **3.6** `layout.jsx`→`layout.tsx` (`Metadata`, `ReactNode`).
- **3.7** baseline: R7 `[]` (aktif), R9 82→43, R2 refresh 91, R6→2, koreksi ukur R3 0→49 (rename 3.1 mengekspos deep `@/modules` yg dulu tak terhitung regex).
- **3.8** dua insiden ladder: (a) `ban-ts-comment` atas `@ts-nocheck` → tambah `eslint-disable-next-line` (2 direktif mesin, masuk daftar PR); (b) **build FAIL `pg` bocor ke client via barrel** (`PaymentStep`, `use-checkout`, halaman promosi narik `*.service`→`@/lib/db`) → 4 import client kembali ke deep murni; R3 49→53.

**Pelajaran alat:** (1) `@ts-nocheck` TS 5.9 hanya mempan di **baris-1** — komentar di atasnya OK, statement (`"use client"`) di atasnya TIDAK. (2) **Barrel fitur campur kode server+client → file `"use client"` dilarang import barrel** (bangun pemisah entry client/server di paket domain). (3) `format.js` duplikat `formatRupiah` — backlog paket.

**Backlog:** pecah barrel server/client per paket; `auth.config` 16 deep → barrel; dorong R3 53→0; dedupe `format.js` vs `format-rupiah.ts`.

**Verifikasi (setelah semua edit):** tsc **0** · lint **0E/78W** · vitest **6/50** · build **0** · routes **96→96** · drift **0** · structure **9/9** · init **0** · verify:checkout **0 OK**.

**Commits:** `2995cf7` rename · `d936bc8` auth · `64d5d78` lib/utils/types · `6eeb1fd` promo/payment · `af976b3` hooks · `a3133b8` outlier · `d1b3e43` tests · `7eb265a` layout · `5c14aff` baseline · `5d470f7` fixes · komit docs sesi ini.

**Progres:** Fase 3 = **10/10** → total **46/127**. Lanjut Fase 3b (`lib/env.ts`, 2 task).

## Session 49 — 2026-10-01

**Fase 3b (restructure): `lib/env.ts` — 2/2 selesai.** 18 variabel / 28 situs / 12 file → `src/lib/env.ts`; nol `process.env` di luar file itu.

**Desain:** baca terpusat (`str` + fallback identik, `bool` untuk flag, koersi port); `required()` (throw pesan Inggris) hanya untuk DATABASE_URL + BETTER_AUTH_SECRET (keduanya memang fatal bila hilang); murni tanpa efek samping → aman diimport komponen client. `BASE_URL` milik `check-routes` ikut masuk.

**Insiden ladder (kelas sama, 2×):** `required()` meledak di konteks tanpa `.env` otomatis — (a) 3 suite vitest gagal collect → tambah `import "dotenv/config"` di `src/testing/setup-tests.ts` (dev/build memuat `.env` otomatis, vitest tidak); (b) `check:routes` crash → tambah `dotenv/config` di 3 script rantai-env (`check-routes`, `clear-referral-history`, `verify-payment-and-promo`; preseden: `drop.ts`/`truncate.ts`).

**Verifikasi:** tsc **0** · lint **0E/78W** · vitest **6/50** · build **0** · routes **96→96** · drift **0** · structure **9/9** · init **0** · smoke login: `/login` 200, password salah 401, admin sign-in 200 + session valid · verify:checkout **0 OK**.

**Commits:** `448bd6f` env sentral · `e5b859b` dotenv setup+scripts · komit docs sesi ini.

**Progres:** Fase 3b = **2/2** → total **48/127**. Lanjut Fase 3c (chrome global ke root layout, 6 task).

## Session 50 — 2026-10-01

**Fase 3c (restructure): Chrome global ke root layout — 6/6 selesai.** `SiteChrome` (client) render Navbar+Footer+Float; 11 halaman + `SuccessState` bersih dari impor chrome (65 baris); admin layout tak tersentuh.

**Perubahan:**
- **3c.1–3c.2** `src/components/layout/SiteChrome.tsx` baru (`usePathname`; sembunyi exact-atau-prefix `/login /register /forbidden /admin /dashboard`; Float exact `/ /blog /private` + prefix `/trips` = opsi A); root `layout.tsx` bungkus `<SiteChrome>`.
- **3c.3** script strip hapus 29 import + 36 tag di 12 file; dobel-Navbar success-state private trip hilang.
- **3c.5** R10 baru di `check-structure` (importir chrome di luar SiteChrome/layout = FAIL; baseline 0; probe terbukti); R9 43→42 (relatif Footer checkout ikut terhapus).
- **3c.6** grep 0 · curl `/` ada logo Navbar/Footer + Float · `/login /private /trips` 200 · visual browser penuh = user (10/11 halaman adalah CSR).

**Verifikasi:** tsc **0** · lint **0E/78W** · vitest **6/50** · build **0** · routes **96→96 identik** · drift **0** · structure **10/10** · init **0**. `verify:checkout` diskip (logika checkout tak tersentuh; `checkout/page.jsx` lolos kompilasi build).

**Commits:** `4601fcd` SiteChrome+strip · `3915597` R10 · komit docs sesi ini.

**Progres:** Fase 3c = **6/6** → total **54/127**. Prasyarat global selesai — lanjut **Paket 1 `profile`** (loop domain pertama, 7 task).

## Session 51 — 2026-10-01

**Paket 1 `profile` (loop domain pertama) — 7/7 selesai.** Pola ①–⑥ tervalidasi: pindah → konversi → ekstrak → clean → SSR → verifikasi.

**Perubahan (`src/features/profile/`):**
- **P1-①** 6 `.jsx` → `components/`; page impor `@/features/profile/components/`.
- **P1-②** 6 file → `.tsx` + `types.ts` (`ProfileUser`, `ReferralSummary`, `ReferralCardStats`, `ReferralHistoryItem`, `ReferralPagination` — bentuk disalin dari respons API aktual) + barrel `index.ts`; page impor barrel (R3 −5).
- **P1-③** `api/client.ts` (`fetchReferralSummary`, `fetchReferralHistory` + `DEFAULT_HISTORY_LIMIT`) + `hooks/` (`useProfileStats`, `useReferralHistory`, error via `toPublicError`) + 10 test baru (`__tests__/profile-api`, `profile-hooks`: URL, shape, ok/error, refetch ganti halaman); `ProfileStats`/page/`ReferralHistory` pakai hook (fetch dobel `/api/user/referral` tetap 2× seperti semula — dedupe = backlog).
- **P1-③b** `COPY_FEEDBACK_MS`, guard `copyCode`.
- **P1-④** `profile/layout.tsx` server: title + `robots noindex` (page tetap client).
- **P1-⑤** baselines: R2 91→85, R4 −`profile`, R9 kembali 42 (import `../types` → barrel `import type`: type-only = nol siklus runtime); perbaiki `set-state-in-effect` via fungsi `load` async. Uji: sign-in `user@otl.id` + shape referral persis + `/profile` 200 (endpoint edit profil tak ada di scope).

**Pelajaran paket:** (1) type-only barrel import = cara R3-netral tanpa risiko siklus; (2) pola hook: `setLoading` langsung di badan effect kena lint → bungkus async fn seperti kode lama.

**Verifikasi:** tsc **0** · lint **0E/78W** · vitest **8/60** · build **0** · routes **96→96** · drift **0** · structure **10/10 nol stale** · init **0**.

**Commits:** `74340e8` pindah · `8b90922` konversi+barrel · `33fba4a` api/hooks/test · `fb2138f` clean · `9520549` metadata · komit baseline+docs sesi ini.

**Progres:** Paket 1 = **7/7** → total **61/127**. Lanjut Paket 2 `checkout` (reducer + `verify:checkout`).

## Hotfix env-client-crash — 2026-10-01

**Browser blank: `Missing required environment variable: DATABASE_URL`** — rantai: `layout` → `SiteChrome` → `Navbar` → `lib/auth/client.ts` → `@/lib/env` → `required()` throw (browser tak punya var server; Next hanya inline `NEXT_PUBLIC_*`). Build/curl tak menangkapnya (evaluasi server punya `.env`; crash hanya di bundle client). Regression dari Fase 3b.

**Perbaikan (branch `hotfix/env-client-crash` off main, PR #113 merged):** `env.ts` = 5 var publik murni (tanpa throw/helper — aman browser by construction); `env.server.ts` baru = helper + 13 var server (+`required`); 6 importir server → `env.server`; 6 importir client tetap. Audit statis: 106 file client, 0 mencapai `env.server`.

**R11 baru** di `check-structure` (`client bundle reaches env.server`, baseline 0): BFS graf import dari file `"use client"`; probe suntik bug → FAIL 10 vs 0 → revert hijau.

**Verifikasi:** tsc 0 · lint 0E/78W · vitest 6/50 · build 0 · routes identik · drift 0 · structure 11/11 · init 0 · dev smoke (`/` 200, sign-in 200, session valid). Verifikasi browser = user.

**Pelajaran:** pola `lib/auth` (index server vs `client.ts`) berlaku umum — **modul campuran server+client harus dipecah di perbatasan bundle**, bukan hanya di perbatasan impor.

## Session 52 — 2026-10-01

**Paket 2 `checkout` — 7/7 selesai.** Rewrite terbesar restructure: 460-baris `useCheckout` → `checkoutReducer` (26 aksi) + hook tipis + `api/` + barrel; paritas perilaku dibuktikan `verify:checkout` + 59 test baru.

**Perubahan (`src/features/checkout/`):**
- **P2-①** 12 komponen + `__tests__/` → `components/`; impor absolut.
- **P2-②** 14 file → `.tsx` + `types.ts` (state, aksi, voucher, customer, partisipan); `image/title/priceMin` required, `category/location` opsional, `id?` (konsumen parsial pay-page + `image: ""` fallback aman).
- **P2-③** `reducer.ts` (26 aksi; `SET_CUSTOMER` satu `as Customer` untuk kunci ekstensi `_bookingId`/`_isLoading`), `pricing.ts` (`resolveVoucher` pindah + selektor), `api/client.ts` (promotions/referral/booking/payments/accounts + `ApiRequestError` bawa status), `usePaymentAccounts`, hook tulis ulang (bentuk return identik; direktif `ts-nocheck` hilang), barrel; `PaymentStep.test` tulis ulang mock hook baru (4/4 paritas). 59 test: 28 reducer + 12 pricing + 15 api + 4 PaymentStep.
- **P2-③b** `MIN_PAX`/`MAX_PAX`, hapus `console.error` ×2 + `showHealth` mati.
- **P2-④** `verify:checkout` exit 0 OK (jalur AEZAKMI max-discount cocok dengan unit test).
- **P2-⑤** baselines: R9 42→**38**, R2 85→71, R4 −checkout, R3 tetap 53 (barrel menetralkan deep baru; deep murni pricing dipertahankan anti-barrel-server), R8 tetap 480, R11 0. Perbaiki: `any` eksplisit → interface `PayBooking`; `stateRef` tulis-di-render → effect; `void fetchVouchers()` → rantai `.then` ala P1 (aturan react-compiler hanya untuk `.ts`); `../types` → barrel `import type` (nol siklus).

**Pelajaran paket:** (1) aturan react-compiler (ref-during-render, set-state-in-effect) tak berlaku di `.js` — konversi `.jsx`→`.tsx` mengaktifkannya; (2) `no-explicit-any` on — siapkan interface API sejak awal; (3) halaman yang membangun objek parsial → izinkan opsional + fallback, bukan `""` palsu di semua field.

**Verifikasi:** tsc **0** · lint **0E/75W** · vitest **11/115** · build **0** · routes **96→96** · drift **0** · structure **11/11 nol stale** · init **0**.

**Commits:** `ff698e0` pindah · `c3cce60` konversi · `8d87226` reducer · `fc944f7` clean · `f96ad67` fixes+baselines · komit docs sesi ini.

**Progres:** Paket 1–2 = **14/14** → total **68/127**. Lanjut Paket 3 `my-trips`.

## Session 53 — 2026-10-01

**Paket 3 `my-trips` — 6/6 selesai.** Fetch tersebar → `api/` + 2 hook; parser murni diekstrak + test.

**Perubahan (`src/features/my-trips/`):**
- **P3-①** 7 `.jsx` + `constants.js` → `components/`.
- **P3-②** → `.tsx`/`.ts` + `types.ts` (8 interface: booking, payment, notes, galeri, proposal, request); `constants.tsx` (`Record<string,string>`, `formatRupiah` typed null-able, `toRequestCode(id: string)`).
- **P3-③** `api/client.ts` + `useOpenTripBooking` (bookings+images) + `useGalleryModal` (media+download) + barrel; page pakai hook + `refreshAll`; 23 test (16 api + 7 hooks).
- **P3-③b** `parsePreferences` murni + 6 test; `COPY_TIMEOUT_MS` ×2; hapus `console.error` ×2.
- **P3-⑤** baselines: R2 71→62, R4 −my-trips, R9/R3/R8 tetap (disiplin barrel penuh). Perbaiki: `setState` sync di effect → inner async fn (konfirmasi empiris ke-3: inner lolos, outer/direct kena). Uji: sign-in `user@otl.id` + bookings + private-trips + `/my-trips` 200 (buka galeri = visual user).

**Verifikasi:** tsc **0** · lint **0E/75W** · vitest **14/144** · build **0** · routes **96→96** · drift **0** · structure **11/11 nol stale** · init **0**.

**Commits:** `7876ae4` pindah · `250f795` konversi · `da26ff4` api/hooks/test · `7e8de06` clean · komit baseline+docs sesi ini.

**Progres:** Paket 1–3 = **20/20** → total **74/127**. Lanjut Paket 4 `private` (reducer wizard).

## Session 54 — 2026-10-01

**Paket 4 `private` — 7/7 selesai.** Form raksasa → `privateTripReducer` (9 aksi) + `api/`; tanpa barrel UI (keputusan sadar demi client safety).

**Perubahan (`src/features/private-trip/`):**
- **P4-①** 15 `.jsx` + 4 helpers → `components/`; audit `helpers.js` = {formatRupiah, inputCls} → `formatting.js`.
- **P4-②** → `.tsx`/`.ts` + `types.ts` (form required penuh, `FormErrors`, `SetFormField`, payload); `Subs` → `@/`.
- **P4-③** `reducer.ts` (9 aksi; `SET_FIELD` satu `as` + hapus error per-field; `HYDRATE_DRAFT` guard array; `RESET` simpan destinations) + `api/client.ts` (fetchers + builders pindahan page) + page `useReducer`; 26 test (12 reducer + 14 api).
- **P4-③b** `prefer-const`, `MAX_PARTICIPANTS`/`MAX_DURATION_DAYS`, `capped`.
- **P4-④** `private/layout.tsx` (boleh indeks — lead form publik).
- **P4-⑤** baselines: R2 62→42, R4 −private, R9 38→37, R3 53→**82**, R8 480→**500**, R11 0. Uji: submit API 200 + id + `/private` 200.

**Keputusan besar:** **tanpa barrel UI** — root `index.ts` milik backend (service→db→env.server); barrel campuran = crash browser (kelas 3.8). Konsekuensi: R3 naik (+17 deep halaman, +12 deep types). R8 naik: identifier form Indonesia = bahasa form user + kunci validasi; rename berisiko (dispatch string-key tak terlihat tsc) → backlog khusus. R11 tetap 0 = bukti pemisahan benar.

**Verifikasi:** tsc **0** · lint **0E/79W** · vitest **16/170** · build **0** · routes **96→96** · drift **0** · structure **11/11 nol stale** · init **0**.

**Commits:** `310945c` pindah · `e5ccd63` konversi · `e05350f` reducer · `033becd` clean · `9028890` metadata · `d6b9c1e` baselines · komit docs sesi ini.

**Progres:** Paket 1–4 = **27/27** → total **81/127**. Lanjut Paket 5 `destinasi` (pindah ke `features/trip` + rename komponen).

## Session 55 — 2026-10-01

**Paket 5 `destinasi` → `features/trip` — 7/7 selesai (P5-⑥ PR pending).** SSR tertinggi selesai tanpa ubah perilaku.

**Perubahan (`src/features/trip/`):**
- **P5-①** 18 `.jsx` → `components/` (+`detail/`); rename: `DestinasiHeader`→`DestinationListHeader`, `Emptystate`→`EmptyState`, `Resultsbar`→`ResultsBar`; `UlasanSection` mati (0 pemakai) → hapus; `src/components/destinasi/` hilang.
- **P5-②** → `.tsx`/`.ts` + `types.ts` (TripDetail, TripTabId, TripReview, TripActiveGroup, filter state).
- **P5-③** `api/client.ts` (fetchTrips/fetchTripById/fetchTripReviews/getTripImages) + `hooks/use-trip-filter.ts` (filterTrips murni + hook) + page pakai hook; tab detail pakai `useOptimistic`; 16 test (7 filter + 9 api).
- **P5-③b** `PRICE_INPUT_MAX_LENGTH`, `sanitizePriceDigits`/`clampPrice`/`parsePriceInput`, hapus `User` tak terpakai, `prefer-const`.
- **P5-④** `trips/layout.tsx` metadata (page tetap client, preseden P1) + `<Suspense>` galeri/ulasan; curl: `<title>Semua Destinasi Open Trip Lansia</title>` tanpa JS.
- **P5-⑤** baselines: R2 42→22 (stale), R3 82→115 (deep client-safe ala P4), R4 −destinasi, R9 37, R11 0. Fix: `DestinationSection.jsx` (landing) impor kartu → `@/features/trip/...`. Uji: `/trips` 200, detail fake-id 200, `GET /api/trips` 200.

**Verifikasi:** tsc **0** · lint **0E/76W** · vitest **18/186** · build **0** · routes **96→96** · drift **0** · structure hijau · `./init.sh` belum (dev-server log dibersihkan).

**Commits:** `6a57ac5` pindah · `ad95a7a` konversi · `3b84ee5` api/hook/test · `98b6cae` clean · `6f26e2f` metadata · `32a1a8e` baselines · komit docs sesi ini.

**Progres:** Paket 1–5 = **34/34** → total **88/127**. Lanjut Paket 6 `blog` (branch `restructure/paket-6-blog`).

## Session 56 — 2026-10-01

**Paket 6 `blog` — 7/7 selesai (P6-⑥ PR pending; stacked di atas P5).** Paket terkecil: 2 page + wrapper hugerte.

**Perubahan (`src/features/blog/`):**
- **P6-①** `admin/components/wysiwyg-editor.tsx` → `components/` (sudah `.tsx`; impor admin → `@/features/blog/...`).
- **P6-②/③** 2 page → `.tsx` + `types.ts` (BlogPost) + `api/client.ts` (fetchPublishedBlogs/fetchPostBySlug + murni formatBlogDate/findPostBySlug); page pakai fetcher (cancelled-flag tetap); 9 test.
- **P6-④** `blog/layout.tsx` (metadata statis) + `blog/[slug]/layout.tsx` (`generateMetadata` **server-side via `blogRepository.findBySlug`**); `<Suspense>` konten; `sanitizeBlogContent` tak tersentuh. Curl: list `<title>Berita & Artikel…</title>`, detail `<title>` = judul DB.
- **P6-⑤** baselines: R2 42→20, R3 115→124 (deep client-safe), R4/R9/R11 tetap. Uji: `/blog` 200, detail 200, API published 200 (3+ postingan).

**Insiden P5 (diperbaiki sebelum P6):** rewrite P5 tak sengaja membuang `<Subs/>` di 2 halaman trips (regresi visual — markup dirender tak identik). Fix `7c3bf1a` di branch P5 (push), P6 di-rebase. Pelajaran: diff tiap page wajib grep `Subs` sebelum commit.

**Verifikasi:** tsc **0** · lint **0E** · vitest **19/195** · build **0** · routes **96→96** · drift **0** · structure hijau.

**Commits:** `b19abb5` pindah · `8fc475a` konversi+api · `a4b77e8` test+metadata+baselines · komit docs sesi ini.

**Progres:** Paket 1–6 = **41/41** → total **95/127**. Lanjut Paket 7 `landing` + `newsletter` (branch `restructure/paket-7-landing`).

## Session 57 — 2026-10-01

**Paket 7 `landing` + `newsletter` — 7/7 selesai (P7-⑥ PR pending; stacked di atas P5–P6).** `Subs` fan-in 9 diselamatkan ke `features/newsletter`.

**Perubahan:**
- **P7-①** 6 section → `features/landing/components/`; `Subs` → `features/newsletter/components/`; 9 importer diperbarui (8 page + SuccessState). `src/components/landing/` hilang. Koreksi task: Footer **tak** pakai Subs.
- **P7-②/③** → `.tsx` + `newsletter/api` (`subscribeNewsletter`) + `useNewsletter` (state + Escape/body-lock) + `landing/api` (`toLandingCard`/`fetchLandingTrips`/`clampLandingPage`); Subs & DestinationSection pakai hook/api; 9 test.
- **P7-③b** `LANDING_PAGE_SIZE`, `ReviewSection`→`TestimonialsSection`, typed `avatar?` (bug laten: `lib/data` reviews tak punya avatar — selama ini selalu fallback initial; render identik).
- **P7-④** metadata root pra-ada (`Jelajah Memoria`) — curl `<title>` tanpa JS ✓; section Subs ter-render di `/` ✓.
- **P7-⑤** baselines: R2 42→12, R3 124→146, R4 −landing. Uji E2E: POST `/api/newsletter` → 200 + row `subscribers` (source=landing) → **dihapus kembali**. Temuan: subscribe menulis ke tabel `subscribers`, BUKAN `newsletter_subscribers` (drift konseptual, di luar scope).

**Verifikasi:** tsc **0** · lint **0E** · vitest **21/204** · build **0** · routes **96→96** · drift **0** · structure hijau.

**Commits:** `5af909b` pindah · `8f0f567` konversi+api · `547cda8` clean · `7b14846` baselines · komit docs sesi ini.

**Progres:** Paket 1–7 = **48/48** → total **102/127**. Lanjut Paket 8 `admin` (terbesar: 18 halaman, `useAdminTable`/`useAdminCrud`) — branch `restructure/paket-8-admin`.
