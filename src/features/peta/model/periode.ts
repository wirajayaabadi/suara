/**
 * Periode untuk Peta Suara (dok. 05 §3.3). Fungsi murni: dipakai server (agregasi)
 * dan klien (label). Semua tanggal adalah tanggal kalender WIB dalam format YYYY-MM-DD.
 */
import type { Granularitas, KolomPeriode } from "@/lib/schemas/publik";

export const PRESET_PERIODE = ["tw-ini", "4tw", "12bln", "thn", "semua"] as const;
export type PresetPeriode = (typeof PRESET_PERIODE)[number];

export const LABEL_PRESET: Record<PresetPeriode, string> = {
  "tw-ini": "Triwulan ini",
  "4tw": "4 triwulan terakhir",
  "12bln": "12 bulan terakhir",
  thn: "Tahun berjalan",
  semua: "Semua waktu",
};

export type PilihanPeriode =
  | { preset: PresetPeriode }
  | { preset: "kustom"; dari: string /* YYYY-MM */; sampai: string /* YYYY-MM */ };

/** Batas kolom: tampilan isometrik ≤ 12, tampilan 2D dan Daftar ≤ 24. */
export const MAKS_KOLOM_ISOMETRIK = 12;
export const MAKS_KOLOM_DATAR = 24;

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const ROMAWI = ["I", "II", "III", "IV"];

type Bulan = { tahun: number; bulan: number }; // bulan 1–12

function keBulan(tanggal: string): Bulan {
  const [t, b] = tanggal.split("-").map(Number);
  return { tahun: t, bulan: b };
}
const indeksBulan = (b: Bulan) => b.tahun * 12 + (b.bulan - 1);
const dariIndeks = (i: number): Bulan => ({ tahun: Math.floor(i / 12), bulan: (i % 12) + 1 });
const triwulan = (bulan: number) => Math.floor((bulan - 1) / 3) + 1;

/** Kunci periode sebuah tanggal publikasi: 2026-10 · 2026-Q4 · 2026. */
export function kunciPeriode(tanggal: string, g: Granularitas): string {
  const { tahun, bulan } = keBulan(tanggal);
  if (g === "bulan") return `${tahun}-${String(bulan).padStart(2, "0")}`;
  if (g === "triwulan") return `${tahun}-Q${triwulan(bulan)}`;
  return String(tahun);
}

export function labelPeriode(kunci: string): string {
  const q = kunci.match(/^(\d{4})-Q([1-4])$/);
  if (q) return `Trw ${ROMAWI[Number(q[2]) - 1]} ${q[1]}`;
  const m = kunci.match(/^(\d{4})-(\d{2})$/);
  if (m) return `${BULAN[Number(m[2]) - 1]} ${m[1]}`;
  return kunci;
}

/** Granularitas otomatis untuk rentang khusus: ≤12 bln → bulan, ≤36 → triwulan, lainnya tahun. */
export function granularitasOtomatis(jumlahBulan: number): Granularitas {
  if (jumlahBulan <= 12) return "bulan";
  if (jumlahBulan <= 36) return "triwulan";
  return "tahun";
}

const lebihKasar = (g: Granularitas): Granularitas => (g === "bulan" ? "triwulan" : "tahun");

function kolomUntuk(awal: number, akhir: number, g: Granularitas): KolomPeriode[] {
  const kunci: string[] = [];
  for (let i = awal; i <= akhir; i++) {
    const { tahun, bulan } = dariIndeks(i);
    const k = kunciPeriode(`${tahun}-${String(bulan).padStart(2, "0")}-01`, g);
    if (kunci.at(-1) !== k) kunci.push(k);
  }
  return kunci.map((k) => ({ kunci: k, label: labelPeriode(k) }));
}

export type HasilPeriode = {
  granularitas: Granularitas;
  kolom: KolomPeriode[];
  /** Granularitas dinaikkan karena kolom melebihi batas. */
  dinaikkan: boolean;
  /** Rentang tanggal inklusif yang dicakup (YYYY-MM-DD). */
  dari: string;
  sampai: string;
};

/**
 * Menyusun kolom periode. `acuan` adalah “hari ini” (WIB); periode mendatang tidak
 * pernah ditampilkan. `tanggalTerawal` dipakai preset “semua”.
 */
export function bangunPeriode(
  pilihan: PilihanPeriode,
  acuan: string,
  opsi: { maksKolom?: number; tanggalTerawal?: string } = {},
): HasilPeriode {
  const maks = opsi.maksKolom ?? MAKS_KOLOM_DATAR;
  const kini = indeksBulan(keBulan(acuan));
  const { tahun, bulan } = keBulan(acuan);
  let awal: number;
  let akhir = kini;
  let g: Granularitas;

  switch (pilihan.preset) {
    case "tw-ini":
      awal = indeksBulan({ tahun, bulan: (triwulan(bulan) - 1) * 3 + 1 });
      g = "bulan";
      break;
    case "4tw":
      awal = indeksBulan({ tahun, bulan: (triwulan(bulan) - 1) * 3 + 1 }) - 9;
      g = "triwulan";
      break;
    case "12bln":
      awal = kini - 11;
      g = "bulan";
      break;
    case "thn":
      awal = indeksBulan({ tahun, bulan: 1 });
      g = "bulan";
      break;
    case "semua": {
      const terawal = opsi.tanggalTerawal ? keBulan(opsi.tanggalTerawal).tahun : tahun;
      awal = indeksBulan({ tahun: Math.min(terawal, tahun), bulan: 1 });
      g = "tahun";
      break;
    }
    case "kustom": {
      const a = indeksBulan(keBulan(`${pilihan.dari}-01`));
      const b = Math.min(indeksBulan(keBulan(`${pilihan.sampai}-01`)), kini);
      awal = Math.min(a, b);
      akhir = Math.max(a, b);
      g = granularitasOtomatis(akhir - awal + 1);
      break;
    }
  }

  let kolom = kolomUntuk(awal, akhir, g);
  let dinaikkan = false;
  while (kolom.length > maks && g !== "tahun") {
    g = lebihKasar(g);
    kolom = kolomUntuk(awal, akhir, g);
    dinaikkan = true;
  }

  const b0 = dariIndeks(awal);
  const b1 = dariIndeks(akhir);
  const hariAkhir = new Date(Date.UTC(b1.tahun, b1.bulan, 0)).getUTCDate();
  const sampaiBulan = `${b1.tahun}-${String(b1.bulan).padStart(2, "0")}-${String(hariAkhir).padStart(2, "0")}`;
  return {
    granularitas: g,
    kolom,
    dinaikkan,
    dari: `${b0.tahun}-${String(b0.bulan).padStart(2, "0")}-01`,
    sampai: akhir === kini ? acuan : sampaiBulan,
  };
}
