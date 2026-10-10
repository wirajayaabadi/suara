"use client";

import * as React from "react";
import { CircleAlert, Eye, EyeOff, LogIn } from "lucide-react";
import { Bidang, kelasInput, kelasTombolPrimer } from "@/features/formulir/bidang";
import { cn } from "@/lib/utils";
import { masukPelacakan, type StateMasuk } from "./aksi";

/**
 * Form masuk pelacakan (dok. 02 §6: Nomor Referensi + Kode Akses). Dikirim lewat POST
 * (Server Action), tidak pernah lewat URL. Kode Akses tidak dikembalikan ke form setelah gagal.
 */
export function FormMasuk() {
  const [state, aksi, memproses] = React.useActionState<StateMasuk, FormData>(masukPelacakan, {});
  const [tampilKode, setTampilKode] = React.useState(false);
  const galatRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (state.galat) galatRef.current?.focus();
  }, [state]);

  return (
    <form action={aksi} className="flex flex-col gap-5" noValidate>
      {state.galat && (
        <div
          ref={galatRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-err/40 bg-err-bg p-3 text-sm font-medium text-err outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{state.galat}</span>
        </div>
      )}

      <Bidang id="nomorReferensi" label="Nomor Referensi" wajib petunjuk="Contoh: WBS-26-7K3Q-XR9T atau ASP-26-…">
        {(aria) => (
          <input
            {...aria}
            name="nomorReferensi"
            defaultValue={state.nomorReferensi}
            key={state.nomorReferensi}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            required
            maxLength={40}
            className={cn(kelasInput, "font-mono uppercase")}
          />
        )}
      </Bidang>

      <Bidang id="kodeAkses" label="Kode Akses" wajib petunjuk="24 karakter. Tanda hubung dan spasi boleh diketik atau tidak.">
        {(aria) => (
          <div className="flex gap-2">
            <input
              {...aria}
              name="kodeAkses"
              type={tampilKode ? "text" : "password"}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              required
              maxLength={64}
              className={cn(kelasInput, "font-mono")}
            />
            <button
              type="button"
              onClick={() => setTampilKode((v) => !v)}
              aria-pressed={tampilKode}
              className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg border border-ink-border px-3 text-sm font-semibold text-navy-900 hover:bg-ivory-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            >
              {tampilKode ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              {tampilKode ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>
        )}
      </Bidang>

      <button type="submit" disabled={memproses} className={cn(kelasTombolPrimer, "w-full sm:w-fit")}>
        <LogIn className="size-4" aria-hidden="true" />
        {memproses ? "Memeriksa…" : "Masuk ke pelacakan"}
      </button>
    </form>
  );
}
