# Jelajah Memoria — Design System & UI Specification

Dokumen ini adalah panduan sistem desain (*Design System*) dan spesifikasi UI/UX platform **Jelajah Memoria**.

> **Sumber kebenaran warna, radius, dan font adalah `src/app/globals.css`.** Dokumen ini menjelaskan *peran* tiap token; nilai `oklch` disalin dari sana agar mudah dibaca. Jangan mendefinisikan ulang nilai token di tempat lain.

---

## 1. Identitas Visual & Prinsip Desain

- **Brand**: **Jelajah Memoria** (lihat metadata `src/app/layout.tsx`, logo, dan footer). Istilah **"open trip"** adalah kategori produk, **bukan** nama brand — jangan dipakai sebagai nama brand di UI atau dokumen.
- **Visi**: platform pemesanan open trip yang modern, profesional, terpercaya, dan ramah lansia (*adventurous yet accessible*).
- **Kesan pertama**: foto destinasi resolusi tinggi, aksen **primary kuning hangat**, tipografi bersih, kartu membulat (*rounded*), dan *glassmorphism* tipis.
- **Aksesibilitas**: kontras teks yang jelas, tata letak responsif, CTA mencolok dan konsisten. **Teks di atas `bg-primary` wajib memakai `text-primary-foreground`**, bukan `text-white`.

---

## 2. Warna (*Design Token*)

Token disusun **3 lapis** di `src/app/globals.css`:

1. **Primitif** — nilai mentah `oklch(...)`.
2. **Semantik** — `--background`, `--primary`, `--success`, … yang dipakai komponen.
3. **Utility** — blok `@theme inline` memetakan token semantik ke utility Tailwind (`bg-primary`, `text-success-700`, `border-info-200`, …). **Tanpa blok ini utility tidak ter-generate dan `@apply` gagal.**

### 2.1 Token inti (light)

| Token | Nilai | Peran |
|---|---|---|
| `background` | `oklch(1 0 0)` | latar halaman |
| `foreground` | `oklch(0.148 0.004 228.8)` | teks utama |
| `card` / `card-foreground` | `oklch(1 0 0)` / `oklch(0.148 0.004 228.8)` | permukaan kartu |
| `popover` / `popover-foreground` | `oklch(1 0 0)` / `oklch(0.148 0.004 228.8)` | dropdown/popover |
| `primary` | `oklch(0.852 0.199 91.936)` | aksen brand, CTA, ikon aktif |
| `primary-foreground` | `oklch(0.421 0.095 57.708)` | teks/ikon di atas primary |
| `secondary` / `secondary-foreground` | `oklch(0.967 0.001 286.375)` / `oklch(0.21 0.006 285.885)` | permukaan sekunder |
| `muted` / `muted-foreground` | `oklch(0.963 0.002 197.1)` / `oklch(0.56 0.021 213.5)` | latar redup, teks meta |
| `accent` / `accent-foreground` | `oklch(0.963 0.002 197.1)` / `oklch(0.218 0.008 223.9)` | hover/aksen halus |
| `destructive` / `destructive-foreground` | `oklch(0.577 0.245 27.325)` / `oklch(0.971 0.013 17.38)` | error/hapus |
| `success` / `success-foreground` | `oklch(0.696 0.17 162.48)` / `oklch(0.979 0.021 166.113)` | status sukses |
| `warning` / `warning-foreground` | `oklch(0.769 0.188 70.08)` / `oklch(0.279 0.077 45.635)` | status peringatan |
| `info` / `info-foreground` | `oklch(0.623 0.214 259.815)` / `oklch(0.97 0.014 254.604)` | status informasi |
| `border`, `input` | `oklch(0.925 0.005 214.3)` | garis |
| `ring` | `oklch(0.723 0.014 214.4)` | focus ring |
| `chart-1` … `chart-5` | oranye bertingkat | grafik |
| `radius` | `0.625rem` | basis sudut (sm…4xl dihitung darinya) |

### 2.2 Warna status (skala semantik)

Agar badge status tidak memakai nama palet mentah, keluarga hue berikut dipetakan ke token semantik menggunakan **skala lengkap** (50–950). Nilainya identik dengan palet asal karena di-alias di `@theme inline`:

| Semantik | Alias palet | Contoh utility |
|---|---|---|
| `success-*` | emerald | `bg-success-100 text-success-700 border-success-200` |
| `warning-*` | amber | `bg-warning-100 text-warning-800` |
| `info-*` | blue | `bg-info-50 text-info-700 border-info-200` |
| `destructive-*` | red | `bg-destructive-50 text-destructive-600 border-destructive-200` |

Warna kategorikal yang **sengaja berbeda** untuk membedakan jenis data (mis. `purple` = revisi private trip, `teal` = ramah lansia, `indigo` = request, `violet` = reviewed) tetap memakai palet Tailwind karena berfungsi sebagai penanda kategori, bukan status.

### 2.3 Dark mode & sidebar admin

`.dark` menimpa token yang sama (mis. `primary` → `oklch(0.795 0.184 86.047)`, `background` → `oklch(0.148 0.004 228.8)`). Sidebar admin punya override `.admin-sidebar-dark` pada `--sidebar-*`. Komponen cukup memakai utility token sehingga otomatis ikut tema.

### 2.4 Aturan pemakaian (wajib)

- **Dilarang menulis warna mentah** di komponen: `#hex`, `rgb()`, `rgba()`, `oklch()` inline, `text-white`/`text-black`/`bg-white`/`bg-black`. Gunakan token atau skala status di atas.
- Teks di atas `bg-primary` → `text-primary-foreground`; di atas `bg-secondary` → `text-secondary-foreground`.
- **Pengecualian:** template email (`src/lib/mail/templates.ts`) tetap memakai hex literal karena banyak klien email tidak mendukung CSS variable.
- Jangan menambah token sekali pakai (mis. `--whatsapp`, `--primary-hover`); pakai yang sudah ada — `bg-green-500`, `bg-primary/90`, dsb.
- Untuk translucent di atas foto/gambar, opacity putih (`bg-white/10`) boleh dipakai karena bersifat *overlay*, bukan permukaan tema.

---

## 3. Tipografi (*Typography*)

- **Font Family**: `Plus Jakarta Sans` (heading & body) → dipetakan ke `--font-sans` dan `--font-heading`; fallback `Inter`.
- **Skala Ukuran Teks**:
  - **Hero Title**: `text-4xl`–`text-6xl`, `font-extrabold`, `tracking-tight`
  - **Section Heading**: `text-2xl`–`text-4xl`, `font-bold`, `text-foreground`
  - **Subheading**: `text-lg`–`text-xl`, `font-medium`, `text-muted-foreground`
  - **Card Title**: `text-lg`, `font-semibold`, `text-foreground`
  - **Body Text**: `text-base`, `text-muted-foreground`, `leading-relaxed`
  - **Small Caption / Meta**: `text-xs`–`text-sm`, `text-muted-foreground`

---

## 4. Komponen UI Utilitas (*UI Components*)

### 1. Header Navigation Bar (Navbar)
- **Latar Belakang**: `bg-background/90` dengan blur halus, `sticky top-0 z-50`; saat di-scroll di atas hero menjadi panel gelap transparan (`bg-black/50 backdrop-blur`) dengan teks terang.
- **Logo**: `/Jelajah-Memoria-01.png`.
- **Link Navigasi**: Beranda, Destinasi, Tentang Kami, Kontak, Promo, FAQ.
- **Tombol Auth**:
  - `Masuk`: tombol ghost.
  - `Daftar`: tombol solid `bg-primary text-primary-foreground rounded-xl font-medium px-5 py-2.5`.

### 2. Hero Section
- **Badge Tag**: pill putih melayang dengan border dan ikon.
- **Floating Search Bar**: container melayang dengan bayangan lembut (`shadow-2xl`), berisi field *Destinasi*, *Tanggal*, dan tombol `bg-primary`.
- **Collage Grid Foto**: susunan foto `rounded-3xl` dengan offset visual.

### 3. Section "Kenapa Harus Pilih Jelajah Memoria Ini?"
- Layout 2 kolom:
  - **Kiri**: judul dengan sorotan `text-primary`, paragraf, dan 3 fitur kunci dengan ikon bulat.
  - **Kanan**: foto besar dengan tombol floating `bg-primary`.

### 4. Section "Destinasi Paling Diminati"
- Label kategori `text-primary`.
- Kontrol slider navigasi (panah kiri/kanan).
- Card Destinasi:
  - Rating pill di pojok kiri atas.
  - Gambar cover destinasi.
  - Tag kategori/lokasi.
  - Nama destinasi & harga.
  - Tombol aksi bulat `bg-primary`.

### 5. Section "Booking Trip Impianmu Cuma 5 Langkah"
- Mockup smartphone di kiri; timeline stepper 5 langkah di kanan (Pilih Destinasi → Cek Detail → Isi Form → Pembayaran → Konfirmasi).
- Tombol CTA `bg-primary` di bawah stepper.

### 6. Section Testimonial
- Tag `TESTIMONI` dengan ringkasan rating.
- Kartu testimoni: kutipan, avatar, nama, dan lokasi destinasi.

### 7. Newsletter Banner
- Container melengkung bertema gelap (`bg-foreground`).
- Judul: "Dapatkan Info Trip & Promo Terbaru"; form email dengan tombol `bg-primary`.

### 8. Dark Footer
- `bg-foreground text-background` (atau `text-white`).
- Kolom Deskripsi Brand & Sosial Media, Navigasi, Destinasi Populer, Hubungi Kami, dan bar copyright.

---

## 5. Halaman Auth (Login & Register Split Screen)

- **Layout**: split screen 2 kolom di desktop.
- **Kolom Kiri**: foto full-height dengan overlay gelap transparan, logo Jelajah Memoria, tagline "Jelajahi Lebih Jauh. Kenangan Lebih Lama.", dan deskripsi singkat.
- **Kolom Kanan**: form bersih dengan:
  - Link `← Kembali ke Website`.
  - Judul "Selamat Datang Kembali!" dan subjudul.
  - Input Email & Password (dengan ikon toggle mata).
  - Checkbox "Ingat saya" & link "Lupa Password?".
  - Tombol solid `bg-primary text-primary-foreground`.
  - Pembatas "Atau lanjutkan dengan" dan tombol Google.
  - Link beralih "Belum punya akun? Daftar di sini".

---

## 6. Penyesuaian Panel Admin (*Admin Panel Alignment*)

- **Sidebar Navigation**: memakai token `--sidebar-*` (mode gelap via `.admin-sidebar-dark`), item aktif dengan aksen primary.
- **Header Topbar**: status admin, pencarian cepat, profil avatar.
- **Dashboard Summary Cards**: kartu KPI dengan ikon dan persentase perubahan; warna ikon memakai token semantik (`text-info-600`, `text-success-600`, `text-warning-600`, dst.).
- **Tabel Data**: header bersih (`bg-muted/80`), badge status memakai token semantik (`success` = Published, `warning` = Draft, `secondary`/netral = Archived), tombol aksi edit/delete yang mudah diakses.

---

## 7. Ringkasan Aturan Kontribusi UI

1. Ambil warna dari token di `src/app/globals.css`; jangan hardcode.
2. Badge status → `success`/`warning`/`info`/`destructive`; penanda kategori boleh tetap palet.
3. Selalu uji kontras untuk teks berwarna, terutama di atas `primary`.
4. Jaga `@theme inline` tetap ada — tanpa itu utility token mati.
5. Verifikasi dengan `npm run build`, `npx tsc --noEmit`, `npm run lint`, dan `npx vitest run`.
