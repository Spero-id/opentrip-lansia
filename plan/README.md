# 📋 Plan — OpenTrip Lansia (OTL)

Folder perencanaan proyek. Semua dokumen berbahasa Indonesia, konsisten dengan
`docs/` yang ada.

## Isi folder

| Dokumen | Isi |
|---|---|
| [`overview.md`](./overview.md) | Ringkasan proyek: visi, status, arsitektur, tech stack |
| [`roadmap.md`](./roadmap.md) | Fase kerja + prioritas berdasarkan `feature_list.json` |
| [`spec-fitur/`](./spec-fitur/) | Spesifikasi per fitur (satu file per fitur) |

## Spec fitur

### ✅ Sedang dalam pengerjaan

| Spec | Feature | Ringkasan |
|---|---|---|
| [`spec-referral-commission.md`](./spec-fitur/spec-referral-commission.md) | feat-073 | Sistem referral: kode referral di profile, input di checkout, history referral |
| [`spec-group-trip.md`](./spec-fitur/spec-group-trip.md) | feat-011b | Group Trip: satu trip punya banyak grup, set grup aktif, upload foto per grup |

### 📋 Belum ada spec formal

| Feature | Ringkasan |
|---|---|
| Booking & Payment Flow | Checkout multi-step, payment gateway Midtrans |
| Trip Departure Management | Kelola jadwal keberangkatan per trip |
| Private Trip | Request private trip, proposal admin |
| Admin Dashboard | CRUD trips, destinations, blogs, commissions |
| Review & Ulasan | Rating 1-5, galeri perjalanan |

## Cara pakai

1. Mulai dari **`overview.md`** untuk memahami status proyek saat ini.
2. Lanjut ke **`roadmap.md`** untuk melihat sisa pekerjaan dan prioritas.
3. Saat mengerjakan fitur, buka spec fitur terkait untuk detail:
   alur, API, model data, kriteria penerimaan.

## Catatan penting

- Tech stack: **Next.js 16 + Drizzle ORM + Neon PostgreSQL + Better Auth**
- Database URL: Neon PostgreSQL (lihat `docs/index.md` → Connection Strings)
- Pattern: **controller → service → repository → schema** (di `src/modules/`)
- Auth: Better Auth dengan session-based
- Payment: Midtrans (manual transfer saat ini)
- Jangan commit: `.env`, `node_modules/`, `.next/`

---

*Last updated: 6 September 2026*
