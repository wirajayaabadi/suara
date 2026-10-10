/**
 * Agregasi Peta Suara (dok. 05 §3.2). Referensi perilaku untuk fungsi SQL
 * `pub.peta_agregat(...)` dan dipakai langsung untuk data contoh.
 *
 * Masukan HANYA konten publik yang sudah tayang (`KontenPublik`), sehingga agregat
 * tidak mungkin memuat angka dari kiriman privat.
 */
import {
  LABEL_JENIS,
  STATUS_SELESAI,
  type Blok,
  type DatasetPeta,
  type ItemPeta,
  type Jenis,
  type KategoriPublik,
  type KontenPublik,
  type StatusPublik,
} from "@/lib/schemas/publik";
import { bangunPeriode, kunciPeriode, MAKS_KOLOM_DATAR, MAKS_KOLOM_ISOMETRIK, type PilihanPeriode } from "./periode";
import { hitungSkala } from "./skala";

/** Maksimal baris kategori per kelompok di peta; sisanya digabung ke “Lainnya”. */
export const MAKS_BARIS_KATEGORI = 12;

export type FilterPeta = {
  periode: PilihanPeriode;
  jenis?: Jenis[];
  kategori?: string[];
  status?: StatusPublik[];
  q?: string;
  /** Tampilan isometrik membatasi 12 kolom; 2D/Daftar 24. */
  untukIsometrik?: boolean;
  skalaPenuh?: boolean;
};

const idLainnya = (jenis: Jenis) => `lainnya-${jenis.toLowerCase()}`;

/** Kategori untuk peta + peta id asli → id baris di peta (gabungan “Lainnya”). */
export function kategoriPeta(kategori: KategoriPublik[], jenis: Jenis) {
  const urut = [...kategori].sort((a, b) => a.urutan - b.urutan);
  const keBaris = new Map<string, string>(urut.map((k) => [k.id, k.id]));
  if (urut.length <= MAKS_BARIS_KATEGORI) return { kategori: urut, keBaris };
  const tampil = urut.slice(0, MAKS_BARIS_KATEGORI - 1);
  for (const k of urut.slice(MAKS_BARIS_KATEGORI - 1)) keBaris.set(k.id, idLainnya(jenis));
  return {
    kategori: [...tampil, { id: idLainnya(jenis), label: "Lainnya", urutan: 9999 }],
    keBaris,
  };
}

function cocokTeks(k: KontenPublik, q: string | undefined): boolean {
  const kata = q?.trim().toLowerCase();
  if (!kata || kata.length < 3) return true;
  return `${k.judul} ${k.ringkasan}`.toLowerCase().includes(kata);
}

type Konteks = {
  konten: KontenPublik[];
  kategori: Record<Jenis, KategoriPublik[]>;
  acuan: string;
  dataContoh: boolean;
};

function siapkan(ctx: Konteks, f: FilterPeta) {
  const terawal = ctx.konten.reduce<string | undefined>((m, k) => (!m || k.diterbitkan < m ? k.diterbitkan : m), undefined);
  const periode = bangunPeriode(f.periode, ctx.acuan, {
    maksKolom: f.untukIsometrik ? MAKS_KOLOM_ISOMETRIK : MAKS_KOLOM_DATAR,
    tanggalTerawal: terawal,
  });
  const peta = {
    WB: kategoriPeta(ctx.kategori.WB, "WB"),
    ASP: kategoriPeta(ctx.kategori.ASP, "ASP"),
  };
  const filterKategori = f.kategori?.length ? new Set(f.kategori) : null;
  const terpilih = ctx.konten.filter((k) => {
    if (k.diterbitkan < periode.dari || k.diterbitkan > periode.sampai) return false;
    if (f.jenis?.length && !f.jenis.includes(k.jenis)) return false;
    if (f.status?.length && !f.status.includes(k.statusPublik)) return false;
    if (filterKategori) {
      const baris = peta[k.jenis].keBaris.get(k.kategoriId) ?? k.kategoriId;
      if (!filterKategori.has(k.kategoriId) && !filterKategori.has(baris)) return false;
    }
    return cocokTeks(k, f.q);
  });
  return { periode, peta, terpilih };
}

/** Dataset agregat untuk `GET /api/publik/peta`. */
export function agregasiPeta(ctx: Konteks, f: FilterPeta, dibuat: string): DatasetPeta {
  const { periode, peta, terpilih } = siapkan(ctx, f);
  const blokMap = new Map<string, Blok>();
  for (const k of terpilih) {
    const kategoriId = peta[k.jenis].keBaris.get(k.kategoriId) ?? k.kategoriId;
    const p = kunciPeriode(k.diterbitkan, periode.granularitas);
    const kunci = `${k.jenis}|${kategoriId}|${p}`;
    const b = blokMap.get(kunci) ?? { jenis: k.jenis, kategoriId, periode: p, jumlah: 0, status: {} };
    b.jumlah += 1;
    b.status[k.statusPublik] = (b.status[k.statusPublik] ?? 0) + 1;
    blokMap.set(kunci, b);
  }
  const blok = [...blokMap.values()];
  const diperbaruiTerakhir = ctx.konten.reduce<string | null>(
    (m, k) => (m === null || k.diperbarui > m ? k.diperbarui : m),
    null,
  );
  return {
    dibuat,
    periode: { granularitas: periode.granularitas, kolom: periode.kolom, dinaikkan: periode.dinaikkan },
    kelompok: (["WB", "ASP"] as const).map((jenis) => ({
      jenis,
      label: LABEL_JENIS[jenis],
      kategori: peta[jenis].kategori,
    })),
    blok,
    skala: hitungSkala(
      blok.map((b) => b.jumlah),
      f.skalaPenuh,
    ),
    metrik: {
      total: terpilih.length,
      perJenis: {
        WB: terpilih.filter((k) => k.jenis === "WB").length,
        ASP: terpilih.filter((k) => k.jenis === "ASP").length,
      },
      selesai: terpilih.filter((k) => STATUS_SELESAI.includes(k.statusPublik)).length,
      diperbaruiTerakhir,
    },
    dataContoh: ctx.dataContoh,
  };
}

export const UKURAN_HALAMAN_ITEM = 10;

const cuplikan = (teks: string) => (teks.length <= 160 ? teks : `${teks.slice(0, 157).trimEnd()}…`);

/** Daftar item publik di satu blok — `GET /api/publik/peta/item`. */
export function itemBlok(
  ctx: Konteks,
  f: FilterPeta,
  blok: { jenis: Jenis; kategoriId: string; periode: string },
  halaman = 1,
) {
  const { periode, peta, terpilih } = siapkan(ctx, f);
  const cocok = terpilih
    .filter(
      (k) =>
        k.jenis === blok.jenis &&
        (peta[k.jenis].keBaris.get(k.kategoriId) ?? k.kategoriId) === blok.kategoriId &&
        kunciPeriode(k.diterbitkan, periode.granularitas) === blok.periode,
    )
    .sort((a, b) => b.diterbitkan.localeCompare(a.diterbitkan) || b.kode.localeCompare(a.kode));
  const awal = (Math.max(1, halaman) - 1) * UKURAN_HALAMAN_ITEM;
  const item: ItemPeta[] = cocok.slice(awal, awal + UKURAN_HALAMAN_ITEM).map((k) => ({
    kode: k.kode,
    jenis: k.jenis,
    judul: k.judul,
    cuplikan: cuplikan(k.ringkasan),
    kategoriLabel: k.kategoriLabel,
    statusPublik: k.statusPublik,
    tanggalPublikasi: k.diterbitkan,
  }));
  return { item, total: cocok.length, halaman: Math.max(1, halaman), ukuranHalaman: UKURAN_HALAMAN_ITEM };
}
