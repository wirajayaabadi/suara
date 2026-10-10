import { bubbleCss } from "./bubble/acak";
import { FIT_LEBAR, FIT_SEMPIT, ukuranFontCss } from "./bubble/ukuranWordmark";
import { warnaCssStatis } from "./bubble/warna";

/**
 * Wordmark statis (tanpa JS): confetti bubble sebagai latar CSS yang dipotong ke
 * bentuk huruf. Tampil sebelum canvas siap, saat canvas gagal, dan saat gerak dikurangi.
 *
 * Ukuran memakai konstanta yang sama dengan mesin canvas (`ukuranWordmark.ts`): lebar kata =
 * fit × lebar pita, dibatasi tinggi pita, baseline di 90% tinggi. Pita wordmark adalah size
 * container, jadi cqi/cqh mengacu ke pita itu sendiri.
 */
export function WordmarkStatis({ teks }: { teks: string }) {
  const latar = bubbleCss(102, warnaCssStatis(), 140, 40);
  return (
    <div
      aria-hidden="true"
      className="font-display pointer-events-none absolute inset-0 flex items-end overflow-hidden transition-opacity duration-200 select-none group-data-[kanvas=siap]/wm:opacity-0"
    >
      <span
        className="block pb-[6.5cqh] text-(length:--ukuran-sempit) leading-[0.8] font-extrabold whitespace-nowrap text-transparent @min-[760px]/hero:text-(length:--ukuran-lebar)"
        style={{
          ["--ukuran-sempit" as string]: ukuranFontCss(FIT_SEMPIT),
          ["--ukuran-lebar" as string]: ukuranFontCss(FIT_LEBAR),
          backgroundImage: latar.lapisan,
          backgroundColor: latar.dasar,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
        }}
      >
        {teks}
      </span>
    </div>
  );
}
