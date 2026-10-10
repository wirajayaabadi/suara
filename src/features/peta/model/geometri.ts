/**
 * Geometri Peta Suara (dok. 05 §3.5). Fungsi murni tanpa React/DOM sehingga dapat diuji unit.
 *
 * Proyeksi ortografik diadaptasi dari `geometry()` Focus City (rumus umum, ditulis ulang):
 *   proyeksi(x, y, z) = [x·cos θ − y·sin θ, (x·sin θ + y·cos θ)·k − z]
 * Dunia: sel berukuran 1, kolom = periode (sumbu x), baris = kategori (sumbu y).
 * Kelompok Whistleblowing di x ∈ [0, K), jalan 2,5 sel, lalu Aspirasi.
 */
import type { DatasetPeta, Jenis, StatusPublik } from "@/lib/schemas/publik";
import { labelPeriode } from "./periode";
import { tinggiRelatif } from "./skala";
import { kunciBlok, type Fokus } from "./url";

export const KEMIRINGAN = 0.46;
export const YAW_MIN = 0.24;
export const YAW_MAKS = 0.81;
export const YAW_AWAL = Math.PI / 6;
/** Δθ = Δx / 540 radian per piksel (nilai referensi). */
export const PIKSEL_PER_RADIAN = 540;
export const AMBANG_DRAG = 5;
export const LANGKAH_SUDUT = (8 * Math.PI) / 180;
export const TAPAK = 0.79;
export const JALAN = 2.5;
export const H_MAKS = 3.2;
/** Balok terpilih naik 4% (dok. 06 §4.5). */
export const NAIK_TERPILIH = 0.04;

export type Titik = readonly [number, number];
export type Kotak = { x: number; y: number; w: number; h: number };

export const jepitYaw = (yaw: number) => Math.min(YAW_MAKS, Math.max(YAW_MIN, yaw));

export function proyeksi(x: number, y: number, z: number, yaw: number): Titik {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return [x * c - y * s, (x * s + y * c) * KEMIRINGAN - z];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpTitik = (a: Titik, b: Titik, t: number): Titik => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
export const lerpKotak = (a: Kotak, b: Kotak, t: number): Kotak => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
});

// ---------------------------------------------------------------- tata letak

export type Slot = {
  /** `WB~kategori~periode`, sama dengan nilai `blok=` di URL. */
  id: string;
  jenis: Jenis;
  kategoriId: string;
  kategoriLabel: string;
  periode: string;
  periodeLabel: string;
  baris: number;
  kolom: number;
  /** Sudut belakang-kiri tapak di koordinat dunia. */
  x0: number;
  y0: number;
  jumlah: number;
  status: Partial<Record<StatusPublik, number>>;
};

export type KelompokTata = {
  jenis: Jenis;
  label: string;
  asalX: number;
  baris: number;
  kategori: { id: string; label: string }[];
};

export type TataLetak = {
  kolom: number;
  periode: { kunci: string; label: string }[];
  kelompok: KelompokTata[];
  slot: Slot[];
};

/**
 * Posisi slot = (urutan kategori, indeks periode). Tidak bergantung pada filter, sehingga
 * filter hanya meratakan balok dan tidak pernah menggeser slot (AC-P10).
 */
export function tataLetak(d: DatasetPeta): TataLetak {
  const K = Math.max(1, d.periode.kolom.length);
  const jumlah = new Map(d.blok.map((b) => [kunciBlok(b), b]));
  const sisi = (1 - TAPAK) / 2;
  const slot: Slot[] = [];
  const kelompok = d.kelompok.map((g, gi) => {
    const asalX = gi * (K + JALAN);
    g.kategori.forEach((k, r) => {
      d.periode.kolom.forEach((p, c) => {
        const kunci = { jenis: g.jenis, kategoriId: k.id, periode: p.kunci };
        const id = kunciBlok(kunci);
        const b = jumlah.get(id);
        slot.push({
          id,
          ...kunci,
          kategoriLabel: k.label,
          periodeLabel: p.label,
          baris: r,
          kolom: c,
          x0: asalX + c + sisi,
          y0: r + sisi,
          jumlah: b?.jumlah ?? 0,
          status: b?.status ?? {},
        });
      });
    });
    return {
      jenis: g.jenis,
      label: g.label,
      asalX,
      baris: g.kategori.length,
      kategori: g.kategori.map((k) => ({ id: k.id, label: k.label })),
    };
  });
  return { kolom: K, periode: d.periode.kolom, kelompok, slot };
}

/** Tinggi relatif target tiap slot (0 = ubin datar). */
export function tinggiTarget(tl: TataLetak, d: DatasetPeta): number[] {
  return tl.slot.map((s) => tinggiRelatif(s.jumlah, d.skala));
}

// ---------------------------------------------------------------- bentuk balok

export type Bentuk = {
  atap: Titik[];
  /** Sisi +y (tampak kiri-bawah di layar). */
  kiri: Titik[];
  /** Sisi +x (tampak kanan-bawah di layar). */
  kanan: Titik[];
  pusatAtap: Titik;
  kedalaman: number;
};

/** Urutan painter: menaik = digambar lebih dulu (lebih jauh dari pengamat). */
export const kedalaman = (xPusat: number, yPusat: number, yaw: number) =>
  xPusat * Math.sin(yaw) + yPusat * Math.cos(yaw);

/**
 * Bentuk satu slot pada sudut `yaw`, morph `t` (0 = isometrik, 1 = datar 2D), dan tinggi
 * relatif `h`. Pada t = 1 atap menjadi sel kisi dan kedua sisi menyusut ke nol (pola morph
 * referensi: titik atap dan dasar disatukan ke sel datar).
 */
export function bentukSlot(s: Slot, yaw: number, t: number, h: number): Bentuk {
  const x1 = s.x0 + TAPAK;
  const y1 = s.y0 + TAPAK;
  const z = h * H_MAKS;
  const iso = (x: number, y: number, zz: number) => proyeksi(x, y, zz, yaw);
  const m = (x: number, y: number, zz: number): Titik => (t === 0 ? iso(x, y, zz) : lerpTitik(iso(x, y, zz), [x, y], t));
  const atap = [m(s.x0, s.y0, z), m(x1, s.y0, z), m(x1, y1, z), m(s.x0, y1, z)];
  const kiri = [m(s.x0, y1, 0), m(x1, y1, 0), atap[2], atap[3]];
  const kanan = [m(x1, s.y0, 0), m(x1, y1, 0), atap[2], atap[1]];
  const pusatAtap = m(s.x0 + TAPAK / 2, s.y0 + TAPAK / 2, z);
  return { atap, kiri, kanan, pusatAtap, kedalaman: kedalaman(s.x0 + TAPAK / 2, s.y0 + TAPAK / 2, yaw) };
}

export const keTitikSvg = (p: readonly Titik[]) => p.map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`).join(" ");

/** Bidang dasar satu kelompok (sedikit lebih lebar dari kisi). */
export function bidangDasar(g: KelompokTata, kolom: number, yaw: number, t: number): Titik[] {
  const tepi = 0.3;
  const x0 = g.asalX - tepi;
  const x1 = g.asalX + kolom + tepi;
  const y0 = -tepi;
  const y1 = g.baris + tepi;
  const m = (x: number, y: number): Titik => lerpTitik(proyeksi(x, y, 0, yaw), [x, y], t);
  return [m(x0, y0), m(x1, y0), m(x1, y1), m(x0, y1)];
}

// ---------------------------------------------------------------- batas & viewBox

const kelompokTerlihat = (tl: TataLetak, fokus: Fokus) =>
  tl.kelompok.filter((g) => fokus === "semua" || g.jenis === fokus);

function kotakDari(titik: Titik[], pad: number): Kotak {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of titik) {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }
  return { x: minX - pad, y: minY - pad, w: maxX - minX + 2 * pad, h: maxY - minY + 2 * pad };
}

/** Posisi label tanah kelompok (dunia, z = 0) — di depan kisi. */
export const posisiLabelKelompok = (g: KelompokTata, kolom: number) => [g.asalX + kolom / 2, g.baris + 2.1] as const;
/** Posisi label periode kolom `c` di tepi depan kisi (dunia, z = 0). */
export const posisiLabelPeriode = (g: KelompokTata, c: number) => [g.asalX + c + 0.5, g.baris + 0.75] as const;

/**
 * viewBox isometrik: dihitung SEKALI per tata letak dari batas tapak pada seluruh rentang
 * sudut + H_MAKS, sehingga memutar tidak mengubah ukuran peta (dok. 05 §3.4, AC-P3).
 */
export function batasIso(tl: TataLetak, fokus: Fokus): Kotak {
  const titik: Titik[] = [];
  const atas = H_MAKS * (1 + NAIK_TERPILIH) + 0.6; // ruang label angka ekstrem
  const SAMPEL = 16;
  for (const g of kelompokTerlihat(tl, fokus)) {
    const xs = [g.asalX - 0.3, g.asalX + tl.kolom + 0.3];
    const ys = [-0.3, g.baris + 0.3];
    const [lx, ly] = posisiLabelKelompok(g, tl.kolom);
    const [px0, py] = posisiLabelPeriode(g, 0);
    const [px1] = posisiLabelPeriode(g, tl.kolom - 1);
    for (let i = 0; i <= SAMPEL; i++) {
      const yaw = YAW_MIN + ((YAW_MAKS - YAW_MIN) * i) / SAMPEL;
      for (const x of xs) for (const y of ys) titik.push(proyeksi(x, y, 0, yaw), proyeksi(x, y, atas, yaw));
      // Label kelompok dan periode berada di depan kisi; sisakan ruang ± setengah lebar teks.
      for (const dx of [-1.6, 1.6]) titik.push(proyeksi(lx + dx, ly + 0.4, 0, yaw));
      titik.push(proyeksi(px0 - 0.6, py, 0, yaw), proyeksi(px1 + 0.6, py, 0, yaw));
    }
  }
  return kotakDari(titik, 0.35);
}

/** Lebar teks perkiraan (em) untuk menyisakan ruang label tanpa mengukur DOM. */
export const lebarTeksEm = (teks: string) => teks.length * 0.56;

/** Ukuran huruf label 2D dalam piksel layar. */
export const PX_LABEL_DATAR = 12;

/**
 * viewBox 2D: kisi datar + ruang label kategori (kiri untuk Whistleblowing, kanan untuk
 * Aspirasi) dan label periode di atas. Ruang label bergantung pada skala piksel, jadi
 * dihitung dengan beberapa iterasi titik tetap dari ukuran wadah.
 */
export function batasDatar(
  tl: TataLetak,
  fokus: Fokus,
  wadah: { w: number; h: number },
  maksHuruf: number,
): { kotak: Kotak; pxPerUnit: number } {
  const g = kelompokTerlihat(tl, fokus);
  const kiri = Math.min(...g.map((k) => k.asalX));
  const kanan = Math.max(...g.map((k) => k.asalX + tl.kolom));
  const bawah = Math.max(...g.map((k) => k.baris));
  const adaWB = g.some((k) => k.jenis === "WB");
  const adaASP = g.some((k) => k.jenis === "ASP");
  let px = 32;
  let kotak: Kotak = { x: 0, y: 0, w: 1, h: 1 };
  for (let i = 0; i < 4; i++) {
    const em = PX_LABEL_DATAR / px;
    const ruang = maksHuruf * 0.56 * em + 0.4;
    const x0 = kiri - (adaWB ? ruang : 0.4);
    const x1 = kanan + (adaASP ? ruang : 0.4);
    const y0 = -(em * 1.8 + 0.3);
    const y1 = bawah + 1.9;
    kotak = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    px = Math.min(wadah.w / kotak.w, wadah.h / kotak.h);
  }
  return { kotak, pxPerUnit: px };
}

/** Piksel layar per unit viewBox untuk `preserveAspectRatio="xMidYMid meet"`. */
export function pemetaanLayar(vb: Kotak, wadah: { w: number; h: number }) {
  const p = Math.min(wadah.w / vb.w, wadah.h / vb.h);
  return {
    p,
    keLayar: ([x, y]: Titik): Titik => [(wadah.w - vb.w * p) / 2 + (x - vb.x) * p, (wadah.h - vb.h * p) / 2 + (y - vb.y) * p],
  };
}

/**
 * Label periode pendek untuk sumbu: “Okt ’25”, “TW IV ’25”, “2025”. Bila semua kolom
 * berada di tahun yang sama, tahun dihilangkan (“TW IV”) karena sudah tertulis di judul rentang.
 */
export function labelPeriodePendek(kunci: string, denganTahun = true): string {
  const panjang = labelPeriode(kunci);
  const m = panjang.match(/^(.*) (\d{2})(\d{2})$/);
  if (!m) return panjang;
  const nama = m[1].replace("Trw", "TW");
  return denganTahun ? `${nama} ’${m[3]}` : nama;
}

/** Apakah kolom periode mencakup lebih dari satu tahun. */
export const lintasTahun = (periode: { kunci: string }[]) => new Set(periode.map((p) => p.kunci.slice(0, 4))).size > 1;

/**
 * Memilih label yang tidak bertabrakan (rakus, urutan prioritas). `pos` dalam piksel,
 * `lebar` dalam piksel. Mengembalikan indeks yang ditampilkan.
 */
export function pilihLabelTanpaTabrakan(kandidat: { pos: Titik; lebar: number; tinggi: number }[]): number[] {
  const dipakai: { x0: number; x1: number; y0: number; y1: number }[] = [];
  const hasil: number[] = [];
  kandidat.forEach((k, i) => {
    const r = { x0: k.pos[0] - k.lebar / 2 - 4, x1: k.pos[0] + k.lebar / 2 + 4, y0: k.pos[1] - k.tinggi, y1: k.pos[1] };
    if (dipakai.some((d) => r.x0 < d.x1 && r.x1 > d.x0 && r.y0 < d.y1 && r.y1 > d.y0)) return;
    dipakai.push(r);
    hasil.push(i);
  });
  return hasil;
}

// ---------------------------------------------------------------- navigasi

/** Urutan navigasi blok: per kelompok, per baris, lalu per kolom (dok. 05 §3.6). */
export function urutanNavigasi(tl: TataLetak): Slot[] {
  const urutJenis = new Map(tl.kelompok.map((g, i) => [g.jenis, i]));
  return [...tl.slot].sort(
    (a, b) => urutJenis.get(a.jenis)! - urutJenis.get(b.jenis)! || a.baris - b.baris || a.kolom - b.kolom,
  );
}

/** Tetangga untuk roving focus dengan tombol panah, dibatasi di dalam kelompok. */
export function tetangga(tl: TataLetak, s: Slot, dBaris: number, dKolom: number): Slot | undefined {
  const g = tl.kelompok.find((k) => k.jenis === s.jenis)!;
  const baris = Math.min(g.baris - 1, Math.max(0, s.baris + dBaris));
  const kolom = Math.min(tl.kolom - 1, Math.max(0, s.kolom + dKolom));
  return tl.slot.find((x) => x.jenis === s.jenis && x.baris === baris && x.kolom === kolom);
}
