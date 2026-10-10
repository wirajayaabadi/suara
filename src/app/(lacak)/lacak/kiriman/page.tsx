import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  Ban,
  CircleCheck,
  CircleHelp,
  Clock,
  EyeOff,
  FileText,
  Globe,
  Hourglass,
  Inbox,
  Lock,
  LogOut,
  MessageSquare,
  Search,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { FormBalasan, TambahLampiran, TarikIzin } from "@/features/pelacakan/InteraksiPelacakan";
import { keluarPelacakan } from "@/features/pelacakan/aksi";
import { kelasTombolPrimer, kelasTombolSekunder } from "@/features/formulir/bidang";
import { formatTanggal } from "@/lib/format";
import {
  LABEL_PENANGANAN_PENGIRIM,
  LABEL_PUBLIKASI_PENGIRIM,
  type KirimanPengirim,
  type PublikasiPengirim,
  type StatusPenanganan,
} from "@/lib/schemas/pelacakan";
import { LABEL_JENIS } from "@/lib/schemas/publik";
import { cn } from "@/lib/utils";
import { ambilKirimanPengirim } from "@/server/dal/pelacakan";
import { bacaSesi } from "@/server/pelacakan/sesi";

export const metadata: Metadata = { title: "Kiriman Anda" };

/**
 * Halaman kiriman milik sesi (dok. 02 §5.5). Tidak ada ID di URL: kiriman dibaca dari
 * cookie sesi di server. Halaman dinamis (membaca cookie) sehingga tidak di-cache.
 */
export default function Halaman() {
  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-4 py-8 sm:py-10">
      <Suspense fallback={<p className="text-navy-ink-muted">Memuat kiriman…</p>}>
        <IsiKiriman />
      </Suspense>
    </div>
  );
}

async function IsiKiriman() {
  const sesi = await bacaSesi();
  const k = sesi ? await ambilKirimanPengirim(sesi) : null;
  if (!k) return <SesiTidakAda />;
  return <Kiriman k={k} />;
}

function SesiTidakAda() {
  return (
    <div className="flex flex-col items-start gap-4 py-10">
      <h1 className="font-display text-2xl font-extrabold text-navy-900">Sesi pelacakan tidak ditemukan</h1>
      <p className="text-base text-navy-ink-muted">
        Sesi mungkin sudah berakhir karena 30 menit tanpa aktivitas, atau Anda sudah keluar. Masuk lagi dengan Nomor Referensi dan
        Kode Akses.
      </p>
      <Link href="/lacak" className={kelasTombolPrimer}>
        Masuk ke pelacakan
      </Link>
    </div>
  );
}

const BADGE_PENANGANAN: Record<StatusPenanganan, { kelas: string; Ikon: LucideIcon }> = {
  DITERIMA: { kelas: "bg-ivory-200 text-navy-900", Ikon: Inbox },
  DITINJAU: { kelas: "bg-info-bg text-info", Ikon: Search },
  BUTUH_INFO: { kelas: "bg-warn-bg text-warn", Ikon: CircleHelp },
  DITINDAKLANJUTI: { kelas: "bg-navy-750 text-ivory-50", Ikon: Workflow },
  SELESAI: { kelas: "bg-ok-bg text-ok", Ikon: CircleCheck },
  DITUTUP: { kelas: "border border-ink-border text-navy-ink-muted", Ikon: Ban },
};

const IKON_PUBLIKASI: Record<PublikasiPengirim, LucideIcon> = {
  TIDAK: Lock,
  DIKURASI: Hourglass,
  DIPUBLIKASIKAN: Globe,
  DITARIK: EyeOff,
};

function Bagian({ judul, ikon: Ikon, children, id }: { judul: string; ikon: LucideIcon; children: React.ReactNode; id: string }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 rounded-2xl border border-ivory-200 bg-white p-5">
      <h2 id={id} className="flex items-center gap-2 font-display text-lg font-extrabold text-navy-900">
        <Ikon className="size-5 text-navy-700" aria-hidden="true" />
        {judul}
      </h2>
      {children}
    </section>
  );
}

function Kiriman({ k }: { k: KirimanPengirim }) {
  const badge = BADGE_PENANGANAN[k.statusPenanganan];
  const IkonPublikasi = IKON_PUBLIKASI[k.publikasi];
  const butuhInfo = k.statusPenanganan === "BUTUH_INFO";
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-navy-ink-muted">Pelacakan · {LABEL_JENIS[k.jenis]}</p>
          <h1 className="font-mono text-xl font-semibold tracking-[0.04em] text-navy-900 sm:text-2xl">{k.nomorReferensi}</h1>
        </div>
        <form action={keluarPelacakan}>
          <button type="submit" className={kelasTombolSekunder}>
            <LogOut className="size-4" aria-hidden="true" />
            Keluar
          </button>
        </form>
      </div>

      {k.dataContoh && (
        <p className="rounded-lg border-2 border-dashed border-warn bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
          CONTOH — data sintetis. Balasan, lampiran, dan penarikan izin hanya berlaku selama sesi ini dan tidak disimpan.
        </p>
      )}

      <section aria-labelledby="judul-status" className="flex flex-col gap-4 rounded-2xl border-2 border-navy-900 bg-ivory-100 p-5">
        <h2 id="judul-status" className="sr-only">
          Status
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-semibold text-navy-ink-muted">Status penanganan</dt>
            <dd>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold", badge.kelas)}>
                <badge.Ikon className="size-4" aria-hidden="true" />
                {LABEL_PENANGANAN_PENGIRIM[k.statusPenanganan]}
              </span>
            </dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="text-sm font-semibold text-navy-ink-muted">Publikasi</dt>
            <dd className="flex items-center gap-1.5 text-sm font-semibold text-navy-900">
              <IkonPublikasi className="size-4 text-navy-700" aria-hidden="true" />
              {LABEL_PUBLIKASI_PENGIRIM[k.publikasi]}
            </dd>
          </div>
        </dl>
        {k.statusPenanganan === "DITUTUP" && (
          <p className="text-sm text-navy-ink-muted">Kiriman ini sudah ditutup. Anda tetap dapat membaca riwayat dan pesan.</p>
        )}
      </section>

      <Bagian judul="Pesan" ikon={MessageSquare} id="judul-pesan">
        {k.pesan.length === 0 ? (
          <p className="text-sm text-navy-ink-muted">Belum ada pesan dari petugas.</p>
        ) : (
          <ol className="flex flex-col gap-3">
            {k.pesan.map((m, i) => (
              <li
                key={i}
                className={cn(
                  "flex flex-col gap-1 rounded-xl p-3 text-base leading-relaxed",
                  m.arah === "KE_PENGIRIM" ? "mr-6 bg-ivory-100" : "ml-6 border border-ivory-200 bg-ivory-50",
                )}
              >
                <span className="text-xs font-semibold text-navy-ink-muted">
                  {m.arah === "KE_PENGIRIM" ? "Petugas" : "Anda"} · {formatTanggal(m.tanggal)}
                </span>
                <span className="text-navy-900">{m.isi}</span>
              </li>
            ))}
          </ol>
        )}
        {k.bisaDibalas ? (
          <FormBalasan butuhInfo={butuhInfo} />
        ) : (
          <p className="text-sm text-navy-ink-muted">Kiriman yang sudah ditutup tidak dapat dibalas.</p>
        )}
      </Bagian>

      <Bagian judul="Linimasa" ikon={Clock} id="judul-linimasa">
        <ol className="flex flex-col gap-0">
          {k.linimasa.map((e, i) => (
            <li key={i} className="relative flex gap-3 pb-4 pl-5 last:pb-0">
              <span aria-hidden="true" className={cn("absolute top-1.5 left-0 size-2.5 rounded-full", i === 0 ? "bg-navy-900" : "bg-ink-border")} />
              {i < k.linimasa.length - 1 && <span aria-hidden="true" className="absolute top-4 bottom-0 left-[4px] w-px bg-ivory-200" />}
              <span className="w-24 shrink-0 text-sm text-navy-ink-muted">{formatTanggal(e.tanggal)}</span>
              <span className="text-sm font-medium text-navy-900">{e.label}</span>
            </li>
          ))}
        </ol>
      </Bagian>

      <Bagian judul={`Lampiran Anda (${k.lampiran.length})`} ikon={FileText} id="judul-lampiran">
        {k.lampiran.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {k.lampiran.map((l) => (
              <li key={l} className="rounded-md bg-ivory-100 px-2.5 py-1 font-mono text-sm text-navy-900">
                {l}
              </li>
            ))}
          </ul>
        )}
        {k.statusPenanganan !== "DITUTUP" && <TambahLampiran sisa={k.maksLampiran} jenis={k.jenis} />}
      </Bagian>

      <details className="rounded-2xl border border-ivory-200 bg-white p-5">
        <summary className="cursor-pointer font-display text-lg font-extrabold text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
          Lihat salinan kiriman Anda
        </summary>
        <dl className="mt-3 flex flex-col gap-3 text-base">
          <div>
            <dt className="text-sm font-semibold text-navy-ink-muted">Kategori</dt>
            <dd className="text-navy-900">{k.kategoriLabel}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-navy-ink-muted">Judul</dt>
            <dd className="text-navy-900">{k.judul}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-navy-ink-muted">Uraian</dt>
            <dd className="leading-relaxed whitespace-pre-line text-navy-900">{k.uraian}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-navy-ink-muted">Dikirim</dt>
            <dd className="text-navy-900">{formatTanggal(k.dibuat)}</dd>
          </div>
        </dl>
      </details>

      <Bagian judul="Izin publikasi" ikon={Globe} id="judul-izin">
        {k.bisaTarikIzin ? (
          <>
            <p className="text-sm leading-relaxed text-navy-ink-muted">
              Anda mengizinkan {k.jenis === "WB" ? "ringkasan tersamar laporan ini" : "aspirasi ini"} dipublikasikan setelah
              ditinjau petugas. Anda dapat menarik izin kapan saja; konten yang sudah tayang akan dihapus dari halaman publik.
            </p>
            <TarikIzin jenis={k.jenis} />
          </>
        ) : (
          <p className="text-sm leading-relaxed text-navy-ink-muted">
            {k.publikasi === "DITARIK"
              ? "Izin publikasi sudah ditarik. Kiriman ini tidak akan tampil di halaman publik."
              : "Anda tidak memberi izin publikasi. Kiriman ini tidak akan tampil di halaman publik."}
          </p>
        )}
      </Bagian>

      <p className="flex items-start gap-2 text-sm text-navy-ink-muted">
        <Clock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        Sesi berakhir otomatis setelah 30 menit tanpa aktivitas. Tekan “Keluar” bila memakai perangkat bersama.
      </p>
    </>
  );
}
