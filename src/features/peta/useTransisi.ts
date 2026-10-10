"use client";

import * as React from "react";

const halus = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/**
 * Menganimasikan nilai menuju `target` dalam `durasi` ms (dok. 05 §3.4/§3.6). Tanpa
 * perubahan target, tidak ada frame yang dijadwalkan (AC-P14). `instan` (reduced motion)
 * atau `bisaDiinterpolasi(a, b) === false` (mis. jumlah slot berubah) langsung melompat.
 */
export function useTransisi<T>(
  target: T,
  durasi: number,
  instan: boolean,
  interpolasi: (a: T, b: T, p: number) => T,
  bisaDiinterpolasi: (a: T, b: T) => boolean = () => true,
): T {
  const [nilai, setNilai] = React.useState(target);
  const kini = React.useRef(target);
  const [targetLama, setTargetLama] = React.useState(target);
  const lompat = instan || !bisaDiinterpolasi(nilai, target);

  // Lompatan diterapkan saat render (pola “simpan prop sebelumnya”), tanpa frame tertunda.
  if (targetLama !== target && lompat) {
    setTargetLama(target);
    setNilai(target);
  }

  React.useEffect(() => {
    if (lompat) {
      kini.current = target;
      return;
    }
    const dari = kini.current;
    if (dari === target) return;
    const mulai = performance.now();
    let raf = requestAnimationFrame(function langkah(now) {
      const p = Math.min(1, (now - mulai) / durasi);
      const v = p >= 1 ? target : interpolasi(dari, target, halus(p));
      kini.current = v;
      setNilai(v);
      if (p < 1) raf = requestAnimationFrame(langkah);
    });
    return () => cancelAnimationFrame(raf);
    // `interpolasi` dan `bisaDiinterpolasi` dianggap stabil (fungsi modul).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durasi, lompat]);

  return lompat ? target : nilai;
}

export const interpolasiAngka = (a: number, b: number, p: number) => a + (b - a) * p;

export const interpolasiDeret = (a: number[], b: number[], p: number) => b.map((v, i) => a[i] + (v - a[i]) * p);

export const panjangSama = (a: number[], b: number[]) => a.length === b.length;
