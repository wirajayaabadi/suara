"use client";

/** Galat memuat Peta Suara (dok. 05 §3.8). Tidak menampilkan detail teknis. */
export default function GalatPeta({ retry }: { retry: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[672px] flex-1 flex-col items-start justify-center gap-4 px-4 py-16 text-navy-900">
      <h2 className="font-display text-2xl font-extrabold">Data belum dapat dimuat.</h2>
      <p className="text-base text-navy-ink-muted">Coba lagi dalam beberapa saat.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="min-h-11 rounded-full bg-navy-900 px-5 font-semibold text-ivory-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-500"
      >
        Coba lagi
      </button>
    </div>
  );
}
