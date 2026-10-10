import Link from "next/link";
import { Lightbulb, Map as IkonPeta, Shield } from "lucide-react";
import { BubbleCanvasLazy } from "./bubble/BubbleCanvasLazy";
import { HeaderBeranda } from "./HeaderBeranda";
import { LogoP3MD } from "./LogoP3MD";
import { OrbitRings } from "./OrbitRings";
import { TombolLayanan } from "./TombolLayanan";
import { WordmarkStatis } from "./WordmarkStatis";

const WORDMARK = "SUARA";

const tautanKaki = [
  { href: "/faq", label: "FAQ" },
  { href: "/kerahasiaan", label: "Kerahasiaan" },
  { href: "/kebijakan-privasi", label: "Privasi" },
  { href: "/kontak", label: "Kontak" },
];

/** Asterisk dekoratif dari referensi — ornamen saja, tidak interaktif. */
function Asterisk() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold-500)" strokeWidth="3.6" strokeLinecap="round" className="mt-1 shrink-0">
      <path d="M12 2.5v19M3.8 7.25l16.4 9.5M3.8 16.75l16.4-9.5" />
    </svg>
  );
}

/**
 * Beranda fullscreen (dok. 05 §2): adaptasi Astro Bubble Hero dengan identitas P3MD (dok. 06).
 * Seluruh teks, tombol, dan wordmark statis dirender di server; canvas dimuat setelahnya.
 */
export function HeroSection() {
  return (
      <div className="tema-malam @container/hero relative flex min-h-svh flex-1 flex-col overflow-hidden border-[6px] border-navy-800 @min-[760px]:border-[10px]">
        <OrbitRings />
        <HeaderBeranda />

        <main id="konten" className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-1 flex-col justify-center gap-6 px-4 pb-6 @min-[760px]:px-8">
          {/*
            Area pointer untuk bubble mencakup wordmark dan judul yang menimpanya.
            Di layar lebar keduanya ditumpuk dalam satu sel grid (bukan position:absolute),
            sehingga tinggi area mengikuti yang lebih tinggi dan tidak menimpa konten di bawahnya.
          */}
          <div data-bubble-host className="group/wm relative grid">
            <div
              aria-hidden="true"
              className="relative col-start-1 row-start-1 h-[clamp(120px,28svh,220px)] [container-type:size] [touch-action:pan-y] [@media(min-height:640px)]:h-[clamp(140px,30cqi,420px)]"
            >
              <WordmarkStatis teks={WORDMARK} />
              <BubbleCanvasLazy teks={WORDMARK} />
            </div>

            <div className="relative col-start-1 row-start-2 mt-4 @min-[760px]:row-start-1 @min-[760px]:mt-0 @min-[760px]:flex @min-[760px]:flex-col @min-[760px]:items-end @min-[760px]:gap-4 @min-[760px]:self-start @min-[760px]:justify-self-end @min-[760px]:pt-[2cqi] @min-[760px]:pr-[2%]">
              <LogoP3MD
                tinggi={160}
                segera
                className="hidden h-auto w-[clamp(96px,11cqi,136px)] @min-[760px]:[@media(min-height:640px)]:block"
              />
              <h1 className="font-display flex flex-col text-[clamp(2rem,9cqi,2.75rem)] leading-[0.95] font-extrabold tracking-[-0.01em] text-ivory-100 @min-[760px]:items-end @min-[760px]:text-[clamp(1.75rem,4.6cqi,3.75rem)]">
                <span className="w-fit bg-navy-900 px-[0.08em] [box-decoration-break:clone]">Suaramu</span>
                <span className="w-fit bg-navy-900 px-[0.08em] pb-[0.08em] [box-decoration-break:clone]">Membuka Perubahan.</span>
              </h1>
            </div>
          </div>

          <div className="flex max-w-[640px] gap-3">
            <Asterisk />
            <p className="text-base leading-relaxed text-ivory-100 @min-[760px]:text-lg">
              Sampaikan laporan dan aspirasi untuk lingkungan yang lebih baik.
            </p>
          </div>

          <div className="flex flex-col gap-4 @min-[760px]:max-w-[760px]">
            <div className="grid gap-4 @min-[760px]:grid-cols-2">
              <TombolLayanan
                href="/kirim/pelanggaran"
                label="Laporkan Pelanggaran"
                ikon={Shield}
                varian="wb"
                keterangan="Rahasia · ditinjau petugas"
              />
              <TombolLayanan
                href="/kirim/aspirasi"
                label="Sampaikan Aspirasi"
                ikon={Lightbulb}
                varian="asp"
                keterangan="Ide, saran, dan kritik"
              />
            </div>
            <TombolLayanan
              href="/pemetaan"
              label="Jelajahi Pemetaan"
              ikon={IkonPeta}
              varian="garis"
              className="w-full @min-[760px]:max-w-[360px] @min-[760px]:self-center"
            />
          </div>
        </main>

        <footer className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col gap-3 border-t border-ivory-100/25 px-4 py-4 text-xs @min-[760px]:flex-row @min-[760px]:items-center @min-[760px]:justify-between @min-[760px]:px-8">
          <p className="font-display font-extrabold tracking-[0.04em] text-ivory-200 uppercase">
            Tanpa akun · Ditinjau sebelum tampil · Bukan layanan darurat
          </p>
          <nav aria-label="Informasi">
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {tautanKaki.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="rounded text-ivory-100 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                  >
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </footer>
      </div>
  );
}
