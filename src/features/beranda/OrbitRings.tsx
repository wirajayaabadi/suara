/**
 * Dua garis orbit dekoratif (SVG + rotasi CSS 60/90 detik, berlawanan arah),
 * diadaptasi dari Astro Bubble Hero (MIT). Berhenti saat animasi dijeda
 * (`data-animasi="diam"`) atau saat gerak dikurangi (aturan global di globals.css).
 */
const putar =
  "origin-center [transform-box:view-box] animate-[spin_60s_linear_infinite] group-data-[animasi=diam]/anim:[animation-play-state:paused]";

export function OrbitRings() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="absolute"
        style={{ left: "38%", top: "-30%", width: "90cqi", height: "90cqi" }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <g className={putar}>
          <circle cx="50" cy="50" r="49" stroke="var(--orbit)" strokeWidth=".15" />
          <circle cx="99" cy="50" r=".9" fill="var(--gold-500)" />
        </g>
      </svg>
      <svg
        className="absolute"
        style={{ left: "-22%", top: "30%", width: "60cqi", height: "60cqi" }}
        viewBox="0 0 100 100"
        fill="none"
      >
        <g className={`${putar} [animation-direction:reverse] [animation-duration:90s]`}>
          <circle cx="50" cy="50" r="49" stroke="var(--orbit)" strokeWidth=".2" />
          <circle cx="50" cy="1" r="1.1" fill="var(--maroon-700)" />
          {Array.from({ length: 14 }, (_, i) => {
            const a = Math.PI * 0.62 + i * 0.075;
            return (
              <circle
                key={i}
                cx={50 + Math.cos(a) * 44}
                cy={50 + Math.sin(a) * 44}
                r={0.35 + (14 - i) * 0.06}
                fill="var(--gold-300)"
                opacity={0.25 + (14 - i) / 40}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
