# Spesifikasi Fitur: Sistem Referral & Komisi

> **Fitur ID:** feat-073 (User Referral System)
> **Status:** Draft
> **Tanggal:** 6 September 2026
> **Depends on:** feat-021 (auth), feat-030 (booking)

---

## 1. Ringkasan Eksekutif

Setiap user yang terdaftar akan memiliki **kode referral unik** yang ditampilkan di halaman profile. Kode ini bisa dibagikan ke orang lain. Ketika orang lain melakukan booking dan memasukkan kode referral tersebut, sistem akan:

1. Mencatat bahwa user tersebut direferensikan oleh pemilik kode
2. Membuat record referral dengan status `pending`
3. Menampilkan history referral di halaman profile pemilik kode

**Note:** Fitur komisi (pembayaran ke agen) sudah ada di admin (`feat-047`), spesifikasi ini fokus pada:
- Tampilan kode referral di profile
- Input kode referral di checkout
- History referral di profile

---

## 2. User Stories

### 2.1 Sebagai User yang Punya Kode Referral

```
SU-01: Saya ingin melihat kode referral saya di halaman profile
  - Kode referral ditampilkan dalam card terpisah
  - Ada tombol "Salin" untuk copy ke clipboard
  - Ada link "Bagikan" untuk share via WhatsApp/etc

SU-02: Saya ingin melihat history referral saya
  - Siapa yang menggunakan kode saya
  - Status referral (pending/converted/paid)
  - Tanggal penggunaan
  - Total komisi yang diperoleh (jika ada)
```

### 2.2 Sebagai User yang Melakukan Booking

```
SU-03: Saya ingin memasukkan kode referral saat checkout
  - Ada input field "Kode Referral (Opsional)" di halaman checkout
  - Validasi kode referral real-time
  - Jika valid, tampilkan nama pemilik kode
  - Jika tidak valid, tampilkan error message
  - Kode referral tidak memberikan diskon (berbeda dengan voucher)
```

### 2.3 Sebagai Admin

```
SU-04: Saya ingin melihat semua referral di admin
  - Sudah ada di /admin/commissions
  - Filter by status, date range
  - Approve/reject referral
```

---

## 3. Database Schema (Existing)

Schema sudah ada di `src/modules/referral/referral.schema.ts`:

### 3.1 Tabel `users` (sudah ada)

```sql
-- Kolom yang relevan:
referral_code VARCHAR(50) UNIQUE  -- Kode referral unik per user
referred_by TEXT                   -- User ID yang mereferensikan
loyalty_points INTEGER DEFAULT 0   -- Poin loyalitas
```

### 3.2 Tabel `referrals` (sudah ada)

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referrer_id TEXT NOT NULL,        -- User ID pemilik kode referral
  referred_user_id TEXT,            -- User ID yang menggunakan kode
  booking_id UUID,                  -- Booking yang menggunakan referral
  status VARCHAR(20) DEFAULT 'pending',  -- pending|converted|paid
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3.3 Tabel `commissions` (sudah ada)

```sql
CREATE TABLE commissions (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,           -- User ID agen/pemilik referral
  referral_id UUID,                 -- Link ke referrals table
  booking_id UUID NOT NULL,         -- Booking yang menghasilkan komisi
  rule_id UUID,                     -- Commission rule yang diterapkan
  amount VARCHAR(50) NOT NULL,      -- Jumlah komisi
  status VARCHAR(20) DEFAULT 'pending',  -- pending|approved|paid|cancelled
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API Endpoints

### 4.1 GET `/api/user/referral` — Ambil Kode Referral & Stats

**Auth:** Required (session)

**Response:**
```json
{
  "referralCode": "USER-001",
  "stats": {
    "totalReferred": 5,
    "convertedReferred": 3,
    "pendingReferred": 2,
    "totalCommission": 150000
  }
}
```

**Implementation:**
```typescript
// GET /api/user/referral
import { auth } from "@/modules/auth/auth.config";
import { db } from "@/shared/db";
import { referrals, commissions } from "@/modules/referral/referral.schema";
import { users } from "@/modules/auth/auth.schema";
import { eq, count, sum } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user's referral code
  const [user] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  // Get referral stats
  const [stats] = await db
    .select({
      totalReferred: count(),
      // Count by status
    })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

  // Get total commission
  const [commissionStats] = await db
    .select({
      totalCommission: sum(commissions.amount),
    })
    .from(commissions)
    .where(eq(commissions.agentId, userId));

  return NextResponse.json({
    referralCode: user?.referralCode,
    stats: {
      totalReferred: stats?.totalReferred ?? 0,
      totalCommission: Number(commissionStats?.totalCommission ?? 0),
    },
  });
}
```

### 4.2 GET `/api/user/referral/history` — Ambil History Referral

**Auth:** Required (session)

**Query Params:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "referredUserName": "Budi Lansia",
      "referredUserEmail": "budi@email.com",
      "bookingCode": "OTL-20260906-001",
      "tripName": "Wisata Jogja 3H2M",
      "status": "converted",
      "commissionAmount": 50000,
      "commissionStatus": "approved",
      "createdAt": "2026-09-06T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

**Implementation:**
```typescript
// GET /api/user/referral/history
export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "1");
  const limit = parseInt(url.searchParams.get("limit") ?? "10");
  const offset = (page - 1) * limit;

  const userId = session.user.id;

  // Get referrals with user and booking info
  const history = await db
    .select({
      id: referrals.id,
      referredUserId: referrals.referredUserId,
      bookingId: referrals.bookingId,
      status: referrals.status,
      createdAt: referrals.createdAt,
      // Join users for name
      referredUserName: users.name,
      referredUserEmail: users.email,
      // Join bookings for code
      bookingCode: bookings.bookingCode,
      // Join trip for name
      tripName: trips.title,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredUserId, users.id))
    .leftJoin(bookings, eq(referrals.bookingId, bookings.id))
    .leftJoin(tripDepartures, eq(bookings.departureId, tripDepartures.id))
    .leftJoin(trips, eq(tripDepartures.tripId, trips.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt))
    .limit(limit)
    .offset(offset);

  // Get commission for each referral
  const referralIds = history.map((h) => h.id);
  const commissionMap = await getCommissionsByReferralIds(referralIds);

  // Map data
  const mappedHistory = history.map((h) => ({
    id: h.id,
    referredUserName: h.referredUserName,
    referredUserEmail: h.referredUserEmail,
    bookingCode: h.bookingCode,
    tripName: h.tripName,
    status: h.status,
    commissionAmount: commissionMap.get(h.id)?.amount ?? 0,
    commissionStatus: commissionMap.get(h.id)?.status ?? null,
    createdAt: h.createdAt,
  }));

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(referrals)
    .where(eq(referrals.referrerId, userId));

  return NextResponse.json({
    history: mappedHistory,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
```

### 4.3 POST `/api/checkout/validate-referral` — Validasi Kode Referral

**Auth:** Required (session)

**Request Body:**
```json
{
  "referralCode": "USER-001"
}
```

**Response:**
```json
{
  "valid": true,
  "referrerName": "Siti Agen",
  "referrerId": "user-id-123"
}
```

**Implementation:**
```typescript
// POST /api/checkout/validate-referral
export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { referralCode } = await req.json();

  if (!referralCode || typeof referralCode !== "string") {
    return NextResponse.json({ error: "Kode referral tidak valid" }, { status: 400 });
  }

  // Find user with this referral code
  const [referrer] = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.referralCode, referralCode.trim().toUpperCase()))
    .limit(1);

  if (!referrer) {
    return NextResponse.json({ error: "Kode referral tidak ditemukan" }, { status: 404 });
  }

  // Prevent self-referral
  if (referrer.id === session.user.id) {
    return NextResponse.json({ error: "Tidak bisa menggunakan kode referral sendiri" }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    referrerName: referrer.name,
    referrerId: referrer.id,
  });
}
```

### 4.4 POST `/api/checkout` (Update) — Simpan Referral di Booking

**Update existing checkout endpoint** untuk menyimpan referral:

```typescript
// Di POST /api/checkout, tambahkan:
const { referralCode } = body;

// ... existing validation ...

// Validate referral if provided
let referrerId: string | null = null;
if (referralCode && typeof referralCode === "string" && referralCode.trim()) {
  const code = referralCode.trim().toUpperCase();
  const [referrer] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, code))
    .limit(1);

  if (referrer && referrer.id !== userId) {
    referrerId = referrer.id;
  }
}

// ... existing booking creation ...

// Create referral record if referrer exists
if (referrerId) {
  await db.insert(referrals).values({
    referrerId,
    referredUserId: userId,
    bookingId: booking.id,
    status: "pending",
  });
}
```

---

## 5. Frontend Components

### 5.1 Profile Page Updates (`/profile`)

#### 5.1.1 Update `ProfileStats.jsx`

**Current State:**
```jsx
const stats = [
  { label: "Poin Loyalitas", icon: Coins, comingSoon: true },
  { label: "Kode Referral", icon: Ticket, comingSoon: true },
  { label: "Anggota Sejak", value: memberSince, icon: CalendarDays },
];
```

**New State:**
```jsx
const [referralStats, setReferralStats] = useState(null);

useEffect(() => {
  fetch("/api/user/referral")
    .then((res) => res.json())
    .then((data) => setReferralStats(data))
    .catch(() => {});
}, []);

const stats = [
  { 
    label: "Poin Loyalitas", 
    icon: Coins, 
    value: user?.loyaltyPoints ?? 0,
    comingSoon: true  // Loyalty belum diimplementasi
  },
  { 
    label: "Kode Referral", 
    icon: Ticket, 
    value: referralStats?.referralCode ?? "-",
    isReferral: true  // Flag untuk render copy button
  },
  { 
    label: "Total Referral", 
    icon: Users, 
    value: referralStats?.stats?.totalReferred ?? 0
  },
  { 
    label: "Anggota Sejak", 
    value: memberSince, 
    icon: CalendarDays 
  },
];
```

#### 5.1.2 New Component: `ReferralCard.jsx`

**Location:** `src/components/profile/ReferralCard.jsx`

```jsx
"use client";

import { useState } from "react";
import { Copy, Check, Share2, ExternalLink } from "lucide-react";

export default function ReferralCard({ referralCode, stats }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hai! Aku lagi cari trip seru nih. Pakai kode referral aku ${referralCode} ya biar kita bisa dapat bonus bareng! 🎉\n\nDaftar di: ${window.location.origin}/register?ref=${referralCode}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareLink = () => {
    const link = `${window.location.origin}/register?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    alert("Link referral sudah disalin!");
  };

  if (!referralCode) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Kode Referral</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Bagikan kode ini ke temanmu. Mereka akan tercatat sebagai referral kamu.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition-colors"
          >
            <Share2 size={12} />
            WhatsApp
          </button>
          <button
            onClick={shareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={12} />
            Link
          </button>
        </div>
      </div>

      {/* Referral Code Display */}
      <div className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-[#FEF6E7] border border-[#F3E2C0]">
        <div className="flex-1">
          <p className="text-2xl font-mono font-bold text-[#c47d12] tracking-wider">
            {referralCode}
          </p>
        </div>
        <button
          onClick={copyCode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            copied
              ? "bg-green-500 text-white"
              : "bg-[#F49D1A] text-white hover:bg-[#c47d12]"
          }`}
        >
          {copied ? (
            <>
              <Check size={14} />
              Tersalin!
            </>
          ) : (
            <>
              <Copy size={14} />
              Salin
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Total Referral</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.totalReferred ?? 0}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500">Total Komisi</p>
            <p className="text-lg font-bold text-slate-900">
              Rp {(stats.totalCommission ?? 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 5.1.3 New Component: `ReferralHistory.jsx`

**Location:** `src/components/profile/ReferralHistory.jsx`

```jsx
"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Menunggu",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
    icon: Clock,
  },
  converted: {
    label: "Tercatat",
    color: "text-green-600",
    bg: "bg-green-50",
    icon: CheckCircle,
  },
  paid: {
    label: "Dibayar",
    color: "text-blue-600",
    bg: "bg-blue-50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "text-red-600",
    bg: "bg-red-50",
    icon: XCircle,
  },
};

export default function ReferralHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/referral/history?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch referral history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return `Rp ${(amount ?? 0).toLocaleString("id-ID")}`;
  };

  if (loading && history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
        <h2 className="text-base font-bold text-slate-900">History Referral</h2>
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-slate-50">
              <div className="h-10 w-10 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="text-base font-bold text-slate-900">History Referral</h2>
      <p className="mt-0.5 text-xs text-slate-400">
        Daftar orang yang menggunakan kode referral kamu.
      </p>

      {history.length === 0 ? (
        <div className="mt-6 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Clock size={20} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Belum ada referral</p>
          <p className="text-xs text-slate-400 mt-1">
            Bagikan kode referral kamu untuk mulai mendapat komisi!
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {history.map((item) => {
            const status = statusConfig[item.status] ?? statusConfig.pending;
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="border border-slate-100 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-[#FEF6E7] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#c47d12]">
                      {(item.referredUserName ?? "U").charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {item.referredUserName ?? "User"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {item.tripName ?? "-"} · {formatDate(item.createdAt)}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${status.color} ${status.bg}`}
                  >
                    <status.icon size={12} />
                    {status.label}
                  </span>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-500">Kode Booking</p>
                        <p className="font-semibold text-slate-900">
                          {item.bookingCode ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Trip</p>
                        <p className="font-semibold text-slate-900">
                          {item.tripName ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Komisi</p>
                        <p className="font-semibold text-slate-900">
                          {formatCurrency(item.commissionAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status Komisi</p>
                        <p className="font-semibold text-slate-900">
                          {item.commissionStatus ?? "Belum ada"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-3">
              <p className="text-xs text-slate-400">
                Halaman {pagination.page} dari {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, page + 1))
                  }
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### 5.1.4 Update Profile Page (`/profile/page.jsx`)

```jsx
// Tambahkan import
import ReferralCard from "@/components/profile/ReferralCard";
import ReferralHistory from "@/components/profile/ReferralHistory";

// Di dalam return, setelah ProfileStats:
<div className="mt-4 space-y-4 sm:space-y-5">
  <ProfileHeader user={session.user} />
  <ProfileStats user={session.user} />
  <ProfileInfoCard user={session.user} />
  
  {/* Referral Section */}
  <ReferralCard 
    referralCode={session.user.referralCode} 
    stats={referralStats} 
  />
  <ReferralHistory />
  
  <LogoutButton />
</div>
```

### 5.2 Checkout Page Updates

#### 5.2.1 New Component: `ReferralInput.jsx`

**Location:** `src/components/checkout/ReferralInput.jsx`

```jsx
"use client";

import { useState } from "react";
import { Check, X, Loader2, AlertCircle } from "lucide-react";

export default function ReferralInput({ 
  referralCode, 
  setReferralCode, 
  appliedReferral, 
  referralError, 
  onApply, 
  onRemove 
}) {
  const [isValidating, setIsValidating] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-bold text-gray-900">Kode Referral</h2>
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold">
          Opsional
        </span>
      </div>
      
      <p className="text-xs text-gray-400">
        Punya kode referral dari teman? Masukkan di sini untuk mencatat referral.
      </p>

      {appliedReferral ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <div>
              <span className="text-sm font-semibold text-green-700">
                {appliedReferral.code}
              </span>
              <p className="text-[10px] text-green-600">
                Oleh: {appliedReferral.referrerName}
              </p>
            </div>
          </div>
          <button 
            onClick={onRemove} 
            className="text-green-600 hover:text-green-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Masukkan kode referral"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 uppercase"
          />
          <button
            onClick={onApply}
            disabled={!referralCode.trim()}
            className="bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Pakai
          </button>
        </div>
      )}
      
      {referralError && (
        <div className="flex items-center gap-2 text-xs text-red-500">
          <AlertCircle size={12} />
          {referralError}
        </div>
      )}
    </div>
  );
}
```

#### 5.2.2 Update `useCheckout.js` Hook

```javascript
// Tambahkan state untuk referral
const [state, setState] = useState({
  // ... existing state ...
  referralCode: "",
  appliedReferral: null,
  referralError: "",
});

// Tambahkan functions
const setReferralCode = useCallback((code) => {
  setState((prev) => ({ ...prev, referralCode: code, referralError: "" }));
}, []);

const applyReferral = useCallback(async () => {
  const code = state.referralCode.trim();
  if (!code) return;

  setState((prev) => ({ ...prev, referralError: "" }));

  try {
    const res = await fetch("/api/checkout/validate-referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referralCode: code }),
    });

    const data = await res.json();

    if (!res.ok) {
      setState((prev) => ({
        ...prev,
        referralError: data.error || "Kode referral tidak valid",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      appliedReferral: {
        code: code.toUpperCase(),
        referrerName: data.referrerName,
        referrerId: data.referrerId,
      },
      referralError: "",
    }));
  } catch (error) {
    setState((prev) => ({
      ...prev,
      referralError: "Gagal memvalidasi kode referral",
    }));
  }
}, [state.referralCode]);

const removeReferral = useCallback(() => {
  setState((prev) => ({
    ...prev,
    referralCode: "",
    appliedReferral: null,
    referralError: "",
  }));
}, []);

// Update goToPayment untuk include referralCode
const goToPayment = useCallback(async () => {
  // ... existing code ...

  const snapshot = {
    // ... existing fields ...
    referralCode: state.appliedReferral?.code || null,
  };

  // ... rest of existing code ...
}, [state, getTotal]);

// Update reset untuk include referral
const reset = useCallback(() => {
  setState({
    // ... existing state ...
    referralCode: "",
    appliedReferral: null,
    referralError: "",
  });
}, []);

// Tambahkan ke return
return {
  // ... existing return ...
  referralCode: state.referralCode,
  appliedReferral: state.appliedReferral,
  referralError: state.referralError,
  setReferralCode,
  applyReferral,
  removeReferral,
};
```

#### 5.2.3 Update `DetailsStep.jsx`

```jsx
// Tambahkan import
import ReferralInput from "./ReferralInput";

// Di dalam return, setelah VoucherCard:
<div className="space-y-6">
  <BookingSummary destination={checkout.destination} />
  
  {/* ... CustomerForm ... */}
  
  {/* ... MeetingPointInfo ... */}
  
  <VoucherCard ... />
  
  {/* Tambahkan ReferralInput */}
  <ReferralInput
    referralCode={checkout.referralCode}
    setReferralCode={checkout.setReferralCode}
    appliedReferral={checkout.appliedReferral}
    referralError={checkout.referralError}
    onApply={checkout.applyReferral}
    onRemove={checkout.removeReferral}
  />
</div>
```

---

## 6. Validasi & Rules

### 6.1 Referral Code Validation Rules

| Rule | Description |
|------|-------------|
| Case Insensitive | Kode referral case-insensitive, disimpan uppercase |
| Self-referral | User tidak boleh menggunakan kode referral sendiri |
| Unique | Satu booking hanya bisa pakai satu kode referral |
| Existing User | Hanya user yang sudah login yang bisa pakai referral |
| Code Format | Alphanumeric + dash, max 50 chars |

### 6.2 Referral Status Lifecycle

```
pending → converted → paid
    ↓
cancelled (jika booking dibatalkan)
```

| Status | Trigger | Description |
|--------|---------|-------------|
| `pending` | Booking dibuat | Referral tercatat, menunggu pembayaran |
| `converted` | Pembayaran berhasil | Booking confirmed, referral terkonversi |
| `paid` | Komisi dicairkan | Agen sudah menerima pembayaran |
| `cancelled` | Booking dibatalkan | Referral dibatalkan |

---

## 7. UI/UX Specifications

### 7.1 Profile Page — Referral Card

```
┌─────────────────────────────────────────────────────┐
│  Kode Referral                          [WhatsApp] [Link] │
│  Bagikan kode ini ke temanmu.                       │
│  Mereka akan tercatat sebagai referral kamu.        │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  USER-001                          [Salin]   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │  Total Referral   │  │  Total Komisi    │        │
│  │       5           │  │   Rp 150.000     │        │
│  └──────────────────┘  └──────────────────┘        │
└─────────────────────────────────────────────────────┘
```

### 7.2 Profile Page — Referral History

```
┌─────────────────────────────────────────────────────┐
│  History Referral                                   │
│  Daftar orang yang menggunakan kode referral kamu.  │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  [B]  Budi Lansia                           │   │
│  │      Wisata Jogja 3H2M · 6 Sep 2026         │   │
│  │                      [✓ Tercatat]      [▼]   │   │
│  └─────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────┐   │
│  │  [A]  Andi Wijaya                           │   │
│  │      Trip Bromo 2H1M · 5 Sep 2026           │   │
│  │                      [⏳ Menunggu]      [▼]   │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Halaman 1 dari 3          [Sebelumnya] [Selanjutnya]│
└─────────────────────────────────────────────────────┘
```

### 7.3 Checkout Page — Referral Input

```
┌─────────────────────────────────────────────────────┐
│  Kode Referral                    [Opsional]        │
│  Punya kode referral dari teman? Masukkan di sini   │
│  untuk mencatat referral.                           │
│                                                     │
│  ┌─────────────────────────────────┐  ┌─────────┐  │
│  │  USER-001                       │  │  Pakai   │  │
│  └─────────────────────────────────┘  └─────────┘  │
│                                                     │
│  Atau setelah valid:                                │
│  ┌─────────────────────────────────────────────┐   │
│  │  ✓ USER-001                                 │   │
│  │    Oleh: Siti Agen                    [×]   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 8. Testing Checklist

### 8.1 Unit Tests

- [ ] Referral code validation (valid/invalid/self-referral)
- [ ] Referral creation on checkout
- [ ] Referral stats calculation
- [ ] Commission calculation based on rules

### 8.2 Integration Tests

- [ ] GET `/api/user/referral` returns correct data
- [ ] GET `/api/user/referral/history` with pagination
- [ ] POST `/api/checkout/validate-referral` validates correctly
- [ ] POST `/api/checkout` with referralCode creates referral record

### 8.3 E2E Tests

- [ ] User can see referral code on profile page
- [ ] User can copy referral code
- [ ] User can share referral via WhatsApp
- [ ] Checkout page shows referral input
- [ ] Referral code validation works in checkout
- [ ] Referral history displays correctly
- [ ] Pagination works for referral history

---

## 9. Implementation Phases

### Phase 1: Core Backend (Day 1)

1. Create API endpoints:
   - `GET /api/user/referral`
   - `GET /api/user/referral/history`
   - `POST /api/checkout/validate-referral`

2. Update checkout endpoint to handle referral

### Phase 2: Profile UI (Day 2)

1. Create `ReferralCard.jsx` component
2. Create `ReferralHistory.jsx` component
3. Update `ProfileStats.jsx`
4. Update profile page

### Phase 3: Checkout UI (Day 3)

1. Create `ReferralInput.jsx` component
2. Update `useCheckout.js` hook
3. Update `DetailsStep.jsx`

### Phase 4: Testing (Day 4)

1. Write unit tests
2. Write integration tests
3. Write E2E tests
4. Manual testing

---

## 10. Future Enhancements (Out of Scope)

1. **Commission Rules Engine** — Dynamic commission calculation based on trip, agent level, etc.
2. **Referral Tier System** — Multi-level referral (A refer B, B refer C)
3. **Real-time Notifications** — Push notification when referral converts
4. **Referral Leaderboard** — Gamification for top referrers
5. **Automated Payout** — Integration with payment gateway for commission payout

---

## 11. References

- Existing schema: `src/modules/referral/referral.schema.ts`
- Existing repository: `src/modules/referral/referral.repository.ts`
- Admin commissions: `src/app/admin/commissions/page.tsx`
- Profile page: `src/app/profile/page.jsx`
- Checkout page: `src/app/checkout/page.jsx`
- useCheckout hook: `src/lib/hooks/useCheckout.js`

---

*Document created: 6 September 2026*
*Author: AI Assistant*
*Status: Draft — Menunggu review*
