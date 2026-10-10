import "server-only";
import type { StatusPublik } from "@/lib/schemas/publik";

/*
 * DATA CONTOH — teks sintetis. Ringkasan whistleblowing ditulis seperti hasil kurasi:
 * tanpa nama, jabatan unik, tanggal persis, atau lokasi spesifik (dok. 01 §4.D).
 * Tidak ada isi laporan nyata di berkas ini.
 */

export type TemplatKonten = { judul: string; ringkasan: string };

export const LOKASI_UMUM = [
  "salah satu unit layanan",
  "lingkungan sekretariat",
  "kegiatan lapangan",
  "salah satu kantor wilayah",
  "bagian pengadaan",
  "unit pendukung",
];

export const TEMPLAT_WB: Record<string, TemplatKonten[]> = {
  "wb-pungli": [
    {
      judul: "Dugaan pungutan tidak resmi pada layanan perizinan",
      ringkasan:
        "Dilaporkan adanya permintaan biaya di luar ketentuan untuk mempercepat proses layanan di {lokasi}. Pengelola sedang memverifikasi alur layanan dan dokumen pendukung.",
    },
    {
      judul: "Dugaan biaya tambahan dalam pengurusan dokumen",
      ringkasan:
        "Pelapor menyampaikan dugaan adanya biaya tambahan yang tidak tercantum dalam daftar tarif resmi di {lokasi}. Informasi sedang dicocokkan dengan ketentuan yang berlaku.",
    },
  ],
  "wb-wewenang": [
    {
      judul: "Dugaan penyalahgunaan wewenang dalam penugasan",
      ringkasan:
        "Dilaporkan adanya penugasan yang diduga tidak sesuai prosedur di {lokasi}. Pengelola sedang menelaah dasar penugasan dan dokumen pendukung.",
    },
    {
      judul: "Dugaan penggunaan fasilitas untuk kepentingan pribadi",
      ringkasan:
        "Pelapor menyampaikan dugaan penggunaan fasilitas operasional di luar keperluan dinas di {lokasi}. Pengelola sedang memeriksa catatan penggunaan fasilitas.",
    },
  ],
  "wb-konflik": [
    {
      judul: "Dugaan konflik kepentingan dalam seleksi penyedia",
      ringkasan:
        "Dilaporkan adanya dugaan hubungan kepentingan dalam proses seleksi penyedia di {lokasi}. Pengelola sedang menelaah dokumen proses seleksi.",
    },
  ],
  "wb-gratifikasi": [
    {
      judul: "Dugaan penerimaan hadiah terkait layanan",
      ringkasan:
        "Pelapor menyampaikan dugaan penerimaan pemberian yang berkaitan dengan layanan di {lokasi}. Pengelola sedang memverifikasi informasi sesuai ketentuan gratifikasi.",
    },
  ],
  "wb-anggaran": [
    {
      judul: "Dugaan ketidaksesuaian penggunaan anggaran kegiatan",
      ringkasan:
        "Dilaporkan adanya dugaan ketidaksesuaian antara laporan dan pelaksanaan kegiatan di {lokasi}. Pengelola sedang mencocokkan dokumen pertanggungjawaban.",
    },
    {
      judul: "Dugaan pengadaan barang tidak sesuai spesifikasi",
      ringkasan:
        "Pelapor menyampaikan dugaan barang yang diterima tidak sesuai spesifikasi pengadaan di {lokasi}. Pengelola sedang memeriksa dokumen serah terima.",
    },
  ],
  "wb-perundungan": [
    {
      judul: "Dugaan perundungan dalam lingkungan kerja",
      ringkasan:
        "Dilaporkan adanya dugaan perlakuan merendahkan yang berulang di {lokasi}. Penanganan dilakukan secara tertutup dengan memprioritaskan keselamatan pihak terdampak.",
    },
  ],
  "wb-etik": [
    {
      judul: "Dugaan pelanggaran kode etik dalam pelayanan",
      ringkasan:
        "Pelapor menyampaikan dugaan perilaku yang tidak sesuai kode etik saat memberikan layanan di {lokasi}. Pengelola sedang menelaah keterangan yang tersedia.",
    },
  ],
  "wb-lainnya": [
    {
      judul: "Dugaan ketidaksesuaian prosedur administrasi",
      ringkasan:
        "Dilaporkan adanya dugaan prosedur administrasi yang tidak dijalankan sesuai ketentuan di {lokasi}. Pengelola sedang melakukan klarifikasi.",
    },
  ],
};

export const TEMPLAT_ASP: Record<string, TemplatKonten[]> = {
  "asp-fasum": [
    { judul: "Penambahan tempat duduk di ruang tunggu", ringkasan: "Ruang tunggu sering penuh pada jam sibuk sehingga banyak pengunjung berdiri cukup lama. Diusulkan penambahan tempat duduk dan pengaturan antrean." },
    { judul: "Perbaikan penerangan di area parkir", ringkasan: "Beberapa lampu di area parkir tidak menyala sehingga area terasa gelap pada malam hari. Diusulkan perbaikan dan pemeriksaan berkala." },
    { judul: "Akses ramah disabilitas di pintu masuk", ringkasan: "Pintu masuk utama belum memiliki jalur landai yang memadai. Diusulkan penambahan ramp dan pegangan tangan." },
  ],
  "asp-layanan": [
    { judul: "Jadwal layanan diperpanjang di akhir pekan", ringkasan: "Banyak peserta hanya dapat datang di akhir pekan. Diusulkan layanan terbatas pada Sabtu pagi." },
    { judul: "Penyederhanaan formulir pendaftaran", ringkasan: "Formulir pendaftaran meminta data yang sama berulang kali. Diusulkan penggabungan isian agar lebih ringkas." },
  ],
  "asp-program": [
    { judul: "Program mentoring antarangkatan", ringkasan: "Diusulkan program pendampingan dari peserta angkatan sebelumnya untuk membantu peserta baru beradaptasi." },
    { judul: "Kegiatan diskusi kepemimpinan rutin", ringkasan: "Diusulkan forum diskusi bulanan tentang studi kasus kepemimpinan dengan narasumber dari berbagai bidang." },
  ],
  "asp-informasi": [
    { judul: "Pengumuman jadwal melalui satu kanal resmi", ringkasan: "Informasi jadwal tersebar di beberapa grup sehingga mudah terlewat. Diusulkan satu kanal pengumuman resmi." },
    { judul: "Ringkasan keputusan rapat untuk peserta", ringkasan: "Diusulkan ringkasan singkat keputusan penting yang dapat dibaca seluruh peserta setelah rapat." },
  ],
  "asp-kesejahteraan": [
    { judul: "Penyesuaian waktu istirahat kegiatan", ringkasan: "Kegiatan berlangsung panjang tanpa jeda yang cukup. Diusulkan penambahan waktu istirahat di sesi siang." },
  ],
  "asp-lingkungan": [
    { judul: "Penambahan tempat sampah terpilah", ringkasan: "Tempat sampah belum dipisahkan antara organik dan anorganik. Diusulkan penyediaan tempat sampah terpilah dan papan petunjuk." },
    { judul: "Penghijauan area terbuka", ringkasan: "Area terbuka di halaman belakang terasa panas. Diusulkan penanaman pohon peneduh." },
  ],
  "asp-keamanan": [
    { judul: "Penambahan petugas jaga di malam hari", ringkasan: "Diusulkan penambahan petugas jaga dan pemeriksaan rutin pada malam hari di area asrama." },
  ],
  "asp-teknologi": [
    { judul: "Jaringan internet di ruang belajar", ringkasan: "Koneksi internet di ruang belajar sering terputus saat banyak pengguna. Diusulkan peningkatan kapasitas jaringan." },
    { judul: "Pendaftaran kegiatan secara daring", ringkasan: "Pendaftaran kegiatan masih menggunakan formulir kertas. Diusulkan pendaftaran daring yang dapat diakses dari ponsel." },
  ],
  "asp-lainnya": [
    { judul: "Kotak saran fisik di setiap lantai", ringkasan: "Diusulkan kotak saran fisik sebagai alternatif bagi yang tidak terbiasa memakai layanan daring." },
  ],
};

/** Templat generik untuk kategori yang tidak memiliki templat khusus (skenario uji). */
export const TEMPLAT_ASP_UMUM: TemplatKonten[] = [
  { judul: "Usulan perbaikan {kategori}", ringkasan: "Diusulkan peninjauan dan perbaikan pada aspek {kategori} agar lebih nyaman dan mudah diakses peserta." },
];

export const TANGGAPAN_ASP: Partial<Record<StatusPublik, string[]>> = {
  DITERIMA: ["Aspirasi telah diterima dan akan dibahas pada rapat koordinasi berikutnya."],
  DIPERTIMBANGKAN: [
    "Usulan sedang dikaji bersama unit terkait, termasuk kebutuhan anggaran dan waktu pelaksanaan.",
    "Pengelola sedang membandingkan beberapa alternatif pelaksanaan sebelum menetapkan keputusan.",
  ],
  DITINDAKLANJUTI: [
    "Usulan disetujui dan sedang dikerjakan secara bertahap. Perkembangan akan diperbarui di halaman ini.",
    "Unit terkait telah menyusun rencana kerja untuk menindaklanjuti usulan ini.",
  ],
  SUDAH_DILAKSANAKAN: [
    "Usulan telah dilaksanakan. Terima kasih atas masukan yang disampaikan.",
    "Perbaikan telah selesai dan akan dievaluasi kembali dalam tiga bulan.",
  ],
  TIDAK_DAPAT_DILAKSANAKAN: [
    "Usulan belum dapat dilaksanakan karena keterbatasan anggaran periode ini. Usulan dicatat untuk perencanaan berikutnya.",
  ],
};

export const TANGGAPAN_WB: Partial<Record<StatusPublik, string[]>> = {
  DALAM_PENANGANAN: [
    "Laporan sedang diverifikasi. Penanganan dilakukan secara tertutup sesuai prosedur.",
    "Pengelola telah meminta klarifikasi kepada unit terkait dan sedang menelaah dokumen.",
  ],
  SELESAI_DITANGANI: [
    "Penanganan telah selesai dan tindak lanjut internal sudah dilakukan sesuai ketentuan.",
    "Proses verifikasi selesai. Perbaikan prosedur telah diterapkan pada unit terkait.",
  ],
};

/** Hanya sebagian kecil ringkasan WB yang memuat pernyataan hasil (dok. 01 §5.4). */
export const PERNYATAAN_HASIL_WB = [
  "Hasil verifikasi menunjukkan sebagian dugaan didukung bukti yang cukup, dan tindakan perbaikan telah ditetapkan.",
  "Hasil verifikasi belum menemukan bukti yang cukup. Pemantauan pada unit terkait tetap dilanjutkan.",
];

export const PENAFIAN_WB =
  "Ringkasan dugaan yang telah disamarkan. Publikasi tidak berarti dugaan terbukti. Identitas semua pihak tidak ditampilkan.";
