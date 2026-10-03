# Plan — feat-082 Audit Log System

Status per 2026-10-03 · Branch: (belum dibuat, usul `feat/082-audit-log`)

## Kondisi awal (fakta)

- Tabel `audit_logs` **sudah ada** di `src/db/schema/utility.ts`:
  `adminId · action(20) · entityType(100) · entityId(uuid) · oldValues(jsonb) · newValues(jsonb) · description · createdAt`.
  **Tidak ada FK ke `users`** → `adminId` nullable, aman dihapus/di-disable user.
- **Hanya 1 pemakai**: `recordTierAudit()` di `src/features/trip/trip.service.ts` (P2 tier-pricing) — 3 call site (create/update/delete `trip_price`) + `GET .../prices/history`.
- Pola yang sudah jadi (acuan implementasi):
  - `actorId(req)` lokal di `group.controller.ts:7` → `session?.user?.id ?? null`
  - swallow error (`try/catch` + `console.error`) → **audit tidak boleh menggagalkan operasi bisnis**
  - `oldValues`/`newValues` = objek field terpilih, bukan dump baris penuh
**4 jebakan yang harus dijaga**:
  1. `entityType` varchar(100) → pakai nama tabel snake_case konsisten (`trip_price`, `payment`, `user`)
  2. `entityId` **uuid** → hanya untuk entitas ber-uuid PK; key non-uuid (mis. `users.id` = cuid text, `site_settings.key` varchar) dinormalisasi di `auditService.record`: `entity_id = null` + kunci asli disimpan di `newValues.entityRef` (**TERBUKTI live**: versi pertama gagal insert `string_to_uuid` dan jejak hilang)
  3. **Jangan log data sensitif**: no password/token/API key; nomor HP/email cukup disamarkan sebagian
  4. `audit_logs` tidak boleh ikut jadi "publik" di api-policy (hanya `GET` untuk admin)

## Fase 1 — Pisahkan helper generic (fondasi)

- [x] `src/features/audit/audit.schema.ts` — re-export `auditLogs` (ikuti `contact.schema.ts`)
- [x] `src/features/audit/audit.service.ts`:
  - `recordAudit({ adminId, action, entityType, entityId?, oldValues?, newValues?, description? })`
  - `diffFields(before, after, allowlist)` → hanya field yang berubah, redaksi otomatis untuk key sensitif
  - `REDACTED_KEYS = ["password","token","secret","apiKey","authorization"]`
  - `listAudit({ entityType?, entityId?, adminId?, limit, cursor })` + `countAudit(...)` untuk pagination
- [x] `src/features/audit/audit.repository.ts` — query list (join `users` untuk nama admin), seperti `getPriceHistory`
- [x] `src/features/audit/index.ts` — barrel
- [x] **Tidak** controller dulu (fase 1 = infra saja, tanpa route → routes snapshot tidak berubah)

## Fase 2 — Backfill tier-pricing ke helper generic

- [x] Ganti `recordTierAudit` → `recordAudit` dengan `entityType: "trip_price"`
- [x] `getPriceHistory` → `listAudit({ entityType: "trip_price", entityId: ids })` (perilaku & respons **harus identik** → 0 ubah UI)
- [x] Test: `trip-api.test.ts` existing tetap hijau + test baru `audit.service.test.ts` (redaksi key, diff allowlist, toleransi error DB)

## Fase 3 — Prioritas sensitivitas ( Payments & Users )

- [x] `payment.controller.ts`: verify/reject bukti bayar, update status → `entityType: "payment"`
  - `newValues` whitelist: `status`, `verifiedBy`, `verifiedAt` (**jangan** `proofUrl` penuh → disamarkan)
- [x] `user.controller.ts`: ubah role/status/verifikasi → `entityType: "user"`
- [x] Test: mutasi admin menulis 1 baris audit; `actorId` null (tanpa session) tetap menulis dgn `adminId: null`

## Fase 4 — Endpoint baca audit log (UI)

- [x] `GET /api/admin/audit-logs?entityType=&action=&adminId=&limit=&from=&to=` (admin)
- [x] Policy: `"GET /api/admin/audit-logs": "admin"` (+ **tambah ke audit test api-auth**)
- [x] UI: `/admin/audit-log` (konten read-only): tabel waktu · admin · aksi · entitas · deskripsi ·-expand `oldValues → newValues`
- [x] Filter: entitas + aksi (+ parameter rentang tanggal & entityId di API, dipakai history tier); **tanpa** filter "ubah" (audit immutable)
- [x] Nav: grup **Konten** → `Audit Log` (`ScrollText`) di `nav-data.ts` **dan** `app-sidebar.tsx` (dua sumber!)

## Fase 5 — Modul lain (bisa setelah PR Fase 1-4)

- [x] `trip` + `trip_group` (create/update/delete/activate/complete) dan `blog` + `blog_category` (CRUD admin)
- [x] `promotion` (create/update/delete) dan `commission` (create/update/delete) — **decided skip `private_trip` proposal**: perubahan proposal hanya via admin PATCH/PUT, jejak ditolak/tANDS masih di domain booking; lift ke ticket terpisah bila dibutuhkan
- [x] `site_settings` (kunci non-uuid otomatis jadi `entityRef`)
- [x] `user` hapus (action `delete`) — sudah ikut di Fase 3
- [x] Tiap modul = 1 commit terpisah (konvensi repo): 5a trip+group · 5b blog+kategori · 5c promotion+commission+settings

## Batasan & keputusan

- **Tidak** menulis audit untuk operasi public/user (checkout, ulasan, newsletter) kecuali relevan → volume/log noise
- **Tidak** UI edit/hapus audit log → append-only
- Retensi: belum ada. Usulan: housekeeping job/cron hapus > 180 hari **sebagai ticket terpisah** (feat baru), jangan digabung sini
- `oldValues`/`newValues` dibatasi allowlist field, bukan `SELECT *` (jsonb tidak boleh membengkak)

## Verifikasi (tiap fase)

- [x] `npx tsc --noEmit` → 0
- [x] `npm run lint` → 0 error
- [x] `npx vitest run` → hijau (baseline 252, +test baru)
- [x] `npm run build` → hijau
- [x] `npm run check:routes` → snapshot ikut saat Fase 4 (+1 route)
- [x] `npx vitest run src/lib/auth` → audit policy hijau
- [x] `node scripts/check-structure.ts` → all rules within baseline (R5: route tipis wajib delegation)
- [x] Live smoke: ubah harga tier → `GET /api/admin/audit-logs` menampilkan 1 baris `update · trip_price · 350000→375000`

## Out of scope

- Retensi/housekeeping (ticket terpisah)
- Notifikasi real-time saat ada perubahan sensitif (Slack/email)
- Impor log dari sistem lama
- UI untuk pengguna non-admin