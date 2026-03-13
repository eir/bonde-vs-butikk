import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const products = ["Kumelk", "Hvete", "Storfekjøtt", "Svinekjøtt", "Egg", "Poteter"];

for (const name of products) {
  await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
  await page.getByRole("radio", { name }).click();
  await page.waitForTimeout(500);
  const slug = name.toLowerCase().replace(/ø/g, "o").replace(/æ/g, "ae").replace(/å/g, "a");
  await page.screenshot({ path: `e2e/screenshot-${slug}.png`, fullPage: true });
  console.log(`${name}: OK`);
}

await browser.close();
console.log("Alle skjermbilder lagret!");
