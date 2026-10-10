import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Bagian, Daftar, HalamanInfo, P } from "@/components/tata-letak/HalamanInfo";

export const metadata: Metadata = {
  title: "Panduan",
  description: "Cara menyampaikan laporan dan aspirasi yang berguna, serta apa yang terjadi setelah Anda mengirim.",
};

const DAFTAR_ISI = [
  { id: "jenis", label: "Laporan atau aspirasi?" },
  { id: "cara-kerja", label: "Cara kerjanya" },
  { id: "berguna", label: "Apa yang membuat kiriman berguna" },
  { id: "setelah", label: "Setelah Anda mengirim" },
];

const STATUS = [
  ["Diterima", "Kiriman masuk dan belum dibuka petugas."],
  ["Sedang ditinjau", "Petugas membaca dan memilah kiriman Anda."],
  ["Membutuhkan informasi dari Anda", "Petugas mengajukan pertanyaan. Jawab lewat halaman pelacakan."],
  ["Sedang ditindaklanjuti", "Kiriman sedang ditangani."],
  ["Selesai ditangani", "Penanganan selesai."],
  ["Ditutup", "Kiriman tidak dapat diproses, misalnya digabung dengan yang serupa atau di luar lingkup. Alasannya disampaikan lewat pesan."],
] as const;

const tombol = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500";

export default function Halaman() {
  return (
    <HalamanInfo
      judul="Panduan"
      pengantar="Cara menyampaikan laporan dan aspirasi yang berguna, serta apa yang terjadi setelah Anda mengirim."
      daftarIsi={DAFTAR_ISI}
    >
      <Bagian id="jenis" judul="Laporan atau aspirasi?">
        <div className="grid gap-3 sm:grid-cols-2">
          <article className="flex flex-col gap-2 rounded-xl border-2 border-navy-900 bg-ivory-100 p-4">
            <h3 className="font-display text-lg font-extrabold">Laporkan Pelanggaran</h3>
            <p className="text-base leading-relaxed">Dugaan pelanggaran, misalnya pungutan tidak resmi atau penyalahgunaan wewenang.</p>
            <p className="text-sm text-navy-ink-muted">
              <strong className="text-navy-900">Rahasia.</strong> Hanya ringkasan tersamar yang bisa dipublikasikan, dan hanya dengan izin Anda.
            </p>
            <Link href="/kirim/pelanggaran" className={`mt-1 inline-flex min-h-11 w-fit items-center rounded-full bg-navy-900 px-5 text-sm font-semibold text-ivory-50 hover:bg-navy-750 ${tombol}`}>
              Laporkan Pelanggaran
            </Link>
          </article>
          <article className="flex flex-col gap-2 rounded-xl border border-ivory-200 bg-white p-4">
            <h3 className="font-display text-lg font-extrabold">Sampaikan Aspirasi</h3>
            <p className="text-base leading-relaxed">Usulan, saran, atau keluhan layanan untuk perbaikan.</p>
            <p className="text-sm text-navy-ink-muted">
              <strong className="text-navy-900">Dapat dipublikasikan</strong> setelah petugas menghapus informasi pribadi, bila Anda mengizinkan.
            </p>
            <Link href="/kirim/aspirasi" className={`mt-1 inline-flex min-h-11 w-fit items-center rounded-full border-2 border-navy-900 px-5 text-sm font-semibold hover:bg-navy-900/5 ${tombol}`}>
              Sampaikan Aspirasi
            </Link>
          </article>
        </div>
        <P>Ragu memilih? Jika menyangkut dugaan pelanggaran oleh seseorang, pilih laporan. Jika berupa usulan perbaikan, pilih aspirasi.</P>
      </Bagian>

      <Bagian id="cara-kerja" judul="Cara kerjanya">
        <ol className="flex flex-col gap-3">
          {[
            ["Tulis kiriman Anda", "Isi form lima langkah. Anda tidak perlu membuat akun, dan identitas tidak wajib."],
            ["Simpan dua kode", "Anda menerima Nomor Referensi dan Kode Akses. Keduanya hanya ditampilkan sekali dan tidak dapat dipulihkan."],
            ["Petugas meninjau", "Petugas membaca, memilah, dan menanganinya. Bila perlu, petugas mengajukan pertanyaan lewat halaman pelacakan."],
            ["Pantau perkembangan", "Masuk ke pelacakan dengan kedua kode untuk melihat status, membalas pesan, atau menambah lampiran."],
          ].map(([j, d], i) => (
            <li key={j} className="flex gap-3">
              <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-navy-900 font-display text-sm font-extrabold text-ivory-50">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold">{j}</h3>
                <p className="text-base leading-relaxed text-navy-ink-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Bagian>

      <Bagian id="berguna" judul="Apa yang membuat kiriman berguna">
        <Daftar>
          <li><strong>Apa</strong> yang terjadi, dijelaskan secara konkret.</li>
          <li><strong>Kapan</strong>, cukup perkiraan bulan atau triwulan bila tidak ingat tanggal persisnya.</li>
          <li><strong>Di mana</strong>: unit atau layanan, tidak perlu alamat lengkap.</li>
          <li><strong>Dampaknya</strong> dan, untuk aspirasi, apa usulan Anda.</li>
          <li>Bukti bila ada: foto atau dokumen yang relevan (JPG, PNG, WebP, atau PDF).</li>
        </Daftar>
        <p className="text-sm text-navy-ink-muted">Contoh di bawah adalah contoh rekaan, bukan laporan nyata.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <figure className="flex flex-col gap-2 rounded-xl border border-ok/40 bg-ok-bg p-4">
            <figcaption className="flex items-center gap-1.5 text-sm font-bold text-ok">
              <Check className="size-4" aria-hidden="true" /> Lebih berguna
            </figcaption>
            <blockquote className="text-base leading-relaxed">
              “Pada triwulan kedua tahun ini, di loket layanan dokumen, saya diminta membayar biaya tambahan di luar tarif resmi agar
              prosesnya cepat. Hal ini terjadi tiga kali.”
            </blockquote>
          </figure>
          <figure className="flex flex-col gap-2 rounded-xl border border-err/40 bg-err-bg p-4">
            <figcaption className="flex items-center gap-1.5 text-sm font-bold text-err">
              <X className="size-4" aria-hidden="true" /> Kurang berguna
            </figcaption>
            <blockquote className="text-base leading-relaxed">“Pelayanannya buruk dan banyak pungli. Tolong ditindak.”</blockquote>
          </figure>
        </div>
        <P>
          Hindari menyebut nama orang atau detail yang hanya Anda yang tahu bila tidak diperlukan. Lihat{" "}
          <Link href="/kerahasiaan" className="rounded font-semibold text-navy-700 underline underline-offset-4">penjelasan kerahasiaan</Link>.
        </P>
      </Bagian>

      <Bagian id="setelah" judul="Setelah Anda mengirim">
        <P>Status kiriman yang Anda lihat di halaman pelacakan:</P>
        <dl className="flex flex-col divide-y divide-ivory-200 rounded-xl border border-ivory-200 bg-white">
          {STATUS.map(([s, d]) => (
            <div key={s} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-4">
              <dt className="font-semibold sm:w-60 sm:shrink-0">{s}</dt>
              <dd className="text-base leading-relaxed text-navy-ink-muted">{d}</dd>
            </div>
          ))}
        </dl>
        <P>
          Status publikasi berjalan terpisah dari status penanganan. Kiriman yang dipublikasikan tidak berarti sudah selesai ditangani,
          dan ringkasan pelanggaran yang tayang tidak berarti dugaannya terbukti.
        </P>
        <Link href="/lacak" className={`inline-flex min-h-11 w-fit items-center rounded-full border-2 border-navy-900 px-5 text-sm font-semibold hover:bg-navy-900/5 ${tombol}`}>
          Lacak kiriman
        </Link>
      </Bagian>
    </HalamanInfo>
  );
}
