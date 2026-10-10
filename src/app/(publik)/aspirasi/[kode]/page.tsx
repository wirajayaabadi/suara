import type { Metadata } from "next";
import { Suspense } from "react";
import { IsiKonten, KerangkaKonten, ambilKontenJenis } from "@/features/konten/HalamanKonten";

export async function generateMetadata({ params }: PageProps<"/aspirasi/[kode]">): Promise<Metadata> {
  const k = await ambilKontenJenis((await params).kode, "ASP");
  return { title: k ? k.judul : "Konten tidak tersedia" };
}

/** Detail aspirasi yang dipublikasikan (dok. 02 §4.2). */
export default function Halaman({ params }: PageProps<"/aspirasi/[kode]">) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<KerangkaKonten />}>
        <IsiKonten params={params} jenis="ASP" />
      </Suspense>
    </div>
  );
}
