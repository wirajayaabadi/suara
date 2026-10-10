/*
 * Diadaptasi dari "Astro Bubble Hero" (Astro Association) oleh Kedhareswer Naidu,
 * 21st.dev — lisensi MIT. https://21st.dev/@kedhareswer/components/astro-bubble-hero
 * Perubahan: batas jumlah bubble per perangkat, warna dari token P3MD, kode tak terpakai dibuang.
 */

export function clamp(v: number, a: number, b: number): number {
  return Math.min(b, Math.max(a, v));
}

/** PRNG deterministik: komposisi bubble sama di setiap kunjungan. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Bubble = {
  x: number;
  y: number;
  r: number;
  /** Indeks warna (≥ 1; indeks 0 adalah warna dasar huruf). */
  c: number;
  ph: number;
  amp: number;
  sp: number;
};

/**
 * Confetti lingkaran yang menutupi bidang w × h (sedikit melewati tepi agar tidak
 * terlihat terpotong). Ukuran condong kecil; bubble besar diurutkan lebih dulu agar
 * yang kecil tergambar di atasnya.
 *
 * `maks` membatasi jumlah bubble. Bila rumus asli menghasilkan lebih banyak, ukuran
 * dasar diperbesar sehingga cakupan bidang tetap penuh dengan bubble yang lebih sedikit.
 */
export function buildBubbles(
  seed: number,
  w: number,
  h: number,
  nColors: number,
  density = 1,
  scale = 1,
  maks = 1400,
): Bubble[] {
  const rnd = mulberry32(seed);
  let unit = Math.max(6, Math.min(w, h) * 0.12 * scale);
  let n = ((w * h) / (unit * unit * 1.25)) * density;
  if (n > maks) {
    unit *= Math.sqrt(n / maks);
    n = maks;
  }
  const total = Math.round(clamp(n, 12, maks));
  const out: Bubble[] = [];
  for (let i = 0; i < total; i++) {
    const r = unit * (0.22 + 1.3 * Math.pow(rnd(), 2.3));
    out.push({
      x: rnd() * (w + r) - r / 2,
      y: rnd() * (h + r) - r / 2,
      r,
      c: 1 + Math.floor(rnd() * Math.max(1, nColors - 1)),
      ph: rnd() * Math.PI * 2,
      amp: 1 + rnd() * 3.5,
      sp: 0.25 + rnd() * 0.6,
    });
  }
  return out.sort((a, b) => b.r - a.r);
}

/**
 * Confetti yang sama sebagai latar CSS (gradien radial bertepi tegas). Dipakai untuk
 * wordmark statis: tanpa JS, saat canvas gagal, atau saat gerak dikurangi.
 * `colors[0]` adalah warna dasar; boleh berupa `var(--token)`.
 *
 * Catatan: warna dasar dikembalikan terpisah. Warna polos tidak sah sebagai lapisan
 * `background-image` (referensi memakai shorthand `background`), sehingga harus dipasang
 * lewat `background-color`.
 */
export function bubbleCss(
  seed: number,
  colors: string[],
  n = 34,
  maxR = 46,
): { lapisan: string; dasar: string } {
  const rnd = mulberry32(seed);
  const layers: string[] = [];
  for (let i = 0; i < n; i++) {
    const r = Math.round(6 + (maxR - 6) * Math.pow(rnd(), 1.8));
    const x = Math.round(rnd() * 100);
    const y = Math.round(rnd() * 100);
    const c = colors[1 + Math.floor(rnd() * Math.max(1, colors.length - 1))] ?? colors[0];
    layers.push(`radial-gradient(circle at ${x}% ${y}%, ${c} 0 ${r}px, transparent ${r + 0.6}px)`);
  }
  return { lapisan: layers.reverse().join(", "), dasar: colors[0] };
}
