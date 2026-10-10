/**
 * Ukuran wordmark — SATU sumber untuk mesin canvas dan wordmark statis (CSS), agar keduanya
 * tampil sama besar dan tidak melompat saat canvas mengambil alih.
 */

/**
 * Lebar “SUARA” pada Poppins 800 dalam em (diukur: measureText 100px = 350,3px, sama dengan
 * DOM). Ubah nilai ini bila teks atau font wordmark berubah.
 */
export const LEBAR_KATA_EM = 3.503;

/** Lebar kata relatif lebar pita: layar lebar (≥ 760px) dan sempit. */
export const FIT_LEBAR = 0.9;
export const FIT_SEMPIT = 0.97;

/** Batas ukuran font relatif tinggi pita, dan posisi baseline relatif tinggi pita. */
export const BATAS_TINGGI = 1.1;
export const BASELINE_REL = 0.9;

/** Ukuran font CSS untuk wordmark statis (cqi/cqh mengacu ke pita = size container). */
export const ukuranFontCss = (fit: number) =>
  `min(${((fit / LEBAR_KATA_EM) * 100).toFixed(2)}cqi, ${BATAS_TINGGI * 100}cqh)`;
