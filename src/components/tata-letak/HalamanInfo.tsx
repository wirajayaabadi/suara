import Link from "next/link";
import { HeaderPublik } from "@/components/tata-letak/HeaderPublik";

const fokus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

/** Kerangka halaman informasi statis: header gelap + isi terang selebar bacaan (≈ 720px). */
export function HalamanInfo({
  judul,
  pengantar,
  daftarIsi,
  catatanDraf,
  children,
}: {
  judul: string;
  pengantar: string;
  daftarIsi?: { id: string; label: string }[];
  /** Teks peringatan bahwa isi masih draf untuk ditinjau pemilik layanan. */
  catatanDraf?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col">
      <HeaderPublik lebar="max-w-[760px]">
        <h1 className="pt-2 font-display text-3xl font-extrabold text-ivory-50 sm:text-4xl">{judul}</h1>
        <p className="pb-3 text-base leading-relaxed text-navy-300">{pengantar}</p>
      </HeaderPublik>
      <main id="konten" className="flex flex-1 flex-col bg-ivory-50">
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 py-8 text-navy-900 sm:px-6">
          {catatanDraf && (
            <p role="note" className="rounded-lg border-2 border-dashed border-warn bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
              {catatanDraf}
            </p>
          )}
          {daftarIsi && (
            <nav aria-label="Isi halaman" className="rounded-xl border border-ivory-200 bg-ivory-100 p-4">
              <p className="mb-2 text-sm font-bold">Di halaman ini</p>
              <ul className="flex flex-col gap-1 text-sm">
                {daftarIsi.map((d) => (
                  <li key={d.id}>
                    <a href={`#${d.id}`} className={`inline-flex min-h-8 items-center rounded font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 ${fokus}`}>
                      {d.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {children}
          <FooterInfo />
        </div>
      </main>
    </div>
  );
}

export function Bagian({ id, judul, children }: { id: string; judul: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-judul`} className="flex scroll-mt-4 flex-col gap-3">
      <h2 id={`${id}-judul`} className="font-display text-xl font-extrabold sm:text-2xl">
        {judul}
      </h2>
      {children}
    </section>
  );
}

export const P = ({ children }: { children: React.ReactNode }) => <p className="text-base leading-relaxed">{children}</p>;

export function Daftar({ children, urut }: { children: React.ReactNode; urut?: boolean }) {
  const Tag = urut ? "ol" : "ul";
  return <Tag className={`flex flex-col gap-2 pl-5 text-base leading-relaxed marker:text-navy-700 ${urut ? "list-decimal" : "list-disc"}`}>{children}</Tag>;
}

function FooterInfo() {
  const tautan = "rounded font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 " + fokus;
  return (
    <p className="border-t border-ivory-200 pt-4 text-sm text-navy-ink-muted">
      Masih ragu? Baca <Link href="/faq" className={tautan}>pertanyaan umum</Link>, <Link href="/panduan" className={tautan}>panduan</Link>,
      {" "}atau <Link href="/kerahasiaan" className={tautan}>penjelasan kerahasiaan</Link>.
    </p>
  );
}
