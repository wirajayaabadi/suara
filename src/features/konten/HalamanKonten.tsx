import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe, Info, Map } from "lucide-react";
import { HeaderPublik } from "@/components/tata-letak/HeaderPublik";
import { formatTanggal } from "@/lib/format";
import { LABEL_STATUS_PUBLIK, type Jenis } from "@/lib/schemas/publik";
import { ambilKonten } from "@/server/dal/publik";

/*
 * Detail konten publik (dok. 02 §4.2, §5.6): hanya versi yang disetujui, diambil lewat DAL
 * publik. Kode publik (A-0001 / R-0001) bukan Nomor Referensi kiriman. Kode dengan awalan
 * yang salah, tidak ada, atau sudah ditarik → 404.
 */

export const AWALAN_KODE: Record<Jenis, "A" | "R"> = { ASP: "A", WB: "R" };
export const RUTE_KONTEN: Record<Jenis, string> = { ASP: "/aspirasi", WB: "/ringkasan" };
export const PENAFIAN_WB_PANJANG =
  "Ini ringkasan dugaan yang telah disamarkan. Publikasi tidak berarti dugaan terbukti. Identitas semua pihak tidak ditampilkan.";

const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

export async function ambilKontenJenis(kode: string, jenis: Jenis) {
  if (!new RegExp(`^${AWALAN_KODE[jenis]}-\\d{4}$`).test(kode)) return null;
  const k = await ambilKonten(kode);
  return k && k.jenis === jenis ? k : null;
}

export async function IsiKonten({ params, jenis }: { params: Promise<{ kode: string }>; jenis: Jenis }) {
  const { kode } = await params;
  const k = await ambilKontenJenis(kode, jenis);
  if (!k) notFound();
  const wb = k.jenis === "WB";
  return (
    <>
      <HeaderPublik lebar="max-w-[760px]">
        <p className="pt-2 text-sm font-semibold text-gold-300">
          {wb ? "Ringkasan Pelanggaran" : "Aspirasi"} <span aria-hidden="true">›</span> <span className="font-mono">{k.kode}</span>
        </p>
        <h1 className="font-display text-2xl leading-tight font-extrabold text-ivory-50 sm:text-3xl">{k.judul}</h1>
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-2 text-sm text-navy-300">
          <span className="rounded-full border border-navy-600 px-2.5 py-0.5">Kategori: {k.kategoriLabel}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-0.5 font-semibold text-gold-800">
            <Globe className="size-3.5" aria-hidden="true" />
            {LABEL_STATUS_PUBLIK[k.statusPublik]}
          </span>
          {k.periodeLabel && <span>Periode kejadian: {k.periodeLabel}</span>}
        </div>
      </HeaderPublik>

      <main id="konten" className="flex flex-1 flex-col bg-ivory-50">
        <article className="mx-auto flex w-full max-w-[760px] flex-col gap-6 px-4 py-8 text-navy-900 sm:px-6">
          {wb && (
            <aside aria-label="Penting" className="flex items-start gap-3 rounded-xl border-2 border-navy-900 bg-ivory-100 p-4">
              <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <p className="font-semibold">Penting</p>
                {/* Penafian adalah bagian versi yang disetujui; teks baku hanya cadangan. */}
                <p className="leading-relaxed">{k.penafian ?? PENAFIAN_WB_PANJANG}</p>
                {k.penafian && !/tidak berarti dugaan terbukti/i.test(k.penafian) && (
                  <p className="leading-relaxed">Publikasi tidak berarti dugaan terbukti.</p>
                )}
              </div>
            </aside>
          )}

          <section aria-labelledby="judul-isi" className="flex flex-col gap-2">
            <h2 id="judul-isi" className="font-display text-lg font-extrabold">
              {wb ? "Ringkasan" : "Isi aspirasi"}
            </h2>
            <p className="text-base leading-relaxed whitespace-pre-line">{k.ringkasan}</p>
          </section>

          {k.pernyataanHasil && (
            <section aria-labelledby="judul-hasil" className="flex flex-col gap-2">
              <h2 id="judul-hasil" className="font-display text-lg font-extrabold">
                Pernyataan hasil
              </h2>
              <p className="text-base leading-relaxed">{k.pernyataanHasil}</p>
            </section>
          )}

          {k.tanggapanPublik && (
            <section aria-labelledby="judul-tanggapan" className="flex flex-col gap-2 rounded-xl bg-ivory-100 p-4">
              <h2 id="judul-tanggapan" className="font-display text-lg font-extrabold">
                {wb ? "Tindak lanjut" : "Tanggapan pengelola"}
              </h2>
              <p className="text-base leading-relaxed">{k.tanggapanPublik}</p>
            </section>
          )}

          <p className="border-t border-ivory-200 pt-4 text-sm text-navy-ink-muted">
            Versi yang disetujui · dipublikasikan {formatTanggal(k.diterbitkan)} · diperbarui {formatTanggal(k.diperbarui)}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/pemetaan?tampilan=daftar"
              className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-navy-900 px-5 text-sm font-semibold hover:bg-navy-900/5 ${fokus}`}
            >
              <Map className="size-4" aria-hidden="true" />
              Lihat di Peta Suara
            </Link>
            <Link href={RUTE_KONTEN[k.jenis]} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-ivory-100 ${fokus}`}>
              {wb ? "Semua ringkasan" : "Semua aspirasi"}
            </Link>
            <Link href="/" className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold hover:bg-ivory-100 ${fokus}`}>
              <ArrowLeft className="size-4" aria-hidden="true" />
              Beranda
            </Link>
          </div>
          <p className="text-xs text-navy-ink-muted">
            {wb ? "Ringkasan" : "Aspirasi"} ini tampil karena pengirim mengizinkan publikasi dan petugas berwenang menyetujui versi
            ini.
          </p>
        </article>
      </main>
    </>
  );
}

export function KontenTidakTersedia() {
  return (
    <>
      <HeaderPublik lebar="max-w-[760px]" />
      <main id="konten" className="flex flex-1 flex-col bg-ivory-50">
        <div className="mx-auto flex w-full max-w-[760px] flex-col items-start gap-4 px-4 py-16 sm:px-6">
          <h1 className="font-display text-2xl font-extrabold text-navy-900">Konten tidak tersedia</h1>
          <p className="text-base text-navy-ink-muted">
            Konten ini tidak ada, atau sudah ditarik dari publikasi. Konten yang ditarik tidak lagi dapat dibuka.
          </p>
          <Link
            href="/pemetaan"
            className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-navy-900 px-5 text-sm font-semibold text-ivory-50 ${fokus}`}
          >
            Buka Peta Suara
          </Link>
        </div>
      </main>
    </>
  );
}

export function KerangkaKonten() {
  return (
    <>
      <HeaderPublik lebar="max-w-[760px]" />
      <div className="mx-auto w-full max-w-[760px] flex-1 px-4 py-8 text-sm text-navy-ink-muted sm:px-6" aria-busy="true">
        Memuat…
      </div>
    </>
  );
}
