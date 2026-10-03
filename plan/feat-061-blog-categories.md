# Plan — feat-061 Blog Categories Management

Status per 2026-10-03 · Branch: (belum dibuat, usul `feat/061-blog-categories`)

## Kondisi awal (fakta)

- Tabel `blog_categories` (id/name/slug/description) + `blogs.categoryId` (nullable, tanpa FK) **sudah ada**.
- Service create/update **meneruskan** `categoryId`, tapi: **tanpa API kategori, tanpa UI admin, tanpa filter publik**.
- Form blog admin tidak punya field kategori sama sekali.

## Backend (repository → service → controller → route)

- [x] Repository: `listCategories`, `getCategoryBySlug`, `createCategory` (slug unik auto + suffix), `updateCategory`, `deleteCategory` (tolak jika dipakai artikel? atau null-kan — **putuskan: null-kan** agar simpel)
- [x] Service: validasi nama wajib + slug unik (AppError 400/404/409)
- [x] Controller tipis + route: `GET/POST /api/blog-categories` (GET **public** untuk filter publik), `PUT/DELETE /[id]` (admin)
- [x] Policy: GET public + audit test tetap hijau (cek ambang public ≤25)

## Admin UI (`/admin/blogs`)

- [x] Dropdown kategori di modal tambah/edit (terhubung `categoryId`; opsi "Tanpa kategori")
- [x] Pola ikut konvensi trips: `CreatableSelect` (ketik baru → auto-tersimpan) — atau manager mini list/tambah/hapus (putuskan saat eksekusi, default: CreatableSelect)
- [x] Kolom kategori di tabel list

## Publik (`/blog`)

- [x] Badge kategori di kartu artikel
- [x] Filter chips kategori + query `?category=<slug>` (server saring published + kategori)
- [x] Detail artikel tampilkan kategori (link balik ke list terfilter)

## Verifikasi

- [x] tsc 0 · lint 0E · vitest (test service validasi + slug unik) · build 0 · routes +2 · audit hijau
- [x] Live: buat kategori → pasang ke artikel → filter publik tampil benar → hapus kategori → artikel jadi tanpa kategori
