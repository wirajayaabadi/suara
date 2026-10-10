import type { Metadata } from "next";
import { Suspense } from "react";
import { HeaderPublik } from "@/components/tata-letak/HeaderPublik";
import { PetaSuara } from "@/features/peta/PetaSuara";
import { bacaStatePeta, keFilter, kunciBlok } from "@/features/peta/model/url";
import { ambilDatasetPeta, ambilItemBlok, ambilKonten } from "@/server/dal/publik";

export const metadata: Metadata = {
  title: "Peta Suara",
  description: "Pengelompokan pengajuan yang telah disetujui untuk publik menurut jenis, kategori, dan periode.",
};

/**
 * Peta Suara (dok. 05 §3). Kerangka halaman statis; isi bergantung pada `searchParams`
 * sehingga dirender di dalam <Suspense> (Cache Components).
 */
export default function Halaman({ searchParams }: PageProps<"/pemetaan">) {
  return (
    <div className="flex min-h-svh flex-col bg-ivory-100">
      <HeaderPublik>
        <h1 className="font-display text-3xl font-extrabold text-ivory-50 sm:text-4xl">Peta Suara</h1>
        <p className="max-w-3xl text-sm text-navy-300 sm:text-base">
          Pengelompokan pengajuan yang telah disetujui untuk publik menurut jenis, kategori, dan periode. Ini bukan peta lokasi.
        </p>
      </HeaderPublik>
      <main id="konten" className="flex flex-1 flex-col">
        <Suspense fallback={<KerangkaPeta />}>
          <IsiPeta searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function IsiPeta({ searchParams }: Pick<PageProps<"/pemetaan">, "searchParams">) {
  const state = bacaStatePeta(await searchParams);
  const filter = keFilter(state);
  const [dataset, daftar, konten] = await Promise.all([
    ambilDatasetPeta(filter),
    state.blok ? ambilItemBlok(filter, state.blok, state.hal) : null,
    state.blok && state.item ? ambilKonten(state.item) : null,
  ]);
  return (
    <PetaSuara
      state={state}
      dataset={dataset}
      daftarItem={state.blok && daftar ? { kunci: `${kunciBlok(state.blok)}#${state.hal}`, data: daftar } : null}
      konten={konten}
    />
  );
}

function KerangkaPeta() {
  return (
    <div className="flex flex-1 flex-col" aria-busy="true">
      <div className="tema-malam h-[118px]" />
      <div className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6">
        <div className="grid h-[60svh] place-items-center rounded-xl border border-ivory-200 bg-ivory-50 text-sm text-navy-ink-muted">
          Memuat Peta Suara…
        </div>
      </div>
    </div>
  );
}
