"use client";

import * as React from "react";
import Link from "next/link";
import { Check, CircleCheck, Copy, Download, TriangleAlert } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { JenisPengajuan } from "@/lib/schemas/kiriman";
import { kelasTombolPrimer, kelasTombolSekunder } from "./bidang";

type Props = {
  jenis: JenisPengajuan;
  nomorReferensi: string;
  kodeAkses: string;
  tiruan: boolean;
  lampiranGagal: number;
  tersimpan: boolean;
  setTersimpan: (v: boolean) => void;
  onTutup: () => void;
  /** Dipakai di dialog: navigasi ke pelacakan juga harus menutup dialog. */
  onKePelacakan?: () => void;
};

function TombolSalin({ teks, label }: { teks: string; label: string }) {
  const [disalin, setDisalin] = React.useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(teks);
          setDisalin(true);
          setTimeout(() => setDisalin(false), 2000);
        } catch {
          // Clipboard diblokir: pengguna masih bisa memilih teks atau mengunduh .txt.
        }
      }}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border-2 border-navy-900 px-4 text-sm font-semibold text-navy-900 hover:bg-navy-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
    >
      {disalin ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span aria-live="polite">{disalin ? "Disalin" : "Salin"}</span>
      <span className="sr-only"> {label}</span>
    </button>
  );
}

/** Layar berhasil (dok. 02 §5.4, dok. 05 §2.7). Kredensial hanya ada di state komponen. */
export function KredensialBerhasil(p: Props) {
  const judulRef = React.useRef<HTMLHeadingElement>(null);
  React.useEffect(() => {
    judulRef.current?.focus();
  }, []);

  const unduh = () => {
    const isi = [
      "Kredensial pelacakan",
      "",
      `Nomor Referensi : ${p.nomorReferensi}`,
      `Kode Akses      : ${p.kodeAkses}`,
      "",
      "Simpan berkas ini di tempat pribadi. Siapa pun yang memegang kedua kode ini dapat melihat status kiriman Anda.",
      p.tiruan ? "\nCONTOH — prototipe, kiriman tidak disimpan." : "",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([isi], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `kredensial-${p.nomorReferensi}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-5 pb-5">
      {p.tiruan && (
        <p className="rounded-lg border-2 border-dashed border-warn bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
          CONTOH — prototipe. Kiriman tidak disimpan dan kode di bawah tidak dapat dipakai untuk melacak.
        </p>
      )}
      <div className="flex items-start gap-3">
        <CircleCheck className="mt-1 size-7 shrink-0 text-ok" aria-hidden="true" />
        <div>
          <h3 ref={judulRef} tabIndex={-1} className="font-display text-2xl font-extrabold text-navy-900 outline-none">
            {p.jenis === "pelanggaran" ? "Laporan diterima untuk ditinjau." : "Aspirasi diterima untuk ditinjau."}
          </h3>
          <p className="mt-1 text-base text-navy-ink-muted">
            {p.jenis === "pelanggaran" ? "Laporan" : "Aspirasi"} Anda <strong className="font-semibold text-navy-900">belum dipublikasikan</strong>.
            Petugas akan meninjaunya terlebih dahulu.
          </p>
        </div>
      </div>

      {p.lampiranGagal > 0 && (
        <p role="status" className="rounded-lg border border-warn/40 bg-warn-bg p-3 text-sm text-warn">
          Kiriman Anda <strong>sudah terkirim</strong>, tetapi {p.lampiranGagal} lampiran gagal diunggah. Anda dapat
          menambahkannya dari halaman pelacakan.
        </p>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold text-navy-900">Simpan dua kode ini sekarang.</p>
        <p className="text-sm text-navy-ink-muted">
          Keduanya diperlukan untuk melihat perkembangan dan menjawab pertanyaan petugas.{" "}
          <strong className="font-semibold text-navy-900">Kami tidak dapat menampilkan atau memulihkan kode ini lagi.</strong>
        </p>
      </div>

      <dl className="flex flex-col gap-3 rounded-xl border-2 border-navy-900 bg-ivory-100 p-4">
        {(
          [
            ["Nomor Referensi", p.nomorReferensi],
            ["Kode Akses", p.kodeAkses],
          ] as const
        ).map(([label, nilai]) => (
          <div key={label} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <dt className="text-sm font-semibold text-navy-ink-muted">{label}</dt>
              {/* Patahkan baris hanya di tanda hubung, tidak di tengah kelompok 4 karakter. */}
              <dd className="font-mono text-base font-semibold tracking-[0.06em] text-navy-900 sm:text-lg">
                {nilai.split("-").map((g, i, arr) => (
                  <span key={i} className="whitespace-nowrap">
                    {g}
                    {i < arr.length - 1 && "-"}
                    {i < arr.length - 1 && <wbr />}
                  </span>
                ))}
              </dd>
            </div>
            <TombolSalin teks={nilai} label={label} />
          </div>
        ))}
      </dl>

      <button type="button" onClick={unduh} className={cn(kelasTombolSekunder, "w-fit")}>
        <Download className="size-4" aria-hidden="true" />
        Unduh sebagai file .txt
      </button>

      <p className="flex items-start gap-2 text-sm text-navy-900">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warn" aria-hidden="true" />
        Siapa pun yang memegang kedua kode ini dapat melihat status kiriman Anda. Simpan di tempat pribadi, jangan di perangkat
        kantor atau perangkat bersama, dan jangan kirim lewat chat kerja.
      </p>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ivory-200 bg-white p-3 text-base font-semibold text-navy-900">
        <Checkbox
          checked={p.tersimpan}
          onCheckedChange={(v) => p.setTersimpan(v === true)}
          className="mt-0.5 size-5 border-ink-border data-checked:border-navy-900 data-checked:bg-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500"
        />
        Saya sudah menyimpan kode ini
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/lacak"
          onClick={(e) => {
            if (!p.tersimpan) return e.preventDefault();
            p.onKePelacakan?.();
          }}
          aria-disabled={!p.tersimpan}
          className={cn(kelasTombolSekunder, !p.tersimpan && "pointer-events-none opacity-60")}
        >
          Buka pelacakan
        </Link>
        <button type="button" onClick={p.onTutup} disabled={!p.tersimpan} className={kelasTombolPrimer}>
          Selesai &amp; tutup
        </button>
      </div>
      {!p.tersimpan && <p className="text-right text-sm text-navy-ink-muted">Centang konfirmasi di atas untuk menutup.</p>}
    </div>
  );
}
