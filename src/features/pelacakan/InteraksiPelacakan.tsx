"use client";

import * as React from "react";
import { CircleAlert, CircleCheck, Paperclip, Send, Undo2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Bidang, Penghitung, kelasTextarea, kelasTombolPrimer, kelasTombolSekunder } from "@/features/formulir/bidang";
import { ATURAN_LAMPIRAN, EKSTENSI_LAMPIRAN, TIPE_LAMPIRAN } from "@/lib/schemas/kiriman";
import { MAKS_BALASAN } from "@/lib/schemas/pelacakan";
import { cn } from "@/lib/utils";
import { kirimBalasan, tambahLampiran, tarikIzin, type StateAksi } from "./aksi";

/* Bagian interaktif halaman pelacakan. Tidak ada aksi yang menerima ID kiriman. */

function Umpan({ state }: { state: StateAksi }) {
  if (!state.galat && !state.pesan) return null;
  return state.galat ? (
    <p role="alert" className="flex items-start gap-1.5 text-sm font-medium text-err">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {state.galat}
    </p>
  ) : (
    <p role="status" className="flex items-center gap-1.5 text-sm font-semibold text-ok">
      <CircleCheck className="size-4" aria-hidden="true" />
      {state.pesan}
    </p>
  );
}

export function FormBalasan({ butuhInfo }: { butuhInfo: boolean }) {
  const [state, aksi, memproses] = React.useActionState<StateAksi, FormData>(kirimBalasan, {});
  const [isi, setIsi] = React.useState("");
  const [kunciLama, setKunciLama] = React.useState(state.kunci);
  // Balasan terkirim: kosongkan field (pola “simpan state sebelumnya”, tanpa effect).
  if (state.kunci !== kunciLama) {
    setKunciLama(state.kunci);
    if (state.ok) setIsi("");
  }
  return (
    <form action={aksi} className="flex flex-col gap-2">
      <Bidang
        id="balasan"
        label={butuhInfo ? "Jawab pertanyaan petugas" : "Tulis balasan"}
        wajib
        petunjuk="Jangan menyebut nama orang atau data pribadi yang tidak diperlukan."
        galat={state.galat}
      >
        {(aria) => (
          <textarea
            {...aria}
            name="isi"
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            maxLength={MAKS_BALASAN + 50}
            className={cn(kelasTextarea, "min-h-28")}
          />
        )}
      </Bidang>
      <div className="flex items-center justify-between gap-3">
        {state.ok ? <Umpan state={state} /> : <span />}
        <Penghitung nilai={isi} maks={MAKS_BALASAN} />
      </div>
      <button type="submit" disabled={memproses} className={cn(kelasTombolPrimer, "w-fit")}>
        <Send className="size-4" aria-hidden="true" />
        {memproses ? "Mengirim…" : "Kirim balasan"}
      </button>
    </form>
  );
}

export function TambahLampiran({ sisa, jenis }: { sisa: number; jenis: "WB" | "ASP" }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<StateAksi>({});
  const [memproses, startTransition] = React.useTransition();
  const aturan = jenis === "WB" ? ATURAN_LAMPIRAN.pelanggaran : ATURAN_LAMPIRAN.aspirasi;

  const pilih = (files: FileList | null) => {
    const daftar = [...(files ?? [])];
    if (inputRef.current) inputRef.current.value = "";
    if (!daftar.length) return;
    if (daftar.length > sisa) return setState({ galat: `Anda hanya dapat menambah ${sisa} lampiran lagi.` });
    for (const f of daftar) {
      if (!TIPE_LAMPIRAN[f.type]) return setState({ galat: `File “${f.name}” tidak dapat diunggah. Gunakan JPG, PNG, WebP, atau PDF.` });
      if (f.size > aturan.maksPerFile) return setState({ galat: `File “${f.name}” lebih dari 10 MB.` });
    }
    // Prototipe: hanya ekstensi yang dikirim. Isi dan nama file tidak meninggalkan perangkat.
    const ekstensi = daftar.map((f) => {
      const e = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      return EKSTENSI_LAMPIRAN.includes(e) ? e : f.type === "application/pdf" ? ".pdf" : ".jpg";
    });
    startTransition(async () => setState(await tambahLampiran(ekstensi)));
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        className={cn(
          kelasTombolSekunder,
          "w-fit cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold-500",
          (sisa === 0 || memproses) && "pointer-events-none opacity-60",
        )}
      >
        <Paperclip className="size-4" aria-hidden="true" />
        {memproses ? "Menambahkan…" : "Tambah lampiran"}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={EKSTENSI_LAMPIRAN.join(",")}
          disabled={sisa === 0 || memproses}
          onChange={(e) => pilih(e.target.files)}
          className="sr-only"
        />
      </label>
      <p className="text-sm text-navy-ink-muted">
        {sisa === 0 ? "Batas jumlah lampiran sudah tercapai." : `JPG, PNG, WebP, atau PDF, maks. 10 MB per file. Sisa ${sisa} file.`}
      </p>
      <Umpan state={state} />
    </div>
  );
}

export function TarikIzin({ jenis }: { jenis: "WB" | "ASP" }) {
  const [buka, setBuka] = React.useState(false);
  const [state, setState] = React.useState<StateAksi>({});
  const [memproses, startTransition] = React.useTransition();
  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => setBuka(true)} className={cn(kelasTombolSekunder, "w-fit")}>
        <Undo2 className="size-4" aria-hidden="true" />
        Tarik izin publikasi
      </button>
      <Umpan state={state} />
      <AlertDialog open={buka} onOpenChange={setBuka}>
        <AlertDialogContent className="bg-ivory-50 text-navy-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-extrabold text-navy-900">Tarik izin publikasi?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-navy-ink-muted">
              {jenis === "WB" ? "Ringkasan tersamar" : "Aspirasi"} Anda akan dihapus dari halaman publik dan tidak dapat dipublikasikan
              lagi. Penanganan kiriman tetap berjalan. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 border-ivory-200 bg-ivory-100">
            <AlertDialogCancel autoFocus className={kelasTombolSekunder}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={memproses}
              onClick={() => startTransition(async () => setState(await tarikIzin()))}
              className={kelasTombolPrimer}
            >
              Ya, tarik izin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
