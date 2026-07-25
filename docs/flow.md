# ERD — Open Trip Lansia (OTL)


## 💠 Flow Diagram — Alur Sistem OTL

### 1️⃣ Flow User — Cari → Booking → Bayar

```mermaid
flowchart TD
    A([User Buka Website]) --> B{Ada Akun?}
    B -->|Tidak| C[Register / Login]
    B -->|Ya| D[Login]
    C --> D

    D --> E[Homepage - Hero Section]
    E --> F[Cari Trip via Search / Filter Minat]
    F --> G[Lihat Hasil Pencarian ala Netflix]

    G --> H[Pilih Trip - Lihat Detail]
    H --> I[Lihat Itinerary, Harga, Kuota, Hotel, Destinasi]

    I --> J{Open Trip / Private Trip?}
    
    J -->|Open Trip| K[Pilih Harga & Slot Kuota]
    J -->|Private Trip| L[Flow Private Trip]

    K --> M[Isi Data Booking]
    M --> N[Tambah Peserta - tanpa KTP]
    N --> O[Isi Deklarasi Kesehatan]
    O --> P[Setujui S&K]

    P --> Q[Pilih Payment Gateway]
    Q --> R[Bayar - Midtrans / Xendit / Doku]
    R --> S{Payment?}
    S -->|Sukses| T[Booking Confirmed ✅]
    S -->|Gagal| U[Booking Pending - Retry]

    T --> V[Notifikasi ke User & Admin]
    V --> W([Ikut Trip di Hari H])

    L --> L1[Flow Private Trip - lihat bawah]
```

### 2️⃣ Flow Private Trip

```mermaid
flowchart TD
    A([User Pilih Private Trip]) --> B[Pilih Destinasi & Durasi Kustom]
    B --> C[Input Jumlah Peserta & Kebutuhan Khusus]
    C --> D[Submit Request Private Trip]

    D --> E[Admin Review Request]
    E --> F[Buat Proposal + Estimasi Harga]
    F --> G[Kirim Proposal ke User]

    G --> H{User Setuju?}
    H -->|Ya| I[Booking & Bayar DP / Lunas]
    H -->|Tidak / Revisi| J[Admin Revisi Proposal]

    I --> K([Trip Private Berjalan])
    J --> F
```

### 3️⃣ Flow Agen — Referral → Komisi → Cair

```mermaid
flowchart TD
    A([User Daftar jadi Agen]) --> B[Dapat Kode Referral Unik]
    B --> C[Share Link ke Teman / Keluarga]

    C --> D[Teman Klik Link & Daftar]
    D --> E[Teman Booking Trip]
    E --> F{Booking Selesai?}

    F -->|Ya| G[Komisi Otomatis Tercatat]
    F -->|Tidak| H[Referral Pending]

    G --> I[Agen Lihat Dashboard Komisi - TanStack Table]
    I --> J[Agen Ajukan Pencairan]

    J --> K[Admin Validasi Komisi]
    K --> L{Valid?}
    L -->|Ya| M[Admin Setujui & Cairkan]
    L -->|Tidak| N[Tolak - Beri Alasan]

    M --> O([Agen Terima Dana])
```

### 4️⃣ Flow Admin — CRUD Trip + Manajemen

```mermaid
flowchart TD
    A([Admin Login]) --> B[Dashboard Admin - TanStack Table]

    B --> C{Menu Admin}
    C --> D[CRUD Paket Open Trip]
    C --> E[Atur Itinerary]
    C --> F[Atur Harga & Kuota]
    C --> G[Atur Destinasi & Transportasi]
    C --> H[Atur Hotel & Akomodasi]
    C --> I[Manajemen HORECA & Vendor]
    C --> J[Manajemen Galeri Trip]
    C --> K[Dynamic Promo Engine]
    C --> L[Moderasi Ulasan]
    C --> M[CMS Blog]
    C --> N[Validasi Komisi Agen]

    D --> D1[Create / Edit / Delete Trip]
    D1 --> D2[Publikasi Trip - Set Status Draft → Published]

    E --> E1[Tambah Aktivitas Harian per Trip]

    F --> F1[Tambah Harga, Kuota, Early Bird]

    G --> G1[Pilih Destinasi & Vendor Transport]

    H --> H1[Pilih Hotel / Resto dari Database HORECA]

    I --> I1[Tambah / Edit Database HORECA]
    I --> I2[Tambah / Edit Vendor]

    K --> K1[Buat Kode Promo]
    K1 --> K2[Set Diskon % / Nominal, Masa Berlaku]

    L --> L1[Setujui / Tolak Ulasan - Filter 4-5 Bintang]

    N --> N1[Lihat Komisi Pending]
    N1 --> N2[Validasi & Approve Pencairan]

    M --> M1[Tulis & Publikasi Artikel Blog]
```

### 5️⃣ Flow Review & Galeri — Setelah Trip

```mermaid
flowchart TD
    A([Trip Selesai]) --> B[User Dapat Notifikasi]
    B --> C[Upload Foto ke Galeri Privat Trip]

    C --> D[Tulis Ulasan + Rating 1-5]
    D --> E[Ulasan Masuk Moderasi Admin]

    E --> F{Filter?}
    F -->|Rating 4-5| G[Tampilkan di Landing / Detail Trip]
    F -->|Rating 1-3| H[Simpan - Tidak Ditampilkan di Publik]

    G --> I[Integrasi Google Review]
    I --> J([Ulasan Live di Halaman Trip])

    C --> K[Galeri Privat - Hanya Peserta Trip]
    K --> L([Lihat & Download Foto Trip])
```

### 6️⃣ Flow Gabungan — Sistem Utuh

```mermaid
flowchart LR
    subgraph USER["👤 User"]
        A[Browsing] --> B[Booking]
        B --> C[Bayar]
        C --> D[Ikut Trip]
        D --> E[Review + Upload Galeri]
    end

    subgraph AGENT["🤝 Agen"]
        F[Referral] --> G[Komisi]
        G --> H[Cairkan]
    end

    subgraph ADMIN["🛠 Admin"]
        I[CRUD Trip]
        J[Atur Destinasi]
        K[Atur HORECA]
        L[Dynamic Promo]
        M[Moderasi Ulasan]
        N[CMS Blog]
        O[Validasi Komisi]
    end

    USER --> AGENT
    USER --> ADMIN
    AGENT --> ADMIN
```

---

**File:** `/home/ubuntu/ERD_OTL.md`
