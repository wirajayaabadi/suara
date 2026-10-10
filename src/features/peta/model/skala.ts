/**
 * Skala tinggi balok (dok. 05 §3.4): linear, SAMA untuk kedua kelompok, dengan aturan
 * nilai ekstrem dan tinggi minimum. Fungsi murni.
 */
import type { Skala } from "@/lib/schemas/publik";

/** Tinggi minimum (relatif H_MAKS) untuk jumlah ≥ 1 agar tetap terlihat. */
export const TINGGI_MINIMUM = 0.06;

/** Angka bulat terkecil dari deret 1, 2, 5, 10, 20, 50, … yang ≥ n. */
export function angkaBulat(n: number): number {
  if (n <= 1) return 1;
  let dasar = 1;
  for (;;) {
    for (const k of [1, 2, 5]) if (k * dasar >= n) return k * dasar;
    dasar *= 10;
  }
}

/**
 * Menghitung batas skala dari seluruh jumlah blok (kedua kelompok sekaligus).
 * Ekstrem: bila maks > 2,5 × tertinggi kedua dan maks ≥ 10, batas mengikuti
 * tertinggi kedua × 1,5 dan balok di atasnya ditandai terpotong (bukan disembunyikan).
 * `skalaPenuh` mematikan aturan ekstrem (proporsi murni).
 */
export function hitungSkala(jumlah: number[], skalaPenuh = false): Skala {
  const urut = jumlah.filter((n) => n > 0).sort((a, b) => b - a);
  const maks = urut[0] ?? 0;
  const kedua = urut[1] ?? 0;
  const ekstrem = !skalaPenuh && kedua > 0 && maks >= 10 && maks > 2.5 * kedua;
  if (ekstrem) {
    return { maks, batasSkala: angkaBulat(Math.ceil(kedua * 1.5)), terpotong: true };
  }
  return { maks, batasSkala: angkaBulat(maks), terpotong: false };
}

/** Tinggi relatif 0–1 sebuah blok. 0 → ubin datar; di atas batas → 1 (terpotong). */
export function tinggiRelatif(jumlah: number, skala: Skala): number {
  if (jumlah <= 0) return 0;
  return Math.max(TINGGI_MINIMUM, Math.min(1, jumlah / skala.batasSkala));
}

export const melebihiSkala = (jumlah: number, skala: Skala) => jumlah > skala.batasSkala;
