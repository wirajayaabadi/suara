import "server-only";
import { mulberry32 } from "@/features/beranda/bubble/acak";
import {
  KontenPublik,
  type Jenis,
  type KategoriPublik,
  type StatusPublik,
} from "@/lib/schemas/publik";
import { KATEGORI_ASP, KATEGORI_ASP_TAMBAHAN, KATEGORI_WB } from "./kategori";
import {
  LOKASI_UMUM,
  PENAFIAN_WB,
  PERNYATAAN_HASIL_WB,
  TANGGAPAN_ASP,
  TANGGAPAN_WB,
  TEMPLAT_ASP,
  TEMPLAT_ASP_UMUM,
  TEMPLAT_WB,
  type TemplatKonten,
} from "./teks";

/**
 * DATA CONTOH — konten publik sintetis untuk Peta Suara, daftar, dan detail.
 * Deterministik (seed tetap) dan memakai tanggal acuan tetap, sehingga hasilnya sama di
 * setiap build dan tidak bergantung pada jam server.
 */

/** “Hari ini” untuk data contoh (WIB). */
export const TANGGAL_ACUAN_CONTOH = "2026-10-09";

export const SKENARIO = ["normal", "kosong", "sedikit", "ekstrem", "banyak-kategori", "rentang-panjang"] as const;
export type Skenario = (typeof SKENARIO)[number];

export const KETERANGAN_SKENARIO: Record<Skenario, string> = {
  normal: "± 15 bulan data, kedua jenis, sebaran wajar dengan beberapa blok kosong",
  kosong: "Belum ada konten publik sama sekali",
  sedikit: "Hanya 3 konten (uji tinggi minimum)",
  ekstrem: "Satu blok berisi 120 aspirasi, blok lain ≤ 12 (uji skala terpotong)",
  "banyak-kategori": "15 kategori aspirasi (uji penggabungan “Lainnya” di peta)",
  "rentang-panjang": "Data sejak 2022 (uji granularitas otomatis & batas kolom)",
};

export type DataContoh = {
  kategori: Record<Jenis, KategoriPublik[]>;
  konten: KontenPublik[];
};

// ---------------------------------------------------------------- tanggal

const hariKeTanggal = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const tanggalKeMs = (t: string) => Date.parse(`${t}T00:00:00Z`);
const tambahHari = (t: string, n: number) => hariKeTanggal(tanggalKeMs(t) + n * 86_400_000);
const selisihHari = (a: string, b: string) => Math.round((tanggalKeMs(a) - tanggalKeMs(b)) / 86_400_000);
const ROMAWI = ["I", "II", "III", "IV"];
const labelTriwulanPanjang = (t: string) => {
  const [y, m] = t.split("-").map(Number);
  return `Triwulan ${ROMAWI[Math.floor((m - 1) / 3)]} ${y}`;
};

// ---------------------------------------------------------------- generator

type Acak = () => number;
const pilih = <T,>(rnd: Acak, daftar: readonly T[]): T => daftar[Math.floor(rnd() * daftar.length)];

/** Kategori awal lebih sering muncul; “Lainnya” jarang. */
function pilihKategori(rnd: Acak, kategori: KategoriPublik[]): KategoriPublik {
  const bobot = kategori.map((k, i) => (k.urutan >= 99 ? 0.25 : 1 / Math.pow(i + 1, 0.55)));
  const total = bobot.reduce((a, b) => a + b, 0);
  let r = rnd() * total;
  for (let i = 0; i < kategori.length; i++) {
    r -= bobot[i];
    if (r <= 0) return kategori[i];
  }
  return kategori[kategori.length - 1];
}

/** Konten lama lebih mungkin sudah selesai. */
function pilihStatus(rnd: Acak, jenis: Jenis, umurHari: number): StatusPublik {
  const r = rnd();
  if (jenis === "WB") return r < (umurHari > 90 ? 0.7 : 0.2) ? "SELESAI_DITANGANI" : "DALAM_PENANGANAN";
  if (umurHari < 30) return r < 0.6 ? "DITERIMA" : "DIPERTIMBANGKAN";
  if (umurHari < 120) return r < 0.15 ? "DITERIMA" : r < 0.5 ? "DIPERTIMBANGKAN" : r < 0.9 ? "DITINDAKLANJUTI" : "TIDAK_DAPAT_DILAKSANAKAN";
  return r < 0.15 ? "DIPERTIMBANGKAN" : r < 0.4 ? "DITINDAKLANJUTI" : r < 0.9 ? "SUDAH_DILAKSANAKAN" : "TIDAK_DAPAT_DILAKSANAKAN";
}

function templat(jenis: Jenis, k: KategoriPublik): TemplatKonten[] {
  if (jenis === "WB") return TEMPLAT_WB[k.id] ?? TEMPLAT_WB["wb-lainnya"];
  return (
    TEMPLAT_ASP[k.id] ??
    TEMPLAT_ASP_UMUM.map((t) => ({
      judul: t.judul.replace("{kategori}", k.label.toLowerCase()),
      ringkasan: t.ringkasan.replace("{kategori}", k.label.toLowerCase()),
    }))
  );
}

type Draf = Omit<KontenPublik, "kode">;

function buatSatu(rnd: Acak, jenis: Jenis, k: KategoriPublik, diterbitkan: string, acuan: string): Draf {
  const t = pilih(rnd, templat(jenis, k));
  const umur = selisihHari(acuan, diterbitkan);
  const status = pilihStatus(rnd, jenis, umur);
  const diperbaruiKandidat = tambahHari(diterbitkan, Math.floor(rnd() * Math.min(60, umur + 1)));
  const diperbarui = diperbaruiKandidat > acuan ? acuan : diperbaruiKandidat;
  const bank = jenis === "WB" ? TANGGAPAN_WB : TANGGAPAN_ASP;
  const tanggapan = bank[status];
  const draf: Draf = {
    jenis,
    judul: t.judul,
    ringkasan: t.ringkasan.replace("{lokasi}", pilih(rnd, LOKASI_UMUM)),
    kategoriId: k.id,
    kategoriLabel: k.label,
    statusPublik: status,
    tanggapanPublik: tanggapan ? pilih(rnd, tanggapan) : undefined,
    diterbitkan,
    diperbarui,
  };
  if (jenis === "WB") {
    // Periode kejadian digeneralisasi ke triwulan, beberapa minggu sebelum publikasi.
    draf.periodeLabel = labelTriwulanPanjang(tambahHari(diterbitkan, -Math.floor(rnd() * 100)));
    draf.penafian = PENAFIAN_WB;
    if (status === "SELESAI_DITANGANI" && rnd() < 0.25) draf.pernyataanHasil = pilih(rnd, PERNYATAAN_HASIL_WB);
  }
  return draf;
}

type OpsiGenerator = {
  seed: number;
  /** Bulan pertama (YYYY-MM). */
  dari: string;
  acuan: string;
  kategori: Record<Jenis, KategoriPublik[]>;
  /** Rata-rata konten tayang per bulan. */
  perBulan: Record<Jenis, number>;
};

function bangkitkan(o: OpsiGenerator): Draf[] {
  const rnd = mulberry32(o.seed);
  const hasil: Draf[] = [];
  let [y, m] = o.dari.split("-").map(Number);
  const [ya, ma] = o.acuan.split("-").map(Number);
  while (y < ya || (y === ya && m <= ma)) {
    const hariDalamBulan = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const batasHari = y === ya && m === ma ? Number(o.acuan.slice(8, 10)) : hariDalamBulan;
    for (const jenis of ["WB", "ASP"] as const) {
      const n = Math.round(o.perBulan[jenis] * (0.4 + rnd() * 1.2));
      for (let i = 0; i < n; i++) {
        const hari = 1 + Math.floor(rnd() * batasHari);
        const tanggal = `${y}-${String(m).padStart(2, "0")}-${String(hari).padStart(2, "0")}`;
        hasil.push(buatSatu(rnd, jenis, pilihKategori(rnd, o.kategori[jenis]), tanggal, o.acuan));
      }
    }
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return hasil;
}

/** Urutkan menurut tanggal terbit, beri kode publik berurutan per jenis, lalu validasi. */
function finalisasi(draf: Draf[]): KontenPublik[] {
  const urut = [...draf].sort((a, b) => a.diterbitkan.localeCompare(b.diterbitkan));
  const nomor: Record<Jenis, number> = { WB: 0, ASP: 0 };
  return urut.map((d) => {
    nomor[d.jenis] += 1;
    const kode = `${d.jenis === "WB" ? "R" : "A"}-${String(nomor[d.jenis]).padStart(4, "0")}`;
    // Validasi ketat: data contoh harus lolos kontrak yang sama dengan data sesungguhnya.
    return KontenPublik.parse({ kode, ...d });
  });
}

// ---------------------------------------------------------------- skenario

const KATEGORI_DASAR = { WB: KATEGORI_WB, ASP: KATEGORI_ASP };

function skenarioEkstrem(acuan: string): Draf[] {
  const dasar = bangkitkan({ seed: 7, dari: "2025-10", acuan, kategori: KATEGORI_DASAR, perBulan: { WB: 2, ASP: 4 } });
  const rnd = mulberry32(120);
  const fasum = KATEGORI_ASP[0];
  // 120 aspirasi fasilitas umum dalam Triwulan III 2026, misalnya akibat satu isu bersama.
  for (let i = 0; i < 120; i++) {
    const tanggal = tambahHari("2026-07-01", Math.floor(rnd() * 92));
    dasar.push(buatSatu(rnd, "ASP", fasum, tanggal, acuan));
  }
  return dasar;
}

function skenarioSedikit(acuan: string): Draf[] {
  const rnd = mulberry32(3);
  return [
    buatSatu(rnd, "WB", KATEGORI_WB[0], "2026-08-14", acuan),
    buatSatu(rnd, "ASP", KATEGORI_ASP[0], "2026-09-02", acuan),
    buatSatu(rnd, "ASP", KATEGORI_ASP[3], "2026-10-01", acuan),
  ];
}

const cache = new Map<Skenario, DataContoh>();

/** Data contoh untuk satu skenario (di-cache di memori; deterministik). */
export function dataContoh(skenario: Skenario = "normal"): DataContoh {
  const ada = cache.get(skenario);
  if (ada) return ada;
  const acuan = TANGGAL_ACUAN_CONTOH;
  let kategori: Record<Jenis, KategoriPublik[]> = KATEGORI_DASAR;
  let draf: Draf[];
  switch (skenario) {
    case "kosong":
      draf = [];
      break;
    case "sedikit":
      draf = skenarioSedikit(acuan);
      break;
    case "ekstrem":
      draf = skenarioEkstrem(acuan);
      break;
    case "banyak-kategori":
      kategori = { WB: KATEGORI_WB, ASP: [...KATEGORI_ASP, ...KATEGORI_ASP_TAMBAHAN] };
      draf = bangkitkan({ seed: 15, dari: "2025-10", acuan, kategori, perBulan: { WB: 2, ASP: 12 } });
      break;
    case "rentang-panjang":
      draf = bangkitkan({ seed: 2022, dari: "2022-01", acuan, kategori, perBulan: { WB: 1.2, ASP: 3 } });
      break;
    case "normal":
    default:
      draf = bangkitkan({ seed: 2026, dari: "2025-07", acuan, kategori, perBulan: { WB: 2.6, ASP: 7 } });
  }
  const hasil = { kategori, konten: finalisasi(draf) };
  cache.set(skenario, hasil);
  return hasil;
}
