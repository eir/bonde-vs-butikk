import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "e2e/screenshot-desktop.png", fullPage: true });

// Mobilvy
await page.setViewportSize({ width: 375, height: 812 });
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "e2e/screenshot-mobile.png", fullPage: true });

await browser.close();
console.log("Skjermbilder lagret!");
