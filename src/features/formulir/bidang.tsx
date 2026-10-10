"use client";

import * as React from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Gaya kontrol form (dok. 06 §4.3): latar putih, border `ink-border` (≥ 3:1), teks 16px
 * agar iOS tidak zoom, fokus = border navy 2px + cincin emas. Galat = border merah + ikon + teks.
 */
export const kelasKontrol =
  "w-full rounded-lg border border-ink-border bg-white px-3 text-base text-navy-900 placeholder:text-navy-ink-muted/80 transition-colors hover:border-navy-700 focus-visible:border-2 focus-visible:border-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 aria-invalid:border-2 aria-invalid:border-err disabled:cursor-not-allowed disabled:bg-field-disabled disabled:text-navy-ink-muted";

export const kelasInput = cn(kelasKontrol, "h-11");
export const kelasTextarea = cn(kelasKontrol, "min-h-36 py-2.5 leading-relaxed");

export const kelasTombolPrimer =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-navy-900 px-5 text-sm font-semibold text-ivory-50 transition-colors hover:bg-navy-750 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:cursor-not-allowed disabled:opacity-60";
export const kelasTombolSekunder =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-navy-900 bg-transparent px-5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500 disabled:cursor-not-allowed disabled:opacity-60";
export const kelasTautan =
  "rounded font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

type PropsBidang = {
  id: string;
  label: React.ReactNode;
  wajib?: boolean;
  /** “Wajib dipilih” untuk pilihan yang wajib dijawab. */
  labelWajib?: string;
  petunjuk?: React.ReactNode;
  galat?: string;
  /** Render prop: menerima id deskripsi untuk `aria-describedby`. */
  children: (aria: { "aria-describedby"?: string; "aria-invalid"?: boolean; id: string }) => React.ReactNode;
  className?: string;
  /** Untuk grup (radio/checkbox): pakai fieldset + legend. */
  grup?: boolean;
};

export function Bidang({ id, label, wajib, labelWajib, petunjuk, galat, children, className, grup }: PropsBidang) {
  const idPetunjuk = petunjuk ? `${id}-petunjuk` : undefined;
  const idGalat = galat ? `${id}-galat` : undefined;
  const describedBy = [idPetunjuk, idGalat].filter(Boolean).join(" ") || undefined;
  const penanda = wajib ? (
    <span className="ml-2 text-xs font-semibold tracking-wide text-gold-800 uppercase">{labelWajib ?? "Wajib"}</span>
  ) : (
    <span className="ml-2 text-sm font-normal text-navy-ink-muted">(opsional)</span>
  );
  const isi = (
    <>
      {petunjuk && (
        <p id={idPetunjuk} className="text-sm leading-relaxed text-navy-ink-muted">
          {petunjuk}
        </p>
      )}
      {children({ id, "aria-describedby": describedBy, "aria-invalid": galat ? true : undefined })}
      {galat && (
        <p id={idGalat} className="flex items-start gap-1.5 text-sm font-medium text-err">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{galat}</span>
        </p>
      )}
    </>
  );
  if (grup) {
    return (
      <fieldset className={cn("flex flex-col gap-1.5", className)} aria-describedby={describedBy}>
        <legend className="mb-1.5 text-base font-semibold text-navy-900">
          {label}
          {penanda}
        </legend>
        {isi}
      </fieldset>
    );
  }
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-base font-semibold text-navy-900">
        {label}
        {penanda}
      </label>
      {isi}
    </div>
  );
}

/** Penghitung karakter; diumumkan pembaca layar hanya saat mendekati batas. */
export function Penghitung({ nilai, maks }: { nilai: string; maks: number }) {
  const n = nilai?.length ?? 0;
  const dekat = n >= maks * 0.9;
  return (
    <p className={cn("self-end text-xs tabular-nums", n > maks ? "font-semibold text-err" : "text-navy-ink-muted")}>
      <span aria-hidden="true">
        {n.toLocaleString("id-ID")}/{maks.toLocaleString("id-ID")}
      </span>
      <span className="sr-only" aria-live={dekat ? "polite" : "off"}>
        {dekat ? `${n} dari ${maks} karakter` : ""}
      </span>
    </p>
  );
}
