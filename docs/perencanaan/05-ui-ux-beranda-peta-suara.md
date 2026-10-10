# 05 — Rencana UI/UX & Frontend: Beranda Canvas/SVG dan Peta Suara Isometrik

> Nama sementara produk: **Ruang Suara**, disimpan sebagai satu konstanta `NAMA_PRODUK` sehingga mudah diganti.
> Status: **draf v3 untuk ditinjau** (10 Okt 2026). Belum ada kode aplikasi yang ditulis dan belum ada dependency yang dipasang.
> Rendering mengikuti teknik kedua referensi: **Canvas 2D + SVG** untuk beranda (Astro Bubble Hero) dan **SVG berproyeksi isometrik** untuk pemetaan (Focus City). Rencana ini tidak memakai WebGL, scene 3D, ataupun library 3D.
> **Warna:** seluruh nilai warna di dokumen ini digantikan oleh [dok. 06](06-palet-warna-p3md.md) (identitas P3MD: navy, emas, ivory, marun). Nama warna lama (cobalt, cyan, mint, lavender) yang masih tersisa di bawah hanya istilah lama dan **tidak berlaku**.
> **Kebijakan publikasi (dikonfirmasi 10 Okt 2026):** ringkasan whistleblowing **dipublikasikan** dalam bentuk tersamar dengan izin pengirim. Setiap publikasi cukup disetujui **satu orang** berwenang (dok. 01 §1.3 P4).

**Hubungan dengan dokumen lain.** Dokumen ini menggantikan isi dokumen 02 untuk halaman pengunjung, yaitu arah visual publik (02 §2), beranda (02 §5.1–5.2), dan form sebagai halaman terpisah (02 §5.3–5.4, 02 §6). Isi dokumen 01–04 lainnya tetap berlaku: model privasi, status, peran, keamanan, model data, backend, dan dashboard admin.

---

## 1. Ringkasan perubahan

### 1.1 Perubahan dari v2 ke v3

| Area | v2 | **v3 (dokumen ini)** |
|---|---|---|
| Teknologi render | 2.5D tanpa WebGL, dengan React Three Fiber sebagai jalur upgrade | **Canvas 2D + SVG saja.** Three.js, React Three Fiber, Drei, WebGL, kamera perspektif, instancing, dan penanganan *context lost* **dihapus dari rencana**, termasuk dari jalur upgrade. |
| Istilah | “3D”, “kamera”, “scene” | **“Isometrik”**, “sudut proyeksi”, “tampilan” |
| Gaya bubble beranda | Sprite berbayang + 2 lapisan kedalaman parallax (tambahan) | **Mengikuti referensi**: bubble datar warna-warni di dalam wordmark, tanpa lapisan tambahan. Kedalaman muncul dari tumpukan ukuran dan posisi. |
| Komposisi beranda | Judul di bawah wordmark, ornamen referensi dibuang | **Mempertahankan komposisi referensi**: wordmark raksasa, judul berpotongan (“sliced”) di sisi kanan wordmark (desktop), orbit SVG, bingkai, dan tombol pil, dengan isi yang disesuaikan untuk aplikasi |
| Pecah bubble | Dibuang | Boleh dipertahankan sebagai interaksi dekoratif (desktop, pointer mouse), **tanpa penghitung, petunjuk, atau pengumuman `aria-live`** |
| Interaksi peta | Yaw + elevasi + zoom bebas + geser | **Drag horizontal saja** untuk mengubah sudut proyeksi dalam rentang terbatas, seperti referensi. Elevasi tetap. **Zoom bebas tidak ada di versi awal**, diganti fokus kelompok berbasis `viewBox` (§3.6). |
| Gestur mobile | Dua jari untuk memutar/zoom | Satu jari: geser **vertikal** menggulir halaman, geser **horizontal** memutar sudut (`touch-action: pan-y`), dan ketuk memilih. Tidak perlu gestur dua jari. |
| Label tampilan | 3D / 2D / Daftar | **Isometrik / 2D / Daftar** |
| Dependency | Tanpa library 3D | Tetap tanpa library 3D (§5.4) |
| Acceptance criteria | Masih ada FPS/render | Seluruh AC ditulis ulang untuk Canvas/SVG (§7) |

### 1.2 Yang dipertahankan dari rencana sebelumnya

- Kebutuhan fitur, alur pengguna, **form 5 langkah** dalam dialog, termasuk fokus, validasi, konfirmasi penutupan, dan seluruh kondisi pengiriman (§2.7).
- Kurasi publikasi: status penanganan dipisah dari status publikasi, dan hanya versi yang disetujui (oleh **satu** penyetuju berwenang) yang tampil.
- **Pemisahan data privat/publik.** Pemetaan, tooltip, pencarian, daftar, dan statistik hanya membaca skema publik `pub` (§5.5).
- Stack Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, dan workflow referensi 21st.dev / Magic MCP (dok. 02 §10).

### 1.3 Asumsi

| Kode | Asumsi |
|---|---|
| U1 | Mayoritas pengunjung memakai ponsel Android kelas menengah dengan 4G |
| U2 | Konten publik bervolume kecil: puluhan sampai ratusan pengajuan publik per tahun |
| U3 | Kategori publik ≤ 12 per jenis. Kelebihannya digabung menjadi “Lainnya” khusus di peta (§3.3). |
| U4 | Ringkasan pelanggaran dipublikasikan (**dikonfirmasi** 10 Okt 2026) sehingga kelompok Whistleblowing berisi data. Selama belum ada ringkasan yang tayang, kelompok ini tampil dalam status kosong yang jelas. |
| U5 | Agregasi waktu memakai zona Asia/Jakarta (WIB) dan dihitung di server |
| U6 | Supabase dipakai sebagai Postgres + Storage yang hanya diakses server (dok. 03 §2) |
| U7 | Magic MCP 21st.dev belum terhubung. Komponen yang perlu dicari ditandai **[MCP]**. |
| U8 | Kode Focus City **sudah diterima lengkap** (10 Okt 2026) dan dianalisis di §4.2. Satu hal yang masih terbuka: **lisensinya belum diketahui**, sehingga keputusan salin dengan atribusi atau tulis ulang diambil di T0. |

---

## 2. Spesifikasi beranda Canvas/SVG

### 2.1 Konsep visual

Beranda adalah **adaptasi langsung Astro Bubble Hero** dalam tema gelap:

- latar navy P3MD `#021E39` dengan bingkai tipis `navy-800` (dok. 06 §4.1),
- wordmark raksasa **“SUARA”** berisi confetti bubble yang mengambang pelan dan menyebar menjauhi pointer,
- dua garis orbit SVG yang berputar sangat pelan,
- judul besar yang “memotong” sisi kanan wordmark seperti “ASTRO. ASSOCiATION” di referensi,
- tombol pil bergaya referensi.

Kesan kedalaman dibentuk oleh **tumpukan bubble** (yang besar digambar dulu, yang kecil di atasnya), variasi ukuran, dan susunan lapisan wordmark, judul, dan orbit. Tidak ada efek cahaya atau lapisan tambahan di luar referensi.

### 2.2 Struktur lapisan

| Urutan (belakang → depan) | Elemen | Teknik | Sumber |
|---|---|---|---|
| 1 | Latar navy + bingkai | CSS | Referensi (`.aa-root` tema gelap) |
| 2 | Orbit: lingkaran besar kanan atas dengan titik planet, lingkaran kiri bawah dengan jejak titik-titik kecil | SVG + animasi CSS `rotate` 60 dtk / 90 dtk (berlawanan arah) | Referensi, warna diganti token |
| 3 | Wordmark “SUARA” berisi bubble | **Canvas 2D**: isi warna dasar → gambar bubble → masker `destination-in` dengan teks | Mesin `Bubbles` referensi (diadaptasi) |
| 4 | Logo Ruang Suara (kanan atas wordmark) | SVG statis, `role="img"` + label | Posisi logo kompas referensi, tanpa jarum yang mengikuti pointer |
| 5 | Judul `h1` “Suaramu Membuka Perubahan.” | **Teks HTML**, setiap baris berlatar navy solid (efek “sliced”) | Gaya `.aa-hero-title` referensi |
| 6 | Deskripsi, tombol, catatan kaki | HTML | Baris `.aa-hero-row` referensi |

Wordmark canvas ditandai `aria-hidden="true"`, sehingga judul hanya diumumkan sekali oleh pembaca layar. Latar solid di belakang setiap baris judul menjamin kontras teks, apa pun posisi bubble di belakangnya.

### 2.3 Layout desktop (lebar ≥ 760px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│▓ bingkai                                                                   ▓│
│ ◌ Ruang Suara                       Peta Suara   Lacak Kiriman   Panduan [⏸]│
│                        ╭──────── orbit ─────────╮                 ╭──╮      │
│  ███████ ██   ██  █████   ██████   █████         │                │◎ │ logo │
│  ██▓▒░·  ██▒  ██ ██▒▓░██ ██▒▓░██  ██▒·▓██        │                ╰──╯      │
│  ░▒▓███  ██▓  ██ ███████ ███▓▒░  ┌──────────────────────────┐               │
│     ▒██  ██░  ▓█ ██▒  ██ ██▒ ▓█  │ Suaramu                  │ ← h1 "sliced" │
│  ██▓▒░█   ▓███▒  ██░  ██ ██▒  █▓ │ Membuka Perubahan.       │   (teks HTML) │
│   ╰─ orbit kiri dengan jejak titik └──────────────────────────┘             │
│                                                                             │
│  ✱ Sampaikan laporan dan aspirasi untuk lingkungan yang lebih baik.         │
│                                                                             │
│  ( 🛡 LAPORKAN PELANGGARAN → )        ( 💡 SAMPAIKAN ASPIRASI → )             │
│    Rahasia · ditinjau petugas           Ide, saran, dan kritik              │
│                     ( ◇ JELAJAHI PEMETAAN )   ← pil garis                    │
│ ─────────────────────────────────────────────────────────────────────────── │
│ TANPA AKUN · DITINJAU SEBELUM TAMPIL · BUKAN LAYANAN DARURAT   FAQ · PRIVASI │
└─────────────────────────────────────────────────────────────────────────────┘
```

- Kontainer hero `min-height: 100svh`. Konten yang lebih tinggi dari viewport membuat halaman dapat digulir, sehingga tidak ada yang terpotong.
- Pita wordmark `clamp(200px, 40cqi, 520px)`, dan lebar huruf ±90% kontainer (`fit 0,9`), sesuai nilai referensi.
- **Tombol kiri dan kanan setara**: ukuran, bentuk pil, dan tipografi (uppercase 800) sama.
  - Kiri fill ivory dengan teks navy. Kanan fill emas dengan teks navy (dok. 06 §4.2). Tidak ada tombol berwarna merah.
  - Masing-masing berikon dan memiliki satu baris keterangan di bawahnya.
  - Keduanya berupa `<a href="/kirim/...">` yang di-*intercept* menjadi dialog, sehingga **tetap berfungsi tanpa JS** dan saat canvas gagal.
- **“Jelajahi Pemetaan”** adalah pil bergaris `ivory-200` (`.aa-btn-line` referensi) di tengah, sebagai tombol sekunder.
- Elemen referensi yang **tidak dipakai**: “#102”, logo kompas yang mengikuti pointer, Asterisk sebagai tombol, dan teks kredit. Asterisk boleh tampil sebagai ornamen SVG non-interaktif di depan deskripsi. Garis kredit diganti catatan kaki janji layanan.

### 2.4 Layout mobile (< 760px) dan layar pendek

```
┌──────────────────────────────┐
│ ◌ Ruang Suara        [⏸] [☰] │
│ ╭ orbit ╮                    │
│ █████ ██ ██ ████ █████ ████  │ ← wordmark (fit 1,04 seperti
│ ██▓▒  ██▒██ ██▒█ ██▒▓█ ██▒█  │   referensi), bubble lebih sedikit
│ Suaramu                      │ ← h1 di bawah wordmark
│ Membuka Perubahan.           │   (perilaku !wide referensi)
│ ✱ Sampaikan laporan dan      │
│ aspirasi untuk lingkungan    │
│ yang lebih baik.             │
│ ( 🛡 LAPORKAN PELANGGARAN → ) │ ← lebar penuh, ≥ 56px
│ ( 💡 SAMPAIKAN ASPIRASI   → ) │   urutan kiri → atas
│ (    ◇ JELAJAHI PEMETAAN    ) │
│ TANPA AKUN · DITINJAU DULU   │
│ Lacak · FAQ · Privasi        │
└──────────────────────────────┘
```

- Perpindahan ke layout mobile memakai **CSS container query** (`@container (min-width: 760px)`), bukan pengukuran JS. Referensi memakai `useWide()` dengan nilai awal `true`, yang menimbulkan lompatan tata letak di ponsel.
- Pada layar pendek (tinggi < 640px atau lanskap), pita wordmark mengecil menjadi `clamp(120px, 28svh, 220px)` dan konten tetap mengalir.
- Bingkai tetap ada dengan ketebalan 6px.

### 2.5 Mesin bubble Canvas 2D

| Aspek | Spesifikasi |
|---|---|
| Tata letak | `mulberry32(seed)` + `buildBubbles()` dari referensi: deterministik, ukuran condong kecil, yang besar digambar lebih dulu. Seed tetap (mis. 102) agar komposisi sama di setiap kunjungan. |
| Warna | Dari token dok. 06 §4.1: warna dasar huruf `--bubble-0` (`navy-800`), bubble dari `--bubble-set` (emas, emas lembut, ivory, turunan navy, marun 4%). Dibaca dari CSS variable sekali saat mount. |
| Masker | `destination-in` + `fillText("SUARA")`. Font display dibaca dari `getComputedStyle(el).fontFamily` karena `next/font` memakai nama family ber-hash. Ukuran diukur ulang setelah `document.fonts.ready`. |
| Gerak | Drift sinus per bubble (amplitudo 1–4,5px, kecepatan 0,25–0,85), nilai referensi |
| Respons pointer | Dorongan menjauh dalam radius `max(70, 0,34 × sisi terpendek)` dengan pegas balik 0,09 (nilai referensi). Kekuatan dan radius dijadikan **parameter** yang ditinjau di T1 dan dapat diturunkan bila terasa terlalu ramai. |
| Pecah (opsional) | Aktif hanya untuk pointer **mouse** di desktop. Klik sah jika gerak < 6px, bukan pada elemen interaktif, dan piksel di bawah pointer terlukis. Percikan memakai nilai referensi. **Tanpa** penghitung, tanpa petunjuk “Click the bubbles”, dan tanpa `aria-live`. Nonaktif di perangkat sentuh dan saat reduced motion. |
| Ukuran & DPR | `ResizeObserver` pada canvas. DPR dibatasi: desktop 2, mobile 1,5, perangkat lemah 1. |
| Jumlah bubble | Rumus referensi (luas / unit²) lalu **dibatasi**: desktop ≤ 900, mobile ≤ 350, perangkat lemah ≤ 180. Tanpa batas, referensi dapat mencapai 1.400. |
| Loop | `requestAnimationFrame`. **Berhenti** saat tab tidak aktif (`visibilitychange`), canvas di luar layar (`IntersectionObserver`), animasi dijeda pengguna, atau dialog form terbuka. Semua listener dilepas saat unmount. |
| Perangkat lemah | Dideteksi dari `deviceMemory ≤ 2`, `hardwareConcurrency ≤ 4`, `Save-Data`, atau rata-rata waktu gambar > 12ms selama 3 detik. Dampaknya: batas bubble terendah, dorongan pointer mati, dan maksimal 30 fps. Turun sekali dan tidak naik lagi dalam sesi yang sama. |
| `prefers-reduced-motion` | Canvas digambar **satu kali** (statis), tanpa loop, drift, dorongan, pecah, atau putaran orbit. Tombol jeda disembunyikan. |

### 2.6 Kondisi elemen beranda

| Elemen | Default | Hover | Focus-visible | Pressed | Lainnya |
|---|---|---|---|---|---|
| Tombol pil utama | Solid ivory (kiri) / emas (kanan), tanpa bayangan berwarna | Naik 2px, bayangan memanjang, panah bergeser 3px (gaya referensi) | Cincin ganda sesuai dok. 06 §4.2 | `scale(.97)` | Saat navigasi: panah menjadi spinner kecil, `aria-busy` |
| Jelajahi Pemetaan | Pil bergaris `ivory-200` | Fill `ivory-100` 12% | Sama | Sama | — |
| Jeda animasi | Ikon ⏸ + label tersembunyi | Latar 10% | Cincin ganda dok. 06 §4.2 | — | `aria-pressed`. Preferensi disimpan di `localStorage` sebagai kenyamanan per pengunjung. |
| Wordmark sebelum JS / saat loading | **Wordmark statis CSS**: teks “SUARA” dengan `background: bubbleCss(...)` + `background-clip: text` (fungsi `bubbleCss()` referensi), dirender di server | — | — | — | Canvas tampil dengan crossfade 200ms setelah frame pertama digambar |
| Canvas tidak tersedia / galat | Wordmark statis CSS tetap tampil | — | — | — | Tidak ada pesan ke pengguna. Tombol dan form tetap berfungsi. |
| Dialog form terbuka | Overlay navy 70% + blur 4px. Loop canvas berhenti, orbit `animation-play-state: paused`. | — | — | — | Dilanjutkan setelah dialog ditutup |

### 2.7 Form pengajuan (dipertahankan dari v2, tanpa perubahan fungsi)

**Wadah.**

- Desktop memakai dialog terpusat 720px dengan isi yang dapat digulir. Mobile memakai dialog fullscreen (`100dvh`).
- Permukaan form **terang**.
- Kepala berisi ikon jenis, judul, “Langkah x dari 5”, progres, dan tombol tutup berlabel.
- Kaki berisi Kembali/Lanjut/Kirim. Di mobile, kaki menempel di bawah dan naik di atas keyboard (`visualViewport`).
- URL memakai **intercepting route** `/kirim/pelanggaran` dan `/kirim/aspirasi`. Back menutup dialog, dan tautan langsung membuka halaman penuh.

**Fokus.** Saat dibuka, fokus ke judul dan terkunci di dalam dialog. Esc menutup dialog, lalu fokus kembali ke tombol pemicu.

**Konfirmasi tutup.** Jika ada isian, muncul “Buang isian?” dengan tombol [Lanjutkan mengisi] (fokus awal) dan [Buang isian]. Draf **hanya disimpan di memori** (provider di layout publik) agar tidak hilang saat dialog tertutup lewat Back. Draf tidak pernah ditulis ke `localStorage`/`sessionStorage`. Reload dilindungi `beforeunload`.

| Langkah | Whistleblowing | Aspirasi |
|---|---|---|
| — | Pita kerahasiaan (dapat diciutkan): tanpa akun, IP tidak disimpan bersama laporan, anonimitas tidak mutlak | Catatan singkat: dapat dipublikasikan setelah dikurasi |
| 1 | Kategori + judul (10–120) | Kategori + judul (10–120) |
| 2 | Kronologi (50–5.000), waktu (pasti / perkiraan bulan / masih berlangsung / tidak ingat), lokasi bila relevan, pihak terlibat (opsional, terenkripsi), centang “melibatkan pengelola” | Kondisi atau kebutuhan (30–3.000) |
| 3 | Bukti 0–5 file (JPG/PNG/WebP/PDF, 10 MB) | Usulan perbaikan (opsional, ≤ 1.500) + manfaat |
| 4 | Kontak opsional + penjelasan kegunaan, tombol “Lewati” setara | Lampiran 0–3 file + kontak opsional |
| 5 | Tinjau + [Ubah] per bagian + **izin publikasi ringkasan tersamar** (tanpa pilihan bawaan) + pernyataan | Tinjau + izin publikasi (nama tidak ditampilkan) + pernyataan |

**Kondisi form:**

| Kondisi | Perilaku |
|---|---|
| Validasi | Dijalankan saat field ditinggalkan dan saat “Lanjut”. Galat tampil di bawah field dan terhubung lewat `aria-describedby`. Jika ada > 1 galat, ringkasan galat muncul di atas dan menerima fokus. |
| Unggah | Jenis atau ukuran yang ditolak mendapat pesan spesifik, dan kuota ditampilkan (“2 dari 5 file”). File diunggah setelah teks terkirim, dengan progres per file. Jika sebagian gagal, kiriman tetap tersimpan dan lampiran dapat ditambahkan lewat pelacakan. |
| Mengirim | Tombol menjadi “Mengirim…” dan kontrol nonaktif. Idempotency key mencegah kiriman ganda. |
| Gagal | Banner “Kiriman **belum** tersimpan, isian masih ada” + [Coba kirim lagi]. Isian tidak pernah dihapus. |
| Berhasil | Pesan “Diterima untuk ditinjau. Belum dipublikasikan.” Nomor Referensi + Kode Akses ditampilkan dengan huruf mono, tombol salin, dan unduh `.txt`. Dialog tidak dapat ditutup sebelum “Saya sudah menyimpan kode ini” dicentang. |

Seluruh teks mengikuti dok. 02 §8. Tidak ada klaim “100% anonim”.

---

## 3. Spesifikasi pemetaan isometrik SVG

### 3.1 Konsep

**Peta Suara** adalah adaptasi Focus City: header navy, dengan area peta berupa kartu terang (bidang dasar `ground-200`) agar kedua kelompok terlihat jelas (dok. 06 §4.4).

- Dua kelompok balok berdampingan di atas bidang dasar: **Whistleblowing di kiri, Aspirasi di kanan**, konsisten dengan posisi tombol di beranda.
- Setiap balok dibentuk dari **tiga bidang SVG berwarna berbeda** (atap, sisi kiri, sisi kanan) yang diproyeksikan secara isometrik.
- Tampilan bersih: tanpa bayangan, gradien, atau filter SVG.
- Balok yang dipilih ditandai garis tepi, ada tooltip saat hover, dan ada transisi morph antara isometrik dan datar.

### 3.2 Adaptasi struktur data Focus City

Focus City menghitung **menit per hari** dalam kalender minggu × hari. Peta Suara menghitung **jumlah pengajuan publik per kategori per periode** untuk dua jenis. Struktur dan agregasinya dirancang ulang:

| Focus City | Peta Suara | Rancangan |
|---|---|---|
| `FocusDay { date, sessions[] }` dikirim lengkap ke klien | `DatasetPeta` berisi **agregat** dari server (§5.5) | Klien tidak pernah menerima item mentah untuk dihitung sendiri. Item diambil per balok saat dipilih (paginasi). |
| `minutesOf(day)` = jumlah menit sesi | `jumlah` = banyaknya konten publik tayang di kelompok itu | `COUNT(*)` dari `pub.peta_item_v` |
| `calendar()`: 7 baris (hari) × N kolom (minggu) | `tataLetak()`: per kelompok, **baris = kategori publik** (urutan admin), **kolom = periode** | Dua kelompok dipisah “jalan” selebar 2,5 sel |
| Dasar waktu: tanggal sesi | **`first_published_at`** dikelompokkan dalam WIB | Bukan tanggal kiriman (dapat membantu mengenali pengirim) dan bukan tanggal kejadian (privat atau sudah digeneralisasi) |
| `defaultWeeks: 4 \| 12` | Preset periode (§3.3) | Granularitas bulan, triwulan, atau tahun |
| `level()`: warna menurut menit | **Dihapus.** Warna hanya membedakan kelompok. | Tinggi adalah satu-satunya penanda jumlah |
| `future`: hari mendatang diratakan | Periode mendatang tidak ditampilkan | Rentang selalu berakhir di periode berjalan |
| `endDate` + `today` dalam UTC | `sampai` ditentukan server dalam WIB | Memperbaiki salah tanggal pukul 00.00–07.00 WIB |
| `onDaySelect(day)` | `onPilihBlok(jenis, kategoriId, periode)` | Memuat daftar item publik di panel |
| Bilah hari terpilih + tombol ‹ › | Bilah blok terpilih + **‹ blok sebelumnya / berikutnya ›** | Alternatif navigasi tanpa drag dan hover |
| “Session breakdown” | Rincian status publik + daftar pengajuan publik | — |
| Total focus / Daily average / Best streak | Pengajuan publik / per kelompok / selesai ditindaklanjuti | §3.9 |

**Aturan agregasi (server):**

1. Ambil baris `pub.peta_item_v` dalam rentang periode.
2. Terapkan filter jenis, kategori, status publik, dan pencarian `q` pada judul atau ringkasan publik.
3. Kelompokkan per `(jenis, kategori_publik_id, kunci_periode)`.
4. Hitung `jumlah` dan rincian `status_publik`.
5. Hitung metrik total.
6. Tentukan `batasSkala` (§3.4).

Karena sumbernya hanya view publik, angka privat tidak mungkin ikut terhitung.

### 3.3 Periode dan pengendalian jumlah elemen

| Aturan | Ketetapan |
|---|---|
| Periode default | **4 triwulan terakhir** (termasuk triwulan berjalan), per triwulan, jadi 4 kolom |
| Pilihan | Triwulan ini (per bulan) · 4 triwulan terakhir · 12 bulan terakhir (per bulan) · Tahun berjalan (per bulan) · Semua waktu (per tahun) · Rentang khusus |
| Granularitas otomatis | ≤ 12 bulan → per bulan. 13–36 bulan → per triwulan. > 36 bulan → per tahun. |
| **Batas kolom** | Isometrik ≤ **12 kolom**. Jika lebih, granularitas otomatis naik satu tingkat dengan pemberitahuan. 2D dan Daftar ≤ 24 kolom. |
| **Batas baris** | ≤ **12 kategori** per kelompok. Kategori di luar 11 teratas (menurut urutan admin) digabung menjadi baris **“Lainnya”** di peta. Daftar dan panel tetap menampilkan kategori asli. |
| Anggaran elemen | Isometrik maksimal 2 × 12 × 12 = **288 balok × 3 bidang = 864 poligon**. Semua ubin dasar kosong digabung menjadi **1 `<path>` per kelompok**. Label maksimal ± 40 `<text>`. Target total ≤ 1.000 elemen SVG. |

### 3.4 Makna visual dan skala

| Elemen | Arti | Tidak berarti |
|---|---|---|
| **Kelompok** (kiri/kanan) | Jenis pengajuan, dengan label di bidang dasar + ikon | — |
| **Baris** | Kategori publik dengan urutan stabil | Peringkat atau prioritas |
| **Kolom** | Periode, dari terlama (belakang) ke terbaru (depan) | — |
| **Balok** | Satu kategori × satu periode dalam satu jenis | Satu orang, lokasi, atau unit kerja |
| **Tinggi** | **Jumlah pengajuan publik**, dengan skala linear **yang sama** untuk kedua kelompok | Tingkat keparahan, kesalahan seseorang, atau kebenaran tuduhan |
| **Warna** | Jenis saja. Whistleblowing: keluarga navy/slate-blue. Aspirasi: keluarga emas/ochre. Tiga bidang memakai tiga tingkat warna tetap (dok. 06 §4.5) yang tidak dipengaruhi data. | Status atau keparahan |
| **Pola atap** | Whistleblowing: garis diagonal tipis. Aspirasi: titik tengah. Ini pembeda kedua selain warna. | — |
| **Cincin ganda (ivory + navy)** | Balok yang dipilih atau difokus keyboard | — |

Teks legenda: *“Satu balok = satu kategori dalam satu periode. Tinggi balok menunjukkan jumlah pengajuan yang telah dipublikasikan, bukan tingkat keparahan atau kebenaran laporan. Periode dihitung dari tanggal pertama kali dipublikasikan.”* Peta ini **bukan peta geografis**, dan tidak ada koordinat lokasi.

| Aturan skala | Ketetapan |
|---|---|
| Rumus | `z = jumlah × unit`, `unit = H_MAKS / batasSkala`. `batasSkala` adalah angka bulat (1, 2, 5, 10, 20, 50…) ≥ maksimum **di kedua kelompok**. Legenda menampilkan penanda skala, misalnya “█ = 5 pengajuan”. |
| Ukuran tetap saat diputar | Focus City menghitung ulang skala layar (`fit`) di setiap sudut, sehingga kota tampak “bernapas”. Di sini skala layar dihitung **sekali per dataset** dari batas footprint pada seluruh rentang sudut + `H_MAKS`, jadi memutar tidak mengubah ukuran. |
| Nol | Ubin dasar datar, redup, dan bergaris putus-putus. Dapat dipilih dan menampilkan “Belum ada pengajuan publik di kelompok ini.” |
| Sangat sedikit | Tinggi minimum 6% `H_MAKS` untuk jumlah ≥ 1, dijelaskan di legenda |
| Ekstrem | Jika `maks > 2,5 × tertinggi kedua` dan `maks ≥ 10`, batas skala = tertinggi kedua × 1,5 (dibulatkan). Balok yang melampaui batas digambar setinggi `H_MAKS` dengan **penanda patahan ≋** dan **label angka asli** yang selalu tampil. Opsi “Skala penuh” menampilkan proporsi murni. |
| Susunan stabil | Posisi slot = (urutan kategori, indeks periode). Filter kategori, status, atau pencarian **meredupkan atau meratakan** balok, bukan menghapus slot. Perubahan tinggi dianimasikan 300ms (instan saat reduced motion). |

### 3.5 Geometri dan urutan gambar

Konsep proyeksi diambil dari `geometry()` Focus City:

```
proyeksi(x, y, z) = [ x·cos(θ) − y·sin(θ) ,  (x·sin(θ) + y·cos(θ))·k − z ]
  θ = sudut proyeksi (diubah dengan drag horizontal)
  k = 0,46 (kemiringan tetap, sama dengan referensi)
```

- **Dunia**: sel berukuran 1, footprint balok 0,79 (nilai referensi). Kelompok Whistleblowing berada di x ∈ [0, K), lalu jalan selebar 2,5, lalu Aspirasi di x ∈ [K + 2,5, 2K + 2,5). Baris kategori berada di sumbu y.
- **Setiap balok** menyimpan 4 titik dasar + 4 titik atap. Yang digambar adalah **atap + sisi kiri + sisi kanan**. Dalam rentang yaw 14°–46° kedua sisi ini selalu yang menghadap pengamat (seperti di referensi), sehingga tidak perlu menghitung ulang sisi terlihat.
- **Urutan gambar**: painter’s algorithm dengan `kedalaman = x_pusat·sin(θ) + y_pusat·cos(θ)`, diurutkan menaik dan dihitung ulang setiap θ berubah. Karena semua balok berfootprint sama dan tidak berpotongan di bidang dasar, urutan ini menghasilkan tumpang tindih yang benar untuk kedua kelompok dan jalan di antaranya. Ini diverifikasi dengan uji unit pada sudut minimum, default, dan maksimum.
- **Lapisan SVG**, dari bawah ke atas:
  1. Bidang dasar + ubin kosong + label kelompok di tanah.
  2. Balok terurut.
  3. Label kategori/periode (`<text>`, selalu tegak menghadap layar).
  4. Penanda ekstrem dan cincin pilihan, digambar teratas agar tidak tertutup.
- **Responsif**: `<svg viewBox>` dengan `preserveAspectRatio="xMidYMid meet"` dan `width: 100%`. Ukuran viewBox dihitung dari batas geometri (§3.4), sehingga peta menyesuaikan lebar kontainer tanpa perhitungan piksel di JS.

### 3.6 Interaksi

| Interaksi | Spesifikasi |
|---|---|
| **Drag horizontal = ubah sudut** | Mengikuti referensi: `Δθ = Δx / 540` radian per piksel (≈ 0,106°/px). Yaw **default 30°** (`π/6`), dijepit pada **0,24–0,81 rad (≈ 13,8°–46,4°)**, tanpa inersia. Drag baru aktif setelah gerak > **5px**, lalu pointer capture dipakai. Pembaruan dibatasi satu per `requestAnimationFrame`. Dengan rentang ini, Whistleblowing tetap di kiri dan Aspirasi di kanan (diverifikasi di uji unit pada sudut minimum, default, dan maksimum). Petunjuk “Seret untuk memutar” dan tombol reset yang hanya muncul saat sudut berubah mengikuti referensi. **Klik ganda pada peta juga mereset sudut.** |
| Hitung ulang | Setiap perubahan θ menghitung ulang proyeksi, bidang yang terlihat, dan urutan kedalaman. Tanpa interaksi, **tidak ada pekerjaan render**. |
| **Bedakan drag dan klik** | Mengikuti referensi: gerak > **5px** dianggap drag dan **menandai klik berikutnya diabaikan** (`skipClick`). Gerak ≤ 5px dianggap klik. Tidak ada syarat durasi. Hover dan tooltip dimatikan selama drag, dan tidak berlaku untuk `pointerType === "touch"`. |
| **Hover** (pointer halus) | Tooltip HTML melayang di atas atap balok setelah 80ms, misalnya “💡 Aspirasi · Fasilitas Umum · Trw III 2026 — 7 pengajuan publik”. Balok sedikit lebih terang. Tidak ada tooltip di perangkat sentuh. |
| **Klik/ketuk** | Memilih balok: cincin ganda ivory + navy pada atap, balok lain diredupkan ke 45%, panel menampilkan ringkasan blok + daftar item, dan URL diperbarui (`blok=`) |
| **Tombol sudut** | [⟲] [⟳] mengubah sudut ±8° dalam rentang yang sama. [Reset sudut] kembali ke 30° dan hanya tampil bila sudut sudah berubah (seperti referensi). Semua berlabel dan dapat diakses keyboard. Area sentuh 44px di perangkat kasar (`pointer: coarse`, seperti referensi). |
| **Navigasi blok** | ‹ sebelumnya / berikutnya › menelusuri per baris lalu per kolom, dan melewati blok kosong saat filter aktif |
| **Fokus kelompok** | Kontrol segmented “Keduanya · Whistleblowing · Aspirasi”. Implementasinya **mengubah `viewBox`** agar pas dengan kelompok terpilih (transisi 300ms, instan saat reduced motion). Ini satu-satunya bentuk “zoom” di versi awal. |
| **Zoom bebas** | **Tidak ada di versi awal.** Alasannya: (a) seluruh peta muat di satu layar dengan batas 12 × 12 per kelompok, (b) detail tersedia lewat tooltip, panel, dan Daftar, (c) zoom lewat roda atau cubit bersaing dengan scroll halaman. Jika kelak diperlukan: skala `viewBox` 1×–2× hanya lewat tombol +/−, dengan geser dibatasi batas geometri. |
| **Tampilan** | **Isometrik / 2D / Daftar** (segmented, disimpan di URL `tampilan=iso\|2d\|daftar`). Isometrik ↔ 2D memakai **morph** referensi (`lerpPoints` + `useMorph`, 380ms): balok merata menjadi sel kisi, lalu angka di setiap sel muncul. Daftar berupa tabel HTML. Dataset, filter, dan pilihan **sama** di ketiga tampilan. |
| **Filter** | Jenis (2 checkbox; kelompok yang tidak dipilih diratakan dan diredupkan), kategori (multi, per jenis), status publik (multi, per jenis karena labelnya berbeda), dan periode (§3.3). Chip filter aktif + “Reset filter”. Di mobile, semua filter ada dalam sheet “Filter (n)”. |
| **Pencarian** | Judul dan ringkasan publik, debounce 300ms, minimal 3 karakter. Tinggi balok mengikuti jumlah yang cocok. |

### 3.7 Mobile dan scroll

- Area SVG memakai `touch-action: pan-y`. Geser **vertikal** satu jari tetap menggulir halaman (ditangani browser). Geser **horizontal** diteruskan sebagai pointer event untuk mengubah sudut. Ketuk memilih balok.
- Tidak ada gestur dua jari dan tidak ada zoom cubit, sehingga tidak ada perebutan gestur dengan scroll halaman.
- Tombol sudut, navigasi blok, dan tampilan **Daftar** selalu tersedia sebagai alternatif tanpa gestur.
- Tinggi area peta di mobile 56svh. Panel detail menjadi **bottom sheet** (snap 40% / 90%).

### 3.8 Susunan halaman

```
Desktop (≥ 1024px)
┌───────────────────────────────────────────────────────────────────────────┐
│ ← Beranda   ◌ Ruang Suara                                 Lacak · Panduan │
│ Peta Suara                                                                │
│ Pengelompokan pengajuan yang telah disetujui untuk publik — bukan peta    │
│ lokasi                                                                    │
│ 128 pengajuan publik │ 🛡 34 · 💡 94 │ 52 selesai ditindaklanjuti           │ ← metrik
├───────────────────────────────────────────────────────────────────────────┤
│ [⌕ Cari] [Jenis▾][Kategori▾][Status▾][4 triwulan▾] (Isometrik|2D|Daftar)  │
├───────────────────────────────────────────────┬───────────────────────────┤
│ 📅 Okt 2025 — Sep 2026     Seret untuk memutar  │ PANEL DETAIL              │
│        WHISTLEBLOWING 🛡     ASPIRASI 💡         │ kosong / blok / item      │
│        ▄ █ ▂ ▆              ▂ ▄ █ ▆ ▃           │                           │
│      ▂ ▆ █ ▄ ▂     jalan    ▆ █ ▃ ▂ ▄           │                           │
│        ▄ ▂ ▆ ▂              ▃ ▂ ▆ ▄ █           │                           │
│ [⟲][⟳] [Reset sudut]  Fokus:(Keduanya|WB|ASP)   │                           │
├───────────────────────────────────────────────┤                           │
│ ‹ blok sebelumnya │ Aspirasi · Fasum · Trw III │ berikutnya ›               │
│ Legenda: satu balok = … █ = 5 pengajuan        │                           │
└───────────────────────────────────────────────┴───────────────────────────┘
```

**Panel detail:**

| Mode | Isi |
|---|---|
| Kosong | Petunjuk + legenda singkat |
| Blok | Judul kelompok · kategori · periode, jumlah, **rincian status publik** (badge + angka), dan daftar item (judul, badge status, tanggal publikasi, cuplikan ≤ 160 karakter) dengan paginasi 10 |
| Item | ← kembali, judul, badge status publik, kategori, periode umum, **ringkasan publik**, **tindak lanjut/tanggapan**, “versi disetujui · diperbarui [tanggal]”, dan tautan ke `/aspirasi/[kode]` atau `/ringkasan/[kode]`. **Item Whistleblowing selalu disertai penafian** “Publikasi tidak berarti dugaan terbukti.” |
| Wadah | Desktop: panel kanan 400px. Mobile: bottom sheet. Saat dibuka, fokus pindah ke judul panel. Saat ditutup, fokus kembali ke balok asal. |

**Kondisi halaman:**

| Kondisi | Perilaku |
|---|---|
| Muat awal | Server merender HTML lengkap: metrik, SVG peta pada sudut default, dan legenda. Interaksi aktif setelah hidrasi. |
| Filter berubah | Data lama tetap tampil dengan indikator “Memperbarui…”, lalu tinggi balok bertransisi |
| Kosong karena filter | “Tidak ada pengajuan publik yang cocok” + [Reset filter] |
| Belum ada konten publik | Dua kelompok tampil sebagai ubin datar + “Belum ada pengajuan yang dipublikasikan. Pengajuan selalu ditinjau petugas sebelum tampil.” |
| Galat | “Data belum dapat dimuat. [Coba lagi]”. Data terakhir tetap tampil jika ada. |

### 3.9 Metrik (pengganti metrik Focus City)

| Focus City | Peta Suara |
|---|---|
| Total focus | **Pengajuan publik**: total sesuai filter |
| Daily average | **Per kelompok**: Whistleblowing n · Aspirasi m |
| Best streak | **Selesai ditindaklanjuti**: item publik berstatus selesai atau sudah dilaksanakan |
| One day. One building. | Satu balok = satu kategori dalam satu periode. |
| Sample activity | Prototipe: “DATA CONTOH — bukan data nyata”. Produksi: “Hanya mencakup pengajuan yang telah disetujui untuk publikasi.” |

Tidak ada metrik yang berasal dari data privat: total kiriman masuk, waktu respons, atau jumlah yang ditolak.

### 3.10 Aksesibilitas peta

- Setiap balok adalah `<g role="button" aria-label="Kelompok Aspirasi, Fasilitas Umum, Triwulan III 2026, 7 pengajuan publik">` dengan **roving tabindex**, yaitu satu tab stop per kelompok.
  - Tombol panah: pindah baris/kolom.
  - `PageUp`/`PageDown`: pindah kelompok.
  - `Enter`/`Spasi`: memilih balok.
  - Tooltip ditampilkan visual saat balok difokus keyboard.
- Saat area peta difokus: `Q`/`E` mengubah sudut, `0` mereset sudut.
- Tampilan **Daftar** (tabel HTML per jenis → kategori → periode, dengan tombol untuk membuka item) adalah **jalur navigasi lengkap** yang tidak bergantung pada hover, drag, atau SVG.
- Bidang dasar, ubin kosong, dan penanda ekstrem ditandai `aria-hidden`.
- Status, jenis, dan pilihan tidak dibedakan dengan warna saja, tetapi selalu disertai ikon, label, pola atap, atau garis tepi.

---

## 4. Komponen referensi yang digunakan ulang dan bagian yang diubah

### 4.1 Astro Bubble Hero (`astro-bubble-hero.tsx`, lisensi MIT menurut listing 21st.dev)

| Bagian referensi | Keputusan | Perubahan |
|---|---|---|
| `mulberry32`, `buildBubbles`, `clamp` | **Gunakan** | Atribusi MIT di header file |
| Komponen `Bubbles` (canvas, drift, dorongan pointer, RO/IO/visibility, DPR, `fonts.ready`, cleanup) | **Gunakan, refactor** | Dipisah menjadi `mesin.ts` (murni) + `BubbleCanvas.tsx`. Ditambah: batas jumlah per perangkat, DPR mobile 1,5, pembatasan fps untuk perangkat lemah, berhenti saat dialog terbuka atau dijeda, dan reduced motion tanpa dorongan. Mask `logo`/`knock` dibuang. |
| Masker teks `destination-in` | **Gunakan** | Teks “SUARA”, font dibaca dari `getComputedStyle` |
| Pecah + percikan | **Gunakan (opsional)** | Hanya mouse di desktop. Penghitung `pops`, prop `onPop`, `hint`, dan `aria-live` **dihapus**. |
| `bubbleCss()` | **Gunakan** | Wordmark statis CSS (tanpa JS / canvas gagal) |
| Orbit SVG + `aa-spin` 60/90 dtk | **Gunakan** | Warna token, ikut tombol jeda dan reduced motion |
| `Title` dengan baris “sliced” + latar | **Gunakan gayanya** | Menjadi **satu `h1` HTML** yang terlihat. `h1` sr-only duplikat dihapus. |
| `.aa-btn-solid`, `.aa-btn-line` | **Gunakan gayanya** | Dibangun ulang dengan `Link` + shadcn `Button` (varian `pil-wb`, `pil-asp`, `pil-garis`) |
| Bingkai `.aa-root` | **Gunakan** | Warna token tema gelap |
| Preset palet `cobalt` | **Ganti** | Diganti keluarga P3MD (dok. 06). Hanya mekanisme token `--bubble-*` yang dipertahankan. |
| `LogoMark` kompas yang mengikuti pointer | **Ganti** | Logo Ruang Suara statis (SVG) di posisi yang sama |
| “#102”, `credit`, `Asterisk` sebagai tombol | **Buang / ganti** | Asterisk menjadi ornamen SVG non-interaktif. Kredit menjadi catatan kaki layanan. |
| `useAstroLook`, `defaultTheme`, prop `frame` | **Buang** | Tema gelap tetap lewat token `[data-tema="malam"]` |
| `useWide` (pengukuran JS) | **Buang** | Container query CSS, tanpa lompatan tata letak |
| `AA_CSS` (string `<style>` + reset) | **Buang** | Ditulis ulang dengan Tailwind + token. Hanya gaya yang dipertahankan yang dipindahkan. |
| Kode mati (fase bulan, nomor anggota, `isEmail`, statistik, tipe proyek/malam/tier, `useInView`) | **Buang** | — |

### 4.2 Focus City (`focus-city.tsx`, **kode lengkap diterima**, lisensi **belum diketahui**)

| Bagian referensi | Keputusan | Perubahan |
|---|---|---|
| `project()` ortografik: `[x·cos − y·sin, (x·sin + y·cos)·0,46 − z]` | **Gunakan** | Rumus dipakai apa adanya. Dua kelompok dipisah di sumbu x. Dua sisi balok (kiri dan kanan) **tetap**, karena rentang yaw 14°–46° tidak pernah membalik sisi yang terlihat. Ini diverifikasi di uji unit. Jika lisensi tidak jelas, rumus ini tetap bebas ditulis ulang karena bersifat umum. |
| Pengurutan `depth` | **Gunakan konsepnya** | Dihitung dari pusat balok dalam koordinat dunia dua kelompok, ditambah uji unit |
| `fit()` per sudut | **Ubah** | Skala dihitung sekali per dataset (tidak “bernapas”), diwujudkan lewat `viewBox` |
| Tinggi `menit/60 × 0,34` | **Ubah** | Skala bersama, aturan ekstrem, tinggi minimum |
| `level()` warna per nilai | **Buang** | Warna = jenis, dengan tiga tingkat bidang tetap |
| `calendar()`, `FocusDay`, `FocusSession`, `duration`, `minutesOf` | **Bangun ulang** | `tataLetak()` + `DatasetPeta` (§3.2) |
| `lerpPoints` + `useMorph` (380ms, reduced motion) | **Gunakan** | Untuk Isometrik ↔ 2D. Untuk > 150 balok, pembaruan memakai mutasi atribut via ref, bukan `setState` per frame. |
| Toggle 3D/2D, pemilih rentang, baris metrik, petunjuk drag, legenda, bilah pilihan ‹ › | **Gunakan polanya** | Label “Isometrik/2D/Daftar”, shadcn `ToggleGroup`/`Select`, metrik baru, navigasi blok |
| Garis tepi seleksi gelap | **Ubah** | Cincin ganda + redupkan yang lain |
| Tema terang hijau | **Ganti** | Tema gelap tenang dengan warna kelompok |
| `iso(new Date())` UTC | **Buang** | Periode dihitung server dalam WIB |
| Render JSX, drag, tooltip, ARIA | **Terbaca** (lihat §4.3). Drag dan tooltip diadaptasi. **Keyboard dan ARIA per balok tidak ada di referensi** dan dirancang baru (§3.10). | Roving focus pada balok, `role="button"` + label, Daftar sebagai jalur lengkap |

### 4.3 Temuan dari kode lengkap Focus City

| # | Temuan | Dampak pada rencana |
|---|---|---|
| 1 | Yaw dijepit 0,24–0,81 rad, default `π/6`, sensitivitas `Δx/540`, ambang drag 5px, klik ganda mereset | Nilai ini menggantikan angka yang sebelumnya saya perkirakan (§3.6) |
| 2 | Tidak ada keyboard atau ARIA per balok. `<g onClick>` tidak dapat difokus. Alternatif referensi adalah pemilih tanggal, tombol ‹ ›, dan wilayah `aria-live`. | Roving focus dirancang baru. Konsep pemilih + ‹ › + `aria-live` dipakai untuk panel blok. |
| 3 | `svg` memakai `viewBox` selebar piksel hasil ukur (`ResizeObserver`) dengan tinggi tetap 240/264px | Rencana memakai viewBox dari batas geometri dan skala tetap per dataset |
| 4 | `fit()` menghitung ulang skala pada setiap yaw | Skala tetap per dataset (§3.4). Ukuran tidak “bernapas”. |
| 5 | Jumlah minggu otomatis (4 bila lebar < 480px, 12 bila lebih) dan dapat diubah manual | Pola dipakai: granularitas kolom otomatis menurut lebar, dengan batas 12 kolom (§3.3) |
| 6 | Morph menyatukan titik atap dan dasar ke sel datar, sehingga sisi balok menyusut ke nol | Dipakai untuk Isometrik ↔ 2D |
| 7 | Tampilan 2D menampilkan label sumbu (Sen/Rab/Jum dan tanggal kolom) | Diadaptasi: label kategori di sumbu y dan label periode di sumbu x pada tampilan 2D |
| 8 | CSS disuntikkan sebagai string dan memakai `light-dark()` serta `color-mix()`. Memakai kelas global `cursor-interaction` yang tidak didefinisikan di berkas. | Diganti token Tailwind. `color-mix()` untuk warna sisi diganti nilai tetap dari token (dok. 06 §4.5), sehingga tidak bergantung fungsi CSS baru. Kelas `cursor-interaction` tidak dibawa. |
| 9 | Tanggal “hari ini” memakai `toISOString()` (UTC) | Periode dihitung server dalam WIB |
| 10 | Tooltip HTML melayang, dijepit ke tepi plot, dan dimatikan untuk sentuhan | Dipakai apa adanya |
| 11 | `touch-action: pan-y` pada wadah plot | Dipakai (sesuai §3.7) |
| 12 | Memakai `.at(-1)` (ES2022) dan `ResizeObserver` | Aman untuk target browser modern. Dicatat di `docs/versi.md`. |
| 13 | Pembaruan morph memakai `setState` per frame | Aman untuk 84 balok. Untuk hingga 288 balok dipakai mutasi atribut lewat ref (sudah di §4.2). |

---

## 5. Arsitektur frontend dan kebutuhan dependensi

### 5.1 Batas server dan client

| Bagian | Jenis | Alasan |
|---|---|---|
| `app/(publik)/page.tsx`, `HeroSection`, `WordmarkStatis`, `OrbitRings`, `TombolLayanan` | **Server** | HTML awal lengkap, sehingga halaman berfungsi tanpa JS dan LCP berupa teks |
| `BubbleCanvas` | **Client**, `next/dynamic` `ssr:false` | Dimuat setelah `load`/idle. Tidak dimuat saat reduced motion (cukup wordmark statis). |
| `@modal/(.)kirim/*`, `FormDialog`, langkah form | **Client** | Server Action dan Route Handler (dok. 03 §6) |
| `app/(publik)/pemetaan/page.tsx` | **Server** | Membaca `searchParams`, mengambil agregat dari DAL publik, merender metrik dan **SVG isometrik pada sudut default** (atau 2D/Daftar) |
| `PetaInteraktif` (sudut, hover, pilih, morph, toolbar, panel) | **Client** | Menghidrasi SVG yang sama. Perubahan filter → `GET /api/publik/peta`. |
| `model/*` peta | **Fungsi murni bersama** | Dipakai server (render awal) dan client (interaksi) agar hasilnya identik |
| Detail item | Client fetch `GET /api/publik/konten/[kode]` | Data publik dengan cache bertag |

Browser **tidak** memakai Supabase client. Data privat tidak pernah dikirim ke browser.

### 5.2 Struktur folder (tambahan pada dok. 03 §4)

```
src/
├── app/(publik)/
│   ├── layout.tsx                      # slot @modal + DrafFormProvider (memori)
│   ├── page.tsx                        # Beranda (server)
│   ├── @modal/default.tsx
│   ├── @modal/(.)kirim/{pelanggaran,aspirasi}/page.tsx
│   └── pemetaan/{page.tsx,loading.tsx}
├── app/(formulir)/kirim/{pelanggaran,aspirasi}/page.tsx      # halaman penuh
├── app/api/publik/{peta/route.ts, peta/item/route.ts, konten/[kode]/route.ts}
├── features/
│   ├── beranda/
│   │   ├── HeroSection.tsx · WordmarkStatis.tsx · OrbitRings.tsx · TombolLayanan.tsx · LogoRuangSuara.tsx
│   │   └── bubble/
│   │       ├── BubbleCanvas.tsx        # client tipis
│   │       ├── mesin.ts                # loop, masker, dorongan, pecah (adaptasi Astro, MIT)
│   │       ├── acak.ts                 # mulberry32, buildBubbles, bubbleCss
│   │       └── kemampuanPerangkat.ts   # batas bubble, DPR, fps
│   ├── formulir/                       # FormDialog, langkah/*, KredensialBerhasil, konfigurasi.ts
│   └── peta/
│       ├── model/                      # FUNGSI MURNI + uji unit
│       │   ├── tataLetak.ts            # (jenis, kategori, periode) → koordinat dunia; gabung "Lainnya"
│       │   ├── skala.ts                # batasSkala, ekstrem, tinggi minimum
│       │   ├── proyeksi.ts             # θ → titik layar; sisi terlihat; viewBox per dataset/fokus
│       │   ├── kedalaman.ts            # urutan gambar
│       │   └── datar.ts                # posisi sel 2D untuk morph
│       ├── tampilan/ PetaIsometrik.tsx · Balok.tsx · PetaDaftar.tsx · Tooltip.tsx
│       ├── interaksi/ useSudut.ts · useDragHorizontal.ts · useMorph.ts · useRovingFocus.ts
│       ├── PetaInteraktif.tsx · PetaToolbar.tsx · MetrikPublik.tsx · Legenda.tsx · NavigasiBlok.tsx
│       ├── panel/ PanelDetail.tsx · DaftarItem.tsx · DetailItem.tsx
│       └── state/useStatePeta.ts       # filter, tampilan, fokus, blok, item ↔ URL
├── lib/animasi/usePauseAnimasi.ts      # jeda pengguna + reduced motion + visibility
├── lib/schemas/publik.ts               # Zod .strict() kontrak publik
└── fixtures/                           # data contoh berlabel (dev/preview saja)
docs/referensi/                         # salinan kedua referensi + sumber + lisensi
```

Sudut proyeksi (θ) **tidak** disimpan di URL agar riwayat browser tidak penuh. Filter, tampilan, fokus, blok, dan item disimpan di URL.

### 5.3 Design tokens

**Digantikan oleh [dok. 06 §5](06-palet-warna-p3md.md#5-design-tokens)** (primitif, semantik terang/gelap, status, peta, dan aturan pemakaian di Canvas/SVG). Tipografi, radius, dan gerak tetap:

| Kelompok | Token | Nilai |
|---|---|---|
| Tipografi | `--font-display` | **Poppins 800** untuk wordmark, judul hero, tombol pil, dan judul peta, via `next/font` (self-host) |
| | `--font-body` / `--font-mono` | Plus Jakarta Sans / JetBrains Mono |
| | `--fs-hero` | `clamp(1.75rem, 4.6cqi, 3.75rem)`, lh 0,9 |
| Radius | `--radius-pil` / `--radius-lg` | 999px / 16px |
| Gerak | `--dur-cepat` 150ms · `--dur-normal` 300ms · `--dur-morph` 380ms · `--ease-standar` `cubic-bezier(.2,.8,.2,1)` · orbit 60/90 dtk | Reduced motion: semua durasi = 0 |

### 5.4 Dependensi

| Paket | Status | Kegunaan |
|---|---|---|
| `next`, `react`, `typescript`, `tailwindcss` v4, shadcn/ui (disalin ke repo) | Stack tetap | — |
| `lucide-react` | Bawaan shadcn, dipakai Focus City | Ikon |
| `zod`, `react-hook-form` | Dari dok. 03 | Form + kontrak data publik |
| `@tanstack/react-query` | Baru | Fetch saat filter peta berubah (abort, cache) |
| `vaul` (lewat shadcn `Drawer`) | Baru | Bottom sheet |
| `nuqs` | **Opsional** | State URL bertipe, atau hook kecil buatan sendiri |
| Font Poppins, Plus Jakarta Sans, JetBrains Mono | Via `next/font` | Self-host, tanpa permintaan ke Google saat runtime |

**Tidak ada** dependency untuk rendering: tidak ada library 3D, chart, animasi, atau fisika. Mesin bubble dan mesin isometrik ditulis di repo (perkiraan masing-masing ≤ 15 KB gzip). Versi dikunci dan dicatat di `docs/versi.md` saat instalasi.

### 5.5 Kontrak data publik dan backend minimum

Ada tiga lapisan data:

1. **Pengajuan asli** (`app.*`, hanya DAL privat).
2. **Versi publik** (`pub.public_post_v`, hanya versi tayang).
3. **Agregasi peta** (`pub.peta_item_v` + fungsi `pub.peta_agregat(...)`, dibangun **hanya dari view publik**).

`GET /api/publik/peta?periode=4tw&jenis=WB,ASP&kategori=&status=&q=` →

```json
{
  "dibuat": "2026-10-09T08:00:00+07:00",
  "periode": { "granularitas": "triwulan", "kolom": [
    { "kunci": "2025-Q4", "label": "Trw IV 2025" }, { "kunci": "2026-Q1", "label": "Trw I 2026" },
    { "kunci": "2026-Q2", "label": "Trw II 2026" }, { "kunci": "2026-Q3", "label": "Trw III 2026" } ] },
  "kelompok": [
    { "jenis": "WB", "label": "Whistleblowing", "kategori": [ { "id": "k-pungli", "label": "Pungutan tidak resmi", "urutan": 1 } ] },
    { "jenis": "ASP", "label": "Aspirasi", "kategori": [ { "id": "k-fasum", "label": "Fasilitas umum", "urutan": 1 } ] }
  ],
  "blok": [
    { "jenis": "ASP", "kategoriId": "k-fasum", "periode": "2026-Q3", "jumlah": 7,
      "status": { "DITINDAKLANJUTI": 3, "DIPERTIMBANGKAN": 2, "SELESAI": 2 } }
  ],
  "skala": { "maks": 7, "batasSkala": 10, "terpotong": false },
  "metrik": { "total": 128, "perJenis": { "WB": 34, "ASP": 94 }, "selesai": 52, "diperbaruiTerakhir": "2026-10-09" }
}
```

- `GET /api/publik/peta/item?jenis=&kategoriId=&periode=&halaman=` → `{ item: [{ kode, jenis, judul, cuplikan, kategoriLabel, statusPublik, tanggalPublikasi }], total, halaman }`
- `GET /api/publik/konten/[kode]` → `{ kode, jenis, judul, ringkasan, kategoriLabel, periodeLabel, statusPublik, tanggapanPublik, pernyataanHasil?, diterbitkan, diperbarui, penafian? }`
- **Kolom terlarang** (diuji otomatis): ID internal, `submission_id`, nomor referensi, identitas/kontak, pihak terlibat, uraian asli, lampiran, catatan/alasan internal, nama staf, status penanganan internal, hasil verifikasi mentah, tanggal kiriman/kejadian, dan lokasi spesifik. Respons divalidasi Zod `.strict()` sebelum dikirim.

**Backend minimum:**

| # | Kebutuhan |
|---|---|
| BE-1 | `pub.public_post_v` + `kategori_publik_id`, `first_published_at` |
| BE-2 | Kategori dengan `urutan` dan `label_publik` |
| BE-3 | `pub.peta_item_v` (kode, jenis, kategori, status publik, bulan publikasi WIB) |
| BE-4 | `pub.peta_agregat(...)` dengan `SECURITY INVOKER`, termasuk penggabungan “Lainnya” |
| BE-5 | Pencarian `pg_trgm` + `tsvector` konfigurasi `simple` |
| BE-6 | Route Handler GET + cache bertag `konten-publik`, diinvalidasi saat publikasi/penarikan. Kueri dengan `q` tidak di-cache dan diberi batas laju ringan. |
| BE-7 | Fixtures dummy berlabel (dev/preview saja) |

**Supabase** hanya dipakai sebagai Postgres + Storage yang diakses server. Data API dimatikan untuk skema aplikasi, tanpa `supabase-js` di browser, dan tanpa Realtime di MVP (dok. 03 §2, §8.3).

---

## 6. Tahapan implementasi

| Tahap | Isi | Bergantung pada | Kriteria selesai | Perkiraan* |
|---|---|---|---|:-:|
| **T0 · Referensi** | Simpan kedua referensi + sumber di `docs/referensi/` dan **cek lisensi Focus City** di halaman 21st.dev. Putuskan antara “salin dengan atribusi” atau “tulis ulang dari konsep”. Kode kedua referensi sudah terbaca penuh. | Lisensi | Tabel §4.2 terverifikasi | 0,25 hari |
| **T1 · Wireframe & arah visual** | Wireframe hi-fi beranda (desktop, mobile, layar pendek), dialog form (5 langkah × 2 jenis, semua kondisi), dan peta (Isometrik/2D/Daftar, panel, bottom sheet). Token final, uji kontras, penyesuaian parameter dorongan pointer, keputusan pecah aktif atau tidak. | T0 | Disetujui, dan semua pasangan teks lolos AA | 4 hari |
| **T2 · Prototipe beranda + form (data dummy)** | `HeroSection` + `WordmarkStatis` → `BubbleCanvas` (masker, batas per perangkat, jeda, reduced motion, berhenti saat tab tidak aktif) → `FormDialog` (intercepting route, langkah, validasi, unggah tiruan, semua kondisi, kredensial palsu bertanda “CONTOH”) | T1 | AC-B dan AC-F lolos di staging. Waktu gambar canvas terukur di 2 perangkat fisik. | 6 hari |
| **T3 · Prototipe pemetaan isometrik (data dummy berlabel)** | Fixtures 2 jenis × 6–12 kategori × 4–12 periode, termasuk kasus nol, sedikit, ekstrem, > 12 kategori, dan > 12 kolom. Banner “DATA CONTOH — bukan data nyata”. `model/*` + uji unit, SVG isometrik, drag horizontal, urutan gambar, tooltip, pilih, morph 2D, Daftar, panel/bottom sheet, filter, pencarian lokal, fokus kelompok, roving focus, state URL. | T1 (paralel dengan T2) | AC-P dan AC-A lolos. Uji kegunaan 5 orang: ≥ 4 orang menemukan aspirasi tertentu dan dapat menjelaskan arti tinggi balok. | 8 hari |
| **T4 · Integrasi data publik** | BE-1…BE-7, Route Handler, Zod strict, cache bertag + invalidasi, render server dengan data nyata, form → Server Action nyata (dok. 03) | T2, T3, backend dok. 04 F3 | AC-D lolos. Fixtures tidak ada di build produksi. | 5 hari |
| **T5 · Pengujian** | Responsif (360/390/768/1024/1440 + lanskap pendek), aksesibilitas (axe, keyboard-only, VoiceOver/TalkBack/NVDA), performa (Lighthouse CI + profil di 2 perangkat fisik), aturan publikasi (E2E dok. 04 + §7) | T4 | Semua AC §7 lolos. Hasil terukur dicatat di `docs/hasil-uji-ui.md`. | 4 hari |

\* Untuk 1 pengembang frontend, ± 27–28 hari kerja, dan dapat berjalan paralel dengan backend dok. 04. Ini **target perencanaan, bukan hasil pengukuran**.

---

## 7. Acceptance criteria yang dapat diuji

> Angka performa adalah **target perencanaan**. Belum ada pengujian yang dilakukan, dan hasil aktual dicatat di T5.

**Beranda (AC-B)**

| ID | Kriteria |
|---|---|
| AC-B1 | Dengan JS dimatikan, wordmark statis, judul, deskripsi, ketiga tombol, dan catatan kaki tampil. Tombol form membuka halaman penuh, dan “Jelajahi Pemetaan” membuka `/pemetaan`. |
| AC-B2 | Jika `getContext("2d")` dipaksa mengembalikan `null` atau melempar galat, wordmark statis tetap tampil tanpa galat yang terlihat, dan semua tombol berfungsi |
| AC-B3 | Pada 1440×900 seluruh hero terlihat tanpa gulir. Pada 360×640 dan lanskap 740×360, tidak ada konten terpotong dan halaman dapat digulir. CLS < 0,05 (tidak ada lompatan tata letak saat hidrasi). |
| AC-B4 | Mobile: tombol “Laporkan Pelanggaran” dan “Sampaikan Aspirasi” bertumpuk vertikal dengan urutan itu, lebar penuh, tinggi ≥ 56px. Desktop: keduanya sejajar dengan ukuran sama (selisih lebar ≤ 2px). |
| AC-B5 | Kontras judul (dengan latar baris solid), deskripsi, dan label tombol ≥ 4.5:1, diuji pada 5 posisi bubble berbeda |
| AC-B6 | Pembaca layar mengumumkan judul **sekali**. Canvas dan orbit tidak diumumkan, dan tidak ada pengumuman terkait pecah bubble. |
| AC-B7 | `prefers-reduced-motion: reduce`: canvas digambar sekali, orbit diam, dan menggerakkan atau mengklik pointer tidak menimbulkan gerak |
| AC-B8 | Tombol jeda menghentikan loop canvas dan orbit dalam ≤ 100ms, dan preferensinya bertahan setelah reload |
| AC-B9 | Tidak ada frame canvas yang digambar saat tab disembunyikan, hero di luar layar, atau dialog form terbuka (diverifikasi di Performance panel) |
| AC-B10 | Jumlah bubble ≤ 900 di desktop, ≤ 350 di lebar < 760px, ≤ 180 dalam mode perangkat lemah. DPR canvas ≤ 2 / 1,5 / 1. |
| AC-B11 | Target: LCP ≤ 2,5 dtk (Lighthouse mobile, 4G lambat). JS awal beranda ≤ 150 KB gzip. Chunk `BubbleCanvas` ≤ 15 KB gzip dan dimuat setelah `load`. INP < 200ms. Rata-rata waktu gambar per frame ≤ 8ms (laptop) / ≤ 16ms (Android menengah). |
| AC-B12 | Pecah bubble (jika diaktifkan) hanya terjadi untuk klik mouse di area wordmark, tidak terjadi di perangkat sentuh, dan tidak pernah terpicu oleh klik pada tombol atau tautan |

**Form (AC-F)**

| ID | Kriteria |
|---|---|
| AC-F1 | Tombol kiri membuka form whistleblowing dan tombol kanan membuka form aspirasi. URL berubah ke `/kirim/...`. Back menutup dialog. Tautan langsung membuka halaman penuh. |
| AC-F2 | Saat dialog terbuka: fokus di judul dialog, Tab terkunci di dalam dialog, latar diredupkan, dan loop canvas serta orbit berhenti. Setelah ditutup, fokus kembali ke tombol pemicu dan animasi berlanjut. |
| AC-F3 | Menutup dialog yang sudah berisi isian memunculkan konfirmasi. “Lanjutkan mengisi” mempertahankan semua isian. |
| AC-F4 | Field wajib yang kosong atau tidak valid menampilkan pesan spesifik, dan “Lanjut” tidak berpindah langkah |
| AC-F5 | File 12 MB atau `.mov` ditolak dengan pesan spesifik. File ke-6 (whistleblowing) atau ke-4 (aspirasi) tidak dapat ditambahkan. |
| AC-F6 | Klik “Kirim” berulang menghasilkan tepat satu kiriman |
| AC-F7 | Saat galat server atau jaringan disimulasikan, banner tampil dan seluruh isian di semua langkah tetap ada |
| AC-F8 | Layar berhasil menyatakan “ditinjau, belum dipublikasikan”, menampilkan Nomor Referensi + Kode Akses, dan tidak dapat ditutup sebelum konfirmasi penyimpanan |
| AC-F9 | Tidak ada isian atau kredensial di `localStorage`, `sessionStorage`, IndexedDB, maupun URL |
| AC-F10 | Di iOS Safari dan Chrome Android, field aktif dan tombol Lanjut tetap terlihat saat keyboard terbuka |
| AC-F11 | Teks form tidak memuat klaim “100% anonim” atau padanannya |

**Pemetaan (AC-P)**

| ID | Kriteria |
|---|---|
| AC-P1 | Pada 1280×800, kedua kelompok beserta labelnya terlihat penuh, termasuk di HTML yang dirender server sebelum hidrasi. Whistleblowing di kiri, Aspirasi di kanan. |
| AC-P2 | Setiap balok terdiri dari tepat 3 bidang (atap, kiri, kanan) dengan tiga warna token kelompoknya. Warna tidak berubah menurut jumlah. |
| AC-P3 | Drag horizontal mengubah sudut dan berhenti tepat di 0,24 rad dan 0,81 rad. Klik ganda dan tombol reset mengembalikan 30°. Ukuran bounding box peta berubah ≤ 2% antara sudut minimum dan maksimum. |
| AC-P4 | Uji unit `kedalaman.ts`: pada sudut 0,24 rad, 30°, dan 0,81 rad, untuk setiap pasangan balok yang proyeksinya bertumpuk, balok yang lebih dekat ke pengamat selalu digambar belakangan. Dua sisi yang digambar (kiri dan kanan) benar di ketiga sudut, dan Whistleblowing tetap di sisi kiri Aspirasi. Snapshot visual di ketiga sudut tidak menunjukkan sisi yang salah tertutup. |
| AC-P5 | Drag > 5px di atas balok tidak memilih balok dan klik berikutnya diabaikan. Gerak ≤ 5px memilih balok. |
| AC-P6 | Hover menampilkan tooltip berisi kelompok, kategori, periode, dan jumlah. Di perangkat sentuh tidak ada tooltip, dan ketukan langsung memilih. |
| AC-P7 | Balok terpilih bercincin ganda (ivory + navy), yang lain redup, panel/bottom sheet terbuka, dan `blok=` tercatat di URL |
| AC-P8 | Fixtures 0/1/3/10: tinggi proporsional dengan skala yang sama di kedua kelompok. 0 menjadi ubin datar, 1 memakai tinggi minimum (uji unit `skala.ts`). |
| AC-P9 | Fixture ekstrem (120 vs maksimum lain 12) menampilkan penanda patahan + label “120”. “Skala penuh” menampilkan proporsi murni. |
| AC-P10 | Mengubah filter kategori, status, atau pencarian tidak mengubah posisi slot balok mana pun (uji unit `tataLetak.ts`) |
| AC-P11 | Isometrik, 2D, dan Daftar menampilkan total dan jumlah per blok yang identik untuk filter yang sama. Pilihan blok tetap sama saat berganti tampilan. Morph Isometrik ↔ 2D selesai ≤ 400ms (instan saat reduced motion). |
| AC-P12 | Rentang yang menghasilkan > 12 kolom di Isometrik menaikkan granularitas otomatis dengan pemberitahuan. > 12 kategori digabung menjadi “Lainnya” di peta, sedangkan Daftar menampilkan kategori asli. |
| AC-P13 | Jumlah elemen SVG di tampilan Isometrik ≤ 1.000 untuk fixture terbesar (2 × 12 × 12) |
| AC-P14 | Target: drag pada fixture 2 × 8 × 12 berjalan ≥ 45 fps (desktop) / ≥ 30 fps (Android menengah). Tanpa interaksi, tidak ada frame yang terjadwal. |
| AC-P15 | Mobile: geser vertikal satu jari di atas peta menggulir halaman tanpa mengubah sudut, dan geser horizontal mengubah sudut. Tidak ada zoom cubit maupun zoom roda di versi awal. |
| AC-P16 | “Fokus Whistleblowing/Aspirasi” mengubah `viewBox` agar pas dengan kelompok itu, dan “Keduanya” mengembalikannya. Tidak ada zoom bebas. |
| AC-P17 | Seluruh alur (temukan blok → buka item → baca ringkasan) dapat diselesaikan lewat tampilan Daftar tanpa hover maupun drag |
| AC-P18 | Item Whistleblowing selalu menampilkan penafian “publikasi tidak berarti dugaan terbukti”. Legenda menyatakan arti tinggi dan dasar tanggal. |
| AC-P19 | State filter, tampilan, fokus, blok, dan item dapat dipulihkan dari URL yang dibagikan |

**Data dan publikasi (AC-D)**

| ID | Kriteria |
|---|---|
| AC-D1 | Kiriman baru yang belum disetujui tidak menambah angka apa pun di peta, tooltip, metrik, pencarian, maupun Daftar |
| AC-D2 | Setelah versi disetujui, item muncul dan jumlah blok bertambah 1 tanpa menunggu cache kedaluwarsa |
| AC-D3 | Setelah penarikan, item hilang dan jumlah blok berkurang 1 pada permintaan berikutnya |
| AC-D4 | Ketiga endpoint publik lolos Zod `.strict()` dan tidak memuat kolom terlarang (§5.5) |
| AC-D5 | Mencari kata yang hanya ada di uraian asli atau catatan internal (data uji sintetis) mengembalikan 0 hasil |
| AC-D6 | Role `app_public` gagal membaca `app.*`. Fungsi agregat hanya membaca skema `pub`. |
| AC-D7 | Fixtures dan teks “DATA CONTOH” tidak ada di bundle produksi |

**Aksesibilitas (AC-A)**

| ID | Kriteria |
|---|---|
| AC-A1 | axe: 0 pelanggaran *serious/critical* di beranda, setiap langkah form, dan ketiga tampilan peta |
| AC-A2 | Alur kirim aspirasi dan alur memilih item di peta dapat diselesaikan hanya dengan keyboard. Peta memakai roving focus dengan satu tab stop per kelompok. |
| AC-A3 | Label balok dibacakan sesuai format §3.10 di VoiceOver (Safari), TalkBack (Chrome), dan NVDA |
| AC-A4 | Kelompok, status, dan pilihan dapat dibedakan dalam simulasi protanopia, deuteranopia, dan grayscale (ikon, label, pola atap, garis tepi) |
| AC-A5 | Semua kontrol peta (sudut, reset, fokus, tampilan, navigasi blok) memiliki nama aksesibel dan dapat dioperasikan dengan keyboard |

**Kebersihan rencana**

| ID | Kriteria |
|---|---|
| AC-R1 | `package.json` tidak memuat `three`, `@react-three/*`, maupun library 3D lain. Tidak ada `getContext("webgl"…)` di kode sumber (dicek dengan grep di CI). |

---

## 8. Keputusan terbuka

1. ~~**Apakah ringkasan whistleblowing akan dipublikasikan?**~~ **Terjawab (10 Okt 2026):** ya, dipublikasikan dengan **satu penyetuju** berwenang (dok. 01 §3.3).
2. **Seberapa luas Tema Malam berlaku?** Rekomendasi: tema gelap untuk beranda dan Peta Suara, form berpermukaan terang, sedangkan halaman informasi dan dashboard admin tetap terang. Apakah ada pedoman merek yang wajib diikuti?

Hal lain sudah diputuskan dengan rekomendasi di atas dan dapat diubah saat tinjauan T1: interaksi pecah bubble, kekuatan dorongan pointer, rentang sudut, dan font display Poppins.
