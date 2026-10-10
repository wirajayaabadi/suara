"use client";

import * as React from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import { FileText, ImageIcon, Lock, Pencil, Trash2, Upload } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import type { KategoriPublik } from "@/lib/schemas/publik";
import {
  ATURAN_LAMPIRAN,
  EKSTENSI_LAMPIRAN,
  JUDUL_LANGKAH,
  TIPE_LAMPIRAN,
  type JenisPengajuan,
} from "@/lib/schemas/kiriman";
import { Bidang, kelasInput, kelasTautan, kelasTextarea, Penghitung } from "./bidang";

/** Nilai form gabungan kedua jenis (hanya sebagian field dipakai per jenis). */
export type NilaiForm = {
  kategoriId: string;
  judul: string;
  kronologi: string;
  jenisWaktu?: "pasti" | "bulan" | "berlangsung" | "tidak_ingat";
  tanggal: string;
  bulan: string;
  tahun: string;
  lokasi: string;
  pihakTerlibat: string;
  melibatkanPengelola: boolean;
  kondisi: string;
  usulan: string;
  manfaat: string;
  nama: string;
  email: string;
  izinPublikasi?: "ya" | "tidak";
  pernyataan: boolean;
  situs: string;
};

const pesan = (e: unknown) => (e as { message?: string } | undefined)?.message;

function useGalat(nama: keyof NilaiForm) {
  const {
    formState: { errors },
  } = useFormContext<NilaiForm>();
  return pesan(errors[nama]);
}

const kelasRadioKartu =
  "flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-ink-border bg-white px-3 py-2.5 text-base text-navy-900 transition-colors hover:border-navy-700 has-[[data-state=checked]]:border-2 has-[[data-state=checked]]:border-navy-900 has-[[data-state=checked]]:bg-gold-100/60";
const kelasRadio = "size-5 border-ink-border data-checked:border-navy-900 data-checked:bg-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500";
const kelasCentang = "size-5 border-ink-border data-checked:border-navy-900 data-checked:bg-navy-900 focus-visible:ring-2 focus-visible:ring-gold-500";

// ---------------------------------------------------------------- langkah 1

export function LangkahKategoriJudul({ jenis, kategori }: { jenis: JenisPengajuan; kategori: KategoriPublik[] }) {
  const { register, control } = useFormContext<NilaiForm>();
  const judul = useWatch({ control, name: "judul" });
  const galatKategori = useGalat("kategoriId");
  const galatJudul = useGalat("judul");
  return (
    <div className="flex flex-col gap-6">
      <Bidang id="kategoriId" label="Kategori" wajib grup galat={galatKategori}>
        {(aria) => (
          <Controller
            control={control}
            name="kategoriId"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                aria-invalid={aria["aria-invalid"]}
                aria-describedby={aria["aria-describedby"]}
                className="grid gap-2 sm:grid-cols-2"
              >
                {[...kategori]
                  .sort((a, b) => a.urutan - b.urutan)
                  .map((k) => (
                    <label key={k.id} className={kelasRadioKartu}>
                      <RadioGroupItem value={k.id} id={`kategori-${k.id}`} className={kelasRadio} />
                      <span>{k.label}</span>
                    </label>
                  ))}
              </RadioGroup>
            )}
          />
        )}
      </Bidang>
      <Bidang
        id="judul"
        label={jenis === "pelanggaran" ? "Judul singkat" : "Judul aspirasi"}
        wajib
        petunjuk={
          jenis === "pelanggaran"
            ? "Contoh: “Biaya tambahan saat mengurus dokumen”. Hindari menulis nama orang di judul."
            : "Contoh: “Penambahan tempat duduk di ruang tunggu”."
        }
        galat={galatJudul}
      >
        {(aria) => (
          <>
            <input {...aria} {...register("judul")} className={kelasInput} autoComplete="off" maxLength={140} />
            <Penghitung nilai={judul} maks={120} />
          </>
        )}
      </Bidang>
    </div>
  );
}

// ---------------------------------------------------------------- langkah 2 (pelanggaran)

const NAMA_BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export function LangkahKronologi({ hariIni }: { hariIni: string }) {
  const { register, control } = useFormContext<NilaiForm>();
  const kronologi = useWatch({ control, name: "kronologi" });
  const jenisWaktu = useWatch({ control, name: "jenisWaktu" });
  const tahunIni = hariIni ? Number(hariIni.slice(0, 4)) : 2026;
  const galat = {
    kronologi: useGalat("kronologi"),
    jenisWaktu: useGalat("jenisWaktu"),
    tanggal: useGalat("tanggal"),
    bulan: useGalat("bulan"),
    lokasi: useGalat("lokasi"),
    pihakTerlibat: useGalat("pihakTerlibat"),
  };
  return (
    <div className="flex flex-col gap-6">
      <Bidang
        id="kronologi"
        label="Apa yang terjadi?"
        wajib
        petunjuk="Ceritakan apa yang terjadi, kapan, di mana, dan bagaimana Anda mengetahuinya. Tulis seperlunya dan hindari detail yang hanya diketahui Anda."
        galat={galat.kronologi}
      >
        {(aria) => (
          <>
            <textarea {...aria} {...register("kronologi")} className={kelasTextarea} rows={7} autoComplete="off" />
            <Penghitung nilai={kronologi} maks={5000} />
          </>
        )}
      </Bidang>

      <Bidang id="jenisWaktu" label="Kapan terjadi?" wajib labelWajib="Wajib dipilih" grup galat={galat.jenisWaktu}>
        {(aria) => (
          <Controller
            control={control}
            name="jenisWaktu"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                aria-invalid={aria["aria-invalid"]}
                aria-describedby={aria["aria-describedby"]}
                className="grid gap-2"
              >
                {(
                  [
                    ["pasti", "Tanggal pasti"],
                    ["bulan", "Perkiraan bulan"],
                    ["berlangsung", "Masih berlangsung"],
                    ["tidak_ingat", "Tidak ingat / tidak yakin"],
                  ] as const
                ).map(([nilai, label]) => (
                  <label key={nilai} className={kelasRadioKartu}>
                    <RadioGroupItem value={nilai} className={kelasRadio} />
                    <span>{label}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
          />
        )}
      </Bidang>

      {jenisWaktu === "pasti" && (
        <Bidang id="tanggal" label="Tanggal kejadian" wajib galat={galat.tanggal}>
          {(aria) => <input {...aria} {...register("tanggal")} type="date" max={hariIni || undefined} className={cn(kelasInput, "sm:max-w-60")} />}
        </Bidang>
      )}
      {jenisWaktu === "bulan" && (
        <Bidang id="bulan" label="Perkiraan bulan" wajib grup galat={galat.bulan}>
          {(aria) => (
            <div className="flex flex-wrap gap-2">
              <select {...register("bulan")} id="bulan" aria-label="Bulan" aria-describedby={aria["aria-describedby"]} aria-invalid={aria["aria-invalid"]} className={cn(kelasInput, "w-auto min-w-40")}>
                <option value="">Pilih bulan</option>
                {NAMA_BULAN.map((b, i) => (
                  <option key={b} value={String(i + 1).padStart(2, "0")}>
                    {b}
                  </option>
                ))}
              </select>
              <select {...register("tahun")} aria-label="Tahun" className={cn(kelasInput, "w-auto min-w-28")}>
                <option value="">Tahun</option>
                {Array.from({ length: 6 }, (_, i) => tahunIni - i).map((t) => (
                  <option key={t} value={String(t)}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          )}
        </Bidang>
      )}

      <Bidang id="lokasi" label="Lokasi atau unit" petunjuk="Isi jika relevan. Lokasi yang terlalu spesifik dapat mengungkap identitas Anda." galat={galat.lokasi}>
        {(aria) => <input {...aria} {...register("lokasi")} className={kelasInput} autoComplete="off" maxLength={220} />}
      </Bidang>

      <Bidang
        id="pihakTerlibat"
        label="Pihak yang diduga terlibat"
        petunjuk="Disimpan terenkripsi dan hanya dibaca petugas berwenang. Tidak pernah dipublikasikan."
        galat={galat.pihakTerlibat}
      >
        {(aria) => <textarea {...aria} {...register("pihakTerlibat")} className={cn(kelasTextarea, "min-h-24")} rows={3} autoComplete="off" />}
      </Bidang>

      <Controller
        control={control}
        name="melibatkanPengelola"
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ivory-200 bg-ivory-100/60 p-3 text-base text-navy-900">
            <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className={cn(kelasCentang, "mt-0.5")} />
            <span>
              Laporan ini melibatkan pengelola layanan ini atau pimpinan
              <span className="mt-0.5 block text-sm text-navy-ink-muted">
                Jika dicentang, laporan hanya dapat dibuka oleh daftar petugas terbatas dan pihak independen.
              </span>
            </span>
          </label>
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------- langkah aspirasi

export function LangkahKondisi() {
  const { register, control } = useFormContext<NilaiForm>();
  const kondisi = useWatch({ control, name: "kondisi" });
  const galat = useGalat("kondisi");
  return (
    <Bidang
      id="kondisi"
      label="Apa yang terjadi atau dibutuhkan saat ini?"
      wajib
      petunjuk="Jelaskan kondisi saat ini dan mengapa perlu diperhatikan."
      galat={galat}
    >
      {(aria) => (
        <>
          <textarea {...aria} {...register("kondisi")} className={kelasTextarea} rows={7} autoComplete="off" />
          <Penghitung nilai={kondisi} maks={3000} />
        </>
      )}
    </Bidang>
  );
}

export function LangkahUsulan() {
  const { register, control } = useFormContext<NilaiForm>();
  const usulan = useWatch({ control, name: "usulan" });
  const galatUsulan = useGalat("usulan");
  const galatManfaat = useGalat("manfaat");
  return (
    <div className="flex flex-col gap-6">
      <Bidang id="usulan" label="Apa usulan Anda?" petunjuk="Disarankan. Usulan yang konkret lebih mudah ditindaklanjuti." galat={galatUsulan}>
        {(aria) => (
          <>
            <textarea {...aria} {...register("usulan")} className={kelasTextarea} rows={5} autoComplete="off" />
            <Penghitung nilai={usulan} maks={1500} />
          </>
        )}
      </Bidang>
      <Bidang id="manfaat" label="Manfaat yang diharapkan" galat={galatManfaat}>
        {(aria) => <textarea {...aria} {...register("manfaat")} className={cn(kelasTextarea, "min-h-24")} rows={3} autoComplete="off" />}
      </Bidang>
    </div>
  );
}

// ---------------------------------------------------------------- lampiran

const formatUkuran = (b: number) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB` : `${Math.ceil(b / 1024)} KB`);

function ekstensi(nama: string) {
  const i = nama.lastIndexOf(".");
  return i >= 0 ? nama.slice(i).toLowerCase() : "";
}

/** Nama generik untuk ditampilkan; nama asli bisa memuat nama orang (dok. 03 §7.3). */
export const namaGenerik = (f: File, i: number) => `lampiran-${i + 1}${ekstensi(f.name) === ".jpeg" ? ".jpg" : ekstensi(f.name)}`;

export function LangkahLampiran({
  jenis,
  berkas,
  setBerkas,
}: {
  jenis: JenisPengajuan;
  berkas: File[];
  setBerkas: (f: File[]) => void;
}) {
  const aturan = ATURAN_LAMPIRAN[jenis];
  const ref = React.useRef<HTMLInputElement>(null);
  const [galat, setGalat] = React.useState<string[]>([]);

  const tambah = (daftar: FileList | null) => {
    if (!daftar) return;
    const baru: File[] = [];
    const salah: string[] = [];
    let total = berkas.reduce((a, f) => a + f.size, 0);
    for (const f of Array.from(daftar)) {
      const okTipe = Boolean(TIPE_LAMPIRAN[f.type]) && EKSTENSI_LAMPIRAN.includes(ekstensi(f.name));
      if (berkas.length + baru.length >= aturan.maksFile) {
        salah.push(`Batas ${aturan.maksFile} file sudah tercapai. File “${f.name}” tidak ditambahkan.`);
      } else if (!okTipe) {
        salah.push(`File “${f.name}” tidak dapat diunggah. Gunakan JPG, PNG, WebP, atau PDF.`);
      } else if (f.size > aturan.maksPerFile) {
        salah.push(`File “${f.name}” berukuran ${formatUkuran(f.size)}. Batas per file adalah 10 MB.`);
      } else if (total + f.size > aturan.maksTotal) {
        salah.push(`Total lampiran melebihi ${formatUkuran(aturan.maksTotal)}. File “${f.name}” tidak ditambahkan.`);
      } else {
        baru.push(f);
        total += f.size;
      }
    }
    setGalat(salah);
    if (baru.length) setBerkas([...berkas, ...baru]);
    if (ref.current) ref.current.value = "";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-navy-900">
          {jenis === "pelanggaran" ? "Bukti pendukung" : "Lampiran pendukung"}
          <span className="ml-2 text-sm font-normal text-navy-ink-muted">(opsional)</span>
        </p>
        <p id="lampiran-petunjuk" className="text-sm leading-relaxed text-navy-ink-muted">
          Maksimal {aturan.maksFile} file, 10 MB per file. Format JPG, PNG, WebP, atau PDF. Lampiran{" "}
          <strong className="font-semibold text-navy-900">tidak pernah dipublikasikan</strong>.
        </p>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-warn/30 bg-warn-bg p-3 text-sm text-warn">
        <Lock className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p>
          Foto dan dokumen dapat menyimpan lokasi GPS, nama perangkat, atau nama penulis. Sistem akan membersihkan metadata,
          tetapi periksa juga isi gambarnya agar tidak menampilkan diri Anda.
        </p>
      </div>

      <input
        ref={ref}
        id="lampiran"
        type="file"
        multiple
        accept={[...Object.keys(TIPE_LAMPIRAN), ...EKSTENSI_LAMPIRAN].join(",")}
        className="sr-only"
        aria-describedby="lampiran-petunjuk lampiran-kuota"
        onChange={(e) => tambah(e.target.files)}
        disabled={berkas.length >= aturan.maksFile}
      />
      <label
        htmlFor="lampiran"
        className={cn(
          "inline-flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-full border-2 border-navy-900 px-5 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/5 [input:focus-visible+&]:outline-2 [input:focus-visible+&]:outline-offset-2 [input:focus-visible+&]:outline-gold-500",
          berkas.length >= aturan.maksFile && "pointer-events-none opacity-60",
        )}
      >
        <Upload className="size-4" aria-hidden="true" />
        Pilih file
      </label>
      <p id="lampiran-kuota" className="text-sm text-navy-ink-muted" aria-live="polite">
        {berkas.length} dari {aturan.maksFile} file
      </p>

      {galat.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1 rounded-lg border border-err/30 bg-err-bg p-3 text-sm font-medium text-err">
          {galat.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      )}

      {berkas.length > 0 && (
        <ul className="flex flex-col gap-2">
          {berkas.map((f, i) => (
            <li key={`${f.name}-${f.size}-${i}`} className="flex items-center gap-3 rounded-lg border border-ivory-200 bg-white px-3 py-2">
              {f.type === "application/pdf" ? (
                <FileText className="size-5 shrink-0 text-navy-700" aria-hidden="true" />
              ) : (
                <ImageIcon className="size-5 shrink-0 text-navy-700" aria-hidden="true" />
              )}
              <span className="flex-1 text-sm text-navy-900">
                {namaGenerik(f, i)} <span className="text-navy-ink-muted">· {formatUkuran(f.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => setBerkas(berkas.filter((_, j) => j !== i))}
                className="grid size-11 place-items-center rounded-full text-navy-700 hover:bg-err-bg hover:text-err focus-visible:outline-2 focus-visible:outline-gold-500"
                aria-label={`Hapus ${namaGenerik(f, i)}`}
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- kontak

export function LangkahKontak({ jenis }: { jenis: JenisPengajuan }) {
  const { register } = useFormContext<NilaiForm>();
  const galatNama = useGalat("nama");
  const galatEmail = useGalat("email");
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-navy-ink-muted">
        Kontak <strong className="font-semibold text-navy-900">tidak wajib</strong>. Email hanya dipakai untuk memberi tahu
        ada pembaruan. Isi {jenis === "pelanggaran" ? "laporan" : "aspirasi"} tidak dikirim lewat email. Hindari memakai email
        kantor.
      </p>
      <Bidang id="nama" label="Nama" petunjuk={jenis === "aspirasi" ? "Nama tidak ditampilkan di publik." : "Boleh dikosongkan."} galat={galatNama}>
        {(aria) => <input {...aria} {...register("nama")} className={kelasInput} autoComplete="off" maxLength={170} />}
      </Bidang>
      <Bidang id="email" label="Email" galat={galatEmail}>
        {(aria) => <input {...aria} {...register("email")} type="email" inputMode="email" className={kelasInput} autoComplete="off" />}
      </Bidang>
    </div>
  );
}

// ---------------------------------------------------------------- tinjau

function Ringkasan({ judul, langkah, keLangkah, children }: { judul: string; langkah: number; keLangkah: (n: number) => void; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ivory-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold tracking-wide text-navy-900 uppercase">{judul}</h4>
        <button type="button" onClick={() => keLangkah(langkah)} className={cn(kelasTautan, "inline-flex items-center gap-1 text-sm")}>
          <Pencil className="size-3.5" aria-hidden="true" />
          Ubah<span className="sr-only"> {judul}</span>
        </button>
      </div>
      <dl className="grid gap-1.5 text-sm text-navy-900">{children}</dl>
    </section>
  );
}

function Baris({ label, nilai }: { label: string; nilai?: string }) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[10rem_1fr]">
      <dt className="text-navy-ink-muted">{label}</dt>
      <dd className="break-words whitespace-pre-line">{nilai?.trim() ? nilai : <span className="text-navy-ink-muted">Tidak diisi</span>}</dd>
    </div>
  );
}

const ringkas = (s: string, n = 240) => (s.length > n ? `${s.slice(0, n).trimEnd()}…` : s);

export function LangkahTinjau({
  jenis,
  kategori,
  berkas,
  keLangkah,
}: {
  jenis: JenisPengajuan;
  kategori: KategoriPublik[];
  berkas: File[];
  keLangkah: (n: number) => void;
}) {
  const { control } = useFormContext<NilaiForm>();
  const v = useWatch({ control }) as NilaiForm;
  const galatIzin = useGalat("izinPublikasi");
  const galatPernyataan = useGalat("pernyataan");
  const judul = JUDUL_LANGKAH[jenis];
  const labelKategori = kategori.find((k) => k.id === v.kategoriId)?.label;
  const waktu =
    v.jenisWaktu === "pasti"
      ? v.tanggal
      : v.jenisWaktu === "bulan"
        ? `${NAMA_BULAN[Number(v.bulan) - 1] ?? ""} ${v.tahun ?? ""}`.trim()
        : v.jenisWaktu === "berlangsung"
          ? "Masih berlangsung"
          : v.jenisWaktu === "tidak_ingat"
            ? "Tidak ingat"
            : "";
  const lampiran = berkas.length ? berkas.map(namaGenerik).join(", ") : "";

  return (
    <div className="flex flex-col gap-4">
      <Ringkasan judul={judul[0]} langkah={0} keLangkah={keLangkah}>
        <Baris label="Kategori" nilai={labelKategori} />
        <Baris label="Judul" nilai={v.judul} />
      </Ringkasan>
      {jenis === "pelanggaran" ? (
        <>
          <Ringkasan judul={judul[1]} langkah={1} keLangkah={keLangkah}>
            <Baris label="Kronologi" nilai={ringkas(v.kronologi ?? "")} />
            <Baris label="Waktu" nilai={waktu} />
            <Baris label="Lokasi" nilai={v.lokasi} />
            <Baris label="Pihak terlibat" nilai={v.pihakTerlibat ? "Diisi (disembunyikan)" : ""} />
            <Baris label="Melibatkan pengelola" nilai={v.melibatkanPengelola ? "Ya" : "Tidak"} />
          </Ringkasan>
          <Ringkasan judul={judul[2]} langkah={2} keLangkah={keLangkah}>
            <Baris label="Lampiran" nilai={lampiran} />
          </Ringkasan>
          <Ringkasan judul={judul[3]} langkah={3} keLangkah={keLangkah}>
            <Baris label="Nama" nilai={v.nama} />
            <Baris label="Email" nilai={v.email} />
          </Ringkasan>
        </>
      ) : (
        <>
          <Ringkasan judul={judul[1]} langkah={1} keLangkah={keLangkah}>
            <Baris label="Kondisi" nilai={ringkas(v.kondisi ?? "")} />
          </Ringkasan>
          <Ringkasan judul={judul[2]} langkah={2} keLangkah={keLangkah}>
            <Baris label="Usulan" nilai={ringkas(v.usulan ?? "")} />
            <Baris label="Manfaat" nilai={ringkas(v.manfaat ?? "")} />
          </Ringkasan>
          <Ringkasan judul={judul[3]} langkah={3} keLangkah={keLangkah}>
            <Baris label="Lampiran" nilai={lampiran} />
            <Baris label="Nama" nilai={v.nama} />
            <Baris label="Email" nilai={v.email} />
          </Ringkasan>
        </>
      )}

      <Bidang
        id="izinPublikasi"
        label={jenis === "pelanggaran" ? "Bolehkah kami mempublikasikan ringkasan yang disamarkan?" : "Bolehkah aspirasi Anda dipublikasikan?"}
        wajib
        labelWajib="Wajib dipilih"
        grup
        petunjuk={
          jenis === "pelanggaran"
            ? "Jika Ya, petugas dapat menulis ulang inti laporan tanpa nama, jabatan, tanggal persis, atau detail lain yang dapat mengenali siapa pun. Isi asli dan lampiran tidak ikut tampil. Izin dapat ditarik kapan saja lewat halaman pelacakan. Jika Tidak, laporan tetap ditindaklanjuti secara tertutup."
            : "Jika Ya, petugas dapat menampilkan aspirasi Anda setelah menghapus informasi pribadi. Nama Anda tidak ditampilkan dan lampiran tidak ikut tampil. Izin dapat ditarik kapan saja lewat halaman pelacakan."
        }
        galat={galatIzin}
      >
        {(aria) => (
          <Controller
            control={control}
            name="izinPublikasi"
            render={({ field }) => (
              <RadioGroup
                value={field.value ?? ""}
                onValueChange={field.onChange}
                aria-invalid={aria["aria-invalid"]}
                aria-describedby={aria["aria-describedby"]}
                className="grid gap-2"
              >
                <label className={kelasRadioKartu}>
                  <RadioGroupItem value="ya" className={kelasRadio} />
                  <span>{jenis === "pelanggaran" ? "Ya, boleh dipublikasikan dalam bentuk ringkasan tersamar" : "Ya, boleh dipublikasikan setelah dikurasi"}</span>
                </label>
                <label className={kelasRadioKartu}>
                  <RadioGroupItem value="tidak" className={kelasRadio} />
                  <span>Tidak, jangan dipublikasikan</span>
                </label>
              </RadioGroup>
            )}
          />
        )}
      </Bidang>

      <Controller
        control={control}
        name="pernyataan"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-start gap-3 text-base text-navy-900">
              <Checkbox
                id="pernyataan"
                checked={field.value}
                onCheckedChange={(c) => field.onChange(c === true)}
                aria-invalid={galatPernyataan ? true : undefined}
                aria-describedby={galatPernyataan ? "pernyataan-galat" : undefined}
                className={cn(kelasCentang, "mt-0.5")}
              />
              <span>
                Saya menyatakan informasi ini benar sepengetahuan saya dan memahami{" "}
                <a href="/kebijakan-privasi" target="_blank" rel="noreferrer noopener" className={kelasTautan}>
                  ketentuan penggunaan data
                </a>
                .
              </span>
            </label>
            {galatPernyataan && (
              <p id="pernyataan-galat" className="text-sm font-medium text-err">
                {galatPernyataan}
              </p>
            )}
          </div>
        )}
      />

      <p className="rounded-lg border border-ivory-200 bg-ivory-100 p-3 text-sm text-navy-900">
        {jenis === "pelanggaran" ? "Laporan" : "Aspirasi"} akan <strong className="font-semibold">ditinjau petugas</strong> dan{" "}
        <strong className="font-semibold">tidak otomatis dipublikasikan</strong>.
      </p>
    </div>
  );
}

