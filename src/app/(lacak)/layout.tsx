import type { Metadata } from "next";
import Link from "next/link";
import { LogoP3MD } from "@/features/beranda/LogoP3MD";
import { NAMA_PRODUK } from "@/lib/konstanta";

/** Pelacakan tidak boleh diindeks mesin pencari (dok. 03 §11). */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Layout pelacakan: header minimal, permukaan terang (dok. 02 §5.5). */
export default function LayoutLacak({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="tema-malam flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
        >
          <LogoP3MD tinggi={48} segera />
          <span className="font-display text-base font-extrabold text-ivory-100">{NAMA_PRODUK}</span>
        </Link>
        <Link
          href="/panduan"
          className="rounded-full px-3 py-2 text-sm font-medium text-ivory-100 hover:bg-ivory-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
        >
          Panduan
        </Link>
      </header>
      <main id="konten" className="flex flex-1 flex-col bg-ivory-50">
        {children}
      </main>
    </>
  );
}
