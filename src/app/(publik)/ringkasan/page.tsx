import type { Metadata } from "next";
import { Suspense } from "react";
import { KerangkaDaftar } from "@/features/konten/HalamanDaftar";
import { IsiDaftar } from "@/features/konten/IsiDaftar";

// Ringkasan pelanggaran tidak diindeks mesin pencari (dok. 03 §11).
export const metadata: Metadata = {
  title: "Ringkasan Pelanggaran",
  description: "Ringkasan tersamar dari laporan yang diizinkan pengirimnya untuk dipublikasikan.",
  robots: { index: false, follow: false },
};

export default function Halaman({ searchParams }: PageProps<"/ringkasan">) {
  return (
    <Suspense fallback={<KerangkaDaftar />}>
      <IsiDaftar searchParams={searchParams} jenis="WB" />
    </Suspense>
  );
}
