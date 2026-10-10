import type { Metadata } from "next";
import { FormHalaman } from "@/features/formulir/FormHalaman";
import { ambilKategoriPublik } from "@/server/dal/publik";

export const metadata: Metadata = { title: "Laporkan Pelanggaran", robots: { index: false } };

export default async function HalamanKirim() {
  const kategori = await ambilKategoriPublik();
  return <FormHalaman jenis="pelanggaran" kategori={kategori.WB} />;
}
