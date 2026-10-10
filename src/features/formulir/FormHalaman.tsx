"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
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
import type { KategoriPublik } from "@/lib/schemas/publik";
import type { JenisPengajuan } from "@/lib/schemas/kiriman";
import { kelasTombolPrimer, kelasTombolSekunder } from "./bidang";
import { useDrafForm } from "./DrafFormProvider";
import { FormPengajuan } from "./FormPengajuan";

/** Form sebagai halaman penuh: dibuka lewat tautan langsung atau setelah refresh. */
export function FormHalaman({ jenis, kategori }: { jenis: JenisPengajuan; kategori: KategoriPublik[] }) {
  const router = useRouter();
  const draf = useDrafForm();
  const kotor = React.useRef(false);
  const bolehTutup = React.useRef(true);
  const [konfirmasi, setKonfirmasi] = React.useState(false);

  const keBeranda = () => router.push("/");
  const mintaTutup = () => {
    if (!bolehTutup.current) return;
    if (kotor.current) setKonfirmasi(true);
    else keBeranda();
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-1 flex-col overflow-hidden md:my-8 md:rounded-2xl md:border md:border-ivory-200 md:shadow-lg">
      <FormPengajuan
        jenis={jenis}
        kategori={kategori}
        idJudul={`judul-form-${jenis}`}
        onKotorBerubah={(k) => {
          kotor.current = k;
        }}
        onBolehTutupBerubah={(b) => {
          bolehTutup.current = b;
        }}
        onSelesai={keBeranda}
        slotTutup={
          <button
            type="button"
            onClick={mintaTutup}
            className="grid size-11 shrink-0 place-items-center rounded-full text-ivory-100 hover:bg-ivory-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
            aria-label="Batalkan dan kembali ke beranda"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        }
      />
      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent className="bg-ivory-50 text-navy-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-extrabold text-navy-900">Buang isian?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-navy-ink-muted">
              Isian yang belum dikirim akan hilang dan tidak kami simpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 border-ivory-200 bg-ivory-100">
            <AlertDialogCancel autoFocus className={kelasTombolPrimer}>
              Lanjutkan mengisi
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                draf.hapus(jenis);
                kotor.current = false;
                keBeranda();
              }}
              className={kelasTombolSekunder}
            >
              Buang isian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
