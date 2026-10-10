import type { Metadata } from "next";
import { Suspense } from "react";
import { IsiKonten, KerangkaKonten, ambilKontenJenis } from "@/features/konten/HalamanKonten";

export async function generateMetadata({ params }: PageProps<"/ringkasan/[kode]">): Promise<Metadata> {
  const k = await ambilKontenJenis((await params).kode, "WB");
  // Ringkasan pelanggaran tidak diindeks mesin pencari (dok. 03 §11, rekomendasi).
  return { title: k ? k.judul : "Konten tidak tersedia", robots: { index: false, follow: false } };
}

/** Detail ringkasan pelanggaran tersamar + penafian (dok. 02 §5.6). */
export default function Halaman({ params }: PageProps<"/ringkasan/[kode]">) {
  return (
    <div className="flex min-h-svh flex-col">
      <Suspense fallback={<KerangkaKonten />}>
        <IsiKonten params={params} jenis="WB" />
      </Suspense>
    </div>
  );
}
