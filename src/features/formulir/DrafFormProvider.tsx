"use client";

import * as React from "react";
import type { JenisPengajuan } from "@/lib/schemas/kiriman";

/**
 * Draf form disimpan HANYA di memori (dok. 05 §2.7): tidak pernah ke localStorage,
 * sessionStorage, atau IndexedDB. Tujuannya agar isian tidak hilang bila dialog
 * tertutup lewat tombol Back. Draf hilang saat tab ditutup atau dimuat ulang.
 */
export type Draf = {
  nilai: Record<string, unknown>;
  langkah: number;
  berkas: File[];
};

type NilaiKonteks = {
  ambil: (jenis: JenisPengajuan) => Draf | undefined;
  simpan: (jenis: JenisPengajuan, draf: Draf) => void;
  hapus: (jenis: JenisPengajuan) => void;
};

const Konteks = React.createContext<NilaiKonteks | null>(null);

export function DrafFormProvider({ children }: { children: React.ReactNode }) {
  // Ref, bukan state: menyimpan draf tidak perlu memicu render ulang.
  const draf = React.useRef(new Map<JenisPengajuan, Draf>());
  const nilai = React.useMemo<NilaiKonteks>(
    () => ({
      ambil: (j) => draf.current.get(j),
      simpan: (j, d) => void draf.current.set(j, d),
      hapus: (j) => void draf.current.delete(j),
    }),
    [],
  );
  return <Konteks.Provider value={nilai}>{children}</Konteks.Provider>;
}

export function useDrafForm(): NilaiKonteks {
  const nilai = React.useContext(Konteks);
  if (!nilai) throw new Error("useDrafForm harus dipakai di dalam <DrafFormProvider>");
  return nilai;
}
