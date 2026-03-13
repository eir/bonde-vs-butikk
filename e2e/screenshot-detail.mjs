import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await page.goto("http://localhost:3001", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);
await page.screenshot({ path: "e2e/screenshot-full.png", fullPage: true });

// Test tidsvelger — klikk "5 år"
await page.getByRole("button", { name: "5 år", exact: true }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: "e2e/screenshot-5yr.png", fullPage: true });

// Hvete med "Alt"
await page.getByRole("radio", { name: "Hvete" }).click();
await page.getByRole("button", { name: "Alt" }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: "e2e/screenshot-hvete-alt.png", fullPage: true });

await browser.close();
console.log("Detaljerte skjermbilder lagret!");
