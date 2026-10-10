import { defineConfig } from "@playwright/test";

/** Uji unit fungsi murni (tanpa browser, tanpa server). Jalankan: `npm run test:unit`. */
export default defineConfig({
  testDir: "tests/unit",
  reporter: [["list"]],
});
