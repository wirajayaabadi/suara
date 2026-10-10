/**
 * State Peta Suara di URL (dok. 05 §3.6, AC-P19). Fungsi murni: dipakai server (membaca
 * `searchParams`) dan klien (menyusun URL baru). Nilai tidak dikenal diabaikan, bukan
 * dilempar, agar tautan rusak tetap membuka peta dengan bawaan.
 */
import { JENIS, StatusPublik, type Jenis } from "@/lib/schemas/publik";
import type { FilterPeta } from "./agregasi";
import { PRESET_PERIODE, type PilihanPeriode, type PresetPeriode } from "./periode";

export const TAMPILAN = ["iso", "2d", "daftar"] as const;
export type Tampilan = (typeof TAMPILAN)[number];
export const LABEL_TAMPILAN: Record<Tampilan, string> = { iso: "Isometrik", "2d": "2D", daftar: "Daftar" };

export const FOKUS = ["semua", "WB", "ASP"] as const;
export type Fokus = (typeof FOKUS)[number];

export type KunciBlok = { jenis: Jenis; kategoriId: string; periode: string };

export type StatePeta = {
  periode: PilihanPeriode;
  jenis: Jenis[];
  kategori: string[];
  status: StatusPublik[];
  q: string;
  tampilan: Tampilan;
  fokus: Fokus;
  skalaPenuh: boolean;
  blok: KunciBlok | null;
  item: string | null;
  hal: number;
};

export const STATE_AWAL: StatePeta = {
  periode: { preset: "4tw" },
  jenis: [],
  kategori: [],
  status: [],
  q: "",
  tampilan: "iso",
  fokus: "semua",
  skalaPenuh: false,
  blok: null,
  item: null,
  hal: 1,
};

const RE_ID = /^[a-z0-9-]{1,40}$/;
const RE_BULAN = /^\d{4}-(0[1-9]|1[0-2])$/;
const RE_PERIODE = /^\d{4}(-(Q[1-4]|0[1-9]|1[0-2]))?$/;
const RE_KODE = /^[AR]-\d{4}$/;
export const MAKS_Q = 80;

type Masukan = URLSearchParams | Record<string, string | string[] | undefined>;

function ambil(sp: Masukan, kunci: string): string | undefined {
  if (sp instanceof URLSearchParams) return sp.get(kunci) ?? undefined;
  const v = sp[kunci];
  return Array.isArray(v) ? v[0] : v;
}

const daftar = (v: string | undefined) => (v ? v.split(",").filter(Boolean) : []);
const unik = <T,>(a: T[]) => [...new Set(a)];

export const kunciBlok = (b: KunciBlok) => `${b.jenis}~${b.kategoriId}~${b.periode}`;

export function bacaBlok(v: string | undefined): KunciBlok | null {
  const [jenis, kategoriId, periode, lebih] = (v ?? "").split("~");
  if (lebih !== undefined || !JENIS.includes(jenis as Jenis)) return null;
  if (!RE_ID.test(kategoriId ?? "") || !RE_PERIODE.test(periode ?? "")) return null;
  return { jenis: jenis as Jenis, kategoriId, periode };
}

function bacaPeriode(v: string | undefined): PilihanPeriode {
  if (PRESET_PERIODE.includes(v as PresetPeriode)) return { preset: v as PresetPeriode };
  const [dari, sampai] = (v ?? "").split("_");
  if (RE_BULAN.test(dari ?? "") && RE_BULAN.test(sampai ?? "")) return { preset: "kustom", dari, sampai };
  return STATE_AWAL.periode;
}

const tulisPeriode = (p: PilihanPeriode) => (p.preset === "kustom" ? `${p.dari}_${p.sampai}` : p.preset);

export function bacaStatePeta(sp: Masukan): StatePeta {
  const tampilan = ambil(sp, "tampilan");
  const fokus = ambil(sp, "fokus");
  const item = ambil(sp, "item");
  const hal = Number(ambil(sp, "hal"));
  return {
    periode: bacaPeriode(ambil(sp, "periode")),
    jenis: unik(daftar(ambil(sp, "jenis")).filter((j): j is Jenis => JENIS.includes(j as Jenis))),
    kategori: unik(daftar(ambil(sp, "kat")).filter((k) => RE_ID.test(k))).slice(0, 40),
    status: unik(daftar(ambil(sp, "status")).filter((s): s is StatusPublik => StatusPublik.safeParse(s).success)),
    q: (ambil(sp, "q") ?? "").trim().slice(0, MAKS_Q),
    tampilan: TAMPILAN.includes(tampilan as Tampilan) ? (tampilan as Tampilan) : STATE_AWAL.tampilan,
    fokus: FOKUS.includes(fokus as Fokus) ? (fokus as Fokus) : STATE_AWAL.fokus,
    skalaPenuh: ambil(sp, "skala") === "penuh",
    blok: bacaBlok(ambil(sp, "blok")),
    item: item && RE_KODE.test(item) ? item : null,
    hal: Number.isInteger(hal) && hal >= 1 && hal <= 999 ? hal : 1,
  };
}

/** Query string tanpa nilai bawaan, urutan kunci tetap (URL yang dibagikan stabil). */
export function tulisStatePeta(s: StatePeta): string {
  const q = new URLSearchParams();
  const periode = tulisPeriode(s.periode);
  if (periode !== tulisPeriode(STATE_AWAL.periode)) q.set("periode", periode);
  // Kedua jenis terpilih = tidak difilter.
  if (s.jenis.length === 1) q.set("jenis", s.jenis[0]);
  if (s.kategori.length) q.set("kat", s.kategori.join(","));
  if (s.status.length) q.set("status", s.status.join(","));
  if (s.q) q.set("q", s.q);
  if (s.tampilan !== STATE_AWAL.tampilan) q.set("tampilan", s.tampilan);
  if (s.fokus !== STATE_AWAL.fokus) q.set("fokus", s.fokus);
  if (s.skalaPenuh) q.set("skala", "penuh");
  if (s.blok) q.set("blok", kunciBlok(s.blok));
  if (s.blok && s.item) q.set("item", s.item);
  if (s.blok && s.hal > 1) q.set("hal", String(s.hal));
  const teks = q.toString();
  return teks ? `?${teks}` : "";
}

/** Filter untuk DAL. Pencarian < 3 karakter diabaikan (dok. 05 §3.6). */
export function keFilter(s: StatePeta): FilterPeta {
  return {
    periode: s.periode,
    jenis: s.jenis.length === 1 ? s.jenis : undefined,
    kategori: s.kategori.length ? s.kategori : undefined,
    status: s.status.length ? s.status : undefined,
    q: s.q.length >= 3 ? s.q : undefined,
    untukIsometrik: s.tampilan === "iso",
    skalaPenuh: s.skalaPenuh || undefined,
  };
}

/** Jumlah filter aktif (untuk tombol “Filter (n)” dan chip). Periode tidak dihitung. */
export function jumlahFilterAktif(s: StatePeta): number {
  return (s.jenis.length === 1 ? 1 : 0) + s.kategori.length + s.status.length + (s.q.length >= 3 ? 1 : 0);
}

export function tanpaFilter(s: StatePeta): StatePeta {
  return { ...s, jenis: [], kategori: [], status: [], q: "", blok: null, item: null, hal: 1 };
}
