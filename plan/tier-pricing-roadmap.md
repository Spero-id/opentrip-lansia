# Plan — Harga Bertingkat Grup (lanjutan feat-012)

Status per 2026-10-02 · Branch: `feat/012-tier-pricing` (BELUM commit/push)

## Staging saat ini (commit `173dab4` + `fee5c48`, push ✓)

- [x] Backend tier: repository + service + controller + 2 route + 4 policy
- [x] UI panel Harga di manage groups (daftar/tambah/edit/toggle/hapus + modal)
- [x] `validatePriceForm` + 3 test (admin 31)
- [x] Artefak: `feature_list.json` (011+012 completed), `progress.md` S64
- [x] Verifikasi live sudah hijau (anon 401, 409/400, DB bersih)

## P0 — Wajib (tier mati tanpa ini)

- [x] **Tanggal berlaku ditegakkan**: canonical price + validasi checkout saring `validFrom ≤ hari ini ≤ validUntil` (repository `isPriceValid`/`pickValidPrice`/`findValidPrices`; list + kanonikal + endpoint publik ikut)
- [x] **Checkout bisa pilih tier**: `TierSelector` per-tier stepper + `tierQty` di reducer + `items` di snapshot; server hitung ulang dari DB
- [x] **Kuota tier bergerak**: `updateQuota` atomik per item + rollback saat gagal parsial (409)
- [x] **Kuota kembali saat batal/tolak**: `releaseQuota` (GREATEST floor 0) di payment-reject, admin-cancel, dan expiry
- [x] **Booking catat tier-nya**: `booking_items` ditulis di transaksi checkout
- [x] **Hidupkan jalur kuota**: checkout pakai `updateQuota` langsung
- [x] **Kedaluwarsa pending**: `expireStalePendingBookings` (24 jam) dipanggil lazy tiap checkout
- [x] Verifikasi live: tier Anak end-to-end + overbooking 409 + cancel kembalikan kuota + tier kedaluwarsa ditolak + legacy pax OK + DB bersih

## P1 — Penting (mencegah salah jual)

- [x] **Konsolidasi kuota**: `assertTierQuotasFit` — total kuota tier aktif tak boleh > maks grup (create/update tier); live: Anak×5 + Dewasa×10 → 400. Bonus: `countBookingsByDepartureId` yang badannya kosong diimplementasi (guard hapus-grup kini nyata)
- [x] **Fallback kanonikal**: tanpa Dewasa valid → tier aktif termurah (bukan pertama); test dikunci
- [x] **Tanggal tampil ke user**: info "s/d …" di BookingCard (fetch tiers publik) + sudah ada di TierSelector checkout
- [x] Seed: contoh Early Bird → `validUntil 2027-06-30`
- [x] **Guard kecil grup**: `maxParticipants` baru < kursi terbooking → 400 (test)
- [x] **Aturan resmi tier nonaktif**: booking lama jalan terus (snapshot) — dikunci test deaktivasi

## P2 — Nice to have

- [ ] **Audit tier**: riwayat ubah harga (siapa/kapan/nilai lama-baru)
- [ ] **Laporan per tier**: booking & pendapatan per tier di dashboard/grup
- [ ] Diskon Early Bird otomatis vs kode promo: aturan main gabungan (tumpuk / pilih terbesar)
