/*
 * Mesin bubble wordmark (Canvas 2D).
 * Diadaptasi dari komponen `Bubbles` dalam "Astro Bubble Hero" oleh Kedhareswer Naidu,
 * 21st.dev — lisensi MIT. https://21st.dev/@kedhareswer/components/astro-bubble-hero
 *
 * Perubahan dari referensi (dok. 05 §4.1):
 * - batas jumlah bubble, DPR, dan fps per tier perangkat + penurunan tier otomatis;
 * - berhenti saat dijeda, tab tersembunyi, di luar layar, atau dialog terbuka;
 * - reduced motion: satu frame statis, tanpa drift/dorongan/pecah;
 * - pecah hanya untuk mouse, tanpa penghitung atau pengumuman aria-live;
 * - masker logo dan kode tak terpakai dibuang.
 */
import { buildBubbles, clamp, mulberry32, type Bubble } from "./acak";
import { PROFIL, tierLebihRendah, type Tier } from "./kemampuanPerangkat";
import { BATAS_TINGGI } from "./ukuranWordmark";

export type OpsiMesin = {
  canvas: HTMLCanvasElement;
  /** Elemen yang menerima event pointer (area wordmark). */
  host: HTMLElement;
  teks: string;
  seed: number;
  /** warna[0] = dasar huruf; sisanya warna bubble (boleh berulang sebagai bobot). */
  warna: string[];
  /** Porsi lebar yang dipakai kata. */
  fit: number;
  /** Posisi x awal teks, relatif lebar. */
  xRel: number;
  /** Posisi baseline, relatif tinggi. */
  baselineRel: number;
  density: number;
  scale: number;
  tier: Tier;
  gerakDikurangi: boolean;
  pecah: boolean;
  onFramePertama?: () => void;
};

export type Mesin = {
  setJeda: (jeda: boolean) => void;
  hancurkan: () => void;
};

type BubbleHidup = Bubble & { ox: number; oy: number; s: number };
type Percikan = { x: number; y: number; vx: number; vy: number; r: number; c: number; life: number };

const BATAS_WAKTU_GAMBAR_MS = 12;
const JENDELA_PENGUKURAN = 180; // ± 3 detik pada 60 fps

export function buatMesinBubble(o: OpsiMesin): Mesin {
  const ctx = o.canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D tidak tersedia");
  const canvas = o.canvas;
  const rand = mulberry32(o.seed ^ 0x5bd1e995);

  let tier = o.tier;
  let profil = PROFIL[tier];
  let w = 0;
  let h = 0;
  let dpr = 1;
  let list: BubbleHidup[] = [];
  let percikan: Percikan[] = [];
  let raf = 0;
  let berjalan = false;
  let terlihat = true;
  let jeda = false;
  let frameTerakhir = 0;
  let sudahFramePertama = false;
  let ukuranTeks = 0;
  let kunciTeks = "";
  let totalWaktu = 0;
  let jumlahFrame = 0;
  const pointer = { x: -1e4, y: -1e4, aktif: false, dx: 0, dy: 0 };

  const fontFamily = () => getComputedStyle(canvas).fontFamily || "sans-serif";

  const boleh = () => !o.gerakDikurangi && !jeda && terlihat && !document.hidden && w > 0;
  const dorongan = () => profil.dorongan && !o.gerakDikurangi && !jeda;

  function bangunUlang() {
    list = buildBubbles(o.seed, w, h, o.warna.length, o.density, o.scale, profil.maksBubble).map(
      (b) => ({ ...b, ox: 0, oy: 0, s: 1 }),
    );
    kunciTeks = "";
  }

  function gambar(t: number) {
    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.clearRect(0, 0, w, h);
    c.fillStyle = o.warna[0];
    c.fillRect(0, 0, w, h);

    const ts = t / 1000;
    const statis = o.gerakDikurangi || jeda;
    const R = Math.max(70, Math.min(h, w) * 0.34);
    const dorong = dorongan() && pointer.aktif;

    for (const b of list) {
      let tx = 0;
      let ty = 0;
      if (dorong) {
        const dx = b.x + b.ox - pointer.x;
        const dy = b.y + b.oy - pointer.y;
        const d = Math.hypot(dx, dy) || 1;
        const jangkau = R + b.r;
        if (d < jangkau) {
          const f = 1 - d / jangkau;
          const tekan = f * f * R * 0.6;
          tx = (dx / d) * tekan + pointer.dx * f * 0.6;
          ty = (dy / d) * tekan + pointer.dy * f * 0.6;
        }
      }
      if (statis) {
        b.ox = 0;
        b.oy = 0;
        b.s = 1;
      } else {
        b.ox += (tx - b.ox) * 0.09;
        b.oy += (ty - b.oy) * 0.09;
        b.s += (1 - b.s) * 0.07;
      }
      const wx = statis ? 0 : Math.sin(ts * b.sp + b.ph) * b.amp;
      const wy = statis ? 0 : Math.cos(ts * b.sp * 0.8 + b.ph) * b.amp;
      c.fillStyle = o.warna[b.c % o.warna.length];
      c.beginPath();
      c.arc(b.x + b.ox + wx, b.y + b.oy + wy, Math.max(0.1, b.r * b.s), 0, Math.PI * 2);
      c.fill();
    }
    pointer.dx *= 0.85;
    pointer.dy *= 0.85;

    if (percikan.length) {
      for (const p of percikan) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy = p.vy * 0.94 - 0.05;
        p.life -= 0.022;
        if (p.life <= 0) continue;
        c.fillStyle = o.warna[p.c % o.warna.length];
        c.beginPath();
        c.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        c.fill();
      }
      percikan = percikan.filter((p) => p.life > 0);
    }

    // Masker: hanya bagian di dalam huruf yang tersisa.
    const fam = fontFamily();
    const kunci = `${fam}|${o.teks}|${w}|${h}|${o.fit}`;
    if (kunci !== kunciTeks) {
      c.font = `800 100px ${fam}`;
      const lebar = c.measureText(o.teks).width || 1;
      // Batas tinggi disesuaikan untuk kata berhuruf kapital ("SUARA"); referensi memakai 1,32
      // untuk kata berhuruf campuran sehingga huruf kapital terpotong di pita yang pendek.
      ukuranTeks = Math.min((100 * w * o.fit) / lebar, h * BATAS_TINGGI);
      kunciTeks = kunci;
    }
    c.globalCompositeOperation = "destination-in";
    c.fillStyle = "#000";
    c.font = `800 ${ukuranTeks.toFixed(1)}px ${fam}`;
    c.textBaseline = "alphabetic";
    c.fillText(o.teks, w * o.xRel, h * o.baselineRel);
    c.globalCompositeOperation = "source-over";

    if (!sudahFramePertama) {
      sudahFramePertama = true;
      o.onFramePertama?.();
    }
  }

  function ukurKinerja(durasi: number) {
    if (tier === "rendah") return;
    totalWaktu += durasi;
    jumlahFrame += 1;
    if (jumlahFrame < JENDELA_PENGUKURAN) return;
    const rata = totalWaktu / jumlahFrame;
    totalWaktu = 0;
    jumlahFrame = 0;
    if (rata > BATAS_WAKTU_GAMBAR_MS) {
      // Turun satu tingkat dan tidak naik lagi selama sesi ini.
      tier = tierLebihRendah(tier);
      profil = PROFIL[tier];
      ubahUkuran();
    }
  }

  function loop(t: number) {
    raf = requestAnimationFrame(loop);
    if (profil.fpsMaks > 0 && t - frameTerakhir < 1000 / profil.fpsMaks - 1) return;
    frameTerakhir = t;
    const mulai = performance.now();
    gambar(t);
    ukurKinerja(performance.now() - mulai);
  }

  function mulai() {
    if (berjalan || !boleh()) return;
    berjalan = true;
    raf = requestAnimationFrame(loop);
  }

  function berhenti() {
    berjalan = false;
    cancelAnimationFrame(raf);
  }

  function segarkan() {
    if (boleh()) mulai();
    else {
      berhenti();
      if (w > 0) gambar(performance.now());
    }
  }

  function ubahUkuran() {
    if (!canvas.clientWidth || !canvas.clientHeight) return;
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    dpr = Math.min(profil.dprMaks, window.devicePixelRatio || 1);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    bangunUlang();
    gambar(performance.now());
    segarkan();
  }

  const posisiLokal = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };

  const saatGerak = (e: PointerEvent) => {
    if (!dorongan()) return;
    const [x, y] = posisiLokal(e);
    if (pointer.aktif) {
      pointer.dx = clamp(x - pointer.x, -40, 40);
      pointer.dy = clamp(y - pointer.y, -40, 40);
    }
    pointer.x = x;
    pointer.y = y;
    pointer.aktif = x >= -40 && y >= -40 && x <= w + 40 && y <= h + 40;
  };
  const saatKeluar = () => {
    pointer.aktif = false;
  };

  let titikTekan: [number, number] = [0, 0];
  const saatTekan = (e: PointerEvent) => {
    titikTekan = [e.clientX, e.clientY];
  };
  const saatLepas = (e: PointerEvent) => {
    if (!o.pecah || o.gerakDikurangi || jeda || e.pointerType !== "mouse") return;
    if (Math.hypot(e.clientX - titikTekan[0], e.clientY - titikTekan[1]) > 6) return;
    if ((e.target as HTMLElement | null)?.closest?.("a,button,input,label,select,textarea")) return;
    const [x, y] = posisiLokal(e);
    if (x < 0 || y < 0 || x > w || y > h) return;
    // Hanya bubble yang terlihat (di dalam huruf) yang bisa pecah.
    const px = ctx.getImageData(Math.round(x * dpr), Math.round(y * dpr), 1, 1).data;
    if (px[3] < 10) return;
    for (let i = list.length - 1; i >= 0; i--) {
      const b = list[i];
      if (Math.hypot(b.x + b.ox - x, b.y + b.oy - y) > b.r * b.s + 2) continue;
      const n = o.warna.length;
      const lama = b.c;
      b.c = 1 + ((b.c + Math.floor(rand() * Math.max(1, n - 2))) % Math.max(1, n - 1));
      b.s = 0;
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 2 + rand() * 0.5;
        const kec = 2 + rand() * 4;
        percikan.push({
          x: b.x + b.ox,
          y: b.y + b.oy,
          vx: Math.cos(a) * kec,
          vy: Math.sin(a) * kec,
          r: b.r * (0.18 + rand() * 0.22),
          c: lama,
          life: 1,
        });
      }
      break;
    }
  };

  const ro = new ResizeObserver(ubahUkuran);
  ro.observe(canvas);
  const io = new IntersectionObserver((entri) => {
    terlihat = entri.some((e) => e.isIntersecting);
    segarkan();
  });
  io.observe(canvas);
  document.addEventListener("visibilitychange", segarkan);
  o.host.addEventListener("pointermove", saatGerak, { passive: true });
  o.host.addEventListener("pointerleave", saatKeluar);
  o.host.addEventListener("pointerdown", saatTekan);
  o.host.addEventListener("pointerup", saatLepas);

  let hidup = true;
  // Font web yang selesai dimuat belakangan mengubah lebar kata.
  document.fonts?.ready.then(() => {
    if (!hidup) return;
    kunciTeks = "";
    if (!berjalan && w > 0) gambar(performance.now());
  });

  ubahUkuran();

  return {
    setJeda(j) {
      jeda = j;
      if (j) pointer.aktif = false;
      segarkan();
    },
    hancurkan() {
      hidup = false;
      berhenti();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", segarkan);
      o.host.removeEventListener("pointermove", saatGerak);
      o.host.removeEventListener("pointerleave", saatKeluar);
      o.host.removeEventListener("pointerdown", saatTekan);
      o.host.removeEventListener("pointerup", saatLepas);
    },
  };
}
