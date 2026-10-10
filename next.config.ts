import type { NextConfig } from "next";
import { pilihSumberData } from "./src/lib/sumber-data";

/*
 * Sumber data diumumkan sekali saat build/start agar tidak ada yang mengira data contoh adalah
 * data nyata (dok. 07 K3).
 */
const sumber = pilihSumberData();
if (sumber === "contoh") {
  console.log("ⓘ Sumber data: DATA CONTOH (sintetis). Basis data belum dikonfigurasi (DATABASE_URL_PUBLIC kosong).");
}

/*
 * Pemeriksaan saat build di Vercel (dok. 07 §5.1): lebih baik build gagal dengan pesan jelas
 * daripada aplikasi tayang lalu pelacakan gagal di tangan pengguna.
 */
if (process.env.VERCEL === "1") {
  const kurang: string[] = [];
  if ((process.env.SESI_PELACAKAN_RAHASIA ?? "").length < 32) kurang.push("SESI_PELACAKAN_RAHASIA (≥ 32 karakter)");
  if (!process.env.TRACKING_PEPPER) kurang.push("TRACKING_PEPPER");
  if (kurang.length) {
    throw new Error(`Variabel lingkungan Vercel belum lengkap: ${kurang.join(", ")}. Lihat docs/perencanaan/07-deploy-vercel.md §9.`);
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Halaman privat/sensitif: jangan diindeks dan jangan bocorkan URL lewat Referer (dok. 03 §11).
  async headers() {
    const privat = [
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Referrer-Policy", value: "no-referrer" },
    ];
    return [
      { source: "/lacak", headers: privat },
      { source: "/lacak/:jalur*", headers: privat },
      { source: "/kirim/:jalur*", headers: privat },
      { source: "/ringkasan", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/ringkasan/:jalur*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
