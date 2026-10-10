/** Tingkat kualitas animasi hero (dok. 05 §2.5). */
export type Tier = "tinggi" | "sedang" | "rendah";

export type ProfilTier = {
  maksBubble: number;
  dprMaks: number;
  /** 0 = tanpa batas (ikut refresh rate layar). */
  fpsMaks: number;
  dorongan: boolean;
};

export const PROFIL: Record<Tier, ProfilTier> = {
  tinggi: { maksBubble: 900, dprMaks: 2, fpsMaks: 0, dorongan: true },
  sedang: { maksBubble: 350, dprMaks: 1.5, fpsMaks: 0, dorongan: true },
  rendah: { maksBubble: 180, dprMaks: 1, fpsMaks: 30, dorongan: false },
};

type NavigatorDenganPetunjuk = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Tebakan awal dari sinyal perangkat. Diturunkan lagi saat berjalan bila lambat. */
export function deteksiTier(lebarKontainer: number): Tier {
  const nav = navigator as NavigatorDenganPetunjuk;
  const lemah =
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 4) ||
    nav.connection?.saveData === true;
  if (lemah) return "rendah";
  return lebarKontainer < 760 ? "sedang" : "tinggi";
}

export function tierLebihRendah(t: Tier): Tier {
  return t === "tinggi" ? "sedang" : "rendah";
}
