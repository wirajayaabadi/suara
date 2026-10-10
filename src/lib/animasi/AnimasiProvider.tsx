"use client";

import * as React from "react";

const KUNCI_JEDA = "ruang-suara:animasi-jeda";

type NilaiAnimasi = {
  /** Pengguna menekan tombol jeda (disimpan per perangkat). */
  jeda: boolean;
  setJeda: (jeda: boolean) => void;
  /** Sistem meminta gerak dikurangi (`prefers-reduced-motion`). */
  gerakDikurangi: boolean;
  /** Dialog form terbuka: animasi dekoratif dihentikan sementara. */
  setDialogTerbuka: (terbuka: boolean) => void;
  /** Gabungan: animasi dekoratif harus diam. */
  diam: boolean;
};

const KonteksAnimasi = React.createContext<NilaiAnimasi | null>(null);

const EVENT_JEDA = "ruang-suara:animasi-jeda-berubah";

function bacaJedaTersimpan(): boolean {
  try {
    return window.localStorage.getItem(KUNCI_JEDA) === "1";
  } catch {
    return false;
  }
}

/** Preferensi jeda per perangkat; berubah lewat tombol jeda atau tab lain. */
function subscribeJeda(cb: () => void) {
  window.addEventListener(EVENT_JEDA, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT_JEDA, cb);
    window.removeEventListener("storage", cb);
  };
}

function subscribeGerak(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Menyediakan status jeda animasi untuk beranda. Membungkus anak dalam elemen
 * `group/anim` dengan `data-animasi` agar animasi CSS (orbit) ikut berhenti.
 */
export function AnimasiProvider({ children }: { children: React.ReactNode }) {
  const [jedaSesi, setJedaSesi] = React.useState<boolean | null>(null);
  const [dialogTerbuka, setDialogTerbuka] = React.useState(false);
  const gerakDikurangi = React.useSyncExternalStore(
    subscribeGerak,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const jedaTersimpan = React.useSyncExternalStore(subscribeJeda, bacaJedaTersimpan, () => false);
  // Jika penyimpanan diblokir, pilihan tetap berlaku untuk sesi ini lewat state lokal.
  const jeda = jedaSesi ?? jedaTersimpan;

  const setJeda = React.useCallback((nilai: boolean) => {
    setJedaSesi(nilai);
    try {
      if (nilai) window.localStorage.setItem(KUNCI_JEDA, "1");
      else window.localStorage.removeItem(KUNCI_JEDA);
      window.dispatchEvent(new Event(EVENT_JEDA));
    } catch {
      // Penyimpanan diblokir (mode privat): preferensi berlaku untuk sesi ini saja.
    }
  }, []);

  const diam = jeda || gerakDikurangi || dialogTerbuka;
  const nilai = React.useMemo(
    () => ({ jeda, setJeda, gerakDikurangi, setDialogTerbuka, diam }),
    [jeda, setJeda, gerakDikurangi, diam],
  );

  return (
    <KonteksAnimasi.Provider value={nilai}>
      <div className="group/anim contents" data-animasi={diam ? "diam" : "jalan"}>
        {children}
      </div>
    </KonteksAnimasi.Provider>
  );
}

export function useAnimasi(): NilaiAnimasi {
  const nilai = React.useContext(KonteksAnimasi);
  if (!nilai) throw new Error("useAnimasi harus dipakai di dalam <AnimasiProvider>");
  return nilai;
}

/** Versi opsional: mengembalikan null di luar <AnimasiProvider> (mis. halaman form penuh). */
export function useAnimasiOpsional(): NilaiAnimasi | null {
  return React.useContext(KonteksAnimasi);
}
