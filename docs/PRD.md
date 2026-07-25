# Product Requirements Document (PRD) — Open Trip Lansia (OTL)

> **Dokumen:** PRD v1.0
> **Proyek:** Open Trip Lansia (OTL) — Platform Pemesanan Trip untuk Lansia
> **Berdasarkan:** Jira Board OTL (50 issues, 14 epik) & Database ERD v2
> **Tanggal:** 22 Juli 2026

---

## 1. Latar Belakang & Tujuan

Open Trip Lansia adalah platform digital yang mempertemukan penyelenggara open trip dengan peserta lansia (lanjut usia). Fokus utama adalah menyediakan pengalaman perjalanan yang aman, nyaman, dan sesuai kebutuhan fisik lansia — mulai dari pemilihan destinasi, proses booking, pembayaran, hingga dokumentasi perjalanan.

### Masalah yang Diselesaikan
- Lansia sulit menemukan paket trip yang sesuai kondisi fisik mereka
- Proses booking trip konvensional masih manual dan tidak terintegrasi
- Tidak ada sistem referral/agen yang terstruktur untuk komunitas lansia
- Dokumentasi perjalanan (foto/ulasan) tersebar dan tidak terpusat
- Tidak ada mekanisme pembayaran online yang terpercaya

### Target Pengguna
1. **Peserta Lansia (60+ tahun)** — pengguna akhir yang mencari dan memesan trip
2. **Agen/Pendamping** — perantara yang mereferensikan trip ke lansia
3. **Admin Penyelenggara** — mengelola paket trip, peserta, pembayaran, dan konten

---

## 2. Ruang Lingkup

### 2.1 Dalam Lingkup (MVP + Iterasi 1)
- Landing page dengan hero section dan daftar trip
- Pencarian pintar (natural language / RAG) + filter minat
- Detail aksesibilitas destinasi (peringatan fisik, medan, HORECA)
- CRUD paket open trip (admin)
- Atur itinerary, harga, kuota, hotel, transportasi, destinasi
- Manajemen status trip (draft → publish → selesai)
- Flow booking & checkout multi-item (campur tarif dewasa/anak)
- Deklarasi kesehatan & S&K per peserta
- Integrasi payment gateway (Midtrans/Xendit/DOKU)
- Halaman pengguna: homepage, daftar trip, detail trip, booking, profil
- Dashboard admin: manajemen database HORECA/vendor/destinasi, promo, komisi, galeri, blog
- Sistem referral otomatis via tautan
- Role agen vs user biasa
- Dashboard agen (TanStack Table)
- Program loyalitas & poin
- Ulasan & rating (filter 4-5 bintang)
- Galeri privat per perjalanan
- Blog terintegrasi (SSG/ISR untuk SEO)
- Arsitektur: Next.js + Neon PostgreSQL + Drizzle ORM + Better Auth + TanStack Table

### 2.2 Luar Lingkup (Iterasi Berikutnya)
- Private trip (kustom destinasi) — prioritas rendah
- Aplikasi mobile native (cukup responsive web dulu)
- Integrasi dengan travel agent eksternal API
- Sistem chat/realtime messaging

---

## 3. Fitur & Epik (dari Jira)

### EPIK 1: Arsitektur & Fondasi Teknis (OTL-1) — Priority: Highest
| Story | Deskripsi |
|-------|-----------|
| OTL-8 | Setup Next.js + Tailwind + Responsif Mobile |
| OTL-9 | Setup Neon PostgreSQL + Drizzle ORM + Better Auth |
| OTL-11 | Setup TanStack Table untuk Dashboard |

### EPIK 2: Eksplorasi & Pencarian (OTL-2) — Priority: High
| Story | Deskripsi |
|-------|-----------|
| OTL-12 | Pencarian Pintar Natural Language (RAG) |
| OTL-13 | Tampilan Hasil Ala Netflix |
| OTL-14 | Filter Minat Interest-Based |

### EPIK 3: Detail Aksesibilitas Destinasi (OTL-3) — Priority: Medium
| Story | Deskripsi |
|-------|-----------|
| OTL-15 | Database HORECA dan Vendor |
| OTL-16 | Peringatan Fisik dan Medan untuk Lansia |

### EPIK 4: Pemesanan & Pembayaran (OTL-4) — Priority: Highest
| Story | Deskripsi |
|-------|-----------|
| OTL-17 | S&K dan Deklarasi Kesehatan |
| OTL-18 | Input Data Peserta tanpa KTP |
| OTL-19 | Integrasi Payment Gateway |

### EPIK 5: Sistem Referral, Agen & Poin (OTL-5) — Priority: High
| Story | Deskripsi |
|-------|-----------|
| OTL-20 | Pemisahan Role Agen vs User Biasa |
| OTL-21 | Sistem Referral via Tautan Otomatis |
| OTL-22 | Dashboard Agen TanStack Table |
| OTL-23 | Pencairan Komisi Manual |
| OTL-24 | Program Loyalitas dan Poin |

### EPIK 6: Ulasan & Galeri Dokumentasi (OTL-6) — Priority: High
| Story | Deskripsi |
|-------|-----------|
| OTL-25 | Integrasi Ulasan dan Google Review |
| OTL-26 | Filter Ulasan Hanya 4-5 Bintang |
| OTL-27 | Galeri Privat per Perjalanan |

### EPIK 7: Optimasi SEO & Blog (OTL-7) — Priority: Medium
| Story | Deskripsi |
|-------|-----------|
| OTL-28 | Blog Terintegrasi SSG ISR |

### EPIK 8: Dashboard & Manajemen Admin (OTL-29) — Priority: Highest
| Story | Deskripsi |
|-------|-----------|
| OTL-30 | Manajemen Database HORECA, Vendor & Destinasi |
| OTL-31 | Dynamic Promo Engine (Diskon & Promo) |
| OTL-32 | Validasi & Pencairan Komisi Agen |
| OTL-33 | Pengelolaan Galeri Dokumentasi Trip |
| OTL-34 | Moderasi & Filter Ulasan |
| OTL-35 | CMS Blog (Content Management System) |

### EPIK 9: Master Open Trip (CRUD Paket Trip) (OTL-36) — Priority: Highest
| Story | Deskripsi |
|-------|-----------|
| OTL-38 | CRUD Paket Open Trip |
| OTL-39 | Atur Itinerary Perjalanan |
| OTL-40 | Atur Harga & Kuota Peserta |
| OTL-41 | Atur Destinasi & Transportasi |
| OTL-42 | Atur Hotel & Akomodasi |
| OTL-43 | Publikasi & Manajemen Status Trip |

### EPIK 10: Halaman Pengguna (OTL-37) — Priority: Highest
| Story | Deskripsi |
|-------|-----------|
| OTL-44 | Homepage & Hero Section |
| OTL-45 | Halaman Daftar & Pencarian Trip |
| OTL-46 | Halaman Detail Trip |
| OTL-47 | Flow Booking & Checkout |
| OTL-48 | Dashboard & Profil User |
| OTL-49 | Flow Pendaftaran & Login |

### EPIK 11: Landing Page (OTL-57) — Priority: Medium
| Story | Deskripsi |
|-------|-----------|
| OTL-58 | List Trip |
| OTL-60 | Detail Trip |
| OTL-61 | Private Trip |
| OTL-62 | Hubungi Kami |

### EPIK 12: Login Register (OTL-63) — Priority: Medium
(Tidak memiliki story turunan — kemungkinan overlap dengan OTL-49)

### EPIK 13: Halaman Checkout (OTL-65) — Priority: Medium
(Tidak memiliki story turunan — kemungkinan overlap dengan OTL-47)

### EPIK 14: Private Trip (OTL-50) — Priority: Low
| Story | Deskripsi |
|-------|-----------|
| OTL-51 | Pilihan Private Trip vs Open Trip di Halaman Trip |
| OTL-52 | Flow Request Private Trip: Pilih Destinasi |
| OTL-53 | Input Kebutuhan Khusus & Preferensi |
| OTL-54 | Estimasi Harga Private Trip |
| OTL-55 | Submit & Tracking Proposal Private Trip |
| OTL-56 | Admin: Review & Konfirmasi Private Trip |

---

## 4. Arsitektur Teknis

### 4.1 Tech Stack
| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Auth | Better Auth (email/password + social) |
| Database | Neon PostgreSQL 15+ (serverless) |
| ORM | Drizzle ORM |
| Admin Table | TanStack Table |
| Geospasial | PostGIS (geography(Point, 4326)) |
| Search | tsvector/tsquery (full-text search native PostgreSQL) |
| Payment Gateway | Midtrans, Xendit, DOKU |
| Deployment | (belum ditentukan) |

### 4.2 Database Connection

```bash
DATABASE_URL=postgresql://neondb_owner:npg_GLYXbWEK3Uy1@ep-spring-feather-azrtnxj8-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

Neon serverless PostgreSQL — pooled connection via `-pooler` hostname. SSL required.

### 4.3 Database (ERD v2 — 30+ tabel)
Domain utama:
- **Users & Auth** — users, profiles, auth_tokens, user_sessions
- **Master Data** — destinations, destination_categories, horeca, horeca_types, vendors, vendor_types, media
- **Trip Catalog** — trips, trip_departures, trip_prices, trip_destinations, trip_horeca, trip_vendors, trip_media, trip_galleries, gallery_media, itinerary_items
- **Booking & Payment** — bookings, booking_items, booking_participants, health_declarations, terms_acceptances, payments, payment_webhook_events, refunds
- **Reviews** — reviews, review_media
- **Referral & Loyalty** — referrals, commissions, commission_rules, commission_payouts, payout_commissions, loyalty_transactions
- **Promotions** — promotions, promotion_usages
- **Blog & SEO** — blogs, blog_categories
- **Private Trip** — private_trip_requests, private_trip_destinations_requested, private_trip_proposals
- **Other** — contact_messages, audit_logs

Aturan kritis database:
- Semua PK menggunakan UUIDv7
- Uang menggunakan NUMERIC(14,2) — tidak pernah float
- Update kuota/promo harus atomik (WHERE clause + cek affected rows)
- Data kesehatan/PII dienkripsi
- Idempotency key untuk webhook pembayaran
- CHECK constraints untuk integritas data

---

## 5. User Flow

### 5.1 Visitor → Peserta
```
Landing Page → Cari/Filter Trip → Detail Trip (cek aksesibilitas, itinerary, harga)
  → Daftar/Login → Pilih Keberangkatan → Isi Data Peserta + Deklarasi Kesehatan
  → Checkout → Pembayaran → Konfirmasi → Notifikasi
```

### 5.2 Agen
```
Daftar sebagai Agen → Dapat Tautan Referral → Share ke Lansia
  → Komisi Otomatis per Booking → Pantau di Dashboard Agen → Cairkan Komisi
```

### 5.3 Admin
```
Login Admin → Dashboard:
  ├─ Manajemen Trip: CRUD paket, itinerary, harga, hotel, transportasi, status
  ├─ Manajemen Data: HORECA, vendor, destinasi
  ├─ Promo: Buat/diskon, atur periode & kuota
  ├─ Pesanan: Lihat, konfirmasi, refund
  ├─ Ulasan: Moderasi & filter
  ├─ Galeri: Upload dokumentasi trip
  ├─ Agen: Validasi & cairkan komisi
  └─ Blog: Tulis & publikasi artikel
```

---

## 6. Prioritas & Timeline

### Fase 1 (MVP) — Highest Priority
| Urutan | Epik | Estimasi |
|--------|------|----------|
| 1 | Arsitektur & Fondasi Teknis (OTL-1) | Minggu 1-2 |
| 2 | Master Open Trip CRUD (OTL-36) | Minggu 2-4 |
| 3 | Halaman Pengguna (OTL-37) | Minggu 4-7 |
| 4 | Pemesanan & Pembayaran (OTL-4) | Minggu 6-9 |
| 5 | Dashboard & Manajemen Admin (OTL-29) | Minggu 7-11 |

### Fase 2 — High Priority
| Urutan | Epik | Estimasi |
|--------|------|----------|
| 6 | Eksplorasi & Pencarian (OTL-2) | Minggu 10-12 |
| 7 | Sistem Referral, Agen & Poin (OTL-5) | Minggu 11-14 |
| 8 | Ulasan & Galeri Dokumentasi (OTL-6) | Minggu 13-15 |

### Fase 3 — Medium Priority
| Urutan | Epik | Estimasi |
|--------|------|----------|
| 9 | Detail Aksesibilitas Destinasi (OTL-3) | Minggu 14-15 |
| 10 | Optimasi SEO & Blog (OTL-7) | Minggu 15-16 |
| 11 | Landing Page (OTL-57) | Minggu 15-16 |
| 12 | Login Register (OTL-63) | Minggu 3 (merge ke Fase 1) |
| 13 | Halaman Checkout (OTL-65) | Minggu 8 (merge ke Fase 1) |

### Fase 4 — Low Priority
| Urutan | Epik | Estimasi |
|--------|------|----------|
| 14 | Private Trip (OTL-50) | Minggu 17-20 |

---

## 7. Metrik Kesuksesan (KPI)

- **Conversion Rate:** ≥ 3% pengunjung → booking
- **Booking Completion:** ≥ 80% user yang mulai checkout menyelesaikan pembayaran
- **Lansia User Base:** ≥ 60% peserta adalah lansia (60+)
- **Agen Aktif:** ≥ 50 agen mereferensikan dalam 3 bulan pertama
- **Page Load:** ≤ 2 detik (Core Web Vitals)
- **SEO Traffic:** ≥ 30% traffic dari organic search dalam 6 bulan

---

## 8. Asumsi & Dependensi

- Database ERD v2 sudah final dan siap diimplementasi
- Payment gateway sudah memiliki akun produksi (Midtrans/Xendit/DOKU)
- Integrasi Google Review membutuhkan API key Google Business
- Fitur RAG (pencarian natural language) membutuhkan LLM API key (atau bisa pakai PostgreSQL FTS dulu sebagai fallback)
- Blog SSG/ISR membutukan Vercel atau platform yang mendukung Next.js output

---

## 9. Glossary

| Istilah | Definisi |
|---------|----------|
| Open Trip | Paket perjalanan dengan jadwal fix, peserta bisa bergabung secara individu |
| Private Trip | Paket perjalanan eksklusif untuk rombongan sendiri, bebas pilih destinasi |
| HORECA | Hotel, Restaurant, Cafe — tempat akomodasi & makan |
| RAG | Retrieval-Augmented Generation — pencarian natural language dengan LLM |
| SSG/ISR | Static Site Generation / Incremental Static Regeneration — strategi rendering Next.js |
| TanStack Table | Headless UI table library untuk React dengan sorting/filtering/pagination |
| Drizzle ORM | TypeScript ORM ringan berbasis SQL untuk PostgreSQL |
| Promo Engine | Sistem diskon otomatis berbasis aturan (persentase/nominal, periode, kuota) |
| Checkout | Proses akhir pemesanan sebelum pembayaran |
| Referral | Tautan unik yang digunakan agen untuk mereferensikan pengguna |
| Komisi | Imbalan finansial untuk agen atas booking yang berhasil |
| Poin/Loyalty | Poin yang dikumpulkan peserta dari booking/ulasan, bisa ditukarkan |
| Midtrans/Xendit/DOKU | Payment gateway Indonesia |
| Better Auth | Next.js authentication library — email/password, social login, session management |
