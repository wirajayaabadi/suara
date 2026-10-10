/**
 * Kontrak data publik (dok. 05 §5.5). Semua respons publik di-parse dengan skema
 * `.strict()` sebelum dikirim, sehingga kolom yang tidak dikenal — termasuk kolom
 * privat yang tidak sengaja ikut — ditolak.
 */
import { z } from "zod";

export const JENIS = ["WB", "ASP"] as const;
export const Jenis = z.enum(JENIS);
export type Jenis = z.infer<typeof Jenis>;

export const LABEL_JENIS: Record<Jenis, string> = {
  WB: "Whistleblowing",
  ASP: "Aspirasi",
};

/** Status publik per jenis (dok. 01 §5.4). Bukan status penanganan internal. */
export const STATUS_PUBLIK_WB = ["DALAM_PENANGANAN", "SELESAI_DITANGANI"] as const;
export const STATUS_PUBLIK_ASP = [
  "DITERIMA",
  "DIPERTIMBANGKAN",
  "DITINDAKLANJUTI",
  "SUDAH_DILAKSANAKAN",
  "TIDAK_DAPAT_DILAKSANAKAN",
] as const;
export const StatusPublik = z.enum([...STATUS_PUBLIK_WB, ...STATUS_PUBLIK_ASP]);
export type StatusPublik = z.infer<typeof StatusPublik>;

export const LABEL_STATUS_PUBLIK: Record<StatusPublik, string> = {
  DALAM_PENANGANAN: "Dalam penanganan",
  SELESAI_DITANGANI: "Selesai ditangani",
  DITERIMA: "Diterima",
  DIPERTIMBANGKAN: "Dipertimbangkan",
  DITINDAKLANJUTI: "Ditindaklanjuti",
  SUDAH_DILAKSANAKAN: "Sudah dilaksanakan",
  TIDAK_DAPAT_DILAKSANAKAN: "Tidak dapat dilaksanakan",
};

export function statusUntukJenis(jenis: Jenis): readonly StatusPublik[] {
  return jenis === "WB" ? STATUS_PUBLIK_WB : STATUS_PUBLIK_ASP;
}

/** Status yang dihitung sebagai “selesai ditindaklanjuti” di metrik (dok. 05 §3.9). */
export const STATUS_SELESAI: readonly StatusPublik[] = ["SELESAI_DITANGANI", "SUDAH_DILAKSANAKAN"];

const tanggal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "format YYYY-MM-DD");
const kodePublik = z.string().regex(/^[AR]-\d{4}$/, "kode publik A-0000 / R-0000");

export const KategoriPublik = z
  .object({
    id: z.string().min(1),
    label: z.string().min(1),
    urutan: z.number().int().nonnegative(),
  })
  .strict();
export type KategoriPublik = z.infer<typeof KategoriPublik>;

/** Detail satu konten publik — `GET /api/publik/konten/[kode]`. */
export const KontenPublik = z
  .object({
    kode: kodePublik,
    jenis: Jenis,
    judul: z.string().min(1).max(120),
    /** Ringkasan tersamar (WB) atau isi aspirasi yang dikurasi (ASP). */
    ringkasan: z.string().min(1).max(3000),
    kategoriId: z.string(),
    kategoriLabel: z.string(),
    /** Periode umum kejadian, sudah digeneralisasi (mis. “Triwulan II 2026”). */
    periodeLabel: z.string().optional(),
    statusPublik: StatusPublik,
    tanggapanPublik: z.string().max(2000).optional(),
    /** Hanya WB, hanya jika sengaja ditulis dan disetujui (dok. 01 §5.4). */
    pernyataanHasil: z.string().max(1000).optional(),
    /** Tanggal pertama kali dipublikasikan (WIB). Dasar agregasi peta. */
    diterbitkan: tanggal,
    diperbarui: tanggal,
    /** Wajib untuk WB: “publikasi tidak berarti dugaan terbukti”. */
    penafian: z.string().optional(),
  })
  .strict()
  .refine((k) => k.jenis !== "WB" || Boolean(k.penafian), {
    message: "Konten whistleblowing wajib memiliki penafian",
  })
  .refine((k) => statusUntukJenis(k.jenis).includes(k.statusPublik), {
    message: "Status publik tidak sesuai jenis",
  })
  .refine((k) => k.jenis === "WB" || k.pernyataanHasil === undefined, {
    message: "Pernyataan hasil hanya untuk whistleblowing",
  });
export type KontenPublik = z.infer<typeof KontenPublik>;

/** Satu baris daftar di panel blok — `GET /api/publik/peta/item`. */
export const ItemPeta = z
  .object({
    kode: kodePublik,
    jenis: Jenis,
    judul: z.string(),
    cuplikan: z.string().max(160),
    kategoriLabel: z.string(),
    statusPublik: StatusPublik,
    tanggalPublikasi: tanggal,
  })
  .strict();
export type ItemPeta = z.infer<typeof ItemPeta>;

export const DaftarItemPeta = z
  .object({
    item: z.array(ItemPeta),
    total: z.number().int().nonnegative(),
    halaman: z.number().int().positive(),
    ukuranHalaman: z.number().int().positive(),
  })
  .strict();
export type DaftarItemPeta = z.infer<typeof DaftarItemPeta>;

/** Kartu pada halaman daftar `/aspirasi` dan `/ringkasan`. Hanya kolom publik. */
export const KartuKonten = ItemPeta.extend({
  /** Cuplikan tanggapan/tindak lanjut publik, bila ada. */
  cuplikanTanggapan: z.string().max(160).optional(),
}).strict();
export type KartuKonten = z.infer<typeof KartuKonten>;

export const DaftarKonten = z
  .object({
    item: z.array(KartuKonten),
    total: z.number().int().nonnegative(),
    halaman: z.number().int().positive(),
    jumlahHalaman: z.number().int().positive(),
    ukuranHalaman: z.number().int().positive(),
  })
  .strict();
export type DaftarKonten = z.infer<typeof DaftarKonten>;

export const Granularitas = z.enum(["bulan", "triwulan", "tahun"]);
export type Granularitas = z.infer<typeof Granularitas>;

export const KolomPeriode = z.object({ kunci: z.string(), label: z.string() }).strict();
export type KolomPeriode = z.infer<typeof KolomPeriode>;

export const Blok = z
  .object({
    jenis: Jenis,
    kategoriId: z.string(),
    periode: z.string(),
    jumlah: z.number().int().positive(),
    // Hanya status yang muncul di blok ini (Zod 4: z.record dengan kunci enum bersifat lengkap).
    status: z.partialRecord(StatusPublik, z.number().int().positive()),
  })
  .strict();
export type Blok = z.infer<typeof Blok>;

export const Skala = z
  .object({
    maks: z.number().int().nonnegative(),
    batasSkala: z.number().int().positive(),
    terpotong: z.boolean(),
  })
  .strict();
export type Skala = z.infer<typeof Skala>;

/** Agregat peta — `GET /api/publik/peta`. Hanya dari konten yang sudah tayang. */
export const DatasetPeta = z
  .object({
    dibuat: z.string(),
    periode: z
      .object({
        granularitas: Granularitas,
        kolom: z.array(KolomPeriode),
        /** Granularitas dinaikkan otomatis karena kolom melebihi batas. */
        dinaikkan: z.boolean(),
      })
      .strict(),
    kelompok: z.array(
      z
        .object({
          jenis: Jenis,
          label: z.string(),
          kategori: z.array(KategoriPublik),
        })
        .strict(),
    ),
    blok: z.array(Blok),
    skala: Skala,
    metrik: z
      .object({
        total: z.number().int().nonnegative(),
        perJenis: z.object({ WB: z.number().int().nonnegative(), ASP: z.number().int().nonnegative() }).strict(),
        selesai: z.number().int().nonnegative(),
        diperbaruiTerakhir: tanggal.nullable(),
      })
      .strict(),
    /** True bila data berasal dari data contoh (bukan basis data). */
    dataContoh: z.boolean(),
  })
  .strict();
export type DatasetPeta = z.infer<typeof DatasetPeta>;
