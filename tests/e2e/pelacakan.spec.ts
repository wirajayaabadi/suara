import { expect, test, type Page } from "@playwright/test";

/*
 * E2E pelacakan (dok. 01 §4.C, dok. 04 AC-03/AC-08, T-09/T-10/T-25) dan detail publik.
 * Kredensial CNTH adalah data contoh sintetis (README).
 */

const KODE = (n: number) => `CNTH-AAAA-BBBB-CCCC-DDDD-000${n}`;

/** Galat form (Next juga memasang route announcer ber-role alert). */
const galatForm = (page: Page) => page.locator("form [role=alert]");

async function masuk(page: Page, ref: string, kode: string) {
  await page.goto("/lacak");
  await page.getByLabel(/^Nomor Referensi/).fill(ref);
  await page.getByLabel(/^Kode Akses/).fill(kode);
  await page.getByRole("button", { name: "Masuk ke pelacakan" }).click();
}

test("Kredensial salah: pesan generik, Nomor Referensi tetap, Kode Akses dikosongkan", async ({ page }) => {
  await masuk(page, "WBS-26-CNTH-0001", "SALAH-SALAH-SALAH");
  const galat = galatForm(page);
  await expect(galat).toHaveText("Nomor Referensi atau Kode Akses tidak cocok. Periksa kembali huruf dan angkanya.");
  await expect(galat).toBeFocused();
  await expect(page.getByLabel(/^Nomor Referensi/)).toHaveValue("WBS-26-CNTH-0001");
  await expect(page.getByLabel(/^Kode Akses/)).toHaveValue("");

  // Nomor yang tidak ada mendapat pesan yang sama persis.
  await masuk(page, "WBS-26-ZZZZ-9999", "SALAH-SALAH-SALAH");
  await expect(galatForm(page)).toHaveText("Nomor Referensi atau Kode Akses tidak cocok. Periksa kembali huruf dan angkanya.");
});

test("AC-08/T-25: masuk → kiriman sesi; tanpa kredensial di URL; tanpa catatan internal", async ({ page, context }) => {
  // Huruf kecil, spasi, dan tanpa tanda hubung tetap cocok (normalisasi).
  await masuk(page, " wbs-26-cnth-0002 ", "cnth aaaa bbbb cccc dddd 0002");
  await expect(page).toHaveURL(/\/lacak\/kiriman$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("WBS-26-CNTH-0002");
  await expect(page.getByText("Membutuhkan informasi dari Anda").first()).toBeVisible();
  await expect(page.getByText(/Mohon jelaskan perkiraan bulan barang diterima/)).toBeVisible();

  const html = await page.content();
  expect(html).not.toContain("Cocokkan dengan dokumen");
  expect(html).not.toContain("Perlu perkiraan bulan serah terima");
  expect(html).not.toContain("CNTH-AAAA-BBBB");

  const [cookie] = (await context.cookies()).filter((c) => c.name === "rs_lacak");
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Strict");
  expect(cookie.path).toBe("/lacak");
  expect(cookie.value).not.toContain("WBS");
  expect(await page.evaluate(() => document.cookie)).not.toContain("rs_lacak");
  expect(await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }))).not.toContain("CNTH");
});

test("Balasan pengirim tampil di utas dan field dikosongkan", async ({ page }) => {
  await masuk(page, "WBS-26-CNTH-0002", KODE(2));
  await expect(page).toHaveURL(/\/lacak\/kiriman$/);
  const field = page.getByLabel(/Jawab pertanyaan petugas/);
  await field.fill("pendek");
  await page.getByRole("button", { name: "Kirim balasan" }).click();
  await expect(page.locator("#balasan-galat")).toHaveText("Balasan terlalu singkat (minimal 10 karakter).");

  await field.fill("Barang diterima sekitar bulan Agustus, berupa perangkat komputer.");
  await page.getByRole("button", { name: "Kirim balasan" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Barang diterima sekitar bulan Agustus" })).toContainText("Anda");
  await expect(field).toHaveValue("");
});

test("Tambah lampiran memakai nama generik; tarik izin publikasi dengan konfirmasi", async ({ page }) => {
  await masuk(page, "ASP-26-CNTH-0004", KODE(4));
  await expect(page).toHaveURL(/\/lacak\/kiriman$/);
  await expect(page.getByRole("heading", { name: "Lampiran Anda (1)" })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({ name: "Foto rahasia.png", mimeType: "image/png", buffer: Buffer.from([137, 80]) });
  await expect(page.getByRole("heading", { name: "Lampiran Anda (2)" })).toBeVisible();
  await expect(page.getByText("lampiran-2.png")).toBeVisible();
  await expect(page.getByText("Foto rahasia.png")).toHaveCount(0);

  await expect(page.getByText("Dipublikasikan dalam bentuk tersamar")).toBeVisible();
  await page.getByRole("button", { name: "Tarik izin publikasi" }).click();
  await page.getByRole("button", { name: "Batal" }).click();
  await expect(page.getByText("Dipublikasikan dalam bentuk tersamar")).toBeVisible();
  await page.getByRole("button", { name: "Tarik izin publikasi" }).click();
  await page.getByRole("button", { name: "Ya, tarik izin" }).click();
  await expect(page.getByText("Izin publikasi telah ditarik").first()).toBeVisible();
  await expect(page.getByText("Izin publikasi ditarik oleh pengirim")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tarik izin publikasi" })).toHaveCount(0);
});

test("Kiriman ditutup tidak dapat dibalas; Keluar menghapus sesi", async ({ page }) => {
  await masuk(page, "ASP-26-CNTH-0005", KODE(5));
  await expect(page).toHaveURL(/\/lacak\/kiriman$/);
  await expect(page.getByText("Kiriman yang sudah ditutup tidak dapat dibalas.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Kirim balasan" })).toHaveCount(0);

  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/lacak\?keluar=1$/);
  await expect(page.getByText("Anda sudah keluar dari pelacakan.")).toBeVisible();
  await page.goto("/lacak/kiriman");
  await expect(page.getByRole("heading", { name: "Sesi pelacakan tidak ditemukan" })).toBeVisible();
});

test("Tanpa sesi atau dengan cookie palsu, kiriman tidak ditampilkan", async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: "rs_lacak", value: "WBS-26-CNTH-0002", url: `${baseURL}/lacak` }]);
  await page.goto("/lacak/kiriman");
  await expect(page.getByRole("heading", { name: "Sesi pelacakan tidak ditemukan" })).toBeVisible();
  await expect(page.getByText("Barang pengadaan tidak sesuai")).toHaveCount(0);
});

test("T-10: 6 kali gagal mengunci nomor itu, termasuk untuk kode yang benar", async ({ page }) => {
  for (let i = 0; i < 6; i++) await masuk(page, "WBS-26-CNTH-0003", `SALAH-${i}`);
  await expect(galatForm(page)).toHaveText("Terlalu banyak percobaan. Demi keamanan, coba lagi dalam 15 menit.");
  await masuk(page, "WBS-26-CNTH-0003", KODE(3));
  await expect(galatForm(page)).toHaveText("Terlalu banyak percobaan. Demi keamanan, coba lagi dalam 15 menit.");
  await expect(page).toHaveURL(/\/lacak$/);
});

test("Header: halaman pelacakan noindex dan no-referrer", async ({ request }) => {
  const r = await request.get("/lacak");
  expect(r.headers()["x-robots-tag"]).toBe("noindex, nofollow");
  expect(r.headers()["referrer-policy"]).toBe("no-referrer");
});

// ---------------------------------------------------------------- detail publik

test("Detail ringkasan WB: penafian, status publik, noindex", async ({ page }) => {
  await page.goto("/ringkasan/R-0001");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Penting" })).toContainText("Publikasi tidak berarti dugaan terbukti.");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.getByText(/Versi yang disetujui/)).toBeVisible();
});

test("Detail aspirasi tampil; awalan salah atau kode tidak ada → tidak tersedia", async ({ page }) => {
  await page.goto("/aspirasi/A-0001");
  await expect(page.getByRole("heading", { name: "Isi aspirasi" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Penting" })).toHaveCount(0);

  for (const url of ["/aspirasi/R-0001", "/aspirasi/A-9999", "/ringkasan/A-0001", "/ringkasan/WBS-26-CNTH-0003"]) {
    await page.goto(url);
    await expect(page.getByRole("heading", { name: "Konten tidak tersedia" })).toBeVisible();
  }
});

test("Panel peta menautkan ke halaman detail", async ({ page }) => {
  await page.goto(`/pemetaan?tampilan=daftar&blok=${encodeURIComponent("WB~wb-pungli~2026-Q1")}`);
  const panel = page.getByRole("complementary", { name: "Detail Peta Suara" });
  await panel.getByRole("listitem").getByRole("button").first().click();
  await panel.getByRole("link", { name: "Buka halaman ringkasan" }).click();
  await expect(page).toHaveURL(/\/ringkasan\/R-\d{4}$/);
  await expect(page.getByRole("complementary", { name: "Penting" })).toBeVisible();
});
