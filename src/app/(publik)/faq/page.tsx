import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { Bagian, HalamanInfo } from "@/components/tata-letak/HalamanInfo";

export const metadata: Metadata = { title: "Pertanyaan Umum", description: "Jawaban singkat atas pertanyaan yang paling sering diajukan." };

const tautan = "rounded font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

type Tanya = { q: string; a: React.ReactNode };
const KELOMPOK: { id: string; judul: string; isi: Tanya[] }[] = [
  {
    id: "umum",
    judul: "Umum",
    isi: [
      { q: "Apa bedanya laporan pelanggaran dan aspirasi?", a: <>Laporan pelanggaran untuk dugaan pelanggaran dan bersifat rahasia. Aspirasi untuk usulan, saran, atau keluhan layanan, dan dapat dipublikasikan setelah informasi pribadi dihapus. Lihat <Link href="/panduan#jenis" className={tautan}>panduan</Link>.</> },
      { q: "Apakah saya perlu membuat akun?", a: "Tidak. Anda cukup mengisi form. Setelah mengirim, Anda menerima Nomor Referensi dan Kode Akses untuk melacak kiriman." },
      { q: "Apakah saya wajib menuliskan identitas?", a: "Tidak. Nama dan kontak bersifat opsional. Kontak berguna bila Anda ingin dihubungi, tetapi tidak diperlukan untuk melacak kiriman." },
    ],
  },
  {
    id: "kerahasiaan",
    judul: "Kerahasiaan",
    isi: [
      { q: "Apakah identitas saya benar-benar anonim?", a: <>Kami tidak dapat menjamin anonimitas sepenuhnya. Kami tidak meminta identitas dan tidak menyimpan alamat IP bersama laporan, tetapi isi cerita, lampiran, atau perangkat yang Anda pakai masih dapat mengungkap siapa Anda. Penjelasan lengkap ada di <Link href="/kerahasiaan#batas" className={tautan}>halaman kerahasiaan</Link>.</> },
      { q: "Siapa yang dapat membaca kiriman saya?", a: "Hanya petugas berwenang yang masuk dengan verifikasi dua langkah. Setiap akses dicatat. Kiriman yang menyangkut pengelola atau pimpinan dapat dibatasi hanya untuk orang yang ditunjuk." },
      { q: "Apakah kiriman saya akan dipublikasikan?", a: "Hanya jika Anda memilih “Ya” pada izin publikasi dan petugas berwenang menyetujuinya. Untuk laporan pelanggaran, yang tampil hanya ringkasan yang ditulis ulang dan disamarkan; isi asli dan lampiran tidak pernah tampil." },
      { q: "Bisakah saya menarik izin publikasi?", a: <>Bisa, kapan saja lewat halaman <Link href="/lacak" className={tautan}>pelacakan</Link>. Konten yang sudah tayang akan dihapus dari halaman publik.</> },
      { q: "Apakah aman memakai komputer atau Wi-Fi kantor?", a: "Sebaiknya jangan. Jaringan dan perangkat kantor mungkin dipantau. Gunakan perangkat dan jaringan pribadi." },
    ],
  },
  {
    id: "mengirim",
    judul: "Mengirim",
    isi: [
      { q: "Apakah saya harus punya bukti?", a: "Tidak wajib, tetapi bukti yang relevan membantu petugas. Jika tidak ada, jelaskan kejadiannya selengkap yang Anda ketahui." },
      { q: "File apa yang dapat dilampirkan?", a: "JPG, PNG, WebP, dan PDF, maksimal 10 MB per file. Laporan pelanggaran dapat memuat hingga 5 file dan aspirasi hingga 3 file. Nama file asli tidak disimpan." },
      { q: "Saya tidak ingat tanggal kejadian. Bagaimana?", a: "Form menyediakan pilihan perkiraan bulan atau “Tidak ingat / tidak yakin”. Tanggal persis tidak wajib." },
      { q: "Isian saya hilang saat halaman tertutup. Apakah tersimpan?", a: "Isian hanya disimpan di memori peramban selama halaman terbuka dan tidak dikirim ke server sebelum Anda menekan Kirim." },
    ],
  },
  {
    id: "setelah",
    judul: "Setelah mengirim",
    isi: [
      { q: "Bagaimana cara melacak kiriman saya?", a: <>Buka <Link href="/lacak" className={tautan}>Lacak Kiriman</Link>, lalu masukkan Nomor Referensi dan Kode Akses.</> },
      { q: "Saya kehilangan Kode Akses. Bisa dipulihkan?", a: "Tidak. Kami tidak menyimpan kode dalam bentuk yang dapat dibaca dan tidak ada akun untuk dipulihkan. Anda dapat mengirim kiriman baru dan menyebut Nomor Referensi lama; petugas dapat menautkan keduanya." },
      { q: "Apa arti status kiriman saya?", a: <>Arti tiap status dijelaskan di <Link href="/panduan#setelah" className={tautan}>panduan</Link>.</> },
      { q: "Mengapa kiriman saya dipublikasikan tetapi belum selesai?", a: "Status publikasi dan status penanganan berjalan terpisah. Tayang di halaman publik tidak berarti selesai ditangani, dan ringkasan pelanggaran yang tayang tidak berarti dugaannya terbukti." },
    ],
  },
];

export default function Halaman() {
  return (
    <HalamanInfo
      judul="Pertanyaan Umum"
      pengantar="Jawaban singkat atas pertanyaan yang paling sering diajukan."
      daftarIsi={KELOMPOK.map((k) => ({ id: k.id, label: k.judul }))}
    >
      {KELOMPOK.map((k) => (
        <Bagian key={k.id} id={k.id} judul={k.judul}>
          <div className="flex flex-col divide-y divide-ivory-200 rounded-xl border border-ivory-200 bg-white">
            {k.isi.map((t) => (
              <details key={t.q} className="group px-4 py-1">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded py-2 font-semibold marker:content-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900 [&::-webkit-details-marker]:hidden">
                  {t.q}
                  <ChevronDown className="size-5 shrink-0 text-navy-700 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="pb-3 text-base leading-relaxed text-navy-ink-muted">{t.a}</div>
              </details>
            ))}
          </div>
        </Bagian>
      ))}
      <p className="text-base">
        Pertanyaan Anda belum terjawab? Lihat <Link href="/kontak" className={tautan}>halaman kontak</Link>.
      </p>
    </HalamanInfo>
  );
}
