import "server-only";
import type { Jenis, KategoriPublik } from "@/lib/schemas/publik";

/** DATA CONTOH — kategori sintetis. Kategori sesungguhnya dikelola admin (dok. 03 §8.2). */
export const KATEGORI_WB: KategoriPublik[] = [
  { id: "wb-pungli", label: "Pungutan tidak resmi", urutan: 1 },
  { id: "wb-wewenang", label: "Penyalahgunaan wewenang", urutan: 2 },
  { id: "wb-konflik", label: "Konflik kepentingan", urutan: 3 },
  { id: "wb-gratifikasi", label: "Gratifikasi", urutan: 4 },
  { id: "wb-anggaran", label: "Penyimpangan anggaran", urutan: 5 },
  { id: "wb-perundungan", label: "Perundungan & pelecehan", urutan: 6 },
  { id: "wb-etik", label: "Pelanggaran etik", urutan: 7 },
  { id: "wb-lainnya", label: "Lainnya", urutan: 99 },
];

export const KATEGORI_ASP: KategoriPublik[] = [
  { id: "asp-fasum", label: "Fasilitas umum", urutan: 1 },
  { id: "asp-layanan", label: "Layanan administrasi", urutan: 2 },
  { id: "asp-program", label: "Kegiatan & program", urutan: 3 },
  { id: "asp-informasi", label: "Komunikasi & informasi", urutan: 4 },
  { id: "asp-kesejahteraan", label: "Kesejahteraan peserta", urutan: 5 },
  { id: "asp-lingkungan", label: "Lingkungan & kebersihan", urutan: 6 },
  { id: "asp-keamanan", label: "Keamanan & ketertiban", urutan: 7 },
  { id: "asp-teknologi", label: "Teknologi & sistem", urutan: 8 },
  { id: "asp-lainnya", label: "Lainnya", urutan: 99 },
];

/** Tambahan untuk skenario “banyak kategori” (menguji penggabungan “Lainnya” di peta). */
export const KATEGORI_ASP_TAMBAHAN: KategoriPublik[] = [
  { id: "asp-transportasi", label: "Transportasi", urutan: 10 },
  { id: "asp-kesehatan", label: "Layanan kesehatan", urutan: 11 },
  { id: "asp-pelatihan", label: "Pelatihan & pengembangan", urutan: 12 },
  { id: "asp-kantin", label: "Kantin & konsumsi", urutan: 13 },
  { id: "asp-asrama", label: "Asrama & akomodasi", urutan: 14 },
  { id: "asp-olahraga", label: "Olahraga & rekreasi", urutan: 15 },
];

export function kategoriDasar(): Record<Jenis, KategoriPublik[]> {
  return { WB: KATEGORI_WB, ASP: KATEGORI_ASP };
}
