import { ambilDaftarKonten, ambilKategoriPublik, sumberData } from "@/server/dal/publik";
import type { Jenis } from "@/lib/schemas/publik";
import { HalamanDaftar } from "./HalamanDaftar";
import { bacaParamDaftar } from "./model/daftar";

/** Membaca `searchParams` (data runtime) lalu mengambil data lewat DAL publik yang di-cache. */
export async function IsiDaftar({ searchParams, jenis }: { searchParams: Promise<Record<string, string | string[] | undefined>>; jenis: Jenis }) {
  const param = bacaParamDaftar(await searchParams, jenis);
  const [data, kategori] = await Promise.all([ambilDaftarKonten(jenis, param), ambilKategoriPublik()]);
  return <HalamanDaftar jenis={jenis} param={param} data={data} kategori={kategori[jenis]} dataContoh={sumberData() === "contoh"} />;
}
