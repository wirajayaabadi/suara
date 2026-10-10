import Link from "next/link";
import { NAMA_PRODUK } from "@/lib/konstanta";
import { KontrolJeda } from "./KontrolJeda";
import { LogoP3MD } from "./LogoP3MD";

const tautan = [
  { href: "/pemetaan", label: "Peta Suara" },
  { href: "/lacak", label: "Lacak Kiriman" },
  { href: "/panduan", label: "Panduan" },
];

const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

export function HeaderBeranda() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-4 py-3 @min-[760px]:px-8">
      <Link href="/" className={`flex items-center gap-3 rounded-md ${fokus}`}>
        <LogoP3MD tinggi={48} segera />
        <span className="font-display text-base font-extrabold tracking-tight text-ivory-100">
          {NAMA_PRODUK}
        </span>
      </Link>
      <nav aria-label="Navigasi utama" className="flex items-center gap-1">
        <ul className="hidden items-center gap-1 @min-[760px]:flex">
          {tautan.map((t) => (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`rounded-full px-3 py-2 text-sm font-medium text-ivory-100 transition-colors hover:bg-ivory-100/10 ${fokus}`}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/lacak"
          className={`rounded-full px-3 py-2 text-sm font-medium text-ivory-100 hover:bg-ivory-100/10 @min-[760px]:hidden ${fokus}`}
        >
          Lacak
        </Link>
        <KontrolJeda />
      </nav>
    </header>
  );
}
