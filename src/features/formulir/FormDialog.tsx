"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
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
import { useAnimasiOpsional } from "@/lib/animasi/AnimasiProvider";
import type { KategoriPublik } from "@/lib/schemas/publik";
import type { JenisPengajuan } from "@/lib/schemas/kiriman";
import { kelasTombolPrimer, kelasTombolSekunder } from "./bidang";
import { useDrafForm } from "./DrafFormProvider";
import { FormPengajuan } from "./FormPengajuan";

/** Tinggi area yang benar-benar terlihat (di atas keyboard virtual) sebagai CSS var `--vvh`. */
function useTinggiViewport(ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const atur = () => ref.current?.style.setProperty("--vvh", `${vv.height}px`);
    atur();
    vv.addEventListener("resize", atur);
    return () => vv.removeEventListener("resize", atur);
  }, [ref]);
}

/**
 * Form pengajuan sebagai dialog (intercepting route `/kirim/[jenis]`, dok. 05 §2.7).
 * Desktop: dialog 720px. Mobile: layar penuh setinggi viewport yang terlihat.
 */
export function FormDialog({ jenis, kategori }: { jenis: JenisPengajuan; kategori: KategoriPublik[] }) {
  const router = useRouter();
  const draf = useDrafForm();
  const animasi = useAnimasiOpsional();
  const kontenRef = React.useRef<HTMLDivElement>(null);
  const pemicu = React.useRef<HTMLElement | null>(null);
  // Kunci sesi form. Next 16 mempertahankan state rute yang pernah dikunjungi (React
  // Activity), jadi dialog yang dibuka lagi bisa menampilkan state lama. Setelah selesai,
  // buang isian, atau ke pelacakan, kunci diganti agar form (termasuk kredensial) bersih.
  const [sesi, setSesi] = React.useState(0);
  const [konfirmasi, setKonfirmasi] = React.useState(false);
  const kotor = React.useRef(false);
  const bolehTutup = React.useRef(true);
  const idJudul = `judul-form-${jenis}`;
  useTinggiViewport(kontenRef);

  // Ingat tombol pemicu untuk mengembalikan fokus. Safari tidak memfokuskan tautan saat
  // diklik, jadi gunakan tautan di beranda sebagai cadangan.
  React.useEffect(() => {
    const aktif = document.activeElement as HTMLElement | null;
    pemicu.current =
      aktif && aktif !== document.body ? aktif : document.querySelector<HTMLElement>(`a[href="/kirim/${jenis}"]`);
  }, [jenis]);

  // Animasi dekoratif beranda berhenti selama dialog terbuka.
  const setDialogTerbuka = animasi?.setDialogTerbuka;
  React.useEffect(() => {
    setDialogTerbuka?.(true);
    return () => setDialogTerbuka?.(false);
  }, [setDialogTerbuka]);

  /** Ganti kunci setelah rute tersembunyi, agar tidak terlihat form kosong berkedip. */
  const bersihkanSesi = React.useCallback(() => {
    kotor.current = false;
    bolehTutup.current = true;
    setTimeout(() => {
      // Hapus draf di sini, bukan sebelumnya: instance lama masih bisa menyimpan ulang
      // drafnya saat Activity menjalankan ulang effect ketika rute disembunyikan.
      draf.hapus(jenis);
      setSesi((n) => n + 1);
    }, 150);
  }, [draf, jenis]);

  const tutup = React.useCallback(
    (bersihkan: boolean) => {
      const kembali = pemicu.current;
      router.back();
      if (bersihkan) bersihkanSesi();
      // Halaman di belakang tetap terpasang (parallel route), jadi tombolnya masih ada.
      setTimeout(() => kembali?.focus(), 50);
    },
    [router, bersihkanSesi],
  );

  const mintaTutup = () => {
    if (!bolehTutup.current) return; // layar berhasil belum dikonfirmasi
    if (kotor.current) setKonfirmasi(true);
    else tutup(true);
  };

  const buangDanTutup = () => {
    kotor.current = false;
    setKonfirmasi(false);
    tutup(true);
  };

  return (
    // Selalu terbuka: dialog hilang karena rute tersembunyi saat navigasi kembali.
    <DialogPrimitive.Root open onOpenChange={(o) => !o && mintaTutup()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm data-open:animate-in data-open:fade-in-0" />
        <DialogPrimitive.Content
          ref={kontenRef}
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            kontenRef.current?.querySelector<HTMLElement>("[data-judul-form]")?.focus();
          }}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className="fixed inset-x-0 top-0 z-50 flex h-[var(--vvh,100dvh)] flex-col overflow-hidden bg-ivory-50 outline-none md:inset-x-auto md:top-1/2 md:left-1/2 md:h-auto md:max-h-[min(88svh,860px)] md:w-[720px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:shadow-2xl data-open:animate-in data-open:fade-in-0 md:data-open:zoom-in-95"
        >
          <FormPengajuan
            key={sesi}
            jenis={jenis}
            kategori={kategori}
            idJudul={idJudul}
            judulSebagai={DialogPrimitive.Title}
            onKotorBerubah={(k) => {
              kotor.current = k;
            }}
            onBolehTutupBerubah={(b) => {
              bolehTutup.current = b;
            }}
            onSelesai={() => tutup(true)}
            onKePelacakan={() => {
              // Navigasi lunak ke /lacak: slot @modal dikosongkan oleh catch-all.
              bersihkanSesi();
            }}
            slotTutup={
              <button
                type="button"
                onClick={mintaTutup}
                className="grid size-11 shrink-0 place-items-center rounded-full text-ivory-100 hover:bg-ivory-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
                aria-label="Tutup formulir"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            }
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>

      <AlertDialog open={konfirmasi} onOpenChange={setKonfirmasi}>
        <AlertDialogContent className="z-[60] bg-ivory-50 text-navy-900">
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
            <AlertDialogAction onClick={buangDanTutup} className={kelasTombolSekunder}>
              Buang isian
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DialogPrimitive.Root>
  );
}
