import "server-only";
import { createHmac } from "node:crypto";

/*
 * Pembatasan percobaan masuk pelacakan (dok. 01 §4.C, dok. 04 T-10): 6 kali gagal pada
 * satu Nomor Referensi → dikunci 15 menit. Per alamat IP (disimpan sebagai hash) batasnya
 * lebih longgar agar satu jaringan kantor tidak terkunci bersama.
 *
 * Prototipe: penyimpanan di memori proses. Produksi memakai tabel/Redis bersama (dok. 03 §9).
 */

const JENDELA_MS = 15 * 60 * 1000;
export const MAKS_GAGAL_REFERENSI = 6;
export const MAKS_GAGAL_IP = 30;
const MAKS_CATATAN = 5000;

type Catatan = { gagal: number; mulai: number };
const perReferensi = new Map<string, Catatan>();
const perIp = new Map<string, Catatan>();

/** IP tidak pernah disimpan polos. */
export function hashIp(ip: string): string {
  return createHmac("sha256", process.env.TRACKING_PEPPER ?? "contoh-lokal").update(ip).digest("base64url").slice(0, 22);
}

function aktif(peta: Map<string, Catatan>, kunci: string, kini: number): Catatan | undefined {
  const c = peta.get(kunci);
  if (c && kini - c.mulai > JENDELA_MS) {
    peta.delete(kunci);
    return undefined;
  }
  return c;
}

export function terkunci(referensi: string, ipHash: string, kini = Date.now()): boolean {
  return (
    (aktif(perReferensi, referensi, kini)?.gagal ?? 0) >= MAKS_GAGAL_REFERENSI ||
    (aktif(perIp, ipHash, kini)?.gagal ?? 0) >= MAKS_GAGAL_IP
  );
}

function tambah(peta: Map<string, Catatan>, kunci: string, kini: number) {
  const c = aktif(peta, kunci, kini) ?? { gagal: 0, mulai: kini };
  c.gagal += 1;
  if (!peta.has(kunci) && peta.size >= MAKS_CATATAN) peta.delete(peta.keys().next().value!);
  peta.set(kunci, c);
}

export function catatGagal(referensi: string, ipHash: string, kini = Date.now()) {
  tambah(perReferensi, referensi, kini);
  tambah(perIp, ipHash, kini);
}

/** Berhasil masuk: hitungan untuk nomor itu direset (hitungan IP tetap). */
export function resetReferensi(referensi: string) {
  perReferensi.delete(referensi);
}
