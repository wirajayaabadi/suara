"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ExternalLink, ChevronRight, Info, Maximize2, Minimize2, X } from "lucide-react";
import {
  LABEL_JENIS,
  statusUntukJenis,
  type DaftarItemPeta,
  type KontenPublik,
} from "@/lib/schemas/publik";
import { formatTanggal } from "@/lib/format";
import { cn } from "@/lib/utils";
import { BadgeStatus } from "@/components/BadgeStatusPublik";
import type { Slot } from "./model/geometri";

/*
 * Panel detail Peta Suara (dok. 05 §3.8): kosong → blok → item.
 * Desktop: panel kanan 400px. Ponsel: bottom sheet non-modal (40% / 90%).
 */

const PENAFIAN_WB = "Publikasi tidak berarti dugaan terbukti.";
const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

type Props = {
  slot: Slot | undefined;
  daftar: DaftarItemPeta | null;
  konten: KontenPublik | null;
  /** Kode item yang diminta di URL (konten mungkin masih dimuat). */
  item: string | null;
  memuat: boolean;
  onTutup: () => void;
  onPilihItem: (kode: string) => void;
  onKembali: () => void;
  onHalaman: (hal: number) => void;
  legenda?: React.ReactNode;
};

export function PanelDetail(p: Props) {
  const panelRef = React.useRef<HTMLElement>(null);
  const [besar, setBesar] = React.useState(false);
  const mode = !p.slot ? "kosong" : p.item ? "item" : "blok";
  const kunciFokus = `${mode}:${p.slot?.id ?? ""}:${p.item ?? ""}`;

  // Saat panel berganti isi, fokus pindah ke judulnya (dok. 05 §3.8).
  React.useEffect(() => {
    if (mode !== "kosong") panelRef.current?.querySelector<HTMLElement>("[data-judul-panel]")?.focus({ preventScroll: true });
  }, [kunciFokus, mode]);

  return (
    <aside
      ref={panelRef}
      aria-label="Detail Peta Suara"
      data-mode={mode}
      className={cn(
        "flex flex-col bg-ivory-50 text-navy-900",
        // Desktop: kolom kanan tetap.
        "lg:sticky lg:top-4 lg:max-h-[calc(100svh-2rem)] lg:w-[400px] lg:shrink-0 lg:rounded-xl lg:border lg:border-ivory-200",
        // Ponsel: bottom sheet hanya saat ada pilihan.
        mode === "kosong"
          ? "max-lg:hidden"
          : cn(
              "max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:rounded-t-2xl max-lg:border-t-2 max-lg:border-navy-900 max-lg:shadow-[0_-8px_24px_rgb(2_30_57/0.25)]",
              besar ? "max-lg:h-[90svh]" : "max-lg:h-[40svh]",
            ),
      )}
    >
      {mode !== "kosong" && (
        <div className="flex items-center justify-end gap-1 border-b border-ivory-200 px-2 py-1 lg:hidden">
          <button
            type="button"
            onClick={() => setBesar((b) => !b)}
            className={cn("grid size-11 place-items-center rounded-full hover:bg-ivory-100", fokus)}
            aria-label={besar ? "Perkecil panel" : "Perbesar panel"}
          >
            {besar ? <Minimize2 className="size-5" aria-hidden="true" /> : <Maximize2 className="size-5" aria-hidden="true" />}
          </button>
          <button type="button" onClick={p.onTutup} className={cn("grid size-11 place-items-center rounded-full hover:bg-ivory-100", fokus)} aria-label="Tutup detail">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5" aria-busy={p.memuat || undefined}>
        {mode === "kosong" && (
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-lg font-extrabold">Pilih balok</h2>
            <p className="text-sm text-navy-ink-muted">
              Klik atau ketuk balok di peta, gunakan tombol panah setelah menekan Tab, atau buka tampilan <strong>Daftar</strong>{" "}
              untuk melihat pengajuan yang telah dipublikasikan.
            </p>
            {p.legenda}
          </div>
        )}

        {mode === "blok" && p.slot && (
          <ModeBlok {...p} slot={p.slot} />
        )}

        {mode === "item" && p.slot && <ModeItem {...p} />}
      </div>

      {mode !== "kosong" && (
        <div className="hidden justify-end border-t border-ivory-200 p-2 lg:flex">
          <button type="button" onClick={p.onTutup} className={cn("inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold hover:bg-ivory-100", fokus)}>
            <X className="size-4" aria-hidden="true" />
            Tutup detail
          </button>
        </div>
      )}
    </aside>
  );
}

function ModeBlok(p: Props & { slot: Slot }) {
  const s = p.slot;
  const daftar = p.daftar;
  const jumlahHalaman = daftar ? Math.max(1, Math.ceil(daftar.total / daftar.ukuranHalaman)) : 1;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold tracking-wide text-gold-800 uppercase">{LABEL_JENIS[s.jenis]}</p>
        <h2 data-judul-panel tabIndex={-1} className="font-display text-lg leading-snug font-extrabold outline-none">
          {s.kategoriLabel} · {s.periodeLabel}
        </h2>
        <p className="mt-1 text-sm text-navy-ink-muted">
          {s.jumlah === 0 ? (
            "Belum ada pengajuan publik di kelompok ini."
          ) : (
            <>
              <strong className="text-navy-900">{s.jumlah}</strong> pengajuan yang telah dipublikasikan
            </>
          )}
        </p>
      </div>

      {s.jumlah > 0 && (
        <ul aria-label="Rincian status publik" className="flex flex-wrap gap-2">
          {statusUntukJenis(s.jenis)
            .filter((st) => s.status[st])
            .map((st) => (
              <li key={st} className="flex items-center gap-1.5 text-sm">
                <BadgeStatus status={st} />
                <span className="font-semibold">{s.status[st]}</span>
              </li>
            ))}
        </ul>
      )}

      {s.jumlah > 0 && (
        <section aria-label="Daftar pengajuan publik" className="flex flex-col gap-2">
          {!daftar ? (
            <p className="text-sm text-navy-ink-muted" role="status">
              Memuat daftar…
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {daftar.item.map((it) => (
                  <li key={it.kode}>
                    <button
                      type="button"
                      onClick={() => p.onPilihItem(it.kode)}
                      className={cn("flex w-full flex-col gap-1.5 rounded-lg border border-ivory-200 bg-white p-3 text-left hover:border-navy-700", fokus)}
                    >
                      <span className="font-semibold">{it.judul}</span>
                      <span className="flex flex-wrap items-center gap-2 text-xs text-navy-ink-muted">
                        <BadgeStatus status={it.statusPublik} />
                        <span>Dipublikasikan {formatTanggal(it.tanggalPublikasi)}</span>
                      </span>
                      <span className="text-sm text-navy-ink-muted">{it.cuplikan}</span>
                    </button>
                  </li>
                ))}
              </ul>
              {jumlahHalaman > 1 && (
                <nav aria-label="Halaman daftar" className="flex items-center justify-between gap-2 pt-1 text-sm">
                  <button
                    type="button"
                    disabled={daftar.halaman <= 1}
                    onClick={() => p.onHalaman(daftar.halaman - 1)}
                    className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold hover:bg-ivory-100 disabled:opacity-40", fokus)}
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                    Sebelumnya
                  </button>
                  <span>
                    Halaman {daftar.halaman} dari {jumlahHalaman}
                  </span>
                  <button
                    type="button"
                    disabled={daftar.halaman >= jumlahHalaman}
                    onClick={() => p.onHalaman(daftar.halaman + 1)}
                    className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold hover:bg-ivory-100 disabled:opacity-40", fokus)}
                  >
                    Berikutnya
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      )}

      {s.jenis === "WB" && s.jumlah > 0 && <Penafian />}
    </div>
  );
}

function Penafian({ teks }: { teks?: string }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-ivory-200 bg-ivory-100 p-3 text-sm">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{teks ?? PENAFIAN_WB}</span>
    </p>
  );
}

function ModeItem(p: Props) {
  const k = p.konten && p.konten.kode === p.item ? p.konten : null;
  return (
    <article className="flex flex-col gap-4">
      <button
        type="button"
        onClick={p.onKembali}
        className={cn("inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full px-3 text-sm font-semibold hover:bg-ivory-100", fokus)}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kembali ke daftar
      </button>
      {!k ? (
        p.memuat ? (
          <p role="status" className="text-sm text-navy-ink-muted">
            Memuat pengajuan…
          </p>
        ) : (
          <>
            <h2 data-judul-panel tabIndex={-1} className="font-display text-lg font-extrabold outline-none">
              Pengajuan tidak ditemukan
            </h2>
            <p className="text-sm text-navy-ink-muted">Pengajuan ini mungkin sudah ditarik dari publikasi.</p>
          </>
        )
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold tracking-wide text-gold-800 uppercase">
              {LABEL_JENIS[k.jenis]} · {k.kategoriLabel}
            </p>
            <h2 data-judul-panel tabIndex={-1} className="font-display text-xl leading-snug font-extrabold outline-none">
              {k.judul}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-navy-ink-muted">
              <BadgeStatus status={k.statusPublik} />
              {k.periodeLabel && <span>Periode kejadian: {k.periodeLabel}</span>}
            </div>
          </div>
          {k.jenis === "WB" && <Penafian teks={k.penafian} />}
          <section aria-labelledby="judul-ringkasan">
            <h3 id="judul-ringkasan" className="text-sm font-bold">
              {k.jenis === "WB" ? "Ringkasan tersamar" : "Isi aspirasi"}
            </h3>
            <p className="mt-1 text-base leading-relaxed whitespace-pre-line">{k.ringkasan}</p>
          </section>
          {k.pernyataanHasil && (
            <section aria-labelledby="judul-hasil">
              <h3 id="judul-hasil" className="text-sm font-bold">
                Pernyataan hasil
              </h3>
              <p className="mt-1 text-base leading-relaxed">{k.pernyataanHasil}</p>
            </section>
          )}
          {k.tanggapanPublik && (
            <section aria-labelledby="judul-tanggapan">
              <h3 id="judul-tanggapan" className="text-sm font-bold">
                {k.jenis === "WB" ? "Tindak lanjut" : "Tanggapan"}
              </h3>
              <p className="mt-1 text-base leading-relaxed">{k.tanggapanPublik}</p>
            </section>
          )}
          <p className="text-xs text-navy-ink-muted">
            Versi yang disetujui · dipublikasikan {formatTanggal(k.diterbitkan)} · diperbarui {formatTanggal(k.diperbarui)} · kode {k.kode}
          </p>
          <Link
            href={`${k.jenis === "WB" ? "/ringkasan" : "/aspirasi"}/${k.kode}`}
            className={cn("inline-flex min-h-11 w-fit items-center gap-1.5 rounded-full border-2 border-navy-900 px-4 text-sm font-semibold hover:bg-navy-900/5", fokus)}
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            Buka halaman {k.jenis === "WB" ? "ringkasan" : "aspirasi"}
          </Link>
        </>
      )}
    </article>
  );
}
