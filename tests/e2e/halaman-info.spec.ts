import { expect, test } from "@playwright/test";

/* Halaman informasi (dok. 02 §9): tidak boleh ada klaim anonimitas absolut (AC-F11). */

const DILARANG = /100\s?%\s*anonim|tidak dapat dilacak|dijamin aman|sepenuhnya anonim/i;

for (const [url, judul] of [
  ["/faq", "Pertanyaan Umum"],
  ["/kebijakan-privasi", "Kebijakan Privasi"],
  ["/kerahasiaan", "Kerahasiaan"],
  ["/panduan", "Panduan"],
] as const) {
  test(`${url}: judul, daftar isi, dan tanpa klaim anonimitas absolut`, async ({ page }) => {
    await page.goto(url);
    await expect(page.getByRole("heading", { level: 1, name: judul })).toBeVisible();
    const isi = await page.locator("main").innerText();
    expect(isi).not.toMatch(DILARANG);
    // Setiap tautan daftar isi menuju bagian yang ada.
    const tautan = await page.getByRole("navigation", { name: "Isi halaman" }).getByRole("link").evaluateAll((a) => a.map((x) => x.getAttribute("href")!));
    expect(tautan.length).toBeGreaterThanOrEqual(4);
    for (const h of tautan) await expect(page.locator(h)).toHaveCount(1);
  });
}

test("/kerahasiaan menyatakan batas anonimitas dan memuat 7 sumber kebocoran", async ({ page }) => {
  await page.goto("/kerahasiaan");
  await expect(page.getByText("kami tidak dapat menjamin anonimitas sepenuhnya")).toBeVisible();
  await expect(page.locator("#batas article")).toHaveCount(7);
});

test("/panduan: tautan form membuka dialog dari dalam situs", async ({ page }) => {
  await page.goto("/panduan");
  await page.locator("#jenis").getByRole("link", { name: "Sampaikan Aspirasi" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/\/kirim\/aspirasi$/);
});

test("/panduan dan /kerahasiaan tidak memuat perkiraan hari maupun masa simpan", async ({ page }) => {
  for (const url of ["/panduan", "/kerahasiaan", "/faq", "/kebijakan-privasi"]) {
    await page.goto(url);
    const isi = await page.locator("main").innerText();
    expect(isi, url).not.toMatch(/\d+\s*hari|masa simpan|retensi|tahun setelah/i);
  }
});

test("/faq: pertanyaan dapat dibuka dengan keyboard", async ({ page }) => {
  await page.goto("/faq");
  const q = page.getByText("Apakah saya perlu membuat akun?");
  await q.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText(/Anda cukup mengisi form/)).toBeVisible();
});

test("/kontak tidak mengarang kontak: data kosong tampil “Belum diisi”", async ({ page }) => {
  await page.goto("/kontak");
  await expect(page.getByText("Belum diisi").first()).toBeVisible();
  await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
});

test("/kebijakan-privasi menyebut cookie sesi dan tidak ada analitik pihak ketiga", async ({ page }) => {
  await page.goto("/kebijakan-privasi");
  await expect(page.getByText("Cookie sesi pelacakan")).toBeVisible();
  await expect(page.getByText(/Tidak ada analitik/)).toBeVisible();
});
