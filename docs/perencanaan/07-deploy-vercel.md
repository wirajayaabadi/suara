# 07 — Rencana deploy di Vercel

*Ruang Suara · versi 1 · 10 Oktober 2026*

> Mencakup: kondisi kode saat ini terhadap Vercel, keputusan yang perlu diambil, lingkungan dan konfigurasi, tahapan dari prototipe terlindungi sampai go-live, variabel lingkungan, keamanan dan privasi di platform, biaya, risiko, dan checklist.
>
> Rencana ini menjabarkan **Opsi A** dari [03 §2](03-arsitektur-data-keamanan.md#2-rekomendasi-database-autentikasi-admin-penyimpanan-file-dan-hosting) (Vercel + Supabase) dan fase F4–F6 di [04 §2](04-backlog-roadmap-risiko-pengujian.md). Fakta platform di bawah diperiksa dari dokumentasi Vercel per 10 Okt 2026; harga dan batas dapat berubah, jadi periksa ulang saat eksekusi.

---

## 1. Ringkasan

Deploy dilakukan dalam **tiga tahap besar** agar ada URL yang bisa ditinjau secepatnya tanpa membuka risiko bagi pengirim sungguhan:

| Tahap | Isi | Siapa yang bisa membuka | Data |
|---|---|---|---|
| **A. Prototipe terlindungi** | Aplikasi saat ini di Vercel, region Singapura | Hanya peninjau yang diundang (Vercel Authentication) | **Data contoh** (`DATA_CONTOH=1`) |
| **B. Preview per PR + backend** | Repo Git, CI, preview otomatis per perubahan, lalu Supabase dan penyimpanan bersama | Tim saja | Data sintetis di DB preview, terpisah dari produksi |
| **C. Produksi** | Domain resmi, data contoh dimatikan, hardening, soft launch internal lalu publik | Publik (setelah soft launch) | Data nyata |

**Prinsip yang tidak boleh dilanggar selama deploy:**

1. Selama memakai data contoh, situs **tidak boleh terbuka untuk publik**. Form tiruan membuang kiriman; orang yang mengirim laporan sungguhan ke sana akan mengira laporannya diterima.
2. Preview **tidak pernah** memakai DB atau secret produksi ([03 §7](03-arsitektur-data-keamanan.md)).
3. Tidak ada analitik pihak ketiga, termasuk Vercel Web Analytics dan Speed Insights ([03 §9](03-arsitektur-data-keamanan.md#9-keamanan-dan-pencegahan-penyalahgunaan)).

---

## 2. Kondisi kode saat ini terhadap Vercel

Hasil pemeriksaan kode per 10 Okt 2026:

| # | Hal | Status | Dampak di Vercel | Tindakan |
|---|---|---|---|---|
| K1 | Next.js 16.4 + Cache Components + Partial Prerendering | ✅ Didukung penuh | Vercel menjalankan PPR, `'use cache'`, `cacheTag`, dan Server Actions secara native | — |
| K2 | Font di-self-host lewat `next/font` | ✅ | Tidak ada permintaan ke Google saat runtime | — |
| K3 | Build gagal tanpa `DATA_CONTOH=1` (disengaja, belum ada DB) | ⚠️ | Build Vercel gagal bila env ini tidak diset | Set `DATA_CONTOH=1` di Tahap A–B saja |
| K4 | Kunci segel sesi pelacakan: **acak per proses** bila `SESI_PELACAKAN_RAHASIA` kosong (mode contoh) | ❌ **Harus diperbaiki** | Vercel menjalankan beberapa instance. Login di instance A, permintaan berikutnya di instance B → sesi dianggap tidak sah, pengguna “terlempar keluar” acak | Wajibkan `SESI_PELACAKAN_RAHASIA` bila `process.env.VERCEL` ada, walau mode contoh. Set di semua lingkungan. |
| K5 | Pembatas percobaan masuk (`server/pelacakan/batas.ts`) di memori proses | ❌ untuk produksi | Hitungan tidak dibagi antar-instance → brute force tidak efektif dibatasi | Tahap A: terima (prototipe). Tahap C: pindah ke Redis/Postgres + aturan WAF (§7.3) |
| K6 | Kunci idempotensi kirim (`formulir/aksi.ts`) di memori | ❌ untuk produksi | Klik ganda yang mendarat di instance berbeda bisa membuat dua kiriman | Tahap C: simpan di DB (kolom unik) |
| K7 | Perubahan pengirim di pelacakan contoh (balasan, lampiran, tarik izin) di memori per sesi | ⚠️ | Balasan bisa “hilang” setelah refresh bila pindah instance | Tahap A: jelaskan di banner CONTOH, atau simpan di cookie tersegel. Hilang sendiri setelah backend nyata |
| K8 | Header `X-Robots-Tag` dan `Referrer-Policy` di `next.config.ts` | ✅ | Berlaku di Vercel | — |
| K9 | CSP belum ada | ❌ untuk produksi | — | Lihat keputusan D5: CSP **nonce tidak kompatibel dengan PPR** |
| K10 | Proyek **bukan repositori Git** | ❌ | Integrasi Git Vercel (preview per PR) butuh repo | Tahap A boleh lewat CLI; Tahap B wajib Git |
| K11 | Uji E2E menjalankan build lokal (`playwright.config.ts`) | ✅ | Dipakai di CI sebelum deploy | Tambah workflow CI (§5) |
| K12 | Node `>=20.9` (syarat Next 16) | ✅ | Pilih Node 22.x atau 24.x di pengaturan proyek | Tambah `"engines"` di `package.json` agar eksplisit |
| K13 | Unggah lampiran sungguhan belum ada | — | **Batas body function Vercel 4,5 MB**; lampiran 10 MB tidak bisa lewat function | Sesuai rencana 03: unggah langsung ke storage dengan URL bertanda tangan |

---

## 3. Keputusan yang perlu diambil

| Kode | Keputusan | Rekomendasi | Kapan dibutuhkan |
|---|---|---|---|
| **D1** | **Lokasi data (Q1).** Vercel **tidak punya region Indonesia**; terdekat `sin1` (Singapura). Supabase juga di Singapura. | Konfirmasi ke legal bahwa penyimpanan di Singapura sesuai UU PDP dan kebijakan organisasi. Bila wajib di Indonesia → **Opsi B (VPS lokal)**, kode tetap sama | Sebelum Tahap C. Tahap A–B tidak menyimpan data nyata, jadi bisa jalan dulu |
| **D2** | **Paket Vercel.** Hobby hanya untuk penggunaan pribadi non-komersial; proyek yang dikerjakan pegawai/konsultan berbayar termasuk komersial menurut ketentuan Vercel | **Pro** ($20/bulan, sudah termasuk 1 kursi deploy + $20 kredit pemakaian). Peninjau memakai **kursi Viewer gratis** | Tahap A |
| **D3** | **Pemilik akun.** Akun Vercel, Supabase, dan domain sebaiknya milik organisasi, bukan pribadi pengembang | Tim Vercel atas nama organisasi, 2FA wajib untuk semua anggota, minimal 2 Owner | Tahap A |
| **D4** | **Cara peninjau masuk ke prototipe** | **Vercel Authentication + “All Deployments”** (gratis di semua paket). Alternatif: Password Protection ($20/bulan/proyek) bila peninjau tidak mau membuat akun Vercel | Tahap A |
| **D5** | **Strategi CSP.** CSP berbasis **nonce** memaksa semua halaman dinamis dan **tidak kompatibel dengan PPR** (dokumentasi Next 16). Rencana di 03 §9 menyebut nonce | (a) CSP **tanpa nonce** yang ketat untuk sumber daya (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'none'`) + `script-src 'self' 'unsafe-inline'`, atau (b) CSP berbasis hash/SRI (eksperimental di Next). Rekomendasi: **(a) dulu**, evaluasi (b) di F5. Memilih nonce berarti mengorbankan PPR dan cache CDN | Sebelum Tahap C |
| **D6** | **Domain.** Subdomain organisasi (mis. `suara.<domain-organisasi>`) dan siapa yang mengelola DNS | Subdomain organisasi, CNAME ke Vercel | Tahap C |
| **D7** | **Penyimpanan bersama untuk batas percobaan dan idempotensi** | Tabel Postgres (sudah ada Supabase, tanpa vendor tambahan) atau Upstash Redis lewat Vercel Marketplace | Tahap B |

---

## 4. Lingkungan dan konfigurasi

### 4.1 Tiga lingkungan Vercel

| Lingkungan | Pemicu | Data | Protection | Secret |
|---|---|---|---|---|
| **Development** | `vercel env pull` untuk lokal | Data contoh | — | Nilai lokal, bukan produksi |
| **Preview** | Setiap push/PR ke cabang selain `main` | Tahap A–B: data contoh. Setelah backend: DB **preview** dengan data sintetis | Vercel Authentication | Berbeda dari produksi |
| **Production** | Merge ke `main` | Tahap A: data contoh (terlindungi). Tahap C: DB produksi | Tahap A–soft launch: All Deployments. Go-live publik: Standard Protection (preview tetap terlindungi) | Hanya Owner yang bisa melihat |

### 4.2 Region

Function Vercel **default berjalan di `iad1` (Washington, AS)**. Harus dipindah ke Singapura agar dekat pengguna dan dekat DB:

```json
// vercel.json (baru)
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["sin1"]
}
```

Halaman statis tetap dilayani dari CDN global (PoP terdekat pengguna). Yang berjalan di `sin1` adalah render dinamis, Server Actions, dan akses data.

### 4.3 Pengaturan proyek

| Pengaturan | Nilai |
|---|---|
| Framework preset | Next.js (terdeteksi otomatis) |
| Build command | `npm run build` (default) — env menentukan sumber data |
| Node.js | 22.x atau 24.x |
| Fluid compute | Aktif (default proyek baru) |
| Function max duration | Default 300 s cukup; turunkan ke 30 s untuk membatasi biaya bila ada yang macet |
| Web Analytics, Speed Insights | **Mati** (kebijakan tanpa analitik pihak ketiga) |
| Vercel Toolbar / komentar preview | Boleh di Preview untuk peninjau; **matikan di Production** |
| Spend management | Batas notifikasi + batas keras (mis. $50/bulan) agar serangan trafik tidak menghabiskan anggaran |

---

## 5. Tahap A — Prototipe terlindungi (≈ 1–2 hari)

Tujuan: URL yang bisa dibuka pemangku kepentingan untuk meninjau UI, **tanpa** risiko kiriman sungguhan.

### 5.1 Perubahan kode kecil sebelum deploy

1. **K4 — wajibkan secret sesi di Vercel.** Di `src/server/pelacakan/sesi.ts`, kunci acak per proses hanya boleh dipakai bila `process.env.VERCEL` tidak ada (lokal). Di Vercel tanpa `SESI_PELACAKAN_RAHASIA` → lempar galat yang jelas.
2. **K12** — tambahkan `"engines": { "node": ">=20.9" }` di `package.json`.
3. Tambah `vercel.json` dengan `regions: ["sin1"]` (§4.2).
4. **K7** — perjelas banner CONTOH di `/lacak/kiriman`: perubahan bisa hilang saat halaman dimuat ulang.
5. Uji: `npm run lint`, `npx tsc --noEmit`, `npm run test:unit`, `npm run test:e2e`.

### 5.2 Langkah

| # | Langkah | Catatan |
|---|---|---|
| 1 | Buat tim Vercel Pro atas nama organisasi (D2, D3), aktifkan 2FA | — |
| 2 | **Atur Deployment Protection dulu**: All Deployments + Vercel Authentication | Dilakukan **sebelum** deploy pertama agar tidak ada jeda URL terbuka |
| 3 | Buat proyek: `vercel link` dari folder proyek (atau impor dari Git bila Tahap B sudah jalan) | — |
| 4 | Isi env (§9) untuk Preview dan Production: `DATA_CONTOH=1`, `SESI_PELACAKAN_RAHASIA`, `TRACKING_PEPPER` | Tandai **Sensitive**. Buat nilai dengan `openssl rand -base64 48` |
| 5 | `vercel deploy` (preview), periksa, lalu `vercel deploy --prod` | — |
| 6 | Undang peninjau sebagai **Viewer** (gratis) | Peninjau perlu akun Vercel |
| 7 | Verifikasi (§5.3) | — |

### 5.3 Verifikasi Tahap A

- [ ] Membuka URL produksi tanpa login Vercel → halaman login Vercel, bukan aplikasi.
- [ ] Respons `/` memuat header `X-Robots-Tag: noindex` (Vercel menambahkannya di preview; untuk produksi terlindungi dicek manual).
- [ ] Alur kirim → layar berhasil berbanner CONTOH.
- [ ] Login pelacakan dengan kredensial CNTH, refresh **10 kali** → sesi tetap aktif (membuktikan K4 sudah benar).
- [ ] Peta Suara, `/aspirasi`, `/ringkasan`, detail, dan halaman informasi tampil.
- [ ] Log fungsi (Observability → Logs) tidak memuat kode akses, isi form, atau cookie.
- [ ] Region fungsi di detail deployment = `sin1`.

---

## 6. Tahap B — Git, CI, preview per PR, dan infrastruktur backend

### 6.1 Repositori dan CI (≈ 1 hari)

1. `git init`, `.gitignore` sudah ada dari create-next-app (pastikan `.env*`, `.vercel`, `test-results`, `playwright-report` diabaikan).
2. Repo **privat** di GitHub milik organisasi; proteksi cabang `main` (wajib PR + CI hijau + 1 review).
3. Hubungkan proyek Vercel ke repo → preview otomatis per PR.
4. **GitHub Actions** `ci.yml` per PR: `npm ci` → lint → `tsc --noEmit` → `test:unit` → `test:e2e` (Chrome di runner, `DATA_CONTOH=1`). Vercel hanya mempromosikan ke produksi lewat merge ke `main`.
5. Pemindai secret (GitHub secret scanning) dan Dependabot aktif (03 §9 rantai pasok).
6. Opsional: uji E2E terhadap URL preview dengan **Protection Bypass for Automation** (secret khusus CI).

### 6.2 Infrastruktur backend (bersamaan dengan F4 di dok. 04)

| Komponen | Pilihan | Region | Catatan |
|---|---|---|---|
| Database | **Supabase Postgres** (03 §2) | Singapura | Dua proyek: `preview` dan `produksi`. Data API/PostgREST dimatikan. Koneksi lewat pooler (mode transaksi) karena function serverless membuka banyak koneksi |
| Role DB | `app_public` (hanya view publik) dan `app_private` | — | Dua `DATABASE_URL` berbeda (§9) |
| Penyimpanan lampiran | Supabase Storage via API S3 | Singapura | Unggah langsung dari browser dengan URL bertanda tangan 5 menit (K13), bucket privat `karantina` dan `bukti` |
| Batas percobaan + idempotensi | Tabel Postgres atau Upstash Redis (D7) | Singapura | Menggantikan Map di memori (K5, K6) |
| Tugas terjadwal | **Vercel Cron** → Route Handler terlindung secret | — | Retensi harian, hapus karantina > 24 jam, rotasi garam hash IP |
| Email notifikasi (opsional, Q4) | Penyedia transaksional | — | Isi tanpa nomor referensi/kunci (03 §9) |

Migrasi DB dijalankan dari CI **sebelum** promosi ke produksi, dan selalu kompatibel mundur satu versi agar *Instant Rollback* Vercel tetap aman.

---

## 7. Tahap C — Hardening keamanan dan privasi di platform

### 7.1 Header (tambahan di `next.config.ts`)

| Header | Nilai | Catatan |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Verifikasi apakah Vercel sudah menambahkannya untuk domain kustom; set eksplisit bila belum |
| `Content-Security-Policy` | Sesuai keputusan D5 | Uji di Preview dulu dengan `Content-Security-Policy-Report-Only` |
| `X-Content-Type-Options` | `nosniff` | — |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | — |
| `Referrer-Policy` | `no-referrer` di `/kirim`, `/lacak` (sudah); `strict-origin-when-cross-origin` di lainnya | — |
| `X-Robots-Tag` | `noindex` untuk `/lacak`, `/kirim`, `/ringkasan`, `/admin`, `/api` (sebagian sudah) | — |

### 7.2 Data di platform Vercel

- **Log runtime** mencatat URL, status, dan pesan `console`. Aplikasi tidak menaruh rahasia di URL; tetap pastikan tidak ada `console.log` berisi isi kiriman (logger dengan `redact`, 03 §9). Jangan pasang Log Drain ke layanan pihak ketiga tanpa kajian.
- **Alamat IP pengunjung** diproses Vercel sebagai operator jaringan. Ini sudah disebut di kebijakan privasi (“Penyedia hosting dapat mencatat alamat IP untuk sementara”).
- **Sumber map** produksi: jangan unggah, atau aktifkan *Protected Source Maps*.
- **Akses tim**: hanya Owner/Member yang bisa melihat env produksi dan log; peninjau = Viewer.

### 7.3 Vercel Firewall

| Aturan | Kondisi | Aksi |
|---|---|---|
| Batas masuk pelacakan | `POST` ke `/lacak` | Rate limit per IP, mis. 10 / 60 s → 429. Lapisan tambahan di atas pembatas aplikasi (K5) |
| Batas kirim | `POST` ke `/kirim/*` dan `/` (Server Action form) | Rate limit per IP, mis. 5 / 10 menit |
| Admin | `/admin/*` | Opsional: tantangan/challenge bila ada lonjakan |

Catatan platform: penghitung rate limit WAF **per region**, jendela maksimum 10 menit di Pro, dan maksimal 40 aturan per proyek. Karena itu batas jangka panjang (per jam/hari, 03 §9) tetap ditegakkan aplikasi lewat DB/Redis.

---

## 8. Go-live dan operasional (F6)

### 8.1 Sebelum go-live

- [ ] D1 (lokasi data) dan D5 (CSP) diputuskan dan diterapkan.
- [ ] Env produksi: **`DATA_CONTOH` dihapus**; build produksi lulus dengan DB nyata.
- [ ] AC-D7: bundle produksi tidak memuat data contoh dan teks “DATA CONTOH” (grep `.next` di CI).
- [ ] Banner DRAF di halaman informasi sudah dicabut setelah teks disetujui; `src/lib/kontak.ts` terisi.
- [ ] Backup DB harian aktif dan **uji pemulihan** berhasil (03 §9, A11).
- [ ] Akun admin pertama dibuat lewat undangan, 2FA aktif.
- [ ] Domain terpasang, sertifikat TLS aktif, `www`/apex mengarah ke domain utama.
- [ ] Runbook: rollback, rotasi secret, respons insiden, kontak Vercel/Supabase support.

### 8.2 Urutan peluncuran

1. Deploy produksi **tetap di belakang All Deployments protection** → soft launch internal (tim pengelola menguji alur nyata).
2. Setelah 1–2 minggu tanpa insiden P1 (04 §2), ubah protection ke **Standard Protection** (preview tetap terlindungi, produksi publik).
3. Umumkan URL resmi.

### 8.3 Operasional

| Kebutuhan | Cara |
|---|---|
| Rollback | **Instant Rollback** ke deployment sebelumnya (detik). Migrasi DB harus kompatibel mundur |
| Pemantauan galat | Vercel Observability (bawaan). Alert untuk lonjakan 5xx dan fungsi timeout |
| Uptime | Pemeriksa eksternal tanpa skrip di halaman (ping HTTP saja) |
| Rotasi secret | Ubah env → redeploy. Rotasi `SESI_PELACAKAN_RAHASIA` mengeluarkan semua sesi pelacakan aktif (dapat diterima) |
| Biaya | Spend management + email ringkasan pemakaian |

---

## 9. Variabel lingkungan

| Variabel | Development | Preview | Production | Keterangan |
|---|---|---|---|---|
| `DATA_CONTOH` | `1` | `1` (sampai DB preview siap) | `1` di Tahap A; **dihapus** saat go-live | Sumber data contoh |
| `DATA_CONTOH_SKENARIO` | bebas | opsional (`ekstrem`, `kosong`, …) | — | Uji tampilan |
| `SESI_PELACAKAN_RAHASIA` | nilai lokal | nilai sendiri | nilai sendiri, Sensitive | ≥ 32 karakter acak. **Wajib di Vercel** (K4) |
| `TRACKING_PEPPER` | nilai lokal | nilai sendiri | nilai sendiri, Sensitive | Mengubahnya membuat semua Kode Akses lama tidak cocok → **jangan dirotasi** tanpa migrasi |
| `DATABASE_URL_PUBLIC` | DB lokal | DB preview | DB produksi | Role `app_public` |
| `DATABASE_URL_PRIVATE` | DB lokal | DB preview | DB produksi | Role `app_private` |
| `S3_*` (endpoint, bucket, key) | lokal | preview | produksi | Supabase Storage |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | lokal | preview | produksi | Auth admin + 2FA |
| `KUNCI_ENKRIPSI_FIELD` | lokal | preview | produksi | Enkripsi kontak & lampiran (03 §9); simpan cadangan di luar Vercel |
| `CRON_SECRET` | — | nilai sendiri | nilai sendiri | Melindungi Route Handler cron |

Variabel baris 5 dan seterusnya baru dibutuhkan di Tahap B–C. Tidak ada variabel `NEXT_PUBLIC_*` yang berisi rahasia.

---

## 10. Perkiraan biaya bulanan

| Item | Tahap A | Tahap C | Catatan |
|---|---|---|---|
| Vercel Pro | $20 (1 kursi deploy + $20 kredit) | $20 + $20 per kursi deploy tambahan | Kursi Viewer gratis |
| Pemakaian Vercel di atas kredit | ≈ $0 | Kecil untuk < 10.000 kunjungan/bulan (A4) | Pantau di dashboard |
| Password Protection | $0 (pakai Vercel Authentication) | $0 | $20/bulan/proyek bila dipilih (D4) |
| Supabase Pro | — | ± $25 | Dua proyek (preview bisa paket gratis) |
| Redis (bila D7 = Upstash) | — | $0–10 | Tingkat gratis kemungkinan cukup |
| Domain | — | sesuai registrar | Subdomain organisasi: $0 |
| **Perkiraan** | **± $20** | **± $45–80** | Sejalan dengan 03 §2 |

---

## 11. Risiko khusus deploy

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Prototipe ber-data contoh terbuka ke publik | Orang mengirim laporan sungguhan yang dibuang | Protection diaktifkan **sebelum** deploy pertama; cek tanpa login di §5.3 |
| Sesi pelacakan acak gagal di multi-instance (K4) | Pengguna terlempar keluar | Perbaikan kode §5.1 + uji refresh berulang |
| Region tertinggal di `iad1` | Latensi ke DB Singapura tinggi; data lewat AS | `vercel.json` `regions: ["sin1"]` + cek di detail deployment |
| Secret produksi bocor ke preview | Preview bisa membaca data nyata | Env dipisah per lingkungan; preview pakai DB preview |
| CSP nonce dipasang tanpa sadar dampaknya (D5) | Semua halaman dinamis, PPR mati, biaya naik | Putuskan D5 dulu, uji Report-Only di Preview |
| Lokasi data tidak sesuai regulasi (D1) | Pelanggaran UU PDP | Keputusan legal sebelum Tahap C; Opsi B siap dengan kode yang sama |
| Lonjakan trafik/serangan menghabiskan anggaran | Tagihan tak terduga | Spend management dengan batas keras + aturan WAF |

---

## 12. Checklist ringkas

**Tahap A — bisa dimulai sekarang**
- [ ] D2, D3, D4 diputuskan
- [ ] Perbaikan kode §5.1 (K4, engines, `vercel.json`, banner)
- [ ] Protection aktif sebelum deploy pertama
- [ ] Env Preview + Production diisi
- [ ] Verifikasi §5.3

**Tahap B**
- [ ] Repo Git privat + proteksi `main`
- [ ] CI (lint, tsc, unit, e2e)
- [ ] Supabase preview & produksi (Singapura), dua role DB
- [ ] Penyimpanan bersama untuk batas percobaan & idempotensi (D7)
- [ ] Vercel Cron untuk retensi

**Tahap C**
- [ ] D1, D5, D6 diputuskan
- [ ] Header keamanan + CSP
- [ ] Aturan Firewall
- [ ] Checklist go-live §8.1
- [ ] Soft launch internal → Standard Protection → umumkan
