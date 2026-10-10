import type { Metadata } from "next";
import Link from "next/link";
import { Bagian, Daftar, HalamanInfo, P } from "@/components/tata-letak/HalamanInfo";

export const metadata: Metadata = { title: "Kebijakan Privasi", description: "Data apa yang kami kumpulkan, untuk apa, dan hak Anda." };

const DAFTAR_ISI = [
  { id: "data", label: "Data yang kami kumpulkan" },
  { id: "tujuan", label: "Untuk apa data dipakai" },
  { id: "akses", label: "Siapa yang dapat mengakses" },
  { id: "pihak-ketiga", label: "Pihak ketiga, cookie, dan penyimpanan di peramban" },
  { id: "hak", label: "Pilihan dan hak Anda" },
  { id: "batas", label: "Batasan" },
];

const tautan = "rounded font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900";

export default function Halaman() {
  return (
    <HalamanInfo
      judul="Kebijakan Privasi"
      pengantar="Data apa yang kami kumpulkan, untuk apa dipakai, dan pilihan yang Anda miliki."
      daftarIsi={DAFTAR_ISI}
      catatanDraf="DRAF — disusun dari dokumen perencanaan dan perlu ditinjau pemilik layanan dan penasihat hukum."
    >
      <Bagian id="data" judul="Data yang kami kumpulkan">
        <Daftar>
          <li><strong>Isi kiriman:</strong> kategori, judul, uraian, dan informasi lain yang Anda tulis di form.</li>
          <li><strong>Lampiran</strong> yang Anda unggah. Metadata gambar dan PDF dibersihkan, dan nama file asli tidak disimpan.</li>
          <li><strong>Identitas dan kontak</strong> (nama, email, telepon): hanya bila Anda mengisinya. Seluruhnya opsional.</li>
          <li><strong>Izin publikasi</strong> yang Anda pilih, dan riwayat penanganan kiriman.</li>
          <li><strong>Kode pelacakan:</strong> Nomor Referensi, dan Kode Akses dalam bentuk terenkripsi satu arah. Kode Akses yang asli tidak dapat dibaca atau dipulihkan.</li>
          <li><strong>Hash alamat IP</strong> yang dipakai sementara untuk membatasi spam dan percobaan masuk berulang. Alamat IP tidak disimpan bersama kiriman.</li>
        </Daftar>
      </Bagian>

      <Bagian id="tujuan" judul="Untuk apa data dipakai">
        <Daftar>
          <li>Meninjau dan menangani laporan serta aspirasi Anda.</li>
          <li>Menghubungi Anda lewat halaman pelacakan, atau lewat kontak yang Anda berikan bila Anda memintanya.</li>
          <li>Menyusun ringkasan yang disamarkan untuk dipublikasikan, <strong>hanya bila Anda mengizinkan</strong> dan petugas berwenang menyetujui.</li>
          <li>Mencegah spam dan penyalahgunaan layanan.</li>
          <li>Menyusun statistik agregat yang hanya berasal dari konten yang telah dipublikasikan.</li>
        </Daftar>
        <P>Kami tidak memakai data kiriman untuk iklan dan tidak menjualnya.</P>
      </Bagian>

      <Bagian id="akses" judul="Siapa yang dapat mengakses">
        <P>
          Petugas berwenang yang masuk dengan verifikasi dua langkah, sesuai perannya. Akses ke detail kiriman, identitas, dan lampiran
          dicatat dalam catatan audit. Publik hanya dapat melihat konten yang sudah disetujui untuk dipublikasikan. Dalam kondisi
          tertentu, organisasi dapat diwajibkan oleh hukum untuk membuka data kepada pihak berwenang.
        </P>
      </Bagian>

      <Bagian id="pihak-ketiga" judul="Pihak ketiga, cookie, dan penyimpanan di peramban">
        <Daftar>
          <li>Tidak ada analitik, pelacak iklan, atau perekam sesi pihak ketiga. Font dimuat dari server kami sendiri.</li>
          <li>
            <strong>Cookie sesi pelacakan:</strong> satu cookie yang hanya dibuat setelah Anda masuk ke pelacakan. Cookie ini hanya berlaku di
            halaman pelacakan, tidak dapat dibaca skrip, dan berakhir setelah 30 menit tanpa aktivitas atau saat Anda menekan “Keluar”.
          </li>
          <li>
            <strong>Penyimpanan lokal:</strong> hanya satu pengaturan, yaitu pilihan menjeda animasi di beranda. Isi form tidak disimpan di
            peramban dan hanya ada di memori selama halaman terbuka.
          </li>
          <li>Penyedia hosting dapat mencatat alamat IP untuk sementara sebagai bagian dari operasional server.</li>
        </Daftar>
      </Bagian>

      <Bagian id="hak" judul="Pilihan dan hak Anda">
        <Daftar>
          <li>Memilih <strong>tidak</strong> mengizinkan publikasi. Kiriman tetap ditangani secara tertutup.</li>
          <li>
            <strong>Menarik izin publikasi</strong> kapan saja lewat halaman <Link href="/lacak" className={tautan}>pelacakan</Link>.
            Konten yang sudah tayang akan dihapus dari halaman publik.
          </li>
          <li>Tidak mengisi nama dan kontak sama sekali.</li>
          <li>Menambah lampiran atau menjawab pertanyaan petugas lewat pelacakan.</li>
          <li>Pertanyaan lain tentang data Anda dapat disampaikan lewat <Link href="/kontak" className={tautan}>halaman kontak</Link>.</li>
        </Daftar>
      </Bagian>

      <Bagian id="batas" judul="Batasan">
        <P>
          Kami berupaya melindungi data Anda, tetapi tidak dapat menjamin anonimitas sepenuhnya. Isi cerita, lampiran, dan perangkat yang Anda
          pakai dapat mengungkap identitas. Baca <Link href="/kerahasiaan#batas" className={tautan}>penjelasan kerahasiaan</Link> sebelum mengirim.
        </P>
        <P>Kebijakan ini dapat diperbarui. Perubahan penting akan dicantumkan di halaman ini.</P>
      </Bagian>
    </HalamanInfo>
  );
}
