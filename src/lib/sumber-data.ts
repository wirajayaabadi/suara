/**
 * Pemilihan sumber data (dok. 07 §2 K3). Fungsi murni tanpa impor lain agar bisa dipakai
 * server dan `next.config.ts`.
 *
 * - `DATA_CONTOH=1` → data contoh sintetis (paksa).
 * - `DATA_CONTOH=0` → basis data (paksa; gagal bila belum dikonfigurasi).
 * - Tanpa `DATA_CONTOH`: basis data bila `DATABASE_URL_PUBLIC` ada, selain itu data contoh.
 *   Selama backend belum dibangun, `npm run build` dan `npm start` otomatis memakai data
 *   contoh; begitu basis data dikonfigurasi, aplikasi beralih tanpa perlu mengubah skrip.
 */
export type SumberData = "contoh" | "basis-data";

export function pilihSumberData(env: Record<string, string | undefined> = process.env): SumberData {
  if (env.DATA_CONTOH === "1") return "contoh";
  if (env.DATA_CONTOH === "0") return "basis-data";
  return env.DATABASE_URL_PUBLIC ? "basis-data" : "contoh";
}
