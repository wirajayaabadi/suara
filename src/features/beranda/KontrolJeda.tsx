"use client";

import { Pause, Play } from "lucide-react";
import { useAnimasi } from "@/lib/animasi/AnimasiProvider";

/** Tombol jeda animasi dekoratif. Disembunyikan bila sistem meminta gerak dikurangi. */
export function KontrolJeda() {
  const { jeda, setJeda, gerakDikurangi } = useAnimasi();
  if (gerakDikurangi) return null;
  const label = jeda ? "Putar animasi" : "Jeda animasi";
  return (
    <button
      type="button"
      aria-pressed={jeda}
      aria-label={label}
      title={label}
      onClick={() => setJeda(!jeda)}
      className="grid size-11 place-items-center rounded-full text-ivory-100 transition-colors hover:bg-ivory-100/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
    >
      {jeda ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
    </button>
  );
}
