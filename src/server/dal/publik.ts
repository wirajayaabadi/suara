import "server-only";
import { pilihSumberData } from "@/lib/sumber-data";
import { cacheLife, cacheTag } from "next/cache";
import { agregasiPeta, itemBlok, type FilterPeta } from "@/features/peta/model/agregasi";
import { saringDaftar, type ParamDaftar } from "@/features/konten/model/daftar";
import {
  DaftarItemPeta,
  DaftarKonten,
  DatasetPeta,
  KontenPublik,
  type Jenis,
  type KategoriPublik,
} from "@/lib/schemas/publik";

/**
 * DAL publik (dok. 03 §8.3, dok. 05 §5.5). Satu-satunya pintu data untuk halaman dan
 * endpoint publik. Semua keluaran di-parse dengan skema `.strict()` sebelum dikembalikan.
 *
 * Sumber data dipilih oleh `pilihSumberData()` (lib/sumber-data.ts): data contoh selama basis
 * data belum dikonfigurasi, atau bila dipaksa `DATA_CONTOH=1`.
 */

export type { SumberData } from "@/lib/sumber-data";

export function sumberData() {
  return pilihSumberData();
}

async function konteks() {
  if (sumberData() !== "contoh") {
    throw new Error("Sumber data publik: basis data belum dibangun. Hapus DATA_CONTOH=0 atau DATABASE_URL_PUBLIC untuk memakai data contoh.");
  }
  // Impor dinamis: modul data contoh hanya dimuat saat benar-benar dipakai.
  const { dataContoh, SKENARIO, TANGGAL_ACUAN_CONTOH } = await import("@/server/data-contoh/konten-publik");
  const diminta = process.env.DATA_CONTOH_SKENARIO;
  const skenario = SKENARIO.find((s) => s === diminta) ?? "normal";
  const data = dataContoh(skenario);
  return {
    konten: data.konten,
    kategori: data.kategori,
    acuan: TANGGAL_ACUAN_CONTOH,
    dataContoh: true,
  };
}

/** Tag cache semua data publik; diinvalidasi saat publikasi/penarikan (dok. 03 §7.2). */
export const TAG_KONTEN_PUBLIK = "konten-publik";

export async function ambilKategoriPublik(): Promise<Record<Jenis, KategoriPublik[]>> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_KONTEN_PUBLIK);
  return (await konteks()).kategori;
}

export async function ambilDatasetPeta(filter: FilterPeta): Promise<DatasetPeta> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_KONTEN_PUBLIK);
  const ctx = await konteks();
  return DatasetPeta.parse(agregasiPeta(ctx, filter, `${ctx.acuan}T08:00:00+07:00`));
}

export async function ambilItemBlok(
  filter: FilterPeta,
  blok: { jenis: Jenis; kategoriId: string; periode: string },
  halaman = 1,
): Promise<DaftarItemPeta> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_KONTEN_PUBLIK);
  return DaftarItemPeta.parse(itemBlok(await konteks(), filter, blok, halaman));
}

export async function ambilKonten(kode: string): Promise<KontenPublik | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_KONTEN_PUBLIK);
  const k = (await konteks()).konten.find((x) => x.kode === kode);
  return k ? KontenPublik.parse(k) : null;
}

/** Daftar konten publik untuk `/aspirasi` dan `/ringkasan` (dok. 02 §4.2). */
export async function ambilDaftarKonten(jenis: Jenis, param: ParamDaftar): Promise<DaftarKonten> {
  "use cache";
  cacheLife("hours");
  cacheTag(TAG_KONTEN_PUBLIK);
  return DaftarKonten.parse(saringDaftar((await konteks()).konten, jenis, param));
}
