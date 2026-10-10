import Link from "next/link";
import { ChevronLeft, ChevronRight, Info, Search, X } from "lucide-react";
import { BadgeStatus } from "@/components/BadgeStatusPublik";
import { HeaderPublik } from "@/components/tata-letak/HeaderPublik";
import { formatAngka, formatTanggal } from "@/lib/format";
import { LABEL_STATUS_PUBLIK, statusUntukJenis, type DaftarKonten, type Jenis, type KategoriPublik } from "@/lib/schemas/publik";
import { MAKS_Q_DAFTAR, PARAM_AWAL, jumlahFilterDaftar, tulisParamDaftar, type ParamDaftar } from "./model/daftar";
import { PENAFIAN_WB_PANJANG, RUTE_KONTEN } from "./HalamanKonten";

/*
 * Halaman daftar konten publik (dok. 02 §4.2). Server Component murni: filter berupa form GET
 * biasa dan paginasi berupa tautan, tanpa JavaScript klien khusus; state selalu ada di URL.
 * Catatan: karena membaca `searchParams`, isi daftar dialirkan (streaming) di balik <Suspense>,
 * yang membutuhkan JS peramban untuk menampilkan hasil akhirnya.
 */

const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";
const kontrol = `min-h-11 rounded-lg border border-ink-border bg-white px-3 text-base text-navy-900 ${fokus}`;

const JUDUL: Record<Jenis, { h1: string; pengantar: string; kosong: string }> = {
  ASP: {
    h1: "Aspirasi",
    pengantar: "Aspirasi yang telah dipublikasikan beserta tanggapan pengelola.",
    kosong: "Belum ada aspirasi yang dipublikasikan. Aspirasi selalu ditinjau petugas sebelum tampil.",
  },
  WB: {
    h1: "Ringkasan Pelanggaran",
    pengantar: "Ringkasan yang telah disamarkan dari laporan yang diizinkan pengirimnya untuk dipublikasikan.",
    kosong: "Belum ada ringkasan yang dipublikasikan. Ringkasan selalu ditinjau dan disetujui petugas sebelum tampil.",
  },
};

export function HalamanDaftar({
  jenis,
  param,
  data,
  kategori,
  dataContoh,
}: {
  jenis: Jenis;
  param: ParamDaftar;
  data: DaftarKonten;
  kategori: KategoriPublik[];
  dataContoh: boolean;
}) {
  const rute = RUTE_KONTEN[jenis];
  const aktif = jumlahFilterDaftar(param);
  const href = (p: ParamDaftar) => `${rute}${tulisParamDaftar(p)}`;
  const namaKat = new Map(kategori.map((k) => [k.id, k.label]));
  const chip = [
    ...(param.q.length >= 3 ? [{ k: "q", label: `“${param.q}”`, ke: { ...param, q: "", hal: 1 } }] : []),
    ...param.kat.map((k) => ({ k: `k-${k}`, label: namaKat.get(k) ?? k, ke: { ...param, kat: param.kat.filter((x) => x !== k), hal: 1 } })),
    ...param.status.map((s) => ({ k: `s-${s}`, label: LABEL_STATUS_PUBLIK[s], ke: { ...param, status: param.status.filter((x) => x !== s), hal: 1 } })),
  ];

  return (
    <div className="flex min-h-svh flex-col">
      <HeaderPublik lebar="max-w-[900px]">
        <h1 className="pt-2 font-display text-3xl font-extrabold text-ivory-50 sm:text-4xl">{JUDUL[jenis].h1}</h1>
        <p className="pb-3 text-base text-navy-300">{JUDUL[jenis].pengantar}</p>
      </HeaderPublik>

      <main id="konten" className="flex flex-1 flex-col bg-ivory-50">
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5 px-4 py-6 text-navy-900 sm:px-6">
          {jenis === "WB" && (
            <aside aria-label="Penting" className="flex items-start gap-3 rounded-xl border-2 border-navy-900 bg-ivory-100 p-4">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Penting</p>
                <p className="leading-relaxed">{PENAFIAN_WB_PANJANG}</p>
              </div>
            </aside>
          )}
          {dataContoh && (
            <p className="rounded-lg border-2 border-dashed border-warn bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
              DATA CONTOH — bukan data nyata.
            </p>
          )}

          <form method="get" action={rute} role="search" aria-label={`Cari ${JUDUL[jenis].h1.toLowerCase()}`} className="flex flex-col gap-3 rounded-xl border border-ivory-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <label htmlFor="cari" className="sr-only">
                  Cari judul, isi, atau tanggapan (minimal 3 huruf)
                </label>
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-ink-muted" aria-hidden="true" />
                <input id="cari" name="q" type="search" defaultValue={param.q} maxLength={MAKS_Q_DAFTAR} placeholder="Cari judul, isi, atau tanggapan" className={`${kontrol} w-full pl-9`} />
              </div>
              <button type="submit" className={`inline-flex min-h-11 items-center justify-center rounded-full bg-navy-900 px-6 text-sm font-semibold text-ivory-50 hover:bg-navy-750 ${fokus} focus-visible:outline-gold-500`}>
                Terapkan
              </button>
            </div>
            <details className="group" open={param.kat.length + param.status.length > 0}>
              <summary className={`inline-flex min-h-11 cursor-pointer items-center rounded text-sm font-semibold text-navy-700 underline underline-offset-4 ${fokus}`}>
                Filter kategori dan status
              </summary>
              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <fieldset className="flex flex-col gap-1">
                  <legend className="mb-1 text-xs font-bold tracking-wide text-gold-800 uppercase">Kategori</legend>
                  {kategori.map((k) => (
                    <label key={k.id} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
                      <input type="checkbox" name="kat" value={k.id} defaultChecked={param.kat.includes(k.id)} className="size-4.5 accent-navy-900" />
                      {k.label}
                    </label>
                  ))}
                </fieldset>
                <fieldset className="flex flex-col gap-1">
                  <legend className="mb-1 text-xs font-bold tracking-wide text-gold-800 uppercase">Status publik</legend>
                  {statusUntukJenis(jenis).map((s) => (
                    <label key={s} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm">
                      <input type="checkbox" name="status" value={s} defaultChecked={param.status.includes(s)} className="size-4.5 accent-navy-900" />
                      {LABEL_STATUS_PUBLIK[s]}
                    </label>
                  ))}
                </fieldset>
              </div>
            </details>
          </form>

          {chip.length > 0 && (
            <ul aria-label="Filter aktif" className="flex flex-wrap items-center gap-2">
              {chip.map((c) => (
                <li key={c.k}>
                  <Link href={href(c.ke)} className={`inline-flex min-h-9 items-center gap-1 rounded-full bg-gold-500 px-3 text-sm font-semibold text-navy-900 ${fokus}`}>
                    {c.label}
                    <X className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">— hapus filter</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href={rute} className={`inline-flex min-h-9 items-center rounded-full px-3 text-sm font-semibold underline underline-offset-4 ${fokus}`}>
                  Reset filter
                </Link>
              </li>
            </ul>
          )}

          <p role="status" className="text-sm text-navy-ink-muted">
            {data.total === 0 ? "Tidak ada hasil." : `${formatAngka(data.total)} ${JUDUL[jenis].h1.toLowerCase()} · halaman ${data.halaman} dari ${data.jumlahHalaman}`}
          </p>

          {data.total === 0 ? (
            <div className="rounded-xl border border-ivory-200 bg-white p-6 text-base leading-relaxed">
              {aktif > 0 ? (
                <>
                  <p>Tidak ada {JUDUL[jenis].h1.toLowerCase()} yang cocok dengan filter ini.</p>
                  <Link href={rute} className={`mt-3 inline-flex min-h-11 items-center rounded-full border-2 border-navy-900 px-5 text-sm font-semibold ${fokus}`}>
                    Reset filter
                  </Link>
                </>
              ) : (
                <p>{JUDUL[jenis].kosong}</p>
              )}
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.item.map((it) => (
                <li key={it.kode}>
                  <article className="relative flex flex-col gap-2 rounded-xl border border-ivory-200 bg-white p-4 transition-colors focus-within:border-navy-700 hover:border-navy-700">
                    <h2 className="font-display text-lg leading-snug font-extrabold">
                      {/* Tautan menutupi seluruh kartu; judul tetap satu-satunya teks tautan. */}
                      <Link href={`${rute}/${it.kode}`} className={`rounded after:absolute after:inset-0 after:rounded-xl ${fokus}`}>
                        {it.judul}
                      </Link>
                    </h2>
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-navy-ink-muted">
                      <span>{it.kategoriLabel}</span>
                      <BadgeStatus status={it.statusPublik} />
                      <span>Dipublikasikan {formatTanggal(it.tanggalPublikasi)}</span>
                    </p>
                    <p className="text-base leading-relaxed">{it.cuplikan}</p>
                    {it.cuplikanTanggapan && (
                      <p className="rounded-lg bg-ivory-100 px-3 py-2 text-sm leading-relaxed">
                        <strong>{jenis === "WB" ? "Tindak lanjut:" : "Tanggapan:"}</strong> {it.cuplikanTanggapan}
                      </p>
                    )}
                  </article>
                </li>
              ))}
            </ul>
          )}

          {data.jumlahHalaman > 1 && (
            <nav aria-label="Halaman daftar" className="flex items-center justify-between gap-2">
              {data.halaman > 1 ? (
                <Link rel="prev" href={href({ ...param, hal: data.halaman - 1 })} className={`inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-navy-900 px-4 text-sm font-semibold ${fokus}`}>
                  <ChevronLeft className="size-4" aria-hidden="true" />
                  Sebelumnya
                </Link>
              ) : (
                <span />
              )}
              <span className="text-sm">
                Halaman {data.halaman} dari {data.jumlahHalaman}
              </span>
              {data.halaman < data.jumlahHalaman ? (
                <Link rel="next" href={href({ ...param, hal: data.halaman + 1 })} className={`inline-flex min-h-11 items-center gap-1 rounded-full border-2 border-navy-900 px-4 text-sm font-semibold ${fokus}`}>
                  Berikutnya
                  <ChevronRight className="size-4" aria-hidden="true" />
                </Link>
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </main>
    </div>
  );
}

export function KerangkaDaftar() {
  return (
    <div className="flex min-h-svh flex-col">
      <HeaderPublik lebar="max-w-[900px]" />
      <div className="mx-auto w-full max-w-[900px] flex-1 px-4 py-8 text-sm text-navy-ink-muted sm:px-6" aria-busy="true">
        Memuat…
      </div>
    </div>
  );
}

export { PARAM_AWAL };
