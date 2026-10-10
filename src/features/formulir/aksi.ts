"use server";

import { randomBytes } from "node:crypto";
import { SkemaKirimTiruan, type HasilKirim } from "@/lib/schemas/kiriman";
import { pilihSumberData } from "@/lib/sumber-data";

/*
 * Server Action TIRUAN untuk prototipe form (dok. 05 §6, tahap T2).
 * - Memvalidasi ulang masukan dengan skema yang sama dengan klien.
 * - TIDAK menyimpan apa pun dan TIDAK mencatat isi kiriman ke log.
 * - Mengembalikan Nomor Referensi + Kode Akses acak sebagai contoh.
 * Penyimpanan, HMAC kode akses, anti-spam ALTCHA, dan batas laju dibangun bersama
 * backend (dok. 03 §6, §9).
 */

// Crockford Base32: tanpa I, L, O, U agar tidak tertukar saat disalin.
const ALFABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function acakCrockford(panjang: number): string {
  const b = randomBytes(panjang);
  let s = "";
  for (let i = 0; i < panjang; i++) s += ALFABET[b[i] & 31];
  return s;
}

const kelompok = (s: string) => s.match(/.{1,4}/g)!.join("-");

/** Idempotensi: klik ganda dengan kunci yang sama mengembalikan hasil yang sama. */
const sudahDiproses = new Map<string, HasilKirim>();
const MAKS_CATATAN = 500;

export async function kirimPengajuanTiruan(masukan: unknown): Promise<HasilKirim> {
  const hasil = SkemaKirimTiruan.safeParse(masukan);
  if (!hasil.success) {
    return {
      ok: false,
      jenisGalat: "validasi",
      pesan: "Ada isian yang belum sesuai. Periksa kembali langkah sebelumnya.",
    };
  }
  const { jenis, nilai, idempotensi } = hasil.data;

  const lama = sudahDiproses.get(idempotensi);
  if (lama) return lama;

  // Bot mengisi field jebakan; tolak tanpa menjelaskan alasannya.
  if (nilai.situs) {
    return { ok: false, jenisGalat: "batas", pesan: "Kiriman tidak dapat diproses. Coba lagi dalam beberapa menit." };
  }

  // Simulasi galat server untuk uji tampilan: hanya di pengembangan atau mode data contoh.
  const bolehSimulasi = process.env.NODE_ENV !== "production" || pilihSumberData() === "contoh";
  if (bolehSimulasi && nilai.judul.includes("[uji-galat]")) {
    return {
      ok: false,
      jenisGalat: "server",
      pesan: "Terjadi kendala di sistem kami dan kiriman belum tersimpan. Isian Anda masih ada di layar. Silakan coba kirim lagi.",
    };
  }

  const tahun = new Date().getFullYear() % 100;
  const awalan = jenis === "pelanggaran" ? "WBS" : "ASP";
  const balasan: HasilKirim = {
    ok: true,
    nomorReferensi: `${awalan}-${tahun}-${kelompok(acakCrockford(8))}`,
    kodeAkses: kelompok(acakCrockford(24)),
    tiruan: true,
  };

  if (sudahDiproses.size >= MAKS_CATATAN) sudahDiproses.delete(sudahDiproses.keys().next().value!);
  sudahDiproses.set(idempotensi, balasan);
  return balasan;
}
