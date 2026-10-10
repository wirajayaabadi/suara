import type { Metadata } from "next";
import { Suspense } from "react";
import { KerangkaDaftar } from "@/features/konten/HalamanDaftar";
import { IsiDaftar } from "@/features/konten/IsiDaftar";

export const metadata: Metadata = { title: "Aspirasi", description: "Aspirasi yang telah dipublikasikan beserta tanggapan pengelola." };

export default function Halaman({ searchParams }: PageProps<"/aspirasi">) {
  return (
    <Suspense fallback={<KerangkaDaftar />}>
      <IsiDaftar searchParams={searchParams} jenis="ASP" />
    </Suspense>
  );
}
