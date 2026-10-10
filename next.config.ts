import type { NextConfig } from "next";

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
