import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Varian = "wb" | "asp" | "garis";

// Pasangan warna & kontras: dok. 06 §3.2 dan §4.2. Tidak ada tombol berwarna merah.
const gayaVarian: Record<Varian, string> = {
  wb: "border-ivory-100 bg-ivory-100 text-navy-900 hover:bg-ivory-50 hover:border-ivory-50 focus-visible:outline-gold-500",
  asp: "border-gold-500 bg-gold-500 text-navy-900 hover:bg-gold-hover hover:border-gold-hover focus-visible:outline-ivory-100",
  garis: "border-ivory-200 bg-transparent text-ivory-100 hover:bg-ivory-100/12 focus-visible:outline-gold-500",
};

type Props = {
  href: string;
  label: string;
  ikon: LucideIcon;
  varian: Varian;
  keterangan?: string;
  className?: string;
};

/** Tombol pil bergaya referensi Astro: tautan nyata, tetap berfungsi tanpa JS. */
export function TombolLayanan({ href, label, ikon: Ikon, varian, keterangan, className }: Props) {
  const idKet = keterangan ? `ket-${href.replace(/\W+/g, "-")}` : undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Link
        href={href}
        aria-describedby={idKet}
        className={cn(
          "group/tombol font-display inline-flex min-h-14 items-center justify-center gap-2.5 rounded-full border-2 px-6 text-[0.8125rem] font-extrabold tracking-[0.04em] uppercase transition-[background-color,border-color,transform] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 active:scale-[.97]",
          gayaVarian[varian],
        )}
      >
        <Ikon className="size-[1.125rem] shrink-0" aria-hidden="true" />
        <span>{label}</span>
        {varian !== "garis" && (
          <ArrowRight
            className="size-4 shrink-0 transition-transform duration-200 group-hover/tombol:translate-x-[3px]"
            aria-hidden="true"
          />
        )}
      </Link>
      {keterangan && (
        <p id={idKet} className="text-center text-sm text-ivory-200">
          {keterangan}
        </p>
      )}
    </div>
  );
}
