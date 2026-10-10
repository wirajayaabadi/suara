import Link from "next/link";
import { LogoP3MD } from "@/features/beranda/LogoP3MD";
import { NAMA_PRODUK } from "@/lib/konstanta";

/** Layout form sebagai halaman penuh: header minimal tanpa tautan pengalih (dok. 02 §1). */
export default function LayoutFormulir({ children }: LayoutProps<"/">) {
  return (
    <>
      <header className="tema-malam flex items-center px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
          <LogoP3MD tinggi={48} segera />
          <span className="font-display text-base font-extrabold text-ivory-100">{NAMA_PRODUK}</span>
        </Link>
      </header>
      <main id="konten" className="flex flex-1 flex-col bg-ivory-50">
        {children}
      </main>
    </>
  );
}
