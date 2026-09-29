# Deploy OpenTrip Lansia ke VPS

> Target: VPS self-hosted, Node.js + pm2 (`ecosystem.config.cjs`), database Neon PostgreSQL.
> **Bukan Vercel** — aplikasi menulis file upload ke local FS (`./uploads`), tidak jalan di serverless.
>
> Dokumen ini adalah checklist siap-jalan. Isinya merangkum temuan audit pre-deploy
> (lihat `progress.md`, Session 36 & 37). Terakhir diverifikasi: semua verifikasi lokal hijau
> — lint 0 error, `tsc` 0 error, jest 16/16, build OK di `next` 16.3.6.

---

## Prasyarat

- [ ] Node.js 20+ terpasang di VPS (`node -v`)
- [ ] Akses ke repo GitHub (repo publik, `git clone` tanpa kredensial)
- [ ] Kredensial database Neon produksi
- [ ] Domain atau IP VPS, plus reverse proxy (nginx/caddy) kalau pakai domain + HTTPS

---

## Checklist Deploy

### 1. Ambil kode

```bash
cd /var/www                     # atau direktori pilihanmu
git clone https://github.com/Spero-id/opentrip-lansia.git
cd opentrip-lansia
git checkout main
```

Deploy berikutnya cukup:

```bash
git pull
```

> Kalau muncul konflik: `git pull --rebase`. Kalau VPS tidak pernah dipakai untuk
> mengedit kode, `git reset --hard origin/main` juga aman.

### 2. Install dependensi + patch security

```bash
npm install
npm audit fix        # jangan pakai --force (breaking change)
npm audit            # sisa 5 moderate (drizzle-kit / nodemailer) itu dev tooling — boleh diabaikan
```

### 3. Buat `.env` — **WAJIB sebelum `npm run build`**

```bash
cp .env.example .env
```

Isi minimal 4 nilai ini:

| Variable | Cara dapat | Kalau salah |
|---|---|---|
| `DATABASE_URL` | dari Neon dashboard | app tidak bisa query sama sekali |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | session bisa dipalsukan |
| `BETTER_AUTH_URL` | **domain produksi**, `https://domain.com` | login/logout error |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | **sama persis** dengan di atas | cookie tidak terkirim → semua orang dianggap belum login |

Variabel `NEXT_PUBLIC_*` di-bake saat **build**. Artinya: kalau `.env` baru diisi
**setelah** `npm run build`, nilainya tidak akan masuk — harus build ulang.

Opsional (isi kalau dipakai): `GOOGLE_CLIENT_ID/SECRET`, `SMTP_*`, `ADMIN_EMAIL`,
`NEXT_PUBLIC_WHATSAPP_*`, `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`.

### 4. Database — pilih SATU, tergantung kondisi

**A. Database BARU (kosong):**

```bash
npx drizzle-kit push
```

`push` membandingkan schema di kode dengan database dan membuat semuanya — termasuk
tabel auth `session` / `account` / `verification` yang **tidak ada di file SQL manapun**
di repo (dibuat via `push` sejak awal).

> ⚠️ `npx drizzle-kit migrate` **TIDAK** dipakai di project ini. `drizzle/meta/_journal.json`
> hanya memuat 3 dari 7 file SQL, jadi `migrate` akan melewatkan `0002_blog_cover_image`,
> `0003_site_settings`, `0004_add_notifications`, `0005_add_notifications_link`.

**B. Database LAMA (sudah berisi data):**

Jangan menjalankan apa pun — schema sudah sinkron. Langkah ini dilewati.

**Kalau ragu:** kemungkinan besar B, karena selama pengembangan schema selalu di-push
ke DB dev. Tanyakan dulu sebelum menjalankan `push` ke database yang ada isinya.

### 4b. Skrip SQL domain ulasan (berlaku untuk SEMUA kondisi database)

Jalankan **dua-duanya** — keduanya idempoten, aman dijalankan berulang:

```bash
psql "$DATABASE_URL" -f docs/database/backfill-review-stats.sql
psql "$DATABASE_URL" -f docs/database/review-integrity.sql
# Hanya kalau tabel ini belum ada (DB lama yang belum pernah di-push):
psql "$DATABASE_URL" -f drizzle/0003_site_settings.sql
psql "$DATABASE_URL" -f docs/database/referral-integrity.sql
```

| Skrip | Fungsi | Kalau dilewat |
|---|---|---|
| `backfill-review-stats.sql` | Sinkronkan `trips.rating` & `trips.review_count` dengan ulasan approved | Trip yang sudah punya ulasan tampil "(0 ulasan)" dan rating `null` |
| `review-integrity.sql` | PK composite di `review_media`, FK `ON DELETE CASCADE`, `is_verified_purchase = true` | Junction tanpa PK (melanggar PANDUAN_DATABASE.md); label "N ulasan terverifikasi" tidak konsisten dengan data |
| `drizzle/0003_site_settings.sql` | Tabel `site_settings` + default `referral_bonus_points` | `GET /api/admin/site-settings/referral-bonus` 500, dan **bonus poin referral tidak bisa diberikan** saat admin menyetujui pembayaran |
| `referral-integrity.sql` | `loyalty_transactions.reference_id` dari `uuid` → `text` | Kredit poin referral **selalu gagal** (`invalid input syntax for type uuid`) karena nilainya better-auth user id |

Database **baru** hasil `push` otomatis sudah punya PK/FK dari schema, tapi skrip
tetap dijalankan supaya idempoten dan konsisten.

### 5. Seed (hanya database baru)

```bash
npx tsx src/db/seed.ts
```

Membuat 3 user: `admin@otl.id`, `agent@otl.id`, `user@otl.id`.

### 6. Build & jalankan

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup       # supaya ikut nyala saat server reboot
```

### 7. Smoke test

- [ ] Buka `/` → landing tampil
- [ ] Buka `/trips` → daftar trip muncul
- [ ] Login `admin@otl.id` → berhasil, redirect ke `/admin`
- [ ] Upload gambar di admin → file muncul di `./uploads`, gambar tampil
- [ ] Cek `pm2 logs otl` → tidak ada error berulang

---

## ⚠️ Tiga hal yang paling sering kelupaan

### 1. Ganti password admin

`admin@otl.id` / `admin` tertulis di repo publik (`src/db/seed.ts`).
**Setelah deploy, login lalu ganti password lewat halaman profile.**
Mengubah `seed.ts` saja tidak cukup — user sudah terlanjur ada di database.

### 2. Folder `uploads/` harus persisten

File upload ditulis ke `process.cwd()/uploads` dan disajikan lewat route
`/api/uploads/[...path]`, bukan sebagai static file.

- **pm2 di VPS biasa:** aman, file tinggal di tempat antar redeploy
- **Docker / container:** wajib mount volume khusus ke folder ini, kalau tidak
  semua gambar hilang saat container diganti

61 file upload lama sudah ter-track di git, jadi ikut ter-clone di awal — tapi
file **baru** setelah deploy hanya hidup di folder itu.

### 3. `uploads/` bukan `public/uploads/`

Ada dua folder yang mirip isinya:

- `./uploads` — yang ditulis aplikasi, dibaca via `/api/uploads/...` ✅
- `./public/uploads` — statis, duplikat lama, sudah masuk `.gitignore`

Kalau menambah gambar manual, taruh di `./uploads`.

---

## Rollback cepat

```bash
cd /var/www/opentrip-lansia
git log --oneline -10        # cari commit terakhir yang bagus
git reset --hard <commit>
npm install
npm run build
pm2 restart otl
```

Database tidak ikut ter-rollback oleh git. Untuk schema, jalankan perbaikan manual
lewat Neon SQL editor.

---

## Catatan keputusan

| Keputusan | Alasan |
|---|---|
| pm2, bukan Vercel | upload tulis ke local FS |
| `drizzle-kit push`, bukan `migrate` | journal tidak lengkap; tabel auth tidak ada di file SQL |
| `npm audit fix` tanpa `--force` | `--force` menurunkan `drizzle-kit` ke versi lama (breaking) |
| Skrip SQL ulasan dijalankan manual (`docs/database/*.sql`) | `drizzle-kit migrate` tidak dipakai, jadi perubahan data & constraint tidak ikut otomatis |
| Sisa 5 vuln dibiarkan | semuanya di dependency dev (drizzle-kit, nodemailer transitif) |
