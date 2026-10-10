import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { io } from "next/cache";
import { cookies } from "next/headers";
import { sumberData } from "@/server/dal/publik";

/*
 * Sesi pelacakan (dok. 01 §4.C, dok. 03 §8.2): cookie httpOnly, SameSite=Strict,
 * path=/lacak, 30 menit, berisi isi tersegel (AES-256-GCM). Tidak ada kredensial atau
 * ID kiriman di URL. Setiap aksi membaca kiriman DARI SESI, bukan dari parameter.
 */

export const NAMA_COOKIE = "rs_lacak";
export const DURASI_SESI_DETIK = 30 * 60;

export type IsiSesi = {
  /** ID sesi acak: kunci status sementara prototipe. */
  sid: string;
  nomorReferensi: string;
  /** Kedaluwarsa (epoch ms); diperpanjang setiap aksi pengirim. */
  sampai: number;
};

let kunciProses: Buffer | null = null;

function kunci(): Buffer {
  const rahasia = process.env.SESI_PELACAKAN_RAHASIA;
  if (rahasia && rahasia.length >= 32) return createHash("sha256").update(rahasia).digest();
  if (rahasia) throw new Error("SESI_PELACAKAN_RAHASIA terlalu pendek (minimal 32 karakter).");
  // Vercel menjalankan beberapa instance: kunci acak per proses membuat sesi yang disegel di
  // satu instance ditolak instance lain (dok. 07 K4). Hanya boleh untuk satu proses lokal.
  if (process.env.VERCEL) throw new Error("SESI_PELACAKAN_RAHASIA wajib diisi di Vercel (≥ 32 karakter).");
  if (sumberData() === "contoh") {
    // Lokal: kunci acak per proses. Sesi hilang saat server dimulai ulang.
    kunciProses ??= randomBytes(32);
    return kunciProses;
  }
  throw new Error("SESI_PELACAKAN_RAHASIA (≥ 32 karakter) wajib diisi di produksi.");
}

export function segel(isi: IsiSesi): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", kunci(), iv);
  const data = Buffer.concat([c.update(JSON.stringify(isi), "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), data]).toString("base64url");
}

export function buka(token: string | undefined, kini = Date.now()): IsiSesi | null {
  if (!token || token.length > 1024) return null;
  try {
    const buf = Buffer.from(token, "base64url");
    const d = createDecipheriv("aes-256-gcm", kunci(), buf.subarray(0, 12));
    d.setAuthTag(buf.subarray(12, 28));
    const isi = JSON.parse(Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8")) as IsiSesi;
    if (typeof isi.sid !== "string" || typeof isi.nomorReferensi !== "string" || typeof isi.sampai !== "number") return null;
    return isi.sampai > kini ? isi : null;
  } catch {
    return null;
  }
}

async function tulisCookie(isi: IsiSesi) {
  (await cookies()).set(NAMA_COOKIE, segel(isi), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/lacak",
    maxAge: DURASI_SESI_DETIK,
  });
}

/** Hanya dari Server Action. */
export async function mulaiSesi(nomorReferensi: string): Promise<void> {
  await tulisCookie({ sid: randomBytes(16).toString("base64url"), nomorReferensi, sampai: Date.now() + DURASI_SESI_DETIK * 1000 });
}

/** Membaca sesi aktif (Server Component atau Server Action). */
export async function bacaSesi(): Promise<IsiSesi | null> {
  const token = (await cookies()).get(NAMA_COOKIE)?.value;
  // Pemeriksaan kedaluwarsa memakai jam saat ini: tunda saat prefetch/prerender (Cache Components).
  await io();
  return buka(token);
}

/** Hanya dari Server Action: memperpanjang sesi 30 menit sejak aktivitas terakhir. */
export async function perpanjangSesi(isi: IsiSesi): Promise<void> {
  await tulisCookie({ ...isi, sampai: Date.now() + DURASI_SESI_DETIK * 1000 });
}

/** Hanya dari Server Action. */
export async function akhiriSesi(): Promise<void> {
  (await cookies()).delete({ name: NAMA_COOKIE, path: "/lacak" });
}
