# OpenTrip Design System & UI Specification

Dokumen ini merupakan panduan lengkap sistem desain (*Design System*) dan spesifikasi UI/UX untuk seluruh halaman platform **OpenTrip**, yang dibuat berdasarkan acuan desain antarmuka (*UI mockups*).

---

## 1. Identitas Visual & Prinsip Desain

- **Visi Utama**: Menampilkan platform pemesanan open trip yang modern, profesional, terpercaya, dan menggugah minat petualangan (*adventurous yet accessible*).
- **Kesan Pertama (Wow Factor)**: Kombinasi foto destinasi resolusi tinggi, palet warna oranye hangat yang energik, serta tipografi bersih dengan efek *glassmorphism* dan sudut melengkung halus (*rounded cards*).
- **Aksesibilitas**: Kontras teks yang jelas, tata letak responsif (*mobile & desktop*), tombol aksi (CTA) yang mencolok dan konsisten.

---

## 2. Palet Warna (*Color Palette*)

### Warna Utama (*Primary Accent*)
- **Primary Mustard Orange**: `#F49D1A` (Hex) | Variasi: `#FFA500`, `#F7931A`
  - Digunakan untuk: Tombol utama (CTA), ikon, aksen penting, header/navbar — disesuaikan dengan warna logo Jelajah Memoria.
- **Primary Hover**: `#c47d12`
- **Primary Light Tint**: `#FEF6E7`

### Warna Sekunder (*Secondary / Shadow*)
- **Secondary Dark Blue**: `#0D238E` (Hex) | Variasi: `#12239E`
  - Digunakan untuk: Warna teks utama, latar belakang kontras tinggi (footer, sidebar admin), elemen gelap.

### Warna Aksen (*Accent / Tosca Cyan*)
- **Accent Teal**: `#1CA6B7` (Hex) | Variasi: `#20B2AA`
  - Digunakan untuk: Badge status, highlight, tag, latar belakang bagian sekunder (card).

### Warna Netral & Latar Belakang (*Backgrounds*)
- **Base Background**: `#FAF8F5` (Krem bersih)
- **White Content BG**: `#FFFFFF` (Putih untuk kartu/konten)
- **Border**: `#E2E8F0` (Slate-200)

### Warna Netral & Latar Belakang (*Backgrounds*)
- **Base Background**: `#FFFFFF` (Putih bersih)
- **Secondary Section BG**: `#F8FAFC` / `#FAF9F6` (Warm Off-White / Soft Gray)
- **Dark Theme (Footer & Banner CTA)**: `#0B0F19` (Obsidian Deep Navy)
- **Border**: `#E2E8F0` (Slate-200)

### Tipografi & Teks
- **Headings / Judul**: `#0F172A` (Slate-900) - Tebal (*bold / extrawith*), elegan
- **Body Text**: `#475569` (Slate-600) - Nyaman dibaca
- **Muted Text / Meta**: `#94A3B8` (Slate-400)

### Status & Indicator Colors
- **Rating / Star**: `#F59E0B` (Amber-500 ⭐)
- **Success Badge**: `#10B981` (Emerald-500)
- **Info Badge**: `#3B82F6` (Blue-500)

---

## 3. Tipografi (*Typography*)

- **Font Family**: `Plus Jakarta Sans` / `Inter` / `Sans-serif`
- **Skala Ukuran Teks**:
  - **Hero Title**: `text-4xl` hingga `text-6xl`, `font-extrabold`, `tracking-tight`
  - **Section Heading**: `text-2xl` hingga `text-4xl`, `font-bold`, `text-slate-900`
  - **Subheading**: `text-lg` hingga `text-xl`, `font-medium`, `text-slate-600`
  - **Card Title**: `text-lg`, `font-semibold`, `text-slate-900`
  - **Body Text**: `text-base`, `text-slate-600`, `leading-relaxed`
  - **Small Caption / Meta**: `text-xs` hingga `text-sm`, `text-slate-500`

---

## 4. Komponen UI Utilitas (*UI Components*)

### 1. Header Navigation Bar (Navbar)
- **Latar Belakang**: Putih bersih dengan blur halus `backdrop-blur-md bg-white/90 sticky top-0 z-50`.
- **Logo**: Teks `OpenTrip` dengan warna Oranye Oranye hangat.
- **Link Navigasi**: Beranda, Destinasi, Tentang Kami, Kontak, Promo, FAQ.
- **Tombol Auth**:
  - `Masuk`: Teks link / tombol ghost sederhana.
  - `Daftar`: Tombol Oranye Solid dengan sudut melengkung `rounded-xl font-medium px-5 py-2.5 shadow-md shadow-orange-500/20`.

### 2. Hero Section
- **Badge Tag**: Pill putih melayang dengan border dan ikon `Terpercaya 👍`.
- **Judul**: "Discover The Best Destinations In The World".
- **Floating Search Bar**: White container melayang dengan bayangan lembut (*shadow-2xl*), berisi field pilihan *Destinasi*, *Tanggal & Waktu*, serta tombol Oranye "Search & Trip Now".
- **Collage Grid Foto**: Layout susunan foto destinasi melengkung (*rounded-3xl*) dengan offset visual unik.

### 3. Section "Kenapa Harus Pilih OpenTrip Ini?"
- Layout 2 kolom:
  - **Kiri**: Judul dengan sorotan Oranye "Kenapa Harus Pilih **OpenTrip Ini?**", paragraf penjelasan, dan 3 fitur kunci dengan ikon bulat (Banyak Pilihan Destinasi, Transaksi Mudah & Transparan, Layanan 24/7).
  - **Kanan**: Foto pemandangan berukuran besar dengan badge floating button "Search & Trip Now".

### 4. Section "Destinasi Paling Diminati"
- Label Kategori: `DESTINASI IMPAN` Oranye.
- Kontrol Slider Navigasi (Panah kiri/kanan `< >`).
- Card Destinasi:
  - Rating Pill di pojok kiri atas (misal ⭐ `4.9`).
  - Gambar cover destinasi yang kaya warna.
  - Tag Kategori / Lokasi (misal 📍 Pegunungan / Pantai).
  - Nama Destinasi & Harga (`Rp 500rb` / `Rp 1.500.000`).
  - Tombol aksi lingkaran Oranye (+).

### 5. Section "Booking Trip Impian mu Cuma 5 Langkah"
- Mockup visual smartphone di sebelah kiri.
- Timeline Stepper 5 langkah berurutan di sebelah kanan:
  1. (01) Pilih Destinasi
  2. (02) Cek Detail Trip
  3. (03) Isi Form Pemesanan
  4. (04) Lakukan Pembayaran
  5. (05) Terima Konfirmasi
- Tombol CTA Oranye di bagian bawah stepper.

### 6. Section Testimonial "Apa Kata Mereka Setelah Travelling"
- Tag `TESTIMONI` dengan ringkasan rating ⭐ 4.9 / 5.0 dari 2,500+ ulasan.
- Kartu testimoni bersih dengan kutipan ulasan, foto avatar pengguna, nama, dan lokasi destinasi.

### 7. Newsletter Banner
- Container melengkung bertema gelap (`#0B0F19`).
- Judul: "Dapatkan Info Trip & Promo Terbaru".
- Form email dengan tombol Oranye `Subscribe`.

### 8. Dark Footer
- Berwarna `bg-[#0b0f19] text-slate-300`.
- Kolom Deskripsi Brand & Sosial Media.
- Kolom Navigasi, Destinasi Populer, Hubungi Kami.
- Copyright footer bar.

---

## 5. Halaman Auth (Login & Register Split Screen)

Sesuai dengan acuan desain gambar 2:
- **Layout**: Split screen (2 Kolom di Desktop).
- **Kolom Kiri**: Full height photo underwater/diving dengan overlay gelap transparan, teks logo `OpenTrip`, tagline "Jelajahi Lebih Jauh. Kenangan Lebih Lama." dan deskripsi singkat.
- **Kolom Kanan**: Form bersih dengan:
  - Link `← Kembali ke Website` di pojok kanan atas.
  - Judul `Selamat Datang Kembali!`.
  - Subjudul `Masuk untuk mulai merencanakan trip berikutnya.`.
  - Input Email & Password (dengan ikon toggle mata).
  - Checkbox `Ingat saya` & link `Lupa Password?`.
  - Tombol Oranye Solid `Login`.
  - Pembatas `Atau lanjutkan dengan`.
  - Tombol Google `Masuk dengan Google`.
  - Link beralih `Belum punya akun? Daftar di sini`.

---

## 6. Penyesuaian Panel Admin (*Admin Panel Alignment*)

Panel Admin disesuaikan agar konsisten dengan identitas merek baru:
- **Sidebar Navigation**: Latar belakang `bg-slate-900` dengan aksen Oranye pada item aktif (`bg-orange-600 text-white shadow-md shadow-orange-600/30`).
- **Header Topbar**: Status Admin, bilah pencarian cepat, profil avatar admin.
- **Dashboard Summary Cards**: Kartu KPI (Total Trip, Pemesanan Bulan Ini, Total Pendapatan, Promo Aktif) dengan ikon dan persentase perubahan.
- **Tabel Data**: Header tabel yang bersih (`bg-slate-100/80 text-slate-700`), badge status berwarna (Green = Published, Yellow = Draft, Gray = Archived), dan tombol aksi edit/delete yang mudah diakses.
