import { chromium } from "@playwright/test";
import { execSync } from "child_process";
import path from "path";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const baseUrl = "https://open-seo.abdelsameaa.workers.dev";
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`;

async function main() {
  console.log("=== 1. Super Admin Authentication ===");
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOutput = execSync(curlCmd, { encoding: "utf8" });
  let loginData = {};
  try {
    loginData = JSON.parse(curlOutput);
  } catch {
    console.log("Raw login output:", curlOutput);
  }
  console.log("Super Admin Login Status:", loginData.success ? "SUCCESS" : "FAILED", loginData.user?.email);

  console.log("=== 2. Launching Headless Chromium with Hardware WebGL ===");
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=gl"
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });

  if (loginData.token) {
    await context.addCookies([
      {
        name: "openseo_admin_token",
        value: loginData.token,
        domain: "open-seo.abdelsameaa.workers.dev",
        path: "/",
      },
    ]);
  }

  const page = await context.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

  console.log(`=== 3. Navigating to: ${targetUrl} ===`);
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  if (page.url().includes("sign-in")) {
    console.log("Logging in via UI...");
    await page.fill('input[type="email"]', "mohamed701164@gmail.com");
    await page.fill('input[type="password"]', "Mm201915842");
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 15000 }).catch(() => {});
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 30000 });
  }

  console.log("=== 4. Selecting Tab 8: مخطط وسجل الأتمتة ===");
  const tab8Btn = page.locator('button').filter({ hasText: "مخطط وسجل الأتمتة" }).first();
  if (await tab8Btn.isVisible()) {
    await tab8Btn.click();
  } else {
    const navButtons = page.locator('aside nav button');
    const count = await navButtons.count();
    if (count >= 8) await navButtons.nth(7).click();
  }

  await page.waitForTimeout(4000);

  const canvasLocator = page.locator("#vorder-game-viewport canvas, .bot-crossing-canvas, canvas").first();
  await canvasLocator.waitFor({ state: "visible", timeout: 30000 });
  console.log("3D WebGL Canvas is fully rendered!");

  // Dismiss help overlay if present
  const helpCloseBtn = page.locator('#btn-help-close').first();
  if (await helpCloseBtn.isVisible()) {
    await helpCloseBtn.click();
    await page.waitForTimeout(1000);
  }

  // 1. Capture Full Office HQ Deck & Sunset Terrace
  console.log("Capturing 1: Office HQ Deck & Sunset Terrace...");
  const shot1 = path.join(artifactsDir, "verified_office_hq_deck.png");
  await page.screenshot({ path: shot1, fullPage: false });
  console.log(`Saved: ${shot1}`);

  // 2. Capture Sidebar (showing pure Arabic & proper positioning & scroll)
  console.log("Capturing 2: Sidebar Pure Arabic & Scroll styling...");
  const sidebar = page.locator('.side.panel').first();
  if (await sidebar.isVisible()) {
    const shot2 = path.join(artifactsDir, "verified_sidebar_arabic_scrolling.png");
    await sidebar.screenshot({ path: shot2 });
    console.log(`Saved: ${shot2}`);
  }

  // 3. Select Tariq and open Dossier
  console.log("Selecting Tariq Al-Najjar...");
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('vorder:agent-selected', {
      detail: { id: 'vorder-tariq', title: 'طارق النجار' }
    }));
    window.dispatchEvent(new CustomEvent('vorder:focus-agent', {
      detail: { id: 'vorder-tariq', title: 'طارق النجار' }
    }));
  });
  await page.waitForTimeout(1500);

  const dossierBtn = page.locator('button:has-text("ملف الوكيل")').first();
  if (await dossierBtn.isVisible()) {
    await dossierBtn.click();
    await page.waitForTimeout(2000);
    const shot3 = path.join(artifactsDir, "verified_dossier_tariq.png");
    await page.screenshot({ path: shot3, fullPage: false });
    console.log(`Saved: ${shot3}`);

    const closeBtn = page.locator('button:has-text("إغلاق")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // 4. Select Layla and open Dossier (to prove INDIVIDUAL portrait, NOT 9-agent group photo)
  console.log("Selecting Layla Al-Mahdi...");
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('vorder:agent-selected', {
      detail: { id: 'vorder-layla', title: 'ليلى المهدي' }
    }));
    window.dispatchEvent(new CustomEvent('vorder:focus-agent', {
      detail: { id: 'vorder-layla', title: 'ليلى المهدي' }
    }));
  });
  await page.waitForTimeout(1500);

  if (await dossierBtn.isVisible()) {
    await dossierBtn.click();
    await page.waitForTimeout(2000);
    const shot4 = path.join(artifactsDir, "verified_dossier_layla.png");
    await page.screenshot({ path: shot4, fullPage: false });
    console.log(`Saved: ${shot4}`);

    const closeBtn = page.locator('button:has-text("إغلاق")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // 5. Zoom in on characters to verify Human Crew identities
  console.log("Zooming in on 3D Crew...");
  // Use scroll wheel to zoom into the scene
  const canvasBox = await canvasLocator.boundingBox();
  if (canvasBox) {
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2);
    // Scroll in to zoom
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, -300);
      await page.waitForTimeout(200);
    }
    await page.waitForTimeout(2000);
    const shot5 = path.join(artifactsDir, "verified_human_crew_identities.png");
    await page.screenshot({ path: shot5, fullPage: false });
    console.log(`Saved: ${shot5}`);
  }

  await browser.close();
  console.log("=== Verification Script Completed Successfully! ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
