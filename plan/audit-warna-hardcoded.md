# 🎨 Audit Warna Hardcoded → Token Semantik

**Status:** ☐ belum mulai · audit selesai 2026-10-11 · branch `design/tweakcn`
**Cakupan:** 431 file (`.tsx`/`.ts`/`.css` di `src/`) · **116 file terdampak** · **±2.850 temuan** (beberapa baris masuk ≥1 kategori)
**Baseline saat audit:** `npm run lint` 0 errors/80 warnings · `npm run build` sukses · tema TweakCN (`--primary: #F49D1A`, radius `0.5rem`)

## Cara mencentang (Definition of Done per item)

Centang `[x]` hanya jika SEMUA:
1. Seluruh situs pada item diganti ke token yang dituju
2. `grep` verifikasi (per pola di bawah) **tidak ada sisa**
3. `npm run lint` tetap **0 errors** (warnings ≤ baseline 80)
4. `npm run build` sukses
5. Review visual area terdampak (admin &/atau landing)

### Legenda klasifikasi

| Kode | Arti |
|---|---|
| 🟢 **A** | Drop-in — pengganti **identik**, tampilan tak berubah |
| 🟡 **B** | Perubahan halus — aman, tapi review visual |
| 🔴 **C/D** | Butuh keputusan desain / tak punya token |
| ⚪ | Sudah keputusan: **hex tetap** (tidak disentuh) |

---

## Fase 1 — Drop-in (tampilan identik) 🟢

- [x] **1.1** Primary `#F49D1A` → `bg-/text-/border-/shadow-primary` — **642 situs / 90 file**
      *(nilai token persis `#f49d1a`; `shadow-[#F49D1A]/20` → `shadow-primary/20`)*
- [x] **1.2** Focus `ring-[#F49D1A]`/`ring-orange-*` → `ring-ring/30` — **121 / 34**
      *(token `--ring` kini = `#F49D1A`, jadi setara; subset dari 1.1)*
- [x] **1.3** `text-white` di atas primary → `text-primary-foreground` — **72 / 43**
      *(`#FFFFFF` → `#FDFDFD`, imperceptible. **Hati-hati**: `text-white` yang BUKAN di atas primary — navy/teal/footer/merah — tetap putih)*
- [x] **1.4** `bg-white` → `bg-background` / `bg-card` — **252 / 87**
      *(`#FFFFFF` → `#FCFCFC`, imperceptible; kartu/kontainer → `bg-card`, halaman → `bg-background`)*
- [x] **1.5** Verifikasi Fase 1:
      - `grep -rE "#F49D1A|bg-white" src --include="*.tsx" --include="*.ts"` → 0 (kecuali inline styles, constants, email templates yang sengaja dibiarkan)
      - `npm run lint` 0 errors · `npm run build` sukses
      - Spot-check: tombol primary, spinner loading `my-trips`, navbar, tabel admin

## Fase 2 — Gerbang keputusan 🔴 (kerjakan setelah keputusan)

- [x] **2.0 KEPUTUSAN-A**: token hover primary — **59 situs / 35 file** `hover:bg-[#c47d12]`
      **Dipilih: (b) `hover:bg-primary/85`** — pakai opacity, tanpa token baru (UX: hover jadi agak pudar)
- [x] **2.0b KEPUTUSAN-B**: kategori meta — **487 situs / 89 file** `text-slate/gray-500|400`
      **Dipilih: (c) Terima gelap** — migrasi ke `text-muted-foreground` (`#202020`), kontras tinggi sengaja
- [x] **2.1** `#c47d12` di className arbitrary → `*-primary/85` — **54 / 35** (3 sisa: konstanta JS & inline style handler, dibiarkan)
- [x] **2.2** `text-slate/gray-500|400` → `text-muted-foreground` — **487 / 89** ✓
- [x] **2.3** Verifikasi Fase 2: lint 0E/80W · build sukses · grep 0 sisa di className

## Fase 3 — Perubahan halus-menengah 🟡🔴

- [ ] **3.1** `text-slate/gray-900`, `text-black` → `text-foreground` — **220 / 74** (`#0F172A`→`#171717`, nyaris sama)
- [ ] **3.2** `text-slate/gray-600` → `text-foreground` atau `text-muted-foreground` (pilih per konteks) — **135 / 55**
- [ ] **3.3** `bg-slate/gray-50|100` → `bg-muted` — **241 / 77** (`#F8FAFC`→`#EDEDED`, halus)
- [ ] **3.4** `border-slate/gray-100..300` → `border-border` / `border-input` — **407 / 81**
      *Catatan: `border-slate-300` (`#CBD5E1`) → `border-input` (`#F6F6F6`) membuat garis form **lebih samar** — review per halaman*
- [ ] **3.5** `*-red-500/600` → `*-destructive` (`#EF4444`→`#CA3214`, merah bergeser nyata) — **104 / 43**
- [ ] **3.6** Verifikasi Fase 3 (lint + build + review form, badge, kartu, tabel)

## Fase 4 — TIDAK disentuh (keputusan: hex tetap) ⚪

- [x] **4.1** Navy `#0D238E`/`#12239E` — 4 / 1 — *inventarisasi ✓, keputusan 3c: tanpa token*
- [x] **4.2** Teal `#1CA6B7`/`#20B2AA` — 82 / 23 — *inventarisasi ✓, keputusan 3c: tanpa token*
- [x] **4.3** Footer `#0B0F19` — 1 / 1 — *spesifik komponen (design.md)*
- [x] **4.4** Tint `#FEF6E7` & varian `#E08A0E` — 14 / 13 — *tak ada token, hex tetap*
- [x] **4.5** Kelas `orange-100/800` — 9 / 4 — *shade lembut tanpa token, hex tetap*

---

## Prioritas lokasi (57% temuan di admin)

| # | File | Temuan |
|---|---|---:|
| 1 | `src/app/(admin)/admin/trips/[id]/groups/page.tsx` | 177 |
| 2 | `src/app/(admin)/admin/trips/page.tsx` | 120 |
| 3 | `src/app/(admin)/admin/private-trips/[id]/page.tsx` | 91 |
| 4 | `src/app/(admin)/admin/components/icon-picker.tsx` | 81 |
| 5 | `src/app/(admin)/admin/users/page.tsx` | 79 |
| 6 | `src/app/(admin)/admin/bookings/page.tsx` | 63 |
| 7 | `src/app/(admin)/admin/page.tsx` | 59 |
| 8–12 | promotions, vendors, horeca, blogs, `features/checkout/PaymentStep` | 57–49 |

**Sebaran direktori:** `admin/` 1361 · `features/checkout` 227 · `features/trip` 147 · `features/my-trips` 133 · `features/private-trip` 133 · `features/landing` 129 · `features/profile` 80 · lainnya <50.

## Contoh penggantian (Fase 1)

```tsx
// sebelum
className="bg-[#F49D1A] text-white shadow-[#F49D1A]/20"
className="border-2 border-[#F49D1A]/30 border-t-[#F49D1A] rounded-full animate-spin"
className="focus:ring-2 focus:ring-[#F49D1A]/30"
className="min-h-screen bg-white"

// sesudah (identik)
className="bg-primary text-primary-foreground shadow-primary/20"
className="border-2 border-primary/30 border-t-primary rounded-full animate-spin"
className="focus:ring-2 focus:ring-ring/30"
className="min-h-screen bg-background"
```

## Catatan

- Audit memakai regex terhadap hex Tailwind arbitrary (`[...]`) + kelas palet (`slate/gray/red/orange`); file e2e/`visual/` di luar cakupan.
- `src/components/ui/*` (shadcn) sudah memakai token semantik — tidak masuk daftar.
- Setiap fase sebaiknya **satu PR terpisah** (konvensi repo) agar review visual terisolasi.
- Angka adalah hasil hitungan saat audit (2026-10-11); jumlah sisa bisa diulang dengan skrip regex serupa bila perlu.
