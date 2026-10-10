"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import {
  PESAN_GAGAL_MASUK,
  PESAN_TERKUNCI,
  SkemaBalasan,
  SkemaMasukPelacakan,
  SkemaTambahLampiran,
} from "@/lib/schemas/pelacakan";
import {
  hapusPerubahanSesi,
  simpanBalasan,
  simpanLampiran,
  tarikIzinPublikasi,
  verifikasiKredensial,
} from "@/server/dal/pelacakan";
import { catatGagal, hashIp, resetReferensi, terkunci } from "@/server/pelacakan/batas";
import { akhiriSesi, bacaSesi, mulaiSesi, perpanjangSesi } from "@/server/pelacakan/sesi";

/*
 * Server Action pelacakan (dok. 01 §4.C). Aksi setelah masuk TIDAK menerima ID kiriman:
 * kiriman selalu dibaca dari sesi (AC-03). Isi kiriman dan kode tidak pernah ditulis ke log.
 */

export type StateMasuk = { galat?: string; nomorReferensi?: string };

async function ipHash() {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "lokal";
  return hashIp(ip);
}

export async function masukPelacakan(_: StateMasuk, formData: FormData): Promise<StateMasuk> {
  const hasil = SkemaMasukPelacakan.safeParse({
    nomorReferensi: String(formData.get("nomorReferensi") ?? ""),
    kodeAkses: String(formData.get("kodeAkses") ?? ""),
  });
  const ref = hasil.success ? hasil.data.nomorReferensi : String(formData.get("nomorReferensi") ?? "").slice(0, 40);
  if (!hasil.success) return { galat: hasil.error.issues[0]?.message ?? PESAN_GAGAL_MASUK, nomorReferensi: ref };

  const ip = await ipHash();
  if (terkunci(ref, ip)) return { galat: PESAN_TERKUNCI, nomorReferensi: ref };

  if (!(await verifikasiKredensial(ref, hasil.data.kodeAkses))) {
    catatGagal(ref, ip);
    return { galat: terkunci(ref, ip) ? PESAN_TERKUNCI : PESAN_GAGAL_MASUK, nomorReferensi: ref };
  }
  resetReferensi(ref);
  await mulaiSesi(ref);
  redirect("/lacak/kiriman");
}

export async function keluarPelacakan(): Promise<void> {
  const sesi = await bacaSesi();
  if (sesi) hapusPerubahanSesi(sesi.sid);
  await akhiriSesi();
  redirect("/lacak?keluar=1");
}

export type StateAksi = { ok?: boolean; galat?: string; pesan?: string; kunci?: number };

const SESI_BERAKHIR = "Sesi pelacakan sudah berakhir. Silakan masuk lagi.";

export async function kirimBalasan(_: StateAksi, formData: FormData): Promise<StateAksi> {
  const sesi = await bacaSesi();
  if (!sesi) return { galat: SESI_BERAKHIR };
  const hasil = SkemaBalasan.safeParse({ isi: String(formData.get("isi") ?? "") });
  if (!hasil.success) return { galat: hasil.error.issues[0]?.message };
  if (!(await simpanBalasan(sesi, hasil.data.isi))) return { galat: "Kiriman ini sudah ditutup dan tidak dapat dibalas." };
  await perpanjangSesi(sesi);
  refresh();
  return { ok: true, pesan: "Balasan terkirim.", kunci: Date.now() };
}

export async function tambahLampiran(ekstensi: string[]): Promise<StateAksi> {
  const sesi = await bacaSesi();
  if (!sesi) return { galat: SESI_BERAKHIR };
  const hasil = SkemaTambahLampiran.safeParse({ ekstensi });
  if (!hasil.success) return { galat: "Lampiran tidak dapat ditambahkan. Gunakan JPG, PNG, WebP, atau PDF." };
  const n = await simpanLampiran(sesi, hasil.data.ekstensi);
  if (n === 0) return { galat: "Batas jumlah lampiran untuk kiriman ini sudah tercapai." };
  await perpanjangSesi(sesi);
  refresh();
  return { ok: true, pesan: `${n} lampiran ditambahkan.` };
}

export async function tarikIzin(): Promise<StateAksi> {
  const sesi = await bacaSesi();
  if (!sesi) return { galat: SESI_BERAKHIR };
  if (!(await tarikIzinPublikasi(sesi))) return { galat: "Izin publikasi sudah tidak aktif." };
  await perpanjangSesi(sesi);
  refresh();
  return { ok: true, pesan: "Izin publikasi telah ditarik." };
}
