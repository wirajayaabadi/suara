import { expect, test } from "@playwright/test";

/* Daftar /aspirasi dan /ringkasan (dok. 02 §4.2). Data contoh skenario “normal”. */

test("/ringkasan: penafian di atas daftar, noindex, tiap kartu menuju detail", async ({ page, request }) => {
  const r = await request.get("/ringkasan");
  expect(r.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  await page.goto("/ringkasan");
  await expect(page.getByRole("heading", { level: 1, name: "Ringkasan Pelanggaran" })).toBeVisible();
  const penting = page.getByRole("complementary", { name: "Penting" });
  await expect(penting).toContainText("Publikasi tidak berarti dugaan terbukti.");
  const kartu = page.locator("article");
  expect(await kartu.count()).toBeGreaterThan(0);
  expect(await kartu.count()).toBeLessThanOrEqual(10);
  await kartu.first().getByRole("link").click();
  await expect(page).toHaveURL(/\/ringkasan\/R-\d{4}$/);
});

test("/aspirasi: paginasi lewat tautan, state di URL, halaman di luar batas dijepit", async ({ page }) => {
  await page.goto("/aspirasi");
  await expect(page.locator("article")).toHaveCount(10);
  await page.getByRole("navigation", { name: "Halaman daftar" }).getByRole("link", { name: "Berikutnya" }).click();
  await expect(page).toHaveURL(/hal=2/);
  await expect(page.getByText(/halaman 2 dari/)).toBeVisible();
  await page.goto("/aspirasi?hal=999");
  await expect(page.getByText(/halaman \d+ dari \d+/)).toBeVisible();
  await expect(page.locator("article").first()).toBeVisible();
});

test("/aspirasi: form filter (GET biasa) menyaring; chip dapat dihapus", async ({ page }) => {
  await page.goto("/aspirasi");
  const total = await page.getByRole("status").innerText();
  await page.getByText("Filter kategori dan status").click();
  await page.getByRole("checkbox", { name: "Fasilitas umum" }).check();
  await page.getByRole("checkbox", { name: "Ditindaklanjuti" }).check();
  await page.getByRole("button", { name: "Terapkan" }).click();
  await expect(page).toHaveURL(/kat=asp-fasum/);
  await expect(page).toHaveURL(/status=DITINDAKLANJUTI/);
  expect(await page.getByRole("status").innerText()).not.toBe(total);
  for (const art of await page.locator("article").all()) await expect(art).toContainText("Fasilitas umum");

  await page.getByRole("list", { name: "Filter aktif" }).getByRole("link", { name: /Fasilitas umum/ }).click();
  await expect(page).not.toHaveURL(/kat=/);
});

test("/aspirasi: pencarian tanpa hasil menampilkan pesan dan Reset filter", async ({ page }) => {
  await page.goto("/aspirasi?q=zzzz-tidak-ada");
  await expect(page.getByText("Tidak ada aspirasi yang cocok dengan filter ini.")).toBeVisible();
  await page.getByRole("link", { name: "Reset filter" }).last().click();
  await expect(page).toHaveURL(/\/aspirasi$/);
});

test("AC-D1: daftar tidak memuat kiriman privat", async ({ request }) => {
  for (const u of ["/aspirasi", "/ringkasan"]) {
    const html = await (await request.get(u)).text();
    expect(html, u).not.toMatch(/CNTH|WBS-\d{2}-|ASP-\d{2}-/);
  }
});

test("@ponsel kartu dapat diketuk dan filter dapat dibuka", async ({ page }) => {
  await page.goto("/aspirasi");
  await page.getByText("Filter kategori dan status").click();
  await expect(page.getByRole("checkbox", { name: "Fasilitas umum" })).toBeVisible();
  await page.locator("article").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/aspirasi\/A-\d{4}$/);
});
