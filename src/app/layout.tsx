import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import { DrafFormProvider } from "@/features/formulir/DrafFormProvider";
import { AnimasiProvider } from "@/lib/animasi/AnimasiProvider";
import { DESKRIPSI_PRODUK, NAMA_PRODUK } from "@/lib/konstanta";
import "./globals.css";

// Semua font di-self-host oleh next/font: tidak ada permintaan ke Google saat runtime.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: NAMA_PRODUK, template: `%s · ${NAMA_PRODUK}` },
  description: DESKRIPSI_PRODUK,
};

export const viewport: Viewport = {
  themeColor: "#021e39",
};

/**
 * Slot `@modal` ada di layout root agar setiap grup rute ((publik), (formulir), (lacak))
 * memiliki rute lengkap. Form `/kirim/*` tampil sebagai dialog saat dibuka dari dalam situs
 * (intercepting route, dok. 05 §2.7); tautan langsung membuka halaman penuh.
 */
export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${poppins.variable} ${jetbrains.variable} h-full antialiased`}
    >
      {/* Ekstensi peramban (mis. Grammarly) menambah atribut di <body>; abaikan selisih atribut itu saja. */}
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <AnimasiProvider>
          <DrafFormProvider>
            {children}
            {modal}
          </DrafFormProvider>
        </AnimasiProvider>
      </body>
    </html>
  );
}
