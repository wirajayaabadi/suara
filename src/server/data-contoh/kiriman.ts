import "server-only";
import type { StatusPenanganan } from "@/lib/schemas/pelacakan";
import type { Jenis } from "@/lib/schemas/publik";

/*
 * DATA CONTOH — kiriman PRIVAT sintetis untuk prototipe halaman pelacakan (/lacak) dan
 * dashboard. Data ini TIDAK boleh mengalir ke halaman/endpoint publik: hanya DAL privat
 * yang boleh mengimpornya (dok. 03 §8.3).
 *
 * Kode akses di sini ditulis polos HANYA untuk keperluan uji coba. Di sistem sesungguhnya
 * yang disimpan adalah HMAC-nya dan kode tidak pernah dapat ditampilkan ulang (dok. 03 §8.2).
 * Semua nomor memakai segmen “CNTH” agar mudah dikenali sebagai contoh.
 */

export type StatusPublikasiKiriman =
  | "PRIVAT"
  | "DRAF"
  | "MENUNGGU_PERSETUJUAN"
  | "PERLU_REVISI"
  | "DIPUBLIKASIKAN"
  | "DITOLAK"
  | "DITARIK";

export type PesanContoh = {
  arah: "KE_PENGIRIM" | "DARI_PENGIRIM";
  tanggal: string;
  isi: string;
};

export type KejadianLinimasa = {
  tanggal: string;
  label: string;
  /** Hanya kejadian dengan nilai true yang tampil di halaman pelacakan pengirim. */
  terlihatPengirim: boolean;
  /** Catatan internal — tidak pernah tampil ke pengirim maupun publik. */
  alasanInternal?: string;
};

export type KirimanContoh = {
  nomorReferensi: string;
  /** HANYA UNTUK UJI COBA. Lihat catatan di atas berkas. */
  kodeAksesContoh: string;
  jenis: Jenis;
  kategoriId: string;
  judul: string;
  uraian: string;
  dibuat: string;
  statusPenanganan: StatusPenanganan;
  statusPublikasi: StatusPublikasiKiriman;
  izinPublikasi: boolean;
  /**
   * Kode konten publik terkait bila sudah tayang. Sengaja kosong di data contoh: kode
   * konten publik dibuat otomatis oleh generator sehingga tidak dapat ditautkan dengan benar.
   */
  kodePublik?: string;
  lampiran: string[];
  linimasa: KejadianLinimasa[];
  pesan: PesanContoh[];
  catatanInternal: string[];
};

export const KIRIMAN_CONTOH: KirimanContoh[] = [
  {
    nomorReferensi: "WBS-26-CNTH-0001",
    kodeAksesContoh: "CNTH-AAAA-BBBB-CCCC-DDDD-0001",
    jenis: "WB",
    kategoriId: "wb-pungli",
    judul: "Biaya tambahan saat mengurus dokumen",
    uraian:
      "Saat mengurus dokumen, saya diminta membayar biaya tambahan yang tidak ada di daftar tarif agar proses lebih cepat. Kejadian ini terjadi beberapa kali dalam sebulan terakhir.",
    dibuat: "2026-10-07",
    statusPenanganan: "DITERIMA",
    statusPublikasi: "PRIVAT",
    izinPublikasi: true,
    lampiran: ["lampiran-1.jpg"],
    linimasa: [{ tanggal: "2026-10-07", label: "Diterima", terlihatPengirim: true }],
    pesan: [],
    catatanInternal: [],
  },
  {
    nomorReferensi: "WBS-26-CNTH-0002",
    kodeAksesContoh: "CNTH-AAAA-BBBB-CCCC-DDDD-0002",
    jenis: "WB",
    kategoriId: "wb-anggaran",
    judul: "Barang pengadaan tidak sesuai",
    uraian:
      "Barang yang diterima unit kami berbeda dengan spesifikasi di dokumen pengadaan. Saya tidak tahu siapa yang memutuskan perubahan tersebut.",
    dibuat: "2026-09-21",
    statusPenanganan: "BUTUH_INFO",
    statusPublikasi: "PRIVAT",
    izinPublikasi: false,
    lampiran: ["lampiran-1.pdf", "lampiran-2.jpg"],
    linimasa: [
      { tanggal: "2026-09-21", label: "Diterima", terlihatPengirim: true },
      { tanggal: "2026-09-23", label: "Sedang ditinjau", terlihatPengirim: true },
      {
        tanggal: "2026-09-30",
        label: "Membutuhkan informasi dari Anda",
        terlihatPengirim: true,
        alasanInternal: "Perlu perkiraan bulan serah terima untuk mencocokkan dokumen.",
      },
    ],
    pesan: [
      {
        arah: "KE_PENGIRIM",
        tanggal: "2026-09-30",
        isi: "Terima kasih atas laporan Anda. Mohon jelaskan perkiraan bulan barang diterima dan jenis barangnya, tanpa menyebut nama orang.",
      },
    ],
    catatanInternal: ["Cocokkan dengan dokumen serah terima triwulan III."],
  },
  {
    nomorReferensi: "WBS-26-CNTH-0003",
    kodeAksesContoh: "CNTH-AAAA-BBBB-CCCC-DDDD-0003",
    jenis: "WB",
    kategoriId: "wb-wewenang",
    judul: "Penggunaan kendaraan operasional di luar tugas",
    uraian: "Kendaraan operasional beberapa kali dipakai di luar jam dan keperluan dinas.",
    dibuat: "2026-06-11",
    statusPenanganan: "SELESAI",
    statusPublikasi: "DIPUBLIKASIKAN",
    izinPublikasi: true,
    lampiran: [],
    linimasa: [
      { tanggal: "2026-06-11", label: "Diterima", terlihatPengirim: true },
      { tanggal: "2026-06-12", label: "Sedang ditinjau", terlihatPengirim: true },
      { tanggal: "2026-06-20", label: "Sedang ditindaklanjuti", terlihatPengirim: true },
      { tanggal: "2026-08-05", label: "Selesai ditangani", terlihatPengirim: true },
      { tanggal: "2026-08-07", label: "Ringkasan tersamar dipublikasikan", terlihatPengirim: true },
    ],
    pesan: [
      {
        arah: "KE_PENGIRIM",
        tanggal: "2026-08-05",
        isi: "Penanganan telah selesai. Prosedur penggunaan kendaraan operasional sudah diperbarui. Terima kasih atas laporan Anda.",
      },
    ],
    catatanInternal: ["Hasil verifikasi: terbukti sebagian. Rekomendasi perbaikan prosedur disetujui."],
  },
  {
    nomorReferensi: "ASP-26-CNTH-0004",
    kodeAksesContoh: "CNTH-AAAA-BBBB-CCCC-DDDD-0004",
    jenis: "ASP",
    kategoriId: "asp-fasum",
    judul: "Tempat duduk ruang tunggu kurang",
    uraian:
      "Pada jam sibuk banyak pengunjung berdiri lama di ruang tunggu. Usul saya, tambah kursi dan atur nomor antrean.",
    dibuat: "2026-08-18",
    statusPenanganan: "DITINDAKLANJUTI",
    statusPublikasi: "DIPUBLIKASIKAN",
    izinPublikasi: true,
    lampiran: ["lampiran-1.jpg"],
    linimasa: [
      { tanggal: "2026-08-18", label: "Diterima", terlihatPengirim: true },
      { tanggal: "2026-08-19", label: "Sedang ditinjau", terlihatPengirim: true },
      { tanggal: "2026-08-25", label: "Dipublikasikan", terlihatPengirim: true },
      { tanggal: "2026-09-10", label: "Sedang ditindaklanjuti", terlihatPengirim: true },
    ],
    pesan: [
      {
        arah: "KE_PENGIRIM",
        tanggal: "2026-09-10",
        isi: "Usulan Anda disetujui. Penambahan kursi dijadwalkan bulan depan.",
      },
    ],
    catatanInternal: [],
  },
  {
    nomorReferensi: "ASP-26-CNTH-0005",
    kodeAksesContoh: "CNTH-AAAA-BBBB-CCCC-DDDD-0005",
    jenis: "ASP",
    kategoriId: "asp-informasi",
    judul: "Pengumuman jadwal tersebar di banyak grup",
    uraian: "Informasi jadwal ada di beberapa grup sehingga sering terlewat.",
    dibuat: "2026-09-02",
    statusPenanganan: "DITUTUP",
    statusPublikasi: "PRIVAT",
    izinPublikasi: true,
    lampiran: [],
    linimasa: [
      { tanggal: "2026-09-02", label: "Diterima", terlihatPengirim: true },
      {
        tanggal: "2026-09-03",
        label: "Ditutup — digabungkan dengan aspirasi serupa",
        terlihatPengirim: true,
        alasanInternal: "Duplikat dari ASP-26-CNTH-0006.",
      },
    ],
    pesan: [
      {
        arah: "KE_PENGIRIM",
        tanggal: "2026-09-03",
        isi: "Aspirasi Anda digabungkan dengan aspirasi lain yang membahas hal yang sama dan sedang ditangani.",
      },
    ],
    catatanInternal: ["Duplikat. Tautkan ke kiriman utama."],
  },
];

/** Cari kiriman contoh menurut nomor referensi (huruf besar, tanpa spasi tepi). */
export function kirimanContohMenurutReferensi(nomor: string): KirimanContoh | undefined {
  return KIRIMAN_CONTOH.find((k) => k.nomorReferensi === nomor.trim().toUpperCase());
}
