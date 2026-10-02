# Plan — Harga Bertingkat Grup (lanjutan feat-012)

Status per 2026-10-02 · Branch: `feat/012-tier-pricing` (BELUM commit/push)

## Staging saat ini (centang setelah commit + pull)

- [ ] Backend tier: repository + service + controller + 2 route + 4 policy
- [ ] UI panel Harga di manage groups (daftar/tambah/edit/toggle/hapus + modal)
- [ ] `validatePriceForm` + 3 test (admin 31)
- [ ] Artefak: `feature_list.json` (011+012 completed), `progress.md` S64
- [ ] Verifikasi live sudah hijau (anon 401, 409/400, DB bersih)

## P0 — Wajib (tier mati tanpa ini)

- [ ] **Tanggal berlaku ditegakkan**: canonical price + validasi checkout saring `validFrom ≤ hari ini ≤ validUntil`
- [ ] **Checkout bisa pilih tier**: input pax per tier (Dewasa/Anak/…) + subtotal per tier, server hitung ulang dari DB
- [ ] **Kuota tier bergerak**: checkout potong `quota_booked` atomik per tier (ganti hitung manual)
- [ ] **Kuota kembali saat batal/tolak**: decrement saat booking cancelled / payment rejected
- [ ] **Booking catat tier-nya**: checkout tulis `booking_items` (priceId+qty+unitPrice) — SEKARANG KOSONG, akibat: my-trips tak bisa rincian tier, rekonsiliasi tier vs pendapatan mustahil
- [ ] **Hidupkan jalur kuota**: `updateQuota` kini mati (hanya dipanggil `createBooking` yang tak punya route POST) — sambungkan ke checkout
- [ ] **Kedaluwarsa pending**: booking `pending_payment` tak dibayar menahan kuota selamanya — butuh timeout + pelepas otomatis
- [ ] Verifikasi live: beli tier Anak end-to-end + overbooking ditolak + cancel kembalikan kuota

## P1 — Penting (mencegah salah jual)

- [ ] **Konsolidasi kuota**: peringatan/batasan saat total kuota tier > maks grup
- [ ] **Fallback kanonikal**: kalau Dewasa nonaktif/kedaluwarsa, "mulai dari" ambil tier aktif termurah (bukan hilang)
- [ ] **Tanggal tampil ke user**: info "s/d 31 Okt" di BookingCard/checkout untuk tier berbatas
- [ ] Seed: rapikan contoh Early Bird kedaluwarsa (`validUntil 2026-07-31`)
- [ ] **Guard kecil grup**: tolak `maxParticipants` baru < jumlah terbooking (anti-overbook administratif)
- [ ] **Aturan resmi tier nonaktif**: booking lama jalan terus (snapshot), hanya booking baru yang tak bisa pakai — nyatakan + kunci test

## P2 — Nice to have

- [ ] **Audit tier**: riwayat ubah harga (siapa/kapan/nilai lama-baru)
- [ ] **Laporan per tier**: booking & pendapatan per tier di dashboard/grup
- [ ] Diskon Early Bird otomatis vs kode promo: aturan main gabungan (tumpuk / pilih terbesar)
