"use client";

import type { Jenis } from "@/lib/schemas/publik";
import { cn } from "@/lib/utils";
import { labelSlot } from "./KanvasPeta";
import type { Slot, TataLetak } from "./model/geometri";
import type { Fokus } from "./model/url";

/**
 * Tampilan Daftar (dok. 05 §3.10): tabel HTML per jenis → kategori → periode. Jalur
 * navigasi lengkap tanpa hover, drag, atau SVG (AC-P17).
 */
export function TampilanDaftar({
  tl,
  fokus,
  terpilih,
  onPilih,
}: {
  tl: TataLetak;
  fokus: Fokus;
  terpilih: string | null;
  onPilih: (s: Slot) => void;
}) {
  const indeks = new Map(tl.slot.map((s) => [s.id, s]));
  const kelompok = tl.kelompok.filter((g) => fokus === "semua" || g.jenis === fokus);
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-5">
      {kelompok.map((g) => {
        const slotBaris = (kategoriId: string) =>
          tl.periode.map((per) => indeks.get(`${g.jenis}~${kategoriId}~${per.kunci}`)!);
        const totalKolom = tl.periode.map((_, c) => g.kategori.reduce((a, k) => a + slotBaris(k.id)[c].jumlah, 0));
        const total = totalKolom.reduce((a, b) => a + b, 0);
        return (
          <div
            key={g.jenis}
            role="region"
            aria-labelledby={`daftar-${g.jenis}`}
            tabIndex={0}
            className="overflow-x-auto rounded-lg border border-ivory-200 focus-visible:outline-2 focus-visible:outline-navy-900"
          >
            <table className="w-full min-w-max border-collapse bg-ivory-50 text-sm text-navy-900">
              <caption id={`daftar-${g.jenis}`} className="px-3 py-2 text-left font-display text-base font-extrabold">
                {g.label} <span className="text-sm font-normal text-navy-ink-muted">— jumlah pengajuan publik per kategori dan periode</span>
              </caption>
              <thead>
                <tr className="border-y border-ivory-200 bg-ivory-100">
                  <th scope="col" className="sticky left-0 bg-ivory-100 px-3 py-2 text-left font-semibold">
                    Kategori
                  </th>
                  {tl.periode.map((per) => (
                    <th key={per.kunci} scope="col" className="px-2 py-2 text-center font-semibold whitespace-nowrap">
                      {per.label}
                    </th>
                  ))}
                  <th scope="col" className="px-3 py-2 text-center font-semibold">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.kategori.map((k, r) => {
                  const baris = slotBaris(k.id);
                  return (
                    <tr key={k.id} className={cn("border-b border-ivory-200", r % 2 === 1 && "bg-ivory-100")}>
                      <th scope="row" className={cn("sticky left-0 px-3 py-1 text-left font-medium", r % 2 === 1 ? "bg-ivory-100" : "bg-ivory-50")}>
                        {k.label}
                      </th>
                      {baris.map((s) => (
                        <td key={s.id} className="px-1 py-1 text-center">
                          {s.jumlah > 0 ? (
                            <SelBlok s={s} terpilih={terpilih === s.id} onPilih={onPilih} />
                          ) : (
                            <>
                              <span className="text-navy-ink-muted" aria-hidden="true">
                                –
                              </span>
                              <span className="sr-only">0</span>
                            </>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-1 text-center font-semibold">{baris.reduce((a, s) => a + s.jumlah, 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-ivory-100 font-semibold">
                  <th scope="row" className="sticky left-0 bg-ivory-100 px-3 py-2 text-left">
                    Total
                  </th>
                  {totalKolom.map((n, c) => (
                    <td key={tl.periode[c].kunci} className="px-2 py-2 text-center">
                      {n}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">{total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}
    </div>
  );
}

function SelBlok({ s, terpilih, onPilih }: { s: Slot; terpilih: boolean; onPilih: (s: Slot) => void }) {
  const jenis: Jenis = s.jenis;
  return (
    <button
      type="button"
      data-fokus-blok={s.id}
      aria-label={labelSlot(s)}
      aria-pressed={terpilih}
      onClick={() => onPilih(s)}
      className={cn(
        "min-h-11 min-w-11 rounded-md px-2 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-900",
        jenis === "WB" ? "bg-wb-atap/40 hover:bg-wb-atap/70" : "bg-asp-atap/50 hover:bg-asp-atap/80",
        terpilih && "ring-2 ring-navy-950 ring-offset-2 ring-offset-ivory-50",
      )}
    >
      {s.jumlah}
    </button>
  );
}
