# Intent — Rebuild Private Trip Page sebagai Wizard

## Konteks

Rebuild `src/app/private/page.jsx` dari form satu halaman panjang menjadi
form multi-langkah (wizard), dengan bahasa Indonesia yang konsisten.

## Hasil Wawancara

- **User:** Pemesan private trip — mayoritas keluarga/pendamping lansia,
  jarang lansia tech-savvy. Copy harus sederhana dan jelas untuk orang yang
  mengurus, bukan asumsi lansia paham teknologi.
- **Why now:** Form satu halaman dengan 4 section terasa rumit; dipecah
  supaya tiap langkah pendek dan fokus.
- **Trigger:** Ingin merancang ulang alur, bukan sekadar memahami alur lama.

## Keputusan Alur

Wizard 4 langkah:

1. **Pemesan** — informasi pemesan (nama, ponsel, email)
2. **Pilihan trip** — explorer/custom, destinasi (dari API), jumlah peserta
3. **Detail perjalanan** — tanggal, meeting point, durasi, budget, catatan
4. **Konfirmasi** — ringkasan + tombol kirim

Detail:

- Indikator progres langkah di atas wizard.
- Navigasi Kembali / Lanjut dengan validasi per langkah.
- State form dipertahankan saat pindah langkah.
- Klik kirim → modal Syarat & Ketentuan → setuju → POST → `SuccessState`.
- Banner "Sudah pernah mengajukan request?" (link ke /my-trips) tetap di
  atas halaman.
- Bahasa Indonesia konsisten di seluruh halaman.

## Definisi Sukses

- Pengguna bisa menyelesaikan pengisian per langkah tanpa kebingungan.
- Alur selesai mengarah ke `SuccessState` seperti sekarang.
- Data terkirim ke `/api/private-trips` dengan payload yang sama.

## Batasan / Out of Scope

- Field, validasi, dan payload ke `/api/private-trips` tidak berubah.
- Tidak menambah field baru.
- Tidak mengubah `SuccessState`.
- Tidak menyentuh halaman lain.
- Komponen section yang ada boleh dipakai ulang.