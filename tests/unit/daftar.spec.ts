import { expect, test } from "@playwright/test";
import type { KontenPublik } from "@/lib/schemas/publik";
import { PARAM_AWAL, bacaParamDaftar, saringDaftar, tulisParamDaftar } from "@/features/konten/model/daftar";

/* Model daftar publik: penyaringan, urutan, paginasi, dan state URL (AC-D1, AC-D5). */

const buat = (n: number, jenis: "WB" | "ASP" = "ASP", o: Partial<KontenPublik> = {}): KontenPublik => ({
  kode: `${jenis === "WB" ? "R" : "A"}-${String(n).padStart(4, "0")}`,
  jenis,
  judul: `Judul ${n}`,
  ringkasan: `Ringkasan nomor ${n}`,
  kategoriId: n % 2 ? "k1" : "k2",
  kategoriLabel: n % 2 ? "Satu" : "Dua",
  statusPublik: jenis === "WB" ? "DALAM_PENANGANAN" : "DITERIMA",
  diterbitkan: `2026-0${1 + (n % 9)}-1${n % 9}`,
  diperbarui: "2026-10-01",
  ...(jenis === "WB" ? { penafian: "Publikasi tidak berarti dugaan terbukti." } : {}),
  ...o,
});

test("hanya jenis yang diminta; terbaru dulu; 10 per halaman; halaman dijepit", () => {
  const semua = [...Array.from({ length: 25 }, (_, i) => buat(i + 1)), buat(1, "WB")];
  const h1 = saringDaftar(semua, "ASP", PARAM_AWAL);
  expect(h1.total).toBe(25);
  expect(h1.item).toHaveLength(10);
  expect(h1.item.every((i) => i.jenis === "ASP")).toBe(true);
  const tgl = h1.item.map((i) => i.tanggalPublikasi);
  expect([...tgl].sort().reverse()).toEqual(tgl);
  expect(saringDaftar(semua, "ASP", { ...PARAM_AWAL, hal: 3 }).item).toHaveLength(5);
  expect(saringDaftar(semua, "ASP", { ...PARAM_AWAL, hal: 99 }).halaman).toBe(3);
  expect(saringDaftar(semua, "WB", PARAM_AWAL).total).toBe(1);
});

test("filter kategori, status, dan pencarian ≥ 3 huruf", () => {
  const semua = [buat(1), buat(2), buat(3, "ASP", { statusPublik: "DITINDAKLANJUTI", tanggapanPublik: "Kursi akan ditambah" })];
  expect(saringDaftar(semua, "ASP", { ...PARAM_AWAL, kat: ["k2"] }).total).toBe(1);
  expect(saringDaftar(semua, "ASP", { ...PARAM_AWAL, status: ["DITINDAKLANJUTI"] }).total).toBe(1);
  expect(saringDaftar(semua, "ASP", { ...PARAM_AWAL, q: "kursi" }).item[0].kode).toBe("A-0003");
  // Kurang dari 3 huruf diabaikan.
  expect(saringDaftar(semua, "ASP", { ...PARAM_AWAL, q: "ku" }).total).toBe(3);
});

test("AC-D5: pencarian tidak menjangkau teks yang bukan bagian konten publik", () => {
  const k = { ...buat(1), rahasia: "uraian asli rahasia" } as KontenPublik;
  expect(saringDaftar([k], "ASP", { ...PARAM_AWAL, q: "uraian asli" }).total).toBe(0);
});

test("state URL: dipulihkan, status jenis lain dibuang, nilai rusak diabaikan", () => {
  const p = { q: "kursi", kat: ["asp-fasum"], status: ["DITERIMA" as const], hal: 2 };
  expect(bacaParamDaftar(new URLSearchParams(tulisParamDaftar(p)).size ? Object.fromEntries(new URLSearchParams(tulisParamDaftar(p))) : {}, "ASP")).toEqual(p);
  expect(tulisParamDaftar(PARAM_AWAL)).toBe("");
  // Status WB tidak sah untuk ASP; kat tidak aman dibuang; hal rusak → 1.
  const r = bacaParamDaftar({ status: "SELESAI_DITANGANI,DITERIMA", kat: ["<x>", "ok-1"], hal: "-3" }, "ASP");
  expect(r.status).toEqual(["DITERIMA"]);
  expect(r.kat).toEqual(["ok-1"]);
  expect(r.hal).toBe(1);
  // Parameter berulang (checkbox GET) terbaca.
  expect(bacaParamDaftar({ kat: ["a", "b"] }, "ASP").kat).toEqual(["a", "b"]);
});
