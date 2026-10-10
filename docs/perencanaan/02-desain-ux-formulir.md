# 02 — Desain, Halaman, Formulir, dan Komponen UI

> Mencakup: design brief dan arah visual, design tokens, sitemap dan gambaran halaman (no. 6), wireframe, spesifikasi formulir (no. 7), teks antarmuka, batas anonimitas, tabel komponen 21st.dev, dan kriteria penerimaan UI.

---

## 1. Design brief

| Aspek | Isi |
|---|---|
| **Tujuan desain** | Membuat orang merasa **aman dan dihargai** saat melapor, serta membuat pengelola **cepat dan teliti** saat mengkurasi. |
| **Pengguna utama publik** | Orang yang mungkin cemas atau ragu, sering memakai ponsel dengan koneksi biasa, kadang memakai perangkat bersama, dan beragam tingkat literasi digital. |
| **Pengguna utama dashboard** | 2–5 pengelola **[A3]** yang memakai laptop. Mereka sering bekerja di antrean dan perlu membedakan data privat dari data publik secara cepat. |
| **Kepribadian** | Profesional · tenang · terpercaya · manusiawi. Tidak birokratis, tidak dramatis, dan tidak bergaya “startup”. |
| **Prinsip visual** | 1) Satu tindakan utama per layar. 2) Status privasi selalu terlihat dengan ikon dan teks. 3) Tidak mengandalkan warna saja. 4) Ruang kosong lega dan lebar baca terbatas. 5) Animasi hanya untuk umpan balik. |
| **Batasan** | Mode terang saja di MVP. Font di-*self-host* lewat `next/font`, tanpa permintaan ke Google saat runtime. Tanpa animasi dekoratif di halaman formulir. Target WCAG 2.2 AA. |
| **Pembeda dua layanan** | Judul, ikon, deskripsi, dan label sifat privasi yang berbeda. Warna aksen hanya menjadi penguat. |

## 2. Dua alternatif arah visual

### Alternatif A — **“Teduh Institusional”** *(direkomendasikan)*

| Aspek | Rancangan |
|---|---|
| **Palet** | Primer **teal tua** `#0E4A5C` untuk tombol utama, tautan, dan fokus. Latar **netral hangat** `#F7F7F5` dan kartu putih. Teks tinta `#14202B`. Aksen layanan: pelanggaran **tembaga** `#8A4520`, aspirasi **hijau** `#1F6B4F`. Warna semantik sukses, peringatan, galat, dan info dipakai **hanya** untuk status dan pesan. |
| **Tipografi** | **Plus Jakarta Sans** (karya desainer Indonesia, lisensi OFL, mudah dibaca di layar kecil) untuk semua teks. **JetBrains Mono** hanya untuk Nomor Referensi dan Kunci Rahasia agar karakter mirip seperti 0/O dan 1/l mudah dibedakan. |
| **Tombol** | Radius 8px, tinggi 44px di ponsel. Primer berwarna solid. Sekunder memakai garis luar. Tombol berisiko hanya muncul di dialog. |
| **Kartu** | Putih dengan garis 1px `#D9DEE3`, radius 12px, tanpa bayangan. Bayangan tipis hanya untuk kartu yang dapat diklik saat hover. |
| **Formulir** | Label di atas field. Petunjuk berada di bawah label. Galat ditampilkan di bawah field dengan ikon. Field memakai garis luar dan latar putih, tinggi 44px, teks 16px untuk mencegah zoom otomatis di iOS. |
| **Badge status** | Berbentuk pil. **Status penanganan** memakai latar lembut + titik + teks. **Status publikasi** memakai garis luar + ikon gembok atau globe + teks, sehingga keduanya tidak tertukar. |
| **Navigasi** | Header putih ramping berisi nama organisasi, Publikasi, Panduan, dan tombol garis “Lacak Kiriman”. Di ponsel tersedia menu sheet dan ikon Lacak yang selalu tampil. Halaman formulir memakai header minimal. |
| **Mobile vs desktop** | Ponsel: satu kolom, tombol utama selebar layar dan menempel di bawah pada formulir bertahap. Desktop: kontainer 1152px dan lebar baca formulir/artikel 672px. |
| **Beranda** | Hero teks tanpa ilustrasi besar. Dua **kartu layanan** besar berdampingan di desktop dan bertumpuk di ponsel. Di bawahnya ada pita “Cara kerja” 4 langkah, kotak lacak, dan konten publik terbaru. |
| **Formulir** | Stepper sederhana “Langkah 2 dari 4”. Satu kartu per langkah. Panel samping di desktop berisi “Yang perlu Anda ketahui”. |
| **Dashboard** | Sidebar kiri bernuansa netral gelap `#14202B`. Area kerja terang dengan tabel padat. Panel **PRIVAT** memakai latar kuning lembut + gembok, sedangkan panel **PRATINJAU PUBLIK** memakai latar biru lembut + globe + garis putus-putus. |
| **Kesan** | Kredibel seperti layanan publik modern, tetapi tetap hangat karena latar netral hangat dan tipografi yang ramah. |

### Alternatif B — **“Hangat Editorial”**

| Aspek | Rancangan |
|---|---|
| **Palet** | Primer **hijau sage tua** `#2F5D50`. Latar **krem** `#FAF7F2`. Teks `#1E1B16`. Aksen layanan: pelanggaran **merah bata redup** `#9A3B2E`, aspirasi **biru laut** `#2B5C8A`. |
| **Tipografi** | Judul memakai **Source Serif 4** (serif). Isi memakai **Inter** (sans). Kode memakai **JetBrains Mono**. |
| **Tombol** | Radius 12px, sedikit lebih bulat. Primer solid, sekunder memakai garis tipis. |
| **Kartu** | Tanpa garis, memakai bayangan sangat lembut di atas latar krem, dengan radius 16px. |
| **Formulir** | Field “underline” bergaya editorial. Ini lebih elegan, tetapi area sentuhnya kurang jelas. |
| **Badge status** | Teks kapital kecil dengan garis. |
| **Navigasi** | Header besar dengan judul serif. Di desktop menu berada di tengah, di ponsel memakai hamburger. |
| **Mobile vs desktop** | Tata letak seperti majalah dan grid asimetris di desktop. |
| **Beranda** | Kutipan aspirasi besar di hero. Kartu layanan berada di bawah lipatan pertama. |
| **Dashboard** | Sama terang dengan publik dan sidebar krem. |
| **Kesan** | Hangat, komunitas, dan reflektif. Arah ini cocok untuk organisasi masyarakat atau kampus, tetapi kurang “resmi” untuk pelaporan pelanggaran. |

### Rekomendasi: **Alternatif A — Teduh Institusional**

| Kriteria | A | B | Alasan |
|---|:-:|:-:|---|
| Kesan terpercaya untuk laporan pelanggaran | ●●● | ●● | Teal tua dan tata letak lugas terasa resmi tanpa kesan menakutkan |
| Keterbacaan di ponsel | ●●● | ●● | Satu keluarga sans dengan x-height besar. Serif kecil di B kurang jelas di layar murah. |
| Kejelasan formulir | ●●● | ●● | Field bergaris penuh lebih mudah dikenali daripada field underline |
| Pembedaan privat dan publik di dashboard | ●●● | ●● | Kontras antara sidebar gelap, panel kuning, dan panel biru lebih tegas |
| Kecocokan dengan shadcn/ui | ●●● | ●● | Mendekati gaya bawaan shadcn sehingga penyesuaiannya lebih sedikit |
| Kehangatan | ●● | ●●● | A meminjam latar netral hangat dari B |

Keputusan: gunakan A. Dari B, pinjam **latar netral hangat** dan **ilustrasi garis sederhana** (opsional) di halaman panduan.

---

## 3. Design tokens

Tokens ditulis sebagai CSS variables (Tailwind v4 `@theme` + nama variabel shadcn/ui) di satu file `src/styles/tokens.css`. Semua komponen, termasuk hasil adaptasi 21st.dev, **hanya** boleh memakai token ini dan tidak boleh memakai hex langsung.

### 3.1 Warna

> **Digantikan oleh [dok. 06](06-palet-warna-p3md.md)** (palet identitas P3MD). Nilai teal dan warna layanan di bawah **tidak berlaku**. Dashboard admin memakai varian terang dok. 06 §5.2. Tabel dipertahankan hanya untuk struktur nama token.


| Token | Nilai | Penggunaan |
|---|---|---|
| `--background` | `#F7F7F5` | Latar halaman publik |
| `--card` / `--popover` | `#FFFFFF` | Kartu, dialog, field |
| `--foreground` | `#14202B` | Teks utama |
| `--muted` | `#EEF0EE` | Latar sekunder, header tabel |
| `--muted-foreground` | `#4A5866` | Teks bantu dan petunjuk (≥ 4.5:1 pada putih) |
| `--border` / `--input` | `#D9DEE3` / `#B8C1CA` | Garis kartu / garis field (garis field lebih gelap agar terlihat) |
| `--primary` | `#0E4A5C` | Tombol utama, tautan, elemen aktif |
| `--primary-hover` | `#0B3B4A` | Hover dan pressed |
| `--primary-soft` | `#E3EFF2` | Latar elemen terpilih |
| `--primary-foreground` | `#FFFFFF` | Teks di atas primer |
| `--ring` | `#2A7F95` | Cincin fokus 2px + offset 2px |
| `--service-violation` / `-soft` | `#8A4520` / `#F6ECE5` | Aksen layanan Pelanggaran (ikon, garis kiri kartu) |
| `--service-aspiration` / `-soft` | `#1F6B4F` / `#E5F2EC` | Aksen layanan Aspirasi |
| `--success` / `-soft` | `#1E7A46` / `#E6F4EC` | Selesai, berhasil |
| `--warning` / `-soft` | `#8A5300` / `#FFF4DB` | Butuh info, peringatan |
| `--destructive` / `-soft` | `#B42318` / `#FDECEA` | Galat, tolak, tarik |
| `--info` / `-soft` | `#1D5FA7` / `#E6F0FB` | Ditinjau, informasi |
| `--private-surface` / `-border` / `-foreground` | `#FFF8E6` / `#E8C66A` / `#6B4E00` | Panel **PRIVAT** di dashboard |
| `--public-surface` / `-border` / `-foreground` | `#EEF4FF` / `#9DB8E8` / `#1F3F75` | Panel **PRATINJAU PUBLIK** |
| `--sidebar` / `--sidebar-foreground` | `#14202B` / `#E8ECEF` | Sidebar dashboard |

Pemetaan badge:

| Status | Gaya | Ikon (lucide) |
|---|---|---|
| Diterima | `muted` + teks `foreground` | `Inbox` |
| Sedang ditinjau | `info-soft` + `info` | `Search` |
| Butuh informasi | `warning-soft` + `warning` | `MessageCircleQuestion` |
| Ditindaklanjuti | `primary-soft` + `primary` | `Workflow` |
| Selesai | `success-soft` + `success` | `CircleCheck` |
| Ditutup | garis `border` + `muted-foreground` | `CircleSlash` |
| Publikasi: Privat / Draf / Menunggu / Dipublikasikan / Ditolak / Ditarik | **garis luar** + teks | `Lock` / `PencilLine` / `Hourglass` / `Globe` / `Ban` / `EyeOff` |

> Rasio kontras di atas adalah target desain. Rasio wajib **diverifikasi dengan alat** saat fase fondasi dan dicatat di `docs/desain/kontras.md`.

### 3.2 Tipografi

| Token | Ukuran / tinggi baris | Berat | Penggunaan |
|---|---|---|---|
| `display` | 36/44 (desktop), 30/38 (ponsel) | 700 | Judul hero beranda |
| `h1` | 30/38 · 26/34 | 700 | Judul halaman |
| `h2` | 24/32 · 22/30 | 600 | Judul bagian |
| `h3` | 20/28 | 600 | Judul kartu atau langkah |
| `body-lg` | 18/28 | 400 | Paragraf pengantar |
| `body` | **16/24** | 400 | Teks dasar, isi field |
| `small` | 14/20 | 400/500 | Petunjuk, metadata, sel tabel |
| `caption` | 13/18 | 500 | Badge (ukuran minimum) |
| `code` | 18/28 mono, `letter-spacing: 0.06em` | 600 | Nomor Referensi dan Kunci Rahasia |

Font: `Plus Jakarta Sans` (400, 500, 600, 700) dan `JetBrains Mono` (600), dimuat dengan `next/font` (self-host, `display: swap`). Lebar baca maksimum 68ch.

### 3.3 Spacing, layout, dan bentuk

| Token | Nilai |
|---|---|
| Satuan dasar | 4px. Skala yang dipakai: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64 |
| Gutter ponsel | 16px. Gutter tablet dan desktop: 24px |
| Kontainer publik | maks. 1152px. Lebar baca formulir/artikel: 672px |
| Jarak antarbagian | 48px di ponsel, 64–80px di desktop |
| Jarak antarfield | 20px. Label ke field: 6px. Field ke petunjuk/galat: 6px |
| `--radius-sm/md/lg/full` | 6px (badge kotak, chip) · 8px (tombol, field) · 12px (kartu, dialog) · 9999px (badge pil) |
| Tinggi kontrol | 44px (ponsel) / 40px (desktop padat di dashboard) |
| Target sentuh | ≥ 44×44px |
| Bayangan | `none` untuk default. `sm` hanya untuk hover kartu interaktif, `lg` untuk dialog dan popover |
| Breakpoint | Default Tailwind: `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 |
| Gerak | 150–200ms `ease-out`, hanya opacity/transform. Hormati `prefers-reduced-motion`. Tidak ada animasi saat mengetik, carousel otomatis, atau angka berputar. |
| Ikon | `lucide-react`, stroke 1.75, ukuran 16/20/24 |

---

## 4. Sitemap dan gambaran halaman

### 4.1 Sitemap

```
Publik (tanpa login)
├── /                               Beranda
├── /panduan                        Panduan pelaporan & cara kerja
├── /kerahasiaan                    Kerahasiaan & batas anonimitas
├── /kirim/pelanggaran              Formulir pelanggaran (bertahap); /lapor dialihkan ke sini
├── /kirim/aspirasi                 Formulir aspirasi
├── /lacak                          Masuk pelacakan (Nomor Referensi + Kunci)
│   └── /lacak/kiriman              Detail kiriman milik sesi (tanpa ID di URL)
├── /aspirasi                       Daftar aspirasi yang dipublikasikan
│   └── /aspirasi/[kode]            Detail aspirasi + tanggapan
├── /ringkasan                      Daftar ringkasan pelanggaran yang dipublikasikan
│   └── /ringkasan/[kode]           Detail ringkasan + penafian
├── /faq                            Pertanyaan umum
├── /kontak                         Kontak pengelola & kontak darurat
└── /kebijakan-privasi              Kebijakan privasi & retensi

Dashboard (login + 2FA)
├── /admin/masuk                    Login → verifikasi 2FA
├── /admin                          Ringkasan kerja (tugas saya, antrean, menunggu persetujuan)
├── /admin/kiriman                  Antrean & daftar kiriman (filter)
│   └── /admin/kiriman/[id]         Detail privat: isi, lampiran, pesan, catatan, status, riwayat
│       └── /admin/kiriman/[id]/publikasi   Penyunting ringkasan + pratinjau + riwayat versi
├── /admin/persetujuan              Antrean versi yang menunggu persetujuan
├── /admin/konten-publik            Daftar konten tayang/ditarik (tarik, buat versi baru)
├── /admin/statistik                Statistik agregat
├── /admin/audit                    Audit log (Admin)
├── /admin/pengguna                 Akun & peran (Admin)
├── /admin/pengaturan               Kategori, teks halaman, retensi, kontak (Admin)
└── /admin/akun                     Profil, ganti kata sandi, kelola 2FA
```

Kode publik `[kode]` (contoh `A-0142`, `R-0037`) **bukan** Nomor Referensi kiriman. Kode publik adalah nomor urut konten publik dan tidak dapat dipakai untuk menebak atau menautkan kiriman asli.

### 4.2 Gambaran setiap halaman

| Halaman | Tujuan | Konten utama | Akses | Render & cache |
|---|---|---|---|---|
| Beranda | Mengarahkan pengguna ke layanan yang tepat | Hero, 2 kartu layanan, cara kerja 4 langkah, “Tanpa akun · Dikurasi · Rahasia”, kotak lacak, 3 aspirasi + 3 ringkasan terbaru, kontak darurat | Publik | Server Component, cache bertag `konten-publik` |
| Panduan | Menjelaskan proses dan apa yang membuat laporan berguna | Langkah, contoh laporan sintetis yang baik, apa yang terjadi setelah mengirim, perkiraan waktu | Publik | Statis |
| Kerahasiaan | Membangun kepercayaan secara jujur | Apa yang dilindungi, siapa yang dapat membaca, apa yang mungkin dipublikasikan, **batas anonimitas**, tips mengirim dengan aman | Publik | Statis |
| Formulir pelanggaran | Menerima laporan | 0 Sebelum mulai → 1 Kejadian → 2 Pihak & bukti → 3 Identitas & izin → 4 Tinjau → Berhasil | Publik | Kerangka dari Server Component, formulir di Client Component. `no-store` |
| Formulir aspirasi | Menerima aspirasi | Satu halaman + panel konfirmasi → Berhasil | Publik | Sama seperti formulir pelanggaran |
| Lacak (masuk) | Membuka sesi pelacakan | 2 field, tautan “Kehilangan kunci?” ke penjelasan | Publik | `no-store`, `noindex` |
| Lacak (kiriman) | Status dan komunikasi | Badge status, linimasa, pesan dan balasan, tambah lampiran, tarik izin publikasi, tombol keluar | Sesi pelacakan | Dinamis, `no-store, private`, `noindex` |
| Daftar aspirasi | Transparansi | Cari, filter kategori dan status publik, kartu (judul, kategori, status publik, tanggal publikasi, cuplikan tanggapan), paginasi | Publik | Cache bertag, `searchParams` → dinamis ringan |
| Detail aspirasi | Membaca aspirasi dan tanggapan | Judul, isi yang dikurasi, status publik, tanggapan pengelola, tanggal versi | Publik | Cache bertag `post:[id]` |
| Daftar ringkasan pelanggaran | Transparansi penanganan | Sama dengan daftar aspirasi + **penafian di atas daftar** | Publik | Cache bertag, `noindex` (rekomendasi) |
| Detail ringkasan | Ringkasan tersamarkan | Kotak penafian, ringkasan, kategori, periode umum, status publik, pernyataan hasil (opsional), tanggal pembaruan | Publik | Cache bertag, `noindex` |
| FAQ, Kontak, Kebijakan privasi | Informasi | Accordion FAQ, kontak resmi, kontak darurat, retensi | Publik | Statis |
| Admin: Ringkasan kerja | Prioritas harian | Kartu: baru, butuh info dibalas, ditugaskan ke saya, menunggu persetujuan, mendekati batas SLA | Pengelola+ | Dinamis, `no-store` |
| Admin: Antrean | Triase | Tabel (ref, jenis, kategori, judul, status, publikasi, umur, PIC), filter, pencarian, tab “Baru / Saya / Semua / Terbatas” | Pengelola+ | Dinamis |
| Admin: Detail kiriman | Membaca dan menindaklanjuti | Panel PRIVAT (isi, identitas tersembunyi, lampiran), tab Pesan / Catatan internal / Riwayat, aksi status, penugasan, kunci publikasi | Pengelola (yang berhak) | Dinamis, setiap pembukaan dicatat di audit |
| Admin: Penyunting publikasi | Menyusun ringkasan | Kiri: sumber privat (hanya baca). Kanan: penyunting versi + penanda data pribadi + checklist. Tab: pratinjau publik. Riwayat versi dan diff. | Pengelola+ | Dinamis |
| Admin: Persetujuan | Memutuskan publikasi | Daftar versi menunggu → layar diff + pratinjau + checklist + Setujui/Revisi/Tolak | Admin (pelanggaran), Pengelola/Admin (aspirasi). Penyusun boleh menyetujui sendiri. | Dinamis |
| Admin: Konten publik | Mengelola konten tayang | Tabel konten, aksi “Buat versi baru”, “Tarik dari publik” | Pengelola+ | Dinamis |
| Admin: Statistik | Pemantauan | Jumlah per jenis, kategori, dan status; median waktu triase/penyelesaian; tren bulanan. **Tanpa** isi atau identitas. | Pengelola+ | Dinamis |
| Admin: Audit | Akuntabilitas | Tabel kejadian (waktu, pelaku, aksi, objek), filter, ekspor CSV (Admin) | Admin | Dinamis |
| Admin: Pengguna | Akun | Undang, ubah peran, nonaktifkan, reset 2FA, status 2FA, login terakhir | Admin | Dinamis |
| Admin: Pengaturan | Konfigurasi | Kategori per jenis, teks kontak dan darurat, masa retensi, batas lampiran | Admin | Dinamis |

---

## 5. Wireframe halaman utama

> Wireframe teks berfidelitas rendah. Ini panduan susunan informasi, bukan desain akhir. Prototipe visual dibuat pada fase *Prototipe UI* (lihat [04](04-backlog-roadmap-risiko-pengujian.md)).

### 5.1 Beranda — ponsel

```
┌──────────────────────────────────┐
│ ▣ Nama Organisasi       [⌕Lacak] ☰│
├──────────────────────────────────┤
│ Sampaikan dengan aman.           │
│ Kami dengarkan dan tindak lanjuti│
│ Tanpa akun. Setiap kiriman       │
│ ditinjau petugas sebelum apa pun │
│ dipublikasikan.                  │
│                                  │
│ ┌──────────────────────────────┐ │
│ │ 🛡  Laporkan Pelanggaran      │ │
│ │ Dugaan penyimpangan, korupsi,│ │
│ │ pelecehan, penyalahgunaan    │ │
│ │ wewenang.                    │ │
│ │ 🔒 Rahasia · hanya ringkasan  │ │
│ │    tersamar yang bisa tampil │ │
│ │ [ Laporkan Pelanggaran   → ] │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 💡 Sampaikan Aspirasi         │ │
│ │ Ide, saran, kritik, dan      │ │
│ │ usulan perbaikan.            │ │
│ │ 🌐 Bisa dipublikasikan setelah│ │
│ │    dikurasi                  │ │
│ │ [ Sampaikan Aspirasi     → ] │ │
│ └──────────────────────────────┘ │
│                                  │
│ Cara kerjanya                    │
│ ① Kirim → ② Simpan kode →        │
│ ③ Ditinjau petugas → ④ Pantau    │
│                                  │
│ ┌ Sudah pernah mengirim? ───────┐ │
│ │ [ Lacak kiriman Anda       → ]│ │
│ └──────────────────────────────┘ │
│                                  │
│ Aspirasi terbaru      Lihat semua│
│ ▢ judul · kategori · [status]    │
│ ▢ …                              │
│ Ringkasan pelanggaran Lihat semua│
│ ⓘ Ringkasan ≠ dugaan terbukti    │
│ ▢ …                              │
│ ⚠ Keadaan darurat? Hubungi 112   │
├──────────────────────────────────┤
│ FAQ · Kontak · Kerahasiaan · Priv│
└──────────────────────────────────┘
```

### 5.2 Beranda — desktop

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▣ Nama Organisasi    Publikasi ▾   Panduan   Kerahasiaan  [Lacak ⌕]  │
├──────────────────────────────────────────────────────────────────────┤
│  Sampaikan dengan aman. Kami dengarkan dan tindak lanjuti.           │
│  Tanpa akun · Ditinjau petugas · Identitas dilindungi                │
│                                                                      │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐  │
│  │▌🛡 Laporkan Pelanggaran       │  │▌💡 Sampaikan Aspirasi         │  │
│  │▌ deskripsi …                  │  │▌ deskripsi …                  │  │
│  │▌ 🔒 Rahasia                    │  │▌ 🌐 Bisa dipublikasikan        │  │
│  │▌ [Laporkan Pelanggaran →]     │  │▌ [Sampaikan Aspirasi →]       │  │
│  └──────────────────────────────┘  └──────────────────────────────┘  │
│   (▌ = garis kiri warna aksen layanan; ikon + label tetap ada)        │
│                                                                      │
│  Cara kerja: ① ─── ② ─── ③ ─── ④         ┌ Lacak kiriman ────────┐  │
│                                          │ Nomor Ref  [        ] │  │
│                                          │ [Masuk ke pelacakan]  │  │
│                                          └───────────────────────┘  │
│  Aspirasi terbaru (3 kartu)          Ringkasan pelanggaran (3 kartu) │
└──────────────────────────────────────────────────────────────────────┘
```

> Kotak lacak di beranda hanya meminta Nomor Referensi, lalu membuka `/lacak` dengan field kunci. Kunci rahasia **tidak** diketik di beranda agar pengguna tidak terbiasa menempelkan kunci di sembarang tempat.

### 5.3 Formulir pelanggaran — langkah 1 (ponsel)

```
┌──────────────────────────────────┐
│ ← Kembali   Laporkan Pelanggaran │
│ Langkah 1 dari 4 · Kejadian      │
│ ▓▓▓▓▓░░░░░░░░░░░░░░░             │
├──────────────────────────────────┤
│ 🔒 Isian ini tidak disimpan di    │
│ perangkat. Selesaikan dalam satu │
│ sesi.                            │
│                                  │
│ Kategori  · Wajib                │
│ [ Pilih kategori            ▾ ]  │
│                                  │
│ Judul singkat  · Wajib           │
│ Contoh: "Pungutan di loket X"    │
│ [                            ]   │
│                          0/120   │
│                                  │
│ Apa yang terjadi?  · Wajib       │
│ Ceritakan apa, kapan, di mana,   │
│ dan bagaimana Anda mengetahuinya.│
│ Hindari menulis identitas Anda.  │
│ [                            ]   │
│ [                            ]   │
│                        0/5000    │
│                                  │
│ Kapan terjadi?  · Wajib dipilih  │
│ ( ) Tanggal pasti [__/__/____]   │
│ ( ) Perkiraan bulan [Bulan ▾]    │
│ ( ) Masih berlangsung            │
│ ( ) Tidak ingat / tidak yakin    │
│                                  │
│ Lokasi (opsional)                │
│ [                            ]   │
├──────────────────────────────────┤
│ [        Lanjut ke Bukti →     ] │  ← tombol menempel di bawah
└──────────────────────────────────┘
```

### 5.4 Formulir — langkah 4 *Tinjau & kirim* dan layar **Berhasil**

```
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│ Langkah 4 dari 4 · Tinjau        │   │ ✓ Laporan terkirim               │
│ Kejadian                  [Ubah] │   │                                  │
│  Kategori: …                     │   │ Simpan dua kode ini sekarang.    │
│  Judul: …                        │   │ Kami tidak dapat menampilkannya  │
│  Uraian: … (3 baris) [lihat]     │   │ lagi.                            │
│ Bukti (2 file)            [Ubah] │   │ ┌──────────────────────────────┐ │
│  lampiran-1.jpg · 1,2 MB         │   │ │ Nomor Referensi              │ │
│ Identitas & izin          [Ubah] │   │ │ WBS-26-7K3Q-XR9T     [Salin] │ │
│  Identitas: tidak diisi          │   │ │ Kunci Rahasia                │ │
│  Izin publikasi ringkasan: Ya    │   │ │ HC4M-2XRD-9TQK-PW7N-5JBF-   │ │
│                                  │   │ │ 3ZAE                 [Salin] │ │
│ ☐ Saya menyatakan informasi ini  │   │ └──────────────────────────────┘ │
│   benar sepengetahuan saya dan   │   │ [ ⤓ Unduh sebagai file .txt ]    │
│   memahami ketentuan penggunaan. │   │                                  │
│                                  │   │ ⚠ Siapa pun yang memegang kedua  │
│ ⓘ Verifikasi anti-spam berjalan  │   │ kode ini dapat melihat status    │
│   otomatis ✓                     │   │ laporan Anda. Jangan bagikan.    │
├──────────────────────────────────┤   │                                  │
│ [ ← Kembali ] [ Kirim Laporan  ] │   │ ☐ Saya sudah menyimpan kode ini  │
└──────────────────────────────────┘   │ [ Ke halaman pelacakan ] (aktif  │
                                       │   setelah dicentang)             │
                                       │ [ Selesai & bersihkan layar ]    │
                                       └──────────────────────────────────┘
```

### 5.5 Pelacakan — halaman kiriman

```
┌──────────────────────────────────┐
│ Pelacakan · WBS-26-7K3Q-XR9T     │
│                       [Keluar ⎋] │
├──────────────────────────────────┤
│ Status penanganan                │
│ (◔ Membutuhkan informasi dari    │
│    Anda)                         │
│ Publikasi: (🔒 Tidak dipublikasi) │
│                                  │
│ ┌ Pesan dari pengelola ────────┐ │
│ │ 12 Okt · "Mohon jelaskan     │ │
│ │ perkiraan waktu kejadian…"   │ │
│ │ [ Tulis balasan            ] │ │
│ │ [ Kirim balasan ]            │ │
│ └──────────────────────────────┘ │
│ Linimasa                         │
│ ● 12 Okt  Membutuhkan informasi  │
│ ● 10 Okt  Sedang ditinjau        │
│ ● 9 Okt   Diterima               │
│                                  │
│ Lampiran Anda (2) [+ Tambah]     │
│ ▸ Lihat salinan laporan Anda     │
│ ▸ Tarik izin publikasi           │
│ Sesi berakhir otomatis dalam     │
│ 30 menit tanpa aktivitas.        │
└──────────────────────────────────┘
```

### 5.6 Detail ringkasan pelanggaran (publik)

```
┌──────────────────────────────────────────────┐
│ Ringkasan Pelanggaran › R-0037               │
│ ┌ ⓘ Penting ───────────────────────────────┐ │
│ │ Ini ringkasan dugaan yang telah disamar- │ │
│ │ kan. Publikasi tidak berarti dugaan      │ │
│ │ terbukti. Identitas semua pihak tidak    │ │
│ │ ditampilkan.                             │ │
│ └──────────────────────────────────────────┘ │
│ Dugaan pungutan tidak resmi pada layanan     │
│ perizinan                                    │
│ [Kategori: Pungutan liar] [⟳ Dalam penanganan]│
│ Periode kejadian: Triwulan II 2026           │
│                                              │
│ Ringkasan                                    │
│ ……                                           │
│ Tindak lanjut                                │
│ ……                                           │
│ Diperbarui 3 Sep 2026 · Versi disetujui      │
└──────────────────────────────────────────────┘
```

### 5.7 Dashboard — antrean (desktop)

```
┌────────────┬─────────────────────────────────────────────────────────────┐
│ ▣ WBS Admin│ Kiriman                         ⌕ Cari ref/judul   [Andi ▾] │
│            │ [Baru 4] [Ditugaskan ke saya 6] [Semua] [Terbatas 1]        │
│ ▸ Ringkasan│ Filter: Jenis▾ Kategori▾ Status▾ Publikasi▾ Umur▾  [Reset]  │
│ ▸ Kiriman  │ ┌───────────────┬─────┬──────────┬────────┬────────┬───┬───┐│
│ ▸ Persetuj.│ │Ref            │Jenis│Judul     │Status  │Publik. │Umur│PIC││
│ ▸ Konten   │ ├───────────────┼─────┼──────────┼────────┼────────┼───┼───┤│
│   publik   │ │WBS-26-7K3Q-…  │🛡 PL │Pungutan …│(Baru)  │(🔒Priv)│ 2h│ — ││
│ ▸ Statistik│ │ASP-26-M2DX-…  │💡 AS │Jam layan…│(Ditinj)│(✎Draf) │ 3d│ R ││
│ ─────────  │ │…              │     │          │        │        │   │   ││
│ ▸ Audit    │ └───────────────┴─────┴──────────┴────────┴────────┴───┴───┘│
│ ▸ Pengguna │ Menampilkan 1–25 dari 83          ‹ 1 2 3 4 ›               │
│ ▸ Pengatur.│                                                             │
└────────────┴─────────────────────────────────────────────────────────────┘
```

### 5.8 Dashboard — detail kiriman dan penyunting publikasi

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Antrean  WBS-26-7K3Q-XR9T  🛡 Pelanggaran · Pungutan liar                │
│ [Status: Ditinjau ▾]  [Tugaskan ▾]  [🔒 Kunci tetap privat]  [Tutup ▾]     │
├──────────────────────────────────────┬────────────────────────────────────┤
│ ┏━ 🔒 PRIVAT — hanya pengelola ━━━━━┓ │ Tab: [Pesan] [Catatan internal]    │
│ ┃ Judul, uraian lengkap, waktu,     ┃ │      [Riwayat]                     │
│ ┃ lokasi, pihak terlibat            ┃ │ ┌────────────────────────────────┐ │
│ ┃ Identitas pelapor: ●●●●●●         ┃ │ │ Ke pengirim (terlihat pengirim)│ │
│ ┃   [Tampilkan — wajib alasan]      ┃ │ │ …                              │ │
│ ┃ Izin publikasi: Ya                ┃ │ │ [Tulis pesan ke pengirim]      │ │
│ ┃ Lampiran: lampiran-1.jpg ✓bersih  ┃ │ └────────────────────────────────┘ │
│ ┃           lampiran-2.pdf ✓bersih  ┃ │ Catatan internal ditampilkan       │
│ ┃           [Unduh] (tercatat)      ┃ │ dengan latar PRIVAT + label        │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │ "Tidak pernah dilihat pengirim".   │
│ Publikasi: (🔒 Privat)  [Buat ringkasan publik →]                          │
└───────────────────────────────────────┴───────────────────────────────────┘

Penyunting publikasi (/admin/kiriman/[id]/publikasi)
┌──────────────────────────────────┬───────────────────────────────────────┐
│ 🔒 SUMBER PRIVAT (hanya baca)     │ ✎ VERSI 3 · Draf          [Pratinjau] │
│ uraian asli …                    │ Judul publik  [                     ] │
│                                  │ Kategori publik [▾] Periode [Trw ▾]   │
│                                  │ Lokasi umum   [                     ] │
│                                  │ Ringkasan     [                     ] │
│                                  │ Status publik [Dalam penanganan ▾]    │
│                                  │ Tanggapan/tindak lanjut [           ] │
│                                  │ ⚠ Penanda: 2 kemungkinan data pribadi │
│                                  │   "Bpk. S…" (nama?) · "0812…" (telp)  │
│                                  │ Checklist penyusun ☐☐☐☐☐☐             │
│                                  │ [Simpan draf] [Ajukan] [Ajukan & setujui]│
└──────────────────────────────────┴───────────────────────────────────────┘
┌ 🌐 PRATINJAU PUBLIK — tampilan persis seperti di website ─ ─ ─ ─ ─ ─ ─ ─ ┐
  (render komponen halaman publik yang sama, dengan versi draf)
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### 5.9 Dialog persetujuan

```
┌──────────────────────────────────────────────┐
│ Setujui publikasi versi 3?                   │
│ Yang akan tampil di publik: lihat pratinjau  │
│ Perubahan dari versi tayang: [Lihat diff]    │
│ Disusun oleh: Rina · Penyetuju: Anda          │
│ (satu persetujuan cukup; boleh penyusun)     │
│                                              │
│ ☐ Tidak ada nama/kontak/nomor identitas      │
│ ☐ Waktu & lokasi sudah digeneralisasi        │
│ ☐ Tidak ada kutipan yang dapat dikenali      │
│ ☐ Tidak ada lampiran                         │
│ ☐ Penafian tampil                            │
│ ☐ Izin publikasi pengirim masih aktif ✓(sis.)│
│ ☐ 2 penanda data pribadi sudah dikonfirmasi  │
│                                              │
│ Catatan internal (opsional) [              ] │
│ [Batal] [Minta revisi] [Tolak] [Setujui]     │
│              (Setujui aktif jika semua ☑)    │
└──────────────────────────────────────────────┘
```

---

## 6. Rekomendasi bentuk formulir

| Formulir | Bentuk | Alasan |
|---|---|---|
| **Pelanggaran** | **Bertahap (4 langkah + pengantar)** | Isinya banyak dan emosional. Langkah kecil mengurangi beban, memberi ruang untuk menjelaskan kerahasiaan di tempat yang tepat, dan memisahkan identitas yang opsional dari isi laporan. |
| **Aspirasi** | **Satu halaman** + panel konfirmasi sebelum kirim | Field sedikit. Satu halaman lebih cepat dan cocok untuk aspirasi spontan. |
| **Balasan di pelacakan** | Satu field + lampiran opsional | — |

Perilaku bersama:

- Data langkah disimpan **di memori komponen**, bukan di `localStorage` atau `sessionStorage`. Pengguna yang memuat ulang halaman memang kehilangan isian, tetapi peringatan `beforeunload` membantu mencegah hal itu terjadi tanpa sengaja. Ini sengaja dipilih karena perangkat bisa dipakai bersama.
- Field sensitif memakai `autocomplete="off"` dan tidak memakai saran isian browser.
- Validasi berjalan saat field ditinggalkan dan saat lanjut langkah. Galat diringkas di atas formulir dengan tautan ke field. Fokus dipindah ke ringkasan galat.
- Tombol kirim dinonaktifkan selama proses berjalan dan menampilkan label “Mengirim…”. Pengiriman dilindungi idempotency key sehingga klik ganda tidak membuat dua kiriman.
- Halaman berhasil tidak dapat dibuka ulang lewat tombol Back. Kredensial hanya ada di state.

---

## 7. Spesifikasi formulir

### 7.1 Formulir pelanggaran

| # | Field | Status | Tipe & validasi | Alasan |
|---|---|---|---|---|
| 0 | Pernyataan “Saya sudah membaca penjelasan kerahasiaan” | **Wajib** (tombol “Saya mengerti, mulai”) | Aksi | Pengirim memahami batas anonimitas dan kemungkinan publikasi **sebelum** menulis |
| 1 | Kategori | **Wajib** | Pilihan dari daftar yang dikelola admin, termasuk “Lainnya” | Routing dan statistik |
| 2 | Judul singkat | **Wajib** | 10–120 karakter | Memudahkan triase. Petunjuk meminta pengirim tidak menulis nama di judul. |
| 3 | Uraian kejadian | **Wajib** | 50–5.000 karakter, teks polos | Inti laporan. Disertai pertanyaan pemandu: apa, kapan, di mana, bagaimana Anda tahu. |
| 4 | Waktu kejadian | **Wajib dipilih** | Tanggal pasti / perkiraan bulan / masih berlangsung / tidak ingat | Memaksa pengirim mempertimbangkan waktu tanpa menghalangi yang tidak tahu |
| 5 | Lokasi atau unit | Opsional | ≤ 200 karakter | Membantu investigasi, tetapi bisa mengungkap pelapor |
| 6 | Pihak yang diduga terlibat | Opsional | ≤ 1.000 karakter. Disimpan **terenkripsi**. | Penting untuk tindak lanjut, tetapi sangat sensitif |
| 7 | Bagaimana Anda mengetahui kejadian ini | Opsional | Saksi langsung / korban / mendengar dari orang lain / menemukan dokumen / lainnya | Menilai kekuatan informasi tanpa meminta identitas |
| 8 | Apakah sudah dilaporkan ke saluran lain | Opsional | Ya/Tidak/Tidak ingat + keterangan ≤ 300 | Mengetahui duplikasi dan eskalasi |
| 9 | Laporan ini melibatkan pengelola WBS atau pimpinan | Opsional | Kotak centang | Mengaktifkan kasus terbatas |
| 10 | Bukti/lampiran | Opsional | Maks. **5 file**, **10 MB/file**, total 25 MB. JPG, PNG, WebP, PDF **[A6]**. | Bukti memperkuat laporan. Disertai peringatan metadata. |
| 11 | Nama atau identitas | Opsional | ≤ 150 karakter. Disimpan **terenkripsi**. | Sebagian pelapor ingin dikenali. Tidak pernah wajib. |
| 12 | Kontak (email) | Opsional | Format email. Disimpan **terenkripsi**. Dipakai hanya untuk notifikasi “ada pembaruan” jika fitur diaktifkan (Q4). | Mempercepat komunikasi. Ada peringatan untuk tidak memakai email kantor. |
| 13 | Izin publikasi ringkasan tersamar | **Wajib dipilih** | Radio Ya/Tidak tanpa pilihan bawaan | Persetujuan harus aktif dan sadar |
| 14 | Pernyataan kebenaran dan ketentuan | **Wajib** | Kotak centang | Dasar penggunaan data yang sah |
| — | Anti-spam | Otomatis | Proof-of-work (ALTCHA) + honeypot + batas laju | Tanpa CAPTCHA visual yang menyulitkan |

### 7.2 Formulir aspirasi

| # | Field | Status | Tipe & validasi | Alasan |
|---|---|---|---|---|
| 1 | Kategori/topik | **Wajib** | Daftar dari admin | Pengelompokan |
| 2 | Judul | **Wajib** | 10–120 karakter | Kemudahan baca dan kurasi |
| 3 | Isi aspirasi | **Wajib** | 30–3.000 karakter | Inti aspirasi |
| 4 | Usulan atau manfaat yang diharapkan | Opsional | ≤ 1.000 karakter | Mendorong aspirasi yang konstruktif |
| 5 | Unit atau area terkait | Opsional | ≤ 200 karakter | Routing |
| 6 | Lampiran pendukung | Opsional | Maks. 3 file, 10 MB/file, JPG/PNG/WebP/PDF. **Tidak pernah dipublikasikan.** | Foto kondisi, dokumen usulan |
| 7 | Nama | Opsional | ≤ 150 karakter, terenkripsi. **Tidak ditampilkan di publik** (MVP). | Sebagian orang ingin dikenal oleh pengelola |
| 8 | Kontak (email) | Opsional | Terenkripsi | Notifikasi pembaruan |
| 9 | Izin publikasi | **Wajib dipilih** | Ya/Tidak, tanpa pilihan bawaan | Persetujuan sadar |
| 10 | Pernyataan ketentuan | **Wajib** | Kotak centang | Dasar penggunaan data |

### 7.3 Formulir lain

| Formulir | Field |
|---|---|
| Masuk pelacakan | Nomor Referensi (wajib, format dinormalisasi: huruf besar, tanpa spasi), Kunci Rahasia (wajib, `type=password` + tombol tampilkan, `autocomplete="off"`) |
| Balasan pengirim | Pesan (wajib, 1–3.000 karakter), lampiran (opsional, mengikuti batas jenis kiriman) |
| Versi publik (admin) | Judul publik (wajib, ≤ 120), kategori publik (wajib), periode umum (wajib untuk pelanggaran: triwulan/semester/tahun), lokasi umum (opsional), ringkasan (wajib, 100–3.000), status publik (wajib), tanggapan atau tindak lanjut (opsional, ≤ 2.000), pernyataan hasil (opsional, khusus pelanggaran), alasan perubahan (wajib untuk versi ≥ 2, internal) |
| Ubah status (admin) | Status tujuan (wajib, hanya opsi yang sah), alasan internal (wajib untuk ditutup, dibuka kembali, atau dikunci), pesan ke pengirim (wajib untuk butuh info dan selesai, opsional untuk lainnya) |

Teks publik di MVP berupa **teks polos dengan paragraf**, tanpa HTML atau Markdown kaya, agar risiko XSS kecil dan pratinjau selalu identik.

---

## 8. Contoh teks antarmuka

**Penjelasan anonim (langkah 0, formulir pelanggaran)**

> **Sebelum Anda mulai**
> Anda tidak perlu membuat akun atau menuliskan nama. Laporan Anda hanya dibaca oleh petugas pengelola yang berwenang, dan setiap akses tercatat.
> Kami tidak menyimpan alamat IP Anda bersama laporan. Meski begitu, **kami tidak dapat menjamin anonimitas sepenuhnya.** Identitas Anda tetap bisa diketahui dari isi cerita, dari lampiran, atau dari jaringan dan perangkat yang Anda gunakan. [Pelajari cara mengirim dengan lebih aman]
> Laporan asli, identitas, dan bukti **tidak pernah dipublikasikan**. Jika Anda mengizinkan, petugas dapat menulis **ringkasan yang disamarkan** untuk publik setelah diperiksa dan disetujui petugas yang berwenang.
> [Saya mengerti, mulai]

**Persetujuan penggunaan konten (field izin publikasi)**

> **Bolehkah kami mempublikasikan ringkasan yang disamarkan?**
> Jika Anda memilih **Ya**, petugas dapat menulis ulang inti laporan tanpa nama, jabatan, tanggal persis, atau detail lain yang dapat mengenali siapa pun, lalu menampilkannya di halaman Ringkasan Pelanggaran. Isi asli dan lampiran **tidak** ikut tampil. Anda dapat menarik izin ini kapan saja melalui halaman pelacakan.
> Jika Anda memilih **Tidak**, laporan tetap ditindaklanjuti secara tertutup.
> ( ) Ya, boleh dipublikasikan dalam bentuk ringkasan tersamar
> ( ) Tidak, jangan dipublikasikan

*(Versi aspirasi: “…petugas dapat menampilkan aspirasi Anda setelah menghapus informasi pribadi. Nama Anda tidak akan ditampilkan.”)*

**Pengiriman berhasil**

> **Laporan Anda sudah kami terima.**
> Simpan **Nomor Referensi** dan **Kunci Rahasia** di bawah ini. Keduanya diperlukan untuk melihat perkembangan dan menjawab pertanyaan petugas. **Kami tidak dapat menampilkan atau memulihkan kunci ini lagi.**

**Penyimpanan kode pelacakan**

> **Cara menyimpan dengan aman:** tulis di kertas dan simpan di tempat pribadi, atau simpan di pengelola kata sandi. Hindari menyimpannya di perangkat kantor atau perangkat bersama, dan jangan mengirimkannya lewat chat atau email kerja.
> Siapa pun yang memiliki kedua kode ini dapat melihat status laporan Anda.

**Pesan kesalahan**

| Situasi | Teks |
|---|---|
| Field wajib kosong | “Judul belum diisi. Tulis ringkasan singkat kejadian dalam 10–120 karakter.” |
| Terlalu pendek | “Uraian terlalu singkat. Tambahkan apa yang terjadi, kapan, dan di mana (minimal 50 karakter).” |
| Jenis file ditolak | “File *laporan.docx* tidak dapat diunggah. Gunakan JPG, PNG, WebP, atau PDF.” |
| File terlalu besar | “File *video.jpg* berukuran 14 MB. Batas per file adalah 10 MB.” |
| Lampiran gagal diproses | “Laporan Anda **sudah terkirim**, tetapi 1 lampiran gagal diunggah. Anda dapat menambahkannya dari halaman pelacakan.” |
| Batas pengiriman | “Terlalu banyak percobaan dari jaringan ini. Coba lagi dalam beberapa menit.” |
| Pelacakan gagal | “Nomor referensi atau kunci rahasia tidak cocok. Periksa kembali huruf dan angkanya.” *(Pesan sama untuk semua penyebab.)* |
| Pelacakan dikunci sementara | “Terlalu banyak percobaan. Demi keamanan, pelacakan untuk nomor ini dikunci selama 15 menit.” |
| Sesi pelacakan berakhir | “Sesi Anda berakhir untuk melindungi privasi. Masukkan kembali nomor referensi dan kunci.” |
| Galat server | “Terjadi kendala di sistem kami dan kiriman **belum** tersimpan. Isian Anda masih ada di layar. Silakan coba kirim lagi.” |
| Koneksi terputus | “Koneksi terputus. Isian Anda masih ada. Periksa koneksi, lalu tekan Kirim lagi.” |
| Akses ditolak (admin) | “Anda tidak memiliki akses ke kiriman ini. Jika memerlukan akses, hubungi Admin.” |

---

## 9. Batas klaim anonimitas

Teks berikut ditampilkan di `/kerahasiaan` dan diringkas di langkah 0:

| Sumber identitas bocor | Penjelasan untuk pengguna | Mitigasi dari sistem | Tips untuk pengguna |
|---|---|---|---|
| **Isi laporan** | Detail cerita bisa menunjukkan siapa Anda, misalnya “hanya saya yang bertugas malam itu”. | Penyamaran saat kurasi. Isi asli tidak dipublikasikan. | Tulis seperlunya. Hindari detail yang hanya diketahui Anda. |
| **Lampiran** | Foto dan dokumen dapat menyimpan lokasi GPS, nama perangkat, nama penulis, atau terlihat siapa yang memotret. | Metadata gambar dibuang dengan encode ulang. Metadata PDF dibersihkan. Lampiran tidak pernah dipublikasikan. | Periksa isi visual lampiran. Potong bagian yang menunjukkan Anda. |
| **Jaringan dan perangkat** | Penyedia hosting atau CDN dapat mencatat alamat IP untuk sementara. Jaringan atau perangkat kantor mungkin dipantau. | Aplikasi tidak menyimpan IP bersama laporan. Pembatasan laju memakai hash IP yang dihapus dalam 24 jam. Tidak ada analitik pihak ketiga. | Gunakan perangkat dan jaringan pribadi. Pertimbangkan mode penyamaran browser. |
| **Kontak yang Anda berikan** | Email dapat menunjukkan identitas. | Kontak opsional, terenkripsi, dan disembunyikan secara default. | Gunakan email pribadi yang tidak memuat nama Anda, atau kosongkan. |
| **Gaya tulisan** | Gaya bahasa yang khas dapat dikenali orang dekat. | Ringkasan publik ditulis ulang, bukan dikutip. | — |
| **Kode pelacakan** | Siapa pun yang memegang kode dapat melihat status. | Kode tidak pernah ada di URL. Sesi singkat. Lampiran tidak dapat diunduh dari pelacakan. | Simpan secara pribadi. |
| **Proses hukum** | Dalam kondisi tertentu, organisasi dapat diwajibkan hukum membuka data. | Data minimal, retensi terbatas, dan audit. | — |

Kalimat yang **tidak boleh** dipakai: “100% anonim”, “tidak dapat dilacak”, “dijamin aman”.
Kalimat yang dipakai: “Anda tidak perlu menuliskan identitas”, “kami tidak menyimpan alamat IP bersama laporan”, “kami tidak dapat menjamin anonimitas sepenuhnya”.

---

## 10. Komponen UI dan workflow 21st.dev / Magic MCP

### 10.1 Status koneksi

> **Magic MCP / 21st MCP belum tersedia di sesi perencanaan ini.** Belum ada pencarian, pemilihan, atau pemasangan komponen dari 21st.dev. Kolom “kandidat” di bawah berisi **kata kunci pencarian dan pola yang dicari**, bukan komponen yang sudah diverifikasi. Langkah bertanda **[MCP]** membutuhkan koneksi tersebut.

### 10.2 Workflow per komponen

| # | Langkah | Keluaran | Gerbang lolos |
|---|---|---|---|
| 1 | Tentukan kebutuhan dan wireframe | Baris di tabel 10.3 + wireframe §5 | Fungsi, state (loading/kosong/galat/berhasil/ditolak), dan perilaku mobile tertulis |
| 2 | **[MCP]** Cari komponen relevan | 2–3 kandidat per kebutuhan | Prompt hanya memakai **data sintetis** (lihat 10.4) |
| 3 | Periksa kandidat | Catatan di `docs/desain/komponen/<nama>.md` | **Lisensi** kompatibel (MIT/Apache-2.0/sejenis), sumber tercatat. **Dependensi**: tanpa paket berat atau tidak terawat; animasi berat ditolak untuk halaman formulir. **Aksesibilitas**: elemen semantik, fokus keyboard, label ARIA, kontras. **Kompatibilitas**: React 19, Tailwind v4, versi shadcn proyek, dan bisa dirender server bila memungkinkan. |
| 4 | Sesuaikan dengan design system | Komponen di `src/components/` | Hanya memakai token. Hapus warna hardcode, gradien, dan animasi dekoratif. Teks dalam bahasa Indonesia. |
| 5 | Integrasikan ke Next.js | Komponen dipakai di halaman | `"use client"` hanya bila perlu, tanpa akses data di klien, dan prop berupa DTO aman |
| 6 | Verifikasi | Checklist di PR | Lebar 360px, keyboard-only, pembaca layar (VoiceOver/TalkBack), validasi formulir, Lighthouse/axe tanpa galat kritis, ukuran bundle halaman formulir dicatat |

Jika tidak ada kandidat yang lolos gerbang 3, gunakan **komponen shadcn/ui dasar** dan susun sendiri.

### 10.3 Tabel kebutuhan komponen

| Prioritas | Halaman | Komponen & fungsi | Basis shadcn/ui | Kandidat 21st.dev (kata kunci pencarian) **[MCP]** | Penyesuaian wajib |
|---|---|---|---|---|---|
| P0 | Semua publik | **Header & navigasi** ramping + menu ponsel | `NavigationMenu`, `Sheet`, `Button` | “minimal header”, “mobile nav sheet”, “navbar with CTA” | Tombol “Lacak” selalu terlihat. Tanpa animasi scroll. Skip link “Langsung ke konten”. |
| P0 | Beranda | **Kartu pilihan layanan** | `Card`, `Button` | “feature card with icon”, “service selection card”, “CTA card” | Ikon + judul + deskripsi + label privasi. Aksen garis kiri dari token layanan. Seluruh kartu dapat diklik tetapi tetap berisi satu tautan. |
| P0 | Beranda/panduan | **Langkah cara kerja** | — | “steps section”, “how it works” | Statis, tanpa animasi masuk, dan berbentuk `ol` |
| P0 | Formulir | **Stepper/progress** | `Progress` | “multi-step form stepper”, “form wizard progress” | Teks “Langkah x dari y” wajib ada. Langkah tidak dapat diklik maju sebelum valid. |
| P0 | Formulir | **Field, radio, select, textarea + penghitung** | `Form`/`Field`, `Input`, `Textarea`, `RadioGroup`, `Select`, `Checkbox`, `Label` | “textarea with character count”, “radio card group” | Label “Wajib”/“(opsional)”, petunjuk, galat terkait `aria-describedby`, dan teks 16px |
| P0 | Formulir, pelacakan | **Unggah lampiran** | `Input type=file`, `Progress` | “file upload dropzone”, “file uploader with progress” | Wajib bisa memakai tombol, tidak hanya drag-drop. Validasi jenis/ukuran di klien. **Tanpa pratinjau thumbnail yang mengirim file ke pihak ketiga.** Ada tombol hapus per file. |
| P0 | Formulir | **Ringkasan sebelum kirim** | `Card`, `Separator` | “review step summary” | Ada tombol “Ubah” per bagian |
| P0 | Berhasil | **Tampilan kredensial** | `Card`, `Button` | “copy to clipboard code block”, “API key reveal card” | Font mono besar, salin per kode, unduh `.txt`, centang konfirmasi, dan tanpa auto-hide |
| P0 | Pelacakan, admin | **Timeline status** | — | “vertical timeline”, “activity feed” | Ikon + teks status. Versi pengirim hanya memuat kejadian yang terlihat pengirim. |
| P0 | Publik & admin | **Badge status** | `Badge` | “status badge with dot” | Dua gaya: penanganan (soft) dan publikasi (outline + ikon) |
| P0 | Daftar publik | **Pencarian & filter** | `Input`, `Select`, `ToggleGroup` | “search with filters”, “filter chips” | State disimpan di URL query. Ada tombol reset dan label yang dapat dibaca. |
| P0 | Daftar publik | **Kartu konten publik + paginasi** | `Card`, `Pagination` | “blog card list”, “list card with meta” | Pada pelanggaran, penafian tampil di daftar |
| P0 | Admin | **Tabel data** (urut, filter, paginasi server) | `Table` + TanStack Table | “data table with filters”, “admin table toolbar” | Paginasi di server dan kolom penting tetap di ponsel. **Tanpa** ekspor isi kiriman. |
| P0 | Admin | **Layout dashboard + sidebar** | `Sidebar` | “admin dashboard sidebar” | Sidebar gelap dan indikator peran |
| P0 | Admin | **Panel PRIVAT/PUBLIK** | `Card`, `Alert` | “callout box”, “highlighted section” | Token `private-*`/`public-*`, ikon gembok/globe, dan label teks |
| P0 | Admin | **Dialog persetujuan, tolak, tarik** | `AlertDialog`, `Dialog`, `Checkbox` | “confirmation dialog with checklist” | Tombol utama aktif hanya jika checklist lengkap. Fokus awal di judul. Esc menutup. |
| P0 | Semua | **Notifikasi/toast + alert** | `Sonner`, `Alert` | “toast notification” | Toast tidak boleh menjadi satu-satunya tempat pesan galat penting. `aria-live` polite. |
| P1 | Admin | **Penyunting ringkasan + penanda data pribadi** | `Textarea`, `Tabs` | “editor with inline warnings”, “text highlight” | Penanda dijalankan lokal dengan regex. Tidak ada panggilan ke API eksternal. |
| P1 | Admin | **Diff versi** | — | “text diff viewer” | Tambah/hapus memakai ikon dan warna |
| P1 | Admin | **Kartu statistik + grafik** | `Card`, `Chart` (Recharts) | “stats cards”, “KPI cards” | Hanya angka agregat dan ambang angka kecil |
| P1 | Publik | **FAQ accordion** | `Accordion` | “FAQ section” | — |
| P1 | Semua | **State kosong, galat, dan akses ditolak** | `Card` | “empty state” | Ilustrasi garis sederhana opsional dan selalu ada tindakan berikutnya |

### 10.4 Aturan data saat memakai layanan desain

- Prompt dan isi contoh **hanya memakai data sintetis**, misalnya “Dugaan pungutan pada layanan X”, “Nomor Ref WBS-00-AAAA-0000”.
- **Dilarang** mengirim isi laporan nyata, nama, kontak, bukti, Nomor Referensi atau Kunci Rahasia nyata, URL internal produksi, potongan database, file `.env`, atau kredensial apa pun ke 21st.dev, MCP, atau layanan AI/desain lain.
- Kode yang dihasilkan dianggap **kode pihak ketiga** dan harus melewati review PR seperti kode lain.

---

## 11. Kriteria penerimaan UI

| State | Kriteria |
|---|---|
| **Loading** | Daftar dan tabel memakai skeleton dengan ukuran yang sama dengan konten akhir (tanpa lompatan tata letak). Tombol aksi menampilkan label proses seperti “Mengirim…” atau “Menyimpan…” dan dinonaktifkan. Unggahan memiliki progress per file. Tidak ada spinner layar penuh di formulir. |
| **Kosong** | Daftar publik kosong menampilkan “Belum ada aspirasi yang dipublikasikan” + tautan ke formulir. Antrean admin kosong menampilkan “Tidak ada kiriman baru 🎉”. Hasil filter kosong menampilkan “Tidak ada hasil” + tombol reset filter. |
| **Galat** | Galat field muncul di bawah field dan di ringkasan atas, dengan fokus berpindah. Galat server tidak menghapus isian. Halaman 404 publik memakai teks yang ramah dan tidak membedakan konten ditarik dari yang tidak pernah ada. Galat tidak pernah menampilkan stack trace, ID internal, atau isi kiriman. |
| **Berhasil** | Pesan berhasil muncul di halaman, tidak hanya sebagai toast. Kredensial ditampilkan sesuai §5.4. Aksi admin menampilkan toast + status baru langsung terlihat. |
| **Akses ditolak** | Rute admin tanpa sesi diarahkan ke `/admin/masuk`. Pengguna yang login tetapi tidak berhak melihat halaman 403 tanpa membocorkan apakah kiriman ada. Pelacakan tanpa sesi diarahkan ke `/lacak`. Tombol yang tidak diizinkan disembunyikan, tetapi server tetap menolak bila dipanggil langsung. |
| **Mobile** | Dapat dipakai di lebar 360px tanpa scroll horizontal, kecuali tabel admin yang memiliki kolom prioritas. Target sentuh ≥ 44px. Teks field 16px. Tombol utama formulir menempel di bawah dan tidak tertutup keyboard. Diuji di Chrome Android dan Safari iOS. |
| **Aksesibilitas** | Navigasi penuh dengan keyboard dan fokus terlihat. Semua field memiliki label. Status dan galat tidak hanya dibedakan dengan warna. Kontras AA. `prefers-reduced-motion` dihormati. axe tanpa pelanggaran “serious/critical”. |
| **Kinerja** | Halaman formulir publik: LCP < 2,5 detik pada profil 4G lambat (Lighthouse mobile). JS halaman beranda dan formulir dicatat dan tidak naik > 20% tanpa alasan. |
| **Privasi UI** | Tidak ada isian sensitif di `localStorage` atau `sessionStorage`. Tidak ada kredensial di URL, judul tab, atau `Referer`. Panel PRIVAT dan PRATINJAU PUBLIK selalu berlabel teks. |
