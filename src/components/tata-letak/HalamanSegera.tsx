import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NAMA_PRODUK } from "@/lib/konstanta";

/**
 * Halaman sementara untuk rute yang belum dibangun. Memakai varian terang (ivory)
 * dari dok. 06 agar tautan di beranda tidak berakhir di 404.
 */
export function HalamanSegera({ judul, keterangan }: { judul: string; keterangan: string }) {
  return (
    <main id="konten" className="mx-auto flex w-full max-w-[672px] flex-1 flex-col justify-center gap-6 px-4 py-16">
      <p className="font-display text-sm font-extrabold tracking-[0.04em] text-gold-800 uppercase">{NAMA_PRODUK}</p>
      <h1 className="font-display text-3xl leading-tight font-extrabold text-navy-900">{judul}</h1>
      <p className="text-base leading-relaxed text-navy-ink-muted">{keterangan}</p>
      <p className="rounded-lg border border-ivory-200 bg-card p-4 text-sm text-navy-900">
        Halaman ini sedang dibangun. Fitur pengiriman belum aktif, jadi belum ada data yang dikirim atau disimpan.
      </p>
      <Link
        href="/"
        className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-navy-900 px-5 py-2.5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-ivory-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke beranda
      </Link>
    </main>
  );
}
