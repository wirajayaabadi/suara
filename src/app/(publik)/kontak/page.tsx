import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock, TriangleAlert } from "lucide-react";
import { Bagian, HalamanInfo, P } from "@/components/tata-letak/HalamanInfo";
import { KONTAK } from "@/lib/kontak";

export const metadata: Metadata = { title: "Kontak", description: "Kontak resmi pengelola dan kontak darurat." };

function Baris({ ikon: Ikon, label, nilai, href }: { ikon: typeof Mail; label: string; nilai: string | null; href?: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Ikon className="mt-0.5 size-5 shrink-0 text-navy-700" aria-hidden="true" />
      <div>
        <dt className="text-sm font-semibold text-navy-ink-muted">{label}</dt>
        <dd className="text-base font-medium">
          {nilai ? (
            href ? (
              <a href={href} className="rounded underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900">
                {nilai}
              </a>
            ) : (
              nilai
            )
          ) : (
            <span className="text-navy-ink-muted italic">Belum diisi</span>
          )}
        </dd>
      </div>
    </div>
  );
}

export default function Halaman() {
  const kosong = Object.values(KONTAK).some((v) => v === null);
  return (
    <HalamanInfo
      judul="Kontak"
      pengantar="Kontak resmi pengelola untuk pertanyaan umum dan kontak darurat."
      catatanDraf={kosong ? "DRAF — data kontak belum diisi pengelola. Isi di src/lib/kontak.ts sebelum dipakai publik." : undefined}
    >
      <Bagian id="pengelola" judul={KONTAK.namaOrganisasi ?? "Pengelola"}>
        <dl className="divide-y divide-ivory-200 rounded-xl border border-ivory-200 bg-white px-4">
          <Baris ikon={Mail} label="Email" nilai={KONTAK.email} href={KONTAK.email ? `mailto:${KONTAK.email}` : undefined} />
          <Baris ikon={Phone} label="Telepon" nilai={KONTAK.telepon} href={KONTAK.telepon ? `tel:${KONTAK.telepon.replace(/[^\d+]/g, "")}` : undefined} />
          <Baris ikon={MapPin} label="Alamat" nilai={KONTAK.alamat} />
          <Baris ikon={Clock} label="Jam layanan" nilai={KONTAK.jamLayanan} />
        </dl>
        <P>
          Jangan mengirim isi laporan lewat email atau telepon biasa. Gunakan form pengiriman agar kiriman Anda terlindungi dan dapat dilacak.
        </P>
      </Bagian>

      <Bagian id="darurat" judul="Kontak darurat">
        <div className="flex items-start gap-3 rounded-xl border-2 border-navy-900 bg-ivory-100 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-base leading-relaxed">
              Bila ada ancaman terhadap keselamatan Anda atau orang lain, <strong>jangan menunggu balasan dari sistem ini</strong>. Hubungi
              layanan darurat setempat atau kontak darurat berikut.
            </p>
            <p className="text-base font-semibold">{KONTAK.darurat ?? <span className="font-normal text-navy-ink-muted italic">Belum diisi</span>}</p>
          </div>
        </div>
      </Bagian>
    </HalamanInfo>
  );
}
