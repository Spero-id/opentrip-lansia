# 📋 Plan — OpenTrip Lansia (OTL)

Folder perencanaan proyek. Semua dokumen berbahasa Indonesia, konsisten dengan
`docs/`. Status fitur terkini ada di **`feature_list.json`** (source of truth).

## Isi folder

| Dokumen | Isi |
|---|---|
| [`overview.md`](./overview.md) | Ringkasan proyek: visi, status, arsitektur, tech stack, testing |
| [`spec-fitur/`](./spec-fitur/) | Spesifikasi per fitur (satu file per fitur) |

Dokumen plan lama (`roadmap.md`, `lib-cleanup.md`, `restructure-*.md`,
`feat-*.md`, `tier-pricing-roadmap.md`) sudah dihapus agar tidak menyesatkan.
Riwayat lengkapnya tetap ada di `progress.md`.

## Spec fitur

| Spec | Feature | Status | Ringkasan |
|---|---|---|---|
| [`spec-group-trip.md`](./spec-fitur/spec-group-trip.md) | feat-011b | ✅ completed | Group Trip: satu trip punya banyak grup, set grup aktif, upload foto per grup |
| [`spec-referral-commission.md`](./spec-fitur/spec-referral-commission.md) | feat-073 | 🔄 in_review | Sistem referral: kode referral di profile, input di checkout, history referral |

Fitur lain belum punya spec formal; daftar dan statusnya lihat `feature_list.json`
(mis. payment gateway Midtrans, commission payout, notifikasi WhatsApp,
shared UI library, FAQ, About, lupa password).

## Cara pakai

1. Mulai dari **`overview.md`** untuk memahami status dan arsitektur proyek.
2. Cek **`feature_list.json`** untuk melihat fitur mana yang `to_do` / `in_review` / `completed`.
3. Saat mengerjakan fitur yang punya spec, buka file di **`spec-fitur/`** untuk
   detail alur, API, dan kriteria penerimaan.

## Catatan penting

- Tech stack: **Next.js 16 + Drizzle ORM + Neon PostgreSQL + Better Auth + Resend**
- Pattern: **controller → service → repository → schema** di `src/features/<fitur>/`
- Auth: Better Auth dengan session-based
- Payment: Midtrans (manual transfer saat ini)
- Jangan commit: `.env`, `node_modules/`, `.next/`, `test-results/`, `playwright-report/`

---

*Terakhir diperbarui: 9 Oktober 2026*
