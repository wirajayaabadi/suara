const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** “2026-10-09” → “9 Okt 2026”. Diurai manual agar tidak bergeser oleh zona waktu peramban. */
export function formatTanggal(tanggal: string): string {
  const [t, b, h] = tanggal.split("-").map(Number);
  return `${h} ${BULAN[b - 1]} ${t}`;
}

export const formatAngka = (n: number) => n.toLocaleString("id-ID");
