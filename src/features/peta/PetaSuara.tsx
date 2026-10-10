"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lightbulb, MoveHorizontal, RotateCcw, RotateCw, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import type { DaftarItemPeta, DatasetPeta, Jenis, KontenPublik } from "@/lib/schemas/publik";
import { formatAngka, formatTanggal } from "@/lib/format";
import { useAnimasiOpsional } from "@/lib/animasi/AnimasiProvider";
import { cn } from "@/lib/utils";
import { KanvasPeta, labelSlot } from "./KanvasPeta";
import { ChipFilter, KontrolFilter, LegendaPeta, Segmen, kelasFokusGelap, kelasFokusTerang } from "./KontrolPeta";
import { PanelDetail } from "./PanelDetail";
import { TampilanDaftar } from "./TampilanDaftar";
import { LANGKAH_SUDUT, YAW_AWAL, jepitYaw, tataLetak, urutanNavigasi, type Slot } from "./model/geometri";
import {
  FOKUS,
  LABEL_TAMPILAN,
  TAMPILAN,
  jumlahFilterAktif,
  kunciBlok,
  tanpaFilter,
  tulisStatePeta,
  type Fokus,
  type StatePeta,
} from "./model/url";

/*
 * Peta Suara (dok. 05 §3). State filter, tampilan, fokus, blok, dan item tinggal di URL
 * (AC-P19); server menghitung agregat dari konten publik saja. Sudut putar bersifat lokal.
 */

type Props = {
  state: StatePeta;
  dataset: DatasetPeta;
  /** Daftar item untuk `blok` di URL (`kunci` = kunciBlok + halaman). */
  daftarItem: { kunci: string; data: DaftarItemPeta } | null;
  konten: KontenPublik | null;
};

const berlanggananKosong = () => () => {};

const LABEL_FOKUS: Record<Fokus, string> = { semua: "Keduanya", WB: "Whistleblowing", ASP: "Aspirasi" };
const IKON_JENIS: Record<Jenis, typeof ShieldCheck> = { WB: ShieldCheck, ASP: Lightbulb };

export function PetaSuara(props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [memuat, startTransition] = React.useTransition();
  const [state, setStateOptimis] = React.useOptimistic(props.state);
  const { dataset } = props;
  const gerakDikurangi = useAnimasiOpsional()?.gerakDikurangi ?? false;
  // Penanda hidrasi (dipakai uji E2E sebelum berinteraksi).
  const terhidrasi = React.useSyncExternalStore(berlanggananKosong, () => true, () => false);

  const ubah = React.useCallback(
    (fn: (s: StatePeta) => StatePeta, cara: "push" | "replace" = "replace") => {
      const baru = fn(state);
      startTransition(() => {
        setStateOptimis(baru);
        router[cara](`${pathname}${tulisStatePeta(baru)}`, { scroll: false });
      });
    },
    [state, pathname, router, setStateOptimis],
  );

  // Pencarian: ketik lokal, kirim setelah 300ms (dok. 05 §3.6).
  const [qInput, setQInput] = React.useState(props.state.q);
  const [qUrl, setQUrl] = React.useState(props.state.q);
  if (props.state.q !== qUrl) {
    setQUrl(props.state.q);
    setQInput(props.state.q);
  }
  React.useEffect(() => {
    const q = qInput.trim();
    if (q === state.q || (q.length > 0 && q.length < 3 && state.q === "")) return;
    const t = setTimeout(() => ubah((s) => ({ ...s, q: q.length >= 3 ? q : "", hal: 1 })), 300);
    return () => clearTimeout(t);
  }, [qInput, state.q, ubah]);

  const [yaw, setYaw] = React.useState(YAW_AWAL);
  const tl = React.useMemo(() => tataLetak(dataset), [dataset]);
  const idTerpilih = state.blok ? kunciBlok(state.blok) : null;
  const slotTerpilih = idTerpilih ? tl.slot.find((s) => s.id === idTerpilih) : undefined;
  const nFilter = jumlahFilterAktif(state);
  const [sheetFilter, setSheetFilter] = React.useState(false);
  const [pengumuman, setPengumuman] = React.useState("");

  const pilih = (s: Slot) => {
    setPengumuman(`Dipilih: ${labelSlot(s)}`);
    ubah((st) => ({ ...st, blok: { jenis: s.jenis, kategoriId: s.kategoriId, periode: s.periode }, item: null, hal: 1 }), "push");
  };

  const tutupPanel = () => {
    const asal = idTerpilih;
    ubah((s) => ({ ...s, blok: null, item: null, hal: 1 }), "push");
    // Fokus kembali ke balok/sel asal (dok. 05 §3.8).
    requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-fokus-blok="${CSS.escape(asal ?? "")}"]`)?.focus());
  };

  // Navigasi ‹ › per kelompok → baris → kolom; lewati blok kosong saat filter aktif.
  const urutan = React.useMemo(
    () =>
      urutanNavigasi(tl).filter(
        (s) => (state.fokus === "semua" || s.jenis === state.fokus) && (nFilter === 0 || s.jumlah > 0),
      ),
    [tl, state.fokus, nFilter],
  );
  const posisi = slotTerpilih ? urutan.findIndex((s) => s.id === slotTerpilih.id) : -1;
  const navigasi = (arah: 1 | -1) => {
    if (!urutan.length) return;
    const i = posisi < 0 ? (arah === 1 ? 0 : urutan.length - 1) : (posisi + arah + urutan.length) % urutan.length;
    pilih(urutan[i]);
  };

  const daftar =
    props.daftarItem && idTerpilih && props.daftarItem.kunci === `${idTerpilih}#${state.hal}` ? props.daftarItem.data : null;
  const kosongTotal = dataset.metrik.total === 0;
  const jenisRedup: Jenis[] = state.jenis.length === 1 ? (["WB", "ASP"] as const).filter((j) => j !== state.jenis[0]) : [];
  const kolom = dataset.periode.kolom;
  const rentang = kolom.length ? `${kolom[0].label} — ${kolom[kolom.length - 1].label}` : "";
  const reset = () => {
    setQInput("");
    ubah((s) => tanpaFilter(s));
  };

  const legenda = (
    <LegendaPeta
      skala={dataset.skala}
      skalaPenuh={state.skalaPenuh}
      onSkalaPenuh={(v) => ubah((s) => ({ ...s, skalaPenuh: v }))}
      dataContoh={dataset.dataContoh}
    />
  );

  return (
    <>
      {/* Metrik + toolbar: permukaan gelap (dok. 06 §4.4) */}
      <div className="tema-malam">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6">
          <dl className="flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-navy-750 py-3 text-sm" aria-live="polite">
            <div className="flex items-baseline gap-2">
              <dt className="sr-only">Pengajuan publik</dt>
              <dd className="font-display text-2xl font-extrabold text-ivory-50">{formatAngka(dataset.metrik.total)}</dd>
              <span aria-hidden="true" className="text-navy-300">
                pengajuan publik
              </span>
            </div>
            {(["WB", "ASP"] as const).map((j) => {
              const Ikon = IKON_JENIS[j];
              return (
                <div key={j} className="flex items-center gap-1.5">
                  <Ikon className="size-4 text-gold-500" aria-hidden="true" />
                  <dt className="text-navy-300">{j === "WB" ? "Whistleblowing" : "Aspirasi"}</dt>
                  <dd className="font-semibold text-ivory-50">{formatAngka(dataset.metrik.perJenis[j])}</dd>
                </div>
              );
            })}
            <div className="flex items-center gap-1.5">
              <dt className="text-navy-300">Selesai ditindaklanjuti</dt>
              <dd className="font-semibold text-ivory-50">{formatAngka(dataset.metrik.selesai)}</dd>
            </div>
            {dataset.metrik.diperbaruiTerakhir && (
              <div className="flex items-center gap-1.5 text-navy-300">
                <dt>Diperbarui</dt>
                <dd>{formatTanggal(dataset.metrik.diperbaruiTerakhir)}</dd>
              </div>
            )}
          </dl>
        </div>
        <div className="bg-navy-800">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="hidden lg:block">
                <KontrolFilter state={state} dataset={dataset} ubah={ubah} qInput={qInput} setQInput={setQInput} />
              </div>
              <button
                type="button"
                onClick={() => setSheetFilter(true)}
                className={cn("inline-flex min-h-11 items-center gap-2 rounded-full border border-ivory-100/40 px-4 text-sm font-semibold text-ivory-100 lg:hidden", kelasFokusGelap)}
              >
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filter{nFilter > 0 && ` (${nFilter})`}
              </button>
              <Segmen
                label="Tampilan"
                gelap
                nilai={state.tampilan}
                pilihan={TAMPILAN.map((t) => ({ nilai: t, label: LABEL_TAMPILAN[t] }))}
                onPilih={(t) => ubah((s) => ({ ...s, tampilan: t }))}
              />
            </div>
            <ChipFilter state={state} dataset={dataset} ubah={ubah} onReset={reset} />
          </div>
        </div>
      </div>

      <Dialog open={sheetFilter} onOpenChange={setSheetFilter}>
        <DialogContent className="tema-malam top-auto bottom-0 max-w-full translate-y-0 rounded-b-none bg-navy-800 p-5 sm:max-w-lg" showCloseButton={false}>
          <DialogTitle className="font-display text-lg font-extrabold text-ivory-50">Filter</DialogTitle>
          <DialogDescription className="text-navy-300">Hanya pengajuan yang telah disetujui untuk publikasi.</DialogDescription>
          <KontrolFilter state={state} dataset={dataset} ubah={ubah} qInput={qInput} setQInput={setQInput} tumpuk />
          <button
            type="button"
            onClick={() => setSheetFilter(false)}
            className={cn("min-h-12 rounded-full bg-gold-500 px-5 font-semibold text-navy-900", kelasFokusGelap)}
          >
            Tampilkan {formatAngka(dataset.metrik.total)} hasil
          </button>
        </DialogContent>
      </Dialog>

      <div className="flex-1 bg-ivory-100">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-start">
          <section aria-labelledby="judul-area-peta" className="min-w-0 flex-1 overflow-hidden rounded-xl border border-ivory-200 bg-ivory-50">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ivory-200 px-4 py-2.5 text-sm">
              <h2 id="judul-area-peta" className="font-semibold text-navy-900">
                {rentang}
                <span className="sr-only">, tampilan {LABEL_TAMPILAN[state.tampilan]}</span>
              </h2>
              <p className="flex items-center gap-3 text-navy-ink-muted">
                <span role="status" className={cn("font-semibold text-navy-700", !memuat && "sr-only")}>
                  {memuat ? "Memperbarui…" : ""}
                </span>
                {state.tampilan === "iso" && (
                  <span className="flex items-center gap-1.5">
                    <MoveHorizontal className="size-4" aria-hidden="true" />
                    Seret untuk memutar
                  </span>
                )}
              </p>
            </div>

            {dataset.periode.dinaikkan && (
              <p role="note" className="border-b border-ivory-200 bg-info-bg px-4 py-2 text-sm text-info">
                Rentang ini terlalu panjang untuk {state.tampilan === "iso" ? "tampilan isometrik" : "satu tampilan"}, jadi periode
                ditampilkan per {dataset.periode.granularitas}.
              </p>
            )}

            <div className={cn("relative transition-opacity", memuat && "opacity-80")}>
              {kosongTotal && (
                <div className="absolute inset-x-4 top-4 z-10 flex flex-wrap items-center gap-3 rounded-lg border border-ivory-200 bg-white/95 p-3 text-sm text-navy-900 shadow-sm">
                  {nFilter > 0 ? (
                    <>
                      <span className="flex-1">Tidak ada pengajuan publik yang cocok dengan filter ini.</span>
                      <button type="button" onClick={reset} className={cn("min-h-11 rounded-full border-2 border-navy-900 px-4 font-semibold", kelasFokusTerang)}>
                        Reset filter
                      </button>
                    </>
                  ) : (
                    <span>Belum ada pengajuan yang dipublikasikan pada periode ini. Pengajuan selalu ditinjau petugas sebelum tampil.</span>
                  )}
                </div>
              )}
              {state.tampilan === "daftar" ? (
                <TampilanDaftar tl={tl} fokus={state.fokus} terpilih={idTerpilih} onPilih={pilih} />
              ) : (
                <KanvasPeta
                  tl={tl}
                  dataset={dataset}
                  tampilan={state.tampilan}
                  fokus={state.fokus}
                  yaw={yaw}
                  setYaw={setYaw}
                  terpilih={idTerpilih}
                  onPilih={pilih}
                  jenisRedup={jenisRedup}
                  gerakDikurangi={gerakDikurangi}
                  className="aspect-(--rasio-peta) max-h-[56svh] min-h-[260px] w-full lg:aspect-auto lg:h-[clamp(360px,calc(100svh-370px),560px)] lg:max-h-none"
                />
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ivory-200 px-4 py-2.5">
              {state.tampilan === "iso" ? (
                <div className="flex items-center gap-1" role="group" aria-label="Sudut pandang">
                  <TombolIkon label="Putar ke kiri" onClick={() => setYaw((y) => jepitYaw(y - LANGKAH_SUDUT))}>
                    <RotateCcw className="size-4" aria-hidden="true" />
                  </TombolIkon>
                  <TombolIkon label="Putar ke kanan" onClick={() => setYaw((y) => jepitYaw(y + LANGKAH_SUDUT))}>
                    <RotateCw className="size-4" aria-hidden="true" />
                  </TombolIkon>
                  {Math.abs(yaw - YAW_AWAL) > 1e-6 && (
                    <button type="button" onClick={() => setYaw(YAW_AWAL)} className={cn("min-h-11 rounded-full px-3 text-sm font-semibold text-navy-900 hover:bg-ivory-100 sm:min-h-9", kelasFokusTerang)}>
                      Reset sudut
                    </button>
                  )}
                </div>
              ) : (
                <span />
              )}
              <Segmen
                label="Fokus kelompok"
                nilai={state.fokus}
                pilihan={FOKUS.map((f) => ({ nilai: f, label: LABEL_FOKUS[f] }))}
                onPilih={(f) => ubah((s) => ({ ...s, fokus: f }))}
              />
            </div>

            <nav aria-label="Navigasi blok" className="flex items-center justify-between gap-2 border-t border-ivory-200 px-2 py-1.5 text-sm">
              <button type="button" onClick={() => navigasi(-1)} className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold text-navy-900 hover:bg-ivory-100", kelasFokusTerang)}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="max-sm:sr-only">Blok sebelumnya</span>
              </button>
              <p className="min-w-0 truncate text-center text-navy-900">
                {slotTerpilih ? (
                  <>
                    <strong>{slotTerpilih.jenis === "WB" ? "Whistleblowing" : "Aspirasi"}</strong> · {slotTerpilih.kategoriLabel} ·{" "}
                    {slotTerpilih.periodeLabel}
                  </>
                ) : (
                  <span className="text-navy-ink-muted">Belum ada blok dipilih</span>
                )}
              </p>
              <button type="button" onClick={() => navigasi(1)} className={cn("inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold text-navy-900 hover:bg-ivory-100", kelasFokusTerang)}>
                <span className="max-sm:sr-only">Blok berikutnya</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </nav>

            <div className="border-t border-ivory-200 px-4 py-4">{legenda}</div>
          </section>

          <PanelDetail
            slot={slotTerpilih}
            daftar={daftar}
            konten={props.konten}
            item={state.item}
            memuat={memuat}
            onTutup={tutupPanel}
            onPilihItem={(kode) => ubah((s) => ({ ...s, item: kode }), "push")}
            onKembali={() => ubah((s) => ({ ...s, item: null }), "push")}
            onHalaman={(hal) => ubah((s) => ({ ...s, hal }), "replace")}
          />
        </div>
      </div>

      <p className="sr-only" aria-live="polite" data-terhidrasi={terhidrasi}>
        {pengumuman}
      </p>
    </>
  );
}

function TombolIkon({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn("grid size-11 place-items-center rounded-full text-navy-900 hover:bg-ivory-100 sm:size-9 pointer-coarse:size-11", kelasFokusTerang)}
    >
      {children}
    </button>
  );
}
