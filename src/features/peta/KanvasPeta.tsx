"use client";

import * as React from "react";
import { LABEL_JENIS, type DatasetPeta, type Jenis } from "@/lib/schemas/publik";
import { cn } from "@/lib/utils";
import {
  AMBANG_DRAG,
  LANGKAH_SUDUT,
  NAIK_TERPILIH,
  PIKSEL_PER_RADIAN,
  PX_LABEL_DATAR,
  TAPAK,
  YAW_AWAL,
  batasDatar,
  batasIso,
  bentukSlot,
  bidangDasar,
  jepitYaw,
  keTitikSvg,
  labelPeriodePendek,
  lebarTeksEm,
  lintasTahun,
  lerpKotak,
  pemetaanLayar,
  pilihLabelTanpaTabrakan,
  posisiLabelKelompok,
  posisiLabelPeriode,
  proyeksi,
  tetangga,
  tinggiTarget,
  type Kotak,
  type Slot,
  type TataLetak,
  type Titik,
} from "./model/geometri";
import { melebihiSkala } from "./model/skala";
import type { Fokus } from "./model/url";
import { interpolasiAngka, interpolasiDeret, panjangSama, useTransisi } from "./useTransisi";

/*
 * Peta isometrik/2D dalam satu SVG (dok. 05 §3.5–§3.7, §3.10). Adaptasi pola Focus City:
 * proyeksi, drag sudut, pembeda drag/klik, tooltip HTML, dan morph 3 bidang → sel datar.
 * Data yang diterima hanya agregat publik dari server.
 */

const LABEL_JUMLAH = (n: number) => (n === 0 ? "belum ada pengajuan publik" : `${n} pengajuan publik`);

export const labelSlot = (s: Slot) =>
  `Kelompok ${LABEL_JENIS[s.jenis]}, ${s.kategoriLabel}, ${s.periodeLabel}, ${LABEL_JUMLAH(s.jumlah)}`;

const interpolasiKotak = (a: Kotak, b: Kotak, p: number) => lerpKotak(a, b, p);
const kotakSama = (a: Kotak, b: Kotak) => a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;

/** Ukuran wadah lewat ResizeObserver; nilai awal dipakai untuk HTML server. */
function useUkuran(ref: React.RefObject<HTMLElement | null>) {
  const [ukuran, setUkuran] = React.useState({ w: 880, h: 520 });
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      if (width > 0 && height > 0) setUkuran({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return ukuran;
}

const KELAS_ATAP = {
  WB: { "": "fill-wb-atap", "-h": "fill-wb-atap-hover", "-r": "fill-wb-atap-redup" },
  ASP: { "": "fill-asp-atap", "-h": "fill-asp-atap-hover", "-r": "fill-asp-atap-redup" },
} as const;

type Props = {
  tl: TataLetak;
  dataset: DatasetPeta;
  tampilan: "iso" | "2d";
  fokus: Fokus;
  yaw: number;
  setYaw: (yaw: number) => void;
  terpilih: string | null;
  onPilih: (s: Slot) => void;
  /** Kelompok yang tidak dipilih di filter jenis: diratakan dan diredupkan. */
  jenisRedup: Jenis[];
  gerakDikurangi: boolean;
  className?: string;
};

export function KanvasPeta(p: Props) {
  const { tl, dataset } = p;
  const wadahRef = React.useRef<HTMLDivElement>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const idPola = React.useId().replace(/:/g, "");
  const wadah = useUkuran(wadahRef);
  const instan = p.gerakDikurangi;

  // ------------------------------------------------------------ animasi
  const t = useTransisi(p.tampilan === "2d" ? 1 : 0, 380, instan, interpolasiAngka);
  const target = React.useMemo(() => {
    const dasar = tinggiTarget(tl, dataset);
    return tl.slot.map((s, i) => (s.id === p.terpilih && dasar[i] > 0 ? dasar[i] + NAIK_TERPILIH : dasar[i]));
  }, [tl, dataset, p.terpilih]);
  const tinggi = useTransisi(target, 300, instan, interpolasiDeret, panjangSama);

  const vbIso = React.useMemo(() => batasIso(tl, p.fokus), [tl, p.fokus]);
  const maksHuruf = Math.min(24, Math.max(...tl.kelompok.flatMap((g) => g.kategori.map((k) => k.label.length)), 6));
  const datar = React.useMemo(() => batasDatar(tl, p.fokus, wadah, maksHuruf), [tl, p.fokus, wadah, maksHuruf]);
  const vbTarget = React.useMemo(() => (p.tampilan === "2d" ? datar.kotak : vbIso), [p.tampilan, datar, vbIso]);
  const vb = useTransisi(vbTarget, p.tampilan === "2d" || t > 0 ? 380 : 300, instan, interpolasiKotak, (a, b) => !kotakSama(a, b));
  const { p: pxPerUnit, keLayar } = pemetaanLayar(vb, wadah);
  const em = (px: number) => px / pxPerUnit;

  // ------------------------------------------------------------ interaksi
  const [hover, setHover] = React.useState<string | null>(null);
  const [fokusKb, setFokusKb] = React.useState<string | null>(null);
  const [aktif, setAktif] = React.useState<Partial<Record<Jenis, string>>>({});
  const [menyeret, setMenyeret] = React.useState(false);
  const seret = React.useRef<{ x: number; yaw: number; id: number; aktif: boolean } | null>(null);
  const lewatiKlik = React.useRef(false);
  const rafSudut = React.useRef(0);
  const timerHover = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const bisaPutar = p.tampilan === "iso" && t === 0;

  const slotDari = (target: EventTarget | null) => {
    const id = (target as Element | null)?.closest?.("[data-slot]")?.getAttribute("data-slot");
    return id ? tl.slot.find((s) => s.id === id) : undefined;
  };

  const ubahSudut = (yaw: number) => {
    cancelAnimationFrame(rafSudut.current);
    rafSudut.current = requestAnimationFrame(() => p.setYaw(jepitYaw(yaw)));
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Interaksi baru: penanda “abaikan klik” dari drag sebelumnya tidak berlaku lagi
    // (browser tidak selalu mengirim click setelah drag dengan pointer capture).
    lewatiKlik.current = false;
    if (!bisaPutar || e.button !== 0) return;
    seret.current = { x: e.clientX, yaw: p.yaw, id: e.pointerId, aktif: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = seret.current;
    if (s && s.id === e.pointerId) {
      const dx = e.clientX - s.x;
      if (!s.aktif && Math.abs(dx) > AMBANG_DRAG) {
        s.aktif = true;
        setMenyeret(true);
        setHover(null);
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      if (s.aktif) ubahSudut(s.yaw + dx / PIKSEL_PER_RADIAN);
      return;
    }
    // Tooltip hanya untuk pointer halus, tidak saat menyeret, tidak untuk sentuhan.
    if (e.pointerType !== "mouse" || menyeret) return;
    const slot = slotDari(e.target);
    clearTimeout(timerHover.current);
    if (!slot) setHover(null);
    else if (slot.id !== hover) timerHover.current = setTimeout(() => setHover(slot.id), 80);
  };
  const akhiriSeret = (e: React.PointerEvent) => {
    const s = seret.current;
    if (!s || s.id !== e.pointerId) return;
    if (s.aktif) lewatiKlik.current = true;
    seret.current = null;
    setMenyeret(false);
  };
  const onClick = (e: React.MouseEvent) => {
    if (lewatiKlik.current) {
      lewatiKlik.current = false;
      return;
    }
    const slot = slotDari(e.target);
    if (slot) {
      setAktif((a) => ({ ...a, [slot.jenis]: slot.id }));
      p.onPilih(slot);
    }
  };

  React.useEffect(() => () => {
    clearTimeout(timerHover.current);
    cancelAnimationFrame(rafSudut.current);
  }, []);

  // Roving tabindex: satu tab stop per kelompok (dok. 05 §3.10).
  const tabStop = (jenis: Jenis) => {
    const pilihan = aktif[jenis] ?? (p.terpilih?.startsWith(`${jenis}~`) ? p.terpilih : undefined);
    if (pilihan && tl.slot.some((s) => s.id === pilihan)) return pilihan;
    return (tl.slot.find((s) => s.jenis === jenis && s.jumlah > 0) ?? tl.slot.find((s) => s.jenis === jenis))?.id;
  };
  const tabStops = new Set((["WB", "ASP"] as const).map(tabStop));

  const fokuskan = (s: Slot | undefined) => {
    if (!s) return;
    setAktif((a) => ({ ...a, [s.jenis]: s.id }));
    svgRef.current?.querySelector<SVGElement>(`[data-fokus-blok="${CSS.escape(s.id)}"]`)?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const slot = slotDari(e.target);
    if (slot) {
      const geser: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      };
      if (geser[e.key]) {
        e.preventDefault();
        fokuskan(tetangga(tl, slot, ...geser[e.key]));
        return;
      }
      if (e.key === "PageUp" || e.key === "PageDown") {
        e.preventDefault();
        const lain = slot.jenis === "WB" ? "ASP" : "WB";
        if (p.fokus === "semua" || p.fokus === lain) fokuskan(tl.slot.find((s) => s.id === tabStop(lain)));
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setAktif((a) => ({ ...a, [slot.jenis]: slot.id }));
        p.onPilih(slot);
        return;
      }
    }
    if (!bisaPutar) return;
    if (e.key === "q" || e.key === "Q") ubahSudut(p.yaw - LANGKAH_SUDUT);
    else if (e.key === "e" || e.key === "E") ubahSudut(p.yaw + LANGKAH_SUDUT);
    else if (e.key === "0") ubahSudut(YAW_AWAL);
  };

  // ------------------------------------------------------------ bentuk
  const kelompokTerlihat = (j: Jenis) => p.fokus === "semua" || p.fokus === j;
  const bentuk = tl.slot
    .map((s, i) => ({ s, h: tinggi[i] ?? 0, b: bentukSlot(s, p.yaw, t, tinggi[i] ?? 0) }))
    .sort((a, b) => a.b.kedalaman - b.b.kedalaman);
  const sorot = new Set([p.terpilih, fokusKb].filter(Boolean) as string[]);
  const tampilLabelIso = t < 0.02;
  const tampilLabelDatar = t > 0.98;

  // Label isometrik: label kelompok selalu tampil; label periode (kolom terakhir dan pertama)
  // hanya bila tidak bertabrakan dengan label lain.
  const denganTahun = lintasTahun(tl.periode);
  const labelIso = (() => {
    if (!tampilLabelIso) return [];
    const terlihat = tl.kelompok.filter((g) => kelompokTerlihat(g.jenis));
    const kandidat = [
      ...terlihat.map((g) => {
        const [x, y] = posisiLabelKelompok(g, tl.kolom);
        const teks = g.label.toUpperCase();
        return { kunci: `g-${g.jenis}`, teks, pos: proyeksi(x, y, 0, p.yaw), px: 13, kelompok: true, lebar: lebarTeksEm(teks) * 13 * 1.25 };
      }),
      ...terlihat.flatMap((g) =>
        (tl.kolom > 1 ? [tl.kolom - 1, 0] : [0]).map((c) => {
          const [x, y] = posisiLabelPeriode(g, c);
          const teks = labelPeriodePendek(tl.periode[c].kunci, denganTahun);
          return { kunci: `p-${g.jenis}-${c}`, teks, pos: proyeksi(x, y, 0, p.yaw), px: 11, kelompok: false, lebar: lebarTeksEm(teks) * 11 };
        }),
      ),
    ];
    const dipilih = pilihLabelTanpaTabrakan(kandidat.map((k) => ({ pos: keLayar(k.pos), lebar: k.lebar, tinggi: k.px + 4 })));
    return dipilih.map((i) => kandidat[i]);
  })();

  const labelPeriodeDatar = tampilLabelDatar
    ? tl.kelompok.filter((g) => kelompokTerlihat(g.jenis)).flatMap((g) => {
        const kandidat = tl.periode.map((per, c) => {
          const pos: Titik = [g.asalX + c + 0.5, -0.5];
          const teks = labelPeriodePendek(per.kunci, denganTahun);
          return { teks, pos, lebar: lebarTeksEm(teks) * PX_LABEL_DATAR };
        });
        // Prioritas: terbaru, terlama, lalu sisanya.
        const urut = [kandidat.length - 1, 0, ...kandidat.map((_, i) => i).slice(1, -1)].filter(
          (v, i, a) => a.indexOf(v) === i,
        );
        const dipilih = pilihLabelTanpaTabrakan(urut.map((i) => ({ pos: keLayar(kandidat[i].pos), lebar: kandidat[i].lebar, tinggi: 14 })));
        return dipilih.map((j) => ({ ...kandidat[urut[j]], kunci: `${g.jenis}-${urut[j]}` }));
      })
    : [];

  const potong = (teks: string) => (teks.length > maksHuruf ? `${teks.slice(0, maksHuruf - 1)}…` : teks);

  // Tooltip: hover (mouse) atau fokus keyboard, tidak saat menyeret.
  const idTip = !menyeret ? (fokusKb ?? hover) : null;
  const slotTip = idTip ? bentuk.find((x) => x.s.id === idTip) : undefined;
  const posTip = slotTip ? keLayar(slotTip.b.pusatAtap) : null;

  // Kelas lengkap (bukan string dirakit) agar terbaca pemindai Tailwind.
  const KELAS_SISI = {
    WB: { kiri: "fill-wb-kiri", kanan: "fill-wb-kanan", kiriRedup: "fill-wb-kiri-redup", kananRedup: "fill-wb-kanan-redup" },
    ASP: { kiri: "fill-asp-kiri", kanan: "fill-asp-kanan", kiriRedup: "fill-asp-kiri-redup", kananRedup: "fill-asp-kanan-redup" },
  } as const;

  return (
    <div
      ref={wadahRef}
      className={cn("relative touch-pan-y select-none", bisaPutar && (menyeret ? "cursor-grabbing" : "cursor-grab"), p.className)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={akhiriSeret}
      onPointerCancel={akhiriSeret}
      onPointerLeave={() => {
        clearTimeout(timerHover.current);
        setHover(null);
      }}
      onClick={onClick}
      onDoubleClick={() => bisaPutar && ubahSudut(YAW_AWAL)}
      onKeyDown={onKeyDown}
      data-peta-tampilan={p.tampilan}
      data-yaw={p.yaw.toFixed(3)}
      // Rasio wadah mengikuti peta isometrik agar tidak ada ruang kosong besar di ponsel.
      style={{ "--rasio-peta": `${vbIso.w} / ${vbIso.h}` } as React.CSSProperties}
    >
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="block size-full overflow-hidden"
        role="group"
        aria-label={`Peta Suara ${p.tampilan === "2d" ? "2D" : "isometrik"}. Gunakan tombol panah untuk berpindah balok, Page Up/Page Down untuk berpindah kelompok, Enter untuk memilih.`}
      >
        <defs>
          {(["WB", "ASP"] as const).map((j) =>
            (["", "-h", "-r"] as const).map((varian) => (
              <pattern
                key={`${j}${varian}`}
                id={`${idPola}-${j}${varian}`}
                patternUnits="userSpaceOnUse"
                width={0.2}
                height={0.2}
              >
                <rect
                  width={0.2}
                  height={0.2}
                  className={KELAS_ATAP[j][varian]}
                />
                {j === "WB" ? (
                  <path d="M-0.05,0.05 L0.05,-0.05 M0,0.2 L0.2,0 M0.15,0.25 L0.25,0.15" className="stroke-peta-outline" strokeWidth={0.018} strokeOpacity={0.35} />
                ) : (
                  <circle cx={0.1} cy={0.1} r={0.028} className="fill-peta-outline" fillOpacity={0.35} />
                )}
              </pattern>
            )),
          )}
        </defs>

        {/* Lapisan 1: bidang dasar */}
        <g aria-hidden="true">
          {tl.kelompok.map((g) => (
            <polygon
              key={g.jenis}
              points={keTitikSvg(bidangDasar(g, tl.kolom, p.yaw, t))}
              className="fill-peta-tanah"
              opacity={p.jenisRedup.includes(g.jenis) ? 0.5 : 1}
            />
          ))}
        </g>

        {/* Lapisan 2: balok terurut (painter’s algorithm) */}
        <g>
          {bentuk.map(({ s, h, b }) => {
            const tersembunyi = !kelompokTerlihat(s.jenis);
            // Balok lain diredupkan dengan warna opak (bukan opasitas) agar tidak tembus pandang.
            const diredupkan = Boolean(p.terpilih && p.terpilih !== s.id);
            const opasitas = p.jenisRedup.includes(s.jenis) ? 0.5 : 1;
            const kosong = s.jumlah === 0 && h <= 0.001;
            const kls = KELAS_SISI[s.jenis];
            const garis = cn("stroke-peta-outline", diredupkan && "[stroke-opacity:0.35]");
            return (
              <React.Fragment key={s.id}>
                {!kosong && h > 0.001 && t < 0.999 && (
                  <>
                    <polygon data-slot={s.id} points={keTitikSvg(b.kiri)} className={cn(diredupkan ? kls.kiriRedup : kls.kiri, garis)} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" opacity={opasitas} aria-hidden="true" />
                    <polygon data-slot={s.id} points={keTitikSvg(b.kanan)} className={cn(diredupkan ? kls.kananRedup : kls.kanan, garis)} strokeWidth={1} vectorEffect="non-scaling-stroke" strokeLinejoin="round" opacity={opasitas} aria-hidden="true" />
                  </>
                )}
                <polygon
                  data-slot={s.id}
                  data-fokus-blok={s.id}
                  data-jumlah={s.jumlah}
                  points={keTitikSvg(b.atap)}
                  role="button"
                  tabIndex={tersembunyi ? -1 : tabStops.has(s.id) ? 0 : -1}
                  aria-hidden={tersembunyi || undefined}
                  aria-label={labelSlot(s)}
                  aria-pressed={p.terpilih === s.id}
                  onFocus={(e) => {
                    if (e.currentTarget.matches(":focus-visible")) setFokusKb(s.id);
                    setAktif((a) => ({ ...a, [s.jenis]: s.id }));
                  }}
                  onBlur={() => setFokusKb((f) => (f === s.id ? null : f))}
                  className={cn("outline-none", kosong ? "fill-peta-tanah stroke-ink-border" : garis)}
                  fill={kosong ? undefined : `url(#${idPola}-${s.jenis}${diredupkan ? "-r" : hover === s.id ? "-h" : ""})`}
                  strokeWidth={1}
                  strokeDasharray={kosong ? "3 3" : undefined}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  opacity={opasitas}
                />
              </React.Fragment>
            );
          })}
        </g>

        {/* Lapisan 3: label (selalu tegak) */}
        <g aria-hidden="true" className="fill-navy-900 font-sans">
          {labelIso.map((l) => (
            <text
              key={l.kunci}
              x={l.pos[0]}
              y={l.pos[1]}
              textAnchor="middle"
              fontSize={em(l.px)}
              fontWeight={l.kelompok ? 800 : undefined}
              letterSpacing={l.kelompok ? em(1) : undefined}
              className={l.kelompok ? "font-display" : "fill-navy-ink-muted"}
            >
              {l.teks}
            </text>
          ))}
          {tampilLabelDatar && (
            <>
              {tl.kelompok
                .filter((g) => kelompokTerlihat(g.jenis))
                .map((g) => (
                  <React.Fragment key={g.jenis}>
                    <text x={g.asalX + tl.kolom / 2} y={g.baris + 1.1} textAnchor="middle" fontSize={em(13)} fontWeight={800} className="font-display">
                      {g.label.toUpperCase()}
                    </text>
                    {g.kategori.map((k, r) => (
                      <text
                        key={k.id}
                        x={g.jenis === "WB" ? g.asalX - 0.2 : g.asalX + tl.kolom + 0.2}
                        y={r + 0.5}
                        textAnchor={g.jenis === "WB" ? "end" : "start"}
                        dominantBaseline="central"
                        fontSize={em(PX_LABEL_DATAR)}
                      >
                        {potong(k.label)}
                      </text>
                    ))}
                  </React.Fragment>
                ))}
              {labelPeriodeDatar.map((l) => (
                <text key={l.kunci} x={l.pos[0]} y={l.pos[1]} textAnchor="middle" fontSize={em(PX_LABEL_DATAR)} className="fill-navy-ink-muted">
                  {l.teks}
                </text>
              ))}
              {bentuk
                .filter(({ s }) => s.jumlah > 0 && kelompokTerlihat(s.jenis))
                .map(({ s }) => (
                  <text
                    key={s.id}
                    x={s.x0 + TAPAK / 2}
                    y={s.y0 + TAPAK / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={Math.min(0.42, em(12))}
                    fontWeight={700}
                    className="pointer-events-none fill-navy-950"
                  >
                    {s.jumlah}
                  </text>
                ))}
            </>
          )}
        </g>

        {/* Lapisan 4: penanda ekstrem dan cincin pilihan/fokus (teratas) */}
        <g aria-hidden="true" className="pointer-events-none">
          {bentuk
            .filter(({ s, h }) => melebihiSkala(s.jumlah, dataset.skala) && h > 0 && kelompokTerlihat(s.jenis) && t < 0.98)
            .map(({ s, b }) => (
              <text key={s.id} x={b.pusatAtap[0]} y={b.pusatAtap[1] - em(8)} textAnchor="middle" fontSize={em(12)} fontWeight={800} className="fill-navy-950">
                ≋ {s.jumlah}
              </text>
            ))}
          {bentuk
            .filter(({ s }) => sorot.has(s.id))
            .map(({ s, b }) => (
              <React.Fragment key={s.id}>
                <polygon points={keTitikSvg(b.atap)} fill="none" className="stroke-navy-950" strokeWidth={8} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                <polygon points={keTitikSvg(b.atap)} fill="none" className="stroke-ivory-50" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              </React.Fragment>
            ))}
        </g>
      </svg>

      {slotTip && posTip && (
        <div
          role="presentation"
          className="pointer-events-none absolute z-10 max-w-[260px] -translate-x-1/2 -translate-y-full rounded-md border border-gold-500 bg-navy-950 px-3 py-2 text-sm text-ivory-50 shadow-lg"
          style={{
            left: Math.min(wadah.w - 130, Math.max(130, posTip[0])),
            top: Math.max(56, posTip[1] - 10),
          }}
        >
          <span className="block text-xs font-semibold tracking-wide text-gold-300 uppercase">{LABEL_JENIS[slotTip.s.jenis]}</span>
          <span className="block font-semibold">{slotTip.s.kategoriLabel}</span>
          <span className="block">
            {slotTip.s.periodeLabel} — {LABEL_JUMLAH(slotTip.s.jumlah)}
          </span>
        </div>
      )}
    </div>
  );
}
