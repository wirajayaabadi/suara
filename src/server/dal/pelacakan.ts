import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { ATURAN_LAMPIRAN } from "@/lib/schemas/kiriman";
import { KirimanPengirim, normalisasiKodeAkses, type PublikasiPengirim } from "@/lib/schemas/pelacakan";
import { sumberData } from "@/server/dal/publik";
import type { IsiSesi } from "@/server/pelacakan/sesi";

/*
 * DAL pelacakan (dok. 03 §8.3): SATU-SATUNYA pintu data privat untuk pengirim. Fungsi baca
 * hanya menerima isi sesi (bukan ID dari klien) dan mengembalikan DTO pengirim yang di-parse
 * `.strict()`. Catatan internal dan alasan internal tidak pernah dipetakan.
 *
 * Prototipe: data contoh dibaca dari `server/data-contoh/kiriman.ts`. Perubahan pengirim
 * (balasan, lampiran, tarik izin) disimpan di memori PER SESI, jadi penguji lain tidak
 * melihat perubahan Anda dan semuanya hilang saat keluar atau server dimulai ulang.
 */

async function dataContoh() {
  if (sumberData() !== "contoh") {
    throw new Error("Sumber data pelacakan: basis data belum dibangun. Hapus DATA_CONTOH=0 atau DATABASE_URL_PUBLIC untuk memakai data contoh.");
  }
  const [{ KIRIMAN_CONTOH }, { KATEGORI_WB, KATEGORI_ASP }] = await Promise.all([
    import("@/server/data-contoh/kiriman"),
    import("@/server/data-contoh/kategori"),
  ]);
  return { kiriman: KIRIMAN_CONTOH, kategori: [...KATEGORI_WB, ...KATEGORI_ASP] };
}

const PEPPER = () => process.env.TRACKING_PEPPER ?? "contoh-lokal";
const hmac = (kode: string) => createHmac("sha256", PEPPER()).update(normalisasiKodeAkses(kode)).digest();
/** Pembanding untuk nomor yang tidak ada, agar waktu respons tidak membocorkan keberadaannya. */
const HMAC_PALSU = () => hmac("0000-0000-0000-0000-0000-0000");

/**
 * Memverifikasi kredensial. Di produksi yang dibandingkan adalah HMAC tersimpan; di data
 * contoh HMAC dihitung dari kode contoh. Selalu satu perbandingan constant-time.
 */
export async function verifikasiKredensial(nomorReferensi: string, kodeAkses: string): Promise<boolean> {
  const { kiriman } = await dataContoh();
  const k = kiriman.find((x) => x.nomorReferensi === nomorReferensi);
  const tersimpan = k ? hmac(k.kodeAksesContoh) : HMAC_PALSU();
  const cocok = timingSafeEqual(tersimpan, hmac(kodeAkses));
  return Boolean(k) && cocok;
}

// ---------------------------------------------------------------- perubahan per sesi

type Perubahan = { pesan: { tanggal: string; isi: string }[]; lampiran: string[]; izinDitarik?: string };
const perubahan = new Map<string, Perubahan>();
const MAKS_SESI = 1000;

function perubahanUntuk(sid: string): Perubahan {
  let p = perubahan.get(sid);
  if (!p) {
    if (perubahan.size >= MAKS_SESI) perubahan.delete(perubahan.keys().next().value!);
    p = { pesan: [], lampiran: [] };
    perubahan.set(sid, p);
  }
  return p;
}

export function hapusPerubahanSesi(sid: string) {
  perubahan.delete(sid);
}

/** Tanggal WIB hari ini (YYYY-MM-DD). */
const hariIniWib = () => new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);

function publikasiPengirim(status: string, ditarik: boolean): PublikasiPengirim {
  if (ditarik || status === "DITARIK") return "DITARIK";
  if (status === "DIPUBLIKASIKAN") return "DIPUBLIKASIKAN";
  if (status === "MENUNGGU_PERSETUJUAN" || status === "PERLU_REVISI") return "DIKURASI";
  return "TIDAK";
}

// ---------------------------------------------------------------- baca

/** DTO pengirim untuk kiriman milik sesi. `null` bila kiriman tidak ada lagi. */
export async function ambilKirimanPengirim(sesi: IsiSesi): Promise<KirimanPengirim | null> {
  const { kiriman, kategori } = await dataContoh();
  const k = kiriman.find((x) => x.nomorReferensi === sesi.nomorReferensi);
  if (!k) return null;
  const ubah = perubahan.get(sesi.sid);
  const ditarik = Boolean(ubah?.izinDitarik);
  const lampiran = [...k.lampiran, ...(ubah?.lampiran ?? [])];
  const aturan = k.jenis === "WB" ? ATURAN_LAMPIRAN.pelanggaran : ATURAN_LAMPIRAN.aspirasi;
  const izin = k.izinPublikasi && !ditarik;
  const publikasi = publikasiPengirim(k.statusPublikasi, ditarik);

  return KirimanPengirim.parse({
    nomorReferensi: k.nomorReferensi,
    jenis: k.jenis,
    kategoriLabel: kategori.find((c) => c.id === k.kategoriId)?.label ?? "Lainnya",
    judul: k.judul,
    uraian: k.uraian,
    dibuat: k.dibuat,
    statusPenanganan: k.statusPenanganan,
    publikasi,
    izinPublikasi: izin,
    bisaTarikIzin: izin,
    lampiran,
    maksLampiran: k.statusPenanganan === "DITUTUP" ? 0 : Math.max(0, aturan.maksFile - lampiran.length),
    // Hanya kejadian yang ditandai terlihat pengirim; alasan internal tidak dipetakan.
    linimasa: [
      ...k.linimasa.filter((e) => e.terlihatPengirim).map((e) => ({ tanggal: e.tanggal, label: e.label })),
      ...(ubah?.izinDitarik ? [{ tanggal: ubah.izinDitarik, label: "Izin publikasi ditarik oleh pengirim" }] : []),
    ].sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    pesan: [
      ...k.pesan.map((m) => ({ arah: m.arah, tanggal: m.tanggal, isi: m.isi })),
      ...(ubah?.pesan ?? []).map((m) => ({ arah: "DARI_PENGIRIM" as const, ...m })),
    ],
    bisaDibalas: k.statusPenanganan !== "DITUTUP",
    dataContoh: true,
  });
}

// ---------------------------------------------------------------- aksi pengirim

export async function simpanBalasan(sesi: IsiSesi, isi: string): Promise<boolean> {
  const k = await ambilKirimanPengirim(sesi);
  if (!k?.bisaDibalas) return false;
  perubahanUntuk(sesi.sid).pesan.push({ tanggal: hariIniWib(), isi });
  return true;
}

export async function simpanLampiran(sesi: IsiSesi, ekstensi: string[]): Promise<number> {
  const k = await ambilKirimanPengirim(sesi);
  if (!k) return 0;
  const n = Math.min(ekstensi.length, k.maksLampiran);
  const p = perubahanUntuk(sesi.sid);
  // Nama generik: nama file asli tidak pernah dikirim atau disimpan.
  for (let i = 0; i < n; i++) p.lampiran.push(`lampiran-${k.lampiran.length + i + 1}${ekstensi[i].replace(".jpeg", ".jpg")}`);
  return n;
}

export async function tarikIzinPublikasi(sesi: IsiSesi): Promise<boolean> {
  const k = await ambilKirimanPengirim(sesi);
  if (!k?.bisaTarikIzin) return false;
  // Produksi: status publikasi → DITARIK, kunci publikasi, revalidateTag("konten-publik"),
  // dan notifikasi pengelola (dok. 01 §4.E). Prototipe hanya mencatat per sesi.
  perubahanUntuk(sesi.sid).izinDitarik = hariIniWib();
  return true;
}
