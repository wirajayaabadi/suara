# Ruang Suara

Website whistleblowing dan penampung aspirasi (nama sementara; ubah di `src/lib/konstanta.ts`).
Rencana lengkap ada di [`docs/perencanaan/`](docs/perencanaan/README.md).

## Status

| Bagian | Status |
|---|---|
| Fondasi: Next.js 16, TypeScript, Tailwind v4, shadcn/ui | ✅ |
| Design tokens identitas P3MD (`src/styles/tokens.css`, dok. 06) | ✅ |
| Beranda Canvas/SVG (dok. 05 §2) | ✅ Prototipe |
| Form pengajuan dalam dialog (dok. 05 §2.7) | ✅ Prototipe. Server Action tiruan, tidak ada yang disimpan. |
| Peta Suara isometrik (dok. 05 §3) | ✅ Prototipe dengan data contoh |
| Pelacakan `/lacak` (dok. 01 §4.C, dok. 02 §5.5) | ✅ Prototipe dengan kiriman contoh CNTH |
| Detail publik `/aspirasi/[kode]`, `/ringkasan/[kode]` | ✅ Prototipe |
| Backend basis data, daftar `/aspirasi` & `/ringkasan`, dashboard (dok. 03) | ⏳ Belum |

Belum ada data yang dikirim atau disimpan oleh aplikasi.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build:contoh && npm run start:contoh   # build produksi dengan data contoh
npm run test:unit   # uji fungsi murni (geometri, skala, state URL peta)
npm run test:e2e    # Playwright memakai Chrome terpasang; membangun dan menjalankan server di port 3211
```

## Deploy ke Vercel

Rencana lengkap: [docs/perencanaan/07-deploy-vercel.md](docs/perencanaan/07-deploy-vercel.md). Ringkas untuk prototipe (Tahap A):

1. Aktifkan **Deployment Protection → All Deployments + Vercel Authentication** sebelum deploy pertama. Prototipe memakai form tiruan yang membuang kiriman, jadi tidak boleh terbuka untuk publik.
2. Isi env untuk Preview dan Production: `SESI_PELACAKAN_RAHASIA` (≥ 32 karakter, mis. `openssl rand -base64 48`) dan `TRACKING_PEPPER`. Build di Vercel sengaja gagal bila salah satunya kosong. Data contoh dipakai otomatis selama basis data belum dikonfigurasi; `DATA_CONTOH=1` boleh diisi agar eksplisit.
3. Region fungsi sudah diset ke Singapura (`sin1`) lewat `vercel.json`.

## Data contoh

Semua data di prototipe ini **sintetis**: tidak ada laporan, nama, atau unit nyata. Data contoh hanya dibaca di server (`import "server-only"`) dan selalu ditandai `dataContoh: true` di respons publik.

| Berkas | Isi |
|---|---|
| `src/server/data-contoh/kategori.ts` | Kategori Whistleblowing (8) dan Aspirasi (9, +6 untuk skenario uji) |
| `src/server/data-contoh/teks.ts` | Teks judul, ringkasan tersamar, tanggapan, dan penafian |
| `src/server/data-contoh/konten-publik.ts` | Generator konten publik deterministik + 6 skenario |
| `src/server/data-contoh/kiriman.ts` | 5 kiriman **privat** untuk pelacakan/dashboard (nomor `…-CNTH-…`) |
| `src/server/dal/publik.ts` | Satu-satunya pintu data publik. Keluaran divalidasi `src/lib/schemas/publik.ts`. |
| `src/features/peta/model/` | Periode, skala, dan agregasi Peta Suara (fungsi murni) |

Pengaturan lewat variabel lingkungan:

| Variabel | Nilai | Efek |
|---|---|---|
| `DATA_CONTOH` | `1` / `0` | Paksa memakai (`1`) atau tidak memakai (`0`) data contoh. Bawaan: data contoh selama `DATABASE_URL_PUBLIC` kosong, termasuk di `npm run build`/`npm start`; build mengumumkannya dengan baris “ⓘ Sumber data: DATA CONTOH”. |
| `DATA_CONTOH_SKENARIO` | `normal` (bawaan), `kosong`, `sedikit`, `ekstrem`, `banyak-kategori`, `rentang-panjang` | Pilih skenario uji |
| `SESI_PELACAKAN_RAHASIA` | ≥ 32 karakter acak | Kunci segel cookie sesi pelacakan. Wajib di produksi; mode contoh memakai kunci acak per proses |
| `TRACKING_PEPPER` | string rahasia | Pepper HMAC Kode Akses dan hash IP pembatas percobaan |

Tanggal acuan data contoh tetap 9 Okt 2026 (WIB) agar hasilnya sama di setiap build.

Kiriman contoh untuk uji pelacakan di `/lacak`. Balasan, lampiran, dan penarikan izin hanya
berlaku di memori untuk sesi itu; tidak ada yang disimpan:

| Nomor Referensi | Kode Akses (khusus uji) | Status |
|---|---|---|
| `WBS-26-CNTH-0001` | `CNTH-AAAA-BBBB-CCCC-DDDD-0001` | Diterima |
| `WBS-26-CNTH-0002` | `CNTH-AAAA-BBBB-CCCC-DDDD-0002` | Membutuhkan informasi |
| `WBS-26-CNTH-0003` | `CNTH-AAAA-BBBB-CCCC-DDDD-0003` | Selesai, dipublikasikan |
| `ASP-26-CNTH-0004` | `CNTH-AAAA-BBBB-CCCC-DDDD-0004` | Ditindaklanjuti, dipublikasikan |
| `ASP-26-CNTH-0005` | `CNTH-AAAA-BBBB-CCCC-DDDD-0005` | Ditutup (duplikat) |

## Struktur

```
src/
├── app/
│   ├── (publik)/            beranda + halaman informasi
│   └── (formulir)/kirim/    form pelanggaran & aspirasi
├── features/beranda/        hero, mesin bubble Canvas 2D, orbit SVG, tombol
├── components/              komponen bersama (shadcn di components/ui)
├── lib/                     konstanta, utilitas, konteks animasi
└── styles/tokens.css        satu-satunya sumber warna
docs/
├── perencanaan/             dokumen rencana 01–06
├── referensi/               logo P3MD dan screenshot referensi
└── versi.md                 versi paket dan temuan audit
```

## Atribusi

Mesin bubble di `src/features/beranda/bubble/` diadaptasi dari *Astro Bubble Hero* oleh Kedhareswer Naidu (21st.dev), lisensi MIT.
