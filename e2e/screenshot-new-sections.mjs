import { chromium } from "@playwright/test";

const browser = await chromium.launch();

// Desktop
const desktop = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await desktop.goto("http://localhost:3001", { waitUntil: "networkidle" });
await desktop.waitForTimeout(2000);
await desktop.screenshot({ path: "e2e/screenshot-desktop-full.png", fullPage: true });

// Scroll til verdikjede-seksjon
const vcSection = desktop.locator('section[aria-label="Verdikjede"]');
if (await vcSection.count() > 0) {
  await vcSection.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: "e2e/screenshot-verdikjede.png" });
}

// Scroll til jordbruket i tall
const farmSection = desktop.locator('section[aria-label="Jordbruket i tall"]');
if (await farmSection.count() > 0) {
  await farmSection.scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: "e2e/screenshot-jordbruket.png" });
}

// Mobil
const mobile = await browser.newPage({ viewport: { width: 375, height: 812 } });
await mobile.goto("http://localhost:3001", { waitUntil: "networkidle" });
await mobile.waitForTimeout(2000);
await mobile.screenshot({ path: "e2e/screenshot-mobile-full.png", fullPage: true });

await browser.close();
console.log("Screenshots tatt!");
