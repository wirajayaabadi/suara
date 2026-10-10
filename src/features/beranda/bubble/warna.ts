/**
 * Komposisi warna bubble wordmark (dok. 06 §4.1). Bobot dalam persen; total 100.
 * Indeks 0 dari daftar hasil adalah warna dasar huruf.
 */
export const TOKEN_DASAR_HURUF = "--navy-800";

export const BOBOT_BUBBLE: ReadonlyArray<readonly [token: string, bobot: number]> = [
  ["--gold-500", 25],
  ["--gold-300", 19],
  ["--ivory-100", 14],
  ["--navy-700", 12],
  ["--gold-400", 10],
  ["--navy-600", 8],
  ["--navy-750", 6],
  ["--maroon-700", 6],
];

/** Daftar token berbobot: [dasar, ...token diulang sesuai bobot]. */
export function daftarTokenBerbobot(skala = 1): string[] {
  const hasil = [TOKEN_DASAR_HURUF];
  for (const [token, bobot] of BOBOT_BUBBLE) {
    const ulang = Math.max(1, Math.round(bobot * skala));
    for (let i = 0; i < ulang; i++) hasil.push(token);
  }
  return hasil;
}

/** Untuk CSS (server): `var(--token)`. Skala kecil cukup untuk latar statis. */
export function warnaCssStatis(): string[] {
  return daftarTokenBerbobot(0.2).map((t) => `var(${t})`);
}

/** Untuk canvas (klien): nilai warna nyata dibaca dari token, sekali saat mount. */
export function warnaDariToken(el: Element = document.documentElement): string[] {
  const gaya = getComputedStyle(el);
  return daftarTokenBerbobot().map((t) => gaya.getPropertyValue(t).trim() || "transparent");
}
