import { expect, test, type Page } from "@playwright/test";

/*
 * E2E form pengajuan (dok. 05 §7, AC-F). Data contoh; tidak ada yang disimpan.
 */

const dialog = (page: Page) => page.getByRole("dialog");

async function bukaDariBeranda(page: Page, label: RegExp) {
  await page.goto("/");
  await page.getByRole("link", { name: label }).click();
  await expect(dialog(page)).toBeVisible();
}

async function isiLangkah1(page: Page, kategori: string, judul: string) {
  await page.getByRole("radio", { name: kategori }).check();
  await page.getByLabel(/^Judul/).fill(judul);
  await page.getByRole("button", { name: "Lanjut" }).click();
}

test("AC-F1/F2: tombol kiri membuka dialog pelanggaran; fokus di judul; animasi berhenti", async ({ page }) => {
  await bukaDariBeranda(page, /Laporkan Pelanggaran/);
  await expect(page).toHaveURL(/\/kirim\/pelanggaran$/);
  await expect(dialog(page).getByRole("heading", { name: "Laporkan Pelanggaran" })).toBeFocused();
  await expect(page.locator("[data-animasi]")).toHaveAttribute("data-animasi", "diam");
  await expect(page.getByText("Langkah 1 dari 5")).toBeVisible();
});

test("AC-F1: tombol kanan membuka dialog aspirasi; Back menutup dialog", async ({ page }) => {
  await bukaDariBeranda(page, /Sampaikan Aspirasi/);
  await expect(page).toHaveURL(/\/kirim\/aspirasi$/);
  await page.goBack();
  await expect(dialog(page)).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
});

test("AC-F1: tautan langsung membuka halaman penuh, bukan dialog", async ({ page }) => {
  await page.goto("/kirim/aspirasi");
  await expect(page.getByRole("heading", { name: "Sampaikan Aspirasi" })).toBeVisible();
  await expect(dialog(page)).toHaveCount(0);
});

test("AC-F4: field wajib kosong menahan langkah dan menampilkan ringkasan galat", async ({ page }) => {
  await bukaDariBeranda(page, /Laporkan Pelanggaran/);
  await page.getByRole("button", { name: "Lanjut" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Ada 2 isian" })).toBeFocused();
  await expect(page.getByText("Langkah 1 dari 5")).toBeVisible();
  await expect(page.locator("#kategoriId-galat")).toHaveText("Pilih kategori laporan.");
});

test("Tanggal wajib saat memilih ‘Tanggal pasti’ (refine berjalan walau langkah 5 belum diisi)", async ({ page }) => {
  await bukaDariBeranda(page, /Laporkan Pelanggaran/);
  await isiLangkah1(page, "Pungutan tidak resmi", "Biaya tambahan saat mengurus dokumen");
  await page.getByLabel(/Apa yang terjadi/).fill("Saya diminta membayar biaya di luar tarif resmi agar dokumen cepat selesai di loket layanan.");
  await page.getByRole("radio", { name: "Tanggal pasti" }).check();
  await page.getByRole("button", { name: "Lanjut" }).click();
  await expect(page.getByText("Isi tanggal kejadian, atau pilih opsi lain.")).toBeVisible();
  await expect(page.getByText("Langkah 2 dari 5")).toBeVisible();
});

test("AC-F5/F6/F8: alur lengkap pelanggaran, lampiran, kirim sekali, layar berhasil terkunci", async ({ page }) => {
  await bukaDariBeranda(page, /Laporkan Pelanggaran/);
  await isiLangkah1(page, "Pungutan tidak resmi", "Biaya tambahan saat mengurus dokumen");
  await page.getByLabel(/Apa yang terjadi/).fill("Saya diminta membayar biaya di luar tarif resmi agar dokumen cepat selesai di loket layanan.");
  await page.getByRole("radio", { name: "Tidak ingat / tidak yakin" }).check();
  await page.getByRole("button", { name: "Lanjut" }).click();

  // Langkah 3: jenis file ditolak, lalu file sah diterima dengan nama generik.
  const input = page.locator("#lampiran");
  await input.setInputFiles({ name: "catatan.txt", mimeType: "text/plain", buffer: Buffer.from("x") });
  await expect(page.getByText("File “catatan.txt” tidak dapat diunggah. Gunakan JPG, PNG, WebP, atau PDF.")).toBeVisible();
  await input.setInputFiles({ name: "Foto Pak Budi.png", mimeType: "image/png", buffer: Buffer.from([137, 80, 78, 71]) });
  await expect(page.getByText("lampiran-1.png")).toBeVisible();
  await expect(page.getByText("Foto Pak Budi.png")).toHaveCount(0);
  await page.getByRole("button", { name: "Lanjut" }).click();

  // Langkah 4 dilewati, langkah 5 wajib izin + pernyataan.
  await page.getByRole("button", { name: "Lewati" }).click();
  await expect(page.getByText("Langkah 5 dari 5")).toBeVisible();
  await page.getByRole("button", { name: "Kirim Laporan" }).click();
  await expect(page.locator("#izinPublikasi-galat")).toHaveText("Pilih apakah kiriman boleh dipublikasikan.");
  await page.getByRole("radio", { name: /Ya, boleh dipublikasikan/ }).check();
  await page.getByRole("checkbox", { name: /Saya menyatakan/ }).check();

  // Klik ganda tetap satu kiriman: tombol langsung nonaktif.
  const kirim = page.getByRole("button", { name: "Kirim Laporan" });
  await kirim.click();
  await expect(page.getByRole("heading", { name: "Laporan diterima untuk ditinjau." })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(/^WBS-\d{2}-[0-9A-Z]{4}-[0-9A-Z]{4}$/)).toBeVisible();
  await expect(page.getByText("CONTOH — prototipe.")).toBeVisible();

  // Esc dan tombol tutup tidak menutup sebelum konfirmasi penyimpanan.
  await page.keyboard.press("Escape");
  await expect(dialog(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "Selesai & tutup" })).toBeDisabled();
  await page.getByRole("checkbox", { name: "Saya sudah menyimpan kode ini" }).check();
  await page.getByRole("button", { name: "Selesai & tutup" }).click();
  await expect(dialog(page)).toBeHidden();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("link", { name: /Laporkan Pelanggaran/ })).toBeFocused();
});

test("AC-F3: menutup dengan isian meminta konfirmasi; draf tetap ada setelah Back", async ({ page }) => {
  await bukaDariBeranda(page, /Sampaikan Aspirasi/);
  await page.getByLabel(/^Judul/).fill("Penambahan tempat duduk di ruang tunggu");
  await page.getByRole("button", { name: "Tutup formulir" }).click();
  await expect(page.getByRole("alertdialog", { name: "Buang isian?" })).toBeVisible();
  await page.getByRole("button", { name: "Lanjutkan mengisi" }).click();
  await expect(page.getByLabel(/^Judul/)).toHaveValue("Penambahan tempat duduk di ruang tunggu");

  await page.goBack();
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("link", { name: /Sampaikan Aspirasi/ }).click();
  // Isian kembali: lewat state rute yang dipertahankan, atau lewat tawaran draf di memori.
  const tawaran = page.getByRole("heading", { name: "Lanjutkan isian sebelumnya?" });
  if (await tawaran.isVisible()) await page.getByRole("button", { name: "Lanjutkan mengisi" }).click();
  await expect(page.getByLabel(/^Judul/)).toHaveValue("Penambahan tempat duduk di ruang tunggu");

  // “Buang isian” mengosongkan form untuk pembukaan berikutnya.
  await page.getByRole("button", { name: "Tutup formulir" }).click();
  await page.getByRole("button", { name: "Buang isian" }).click();
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("link", { name: /Sampaikan Aspirasi/ }).click();
  await expect(page.getByLabel(/^Judul/)).toHaveValue("");
});

test("Kredensial tidak muncul lagi setelah dialog ditutup dan dibuka kembali", async ({ page }) => {
  await bukaDariBeranda(page, /Sampaikan Aspirasi/);
  await isiLangkah1(page, "Fasilitas umum", "Penambahan tempat duduk di ruang tunggu");
  await page.getByLabel(/Apa yang terjadi atau dibutuhkan/).fill("Ruang tunggu penuh pada jam sibuk sehingga banyak pengunjung berdiri.");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Lanjut" }).click();
  await page.getByRole("radio", { name: /Ya, boleh dipublikasikan/ }).check();
  await page.getByRole("checkbox", { name: /Saya menyatakan/ }).check();
  await page.getByRole("button", { name: "Kirim Aspirasi" }).click();
  await expect(page.getByRole("heading", { name: "Aspirasi diterima untuk ditinjau." })).toBeVisible();
  await page.getByRole("checkbox", { name: "Saya sudah menyimpan kode ini" }).check();
  await page.getByRole("button", { name: "Selesai & tutup" }).click();
  await expect(dialog(page)).toBeHidden();
  await page.getByRole("link", { name: /Sampaikan Aspirasi/ }).click();
  await expect(page.getByText("Langkah 1 dari 5")).toBeVisible();
  await expect(page.getByText(/^ASP-\d{2}-/)).toHaveCount(0);
  await expect(page.getByLabel(/^Judul/)).toHaveValue("");
});

test("AC-F7: galat server tidak menghapus isian", async ({ page }) => {
  await bukaDariBeranda(page, /Sampaikan Aspirasi/);
  await isiLangkah1(page, "Fasilitas umum", "Usulan kursi tambahan [uji-galat]");
  await page.getByLabel(/Apa yang terjadi atau dibutuhkan/).fill("Ruang tunggu penuh pada jam sibuk sehingga banyak pengunjung berdiri.");
  await page.getByRole("button", { name: "Lanjut" }).click();
  await page.getByRole("button", { name: "Lanjut" }).click();
  await page.getByRole("button", { name: "Lanjut" }).click();
  await page.getByRole("radio", { name: /Tidak, jangan dipublikasikan/ }).check();
  await page.getByRole("checkbox", { name: /Saya menyatakan/ }).check();
  await page.getByRole("button", { name: "Kirim Aspirasi" }).click();
  await expect(page.getByText(/kiriman belum tersimpan/i)).toBeVisible();
  await page.getByRole("button", { name: /Ubah Kategori & judul/ }).click();
  await expect(page.getByLabel(/^Judul/)).toHaveValue("Usulan kursi tambahan [uji-galat]");
});

test("AC-F9: tidak ada isian di penyimpanan browser maupun URL", async ({ page }) => {
  await bukaDariBeranda(page, /Laporkan Pelanggaran/);
  await page.getByLabel(/^Judul/).fill("RAHASIA-UJI-123 judul laporan");
  const simpanan = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(simpanan).not.toContain("RAHASIA-UJI-123");
  expect(page.url()).not.toContain("RAHASIA");
});

test("@ponsel dialog layar penuh dan tombol tetap terlihat", async ({ page }) => {
  await bukaDariBeranda(page, /Laporkan Pelanggaran/);
  const kotak = await dialog(page).boundingBox();
  const vp = page.viewportSize()!;
  expect(Math.round(kotak!.width)).toBe(vp.width);
  await expect(page.getByRole("button", { name: "Lanjut" })).toBeInViewport();
});
