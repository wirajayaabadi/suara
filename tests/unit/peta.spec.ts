import { expect, test } from "@playwright/test";
import type { DatasetPeta, KategoriPublik } from "@/lib/schemas/publik";
import {
  NAIK_TERPILIH,
  TAPAK,
  YAW_AWAL,
  YAW_MAKS,
  YAW_MIN,
  batasIso,
  bentukSlot,
  bidangDasar,
  tataLetak,
  type Slot,
  type Titik,
} from "@/features/peta/model/geometri";
import { hitungSkala, tinggiRelatif, TINGGI_MINIMUM } from "@/features/peta/model/skala";
import { bacaStatePeta, keFilter, STATE_AWAL, tulisStatePeta } from "@/features/peta/model/url";

/*
 * Uji unit Peta Suara (dok. 05 §7: AC-P3, AC-P4, AC-P8, AC-P9, AC-P10, AC-P19).
 * Data sintetis dibangun di sini; tidak memakai modul data contoh server.
 */

const SUDUT = [YAW_MIN, YAW_AWAL, YAW_MAKS];

function kategori(awalan: string, n: number): KategoriPublik[] {
  return Array.from({ length: n }, (_, i) => ({ id: `${awalan}-${i}`, label: `Kategori ${i}`, urutan: i }));
}

function dataset(baris: number, kolom: number, isi: (jenis: "WB" | "ASP", r: number, c: number) => number): DatasetPeta {
  const periode = Array.from({ length: kolom }, (_, i) => ({ kunci: `2026-${String(i + 1).padStart(2, "0")}`, label: `B${i}` }));
  const kelompok = (["WB", "ASP"] as const).map((jenis) => ({
    jenis,
    label: jenis,
    kategori: kategori(jenis.toLowerCase(), baris),
  }));
  const blok = kelompok.flatMap((g) =>
    g.kategori.flatMap((k, r) =>
      periode
        .map((p, c) => ({ jenis: g.jenis, kategoriId: k.id, periode: p.kunci, jumlah: isi(g.jenis, r, c), status: {} }))
        .filter((b) => b.jumlah > 0),
    ),
  );
  return {
    dibuat: "2026-10-09T08:00:00+07:00",
    periode: { granularitas: "bulan", kolom: periode, dinaikkan: false },
    kelompok,
    blok,
    skala: hitungSkala(blok.map((b) => b.jumlah)),
    metrik: { total: 0, perJenis: { WB: 0, ASP: 0 }, selesai: 0, diperbaruiTerakhir: null },
    dataContoh: true,
  };
}

// ---------------------------------------------------------------- alat bantu geometri

function hull(titik: Titik[]): Titik[] {
  const p = [...titik].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const silang = (o: Titik, a: Titik, b: Titik) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const bawah: Titik[] = [];
  for (const t of p) {
    while (bawah.length >= 2 && silang(bawah[bawah.length - 2], bawah[bawah.length - 1], t) <= 0) bawah.pop();
    bawah.push(t);
  }
  const atas: Titik[] = [];
  for (const t of p.reverse()) {
    while (atas.length >= 2 && silang(atas[atas.length - 2], atas[atas.length - 1], t) <= 0) atas.pop();
    atas.push(t);
  }
  return [...bawah.slice(0, -1), ...atas.slice(0, -1)];
}

/** SAT untuk dua poligon cembung; toleransi kecil agar sentuhan tepi tidak dihitung. */
function bertumpuk(a: Titik[], b: Titik[]): boolean {
  for (const poli of [a, b]) {
    for (let i = 0; i < poli.length; i++) {
      const [x1, y1] = poli[i];
      const [x2, y2] = poli[(i + 1) % poli.length];
      const n: Titik = [y1 - y2, x2 - x1];
      const proj = (q: Titik[]) => q.map(([x, y]) => x * n[0] + y * n[1]);
      const pa = proj(a);
      const pb = proj(b);
      if (Math.max(...pa) <= Math.min(...pb) + 1e-9 || Math.max(...pb) <= Math.min(...pa) + 1e-9) return false;
    }
  }
  return true;
}

const siluet = (s: Slot, yaw: number) => {
  const b = bentukSlot(s, yaw, 0, 1 + NAIK_TERPILIH);
  return hull([...b.atap, ...b.kiri, ...b.kanan]);
};

const luas = (p: Titik[]) =>
  p.reduce((a, [x, y], i) => {
    const [x2, y2] = p[(i + 1) % p.length];
    return a + x * y2 - x2 * y;
  }, 0) / 2;

// ---------------------------------------------------------------- AC-P4

test("AC-P4: balok yang lebih dekat selalu digambar belakangan (3 sudut, 2 × 12 × 12)", () => {
  const tl = tataLetak(dataset(12, 12, () => 5));
  for (const yaw of SUDUT) {
    const bentuk = tl.slot.map((s) => ({ s, kedalaman: bentukSlot(s, yaw, 0, 1).kedalaman, siluet: siluet(s, yaw) }));
    let pasanganBertumpuk = 0;
    // Kumpulkan pelanggaran dulu: memanggil expect() puluhan ribu kali sangat lambat.
    const salah: string[] = [];
    for (let i = 0; i < bentuk.length; i++) {
      for (let j = i + 1; j < bentuk.length; j++) {
        const A = bentuk[i];
        const B = bentuk[j];
        if (!bertumpuk(A.siluet, B.siluet)) continue;
        pasanganBertumpuk++;
        // Pengamat berada di arah +x, +y: sumbu pemisah menentukan balok yang di depan.
        const pisahX = A.s.x0 + TAPAK <= B.s.x0 ? "B" : B.s.x0 + TAPAK <= A.s.x0 ? "A" : null;
        const pisahY = A.s.y0 + TAPAK <= B.s.y0 ? "B" : B.s.y0 + TAPAK <= A.s.y0 ? "A" : null;
        if (pisahX && pisahY && pisahX !== pisahY) salah.push(`kontradiksi ${A.s.id} / ${B.s.id} @ ${yaw}`);
        const depan = pisahX ?? pisahY;
        const [dDepan, dBelakang] = depan === "A" ? [A.kedalaman, B.kedalaman] : [B.kedalaman, A.kedalaman];
        if (!depan || dDepan <= dBelakang) salah.push(`${A.s.id} vs ${B.s.id} @ ${yaw}`);
      }
    }
    expect(salah.slice(0, 5)).toEqual([]);
    expect(pasanganBertumpuk).toBeGreaterThan(100);
  }
});

test("AC-P4: sisi kiri dan kanan menghadap pengamat; Whistleblowing tetap di kiri Aspirasi", () => {
  const tl = tataLetak(dataset(8, 12, () => 3));
  const s = tl.slot[0];
  for (const yaw of SUDUT) {
    const b = bentukSlot(s, yaw, 0, 1);
    const pusat = (p: Titik[]) => [p.reduce((a, q) => a + q[0], 0) / p.length, p.reduce((a, q) => a + q[1], 0) / p.length];
    const [kiriX, kiriY] = pusat(b.kiri);
    const [kananX, kananY] = pusat(b.kanan);
    expect(Math.abs(luas(b.kiri))).toBeGreaterThan(0.05);
    expect(Math.abs(luas(b.kanan))).toBeGreaterThan(0.05);
    expect(kiriX).toBeLessThan(kananX);
    // Kedua sisi berada di bawah atap (sumbu y layar ke bawah).
    expect(kiriY).toBeGreaterThan(b.pusatAtap[1]);
    expect(kananY).toBeGreaterThan(b.pusatAtap[1]);

    const [wb, asp] = tl.kelompok.map((g) => bidangDasar(g, tl.kolom, yaw, 0));
    const tengah = (p: Titik[]) => p.reduce((a, q) => a + q[0], 0) / p.length;
    expect(tengah(wb)).toBeLessThan(tengah(asp));
    expect(Math.min(...wb.map((q) => q[0]))).toBeLessThan(Math.min(...asp.map((q) => q[0])));
  }
});

// ---------------------------------------------------------------- AC-P3

test("AC-P3: viewBox tetap untuk seluruh rentang sudut dan memuat semua balok", () => {
  const tl = tataLetak(dataset(12, 12, () => 9));
  const vb = batasIso(tl, "semua");
  const luar: string[] = [];
  for (let i = 0; i <= 20; i++) {
    const yaw = YAW_MIN + ((YAW_MAKS - YAW_MIN) * i) / 20;
    for (const s of tl.slot) {
      const b = bentukSlot(s, yaw, 0, 1 + NAIK_TERPILIH);
      for (const [x, y] of [...b.atap, ...b.kiri, ...b.kanan]) {
        if (x < vb.x || x > vb.x + vb.w || y < vb.y || y > vb.y + vb.h) luar.push(`${s.id} @ ${yaw}`);
      }
    }
  }
  expect(luar.slice(0, 5)).toEqual([]);
  // Fokus satu kelompok menghasilkan viewBox yang lebih sempit (AC-P16).
  expect(batasIso(tl, "WB").w).toBeLessThan(vb.w * 0.7);
});

// ---------------------------------------------------------------- AC-P10

test("AC-P10: filter tidak menggeser posisi slot", () => {
  const penuh = tataLetak(dataset(8, 4, (j, r, c) => (r + c) % 4));
  const tersaring = tataLetak(dataset(8, 4, (j, r) => (j === "WB" && r === 2 ? 1 : 0)));
  expect(tersaring.slot.map((s) => [s.id, s.x0, s.y0])).toEqual(penuh.slot.map((s) => [s.id, s.x0, s.y0]));
});

// ---------------------------------------------------------------- AC-P8 / AC-P9

test("AC-P8: 0/1/3/10 proporsional, nol datar, satu memakai tinggi minimum", () => {
  // 10 > 2,5 × 3 memicu aturan ekstrem bawaan; proporsi murni diuji lewat skala penuh.
  expect(hitungSkala([0, 1, 3, 10]).terpotong).toBe(true);
  const skala = hitungSkala([0, 1, 3, 10], true);
  expect(skala.batasSkala).toBe(10);
  expect(tinggiRelatif(0, skala)).toBe(0);
  expect(tinggiRelatif(1, skala)).toBe(Math.max(TINGGI_MINIMUM, 0.1));
  expect(tinggiRelatif(3, skala)).toBeCloseTo(0.3);
  expect(tinggiRelatif(10, skala)).toBe(1);
  expect(tinggiRelatif(1, hitungSkala([1, 50], true))).toBe(TINGGI_MINIMUM);
});

test("AC-P9: nilai ekstrem dipotong; skala penuh memakai proporsi murni", () => {
  const ekstrem = hitungSkala([120, 12, 5, 3]);
  expect(ekstrem.terpotong).toBe(true);
  expect(ekstrem.batasSkala).toBe(20);
  expect(tinggiRelatif(120, ekstrem)).toBe(1);
  const penuh = hitungSkala([120, 12, 5, 3], true);
  expect(penuh.terpotong).toBe(false);
  expect(penuh.batasSkala).toBe(200);
});

// ---------------------------------------------------------------- AC-P19

test("AC-P19: state URL dapat dipulihkan dan nilai tidak sah diabaikan", () => {
  const state = {
    ...STATE_AWAL,
    periode: { preset: "kustom" as const, dari: "2025-01", sampai: "2026-06" },
    jenis: ["ASP" as const],
    kategori: ["asp-fasum"],
    status: ["DITERIMA" as const],
    q: "kursi",
    tampilan: "2d" as const,
    fokus: "ASP" as const,
    blok: { jenis: "ASP" as const, kategoriId: "asp-fasum", periode: "2026-Q3" },
    item: "A-0012",
    hal: 2,
  };
  const qs = tulisStatePeta(state);
  expect(bacaStatePeta(new URLSearchParams(qs))).toEqual(state);
  expect(tulisStatePeta(STATE_AWAL)).toBe("");

  const rusak = bacaStatePeta({ tampilan: "3d", jenis: "XX,WB", status: "BOCOR", blok: "WB~<script>~2026", item: "Z-1", hal: "-4" });
  expect(rusak.tampilan).toBe("iso");
  expect(rusak.jenis).toEqual(["WB"]);
  expect(rusak.status).toEqual([]);
  expect(rusak.blok).toBeNull();
  expect(rusak.item).toBeNull();
  expect(rusak.hal).toBe(1);
  // Pencarian < 3 karakter tidak dikirim ke DAL.
  expect(keFilter({ ...STATE_AWAL, q: "ab" }).q).toBeUndefined();
});
