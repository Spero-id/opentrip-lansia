# Spesifikasi Fitur: Group Trip Management

> **Feature ID:** feat-011b (extension dari feat-011 Trip Departure Management)
> **Status:** Approved
> **Priority:** 11b
> **Depends on:** feat-010, feat-011

---

## 1. Ringkasan

Satu paket trip bisa memiliki **banyak grup keberangkatan** (group). Setiap grup punya:
- Tanggal berangkat & pulang sendiri
- Kuota maksimal sendiri
- Status sendiri (scheduled / confirmed / ongoing / completed / cancelled)
- **Satu grup aktif** per trip — booking user otomatis masuk ke grup aktif

Admin bisa:
- Mengelola grup dari tabel trip (button "Grup Trip")
- Set grup mana yang **aktif** untuk menerima booking
- Upload foto-foto per grup setelah trip selesai (galeri grup)

---

## 2. Konsep: Departure = Group

**Catatan penting:** Secara teknis, "grup" sudah direpresentasikan oleh tabel `trip_departures` yang ada. Setiap baris `trip_departures` adalah satu grup keberangkatan dengan tanggal dan kuota masing-masing.

Yang perlu ditambahkan:
- Kolom `is_active` di `trip_departures` — menandai grup yang sedang aktif menerima booking
- Logika bahwa **hanya 1 grup aktif per trip** (constraint application-level)
- UI manajemen grup (manage dari halaman trips)
- Upload foto per grup

### Alur Konsep

```
Trip: "Open Trip Bromo Sunrise"
├── Group 1 (15 Sep 2026) — kuota 10 — ✅ ACTIVE (menerima booking)
├── Group 2 (22 Sep 2026) — kuota 15 — scheduled
├── Group 3 (30 Sep 2026) — kuota 8 — scheduled
└── Group 4 (05 Okt 2026) — kuota 12 — completed ✅ (ada galeri foto)
```

---

## 3. Perubahan Database

### 3.1 Tambah kolom `is_active` ke `trip_departures`

```sql
ALTER TABLE trip_departures
  ADD COLUMN is_active boolean NOT NULL DEFAULT false;
```

**Aturan bisnis:**
- Per trip, **maksimal 1** departure yang `is_active = true`
- Ketika admin mengaktifkan satu grup, grup aktif lain di trip yang sama harus dinonaktifkan
- Booking user hanya bisa masuk ke grup yang `is_active = true`

### 3.2 Tabel baru: `group_trip_photos` (opsional, bisa pakai `trip_galleries` yang ada)

**Opsi A: Manfaatkan `trip_galleries` yang sudah ada**

Tabel `trip_galleries` sudah punya kolom `departure_id` nullable. Kita bisa langsung pakai:
- `trip_galleries.departure_id` → foto milik grup tertentu
- `trip_galleries.trip_id` → trip induk
- `trip_galleries.title` → nama galeri (misal "Foto Group 15 Sep 2026")
- `trip_galleries.is_private` → apakah hanya untuk peserta grup

**Rekomendasi: Gunakan Opsi A** — tidak perlu tabel baru, `trip_galleries` + `gallery_media` sudah cukup.

### 3.3 Query Index Tambahan

```sql
-- Cari grup aktif per trip (hot path booking)
CREATE INDEX idx_departures_active ON trip_departures (trip_id)
  WHERE is_active = true;

-- Galeri per departure
CREATE INDEX idx_galleries_departure ON trip_galleries (departure_id)
  WHERE departure_id IS NOT NULL;
```

---

## 4. API Endpoints

### 4.1 GET `/api/trips/[tripId]/groups`

Mengembalikan semua grup (departures) milik suatu trip.

**Response:**
```json
{
  "tripId": "uuid",
  "groups": [
    {
      "id": "uuid",
      "startDate": "2026-09-15",
      "endDate": "2026-09-16",
      "maxParticipants": 10,
      "minParticipants": 1,
      "status": "scheduled",
      "isActive": true,
      "quotaBooked": 5,
      "notes": null,
      "galleryCount": 12,
      "bookingCount": 3
    }
  ]
}
```

### 4.2 PUT `/api/trips/[tripId]/groups/[groupId]/activate`

Set suatu grup sebagai aktif. Grup aktif lain di trip yang sama otomatis dinonaktifkan.

**Request Body:** Tidak perlu body (atau `{ "isActive": true }`)

**Response:**
```json
{
  "success": true,
  "activatedGroupId": "uuid",
  "deactivatedGroupId": "uuid-atau-null"
}
```

**Aturan:**
- Hanya bisa mengaktifkan grup dengan status `scheduled` atau `confirmed`
- Grup yang `completed` atau `cancelled` tidak bisa diaktifkan

### 4.3 POST `/api/trips/[tripId]/groups`

Buat grup baru (departure baru) untuk suatu trip.

**Request Body:**
```json
{
  "startDate": "2026-09-15",
  "endDate": "2026-09-16",
  "maxParticipants": 10,
  "minParticipants": 1,
  "notes": "Group khusus lansia",
  "price": 1500000
}
```

**Response:** Departure object baru

### 4.4 PUT `/api/trips/[tripId]/groups/[groupId]`

Update data grup (tanggal, kuota, catatan).

**Request Body:** Field yang ingin diupdate

### 4.5 DELETE `/api/trips/[tripId]/groups/[groupId]`

Hapus grup. **Tidak boleh** jika sudah ada booking aktif (status pending/confirmed).

### 4.6 GET `/api/trips/[tripId]/groups/[groupId]/gallery`

Ambil galeri foto milik grup tertentu.

### 4.7 POST `/api/trips/[tripId]/groups/[groupId]/gallery`

Upload foto ke galeri grup. Upload media ke `/api/upload`, lalu link ke galeri.

---

## 5. Booking Flow dengan Group

### 5.1 Saat User Booking

```
User pilih trip → Lihat detail trip
  → Info: "Group aktif: 15 Sep 2026 (5/10 kuota)"
  → Pilih harga & jumlah peserta
  → Isi data booking
  → Submit → Booking masuk ke departure (group) yang isActive = true
```

**Backend booking flow (perubahan dari flow existing):**
1. Cari departure aktif: `SELECT * FROM trip_departures WHERE trip_id = :tripId AND is_active = true`
2. Jika tidak ada group aktif → tolak booking dengan error "Belum ada jadwal keberangkatan yang aktif"
3. Lanjutkan booking flow normal (atomic quota update, insert booking, dll)

### 5.2 API GET `/api/trips` (Published) — Tambahkan info group aktif

Tambahkan field di response:
```json
{
  "id": "uuid",
  "title": "Open Trip Bromo",
  "activeGroup": {
    "id": "uuid",
    "startDate": "2026-09-15",
    "endDate": "2026-09-16",
    "maxParticipants": 10,
    "quotaBooked": 5,
    "status": "scheduled"
  }
}
```

### 5.3 Halaman Detail Trip — Tampilkan Info Group

Di bagian booking card, tampilkan:
- Nama trip
- **Group aktif** berikut tanggal, kuota tersisa
- Progress bar kuota
- Badge status (To Go / Menunggu Kuota / Kuota Penuh)

---

## 6. Admin UI: Group Trip Management

### 6.1 Tabel Trip — Tombol "Grup Trip"

Di tabel `/admin/trips`, tambahkan tombol "Grup" di kolom Aksi:

```
| Judul | Tipe | Lokasi | Jadwal | Harga | Status | Aksi |
|-------|------|--------|--------|-------|--------|------|
| Bromo | Open | Malang | ...    | ...   | pub    | [✏️] [👥 Grup] [🗑️] |
```

Tombol **"👥 Grup"** → buka halaman `/admin/trips/[tripId]/groups`

### 6.2 Halaman `/admin/trips/[tripId]/groups`

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ 🏔️ Grup Trip: Open Trip Bromo Sunrise                      │
│ Kelola jadwal keberangkatan dan grup perjalanan             │
│                                                             │
│ [+ Tambah Grup Baru]                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📅 Group 1 — 15 Sep 2026                     [AKTIF ✅] │ │
│ │ Kuota: 5/10  │ Status: Scheduled  │ Booking: 3          │ │
│ │                                                         │ │
│ │ [✏️ Edit] [📷 Galeri] [🔄 Set Aktif] [🗑️ Hapus]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📅 Group 2 — 22 Sep 2026                               │ │
│ │ Kuota: 0/15  │ Status: Scheduled  │ Booking: 0          │ │
│ │                                                         │ │
│ │ [✏️ Edit] [📷 Galeri] [✅ Aktifkan] [🗑️ Hapus]        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📅 Group 3 — 05 Okt 2026                               │ │
│ │ Kuota: 12/12 │ Status: Completed │ Galeri: 24 foto     │ │
│ │                                                         │ │
│ │ [✏️ Edit] [📷 Galeri] [🗑️ Hapus]                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────┘
```

### 6.3 Modal/Form Tambah/Edit Grup

```
┌─────────────────────────────────────┐
│ Tambah Grup Baru                    │
├─────────────────────────────────────┤
│ Tanggal Berangkat *                 │
│ [____________]                      │
│                                     │
│ Tanggal Pulang *                    │
│ [____________]                      │
│                                     │
│ Kuota Maksimal *                    │
│ [10]                                │
│                                     │
│ Kuota Minimal                       │
│ [1]                                 │
│                                     │
│ Harga per Orang (Rp) *             │
│ [1.500.000]                         │
│                                     │
│ Catatan                             │
│ [________________]                  │
│                                     │
│ [Batal]              [Simpan]       │
└─────────────────────────────────────┘
```

### 6.4 Upload Foto per Grup (Galeri Grup)

Klik tombol **📷 Galeri** di card grup → buka halaman galeri grup:
- `/admin/trips/[tripId]/groups/[groupId]/gallery`
- Upload foto via drag & drop atau file picker
- Set cover photo
- Hapus foto
- Set visibilitas (publik / private untuk peserta saja)

---

## 7. User Interface Changes

### 7.1 Halaman Detail Trip (`/destinasi/[slug]`)

Di BookingCard, tampilkan info grup aktif:

```
┌─────────────────────────────┐
│ 🗓️ Jadwal: 15 Sep 2026     │
│ 📍 Group 1 — Active         │
│ ████████████░░░  5/10 kuota │
│                             │
│ Harga: Rp 1.500.000/orang  │
│                             │
│ [Booking Sekarang]          │
└─────────────────────────────┘
```

### 7.2 Checkout Flow

Saat user melakukan checkout, backend otomatis assign ke grup aktif. Tidak perlu UI pemilihan grup — user hanya memilih trip, lalu booking masuk ke grup yang aktif.

---

## 8. State Machine Grup

```
┌──────────┐
│ scheduled │ ← status awal saat grup dibuat
└────┬─────┘
     │ admin confirm
     ▼
┌───────────┐
│ confirmed  │ ← sudah ada peserta, siap berangkat
└────┬──────┘
     │ hari trip
     ▼
┌───────────┐
│ ongoing    │ ← trip sedang berlangsung
└────┬──────┘
     │ trip selesai
     ▼
┌───────────┐
│ completed  │ ← trip selesai, bisa upload galeri
└───────────┘

Saat kapan saja:
┌───────────┐
│ cancelled  │ ← dibatalkan oleh admin
└───────────┘
```

**Aturan aktif:**
- Hanya grup dengan status `scheduled` atau `confirmed` yang bisa diaktifkan
- Grup yang sudah `completed` atau `cancelled` tidak bisa diaktifkan
- Jika grup aktif di-cancel, admin harus mengaktifkan grup lain (jika ada)

---

## 9. Implementation Plan

### Phase 1: Schema & Backend (feat-011b-1)
- [ ] Tambah kolom `is_active` ke `trip_departures`
- [ ] Buat service method `activateGroup(tripId, groupId)`
- [ ] Buat service method `getAllGroups(tripId)` dengan info kuota terpakai
- [ ] Buat API routes: GET/POST/PUT/DELETE groups, PUT activate
- [ ] Update booking service: validasi harus ada grup aktif
- [ ] Update GET `/api/trips` (published): sertakan `activeGroup`

### Phase 2: Admin UI (feat-011b-2)
- [ ] Tombol "Grup" di tabel trips → navigasi ke halaman grup
- [ ] Halaman `/admin/trips/[tripId]/groups` — list grup dengan action buttons
- [ ] Modal/form tambah & edit grup
- [ ] Button "Set Aktif" / "Nonaktifkan"
- [ ] Confirm dialog untuk hapus grup

### Phase 3: Galeri per Grup (feat-011b-3)
- [ ] Halaman galeri grup di admin (`/admin/trips/[tripId]/groups/[groupId]/gallery`)
- [ ] Upload foto ke galeri grup (reuse component upload yang ada)
- [ ] Set cover photo galeri
- [ ] Tampilkan galeri grup di detail trip (opsional: hanya untuk peserta)

### Phase 4: User-facing (feat-011b-4)
- [ ] Update BookingCard: tampilkan info grup aktif + progress bar kuota
- [ ] Update checkout: auto-assign ke grup aktif
- [ ] Update `/my-trips`: tampilkan info grup (tanggal keberangkatan grup)

---

## 10. Migration SQL

```sql
-- 1. Tambah kolom is_active
ALTER TABLE trip_departures
  ADD COLUMN is_active boolean NOT NULL DEFAULT false;

-- 2. Set grup pertama di setiap trip sebagai aktif (migration data)
UPDATE trip_departures d
SET is_active = true
WHERE d.id = (
  SELECT d2.id FROM trip_departures d2
  WHERE d2.trip_id = d.trip_id
  ORDER BY d2.start_date ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM trip_departures d3
  WHERE d3.trip_id = d.trip_id
  AND d3.is_active = true
  AND d3.id != d.id
);

-- 3. Index untuk query grup aktif
CREATE INDEX idx_departures_active ON trip_departures (trip_id)
  WHERE is_active = true;

-- 4. Index untuk galeri per departure
CREATE INDEX idx_galleries_departure ON trip_galleries (departure_id)
  WHERE departure_id IS NOT NULL;
```

---

## 11. Acceptance Criteria

| # | Kriteria | Verifikasi |
|---|----------|------------|
| 1 | Admin bisa melihat daftar grup dari tabel trips | Tombol "Grup" berfungsi |
| 2 | Admin bisa membuat grup baru dengan tanggal & kuota | Form submit → data tersimpan |
| 3 | Admin bisa mengaktifkan satu grup per trip | Hanya 1 grup aktif, booking masuk ke grup aktif |
| 4 | Admin bisa edit & hapus grup | Edit mengubah data, hapus ada validasi booking |
| 5 | User booking otomatis masuk ke grup aktif | Checkout tanpa pemilihan grup |
| 6 | Jika tidak ada grup aktif, booking ditolak | Error message muncul |
| 7 | Admin bisa upload foto per grup | Galeri terpisah per grup |
| 8 | Detail trip menampilkan info grup aktif | Progress bar kuota tampil |
| 9 | `npm run lint` passing | Tidak ada error |

---

## 12. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Race condition aktifkan grup | 2 grup aktif bersamaan | Gunakan transaksi + row-level lock |
| Grup aktif di-cancel tanpa pengganti | Tidak ada grup aktif | Validate: jika cancel grup aktif, cek grup lain |
| Booking masuk ke grup yang salah | User kehilangan slot | Atomic check di booking service |
| Galeri foto tidak ter-assign ke grup | Foto tercecer | Wajib pilih grup saat upload |

---

## 13. File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/modules/trip/trip.schema.ts` | Edit | Tambah `isActive` ke `tripDepartures` |
| `src/modules/trip/trip.repository.ts` | Edit | Tambah methods: `findAllGroupsByTripId`, `activateGroup`, `findActiveGroupByTripId` |
| `src/modules/trip/trip.service.ts` | Edit | Tambah service methods group management |
| `src/app/api/trips/[tripId]/groups/route.ts` | Create | API GET/POST groups |
| `src/app/api/trips/[tripId]/groups/[groupId]/route.ts` | Create | API PUT/DELETE group |
| `src/app/api/trips/[tripId]/groups/[groupId]/activate/route.ts` | Create | API PUT activate group |
| `src/app/admin/trips/[tripId]/groups/page.tsx` | Create | Admin page manage groups |
| `src/app/admin/trips/page.tsx` | Edit | Tambah tombol "Grup" di tabel |
| `src/modules/booking/booking.service.ts` | Edit | Validasi grup aktif saat booking |
| `src/app/destinasi/[slug]/page.tsx` | Edit | Tampilkan info grup aktif |
| `src/shared/utils/migrate.ts` | Edit | Tambah migration SQL |

---

*Last updated: 6 September 2026*
