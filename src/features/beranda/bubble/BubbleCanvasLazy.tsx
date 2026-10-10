"use client";

import dynamic from "next/dynamic";
import { useAnimasi } from "@/lib/animasi/AnimasiProvider";

// Dipisah ke chunk sendiri dan tidak dirender di server (memakai API browser).
const BubbleCanvas = dynamic(() => import("./BubbleCanvas"), { ssr: false });

/** Tidak memuat mesin sama sekali bila pengguna meminta gerak dikurangi. */
export function BubbleCanvasLazy({ teks }: { teks: string }) {
  const { gerakDikurangi } = useAnimasi();
  if (gerakDikurangi) return null;
  return <BubbleCanvas teks={teks} />;
}
