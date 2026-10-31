# OpenTrip Design System & UI Specification

Dokumen ini merupakan panduan lengkap sistem desain (*Design System*) dan spesifikasi UI/UX untuk seluruh halaman platform **OpenTrip**, yang dibuat berdasarkan acuan desain antarmuka (*UI mockups*).

---

## 1. Identitas Visual & Prinsip Desain

- **Visi Utama**: Menampilkan platform pemesanan open trip yang modern, profesional, terpercaya, dan menggugah minat petualangan (*adventurous yet accessible*).
- **Kesan Pertama (Wow Factor)**: Kombinasi foto destinasi resolusi tinggi, palet warna oranye hangat yang energik, serta tipografi bersih dengan efek *glassmorphism* dan sudut melengkung halus (*rounded cards*).
- **Aksesibilitas**: Kontras teks yang jelas, tata letak responsif (*mobile & desktop*), tombol aksi (CTA) yang mencolok dan konsisten.

---

## 2. Palet Warna (*Color Palette*)

Nilai pada bagian ini adalah nilai aktual yang terdapat di `src/app/globals.css` (diverifikasi dari CSS hasil build).

### Warna Brand (Token Semantik)
- **Primary Mustard Orange**: `#F49D1A` — token `--primary` (terpetakan ke `--color-primary` di `@theme inline`)
  - Digunakan untuk: tombol utama (CTA), ikon, aksen penting, header/navbar — sesuai warna logo Jelajah Memoria.
  - Utility `bg-primary`, `text-primary`, `ring`, `bg-sidebar-primary` semuanya resolve ke `var(--primary)` → selalu oranye ini, **di mode terang maupun gelap** (nilai `--primary` di blok `.dark` juga `#F49D1A`).
  - *Catatan*: variasi `#FFA500` / `#F7931A` tidak dipakai di mana pun.
- **Primary Hover**: `#c47d12` — tidak ada token-nya; dipakai sebagai kelas hex langsung (`hover:bg-[#c47d12]`); varian terang `#E08A0E` untuk teks/hover sekunder.
- **Primary Light Tint**: `#FEF6E7` — bukan token; kelas hex langsung (`bg-[#FEF6E7]`).
- **Secondary Dark Blue (Navy)**: `#0D238E` — **tidak ada token di `globals.css`** (keputusan: biarkan). Dipakai langsung sebagai hex: `text-[#0D238E]`, `bg-[#0D238E]/10`.
- **Accent Teal**: `#1CA6B7` — **tidak ada token di `globals.css`** (keputusan: biarkan). Dipakai langsung: `text-[#1CA6B7]`, `bg-[#1CA6B7]/15`, `hover:bg-[#1CA6B7]`.

### Warna Netral & Latar Belakang (*Backgrounds*)
- **Base Background**: `#FCFCFC` — token `--background`; kini benar-benar berlaku karena `<body>` tidak lagi memakai kelas `bg-white` (lihat `src/app/layout.tsx`).
- **Card / Popover**: `#FCFCFC` (foreground kartu `#171717`, popover `#525252`).
- **Secondary (shadcn)**: `#FDFDFD` — nyaris putih; `bg-secondary` = surface/tombol terang, **bukan** navy.
- **Muted / Accent**: `#EDEDED`; `--muted-foreground` = `#475569` (slate-600 — sekali diubah dari `#202020` ke `#64748B` via commit `4c641a4` (agar placeholder terbaca), lalu digelapkan lagi ke `#475569` diminta user). **Placeholder input dipisah**: `placeholder:text-slate-500` (`#64748B`) di `ui/input.tsx`, kontras 4.6:1 — placeholder tetap terbaca (AA) tanpa disangka nilai terisi (nilai isi `#171717` ~15:1).
- **Border**: `#DFDFDF` · **Input**: `#DFDFDF` (disamakan dengan `--border`; di shadcn `--input` = warna **border**, bukan warna isian) · **Ring (focus)**: `#F49D1A` (oranye — konsisten brand).
- **Dark Theme (Footer & Banner CTA)**: `#0B0F19` (Obsidian Deep Navy) — kelas hex eksplisit di komponen (mis. `src/components/layout/Footer.tsx`), bukan token CSS.

### Token Semantik Lengkap (mode terang)
Nilai hasil konversi dari oklch di `globals.css` (dideduasikan dari `:root`):
- `--primary` `#F49D1A` (fg `#FDFDFD`) · `--secondary` `#FDFDFD` · `--muted` / `--accent` `#EDEDED`
- `--background` `#FCFCFC` · `--foreground` `#171717` · `--muted-foreground` `#475569`
- `--border` `#DFDFDF` · `--input` `#DFDFDF` (di shadcn `--input` = warna **border** input, harus terlihat di atas `#FCFCFC`) · `--ring` `#F49D1A`
- `--destructive` (error): `#CA3214` (fg `#FFFCFC`)
- **Chart**: `--chart-1..5` = `#72E3AD`, `#3B82F6`, `#8B5CF6`, `#F59E0B`, `#10B981` (berwarna, bukan grayscale)
- **Radius**: `--radius: 0.5rem` → `rounded-sm` 4px, `rounded-md` 6px, `rounded-lg` 8px, `rounded-xl` 12px; *(branch ini memakai 0.5rem; main memakai 0.25rem — diputuskan saat review PR)*; `rounded-2xl`/`rounded-3xl` memakai default Tailwind (16px/24px) — **tidak** lagi kelipatan `--radius` seperti tema lama.
- **Shadow**: skala TweakCN (`shadow-sm` = `0 1px 3px -1px` 17% + `0 1px 2px -1px` 17%, dst.).
- **Letter-spacing**: `--tracking-normal: 0.025em` diterapkan ke seluruh `body`; akibatnya `tracking-tight` = `0em` dan `tracking-tighter` = `-0.025em` (skala digeser).

### Mode Gelap (blok `.dark`)
- `--background #121212`, `--card #171717`, `--popover #242424` (fg `#A9A9A9`), `--foreground #E2E8F0`
- `--secondary #242424`, `--muted #1F1F1F`, `--accent #313131`, `--muted-foreground #DCDCDC`
- `--border #292929`, `--input #292929`, `--destructive #541C15`
- `--primary` & `--ring`: **tetap `#F49D1A`** (perbaikan manual — sebelumnya sempat ter-export hijau `#006239`)
- Warna hex langsung (`#0D238E`, `#1CA6B7`, `#0B0F19`, kelas `bg-white`/`text-slate-*` di halaman) **tidak ikut berubah** di mode gelap.
> Catatan: saat ini tidak ada pemicu toggle tema (tanpa `next-themes` atau script), sehingga mode gelap belum aktif; utility `dark:` baru berfungsi jika kelas `.dark` diaktifkan.

### Tipografi & Teks
- **Headings / Judul**: `#0F172A` (Slate-900) via kelas `text-slate-900` di halaman — tebal (*bold / extrabold*), elegan
- **Body Text**: `#475569` (Slate-600) via kelas `text-slate-600` — nyaman dibaca
- **Muted Text / Meta**: `#94A3B8` (Slate-400) via kelas `text-slate-400` / `text-slate-500`
- Token semantik (`--foreground #171717`, `--muted-foreground #475569`) dipakai komponen shadcn (`text-foreground`, `text-muted-foreground`); `<body>` kini memakai `text-foreground` (kelas `bg-white text-slate-900` dihapus dari `layout.tsx`).

### Status & Indicator Colors
- **Rating / Star**: `#F59E0B` (Amber-500 ⭐)
- **Success Badge**: `#10B981` (Emerald-500)
- **Info Badge**: `#3B82F6` (Blue-500)

---

## 3. Tipografi (*Typography*)

- **Font Family**: `Plus Jakarta Sans` → `ui-sans-serif` → `sans-serif` → `system-ui` (token `--font-sans` di `:root` & `.dark`). Font dimuat `next/font` di `src/app/layout.tsx` (`--font-plus-jakarta-sans`); **Inter sudah dihapus** dari layout dan token.
  - Catatan: self-reference `--font-sans: var(--font-sans)` kini **valid** karena `:root` men-definisikan stack-nya — utility `font-sans` / `font-heading` berfungsi (dulu tidak).
  - `body` juga mewarisi `letter-spacing: var(--tracking-normal)` = `0.025em`.
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
- **Layout**: Split screen (2 Kolom di Desktop); di mobile kolom foto disembunyikan dan form full-scroll (`AuthShell`).
- **Kolom Kiri**: Full height photo underwater/diving dengan overlay gelap transparan, asset logo Jelajah Memoria (`/Jelajah-Memoria-01.png`, bukan teks `OpenTrip`), tagline "Jelajahi Lebih Jauh. Kenangan Lebih Lama." dan deskripsi singkat (`text-white/70` di atas overlay).
- **Kolom Kanan — Login**: Form bersih dengan:
  - Judul `Selamat Datang Kembali`.
  - Subjudul `Masuk untuk mulai merencanakan trip berikutnya.`.
  - Input Email & Password (dengan ikon toggle mata).
  - Checkbox `Ingat saya` — berfungsi nyata via Better Auth `rememberMe` (default 30 hari vs 7 hari tanpa). **Tanpa link `Lupa Password?`** — sengaja dihapus; tidak ada flow reset sampai feat-096 selesai.
  - Tombol Oranye Solid `Masuk`.
  - Pembatas `Atau lanjutkan dengan`.
  - Tombol Google `Masuk dengan Google`.
  - Link beralih `Belum punya akun? Daftar di sini`.
- **Kolom Kanan — Register** (tidak di-detail di mockup; catatan ini mencerminkan implementasi):
  - Satu field `Nama Lengkap` (penggabungan Nama Depan + Nama Belakang dari desain awal).
  - `Email` dan `Kata Sandi` (dengan toggle mata, **tanpa field konfirmasi ulang** — toggle show/hide menggantikan retype, NIST 800-63B / NN/g).
  - Tombol `Daftar`, pembatas, tombol Google, link `Sudah Punya Akun? Masuk di sini`.

---

## 6. Penyesuaian Panel Admin (*Admin Panel Alignment*)

Panel Admin disesuaikan agar konsisten dengan identitas merek baru:
- **Sidebar Navigation**: Latar belakang biru tua dari selector `.admin-sidebar-dark` di `globals.css` (`--sidebar: oklch(0.24 0.02 262)`, teks putih `#fff`) — bukan `bg-slate-900`. Item aktif memakai aksen oranye `text-[#F49D1A] bg-[#F49D1A]/15` (`src/app/(admin)/admin/components/admin-sidebar.tsx`), bukan `bg-orange-600`.
- **Header Topbar**: Status Admin, bilah pencarian cepat, profil avatar admin.
- **Dashboard Summary Cards**: Kartu KPI (Total Trip, Pemesanan Bulan Ini, Total Pendapatan, Promo Aktif) dengan ikon dan persentase perubahan.
- **Tabel Data**: Header tabel yang bersih (`bg-slate-100/80 text-slate-700`), badge status berwarna (Green = Published, Yellow = Draft, Gray = Archived), dan tombol aksi edit/delete yang mudah diakses.
