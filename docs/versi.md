# Versi paket

Dicatat saat inisialisasi (10 Okt 2026). Versi dikunci oleh `package-lock.json`.

| Paket | Versi | Catatan |
|---|---|---|
| Node.js | 24.4.1 | Lingkungan pengembangan |
| npm | 11.4.2 | — |
| next | 16.4.0 | Rilis stabil terbaru saat inisialisasi. `cacheComponents` dan `partialPrefetching` aktif (bawaan template). Prop `priority` pada `next/image` sudah usang: dipakai `loading="eager"`. |
| react / react-dom | 19.3.0 | Mengikuti Next.js |
| typescript | 5.9.3 | `strict: true` |
| tailwindcss | 4.3.3 | Dimuat lewat loader Turbopack (`@tailwindcss/turbopack`), bukan PostCSS |
| shadcn (CLI + `shadcn/tailwind.css`) | 4.21.4 | Gaya `radix-nova`, basis Radix |
| radix-ui | 1.7.0 | Primitif komponen shadcn |
| cn | 0.4.0 | Pengganti `clsx` + `tailwind-merge`, dirawat oleh shadcn (repo `shadcn-ui/cn`) |
| lucide-react | 1.54.0 | Ikon |
| class-variance-authority | 0.7.1 | Varian komponen |
| tw-animate-css | 1.4.0 | Dipasang oleh shadcn |
| eslint / eslint-config-next | 9.39.5 / 16.4.0 | Termasuk aturan `react-hooks/set-state-in-effect` |

## Temuan audit

`npm audit` melaporkan **5 kerentanan "high"** pada rantai `braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next`. Rantai ini **hanya dipakai saat pengembangan** (lint) dan tidak ikut ke bundle runtime. Saran `npm audit fix --force` justru menurunkan `eslint-config-next` ke 14.2.35 (perubahan besar), sehingga **tidak diterapkan**. Perlu ditinjau ulang setiap kali `eslint-config-next` diperbarui.

## Font

Poppins (600, 800), Plus Jakarta Sans, dan JetBrains Mono (600) dimuat lewat `next/font/google`. Berkas font di-*self-host* saat build, sehingga browser pengunjung tidak menghubungi Google.
