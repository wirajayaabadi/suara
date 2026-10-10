# 06 — Palet Warna dan Design Tokens (identitas P3MD)

> Status: **draf v1 untuk ditinjau** (10 Okt 2026). Revisi identitas warna saja. Fitur, alur, beranda Canvas/SVG, dan pemetaan isometrik SVG tidak berubah.
> **Dokumen ini adalah sumber tunggal warna.** Dokumen ini menggantikan palet cobalt/cyan/mint/lavender di dok. 05 (§2, §3, §4.1, §5.3) dan palet teal di dok. 02 §3.1. Jika ada perbedaan, dokumen ini yang berlaku.

> ✅ **Logo sudah diperiksa (10 Okt 2026)** dari berkas PNG 1024×1280 yang dikirim, dengan pengambilan sampel piksel **pada lambang saja**. Hasilnya di §2.0. Lima HEX sumber **cocok dengan logo** dalam selisih kecil, sehingga dipertahankan. Rasio kontras tetap dihitung dengan rumus WCAG 2.x dari HEX yang tertulis, dan harus dihitung ulang bila HEX berubah.

---

## 1. Rekomendasi palet utama

**“Navy Berwibawa, Emas Hangat.”**

| Peran | Warna | Alasan |
|---|---|---|
| Dasar | **Navy** `#021E39` | Berwibawa dan tenang. Menjadi latar beranda dan peta, serta teks utama di permukaan terang. |
| Hangat | **Emas** `#DCA752` / **emas lembut** `#DAB25F` | Mudah didekati. Dipakai untuk aksen aktif, bubble, orbit, dan kelompok Aspirasi. |
| Netral hangat | **Ivory** `#F0E2C5` | Teks di atas navy dan permukaan form. Lebih lembut dari putih. |
| Aksen terbatas | **Marun** `#89161D` | Dipakai sangat sedikit sebagai penanda khas P3MD. Bukan warna tombol utama dan bukan warna status. |

Prinsip:

1. **Identitas ≠ status.** Emas bukan “peringatan”. Marun bukan “pelanggaran” dan bukan “galat”. Warna status punya keluarga sendiri (§6).
2. **Tombol utama tidak memakai merah.** Whistleblowing dibedakan oleh fill ivory, ikon perisai, dan label teks.
3. **Tanpa neon.** Tidak ada glow, bloom, atau gradien berkilau. Kedalaman berasal dari tumpukan bubble dan bidang isometrik.
4. **Emas tidak dipakai sebagai teks kecil di atas terang.** Di atas ivory, teks emas memakai turunan gelap `gold-800`.
5. **Logo ditampilkan dengan warna aslinya**, tanpa tint, gradien, atau efek (§8).

---

## 2. Pemisahan warna sumber dan warna turunan

### 2.0 Hasil pemeriksaan logo

| Temuan | Detail |
|---|---|
| **Latar merah di gambar bukan warna identitas** | Piksel di luar lambang `#A41213` memiliki **alpha 0** (transparan). Merah itu hanya latar tampilan, jadi **tidak masuk palet**. |
| Navy perisai | Kelompok warna dominan sekitar `#001838` (sampel dikuantisasi per 8 tingkat), konsisten dengan `#021E39` |
| Emas | Sampel `#DCA855`, `#DAAC54`, `#DCB268`, `#E0B058` (bingkai, elang, bintang, pita). Konsisten dengan `#DCA752` dan `#DAB25F`. Sorotan emas paling terang sekitar `#F1CB80` tidak dipakai sebagai warna UI. |
| Ivory | Huruf “P3MD” dan teks pita marun sekitar `#F1E8D6`. Sedikit lebih pucat daripada `#F0E2C5` (G `E8` vs `E2`, B `D6` vs `C5`). |
| Marun | Pita bawah “SOEDIRMAN” `#88151C`. Konsisten dengan `#89161D`. |
| Warna lain di lambang | **Tidak ada.** Lambang hanya memuat navy, emas, ivory, dan marun. |

**Keputusan:** lima HEX sumber dipertahankan sebagai nilai UI. Ivory UI tetap `#F0E2C5`, sedikit lebih hangat daripada ivory huruf logo. Selisihnya kecil dan logo selalu tampil dengan warna aslinya. Jika ingin ivory UI identik dengan huruf logo, ganti `ivory-100` ke `#F1E8D6` dan hitung ulang §3.

**Peran marun lebih besar daripada anggapan semula.** Marun adalah bagian nyata dari lambang (pita nama), bukan warna tambahan. Porsi marun pada bubble dinaikkan dari 4% menjadi **6%**, tetapi aturan pembatasan di §4.7 tetap berlaku.

### 2.1 Warna sumber (cocok dengan logo, §2.0)

| Token | HEX | Fungsi |
|---|---|---|
| `navy-900` | `#021E39` | Latar gelap utama, teks utama di permukaan terang |
| `gold-500` | `#DCA752` | Aksen utama, fill tombol Aspirasi, bubble, indikator aktif di latar gelap |
| `gold-300` | `#DAB25F` | Variasi bubble, hover aksen, bidang atas keluarga ochre |
| `ivory-100` | `#F0E2C5` | Teks di atas navy, fill tombol Whistleblowing, permukaan form |
| `maroon-700` | `#89161D` | Aksen merek terbatas (§4.7) |

### 2.2 Warna turunan (dibuat di sini)

Tujuannya hanya mengisi kebutuhan kontras dan kedalaman, dengan karakter yang tetap dekat dengan sumber.

| Token | HEX | Turunan dari | Alasan |
|---|---|---|---|
| `navy-950` | `#010F1E` | navy-900, lebih gelap | Latar paling dalam, tooltip, cincin fokus luar |
| `navy-800` | `#0B2F52` | navy-900, lebih terang | Permukaan kartu di atas navy |
| `navy-750` | `#123B63` | navy-900 | Permukaan terangkat, hover tombol primer |
| `navy-760` | `#1B3F66` | navy-900 | Sisi kanan balok Whistleblowing |
| `navy-700` | `#345B85` | navy-900 | Slate-blue: sisi kiri balok Whistleblowing, badge |
| `navy-600` | `#4A78A6` | navy-900 | Garis halus di atas navy (bukan teks kecil) |
| `navy-400` | `#6F94BF` | navy-900 | Bidang atas balok Whistleblowing |
| `navy-300` | `#B9C3CF` | netral dingin | Teks sekunder di atas navy |
| `navy-ink-muted` | `#4B5E73` | navy-900 | Teks sekunder di atas ivory |
| `gold-100` | `#F3E3BC` | gold-300, lebih terang | Latar badge/aksen lembut di permukaan terang |
| `gold-200` | `#EFD39B` | gold-300 | Badge emas |
| `gold-400` | `#E9BE6F` | gold-500, lebih terang | Bidang atas balok Aspirasi |
| `gold-600` | `#C58E32` | gold-500, lebih gelap | Sisi kiri balok Aspirasi |
| `gold-700` | `#94651A` | gold-500, lebih gelap | Sisi kanan balok Aspirasi |
| `gold-800` | `#7A4F0C` | gold-500, jauh lebih gelap | Teks dan ikon emas di atas terang |
| `ivory-50` | `#FBF6EA` | ivory-100, lebih terang | Permukaan form/kartu terang |
| `ivory-200` | `#D9CBAA` | ivory-100, lebih gelap | Teks sekunder di atas navy, border hangat |
| `ground-200` | `#E3D6B8` | ivory-100 | Bidang dasar peta |
| `maroon-300` | `#E58A8F` | maroon-700, lebih terang | Hanya jika marun perlu terlihat di atas navy |
| `ink-border` | `#5F6F82` | netral dingin | Border kontrol di atas ivory |

---

## 3. Tabel kontras pasangan yang benar-benar dipakai

Rasio dihitung dengan rumus kontras WCAG 2.x. Target: teks normal ≥ 4,5:1, teks besar (≥ 24px, atau ≥ 19px tebal) ≥ 3:1, batas/indikator kontrol ≥ 3:1.

### 3.1 Teks

| Teks | Latar | Rasio | Lolos | Dipakai untuk |
|---|---|:-:|:-:|---|
| `ivory-100` `#F0E2C5` | `navy-900` `#021E39` | **13,14** | ✅ AAA | Judul, deskripsi di beranda |
| `ivory-100` | `navy-950` `#010F1E` | 15,06 | ✅ | Teks di tooltip |
| `ivory-50` `#FBF6EA` | `navy-900` | 15,61 | ✅ | Judul besar |
| `ivory-50` | `navy-800` `#0B2F52` | 12,62 | ✅ | Teks di kartu gelap |
| `ivory-200` `#D9CBAA` | `navy-900` | 10,48 | ✅ | Teks sekunder di atas navy |
| `navy-300` `#B9C3CF` | `navy-900` | 9,44 | ✅ | Petunjuk di atas navy |
| `gold-500` `#DCA752` | `navy-900` | 7,77 | ✅ | Tautan, label aktif di atas navy |
| `gold-500` | `navy-800` | 6,28 | ✅ | Label aktif di kartu gelap |
| `navy-900` `#021E39` | `ivory-50` `#FBF6EA` | **15,61** | ✅ | Teks utama form |
| `navy-900` | `ivory-100` | 13,14 | ✅ | Teks utama di permukaan ivory |
| `navy-ink-muted` `#4B5E73` | `ivory-50` | 6,19 | ✅ | Petunjuk dan label sekunder di form |
| `navy-ink-muted` | `ivory-100` | 5,21 | ✅ | Idem di permukaan ivory-100 |
| `gold-800` `#7A4F0C` | `ivory-50` | 6,60 | ✅ | Teks emas di atas terang |
| `gold-800` | `gold-100` `#F3E3BC` | 5,60 | ✅ | Teks di badge emas |
| `navy-700` `#345B85` | `ivory-50` | 6,53 | ✅ | Tautan di atas terang |
| `maroon-700` `#89161D` | `ivory-50` | 8,87 | ✅ | Aksen marun sebagai teks (jarang) |
| `ivory-100` | `maroon-700` | 7,46 | ✅ | Teks di atas chip marun |
| ❌ `gold-500` | `ivory-50` | **2,01** | ✗ | **Dilarang** untuk teks |
| ❌ `gold-300` | `ivory-50` | **1,85** | ✗ | **Dilarang** untuk teks |
| ❌ `gold-700` `#94651A` untuk teks kecil di `ivory-100` | `ivory-100` | 4,30 | ✗ | Gunakan `gold-800` |

### 3.2 Tombol

| Elemen | Teks | Latar/fill | Rasio | Lolos |
|---|---|---|:-:|:-:|
| Tombol “Laporkan Pelanggaran” | `navy-900` | `ivory-100` | 13,14 | ✅ |
| Tombol “Sampaikan Aspirasi” | `navy-900` | `gold-500` | 7,77 | ✅ |
| Hover tombol Aspirasi | `navy-900` | `#E6B96A` | 9,23 | ✅ |
| Tombol “Jelajahi Pemetaan” (outline) | `ivory-100` | `navy-900` | 13,14 | ✅ |
| Border tombol outline `ivory-200` | — | `navy-900` | 10,48 | ✅ ≥ 3 |
| Tombol primer form | `ivory-50` | `navy-900` | 15,61 | ✅ |
| Tombol primer form, hover | `ivory-50` | `navy-750` `#123B63` | 10,63 | ✅ |

### 3.3 Batas dan indikator kontrol (≥ 3:1)

| Elemen | Warna | Latar | Rasio | Lolos |
|---|---|---|:-:|:-:|
| Border field | `ink-border` `#5F6F82` | `ivory-50` | 4,77 | ✅ |
| Cincin fokus di atas terang | `navy-900` | `ivory-50` | 15,61 | ✅ |
| Cincin fokus di atas navy | `gold-500` | `navy-900` | 7,77 | ✅ |
| Indikator langkah aktif (emas) | `gold-500` | `navy-900` (header gelap) | 7,77 | ✅ |
| Indikator langkah aktif di permukaan terang | `navy-900` penuh + penanda emas **bukan satu-satunya pembeda** | `ivory-50` | 15,61 | ✅ |
| Teks nonaktif `#6B7A8C` | `#E7DFCC` | | 3,31 | ⚠️ Dikecualikan WCAG untuk kontrol nonaktif, tetapi tetap terbaca. Dipakai dengan ikon gembok atau label “Nonaktif”. |

### 3.4 Pemetaan isometrik (batas objek ≥ 3:1)

Bidang dasar `ground-200` `#E3D6B8`.

| Pasangan | Rasio | Catatan |
|---|:-:|---|
| Outline balok `navy-950`/`navy-900` vs `ground-200` | 11,69 | ✅ Setiap balok memiliki outline 1px sehingga batasnya selalu ≥ 3:1 |
| `gold-400` (atap Aspirasi) vs `ground-200` | **1,21** | ✗ tanpa outline. **Wajib outline** (di atas). |
| `navy-700` (sisi kiri WB) vs `ground-200` | 4,89 | ✅ |
| Cincin pilihan `ivory-50` pada balok navy | 6,53 | ✅ |
| Cincin pilihan `navy-950` pada balok emas `gold-600` | 6,70 | ✅ |
| Antar bidang `navy-400`/`navy-700` | 2,24 | ⚠️ Dibedakan oleh outline 1px dan pencahayaan tetap. Perbedaan kedalaman bukan satu-satunya sinyal. |
| Antar bidang `gold-400`/`gold-600` | 1,65 | ⚠️ Idem |

Kontras antarbidang yang rendah dapat diterima karena bidang tidak membawa informasi: yang membawa informasi adalah **tinggi**, **label**, dan **pola atap**. Outline membuat bentuk tetap terbaca.

### 3.5 Status

| Teks/ikon | Latar | Rasio | Lolos |
|---|---|:-:|:-:|
| `ok-fg` `#1D6B43` | `ivory-50` | 6,02 | ✅ |
| `ok-fg` | `ok-bg` `#E3F2E8` | 5,60 | ✅ |
| `warn-fg` `#7A4F0C` | `warn-bg` `#FBEBC8` | 6,04 | ✅ |
| `err-fg` `#B42318` | `ivory-50` | 6,10 | ✅ |
| `err-fg` | `err-bg` `#FCE8E4` | 5,57 | ✅ |
| `info-fg` `#1F5C99` | `ivory-50` | 6,39 | ✅ |
| `info-fg` | `info-bg` `#E4EEF9` | 5,87 | ✅ |

---

## 4. Pemetaan warna per area

### 4.1 Beranda (Canvas/SVG)

| Elemen | Warna |
|---|---|
| Latar | `navy-900`, dengan gradasi radial sangat halus ke `navy-950` di tepi (bukan efek kilau) |
| Bingkai | 6px, `navy-800` |
| `h1` dan deskripsi | `ivory-100`. Baris judul “sliced” berlatar solid `navy-900`. |
| Teks sekunder, catatan kaki | `ivory-200` / `navy-300` |
| Warna dasar huruf wordmark (canvas) | `navy-800` |
| Bubble wordmark | Campuran berbobot: `gold-500` 25%, `gold-300` 19%, `ivory-100` 14%, `gold-400` 10%, `navy-700` 12%, `navy-600` 8%, `navy-750` 6%, `maroon-700` 6% |
| Garis orbit | `gold-500` pada opasitas 22% (dekoratif, bukan pembawa informasi) |
| Titik planet di orbit | `gold-500` (satu titik) dan `maroon-700` (satu titik kecil) |
| Logo P3MD | Warna asli (§8) |
| Wordmark statis (fallback CSS) | Memakai daftar warna bubble yang sama dari token |

Bubble gelap (`navy-*`) membuat huruf “SUARA” tetap terbaca karena wordmark ditentukan oleh masker teks. Marun hanya 6% bubble dan dua titik kecil: cukup untuk menjadi aksen, tidak cukup untuk mendominasi.

### 4.2 Tombol di beranda

| Tombol | Fill | Border | Teks + ikon | Hover | Focus | Pressed |
|---|---|---|---|---|---|---|
| **Laporkan Pelanggaran** | `ivory-100` | 2px `ivory-100` | `navy-900`, ikon perisai | Naik 2px, fill `ivory-50` | Cincin `gold-500` 2px offset 3px | `scale(.97)` |
| **Sampaikan Aspirasi** | `gold-500` | 2px `gold-500` | `navy-900`, ikon bola lampu | Naik 2px, fill `#E6B96A` | Cincin `ivory-100` 2px offset 3px | `scale(.97)` |
| **Jelajahi Pemetaan** (sekunder) | Transparan | 2px `ivory-200` | `ivory-100`, ikon peta | Fill `ivory-100` 12% | Cincin `gold-500` | `scale(.97)` |

Alasan keseimbangan: kedua tombol utama berfill terang penuh dengan teks navy, berukuran sama, dan sama-sama berkontras ≥ 7,7:1 terhadap latar. Satu berwarna gading, satu berwarna emas, sehingga tidak ada yang tenggelam. Pembeda semantik tetap ikon dan label, bukan warna. Tombol sekunder berhierarki lebih rendah karena tanpa fill, tetapi bordernya berkontras 10,48:1. Tidak ada merah.

Keadaan lain tombol: disabled = fill `ivory-200` 40%, teks `navy-ink-muted`, dan ikon gembok. Loading = spinner navy dan label “Mengirim…”.

### 4.3 Form dan dialog

| Elemen | Warna |
|---|---|
| Permukaan dialog | `ivory-50` |
| Overlay | `navy-950` 70% + blur 4px |
| Teks utama, judul | `navy-900` |
| Label, petunjuk | `navy-ink-muted` (tidak memakai opasitas rendah) |
| Field | fill `#FFFFFF`, border 1px `ink-border` |
| Field hover | border `navy-700` |
| Field focus | border 2px `navy-900` + cincin 2px `gold-500` di luar (offset 0) |
| Field error | border 2px `err-fg` + ikon + teks `err-fg` di bawah field |
| Field success | border 2px `ok-fg` + ikon centang |
| Field disabled | fill `#EFE9D9`, teks `navy-ink-muted`, tanpa kursor aktif |
| Header dialog | `navy-900` dengan teks `ivory-100`, agar langkah aktif emas terlihat |
| Indikator langkah aktif | Penanda `gold-500` di header gelap, selesai = ikon centang `ivory-100`, belum = lingkaran garis `navy-600` |
| Tombol primer | fill `navy-900`, teks `ivory-50` |
| Tombol sekunder | border `navy-900`, teks `navy-900` |
| Tautan | `navy-700` bergaris bawah. Emas hanya dipakai di atas navy. |
| Layar berhasil — kartu kredensial | `ivory-100`, border 1px `navy-900`, teks mono `navy-900` |

### 4.4 Peta Suara

| Elemen | Warna |
|---|---|
| Latar halaman | `navy-900` (header, toolbar) |
| Area peta | Kartu `ivory-50` dengan bidang dasar `ground-200` agar kedua kelompok terlihat jelas |
| Label kelompok, kategori, periode | `navy-900` di atas terang. Tiap kelompok diberi ikon + teks. |
| Tooltip | fill `navy-950`, teks `ivory-50`, border 1px `gold-500` |
| Toolbar filter | permukaan `navy-800`, teks `ivory-100`, chip aktif `gold-500` dengan teks `navy-900` |
| Legenda | `ivory-50` berteks `navy-900`, memuat dua contoh balok + label |
| Panel detail | `ivory-50`, teks `navy-900`, badge status (§4.6) |
| Tampilan Daftar | Tabel `ivory-50`, baris selang-seling `ivory-100`, garis `ivory-200` |
| Tampilan 2D | Sel memakai keluarga warna kelompok yang sama (atap), bukan warna baru |

### 4.5 Balok isometrik

| Kelompok | Atap | Sisi kiri | Sisi kanan | Outline | Pola atap |
|---|---|---|---|---|---|
| **Whistleblowing** (navy/slate-blue) | `navy-400` `#6F94BF` | `navy-700` `#345B85` | `navy-760` `#1B3F66` | 1px `navy-950` | Garis diagonal tipis `navy-950` 35% |
| **Aspirasi** (emas/ochre) | `gold-400` `#E9BE6F` | `gold-600` `#C58E32` | `gold-700` `#94651A` | 1px `navy-950` | Titik tengah `navy-950` 35% |

Keadaan:

| Keadaan | Tampilan |
|---|---|
| Default | Seperti tabel di atas |
| Hover | Atap +8% lebih terang, tooltip tampil. Tidak ada perubahan warna kelompok. |
| Keyboard focus | Cincin ganda: luar 3px `navy-950`, dalam 2px `ivory-50`. Muncul pada atap, tampak di balok navy maupun emas. |
| Terpilih | Cincin ganda yang sama + balok naik 4% + balok lain diredupkan ke 45% (diterapkan pada saturasi, bukan hanya opasitas, agar label tetap terbaca) |
| Kosong | Ubin datar `ground-200` bergaris putus-putus `ink-border` |
| Ekstrem | Penanda patahan `navy-950` + label angka |

Kedua kelompok dibedakan oleh **label di bidang dasar, ikon, pola atap, dan legenda**, bukan warna saja. Warna balok tidak berubah menurut jumlah dan tidak menyatakan keparahan.

Catatan: pencahayaan tetap. Bidang atas paling terang, kiri sedang, kanan paling gelap. Nilai di tabel adalah nilai final dan tidak dihitung dari data.

### 4.6 Badge status (identitas + status terpisah)

| Status | Latar | Teks/ikon | Ikon |
|---|---|---|---|
| Diterima (penanganan) | `ivory-200` | `navy-900` | Inbox |
| Sedang ditinjau | `info-bg` | `info-fg` | Search |
| Butuh informasi | `warn-bg` | `warn-fg` | Tanda tanya |
| Ditindaklanjuti | `navy-750` | `ivory-50` | Workflow |
| Selesai | `ok-bg` | `ok-fg` | Centang |
| Ditutup | transparan, border `ink-border` | `navy-ink-muted` | Tanda coret |
| Status publik aspirasi/pelanggaran | `gold-100` | `gold-800` | Globe |

Badge status publik memakai emas lembut karena itu penanda **identitas konten publik**, bukan peringatan. Peringatan (“Butuh informasi”) memakai keluarga `warn`, yang berbeda dari emas merek.

### 4.7 Marun: penggunaan terbatas

Marun hanya boleh dipakai pada:

- sekitar 6% bubble wordmark dan satu titik planet (beranda),
- garis tipis penanda kepala dokumen/footer yang mengikuti logo,
- latar chip identitas kecil seperti “P3MD” berteks `ivory-100`.

Marun **tidak** dipakai untuk: tombol, galat, penolakan, peringatan, label “pelanggaran”, atau cincin fokus.

---

## 5. Design tokens

Satu sumber di `src/styles/tokens.css`. Tailwind v4 (`@theme`), shadcn/ui, Canvas, dan SVG semuanya membaca token yang sama. Komponen **tidak boleh** memakai HEX langsung.

### 5.1 Primitif

```
--navy-950:#010F1E; --navy-900:#021E39; --navy-800:#0B2F52; --navy-750:#123B63;
--navy-700:#345B85; --navy-600:#4A78A6; --navy-400:#6F94BF; --navy-300:#B9C3CF;
--navy-760:#1B3F66; --navy-ink-muted:#4B5E73; --ink-border:#5F6F82;
--gold-800:#7A4F0C; --gold-700:#94651A; --gold-600:#C58E32; --gold-500:#DCA752;
--gold-400:#E9BE6F; --gold-300:#DAB25F; --gold-200:#EFD39B; --gold-100:#F3E3BC;
--ivory-50:#FBF6EA; --ivory-100:#F0E2C5; --ivory-200:#D9CBAA; --ground-200:#E3D6B8;
--maroon-700:#89161D; --maroon-300:#E58A8F;
```

### 5.2 Semantik

| Kelompok | Token | Terang (form, panel, dashboard) | Gelap (beranda, peta header) |
|---|---|---|---|
| Latar | `--background` | `--ivory-50` | `--navy-900` |
| | `--background-deep` | `--ivory-100` | `--navy-950` |
| Permukaan | `--surface` | `#FFFFFF` | `--navy-800` |
| | `--surface-raised` | `--ivory-100` | `--navy-750` |
| Teks | `--text` | `--navy-900` | `--ivory-100` |
| | `--text-muted` | `--navy-ink-muted` | `--navy-300` |
| | `--text-on-primary` | `--ivory-50` | `--navy-900` |
| Primer | `--primary` | `--navy-900` | `--ivory-100` |
| | `--primary-hover` | `--navy-750` | `--ivory-50` |
| Sekunder (aksen) | `--secondary` | `--gold-100` | `--gold-500` |
| | `--secondary-foreground` | `--gold-800` | `--navy-900` |
| Tombol layanan | `--btn-wb-bg` / `--btn-wb-fg` | — | `--ivory-100` / `--navy-900` |
| | `--btn-asp-bg` / `--btn-asp-fg` | — | `--gold-500` / `--navy-900` |
| Tautan | `--link` | `--navy-700` | `--gold-500` |
| Border | `--border` | `--ivory-200` | `--navy-600` |
| | `--border-control` | `--ink-border` | `--ivory-200` |
| Fokus | `--focus-ring` | `--navy-900` | `--gold-500` |
| | `--focus-ring-outer` | `--gold-500` | `--ivory-100` |
| Seleksi peta | `--select-inner` / `--select-outer` | `--ivory-50` / `--navy-950` | sama |
| Merek terbatas | `--brand-accent` | `--maroon-700` | `--maroon-700` |
| Orbit | `--orbit` | — | `--gold-500` @ 22% |
| Overlay | `--overlay` | `--navy-950` @ 70% | sama |

### 5.3 Status (terpisah dari merek)

| Status | `--status-*-fg` | `--status-*-bg` | Ikon wajib |
|---|---|---|---|
| Sukses | `#1D6B43` | `#E3F2E8` | Centang |
| Peringatan | `#7A4F0C` | `#FBEBC8` | Segitiga |
| Galat | `#B42318` | `#FCE8E4` | Tanda seru |
| Informasi | `#1F5C99` | `#E4EEF9` | Huruf “i” |

`warn-fg` sengaja memakai nilai yang sama dengan `--gold-800`, tetapi **hanya pada latar `warn-bg`** dan selalu bersama ikon segitiga serta teks. Di luar konteks itu, token emas merek tidak dipakai untuk peringatan.

### 5.4 Token peta dan bubble

```
--wb-atap:var(--navy-400);  --wb-kiri:var(--navy-700);  --wb-kanan:var(--navy-760);
--asp-atap:var(--gold-400); --asp-kiri:var(--gold-600); --asp-kanan:var(--gold-700);
--peta-outline:var(--navy-950); --peta-tanah:var(--ground-200);
--bubble-0:var(--navy-800);                       /* warna dasar huruf */
--bubble-set: gold-500, gold-300, ivory-100, gold-400, navy-700, navy-600, navy-750, maroon-700
```

### 5.5 Aturan penggunaan token di Canvas dan SVG

- Canvas tidak memakai CSS variable secara langsung. Saat mount, `getComputedStyle(root).getPropertyValue("--bubble-…")` dibaca **sekali** lalu dimasukkan ke mesin. Wordmark statis (CSS) dan canvas memakai token yang sama sehingga tampak identik.
- SVG peta memakai atribut `fill="var(--asp-atap)"` melalui class, bukan HEX di JSX.
- Lint (`no-restricted-syntax`) menolak literal `#RRGGBB` di `features/**` dan `components/**`. Satu-satunya pengecualian adalah `tokens.css`.
- Satu uji unit membandingkan nilai di `tokens.css` dengan tabel kontras §3, dan gagal jika rasio turun di bawah ambang.

---

## 6. Warna identitas versus warna status

| Warna merek | Boleh berarti | Tidak boleh berarti |
|---|---|---|
| Emas | Aksen aktif, kelompok Aspirasi, konten publik | Peringatan, “perlu perhatian” |
| Marun | Aksen merek kecil | Galat, penolakan, pelanggaran, bahaya |
| Navy | Dasar, teks, kelompok Whistleblowing | Tingkat keparahan |
| Ivory | Permukaan, teks di atas gelap | — |

Warna status (`ok`, `warn`, `err`, `info`) hanya muncul pada badge, pesan, dan field, **selalu bersama ikon dan teks**. Merah galat `#B42318` sengaja lebih terang dan lebih oranye daripada marun `#89161D` agar tidak tertukar.

---

## 7. Perubahan dari palet sebelumnya

| Area | Sebelumnya | Sekarang |
|---|---|---|
| Latar beranda & peta | Navy `#060821` | Navy P3MD `#021E39` |
| Warna dasar wordmark | `#2F47FF` (cobalt) | `navy-800` `#0B2F52` |
| Bubble | Cobalt, biru, cyan, mint, lavender | Emas, emas lembut, ivory, dan turunan navy; marun 6% |
| Orbit | Cyan/biru | Emas 22% |
| Tombol Whistleblowing | Cobalt `#3D63FF`, teks putih | Fill ivory `#F0E2C5`, teks navy |
| Tombol Aspirasi | Mint `#1FE3C0`, teks navy | Fill emas `#DCA752`, teks navy |
| Tombol sekunder | Pil garis cyan | Pil garis ivory-200 |
| Fokus | Cyan `#12D0FF` | Emas di atas gelap, navy di atas terang (cincin ganda) |
| Seleksi | Lavender `#B5C3FF` | Cincin ganda ivory + navy |
| Form | Kertas `#F7F8FC` | Ivory `#FBF6EA` |
| Whistleblowing di peta | Cobalt `#7C93FF`/`#3D63FF`/`#2541C9` | Navy/slate-blue `#6F94BF`/`#345B85`/`#1B3F66` |
| Aspirasi di peta | Mint `#7FF2DB`/`#1FE3C0`/`#14A88E` | Emas/ochre `#E9BE6F`/`#C58E32`/`#94651A` |
| Bidang dasar peta | `#0C1033` gelap | `ground-200` `#E3D6B8` terang |
| Area peta | Gelap | Kartu terang di bawah header navy |
| Teal dok. 02 (primer, ring) | `#0E4A5C`, `#2A7F95` | Navy `#021E39`, ring emas/navy |
| Aksen layanan dok. 02 | Tembaga & hijau | Ivory & emas (tombol), navy & emas (peta) |
| Status | Sudah ada | Dipertahankan, disesuaikan ke latar ivory |

Yang tidak berubah: layout, fitur, alur, struktur komponen, urutan lapisan, dan perilaku animasi.

---

## 8. Penampilan logo

**Sifat berkas:** PNG 1024×1280 bertransparansi, berisi lambang perisai navy berbingkai emas, elang emas, tulisan “P3MD”, laurel, dan dua pita (emas “BERANI · CEPAT · TERHORMAT”, marun “SOEDIRMAN”). Latar merah yang terlihat di gambar adalah transparansi.

**Aturan penampilan:**

- Logo ditampilkan dengan **warna aslinya**. Tidak ada tint, gradien, bayangan, glow, atau filter (AC-W11).
- **Logo dapat diletakkan langsung di atas navy** karena perisainya berbingkai emas, dan laurel serta pita emasnya terpisah jelas dari latar. Panel ivory tidak diperlukan di header gelap. Di atas ivory, logo juga tampil jelas.
- **Ukuran minimum:** tinggi 48px agar bentuk perisai dan elang dikenali. Tulisan kecil (“PROGRAM PRESIDEN…”, semboyan) baru terbaca pada tinggi ≥ 160px, sehingga tidak boleh diandalkan terbaca di ukuran kecil.
- **Penempatan:** di beranda desktop, logo berada di posisi logo referensi (kanan atas wordmark) setinggi sekitar 150–170px. Di header dan mobile, logo berukuran 48–56px bersama teks “Ruang Suara”.
- Ruang bebas minimal di sekeliling logo setara 1/2 tinggi lambang.
- Latar merah `#A41213` di gambar tidak dipakai di mana pun di UI.
- Berkas **vektor (SVG)** dibutuhkan untuk hasil tajam di layar beresolusi tinggi. Jika hanya PNG tersedia, ekspor pada 2× dan 3× dari ukuran tampil, dan sajikan lewat `next/image` dengan `width/height` tetap agar tidak terjadi lompatan tata letak.

---

## 9. Verifikasi dan langkah berikutnya

| # | Langkah | Kapan |
|---|---|---|
| 1 | ~~Terima gambar logo dan ambil sampel~~ **Selesai** (§2.0). Sisa: minta berkas vektor (SVG) atau PNG resolusi lebih tinggi | T1 |
| 2 | ~~Warna tambahan di lambang~~ **Tidak ada.** Putuskan apakah ivory UI disamakan dengan huruf logo (`#F1E8D6`), lalu hitung ulang §3 jika ya | T1 |
| 3 | Hitung ulang seluruh rasio kontras bila ada HEX yang berubah | T1 |
| 4 | Uji simulasi buta warna (protanopia, deuteranopia, grayscale) pada tombol, balok, dan badge | T5 |
| 5 | Uji visual kedua kelompok balok pada layar terang dan redup, serta pada ponsel dengan kecerahan rendah | T5 |

### Risiko dan catatan

- **Hak penggunaan lambang.** Rencana ini hanya mengikuti warna lambang P3MD dan tidak membuat klaim tentang hak penggunaannya. Izin penggunaan logo oleh pihak berwenang perlu dipastikan di luar perencanaan teknis.
- **Marun pada bubble 6%.** Marun adalah bagian nyata dari lambang, sehingga porsinya dapat dinaikkan sedikit tanpa mengubah struktur token, selama tidak dipakai untuk tombol, galat, atau peringatan.
- **Ruang kontras antarbidang balok rendah** (§3.4). Ini diterima karena outline, label, dan pola atap yang membawa informasi.

---

## 10. Acceptance criteria warna

| ID | Kriteria |
|---|---|
| AC-W1 | Seluruh pasangan teks pada §3.1–3.2 dan §3.5 memenuhi ≥ 4,5:1, diverifikasi oleh uji unit dari `tokens.css` |
| AC-W2 | Seluruh batas kontrol dan cincin fokus memenuhi ≥ 3:1 terhadap latarnya |
| AC-W3 | Tidak ada literal HEX di `features/**` dan `components/**` (lint CI). Canvas membaca warna dari token. |
| AC-W4 | Tombol “Laporkan Pelanggaran” dan “Sampaikan Aspirasi” sama-sama berfill terang dengan rasio ≥ 7:1 terhadap latar beranda. Tidak ada yang berwarna merah. |
| AC-W5 | Teks emas tidak pernah ditempatkan di atas permukaan terang (`gold-500` dan `gold-300` di atas ivory). Hanya `gold-800` yang boleh. |
| AC-W6 | Setiap balok memiliki outline 1px `navy-950` dan 3 bidang dengan token kelompoknya. Balok emas terlihat jelas di atas `ground-200`. |
| AC-W7 | Balok terpilih dan balok terfokus keyboard menunjukkan cincin ganda yang terlihat pada balok navy maupun emas |
| AC-W8 | Warna balok tidak berubah menurut jumlah, status, atau data apa pun |
| AC-W9 | Setiap warna status disertai ikon dan teks. Emas dan marun merek tidak muncul sebagai warna galat atau peringatan. |
| AC-W10 | Dengan simulasi buta warna, kedua kelompok balok tetap dapat dibedakan lewat label, ikon, dan pola atap |
| AC-W11 | Logo tampil dengan warna asli tanpa filter CSS (`filter`, `opacity`, `mix-blend-mode`, `background-blend-mode` tidak diterapkan pada elemen logo) |
| AC-W12 | Wordmark statis (CSS) dan canvas memakai daftar warna dari token yang sama |
