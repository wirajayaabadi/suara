/**
 * Model halaman daftar `/aspirasi` dan `/ringkasan` (dok. 02 §4.2). Fungsi murni: dipakai
 * server (membaca `searchParams`, menyaring) dan komponen (menyusun tautan). Masukan HANYA
 * konten publik yang sudah tayang, jadi tidak ada angka atau teks dari kiriman privat.
 */
import { StatusPublik, statusUntukJenis, type Jenis, type KontenPublik } from "@/lib/schemas/publik";

export const UKURAN_HALAMAN_DAFTAR = 10;
export const MAKS_Q_DAFTAR = 80;
const RE_ID = /^[a-z0-9-]{1,40}$/;

export type ParamDaftar = { q: string; kat: string[]; status: StatusPublik[]; hal: number };
export const PARAM_AWAL: ParamDaftar = { q: "", kat: [], status: [], hal: 1 };

type Masukan = Record<string, string | string[] | undefined>;
const jadiDaftar = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []).flatMap((x) => x.split(","));
const unik = <T,>(a: T[]) => [...new Set(a)];

/** Nilai tidak dikenal diabaikan agar tautan rusak tetap membuka daftar bawaan. */
export function bacaParamDaftar(sp: Masukan, jenis: Jenis): ParamDaftar {
  const sah = statusUntukJenis(jenis);
  const hal = Number(Array.isArray(sp.hal) ? sp.hal[0] : sp.hal);
  const q = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  return {
    q: (q ?? "").trim().slice(0, MAKS_Q_DAFTAR),
    kat: unik(jadiDaftar(sp.kat).filter((k) => RE_ID.test(k))).slice(0, 40),
    status: unik(jadiDaftar(sp.status).filter((s): s is StatusPublik => StatusPublik.safeParse(s).success && sah.includes(s as StatusPublik))),
    hal: Number.isInteger(hal) && hal >= 1 && hal <= 999 ? hal : 1,
  };
}

/** Query string tanpa nilai bawaan; urutan kunci tetap. */
export function tulisParamDaftar(p: ParamDaftar): string {
  const q = new URLSearchParams();
  if (p.q) q.set("q", p.q);
  if (p.kat.length) q.set("kat", p.kat.join(","));
  if (p.status.length) q.set("status", p.status.join(","));
  if (p.hal > 1) q.set("hal", String(p.hal));
  const t = q.toString();
  return t ? `?${t}` : "";
}

export const jumlahFilterDaftar = (p: ParamDaftar) => p.kat.length + p.status.length + (p.q.length >= 3 ? 1 : 0);

const cuplikan = (teks: string) => (teks.length <= 160 ? teks : `${teks.slice(0, 157).trimEnd()}…`);

/** Menyaring, mengurutkan (terbaru dulu), dan memotong halaman. */
export function saringDaftar(konten: KontenPublik[], jenis: Jenis, p: ParamDaftar) {
  const kata = p.q.length >= 3 ? p.q.toLowerCase() : null;
  const kat = p.kat.length ? new Set(p.kat) : null;
  const cocok = konten
    .filter((k) => k.jenis === jenis)
    .filter((k) => !kat || kat.has(k.kategoriId))
    .filter((k) => !p.status.length || p.status.includes(k.statusPublik))
    .filter((k) => !kata || `${k.judul} ${k.ringkasan} ${k.tanggapanPublik ?? ""}`.toLowerCase().includes(kata))
    .sort((a, b) => b.diterbitkan.localeCompare(a.diterbitkan) || b.kode.localeCompare(a.kode));
  const jumlahHalaman = Math.max(1, Math.ceil(cocok.length / UKURAN_HALAMAN_DAFTAR));
  const halaman = Math.min(p.hal, jumlahHalaman);
  const awal = (halaman - 1) * UKURAN_HALAMAN_DAFTAR;
  return {
    item: cocok.slice(awal, awal + UKURAN_HALAMAN_DAFTAR).map((k) => ({
      kode: k.kode,
      jenis: k.jenis,
      judul: k.judul,
      cuplikan: cuplikan(k.ringkasan),
      cuplikanTanggapan: k.tanggapanPublik ? cuplikan(k.tanggapanPublik) : undefined,
      kategoriLabel: k.kategoriLabel,
      statusPublik: k.statusPublik,
      tanggalPublikasi: k.diterbitkan,
    })),
    total: cocok.length,
    halaman,
    jumlahHalaman,
    ukuranHalaman: UKURAN_HALAMAN_DAFTAR,
  };
}
