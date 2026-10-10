import { expect, test } from "@playwright/test";
import { FIT_LEBAR, LEBAR_KATA_EM } from "@/features/beranda/bubble/ukuranWordmark";

/*
 * Wordmark SUARA: versi statis (tanpa JS) dan canvas harus sama besar dan muat di pita,
 * agar huruf tidak terpotong dan tidak melompat saat canvas mengambil alih.
 */

test("Konstanta lebar kata cocok dengan Poppins 800 yang benar-benar dimuat", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-bubble-host]")).toHaveAttribute("data-kanvas", "siap");
  const em = await page.evaluate(async () => {
    await document.fonts.ready;
    const c = document.querySelector("[data-bubble-host] canvas") as HTMLCanvasElement;
    const ctx = document.createElement("canvas").getContext("2d")!;
    ctx.font = `800 100px ${getComputedStyle(c).fontFamily}`;
    return ctx.measureText("SUARA").width / 100;
  });
  expect(Math.abs(em - LEBAR_KATA_EM)).toBeLessThan(0.03);
});

test("Wordmark statis (JS mati) muat di pita dan selebar fit × pita", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/");
  const { span, pita } = await page.evaluate(() => {
    const s = document.querySelector("[data-bubble-host] span")!;
    return { span: s.getBoundingClientRect().width, pita: s.parentElement!.getBoundingClientRect().width };
  });
  expect(span).toBeLessThanOrEqual(pita);
  expect(Math.abs(span / pita - FIT_LEBAR)).toBeLessThan(0.02);
  await ctx.close();
});

test("@ponsel wordmark statis tidak melebihi pita", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 412, height: 915 } });
  const page = await ctx.newPage();
  await page.goto("/");
  const { span, pita } = await page.evaluate(() => {
    const s = document.querySelector("[data-bubble-host] span")!;
    return { span: s.getBoundingClientRect().width, pita: s.parentElement!.getBoundingClientRect().width };
  });
  expect(span).toBeLessThanOrEqual(pita);
  await ctx.close();
});
