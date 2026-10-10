import type { Metadata } from "next";
import Link from "next/link";
import { Bagian, Daftar, HalamanInfo, P } from "@/components/tata-letak/HalamanInfo";

export const metadata: Metadata = {
  title: "Kerahasiaan",
  description: "Apa yang dilindungi, siapa yang dapat membaca, apa yang mungkin dipublikasikan, dan batas anonimitas.",
};

const DAFTAR_ISI = [
  { id: "ringkas", label: "Ringkasnya" },
  { id: "pembaca", label: "Siapa yang dapat membaca kiriman Anda" },
  { id: "publikasi", label: "Apa yang mungkin dipublikasikan" },
  { id: "batas", label: "Batas anonimitas" },
  { id: "tips", label: "Cara mengirim dengan lebih aman" },
];

/** Sumber identitas yang dapat bocor (dok. 02 §9). Urutan dan isi mengikuti dokumen. */
const BATAS = [
  {
    judul: "Isi laporan",
    risiko: "Detail cerita bisa menunjukkan siapa Anda, misalnya “hanya saya yang bertugas malam itu”.",
    sistem: "Saat kurasi, petugas menulis ulang ringkasan dan menyamarkannya. Isi asli tidak dipublikasikan.",
    tips: "Tulis seperlunya dan hindari detail yang hanya diketahui Anda.",
  },
  {
    judul: "Lampiran",
    risiko: "Foto dan dokumen dapat menyimpan lokasi GPS, nama perangkat, atau nama penulis. Isi visualnya juga bisa memperlihatkan siapa yang memotret.",
    sistem: "Metadata gambar dan PDF dibersihkan. Lampiran tidak pernah dipublikasikan.",
    tips: "Periksa isi visual lampiran dan potong bagian yang menunjukkan Anda.",
  },
  {
    judul: "Jaringan dan perangkat",
    risiko: "Penyedia hosting dapat mencatat alamat IP untuk sementara. Jaringan atau perangkat kantor mungkin dipantau.",
    sistem: "Kami tidak menyimpan alamat IP bersama laporan. Pembatasan percobaan memakai hash IP yang dihapus dalam 24 jam. Tidak ada analitik pihak ketiga.",
    tips: "Gunakan perangkat dan jaringan pribadi. Pertimbangkan mode penyamaran peramban.",
  },
  {
    judul: "Kontak yang Anda berikan",
    risiko: "Alamat email dapat menunjukkan identitas.",
    sistem: "Kontak bersifat opsional, disimpan terenkripsi, dan disembunyikan secara bawaan.",
    tips: "Gunakan email pribadi yang tidak memuat nama Anda, atau kosongkan.",
  },
  {
    judul: "Gaya tulisan",
    risiko: "Gaya bahasa yang khas dapat dikenali orang dekat.",
    sistem: "Ringkasan publik ditulis ulang, bukan dikutip.",
  },
  {
    judul: "Kode pelacakan",
    risiko: "Siapa pun yang memegang Nomor Referensi dan Kode Akses dapat melihat status kiriman Anda.",
    sistem: "Kode tidak pernah muncul di alamat halaman, dan sesi pelacakan singkat.",
    tips: "Simpan kode secara pribadi, bukan di perangkat kantor atau chat kerja.",
  },
  {
    judul: "Proses hukum",
    risiko: "Dalam kondisi tertentu, organisasi dapat diwajibkan oleh hukum untuk membuka data.",
    sistem: "Data yang disimpan dibuat sesedikit mungkin, dan setiap akses petugas dicatat dalam catatan audit.",
  },
];

export default function Halaman() {
  return (
    <HalamanInfo
      judul="Kerahasiaan"
      pengantar="Penjelasan jujur tentang apa yang kami lindungi, siapa yang dapat membaca kiriman Anda, dan di mana perlindungan itu terbatas."
      daftarIsi={DAFTAR_ISI}
      catatanDraf="DRAF — teks ini mengikuti dokumen perencanaan dan perlu ditinjau pemilik layanan sebelum dipakai publik."
    >
      <Bagian id="ringkas" judul="Ringkasnya">
        <Daftar>
          <li>Anda <strong>tidak perlu membuat akun</strong> dan tidak wajib menuliskan identitas.</li>
          <li>Kontak bersifat <strong>opsional</strong>. Bila diberikan, kontak disimpan terenkripsi dan disembunyikan secara bawaan.</li>
          <li>Setiap kiriman <strong>ditinjau petugas terlebih dahulu</strong>. Tidak ada yang tampil di publik tanpa izin Anda dan persetujuan petugas berwenang.</li>
          <li>Kami tidak menyimpan alamat IP bersama laporan dan tidak memakai pelacak atau analitik pihak ketiga di halaman kirim dan lacak.</li>
        </Daftar>
        <P>
          Meski begitu, <strong>kami tidak dapat menjamin anonimitas sepenuhnya</strong>. Bagian “Batas anonimitas” di bawah menjelaskan
          apa saja yang masih dapat mengungkap identitas Anda, dan apa yang bisa Anda lakukan.
        </P>
      </Bagian>

      <Bagian id="pembaca" judul="Siapa yang dapat membaca kiriman Anda">
        <P>
          Hanya petugas yang berwenang dan sudah masuk dengan verifikasi dua langkah. Akses ke detail kiriman, ke identitas yang Anda
          tulis, dan ke lampiran dicatat dalam catatan audit. Kiriman yang menyangkut pengelola atau pimpinan dapat dijadikan
          kasus terbatas yang hanya dapat dibuka oleh orang yang ditunjuk secara tertulis.
        </P>
        <P>Petugas tidak dapat melihat Kode Akses Anda. Kami hanya menyimpan bentuk terenkripsinya, sehingga kode yang hilang tidak dapat dipulihkan.</P>
      </Bagian>

      <Bagian id="publikasi" judul="Apa yang mungkin dipublikasikan">
        <Daftar>
          <li>
            <strong>Pelanggaran:</strong> hanya <em>ringkasan yang ditulis ulang dan disamarkan</em>, tanpa nama, jabatan, tanggal persis, atau
            detail yang dapat mengenali pihak mana pun. Isi asli dan lampiran tidak pernah tampil. Ringkasan selalu disertai penafian bahwa
            publikasi tidak berarti dugaan terbukti.
          </li>
          <li><strong>Aspirasi:</strong> isi aspirasi setelah informasi pribadi dihapus. Nama Anda tidak ditampilkan.</li>
        </Daftar>
        <P>
          Publikasi hanya terjadi jika Anda memilih <strong>“Ya”</strong> pada izin publikasi. Anda dapat menarik izin itu kapan saja dari
          halaman <Link href="/lacak" className="rounded font-semibold text-navy-700 underline underline-offset-4">pelacakan</Link>, dan konten yang sudah tayang akan segera
          dihapus dari halaman publik. Memilih “Tidak” tidak memengaruhi penanganan: kiriman tetap ditindaklanjuti secara tertutup.
        </P>
      </Bagian>

      <Bagian id="batas" judul="Batas anonimitas">
        <P>Berikut hal-hal yang dapat mengungkap identitas, apa yang kami lakukan, dan apa yang dapat Anda lakukan.</P>
        <ul className="flex flex-col gap-3">
          {BATAS.map((b) => (
            <li key={b.judul}>
              <article className="flex flex-col gap-1.5 rounded-xl border border-ivory-200 bg-white p-4">
                <h3 className="font-display text-base font-extrabold">{b.judul}</h3>
                <p className="text-base leading-relaxed">{b.risiko}</p>
                <p className="text-sm leading-relaxed text-navy-ink-muted">
                  <strong className="text-navy-900">Yang kami lakukan:</strong> {b.sistem}
                </p>
                {b.tips && (
                  <p className="text-sm leading-relaxed text-navy-ink-muted">
                    <strong className="text-navy-900">Saran untuk Anda:</strong> {b.tips}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ul>
      </Bagian>

      <Bagian id="tips" judul="Cara mengirim dengan lebih aman">
        <Daftar urut>
          <li>Kirim dari perangkat dan jaringan pribadi, bukan komputer atau Wi-Fi kantor.</li>
          <li>Tuliskan kejadian seperlunya. Hindari detail yang hanya Anda yang tahu.</li>
          <li>Periksa lampiran: potong bagian yang memperlihatkan Anda, dan jangan lampirkan dokumen yang memuat nama Anda bila tidak perlu.</li>
          <li>Simpan Nomor Referensi dan Kode Akses di kertas atau pengelola kata sandi pribadi. Jangan kirim lewat chat atau email kerja.</li>
          <li>Setelah selesai membuka pelacakan di perangkat bersama, tekan “Keluar”.</li>
        </Daftar>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href="/kirim/pelanggaran" className="inline-flex min-h-11 items-center rounded-full bg-navy-900 px-5 text-sm font-semibold text-ivory-50 hover:bg-navy-750 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
            Laporkan Pelanggaran
          </Link>
          <Link href="/kirim/aspirasi" className="inline-flex min-h-11 items-center rounded-full border-2 border-navy-900 px-5 text-sm font-semibold hover:bg-navy-900/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500">
            Sampaikan Aspirasi
          </Link>
        </div>
      </Bagian>
    </HalamanInfo>
  );
}
