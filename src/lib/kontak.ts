/**
 * Data kontak resmi. Nilai `null` = belum diisi pengelola; halaman menampilkan “Belum diisi”
 * dan TIDAK mengarang kontak. Isi sebelum go-live (dok. 02 §4.2).
 */
export const KONTAK = {
  namaOrganisasi: null as string | null,
  email: null as string | null,
  telepon: null as string | null,
  alamat: null as string | null,
  jamLayanan: null as string | null,
  /** Kontak darurat untuk ancaman keselamatan. */
  darurat: null as string | null,
};
