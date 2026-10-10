# Rencana Pembangunan — Whistleblowing System & Penampung Aspirasi

*Nama kerja: **Lapor Pak** · Versi rencana: 0.1 (draf untuk dikonfirmasi) · 8 Oktober 2026*

Dokumen ini menjadi panduan implementasi. **Belum ada kode aplikasi yang ditulis.** Keputusan bertanda “direkomendasikan” masih bisa diubah setelah pertanyaan klarifikasi di bawah dijawab.

## Cara membaca

| Dokumen | Isi |
|---|---|
| [01 — Produk, peran, alur, status](01-produk-peran-alur-status.md) | Konsep & tujuan · ruang lingkup MVP · tabel peran & hak akses · alur pengguna & pengelola · status & aturan perpindahan |
| [02 — Desain, halaman, formulir, komponen](02-desain-ux-formulir.md) | Design brief & dua arah visual · design tokens · sitemap & halaman · wireframe · spesifikasi formulir · teks antarmuka · batas anonimitas · komponen 21st.dev · kriteria penerimaan UI |
| [03 — Arsitektur, data, keamanan](03-arsitektur-data-keamanan.md) | Arsitektur · rekomendasi database, auth, storage, dan hosting · struktur rute & folder Next.js · Server/Client Components · cache & penarikan · model data · kontrol keamanan MVP vs lanjutan |
| [04 — Backlog, roadmap, risiko, pengujian](04-backlog-roadmap-risiko-pengujian.md) | Backlog berprioritas + estimasi · roadmap & ketergantungan · risiko & mitigasi · acceptance criteria & skenario uji |
| [05 — UI/UX beranda & Peta Suara](05-ui-ux-beranda-peta-suara.md) | “Ruang Suara” (v3): beranda Canvas 2D + SVG (adaptasi Astro Bubble Hero), form dalam dialog, Peta Suara isometrik SVG dua kelompok (adaptasi Focus City), tanpa WebGL, tokens Tema Malam, kontrak data peta, tahapan T0–T5, AC. **Menggantikan** 02 §2, §5.1–5.4, dan §6 untuk halaman pengunjung. |
| [06 — Palet warna P3MD](06-palet-warna-p3md.md) | Palet final (navy, emas, ivory, marun), warna sumber vs turunan, tabel kontras terhitung, pemetaan per area, design tokens, palet balok isometrik, pemisahan warna merek dan status. **Menggantikan semua nilai warna** di dok. 02 dan 05. Logo sudah diperiksa dan lima HEX sumber cocok. |
| [07 — Deploy di Vercel](07-deploy-vercel.md) | Kondisi kode terhadap Vercel, keputusan (lokasi data, paket, CSP vs PPR), lingkungan & region `sin1`, tahap A prototipe terlindungi → B Git/CI/backend → C produksi, variabel lingkungan, Firewall, biaya, risiko, checklist |

Peta hasil yang diminta:

| Hasil | Lokasi |
|---|---|
| 1. Ringkasan konsep dan tujuan | 01 §1 |
| 2. Ruang lingkup MVP & lanjutan | 01 §2 |
| 3. Peran & hak akses | 01 §3 |
| 4. Alur pengguna & pengelola | 01 §4 |
| 5. Status & aturan perpindahan | 01 §5 |
| 6. Sitemap & gambaran halaman | 02 §4 (wireframe di 02 §5) |
| 7. Spesifikasi formulir | 02 §6–§9 |
| 8. Arsitektur & rekomendasi teknologi | 03 §1–§3 |
| 9. Model data & relasi | 03 §8 |
| 10. Backlog | 04 §1 |
| 11. Roadmap | 04 §2 |
| 12. Risiko & mitigasi | 04 §3 |
| 13. Acceptance criteria & skenario uji | 04 §4 |
| Tambahan 1–2. Design brief, arah visual, design tokens | 02 §1–§3 |
| Tambahan 3. Wireframe | 02 §5 |
| Tambahan 4. Tabel komponen 21st.dev | 02 §10 |
| Tambahan 5. Rute & folder Next.js | 03 §4 |
| Tambahan 6. Database, auth, storage | 03 §2 |
| Tambahan 7. Roadmap desain → deployment | 04 §2 |
| Tambahan 8. Kriteria penerimaan UI | 02 §11 |

## Keputusan utama yang direkomendasikan

| Topik | Keputusan | Alasan singkat |
|---|---|---|
| Kebijakan publikasi | Ringkasan whistleblowing **dipublikasikan** dalam bentuk tersamar dengan izin pengirim, begitu juga aspirasi (dikonfirmasi 10 Okt 2026) | Transparansi penanganan |
| Model privasi | Kiriman **privat secara default**. Konten publik adalah **entitas terpisah yang berversi**, dan hanya versi yang disetujui yang tampil. | Konten privat tidak mungkin “ikut tampil” karena salah status |
| Status | Tiga dimensi terpisah: **penanganan**, **hasil**, **publikasi** | Dipublikasikan ≠ terbukti. Tetap privat ≠ tidak ditindaklanjuti. |
| Persetujuan | **Satu penyetuju berwenang** (boleh penyusun sendiri): ringkasan pelanggaran oleh Admin, aspirasi oleh Pengelola/Admin. Dikompensasi dengan checklist + pratinjau + konfirmasi penanda data pribadi yang wajib, audit, dan penarikan seketika. | Keputusan pengguna (10 Okt 2026): alur kurasi lebih cepat untuk tim kecil |
| Peran MVP | **Pengelola** + **Admin** (Kurator/Penangan bisa dipisah nanti) | Cocok untuk tim 2–5 orang |
| Pelacakan | **Nomor Referensi** (acak, bukan rahasia) + **Kunci Rahasia** 120 bit (disimpan sebagai HMAC). Dikirim via POST dan membuka sesi singkat yang terikat ke satu kiriman. | Tanpa akun, tidak dapat ditebak, tidak bocor lewat URL |
| Arah visual | Identitas **P3MD** (dok. 06): navy `#021E39`, emas, ivory, marun terbatas. Beranda dan peta berlatar navy, form berpermukaan ivory. | Selaras dengan logo, berwibawa dan hangat, kontras terhitung |
| Formulir | Keduanya 5 langkah dalam dialog (dok. 05), termasuk pilihan izin publikasi. Isian tidak disimpan di perangkat. | Menyeimbangkan beban isi dan privasi perangkat bersama |
| Hosting | **Opsi A**: Vercel + Supabase (Postgres & Storage S3), Better Auth + 2FA. **Opsi B** (VPS Indonesia) memakai kode yang sama jika regulasi mewajibkan. | Ops minimal untuk tim kecil, tetap portabel |
| Pemisahan data | Dua role DB: `app_public` hanya bisa membaca **view publik**, sedangkan `app_private` untuk dashboard | Bug di halaman publik tetap tidak dapat membaca data privat |
| Lampiran | Unggah ke karantina → encode ulang/sanitasi → **dienkripsi** → bucket privat → unduh lewat rute yang memeriksa akses dan mencatat audit | Metadata hilang, file berbahaya ternetralkan, akses tercatat |
| Pihak ketiga | Tanpa analitik, font, atau CAPTCHA pelacak pihak ketiga. Anti-spam memakai proof-of-work self-host. | Melindungi pengirim |
| Estimasi | ± **12 minggu** sampai go-live (2 pengembang + desainer/PO paruh waktu) + 2 minggu pilot | Lihat 04 §2 |

## Asumsi

| Kode | Asumsi | Perlu dikonfirmasi? |
|---|---|:-:|
| A1 | Satu organisasi, satu instance aplikasi | — |
| A2 | Antarmuka Bahasa Indonesia, mobile-first, mode terang | — |
| A3 | Tim pengelola 2–5 orang, minimal 1 Admin | ✅ Q2 |
| A4 | Volume < 300 kiriman/bulan, < 10.000 kunjungan/bulan | ✅ |
| A5 | Tanpa integrasi sistem HR/kasus/SSO di MVP | ✅ |
| A6 | Lampiran: JPG/PNG/WebP/PDF, 10 MB/file, maks. 5 file | ✅ Q5 |
| A7 | Target triase internal 3 hari kerja (belum dijanjikan ke publik) | ✅ Q4 |
| A8 | Tanpa kanal SMS/WhatsApp. Email notifikasi opsional. | ✅ Q4 |
| A9 | Retensi awal: spam 30 hari, ditutup 1 tahun, selesai 5 tahun | ✅ Q1 |
| A10 | Tim pembangun: 2 pengembang full-stack + 1 desainer/PO paruh waktu | ✅ |
| A11 | Target pemulihan: RPO 24 jam, RTO 8 jam | ✅ |
| A12 | Organisasi tunduk pada UU No. 27/2022 (PDP). Kebijakan privasi ditinjau pihak legal organisasi. | ✅ Q1 |
| A13 | Organisasi menyediakan teks hukum, FAQ, kontak resmi, dan kontak darurat | — |
| A14 | Tidak ada pedoman merek yang wajib diikuti. Jika ada, palet disesuaikan dengan tetap menjaga kontras AA. | ✅ |

## Status 21st.dev / Magic MCP

MCP 21st.dev **belum terhubung** di sesi perencanaan ini. Belum ada komponen yang dicari, dipilih, atau dipasang. Langkah yang memerlukannya ditandai **[MCP]** (02 §10, backlog B-06). Saat dipakai, hanya data sintetis yang boleh dikirim.

## Pertanyaan klarifikasi (paling berpengaruh)

1. **Jenis organisasi dan regulasi yang berlaku.** Apakah organisasi ini instansi pemerintah, BUMN/BUMD, swasta, kampus, atau organisasi masyarakat? Apakah ada kewajiban data disimpan di Indonesia, standar tertentu (mis. ISO 37001/37002), atau ketentuan retensi? *Jawaban ini menentukan Opsi A vs B dan masa retensi.*
2. **Struktur tim dan eskalasi.** Berapa orang yang akan mengelola dan siapa saja perannya? Siapa pihak independen yang menangani laporan tentang pengelola WBS atau pimpinan, misalnya komite etik, dewan pengawas, atau SPI?
3. **Kebijakan publikasi pelanggaran.** **Sebagian terjawab (10 Okt 2026):** ringkasan whistleblowing **dipublikasikan**, dengan **satu penyetuju**. Masih terbuka: bolehkah hasil verifikasi (terbukti/tidak) ikut ditampilkan, dan apakah bagian hukum perlu dilibatkan? Default rencana: hasil hanya tampil jika sengaja ditulis di kolom “pernyataan hasil” lalu disetujui.
4. **Komunikasi dengan pengirim.** Cukup lewat halaman pelacakan, atau perlu email notifikasi opsional? Apakah ada target waktu respons yang boleh dijanjikan kepada publik?
5. **Jenis lampiran.** Apakah perlu mendukung video, rekaman suara, atau dokumen Office selain gambar dan PDF, dan berapa ukuran maksimal yang realistis? *Jawaban ini berpengaruh besar pada pipeline keamanan file dan biaya penyimpanan.*
