import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NAMA_PRODUK } from "@/lib/konstanta";

const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

/** Header gelap halaman publik dalam (Peta Suara, detail konten): navigasi + judul. */
export function HeaderPublik({ children, lebar = "max-w-[1440px]" }: { children?: React.ReactNode; lebar?: string }) {
  return (
    <header className="tema-malam">
      <div className={`mx-auto flex w-full ${lebar} flex-col gap-1 px-4 pt-3 pb-2 sm:px-6`}>
        <nav aria-label="Navigasi" className="flex items-center justify-between gap-3">
          <Link href="/" className={`inline-flex min-h-11 items-center gap-2 rounded-full pr-3 text-sm font-semibold text-ivory-100 hover:text-gold-300 ${fokus}`}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Beranda
            <span className="text-navy-300 max-sm:hidden" aria-hidden="true">
              ·
            </span>
            <span className="font-display font-extrabold whitespace-nowrap max-sm:sr-only">{NAMA_PRODUK}</span>
          </Link>
          <ul className="flex items-center gap-1 text-sm whitespace-nowrap">
            <li className="max-sm:hidden">
              <Link href="/aspirasi" className={`rounded-full px-3 py-2 text-ivory-100 hover:bg-ivory-100/10 ${fokus}`}>
                Aspirasi
              </Link>
            </li>
            <li className="max-sm:hidden">
              <Link href="/ringkasan" className={`rounded-full px-3 py-2 text-ivory-100 hover:bg-ivory-100/10 ${fokus}`}>
                Ringkasan
              </Link>
            </li>
            <li>
              <Link href="/pemetaan" className={`rounded-full px-3 py-2 text-ivory-100 hover:bg-ivory-100/10 ${fokus}`}>
                Peta Suara
              </Link>
            </li>
            <li>
              <Link href="/lacak" className={`rounded-full px-3 py-2 text-ivory-100 hover:bg-ivory-100/10 ${fokus}`}>
                Lacak
              </Link>
            </li>
          </ul>
        </nav>
        {children}
      </div>
    </header>
  );
}
