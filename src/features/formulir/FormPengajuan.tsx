"use client";

import * as React from "react";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Lightbulb, Loader2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KategoriPublik } from "@/lib/schemas/publik";
import {
  FIELD_LANGKAH,
  JUDUL_LANGKAH,
  SkemaAspirasi,
  SkemaPelanggaran,
  type HasilKirim,
  type JenisPengajuan,
} from "@/lib/schemas/kiriman";
import { kirimPengajuanTiruan } from "./aksi";
import { kelasTautan, kelasTombolPrimer, kelasTombolSekunder } from "./bidang";
import { useDrafForm } from "./DrafFormProvider";
import { KredensialBerhasil } from "./KredensialBerhasil";
import {
  LangkahKategoriJudul,
  LangkahKondisi,
  LangkahKontak,
  LangkahKronologi,
  LangkahLampiran,
  LangkahTinjau,
  LangkahUsulan,
  type NilaiForm,
} from "./langkah";

const NILAI_AWAL: NilaiForm = {
  kategoriId: "",
  judul: "",
  kronologi: "",
  jenisWaktu: undefined,
  tanggal: "",
  bulan: "",
  tahun: "",
  lokasi: "",
  pihakTerlibat: "",
  melibatkanPengelola: false,
  kondisi: "",
  usulan: "",
  manfaat: "",
  nama: "",
  email: "",
  izinPublikasi: undefined,
  pernyataan: false,
  situs: "",
};

const LABEL_FIELD: Record<string, string> = {
  kategoriId: "Kategori",
  judul: "Judul",
  kronologi: "Kronologi",
  jenisWaktu: "Waktu kejadian",
  tanggal: "Tanggal kejadian",
  bulan: "Perkiraan bulan",
  lokasi: "Lokasi",
  pihakTerlibat: "Pihak terlibat",
  kondisi: "Kondisi atau kebutuhan",
  usulan: "Usulan",
  manfaat: "Manfaat",
  nama: "Nama",
  email: "Email",
  izinPublikasi: "Izin publikasi",
  pernyataan: "Pernyataan",
};

type Fase = "isi" | "mengirim" | "mengunggah" | "berhasil";

export type PropsFormPengajuan = {
  jenis: JenisPengajuan;
  kategori: KategoriPublik[];
  /** Tombol tutup/batal dari wadah (dialog atau halaman). */
  slotTutup: React.ReactNode;
  /** Id judul untuk `aria-labelledby` form. */
  idJudul: string;
  /**
   * Elemen judul. Dialog memakai `Dialog.Title` agar judul yang terlihat sekaligus menjadi
   * nama dialog (tanpa judul tersembunyi ganda).
   */
  judulSebagai?: React.ElementType;
  onKotorBerubah?: (kotor: boolean) => void;
  /** False saat layar berhasil belum dikonfirmasi: wadah tidak boleh ditutup. */
  onBolehTutupBerubah?: (boleh: boolean) => void;
  onSelesai: () => void;
  onKePelacakan?: () => void;
};

const tanpaLangganan = () => () => {};
const hariIniWib = () => new Date(Date.now() + 7 * 3_600_000).toISOString().slice(0, 10);

/** Tanggal hari ini (WIB) di klien; kosong saat render server agar tidak terjadi ketidakcocokan hidrasi. */
function useHariIniWib(): string {
  return React.useSyncExternalStore(tanpaLangganan, hariIniWib, () => "");
}

export function FormPengajuan(p: PropsFormPengajuan) {
  const { jenis } = p;
  const hariIni = useHariIniWib();
  const draf = useDrafForm();
  const skema = jenis === "pelanggaran" ? SkemaPelanggaran : SkemaAspirasi;
  const form = useForm<NilaiForm>({
    resolver: zodResolver(skema) as unknown as Resolver<NilaiForm>,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: NILAI_AWAL,
    shouldFocusError: false,
  });

  const [langkah, setLangkah] = React.useState(0);
  const [berkas, setBerkas] = React.useState<File[]>([]);
  const [fase, setFase] = React.useState<Fase>("isi");
  const [galatKirim, setGalatKirim] = React.useState<string | null>(null);
  const [ringkasanGalat, setRingkasanGalat] = React.useState<{ field: string; pesan: string }[]>([]);
  const [hasil, setHasil] = React.useState<Extract<HasilKirim, { ok: true }> | null>(null);
  const [progres, setProgres] = React.useState<number[]>([]);
  const [lampiranGagal, setLampiranGagal] = React.useState(0);
  const [tersimpan, setTersimpan] = React.useState(false);
  const [tawaranDraf, setTawaranDraf] = React.useState(() => Boolean(draf.ambil(jenis)));
  const idempotensi = React.useRef<string | null>(null);
  const judulLangkahRef = React.useRef<HTMLHeadingElement>(null);
  const ringkasanRef = React.useRef<HTMLDivElement>(null);
  const isiRef = React.useRef<HTMLDivElement>(null);

  const kotor = (form.formState.isDirty || berkas.length > 0) && fase !== "berhasil";
  const { onKotorBerubah, onBolehTutupBerubah } = p;
  // Badan effect berupa blok: nilai balik callback tidak boleh dianggap fungsi cleanup.
  React.useEffect(() => {
    onKotorBerubah?.(kotor);
  }, [kotor, onKotorBerubah]);
  React.useEffect(() => {
    onBolehTutupBerubah?.(fase !== "berhasil" || tersimpan);
  }, [fase, tersimpan, onBolehTutupBerubah]);

  // Draf di memori: disimpan setiap ada perubahan selama form masih diisi.
  React.useEffect(() => {
    if (fase !== "isi" || tawaranDraf) return;
    const simpan = () => {
      if (form.formState.isDirty || berkas.length) draf.simpan(jenis, { nilai: form.getValues(), langkah, berkas });
    };
    simpan();
    // `subscribe` tidak memicu render ulang (berbeda dengan `watch`).
    return form.subscribe({ formState: { values: true }, callback: simpan });
  }, [form, draf, jenis, langkah, berkas, fase, tawaranDraf]);

  // Peringatan saat memuat ulang/menutup tab dengan isian belum terkirim.
  React.useEffect(() => {
    if (!kotor) return;
    const tahan = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", tahan);
    return () => window.removeEventListener("beforeunload", tahan);
  }, [kotor]);

  const pindahLangkah = (n: number) => {
    setRingkasanGalat([]);
    setGalatKirim(null);
    setLangkah(n);
    requestAnimationFrame(() => {
      isiRef.current?.scrollTo({ top: 0 });
      judulLangkahRef.current?.focus();
    });
  };

  const tampilkanGalat = (fields: string[]) => {
    const errors = form.formState.errors as Record<string, { message?: string } | undefined>;
    const daftar = fields
      .filter((f) => errors[f]?.message)
      .map((f) => ({ field: f, pesan: errors[f]!.message! }));
    setRingkasanGalat(daftar);
    if (daftar.length > 1) requestAnimationFrame(() => ringkasanRef.current?.focus());
    else if (daftar.length === 1) requestAnimationFrame(() => document.getElementById(daftar[0].field)?.focus());
  };

  const lanjut = async () => {
    const fields = FIELD_LANGKAH[jenis][langkah] as (keyof NilaiForm)[];
    const ok = fields.length ? await form.trigger(fields) : true;
    if (!ok) return tampilkanGalat(fields);
    pindahLangkah(Math.min(4, langkah + 1));
  };

  /** Simulasi unggahan (prototipe): file tidak pernah meninggalkan browser. */
  const simulasiUnggah = async () => {
    if (!berkas.length) return 0;
    setFase("mengunggah");
    setProgres(berkas.map(() => 0));
    let gagal = 0;
    for (let i = 0; i < berkas.length; i++) {
      const akanGagal = process.env.NODE_ENV !== "production" && berkas[i].name.toLowerCase().includes("uji-gagal");
      for (let pr = 20; pr <= 100; pr += 20) {
        await new Promise((r) => setTimeout(r, 120));
        if (akanGagal && pr >= 60) break;
        setProgres((s) => s.map((v, j) => (j === i ? pr : v)));
      }
      if (akanGagal) gagal++;
    }
    return gagal;
  };

  const kirim = async () => {
    const fields = FIELD_LANGKAH[jenis][4] as (keyof NilaiForm)[];
    const ok = await form.trigger();
    if (!ok) {
      // Galat di langkah sebelumnya (mis. setelah mengubah data): arahkan ke langkah pertama yang bermasalah.
      const errors = form.formState.errors as Record<string, unknown>;
      const langkahGalat = FIELD_LANGKAH[jenis].findIndex((fs) => fs.some((f) => errors[f]));
      if (langkahGalat >= 0 && langkahGalat < 4) {
        pindahLangkah(langkahGalat);
        requestAnimationFrame(() => tampilkanGalat(FIELD_LANGKAH[jenis][langkahGalat]));
        return;
      }
      return tampilkanGalat(fields);
    }
    setGalatKirim(null);
    setFase("mengirim");
    idempotensi.current ??= crypto.randomUUID();
    let balasan: HasilKirim;
    try {
      balasan = await kirimPengajuanTiruan({
        jenis,
        nilai: form.getValues(),
        jumlahLampiran: berkas.length,
        idempotensi: idempotensi.current,
      });
    } catch {
      balasan = {
        ok: false,
        jenisGalat: "server",
        pesan: "Koneksi terputus. Isian Anda masih ada. Periksa koneksi, lalu tekan Kirim lagi.",
      };
    }
    if (!balasan.ok) {
      setFase("isi");
      setGalatKirim(balasan.pesan);
      return;
    }
    const gagal = await simulasiUnggah();
    draf.hapus(jenis);
    setLampiranGagal(gagal);
    setHasil(balasan);
    setFase("berhasil");
  };

  const judulForm = jenis === "pelanggaran" ? "Laporkan Pelanggaran" : "Sampaikan Aspirasi";
  const Judul = p.judulSebagai ?? "h2";
  const Ikon = jenis === "pelanggaran" ? Shield : Lightbulb;
  const judulLangkah = JUDUL_LANGKAH[jenis];
  const sibuk = fase === "mengirim" || fase === "mengunggah";

  const isiLangkah = [
    <LangkahKategoriJudul key="1" jenis={jenis} kategori={p.kategori} />,
    jenis === "pelanggaran" ? <LangkahKronologi key="2" hariIni={hariIni} /> : <LangkahKondisi key="2" />,
    jenis === "pelanggaran" ? (
      <LangkahLampiran key="3" jenis={jenis} berkas={berkas} setBerkas={setBerkas} />
    ) : (
      <LangkahUsulan key="3" />
    ),
    jenis === "pelanggaran" ? (
      <LangkahKontak key="4" jenis={jenis} />
    ) : (
      <div key="4" className="flex flex-col gap-8">
        <LangkahLampiran jenis={jenis} berkas={berkas} setBerkas={setBerkas} />
        <hr className="border-ivory-200" />
        <LangkahKontak jenis={jenis} />
      </div>
    ),
    <LangkahTinjau key="5" jenis={jenis} kategori={p.kategori} berkas={berkas} keLangkah={pindahLangkah} />,
  ];

  return (
    <FormProvider {...form}>
      <div className="flex h-full min-h-0 flex-col">
        {/* Kepala: navy agar indikator langkah emas terlihat (dok. 06 §4.3). */}
        <header className="tema-malam shrink-0 px-4 pt-4 pb-3 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Ikon className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
              <Judul
                id={p.judulSebagai ? undefined : p.idJudul}
                data-judul-form=""
                tabIndex={-1}
                className="font-display text-lg font-extrabold text-ivory-50 outline-none"
              >
                {judulForm}
              </Judul>
            </div>
            {p.slotTutup}
          </div>
          {fase !== "berhasil" && (
            <div className="mt-3">
              <p className="text-sm text-ivory-200" aria-live="polite">
                Langkah {langkah + 1} dari 5 · <span className="font-semibold text-ivory-100">{judulLangkah[langkah]}</span>
              </p>
              <ol className="mt-2 grid grid-cols-5 gap-1.5" aria-hidden="true">
                {judulLangkah.map((j, i) => (
                  <li
                    key={j}
                    className={cn(
                      "h-1.5 rounded-full",
                      i < langkah ? "bg-ivory-100" : i === langkah ? "bg-gold-500" : "bg-navy-600",
                    )}
                  />
                ))}
              </ol>
            </div>
          )}
        </header>

        {/* Tanpa padding bawah: sticky menempel di tepi dalam padding, jadi padding bawah
            membuat kaki form berhenti di atas dasar layar dan isi terlihat di bawahnya. */}
        <div ref={isiRef} className="min-h-0 flex-1 overflow-y-auto bg-ivory-50 px-4 pt-5 sm:px-6">
          {fase === "berhasil" && hasil ? (
            <KredensialBerhasil
              jenis={jenis}
              nomorReferensi={hasil.nomorReferensi}
              kodeAkses={hasil.kodeAkses}
              tiruan={hasil.tiruan}
              lampiranGagal={lampiranGagal}
              tersimpan={tersimpan}
              setTersimpan={setTersimpan}
              onTutup={p.onSelesai}
              onKePelacakan={p.onKePelacakan}
            />
          ) : tawaranDraf ? (
            <div className="flex flex-col gap-4 pb-5" role="alertdialog" aria-labelledby="draf-judul">
              <h3 id="draf-judul" className="font-display text-xl font-extrabold text-navy-900">
                Lanjutkan isian sebelumnya?
              </h3>
              <p className="text-base text-navy-ink-muted">
                Ada isian yang belum terkirim dari sesi ini. Isian hanya tersimpan di memori tab ini dan akan hilang bila tab
                ditutup.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className={kelasTombolPrimer}
                  autoFocus
                  onClick={() => {
                    const d = draf.ambil(jenis);
                    if (d) {
                      form.reset({ ...NILAI_AWAL, ...(d.nilai as Partial<NilaiForm>) }, { keepDefaultValues: true });
                      setBerkas(d.berkas);
                      setLangkah(d.langkah);
                    }
                    setTawaranDraf(false);
                  }}
                >
                  Lanjutkan mengisi
                </button>
                <button
                  type="button"
                  className={kelasTombolSekunder}
                  onClick={() => {
                    draf.hapus(jenis);
                    setTawaranDraf(false);
                  }}
                >
                  Mulai baru
                </button>
              </div>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                if (sibuk) return;
                if (langkah < 4) void lanjut();
                else void kirim();
              }}
              aria-labelledby="judul-langkah"
              className="flex flex-col gap-6"
            >
              {langkah === 0 && (
                <details open className="group rounded-lg border border-ivory-200 bg-ivory-100 p-3 text-sm text-navy-900">
                  <summary className="cursor-pointer font-semibold marker:text-navy-700">
                    {jenis === "pelanggaran" ? "Kerahasiaan laporan Anda" : "Tentang publikasi aspirasi"}
                  </summary>
                  <p className="mt-2 leading-relaxed">
                    {jenis === "pelanggaran" ? (
                      <>
                        Anda tidak perlu membuat akun atau menuliskan nama. Kami tidak menyimpan alamat IP bersama laporan.
                        Meski begitu, <strong>kami tidak dapat menjamin anonimitas sepenuhnya</strong>: identitas bisa
                        diketahui dari isi cerita, lampiran, atau jaringan yang Anda pakai. Laporan asli, identitas, dan
                        bukti tidak pernah dipublikasikan.{" "}
                        <a href="/kerahasiaan" target="_blank" rel="noreferrer noopener" className={kelasTautan}>
                          Pelajari lebih lanjut
                        </a>
                      </>
                    ) : (
                      <>
                        Aspirasi dapat dipublikasikan di Peta Suara setelah dikurasi petugas, hanya jika Anda mengizinkan.
                        Informasi pribadi dihapus dan nama Anda tidak ditampilkan.
                      </>
                    )}
                  </p>
                </details>
              )}

              <h3
                id="judul-langkah"
                ref={judulLangkahRef}
                tabIndex={-1}
                className="font-display text-xl font-extrabold text-navy-900 outline-none"
              >
                {judulLangkah[langkah]}
              </h3>

              {ringkasanGalat.length > 1 && (
                <div
                  ref={ringkasanRef}
                  tabIndex={-1}
                  role="alert"
                  className="rounded-lg border-2 border-err bg-err-bg p-3 text-sm text-err outline-none"
                >
                  <p className="flex items-center gap-1.5 font-semibold">
                    <CircleAlert className="size-4" aria-hidden="true" />
                    Ada {ringkasanGalat.length} isian yang perlu diperbaiki:
                  </p>
                  <ul className="mt-1.5 list-disc pl-6">
                    {ringkasanGalat.map((g) => (
                      <li key={g.field}>
                        <a
                          href={`#${g.field}`}
                          className="underline underline-offset-2"
                          onClick={(e) => {
                            e.preventDefault();
                            document.getElementById(g.field)?.focus();
                          }}
                        >
                          {LABEL_FIELD[g.field] ?? g.field}
                        </a>
                        : {g.pesan}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Isian jebakan untuk bot: tersembunyi dari pengguna dan pembaca layar. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Situs web
                  <input tabIndex={-1} autoComplete="off" {...form.register("situs")} />
                </label>
              </div>

              <fieldset disabled={sibuk} className="contents">
                {isiLangkah[langkah]}
              </fieldset>

              {galatKirim && (
                <div role="alert" className="flex items-start gap-2 rounded-lg border-2 border-err bg-err-bg p-3 text-sm text-err">
                  <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>
                    <strong>{galatKirim}</strong>
                  </p>
                </div>
              )}

              {fase === "mengunggah" && (
                <div className="flex flex-col gap-2 rounded-lg border border-ivory-200 bg-white p-3" aria-live="polite">
                  <p className="text-sm font-semibold text-navy-900">Mengunggah lampiran (simulasi prototipe)…</p>
                  {progres.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-navy-900">
                      <span className="w-28 shrink-0">lampiran-{i + 1}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ivory-200" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={`Lampiran ${i + 1}`}>
                        <div className="h-full rounded-full bg-navy-900 transition-[width]" style={{ width: `${v}%` }} />
                      </div>
                      <span className="w-10 text-right tabular-nums">{v}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Kaki: menempel di bawah area gulir agar tetap terlihat saat keyboard terbuka. */}
              <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-between gap-3 border-t border-ivory-200 bg-ivory-50/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6">
                {langkah > 0 ? (
                  <button type="button" onClick={() => pindahLangkah(langkah - 1)} className={kelasTombolSekunder} disabled={sibuk}>
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Kembali
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  {jenis === "pelanggaran" && langkah === 3 && (
                    <button
                      type="button"
                      className={kelasTombolSekunder}
                      onClick={() => {
                        form.setValue("nama", "");
                        form.setValue("email", "");
                        form.clearErrors(["nama", "email"]);
                        pindahLangkah(4);
                      }}
                    >
                      Lewati
                    </button>
                  )}
                  <button type="submit" className={kelasTombolPrimer} disabled={sibuk} aria-busy={sibuk}>
                    {sibuk ? (
                      <>
                        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                        {fase === "mengunggah" ? "Mengunggah…" : "Mengirim…"}
                      </>
                    ) : langkah < 4 ? (
                      <>
                        Lanjut
                        <ArrowRight className="size-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <Check className="size-4" aria-hidden="true" />
                        {jenis === "pelanggaran" ? "Kirim Laporan" : "Kirim Aspirasi"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
