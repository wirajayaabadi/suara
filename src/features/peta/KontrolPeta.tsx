"use client";

import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  JENIS,
  LABEL_JENIS,
  LABEL_STATUS_PUBLIK,
  statusUntukJenis,
  type DatasetPeta,
  type Jenis,
  type Skala,
  type StatusPublik,
} from "@/lib/schemas/publik";
import { cn } from "@/lib/utils";
import { LABEL_PRESET, PRESET_PERIODE, type PilihanPeriode } from "./model/periode";
import { MAKS_Q, type StatePeta } from "./model/url";

/* Kontrol filter, tampilan, dan legenda Peta Suara (dok. 05 §3.6, §3.4; dok. 06 §4.4). */

export const kelasFokusGelap = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";
export const kelasFokusTerang = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

type Ubah = (fn: (s: StatePeta) => StatePeta) => void;

const tanpaPilihan = (s: StatePeta): StatePeta => ({ ...s, hal: 1 });

export function Segmen<T extends string>({
  label,
  nilai,
  pilihan,
  onPilih,
  gelap,
}: {
  label: string;
  nilai: T;
  pilihan: readonly { nilai: T; label: string }[];
  onPilih: (v: T) => void;
  gelap?: boolean;
}) {
  return (
    <div role="group" aria-label={label} className={cn("inline-flex rounded-full p-1", gelap ? "bg-navy-950" : "bg-ivory-100 ring-1 ring-ivory-200")}>
      {pilihan.map((p) => (
        <button
          key={p.nilai}
          type="button"
          aria-pressed={nilai === p.nilai}
          onClick={() => onPilih(p.nilai)}
          className={cn(
            "min-h-11 rounded-full px-3.5 text-sm font-semibold transition-colors sm:min-h-9",
            gelap ? kelasFokusGelap : kelasFokusTerang,
            nilai === p.nilai
              ? gelap
                ? "bg-gold-500 text-navy-900"
                : "bg-navy-900 text-ivory-50"
              : gelap
                ? "text-ivory-100 hover:bg-ivory-100/10"
                : "text-navy-900 hover:bg-ivory-200/60",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function PilihBanyak({
  label,
  kelompok,
  terpilih,
  onUbah,
}: {
  label: string;
  kelompok: { judul: string; opsi: { id: string; label: string }[] }[];
  terpilih: string[];
  onUbah: (id: string, aktif: boolean) => void;
}) {
  const n = terpilih.length;
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold sm:min-h-9",
          kelasFokusGelap,
          n ? "border-gold-500 bg-gold-500 text-navy-900" : "border-ivory-100/40 text-ivory-100 hover:bg-ivory-100/10",
        )}
      >
        {label}
        {n > 0 && <span className="rounded-full bg-navy-900 px-1.5 text-xs text-ivory-50">{n}</span>}
        <ChevronDown className="size-4" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-[60svh] w-80 overflow-y-auto bg-ivory-50 p-3 text-navy-900">
        {kelompok.map((g) => (
          <fieldset key={g.judul} className="flex flex-col gap-1 not-first:mt-3">
            <legend className="mb-1 text-xs font-bold tracking-wide text-gold-800 uppercase">{g.judul}</legend>
            {g.opsi.map((o) => (
              <label key={o.id} className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-1 text-sm hover:bg-ivory-100">
                <Checkbox
                  checked={terpilih.includes(o.id)}
                  onCheckedChange={(v) => onUbah(o.id, v === true)}
                  className="size-4.5 border-ink-border data-checked:border-navy-900 data-checked:bg-navy-900"
                />
                {o.label}
              </label>
            ))}
          </fieldset>
        ))}
      </PopoverContent>
    </Popover>
  );
}

const nilaiPeriode = (p: PilihanPeriode) => (p.preset === "kustom" ? "kustom" : p.preset);

export function KontrolFilter({
  state,
  dataset,
  ubah,
  qInput,
  setQInput,
  tumpuk,
}: {
  state: StatePeta;
  dataset: DatasetPeta;
  ubah: Ubah;
  qInput: string;
  setQInput: (q: string) => void;
  /** Ponsel: kontrol bertumpuk di sheet filter. */
  tumpuk?: boolean;
}) {
  const id = React.useId();
  const jenisAktif = state.jenis.length === 1 ? state.jenis : JENIS;
  const kelompokKategori = dataset.kelompok
    .filter((g) => jenisAktif.includes(g.jenis))
    .map((g) => ({ judul: g.label, opsi: g.kategori.map((k) => ({ id: k.id, label: k.label })) }));
  const kelompokStatus = jenisAktif.map((j) => ({
    judul: LABEL_JENIS[j],
    opsi: statusUntukJenis(j).map((s) => ({ id: s, label: LABEL_STATUS_PUBLIK[s] })),
  }));
  const kustom = state.periode.preset === "kustom" ? state.periode : null;

  const ubahJenis = (j: Jenis, aktif: boolean) =>
    ubah((s) => {
      const kini = s.jenis.length === 1 ? s.jenis : [...JENIS];
      const baru = aktif ? [...new Set([...kini, j])] : kini.filter((x) => x !== j);
      if (baru.length === 0) return s; // minimal satu jenis tetap aktif
      return tanpaPilihan({ ...s, jenis: baru.length === JENIS.length ? [] : baru });
    });

  return (
    <div className={cn("flex gap-2.5 text-ivory-100", tumpuk ? "flex-col items-stretch" : "flex-wrap items-center")}>
      <div className={cn("relative", tumpuk ? "w-full" : "w-full sm:w-64")}>
        <label htmlFor={`${id}-q`} className="sr-only">
          Cari judul atau ringkasan (minimal 3 huruf)
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-navy-ink-muted" aria-hidden="true" />
        <input
          id={`${id}-q`}
          type="search"
          value={qInput}
          maxLength={MAKS_Q}
          onChange={(e) => setQInput(e.target.value)}
          placeholder="Cari judul atau ringkasan"
          className={cn("min-h-11 w-full rounded-full border-0 bg-ivory-50 pr-3 pl-9 text-sm text-navy-900 placeholder:text-navy-ink-muted sm:min-h-9", kelasFokusGelap)}
        />
      </div>

      <fieldset className="flex items-center gap-1">
        <legend className="sr-only">Jenis</legend>
        {JENIS.map((j) => (
          <label key={j} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-2.5 text-sm font-semibold hover:bg-ivory-100/10 sm:min-h-9">
            <Checkbox
              checked={jenisAktif.includes(j)}
              onCheckedChange={(v) => ubahJenis(j, v === true)}
              className="size-4.5 border-ivory-100 data-checked:border-gold-500 data-checked:bg-gold-500 data-checked:text-navy-900 focus-visible:ring-gold-500"
            />
            {LABEL_JENIS[j]}
          </label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <PilihBanyak
          label="Kategori"
          kelompok={kelompokKategori}
          terpilih={state.kategori}
          onUbah={(k, aktif) =>
            ubah((s) => tanpaPilihan({ ...s, kategori: aktif ? [...s.kategori, k] : s.kategori.filter((x) => x !== k) }))
          }
        />
        <PilihBanyak
          label="Status"
          kelompok={kelompokStatus}
          terpilih={state.status}
          onUbah={(st, aktif) =>
            ubah((s) =>
              tanpaPilihan({
                ...s,
                status: aktif ? [...s.status, st as StatusPublik] : s.status.filter((x) => x !== st),
              }),
            )
          }
        />
      </div>

      <div className={cn("flex flex-wrap items-center gap-2", tumpuk && "flex-col items-stretch")}>
        <label htmlFor={`${id}-periode`} className="sr-only">
          Periode
        </label>
        <select
          id={`${id}-periode`}
          value={nilaiPeriode(state.periode)}
          onChange={(e) => {
            const v = e.target.value;
            ubah((s) => ({
              ...s,
              blok: null,
              item: null,
              hal: 1,
              periode:
                v === "kustom"
                  ? { preset: "kustom", dari: `${dataset.periode.kolom[0]?.kunci.slice(0, 4) ?? "2026"}-01`, sampai: dataset.dibuat.slice(0, 7) }
                  : { preset: v as (typeof PRESET_PERIODE)[number] },
            }));
          }}
          className={cn("min-h-11 rounded-full border-0 bg-ivory-50 px-3 text-sm font-semibold text-navy-900 sm:min-h-9", kelasFokusGelap)}
        >
          {PRESET_PERIODE.map((p) => (
            <option key={p} value={p}>
              {LABEL_PRESET[p]}
            </option>
          ))}
          <option value="kustom">Rentang khusus…</option>
        </select>
        {kustom && (
          <span className="flex items-center gap-2 text-sm">
            <label className="flex items-center gap-1.5">
              Dari
              <input
                type="month"
                value={kustom.dari}
                max={kustom.sampai}
                onChange={(e) => e.target.value && ubah((s) => ({ ...s, blok: null, item: null, periode: { ...kustom, dari: e.target.value } }))}
                className={cn("min-h-11 rounded-md bg-ivory-50 px-2 text-navy-900 sm:min-h-9", kelasFokusGelap)}
              />
            </label>
            <label className="flex items-center gap-1.5">
              Sampai
              <input
                type="month"
                value={kustom.sampai}
                min={kustom.dari}
                onChange={(e) => e.target.value && ubah((s) => ({ ...s, blok: null, item: null, periode: { ...kustom, sampai: e.target.value } }))}
                className={cn("min-h-11 rounded-md bg-ivory-50 px-2 text-navy-900 sm:min-h-9", kelasFokusGelap)}
              />
            </label>
          </span>
        )}
      </div>
    </div>
  );
}

/** Chip filter aktif + “Reset filter”. */
export function ChipFilter({ state, dataset, ubah, onReset }: { state: StatePeta; dataset: DatasetPeta; ubah: Ubah; onReset: () => void }) {
  const labelKategori = new Map(dataset.kelompok.flatMap((g) => g.kategori.map((k) => [k.id, `${k.label} (${g.label})`] as const)));
  const chip: { kunci: string; label: string; hapus: (s: StatePeta) => StatePeta }[] = [
    ...state.jenis
      .filter(() => state.jenis.length === 1)
      .map((j) => ({ kunci: `j-${j}`, label: `Hanya ${LABEL_JENIS[j]}`, hapus: (s: StatePeta) => ({ ...s, jenis: [] }) })),
    ...state.kategori.map((k) => ({
      kunci: `k-${k}`,
      label: labelKategori.get(k) ?? k,
      hapus: (s: StatePeta) => ({ ...s, kategori: s.kategori.filter((x) => x !== k) }),
    })),
    ...state.status.map((st) => ({
      kunci: `s-${st}`,
      label: LABEL_STATUS_PUBLIK[st],
      hapus: (s: StatePeta) => ({ ...s, status: s.status.filter((x) => x !== st) }),
    })),
    ...(state.q.length >= 3 ? [{ kunci: "q", label: `“${state.q}”`, hapus: (s: StatePeta) => ({ ...s, q: "" }) }] : []),
  ];
  if (!chip.length) return null;
  return (
    <ul aria-label="Filter aktif" className="flex flex-wrap items-center gap-2">
      {chip.map((c) => (
        <li key={c.kunci}>
          <button
            type="button"
            onClick={() => ubah((s) => ({ ...c.hapus(s), hal: 1 }))}
            className={cn("inline-flex min-h-9 items-center gap-1 rounded-full bg-gold-500 px-3 text-sm font-semibold text-navy-900", kelasFokusGelap)}
          >
            {c.label}
            <X className="size-3.5" aria-hidden="true" />
            <span className="sr-only">— hapus filter</span>
          </button>
        </li>
      ))}
      <li>
        <button type="button" onClick={onReset} className={cn("min-h-9 rounded-full px-3 text-sm font-semibold text-ivory-100 underline underline-offset-4 hover:bg-ivory-100/10", kelasFokusGelap)}>
          Reset filter
        </button>
      </li>
    </ul>
  );
}

/** Contoh balok kecil untuk legenda (warna token kelompok, bukan data). */
function ContohBalok({ jenis }: { jenis: Jenis }) {
  const wb = jenis === "WB";
  return (
    <svg viewBox="0 0 28 28" className="size-7 shrink-0" aria-hidden="true">
      <polygon points="14,3 25,8 14,13 3,8" className={wb ? "fill-wb-atap" : "fill-asp-atap"} />
      <polygon points="3,8 14,13 14,25 3,20" className={wb ? "fill-wb-kiri" : "fill-asp-kiri"} />
      <polygon points="14,13 25,8 25,20 14,25" className={wb ? "fill-wb-kanan" : "fill-asp-kanan"} />
      <g className="fill-none stroke-peta-outline" strokeWidth={0.8} strokeLinejoin="round">
        <polygon points="14,3 25,8 14,13 3,8" />
        <polygon points="3,8 14,13 14,25 3,20" />
        <polygon points="14,13 25,8 25,20 14,25" />
      </g>
      {wb ? (
        <path d="M8,8 L14,5 M11,10 L19,6 M15,11 L21,8" className="stroke-peta-outline" strokeOpacity={0.35} strokeWidth={0.7} />
      ) : (
        <circle cx={14} cy={8} r={1} className="fill-peta-outline" fillOpacity={0.35} />
      )}
    </svg>
  );
}

export function LegendaPeta({
  skala,
  skalaPenuh,
  onSkalaPenuh,
  dataContoh,
}: {
  skala: Skala;
  skalaPenuh: boolean;
  onSkalaPenuh: (v: boolean) => void;
  dataContoh: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-navy-900">
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        <span className="flex items-center gap-2">
          <ContohBalok jenis="WB" /> Whistleblowing (atap bergaris)
        </span>
        <span className="flex items-center gap-2">
          <ContohBalok jenis="ASP" /> Aspirasi (atap bertitik)
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-5 rounded-sm border border-dashed border-ink-border bg-peta-tanah" aria-hidden="true" />
          Belum ada pengajuan publik
        </span>
      </div>
      <p>
        Satu balok = satu kategori dalam satu periode. Tinggi balok menunjukkan jumlah pengajuan yang telah dipublikasikan, bukan
        tingkat keparahan atau kebenaran laporan. Periode dihitung dari tanggal pertama kali dipublikasikan. Ini bukan peta lokasi.
      </p>
      <p className="text-navy-ink-muted">
        Balok setinggi penuh = <strong className="text-navy-900">{skala.batasSkala} pengajuan</strong>. Skala sama untuk kedua
        kelompok; balok berisi sedikit pengajuan tetap diberi tinggi minimum agar terlihat.
      </p>
      {(skala.terpotong || skalaPenuh) && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-ivory-200 bg-ivory-100 p-3">
          <p className="flex-1">
            {skalaPenuh
              ? "Skala penuh: semua balok proporsional terhadap nilai tertinggi."
              : "Ada balok yang jauh lebih tinggi dari lainnya. Balok itu dipotong dan ditandai ≋ beserta angka aslinya."}
          </p>
          <button
            type="button"
            aria-pressed={skalaPenuh}
            onClick={() => onSkalaPenuh(!skalaPenuh)}
            className={cn("min-h-11 rounded-full border-2 border-navy-900 px-4 text-sm font-semibold hover:bg-navy-900/5 sm:min-h-9", kelasFokusTerang)}
          >
            {skalaPenuh ? "Kembali ke skala ringkas" : "Tampilkan skala penuh"}
          </button>
        </div>
      )}
      <p className="text-xs text-navy-ink-muted">
        {dataContoh
          ? "DATA CONTOH — bukan data nyata. "
          : ""}
        Hanya mencakup pengajuan yang telah disetujui untuk publikasi.
      </p>
    </div>
  );
}
