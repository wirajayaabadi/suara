/**
 * Skema form pengajuan (dok. 02 §7, dok. 05 §2.7). Dipakai bersama:
 * klien (validasi per langkah) dan server (validasi ulang sebelum diproses).
 */
import { z } from "zod";

export const JENIS_PENGAJUAN = ["pelanggaran", "aspirasi"] as const;
export type JenisPengajuan = (typeof JENIS_PENGAJUAN)[number];

// ---------------------------------------------------------------- lampiran

export const ATURAN_LAMPIRAN = {
  pelanggaran: { maksFile: 5, maksPerFile: 10 * 1024 * 1024, maksTotal: 25 * 1024 * 1024 },
  aspirasi: { maksFile: 3, maksPerFile: 10 * 1024 * 1024, maksTotal: 30 * 1024 * 1024 },
} as const;

export const TIPE_LAMPIRAN: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "application/pdf": "PDF",
};
export const EKSTENSI_LAMPIRAN = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

// ---------------------------------------------------------------- bagian bersama

const teks = (min: number, maks: number, nama: string) =>
  z
    .string()
    .trim()
    .min(min, `${nama} terlalu singkat (minimal ${min} karakter).`)
    .max(maks, `${nama} terlalu panjang (maksimal ${maks.toLocaleString("id-ID")} karakter).`);

const opsional = (maks: number, nama: string) =>
  z.string().trim().max(maks, `${nama} terlalu panjang (maksimal ${maks.toLocaleString("id-ID")} karakter).`);

const email = z.union([
  z.literal(""),
  z.email("Format email tidak valid. Contoh: nama@contoh.id. Kosongkan jika tidak ingin memberi kontak."),
]);

const pilihanIzin = z.enum(["ya", "tidak"], { error: "Pilih apakah kiriman boleh dipublikasikan." });

const pernyataan = z.literal(true, {
  error: "Centang pernyataan ini untuk melanjutkan.",
});

/** Isian jebakan untuk bot: harus tetap kosong. */
const jebakan = z.string().max(0).optional();

// ---------------------------------------------------------------- pelanggaran

/** Jalankan refine selama masukan berupa objek, walaupun field lain masih bermasalah. */
const selaluObjek = (p: { value: unknown }) => typeof p.value === "object" && p.value !== null;

export const JENIS_WAKTU = ["pasti", "bulan", "berlangsung", "tidak_ingat"] as const;

export const SkemaPelanggaran = z
  .object({
    kategoriId: z.string().min(1, "Pilih kategori laporan."),
    judul: teks(10, 120, "Judul"),
    kronologi: teks(50, 5000, "Kronologi"),
    jenisWaktu: z.enum(JENIS_WAKTU, { error: "Pilih kapan kejadian terjadi (boleh “Tidak ingat”)." }),
    tanggal: z.string().optional(),
    bulan: z.string().optional(),
    tahun: z.string().optional(),
    lokasi: opsional(200, "Lokasi"),
    pihakTerlibat: opsional(1000, "Keterangan pihak terlibat"),
    melibatkanPengelola: z.boolean(),
    nama: opsional(150, "Nama"),
    email,
    izinPublikasi: pilihanIzin,
    pernyataan,
    situs: jebakan,
  })
  // `when: selaluObjek` — tanpa ini Zod 4 melewati refine selama field lain (mis. izin
  // publikasi di langkah 5) masih kosong, sehingga tanggal kosong lolos di langkah 2.
  .refine((v) => v.jenisWaktu !== "pasti" || (typeof v.tanggal === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.tanggal)), {
    path: ["tanggal"],
    message: "Isi tanggal kejadian, atau pilih opsi lain.",
    when: selaluObjek,
  })
  .refine((v) => v.jenisWaktu !== "bulan" || (Boolean(v.bulan) && Boolean(v.tahun)), {
    path: ["bulan"],
    message: "Pilih perkiraan bulan dan tahun.",
    when: selaluObjek,
  });
export type NilaiPelanggaran = z.infer<typeof SkemaPelanggaran>;

// ---------------------------------------------------------------- aspirasi

export const SkemaAspirasi = z.object({
  kategoriId: z.string().min(1, "Pilih kategori aspirasi."),
  judul: teks(10, 120, "Judul"),
  kondisi: teks(30, 3000, "Uraian kondisi atau kebutuhan"),
  usulan: opsional(1500, "Usulan"),
  manfaat: opsional(1000, "Manfaat"),
  nama: opsional(150, "Nama"),
  email,
  izinPublikasi: pilihanIzin,
  pernyataan,
  situs: jebakan,
});
export type NilaiAspirasi = z.infer<typeof SkemaAspirasi>;

// ---------------------------------------------------------------- langkah

/** Field yang divalidasi saat menekan “Lanjut” di setiap langkah (indeks 0–4). */
export const FIELD_LANGKAH: Record<JenisPengajuan, string[][]> = {
  pelanggaran: [
    ["kategoriId", "judul"],
    ["kronologi", "jenisWaktu", "tanggal", "bulan", "lokasi", "pihakTerlibat"],
    [],
    ["nama", "email"],
    ["izinPublikasi", "pernyataan"],
  ],
  aspirasi: [
    ["kategoriId", "judul"],
    ["kondisi"],
    ["usulan", "manfaat"],
    ["nama", "email"],
    ["izinPublikasi", "pernyataan"],
  ],
};

export const JUDUL_LANGKAH: Record<JenisPengajuan, string[]> = {
  pelanggaran: ["Kategori & judul", "Kronologi", "Bukti", "Kontak", "Tinjau & kirim"],
  aspirasi: ["Kategori & judul", "Kondisi atau kebutuhan", "Usulan perbaikan", "Lampiran & kontak", "Tinjau & kirim"],
};

// ---------------------------------------------------------------- server action

export const SkemaKirimTiruan = z.discriminatedUnion("jenis", [
  z.object({
    jenis: z.literal("pelanggaran"),
    nilai: SkemaPelanggaran,
    jumlahLampiran: z.number().int().min(0).max(ATURAN_LAMPIRAN.pelanggaran.maksFile),
    idempotensi: z.uuid(),
  }),
  z.object({
    jenis: z.literal("aspirasi"),
    nilai: SkemaAspirasi,
    jumlahLampiran: z.number().int().min(0).max(ATURAN_LAMPIRAN.aspirasi.maksFile),
    idempotensi: z.uuid(),
  }),
]);
export type MasukanKirimTiruan = z.infer<typeof SkemaKirimTiruan>;

export type HasilKirim =
  | { ok: true; nomorReferensi: string; kodeAkses: string; tiruan: true }
  | { ok: false; jenisGalat: "validasi" | "server" | "batas"; pesan: string };
