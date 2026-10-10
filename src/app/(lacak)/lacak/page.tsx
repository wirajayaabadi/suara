import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleCheck, ShieldCheck } from "lucide-react";
import { FormMasuk } from "@/features/pelacakan/FormMasuk";
import { sumberData } from "@/server/dal/publik";

export const metadata: Metadata = { title: "Lacak Kiriman" };

/** Masuk pelacakan (dok. 02 §4.2, §5.5). Halaman statis; kredensial hanya dikirim lewat POST. */
export default function Halaman({ searchParams }: PageProps<"/lacak">) {
  const contoh = sumberData() === "contoh";
  return (
    <div className="mx-auto flex w-full max-w-[560px] flex-col gap-6 px-4 py-10 sm:py-14">
      <Suspense>
        <PemberitahuanKeluar searchParams={searchParams} />
      </Suspense>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold text-navy-900">Lacak Kiriman</h1>
        <p className="text-base leading-relaxed text-navy-ink-muted">
          Masukkan Nomor Referensi dan Kode Akses yang Anda simpan saat mengirim. Anda dapat melihat perkembangan, membalas
          pertanyaan petugas, menambah lampiran, atau menarik izin publikasi.
        </p>
      </div>

      {contoh && (
        <p className="rounded-lg border-2 border-dashed border-warn bg-warn-bg px-3 py-2 text-sm font-semibold text-warn">
          CONTOH — prototipe. Gunakan salah satu kredensial uji di README (bagian “Data contoh”). Kode dari form tiruan tidak dapat
          dipakai di sini.
        </p>
      )}

      <div className="rounded-2xl border border-ivory-200 bg-white p-5 sm:p-6">
        <FormMasuk />
      </div>

      <details className="group rounded-lg border border-ivory-200 bg-ivory-100 p-4 text-sm text-navy-900">
        <summary className="cursor-pointer font-semibold marker:text-navy-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
          Kehilangan Kode Akses?
        </summary>
        <div className="mt-2 flex flex-col gap-2 leading-relaxed text-navy-ink-muted">
          <p>
            Kode Akses tidak dapat dipulihkan karena kami tidak menyimpannya dalam bentuk yang dapat dibaca dan Anda tidak perlu
            membuat akun.
          </p>
          <p>
            Anda dapat mengirim kiriman baru dan menyebut Nomor Referensi lama di uraian. Petugas dapat menautkan keduanya tanpa
            perlu mengetahui siapa Anda.
          </p>
        </div>
      </details>

      <p className="flex items-start gap-2 text-sm text-navy-ink-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-navy-700" aria-hidden="true" />
        Gunakan perangkat pribadi. Sesi pelacakan berakhir otomatis setelah 30 menit tanpa aktivitas, dan setelah beberapa kali
        salah memasukkan kode, pelacakan dikunci sementara.
      </p>
    </div>
  );
}

async function PemberitahuanKeluar({ searchParams }: Pick<PageProps<"/lacak">, "searchParams">) {
  const { keluar } = await searchParams;
  if (keluar !== "1") return null;
  return (
    <p role="status" className="flex items-center gap-2 rounded-lg border border-ok/30 bg-ok-bg px-3 py-2 text-sm font-semibold text-ok">
      <CircleCheck className="size-4" aria-hidden="true" />
      Anda sudah keluar dari pelacakan.
    </p>
  );
}
