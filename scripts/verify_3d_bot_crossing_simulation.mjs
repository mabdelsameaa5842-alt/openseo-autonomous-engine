import { chromium } from "@playwright/test";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const baseUrl = "https://open-seo.abdelsameaa.workers.dev";
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`;

async function main() {
  console.log("=== 1. Authenticating as Super Admin via curl ===");
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOutput = execSync(curlCmd, { encoding: "utf8" });
  let loginData = {};
  try {
    loginData = JSON.parse(curlOutput);
  } catch {
    console.log("Raw login output:", curlOutput);
  }
  console.log("Super Admin Login Status:", loginData.success ? "SUCCESS" : "FAILED", loginData.user?.email);

  console.log("=== 2. Launching Headless Chromium with WebGL ===");
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

  console.log(`=== 3. Navigating to Skills Hub: ${targetUrl} ===`);
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  // If redirect to sign-in occurs, perform UI login
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
    console.log("Clicked Tab 8 successfully via Arabic label.");
  } else {
    const tabFallback = page.locator('button').filter({ hasText: "Automation & Tasks" }).first();
    if (await tabFallback.isVisible()) {
      await tabFallback.click();
      console.log("Clicked Tab 8 via English fallback.");
    } else {
      console.log("Searching for nav buttons...");
      const navButtons = page.locator('aside nav button');
      const count = await navButtons.count();
      console.log(`Found ${count} nav buttons.`);
      if (count >= 8) {
        await navButtons.nth(7).click(); // 8th tab (0-indexed: 7)
        console.log("Clicked 8th nav button (Tab 8 index 7).");
      }
    }
  }

  await page.waitForTimeout(3000);
  const debugPath = path.join(artifactsDir, "debug_tab8_state.png");
  await page.screenshot({ path: debugPath, fullPage: false });
  console.log(`Saved debug screenshot: ${debugPath}`);

  console.log("=== 5. Waiting for 3D WebGL Canvas to Render ===");
  const canvasLocator = page.locator("#vorder-game-viewport canvas, .bot-crossing-canvas, canvas").first();
  await canvasLocator.waitFor({ state: "visible", timeout: 30000 });
  console.log("3D WebGL Canvas detected!");

  // Dismiss any help sheet overlay if visible
  const helpCloseBtn = page.locator('#btn-help-close').first();
  if (await helpCloseBtn.isVisible()) {
    await helpCloseBtn.click();
    console.log("Dismissed help overlay.");
    await page.waitForTimeout(1000);
  }

  // Screenshot 1: Overview of 3D Station HQ
  const shot1Path = path.join(artifactsDir, "live_3d_station_hq.png");
  await page.screenshot({ path: shot1Path, fullPage: false });
  console.log(`Captured Screenshot 1: ${shot1Path}`);

  // Screenshot 2: Click Coffee & Code Bar station
  console.log("Focusing Coffee & Code station...");
  const coffeeBtn = page.locator('button:has-text("الكافيه"), button:has-text("بار القهوة")').first();
  if (await coffeeBtn.isVisible()) {
    await coffeeBtn.click();
    await page.waitForTimeout(3000);
    const shot2Path = path.join(artifactsDir, "live_3d_station_coffee.png");
    await page.screenshot({ path: shot2Path, fullPage: false });
    console.log(`Captured Screenshot 2: ${shot2Path}`);
  }

  // Screenshot 3: Click Rooftop Smoke Deck
  console.log("Focusing Rooftop Smoke Deck...");
  const rooftopBtn = page.locator('button:has-text("شرفة الاستراحة"), button:has-text("شرفة السجائر")').first();
  if (await rooftopBtn.isVisible()) {
    await rooftopBtn.click();
    await page.waitForTimeout(3000);
    const shot3Path = path.join(artifactsDir, "live_3d_station_rooftop.png");
    await page.screenshot({ path: shot3Path, fullPage: false });
    console.log(`Captured Screenshot 3: ${shot3Path}`);
  }

  // Screenshot 4: Open Agent Inspection Dossier Modal (Image 1 replica)
  console.log("Opening Agent Inspection Dossier Modal...");
  const dossierBtn = page.locator('button:has-text("ملف الوكيل"), button:has-text("فتح الملف")').first();
  if (await dossierBtn.isVisible()) {
    await dossierBtn.click();
    await page.waitForTimeout(2000);
    const shot4Path = path.join(artifactsDir, "live_3d_dossier_modal.png");
    await page.screenshot({ path: shot4Path, fullPage: false });
    console.log(`Captured Screenshot 4: ${shot4Path}`);

    // Close dossier
    const closeBtn = page.locator('button:has-text("إغلاق")').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
    await page.waitForTimeout(1000);
  }

  // Screenshot 5: Open In-Game Live Chat Terminal
  console.log("Opening Live Chat Terminal...");
  const chatBtn = page.locator('button:has-text("شات الوكلاء")').first();
  if (await chatBtn.isVisible()) {
    await chatBtn.click();
    await page.waitForTimeout(1500);

    // Type a prompt
    const chatInput = page.locator('input[placeholder*="أرسل تعليماتك"]');
    if (await chatInput.isVisible()) {
      await chatInput.fill("ما هو ملخص عملك اليوم في السيو والكلمات المفتاحية؟");
      await page.keyboard.press("Enter");
      console.log("Sent user message in chat terminal. Waiting for agent reply...");
      await page.waitForTimeout(2500);
    }

    const shot5Path = path.join(artifactsDir, "live_3d_chat_interaction.png");
    await page.screenshot({ path: shot5Path, fullPage: false });
    console.log(`Captured Screenshot 5: ${shot5Path}`);
  }

  await browser.close();
  console.log("=== Verification Completed Successfully! ===");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
