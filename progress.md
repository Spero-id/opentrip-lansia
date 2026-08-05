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



### Session (2026-08-05) — Vercel Production Deploy + Build Fixes
- Deployed `main` to production via `vercel --prod` → **https://opentrip-lansia.vercel.app** (deploy `7v1pWRF1kJykGNQwGcJkQEFiFULi`, Ready 59s)
- **Root cause 1 (blocked deploy):** Repo was private + git author `bhuminindra` (alhafizaulia02@gmail.com) bukan member Vercel team → Vercel Hobby seat policy memblokir (`TEAM_ACCESS_REQUIRED`). User menjadikan repo public → blokir hilang (collaboration gratis utk public repo).
- **Root cause 2 (build fail):** TypeScript error di `src/app/admin/trips/[id]/edit/page.tsx` — field itinerary/tripDestinations nullable vs `TripForm` butuh non-null. Dikoersi dengan default (`?? ""` / `?? 0`), plus `meetingPointId`/`description`.
- **Root cause 3 (prerender fail):** `/login` crash saat SSR — `getRedirectPath()` memanggil `window` saat render. Ditambah guard `typeof window === "undefined"` (login & register).
- `trip-form.tsx`: tambah `slug?: string` ke `TripFormData`.
- Commit: `c3c1a36` (4 file). Lint: 0 errors / 34 warnings (pre-existing `<img>`).
- **Catatan:** local `main` ahead of origin/main 1 commit — perlu `git push` bila ingin sinkron.
