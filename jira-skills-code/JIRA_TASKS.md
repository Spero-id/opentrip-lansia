# JIRA Board — OpenTrip Lansia (OTL)

> **Project:** OpenTrip Lansia — Platform Pemesanan Trip untuk Lansia  
> **Berdasarkan:** Full codebase analysis + PRD v1.0 + ERD v2  
> **Tanggal:** 23 Juli 2026  
> **Total Issues:** 78 (14 Epics + Infrastructure)

---

## Legend Status

| Status | Arti |
|--------|------|
| ✅ **IN REVIEW** | Kode sudah lengkap di codebase, needs final verification |
| 🟡 **IN PROGRESS** | Sebagian sudah ada, masih perlu penyempurnaan |
| ⚪ **TO DO** | Belum ada implementasi sama sekali |

---

# 🏗 EPIC 1: Arsitektur & Fondasi Teknis (OTL-1)
> Priority: Highest | PRD: Fase 1

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-8 | Setup Next.js + Tailwind + Responsif Mobile | ✅ IN REVIEW | `next.config.ts`, `globals.css` |
| OTL-9 | Setup Neon PostgreSQL + Drizzle ORM + Better Auth | ✅ IN REVIEW | `drizzle.config.ts`, `src/db/`, `src/modules/auth/auth.config.ts` |
| OTL-11 | Setup TanStack Table untuk Dashboard | ⚪ TO DO | Admin tables use manual fetch pattern |

### Tasks OTL-8:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-8.1 | Root layout with fonts | ✅ IN REVIEW | `src/app/layout.tsx` |
| OTL-8.2 | Global CSS Tailwind v4 | ✅ IN REVIEW | `src/app/globals.css` |

### Tasks OTL-9:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-9.1 | Drizzle config with Neon | ✅ IN REVIEW | `drizzle.config.ts` |
| OTL-9.2 | Better Auth setup | ✅ IN REVIEW | `src/modules/auth/auth.config.ts`, `src/lib/auth-client.ts` |
| OTL-9.3 | Schema index re-export | ✅ IN REVIEW | `src/db/schema/index.ts` |

### Tasks OTL-11:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-11.1 | Setup TanStack Table | ⚪ TO DO | Not implemented |

---

# 🔍 EPIC 2: Eksplorasi & Pencarian (OTL-2)
> Priority: High | PRD: Fase 2

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-12 | Pencarian Pintar Natural Language (RAG) | ⚪ TO DO | — |
| OTL-13 | Tampilan Hasil Ala Netflix | ⚪ TO DO | — |
| OTL-14 | Filter Minat Interest-Based | ⚪ TO DO | — |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-12.1 | PostgreSQL FTS tsvector on trips | ⚪ TO DO | `searchVector` exists but unused |
| OTL-12.2 | PostgreSQL FTS tsvector on destinations | ⚪ TO DO | `searchVector` exists but unused |
| OTL-12.3 | PostgreSQL FTS tsvector on blogs | ⚪ TO DO | `searchVector` exists but unused |
| OTL-13.1 | Basic search UI | 🟡 IN PROGRESS | `/trips` has basic title search |
| OTL-14.1 | Filter by category/difficulty | ⚪ TO DO | Not implemented |

---

# ♿ EPIC 3: Detail Aksesibilitas Destinasi (OTL-3)
> Priority: Medium | PRD: Fase 3

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-15 | Database HORECA dan Vendor | ✅ IN REVIEW | Full CRUD admin pages + APIs |
| OTL-16 | Peringatan Fisik dan Medan untuk Lansia | 🟡 IN PROGRESS | Schema has fields, not shown on public pages |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-15.1 | Master data schema (destinations, horeca, vendors) | ✅ IN REVIEW | `src/modules/master/master.schema.ts` |
| OTL-15.2 | Master repository CRUD | ✅ IN REVIEW | `src/modules/master/master.repository.ts` |
| OTL-15.3 | Admin Destinations page | ✅ IN REVIEW | `src/app/admin/destinations/page.tsx` |
| OTL-15.4 | Admin HORECA page | ✅ IN REVIEW | `src/app/admin/horeca/page.tsx` |
| OTL-15.5 | Admin Vendors page | ✅ IN REVIEW | `src/app/admin/vendors/page.tsx` |
| OTL-15.6 | Destinations/HORECA/Vendors APIs | ✅ IN REVIEW | `src/app/api/destinations/`, `/horeca/`, `/vendors/` |
| OTL-15.7 | HORECA types & Vendor types APIs | ✅ IN REVIEW | `src/app/api/horeca-types/`, `/vendor-types/` |
| OTL-16.1 | Show accessibility on trip detail | ⚪ TO DO | Not shown on public page |
| OTL-16.2 | HORECA elderly badge on trip detail | ⚪ TO DO | Not implemented |

---

# 💳 EPIC 4: Pemesanan & Pembayaran (OTL-4)
> Priority: Highest | PRD: Fase 1

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-17 | S&K dan Deklarasi Kesehatan | ⚪ TO DO | Schema exists, no UI |
| OTL-18 | Input Data Peserta tanpa KTP | ⚪ TO DO | Schema exists, no multi-participant form |
| OTL-19 | Integrasi Payment Gateway | ⚪ TO DO | Stub controller only |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-17.1 | Health declarations form | ⚪ TO DO | Schema exists |
| OTL-17.2 | Terms acceptance UI | ⚪ TO DO | — |
| OTL-18.1 | Multi-participant input | 🟡 IN PROGRESS | Ticket qty but no details |
| OTL-18.2 | Booking participants schema | ✅ IN REVIEW | `src/modules/booking/booking.schema.ts` |
| OTL-19.1 | Payment schema | ✅ IN REVIEW | `src/modules/payment/payment.schema.ts` |
| OTL-19.2 | Payment controller stub | 🟡 IN PROGRESS | No gateway integration |
| OTL-19.3 | Midtrans/Xendit/DOKU integration | ⚪ TO DO | Not started |
| OTL-19.4 | Webhook idempotency handler | ⚪ TO DO | — |
| OTL-19.5 | Payment pending page | 🟡 IN PROGRESS | `/booking/[id]/payment/` exists |
| OTL-19.6 | Payment success page | 🟡 IN PROGRESS | `/booking/[id]/success/` exists |

---

# 🔗 EPIC 5: Sistem Referral, Agen & Poin (OTL-5)
> Priority: High | PRD: Fase 2

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-20 | Role Agen vs User Biasa | ✅ IN REVIEW | Better Auth roles: user/agent/admin |
| OTL-21 | Sistem Referral via Tautan | 🟡 IN PROGRESS | Schema + agent page, hardcoded ID |
| OTL-22 | Dashboard Agen TanStack Table | ⚪ TO DO | Plain table |
| OTL-23 | Pencairan Komisi Manual | ⚪ TO DO | Schema + CRUD, no payout flow |
| OTL-24 | Program Loyalitas & Poin | ⚪ TO DO | Schema exists, hardcoded points |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-20.1 | Role-based route protection | ✅ IN REVIEW | `src/proxy.ts` |
| OTL-20.2 | Admin role check in controllers | ✅ IN REVIEW | Private trip controller |
| OTL-20.3 | Agent panel link in navbar | ✅ IN REVIEW | `src/components/navbar.tsx` |
| OTL-21.1 | Referral schema (referrals, commissions, rules) | ✅ IN REVIEW | `src/modules/referral/referral.schema.ts` |
| OTL-21.2 | Agent dashboard with referral link | 🟡 IN PROGRESS | Hardcoded AGENT_ID |
| OTL-21.3 | Auto-create referral on registration | ⚪ TO DO | — |
| OTL-21.4 | Copy referral link button | ✅ IN REVIEW | `src/components/copy-button.tsx` |
| OTL-23.1 | Admin commissions CRUD | ✅ IN REVIEW | `src/app/admin/commissions/page.tsx` |
| OTL-23.2 | Payout flow (request → approve → paid) | ⚪ TO DO | Schema exists |
| OTL-23.3 | Commission payouts schema | ✅ IN REVIEW | In referral schema |
| OTL-24.1 | Loyalty transactions schema | ✅ IN REVIEW | In referral schema |
| OTL-24.2 | Points display in profile | 🟡 IN PROGRESS | Hardcoded 555 points |
| OTL-24.3 | Earn/redeem logic | ⚪ TO DO | — |

---

# ⭐ EPIC 6: Ulasan & Galeri Dokumentasi (OTL-6)
> Priority: High | PRD: Fase 2

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-25 | Ulasan & Google Review | 🟡 IN PROGRESS | Schema + admin CRUD, static testimonials |
| OTL-26 | Filter Ulasan 4-5 Bintang | ⚪ TO DO | — |
| OTL-27 | Galeri Privat per Perjalanan | 🟡 IN PROGRESS | Schema + admin CRUD, no public display |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-25.1 | Review schema | ✅ IN REVIEW | `src/modules/review/review.schema.ts` |
| OTL-25.2 | Review controller/repository | ✅ IN REVIEW | CRUD implemented |
| OTL-25.3 | Admin reviews moderation | ✅ IN REVIEW | `src/app/admin/reviews/page.tsx` |
| OTL-25.4 | Reviews API | ✅ IN REVIEW | `src/app/api/reviews/` |
| OTL-25.5 | Public testimonials on landing | 🟡 IN PROGRESS | Static data, not from DB |
| OTL-25.6 | User review submission | ⚪ TO DO | — |
| OTL-27.1 | Gallery schema | ✅ IN REVIEW | In trip schema |
| OTL-27.2 | Admin galleries CRUD | ✅ IN REVIEW | `src/app/admin/galleries/page.tsx` |
| OTL-27.3 | Public gallery on trip detail | ⚪ TO DO | — |
| OTL-27.4 | Media upload system | ⚪ TO DO | Schema exists |

---

# 📝 EPIC 7: Optimasi SEO & Blog (OTL-7)
> Priority: Medium | PRD: Fase 3

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-28 | Blog SSG/ISR | 🟡 IN PROGRESS | Schema + CRUD + pages, no SSG/ISR |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-28.1 | Blog schema + categories | ✅ IN REVIEW | `src/modules/blog/blog.schema.ts` |
| OTL-28.2 | Blog repository | ✅ IN REVIEW | `src/modules/blog/blog.repository.ts` |
| OTL-28.3 | Admin blogs CRUD | ✅ IN REVIEW | `src/app/admin/blogs/page.tsx` |
| OTL-28.4 | Public blog list page | ✅ IN REVIEW | `src/app/blog/page.tsx` |
| OTL-28.5 | Public blog detail page | ✅ IN REVIEW | `src/app/blog/[slug]/page.tsx` |
| OTL-28.6 | Blogs API | ✅ IN REVIEW | `src/app/api/blogs/` |
| OTL-28.7 | SSG/ISR optimization | ⚪ TO DO | Uses SSR/dynamic |
| OTL-28.8 | Blog categories admin UI | ⚪ TO DO | Schema exists |

---

# 📊 EPIC 8: Dashboard & Manajemen Admin (OTL-29)
> Priority: Highest | PRD: Fase 1

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-30 | Manajemen HORECA, Vendor & Destinasi | ✅ IN REVIEW | All 3 admin pages fully implemented |
| OTL-31 | Dynamic Promo Engine | ✅ IN REVIEW | Admin promotions page |
| OTL-32 | Validasi & Pencairan Komisi | ✅ IN REVIEW | Admin commissions page |
| OTL-33 | Pengelolaan Galeri | ✅ IN REVIEW | Admin galleries page |
| OTL-34 | Moderasi Ulasan | ✅ IN REVIEW | Admin reviews page |
| OTL-35 | CMS Blog | ✅ IN REVIEW | Admin blogs page |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-30.1 | Admin layout + sidebar navigation | ✅ IN REVIEW | `src/app/admin/layout.tsx` |
| OTL-30.2 | Dashboard KPI overview | ✅ IN REVIEW | `src/app/admin/page.tsx` |
| OTL-30.3 | Reusable Modal + ConfirmDelete | ✅ IN REVIEW | `src/app/admin/components/` |
| OTL-30.4 | Admin search bar | ✅ IN REVIEW | In admin layout |
| OTL-31.1 | Promo CRUD with types | ✅ IN REVIEW | Full admin page |
| OTL-31.2 | Atomic promo usage count | ⚪ TO DO | Schema ready |
| OTL-32.1 | Commission CRUD | ✅ IN REVIEW | Full admin page |
| OTL-33.1 | Gallery CRUD | ✅ IN REVIEW | Full admin page |
| OTL-34.1 | Review moderation | ✅ IN REVIEW | Full admin page |
| OTL-35.1 | Blog CMS | ✅ IN REVIEW | Full admin page |

---

# 🗺 EPIC 9: Master Open Trip CRUD (OTL-36)
> Priority: Highest | PRD: Fase 1

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-38 | CRUD Paket Open Trip | ✅ IN REVIEW | Admin trips page |
| OTL-39 | Atur Itinerary | ⚪ TO DO | Schema exists, no UI |
| OTL-40 | Atur Harga & Kuota | ⚪ TO DO | Schema exists, no admin UI |
| OTL-41 | Atur Destinasi & Transportasi | ⚪ TO DO | Schema exists (junction tables) |
| OTL-42 | Atur Hotel & Akomodasi | ⚪ TO DO | Schema exists (junction tables) |
| OTL-43 | Publikasi & Status Trip | ✅ IN REVIEW | Trip form has status field |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-38.1 | Trip schema (trips, departures, prices) | ✅ IN REVIEW | `src/modules/trip/trip.schema.ts` |
| OTL-38.2 | Trip repository + service | ✅ IN REVIEW | CRUD + getPublishedTrips |
| OTL-38.3 | Trip controller | ✅ IN REVIEW | list + create |
| OTL-38.4 | Admin Trips page | ✅ IN REVIEW | Table + CRUD |
| OTL-38.5 | Trip create/edit form | ✅ IN REVIEW | `trip-form.tsx`, `new/`, `[id]/edit/` |
| OTL-38.6 | Trips API | ✅ IN REVIEW | `src/app/api/trips/` |
| OTL-39.1 | Itinerary editor | ⚪ TO DO | Schema ready |
| OTL-40.1 | Price management UI | ⚪ TO DO | Schema ready |
| OTL-40.2 | Atomic quota update | ⚪ TO DO | — |
| OTL-41.1 | Trip-destination assignment | ⚪ TO DO | Junction table exists |
| OTL-41.2 | Trip-vendor assignment | ⚪ TO DO | Junction table exists |
| OTL-42.1 | Trip-horeca assignment | ⚪ TO DO | Junction table exists |

---

# 👤 EPIC 10: Halaman Pengguna (OTL-37)
> Priority: Highest | PRD: Fase 1

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-44 | Homepage & Hero Section | ✅ IN REVIEW | `src/app/page.tsx` |
| OTL-45 | Daftar & Pencarian Trip | ✅ IN REVIEW | `src/app/trips/page.tsx` |
| OTL-46 | Detail Trip | ✅ IN REVIEW | `src/app/trips/[slug]/page.tsx` |
| OTL-47 | Booking & Checkout | 🟡 IN PROGRESS | Basic form, no payment |
| OTL-48 | Dashboard & Profil User | ✅ IN REVIEW | `src/app/profile/` |
| OTL-49 | Pendaftaran & Login | ✅ IN REVIEW | `src/app/auth/` |

### Tasks OTL-44:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-44.1 | Hero with search bar | ✅ IN REVIEW | 7 sections total |
| OTL-44.2 | "Kenapa Harus Pilih" section | ✅ IN REVIEW | 3 benefits |
| OTL-44.3 | "Destinasi Paling Diminati" | ✅ IN REVIEW | Trip cards grid |
| OTL-44.4 | "Booking 5 Langkah" | ✅ IN REVIEW | Step guide |
| OTL-44.5 | Testimonials | ✅ IN REVIEW | 3 static reviews |
| OTL-44.6 | Newsletter | ✅ IN REVIEW | Email subscribe |
| OTL-44.7 | Private Trip CTA | ✅ IN REVIEW | Dark section |
| OTL-44.8 | Navbar (auth-aware) | ✅ IN REVIEW | `src/components/navbar.tsx` |
| OTL-44.9 | Footer | ✅ IN REVIEW | `src/components/footer.tsx` |

### Tasks OTL-45/46:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-45.1 | Trip listing with search | ✅ IN REVIEW | `trips/page.tsx` |
| OTL-45.2 | Trip card design | ✅ IN REVIEW | Image, rating, price |
| OTL-46.1 | Trip detail with hero | ✅ IN REVIEW | `trips/[slug]/page.tsx` |
| OTL-46.2 | Departure + pricing display | ✅ IN REVIEW | "Pesan Sekarang" CTA |
| OTL-46.3 | Sticky booking summary | ✅ IN REVIEW | Right column |

### Tasks OTL-47:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-47.1 | Booking form | ✅ IN REVIEW | `booking-form.tsx` |
| OTL-47.2 | Booking API | ✅ IN REVIEW | `POST /api/bookings` |
| OTL-47.3 | Multi-participant form | ⚪ TO DO | — |
| OTL-47.4 | Promo code input | ⚪ TO DO | — |
| OTL-47.5 | Payment page | 🟡 IN PROGRESS | Directory exists |

### Tasks OTL-48:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-48.1 | Profile with tabs | ✅ IN REVIEW | 5 tabs implemented |
| OTL-48.2 | Booking history + filter | ✅ IN REVIEW | Status filter |
| OTL-48.3 | Points display | 🟡 IN PROGRESS | Hardcoded value |
| OTL-48.4 | Quick actions | ✅ IN REVIEW | 3 action cards |
| OTL-48.5 | Private trip tab | ✅ IN REVIEW | With proposal actions |

### Tasks OTL-49:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-49.1 | Login page | ✅ IN REVIEW | Email + Google |
| OTL-49.2 | Register page | ✅ IN REVIEW | Name/email/password |

---

# 🏠 EPIC 11: Landing Page (OTL-57)
> Priority: Medium | PRD: Fase 3

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-58 | List Trip | ✅ IN REVIEW | Same as OTL-45 |
| OTL-60 | Detail Trip | ✅ IN REVIEW | Same as OTL-46 |
| OTL-61 | Private Trip | ✅ IN REVIEW | Form + landing CTA |
| OTL-62 | Hubungi Kami | ⚪ TO DO | API exists, no public page |

### Tasks:
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-61.1 | Private Trip form | ✅ IN REVIEW | Full validation |
| OTL-61.2 | Private Trip CTA on landing | ✅ IN REVIEW | Dark section |
| OTL-62.1 | Contact schema + API | ✅ IN REVIEW | `src/modules/contact/` |
| OTL-62.2 | Public contact page | ⚪ TO DO | API only |

---

# 🚐 EPIC 14: Private Trip (OTL-50)
> Priority: Low | PRD: Fase 4
> **Status: ✅ FULLY COMPLETED — all 10 stages implemented, 280 tests passing**

| ID | Story | Status | File Evidence |
|----|-------|--------|---------------|
| OTL-51 | Private Trip vs Open Trip | ✅ IN REVIEW | Trip type + CTA |
| OTL-52 | Flow Request: Pilih Destinasi | ✅ IN REVIEW | Full form |
| OTL-53 | Input Kebutuhan Khusus | ✅ IN REVIEW | Sensitive data handling |
| OTL-54 | Estimasi Harga | ✅ IN REVIEW | Rupiah formatting |
| OTL-55 | Submit & Tracking Proposal | ✅ IN REVIEW | Full proposal workflow |
| OTL-56 | Admin Review & Konfirmasi | ✅ IN REVIEW | Admin pages + APIs |

### Tasks (Full Implementation):
| ID | Task | Status | File |
|----|------|--------|------|
| OTL-51.1 | Private Trip CTA on landing | ✅ IN REVIEW | `src/app/page.tsx` |
| OTL-51.2 | Trip type in admin form | ✅ IN REVIEW | open_trip/private_trip |
| OTL-52.1 | Schema: requests, destinations, proposals | ✅ IN REVIEW | Full Drizzle schema |
| OTL-52.2 | Repository: 11 methods | ✅ IN REVIEW | CRUD + filters |
| OTL-52.3 | Service: state machine | ✅ IN REVIEW | Valid transitions |
| OTL-52.4 | Controller: auth + validation | ✅ IN REVIEW | Session-based |
| OTL-52.5 | POST submit request | ✅ IN REVIEW | Session auth |
| OTL-52.6 | GET user's requests | ✅ IN REVIEW | Ownership filtered |
| OTL-52.7 | GET request detail | ✅ IN REVIEW | Ownership check |
| OTL-52.8 | PATCH proposal response | ✅ IN REVIEW | Accept/reject/revise |
| OTL-53.1 | Special requirements field | ✅ IN REVIEW | Marked sensitive |
| OTL-54.1 | Budget estimate field | ✅ IN REVIEW | Rupiah formatted |
| OTL-55.1 | Profile private trip tab | ✅ IN REVIEW | List + detail + actions |
| OTL-55.2 | Proposal response UI | ✅ IN REVIEW | Accept/Reject/Revise |
| OTL-56.1 | Admin list page + filter | ✅ IN REVIEW | Status + search |
| OTL-56.2 | Admin detail page | ✅ IN REVIEW | Full info + actions |
| OTL-56.3 | Proposal creation modal | ✅ IN REVIEW | Content/price/inclusions |
| OTL-56.4 | Admin status update | ✅ IN REVIEW | Review/reject |
| OTL-56.5 | GET admin list API | ✅ IN REVIEW | With filters |
| OTL-56.6 | GET admin detail API | ✅ IN REVIEW | With proposals |
| OTL-56.7 | PATCH status API | ✅ IN REVIEW | State transitions |
| OTL-56.8 | POST proposal API | ✅ IN REVIEW | Auto-advance status |

---

# 🔧 INFRASTRUCTURE & CROSS-CUTTING (Not in original PRD)

| ID | Task | Status | File |
|----|------|--------|------|
| OTL-INF-1 | Replace hardcoded DEFAULT_USER_ID with session | ⚪ TO DO | `src/app/profile/page.tsx:7` |
| OTL-INF-2 | Replace hardcoded AGENT_ID with session | ⚪ TO DO | `src/app/agent/page.tsx:6` |
| OTL-INF-3 | Agent page session-based auth | ⚪ TO DO | proxy.ts protects route |
| OTL-INF-4 | Blog API x-user-id header (insecure) | ⚪ TO DO | `src/app/api/blogs/route.ts:13` |
| OTL-INF-5 | Audit log infrastructure | ⚪ TO DO | Schema exists |
| OTL-INF-6 | Media upload system | ⚪ TO DO | Schema exists |
| OTL-INF-7 | Notification (email/WhatsApp) | ⚪ TO DO | — |
| OTL-INF-8 | Booking detail for users | ⚪ TO DO | Profile shows list only |
| OTL-INF-9 | Admin booking management | ⚪ TO DO | Static table only |
| OTL-INF-10 | Profile editing | ⚪ TO DO | Read-only |
| OTL-INF-11 | Forgot password | ⚪ TO DO | Link exists |
| OTL-INF-12 | Terms & privacy pages | ⚪ TO DO | Links in footer |
| OTL-INF-13 | FAQ section/page | ⚪ TO DO | Link in nav only |
| OTL-INF-14 | Tests: 280 passing (65 suites) | ✅ IN REVIEW | `src/__tests__/` |

---

# 📊 SUMMARY

## Per Epic

| Epic | IN REVIEW | IN PROGRESS | TO DO | Total |
|------|-----------|-------------|-------|-------|
| OTL-1 Arsitektur | 3 | 0 | 1 | 4 |
| OTL-2 Pencarian | 0 | 1 | 3 | 4 |
| OTL-3 Aksesibilitas | 7 | 0 | 2 | 9 |
| OTL-4 Pembayaran | 2 | 3 | 7 | 12 |
| OTL-5 Referral | 4 | 2 | 6 | 12 |
| OTL-6 Ulasan | 6 | 1 | 2 | 9 |
| OTL-7 Blog | 6 | 0 | 2 | 8 |
| OTL-8 Dashboard Admin | 10 | 0 | 1 | 11 |
| OTL-9 Master Trip | 6 | 0 | 6 | 12 |
| OTL-10 Halaman User | 17 | 2 | 3 | 22 |
| OTL-11 Landing Page | 3 | 0 | 2 | 5 |
| OTL-14 Private Trip | 22 | 0 | 0 | 22 |
| INF Infrastructure | 1 | 0 | 13 | 14 |

## Grand Total

| Status | Count |
|--------|-------|
| ✅ IN REVIEW | 87 |
| 🟡 IN PROGRESS | 9 |
| ⚪ TO DO | 48 |
| **Total** | **144** |