/**
 * Kontrak data pelacakan (dok. 01 §4.C, dok. 03 §8.3). DTO pengirim di-parse dengan
 * `.strict()`: catatan internal, alasan internal, dan nama staf tidak mungkin ikut terkirim.
 */
import { z } from "zod";
import { ATURAN_LAMPIRAN, EKSTENSI_LAMPIRAN } from "./kiriman";
import { Jenis } from "./publik";

/** Nomor Referensi: huruf besar, tanpa spasi. Contoh: WBS-26-7K3Q-XR9T. */
export const normalisasiReferensi = (v: string) => v.replace(/\s+/g, "").toUpperCase();

/**
 * Kode Akses: huruf besar, tanpa spasi/tanda hubung, dan karakter yang mirip disamakan
 * (Crockford: O → 0, I/L → 1) agar salah ketik yang wajar tetap cocok.
 */
export const normalisasiKodeAkses = (v: string) =>
  v.replace(/[\s-]+/g, "").toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1");

export const SkemaMasukPelacakan = z.object({
  nomorReferensi: z
    .string()
    .transform(normalisasiReferensi)
    .pipe(z.string().min(1, "Isi Nomor Referensi.").max(40, "Nomor Referensi tidak dikenali.")),
  kodeAkses: z
    .string()
    .transform(normalisasiKodeAkses)
    .pipe(z.string().min(1, "Isi Kode Akses.").max(64, "Kode Akses tidak dikenali.")),
});

export const MAKS_BALASAN = 2000;
export const SkemaBalasan = z.object({
  isi: z
    .string()
    .trim()
    .min(10, "Balasan terlalu singkat (minimal 10 karakter).")
    .max(MAKS_BALASAN, `Balasan terlalu panjang (maksimal ${MAKS_BALASAN.toLocaleString("id-ID")} karakter).`),
});

/** Prototipe: hanya ekstensi yang dikirim ke server, isi file tidak pernah diunggah. */
export const SkemaTambahLampiran = z.object({
  ekstensi: z
    .array(z.string().refine((e) => EKSTENSI_LAMPIRAN.includes(e), "Jenis file tidak didukung."))
    .min(1)
    .max(ATURAN_LAMPIRAN.pelanggaran.maksFile),
});

export const STATUS_PENANGANAN = ["DITERIMA", "DITINJAU", "BUTUH_INFO", "DITINDAKLANJUTI", "SELESAI", "DITUTUP"] as const;
export const StatusPenanganan = z.enum(STATUS_PENANGANAN);
export type StatusPenanganan = z.infer<typeof StatusPenanganan>;

export const LABEL_PENANGANAN_PENGIRIM: Record<StatusPenanganan, string> = {
  DITERIMA: "Diterima",
  DITINJAU: "Sedang ditinjau",
  BUTUH_INFO: "Membutuhkan informasi dari Anda",
  DITINDAKLANJUTI: "Sedang ditindaklanjuti",
  SELESAI: "Selesai ditangani",
  DITUTUP: "Ditutup",
};

/** Status publikasi yang disederhanakan untuk pengirim (dok. 01 §4.C butir 1). */
export const PublikasiPengirim = z.enum(["TIDAK", "DIKURASI", "DIPUBLIKASIKAN", "DITARIK"]);
export type PublikasiPengirim = z.infer<typeof PublikasiPengirim>;

export const LABEL_PUBLIKASI_PENGIRIM: Record<PublikasiPengirim, string> = {
  TIDAK: "Tidak dipublikasikan",
  DIKURASI: "Sedang dikurasi untuk publikasi",
  DIPUBLIKASIKAN: "Dipublikasikan dalam bentuk tersamar",
  DITARIK: "Izin publikasi telah ditarik",
};

const tanggal = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const KirimanPengirim = z
  .object({
    nomorReferensi: z.string(),
    jenis: Jenis,
    kategoriLabel: z.string(),
    judul: z.string(),
    uraian: z.string(),
    dibuat: tanggal,
    statusPenanganan: StatusPenanganan,
    publikasi: PublikasiPengirim,
    izinPublikasi: z.boolean(),
    bisaTarikIzin: z.boolean(),
    lampiran: z.array(z.string()),
    maksLampiran: z.number().int().nonnegative(),
    linimasa: z.array(z.object({ tanggal, label: z.string() }).strict()),
    pesan: z.array(
      z.object({ arah: z.enum(["KE_PENGIRIM", "DARI_PENGIRIM"]), tanggal, isi: z.string() }).strict(),
    ),
    /** Kiriman dapat dibalas selama belum ditutup. */
    bisaDibalas: z.boolean(),
    dataContoh: z.boolean(),
  })
  .strict();
export type KirimanPengirim = z.infer<typeof KirimanPengirim>;

/** Pesan galat masuk: SAMA untuk semua penyebab agar tidak membocorkan nomor yang ada. */
export const PESAN_GAGAL_MASUK = "Nomor Referensi atau Kode Akses tidak cocok. Periksa kembali huruf dan angkanya.";
export const PESAN_TERKUNCI = "Terlalu banyak percobaan. Demi keamanan, coba lagi dalam 15 menit.";
