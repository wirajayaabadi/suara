import { expect, test, type Page } from "@playwright/test";

/*
 * E2E Peta Suara (dok. 05 §7, AC-P). Data contoh skenario “normal”, tanggal acuan 9 Okt 2026.
 */

const peta = (page: Page) => page.locator("[data-peta-tampilan]");
const roof = (page: Page, id: string) => page.locator(`[role=button][data-slot="${id}"]`);
const BLOK_WB = "WB~wb-pungli~2026-Q1";

/** Buka halaman dan tunggu hidrasi agar klik/drag/keyboard ditangani React. */
async function buka(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator("[data-terhidrasi=true]")).toBeAttached();
}

/** Atap balok berisi yang benar-benar terlihat (tidak tertutup balok lain). */
async function atapTerlihat(page: Page, jenis: "WB" | "ASP"): Promise<string> {
  const id = await page.evaluate((j) => {
    for (const el of document.querySelectorAll(`[role=button][data-slot^="${j}~"]`)) {
      if (el.getAttribute("data-jumlah") === "0") continue;
      const r = el.getBoundingClientRect();
      if (document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el) return el.getAttribute("data-slot");
    }
    return null;
  }, jenis);
  expect(id).not.toBeNull();
  return id!;
}

test("AC-P1: HTML server memuat kedua kelompok; WB di kiri, Aspirasi di kanan", async ({ page, request }) => {
  const html = await (await request.get("/pemetaan")).text();
  expect(html).toContain("WHISTLEBLOWING");
  expect(html).toContain("ASPIRASI");
  expect(html).toMatch(/role="button"[^>]*data-slot|data-slot="[^"]+"[^>]*role="button"/);

  await page.setViewportSize({ width: 1280, height: 800 });
  await buka(page, "/pemetaan");
  const wb = page.locator("svg text", { hasText: "WHISTLEBLOWING" });
  const asp = page.locator("svg text", { hasText: "ASPIRASI" });
  await expect(wb).toBeInViewport();
  await expect(asp).toBeInViewport();
  expect((await wb.boundingBox())!.x).toBeLessThan((await asp.boundingBox())!.x);
});

test("AC-P2/P13: balok berisi tepat 3 bidang; elemen SVG ≤ 1.000", async ({ page }) => {
  await buka(page, "/pemetaan");
  const hasil = await page.evaluate(() => {
    const per = new Map<string, number>();
    for (const el of document.querySelectorAll("polygon[data-slot]")) {
      const id = el.getAttribute("data-slot")!;
      per.set(id, (per.get(id) ?? 0) + 1);
    }
    const berisi = [...document.querySelectorAll("[role=button][data-slot]")].filter((e) => e.getAttribute("data-jumlah") !== "0");
    return {
      salah: berisi.filter((e) => per.get(e.getAttribute("data-slot")!) !== 3).length,
      berisi: berisi.length,
      elemen: document.querySelectorAll("[data-peta-tampilan] svg *").length,
    };
  });
  expect(hasil.berisi).toBeGreaterThan(10);
  expect(hasil.salah).toBe(0);
  expect(hasil.elemen).toBeLessThanOrEqual(1000);
});

test("AC-P3: drag berhenti di 0,24 dan 0,81 rad; klik ganda mereset; ukuran tetap", async ({ page }) => {
  await buka(page, "/pemetaan");
  const svg = peta(page).locator("svg");
  const kotakAwal = (await svg.boundingBox())!;
  const pusat = { x: kotakAwal.x + kotakAwal.width / 2, y: kotakAwal.y + 40 };

  await page.mouse.move(pusat.x, pusat.y);
  await page.mouse.down();
  await page.mouse.move(pusat.x + 400, pusat.y, { steps: 10 });
  await page.mouse.up();
  await expect(peta(page)).toHaveAttribute("data-yaw", "0.810");
  await expect(page.getByRole("button", { name: "Reset sudut" })).toBeVisible();
  const kotakMaks = (await svg.boundingBox())!;

  await page.mouse.move(pusat.x, pusat.y);
  await page.mouse.down();
  await page.mouse.move(pusat.x - 600, pusat.y, { steps: 10 });
  await page.mouse.up();
  await expect(peta(page)).toHaveAttribute("data-yaw", "0.240");
  expect(Math.abs((await svg.boundingBox())!.width - kotakMaks.width)).toBeLessThanOrEqual(kotakMaks.width * 0.02);

  await page.mouse.dblclick(pusat.x, pusat.y);
  await expect(peta(page)).toHaveAttribute("data-yaw", (Math.PI / 6).toFixed(3));
  await expect(page.getByRole("button", { name: "Reset sudut" })).toBeHidden();
});

test("AC-P5/P7: drag di atas balok tidak memilih; klik memilih, cincin + panel + URL", async ({ page }) => {
  await buka(page, "/pemetaan");
  const id = await atapTerlihat(page, "ASP");
  const kotak = (await roof(page, id).boundingBox())!;
  const x = kotak.x + kotak.width / 2;
  const y = kotak.y + kotak.height / 2;
  expect(id).toMatch(/^ASP~/);

  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 30, y, { steps: 5 });
  await page.mouse.up();
  await expect(page).not.toHaveURL(/blok=/);

  // Sudut sudah berubah karena drag; cari ulang atap yang terlihat lalu klik (gerak 0px).
  const id2 = await atapTerlihat(page, "ASP");
  await roof(page, id2).click();
  await expect(page).toHaveURL(/blok=ASP/);
  const terpilih = page.locator("[role=button][aria-pressed=true]");
  await expect(terpilih).toHaveCount(1);
  const nama = (await terpilih.getAttribute("aria-label"))!;
  expect(nama).toMatch(/^Kelompok Aspirasi, .+, .+, \d+ pengajuan publik$/);
  await expect(page.getByRole("complementary", { name: "Detail Peta Suara" }).getByRole("heading", { level: 2 })).toBeFocused();
});

test("AC-P6: hover menampilkan tooltip kelompok, kategori, periode, jumlah", async ({ page }) => {
  await buka(page, "/pemetaan");
  const id = await atapTerlihat(page, "WB");
  await roof(page, id).hover();
  const tip = page.locator("[data-peta-tampilan] > div[role=presentation]");
  await expect(tip).toContainText("Whistleblowing");
  await expect(tip).toContainText(/\d+ pengajuan publik/);
});

test("AC-P18/P19: item WB dari URL memuat penafian; state dipulihkan", async ({ page }) => {
  await buka(page, `/pemetaan?tampilan=daftar&fokus=WB&blok=${encodeURIComponent(BLOK_WB)}`);
  await expect(page.getByRole("button", { name: "Daftar", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Whistleblowing", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("table")).toHaveCount(1);
  const panel = page.getByRole("complementary", { name: "Detail Peta Suara" });
  await expect(panel.getByRole("heading", { name: /Pungutan tidak resmi · Trw I 2026/ })).toBeVisible();
  await expect(panel).toContainText("Publikasi tidak berarti dugaan terbukti.");

  await panel.getByRole("listitem").getByRole("button").first().click();
  await expect(page).toHaveURL(/item=R-\d{4}/);
  await expect(panel.getByRole("heading", { name: "Ringkasan tersamar" })).toBeVisible();
  await expect(panel).toContainText("Publikasi tidak berarti dugaan terbukti.");

  // Muat ulang: tampilan, fokus, blok, dan item tetap sama.
  await page.reload();
  await expect(panel.getByRole("heading", { name: "Ringkasan tersamar" })).toBeVisible();
  await panel.getByRole("button", { name: "Kembali ke daftar" }).click();
  await expect(page).not.toHaveURL(/item=/);
});

test("AC-P11: total sama di Isometrik, 2D, dan Daftar; pilihan dipertahankan", async ({ page }) => {
  await buka(page, `/pemetaan?blok=${encodeURIComponent(BLOK_WB)}`);
  const jumlahIso = await page.evaluate(() =>
    [...document.querySelectorAll("[role=button][data-slot]")].reduce((a, e) => a + Number(e.getAttribute("data-jumlah")), 0),
  );
  const metrik = Number((await page.locator("dl dd").first().textContent())!.replace(/\D/g, ""));
  expect(jumlahIso).toBe(metrik);

  await page.getByRole("button", { name: "2D", exact: true }).click();
  await expect(peta(page)).toHaveAttribute("data-peta-tampilan", "2d");
  await expect(roof(page, BLOK_WB)).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Daftar", exact: true }).click();
  await expect(page).toHaveURL(/tampilan=daftar/);
  const totalDaftar = await page.locator("tfoot td:last-child").allTextContents();
  expect(totalDaftar.reduce((a, t) => a + Number(t), 0)).toBe(metrik);
  await expect(page.locator(`[data-fokus-blok="${BLOK_WB}"]`)).toHaveAttribute("aria-pressed", "true");
});

test("AC-P17/A2: Daftar dapat diselesaikan hanya dengan keyboard", async ({ page }) => {
  await buka(page, "/pemetaan?tampilan=daftar");
  const sel = page.locator(`[data-fokus-blok="${BLOK_WB}"]`);
  await sel.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("complementary", { name: "Detail Peta Suara" });
  await expect(panel.getByRole("heading", { level: 2 })).toBeFocused();
  await expect(panel.getByRole("listitem").getByRole("button").first()).toBeVisible();
  await page.keyboard.press("Tab");
  // Tab berikutnya berada di daftar item; Enter membuka ringkasan.
  for (let i = 0; i < 5; i++) {
    if (await panel.getByRole("listitem").getByRole("button").first().evaluate((e) => e === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await page.keyboard.press("Enter");
  await expect(panel.getByRole("heading", { name: "Ringkasan tersamar" })).toBeVisible();
});

test("AC-A2/P10: roving focus — satu tab stop per kelompok, panah berpindah balok", async ({ page }) => {
  await buka(page, "/pemetaan");
  const tabStop = page.locator("[role=button][data-slot][tabindex='0']");
  await expect(tabStop).toHaveCount(2);
  const awal = tabStop.first();
  const idAwal = (await awal.getAttribute("data-slot"))!;
  await awal.focus();
  await page.keyboard.press("ArrowDown");
  const idBaru = await page.evaluate(() => document.activeElement?.getAttribute("data-slot"));
  expect(idBaru).not.toBe(idAwal);
  expect(idBaru!.startsWith(idAwal.split("~")[0])).toBe(true);
  await page.keyboard.press("PageDown");
  expect(await page.evaluate(() => document.activeElement?.getAttribute("data-slot"))).toMatch(/^ASP~/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/blok=ASP/);
});

test("AC-P16: fokus kelompok mengubah viewBox; Keduanya mengembalikannya", async ({ page }) => {
  await buka(page, "/pemetaan");
  const svg = peta(page).locator("svg");
  const awal = await svg.getAttribute("viewBox");
  await page.getByRole("button", { name: "Aspirasi", exact: true }).click();
  await expect(page).toHaveURL(/fokus=ASP/);
  await expect.poll(() => svg.getAttribute("viewBox")).not.toBe(awal);
  await page.getByRole("button", { name: "Keduanya" }).click();
  await expect.poll(() => svg.getAttribute("viewBox")).toBe(awal);
});

test("Filter: pencarian tanpa hasil menampilkan pesan dan Reset filter", async ({ page }) => {
  await buka(page, "/pemetaan");
  await page.getByRole("searchbox").fill("zzzz-tidak-ada");
  await expect(page).toHaveURL(/q=zzzz/);
  await expect(page.getByText("Tidak ada pengajuan publik yang cocok dengan filter ini.")).toBeVisible();
  await page.getByRole("button", { name: "Reset filter" }).first().click();
  await expect(page).not.toHaveURL(/q=/);
});

test("AC-D1: kiriman privat contoh tidak muncul di peta", async ({ request }) => {
  const html = await (await request.get("/pemetaan?tampilan=daftar")).text();
  expect(html).not.toMatch(/CNTH|WBS-\d{2}-|ASP-\d{2}-/);
});

test("@ponsel memilih balok membuka bottom sheet; tutup mengembalikan fokus", async ({ page }) => {
  await buka(page, "/pemetaan?tampilan=daftar");
  const sel = page.locator(`[data-fokus-blok="${BLOK_WB}"]`);
  await sel.click();
  const panel = page.getByRole("complementary", { name: "Detail Peta Suara" });
  await expect(panel).toBeInViewport();
  await panel.getByRole("button", { name: "Tutup detail" }).first().click();
  await expect(page).not.toHaveURL(/blok=/);
  await expect(sel).toBeFocused();
});
