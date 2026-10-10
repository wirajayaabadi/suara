"use client";

import * as React from "react";
import { useAnimasi } from "@/lib/animasi/AnimasiProvider";
import { deteksiTier } from "./kemampuanPerangkat";
import { buatMesinBubble, type Mesin } from "./mesin";
import { warnaDariToken } from "./warna";
import { BASELINE_REL, FIT_LEBAR, FIT_SEMPIT } from "./ukuranWordmark";

type Props = {
  teks: string;
  seed?: number;
};

/**
 * Wordmark berisi bubble (Canvas 2D). Dekoratif: `aria-hidden`.
 * Saat frame pertama siap, elemen host diberi `data-kanvas="siap"` sehingga wordmark
 * statis disembunyikan. Jika canvas gagal, wordmark statis tetap tampil.
 */
export default function BubbleCanvas({ teks, seed = 102 }: Props) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const mesin = React.useRef<Mesin | null>(null);
  const { diam, gerakDikurangi } = useAnimasi();
  const [siap, setSiap] = React.useState(false);

  React.useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.closest<HTMLElement>("[data-bubble-host]");
    if (!canvas || !host) return;
    const lebar = host.clientWidth;
    const lebarPenuh = lebar >= 760;
    try {
      mesin.current = buatMesinBubble({
        canvas,
        host,
        teks,
        seed,
        warna: warnaDariToken(),
        fit: lebarPenuh ? FIT_LEBAR : FIT_SEMPIT,
        // Titik awal teks di tepi kiri kanvas: sisi kiri huruf “S” memakai ruang bearing glyph
        // sebagai margin. Offset negatif (nilai referensi) memotong lengkung kiri “S”.
        xRel: 0,
        baselineRel: BASELINE_REL,
        density: 2,
        scale: 0.4,
        tier: deteksiTier(lebar),
        gerakDikurangi,
        pecah: lebarPenuh,
        onFramePertama: () => {
          host.dataset.kanvas = "siap";
          setSiap(true);
        },
      });
    } catch (galat) {
      // Wordmark statis tetap tampil; tidak ada pesan ke pengguna (dok. 05 §2.6).
      console.warn("Animasi wordmark tidak dapat dijalankan:", galat);
      return;
    }
    return () => {
      mesin.current?.hancurkan();
      mesin.current = null;
      delete host.dataset.kanvas;
    };
    // Mesin dibuat ulang hanya bila teks/seed atau preferensi gerak berubah.
  }, [teks, seed, gerakDikurangi]);

  React.useEffect(() => {
    mesin.current?.setJeda(diam);
  }, [diam]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="font-display absolute inset-0 h-full w-full transition-opacity duration-200"
      style={{ opacity: siap ? 1 : 0 }}
    />
  );
}
