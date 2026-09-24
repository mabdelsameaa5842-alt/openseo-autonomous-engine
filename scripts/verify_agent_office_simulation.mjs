import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const baseUrl = "https://open-seo.abdelsameaa.workers.dev";
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`;

async function main() {
  console.log("1. Authenticating as Super Admin via curl...");
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOutput = execSync(curlCmd, { encoding: "utf8" });
  const loginData = JSON.parse(curlOutput);
  console.log("Super Admin Login:", loginData.success ? "SUCCESS" : loginData);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });

  // Grant notifications permissions
  await context.grantPermissions(["notifications"]);

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

  console.log("2. Navigating to Organic Ads Hub:", targetUrl);
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(4000);

  // Set Dark Mode
  console.log("3. Applying Dark Mode...");
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "openseo-dark");
    localStorage.setItem("theme-preference", "dark");
  });
  await page.waitForTimeout(1500);

  // Switch to Tab 8 ("مخطط وسجل الأتمتة")
  console.log("4. Switching to Tab 8: مخطط وسجل الأتمتة...");
  const autoTab = page.locator("button:has-text('مخطط وسجل الأتمتة')");
  if (await autoTab.count() > 0) {
    await autoTab.first().click();
    await page.waitForTimeout(3000);
  }

  // Screenshot 1: Full Office Simulation in Tab 8 (Dark Mode)
  console.log("5. Capturing Office Simulation in Dark Mode...");
  const simContainer = page.locator("text=محاكي مكتب الوكلاء الأذكياء").locator("xpath=ancestor::div[contains(@class, 'relative w-full')]");
  if (await simContainer.count() > 0) {
    await simContainer.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }
  const officeDarkShot = `${artifactsDir}/live_verified_office_simulator_dark.png`;
  await page.screenshot({ path: officeDarkShot, fullPage: false });
  console.log("📸 Screenshot 1 saved:", officeDarkShot);

  // Click on Agent "كريم" (Google Ads & Keyword Harvester) to open Live Dossier Modal
  console.log("6. Clicking on Agent كريم to open Live Dossier Modal...");
  const kareemDesk = page.locator("text=كريم").first();
  if (await kareemDesk.count() > 0) {
    await kareemDesk.click();
    await page.waitForTimeout(2000);
    const dossierShot = `${artifactsDir}/live_verified_agent_dossier_modal.png`;
    await page.screenshot({ path: dossierShot, fullPage: false });
    console.log("📸 Screenshot 2 saved (Agent Dossier Modal):", dossierShot);

    // Test Instant Ping button inside modal
    console.log("7. Testing Instant Ping button inside dossier modal...");
    const pingBtn = page.locator("button:has-text('فحص الاتصال الآن')");
    if (await pingBtn.count() > 0) {
      await pingBtn.first().click();
      await page.waitForTimeout(2000);
      const pingShot = `${artifactsDir}/live_verified_agent_instant_ping.png`;
      await page.screenshot({ path: pingShot, fullPage: false });
      console.log("📸 Screenshot 3 saved (Ping Response):", pingShot);
    }

    // Close dossier modal
    const closeBtn = page.locator("button:has-text('إغلاق')").or(page.locator("button:has(svg.lucide-x)"));
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(1500);
    }
  }

  // Click on "المخطط الهيكلي (Read-Only Blueprint)" to open Wall Blueprint modal
  console.log("8. Opening Read-Only Blueprint modal...");
  const blueprintBtn = page.locator("button:has-text('المخطط الهيكلي')").or(page.locator("button:has-text('عرض المخطط')"));
  if (await blueprintBtn.count() > 0) {
    await blueprintBtn.first().click();
    await page.waitForTimeout(2000);
    const blueprintShot = `${artifactsDir}/live_verified_readonly_blueprint_modal.png`;
    await page.screenshot({ path: blueprintShot, fullPage: false });
    console.log("📸 Screenshot 4 saved (Read-Only Blueprint Modal):", blueprintShot);

    // Close blueprint modal
    const closeBlueprintBtn = page.locator("button:has-text('إغلاق المخطط')").or(page.locator("button:has(svg.lucide-x)"));
    if (await closeBlueprintBtn.count() > 0) {
      await closeBlueprintBtn.first().click();
      await page.waitForTimeout(1500);
    }
  }

  // Switch to Light Mode and capture
  console.log("9. Switching to Light Mode...");
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "openseo");
    localStorage.setItem("theme-preference", "light");
  });
  await page.waitForTimeout(2000);
  const officeLightShot = `${artifactsDir}/live_verified_office_simulator_light.png`;
  await page.screenshot({ path: officeLightShot, fullPage: false });
  console.log("📸 Screenshot 5 saved (Office Simulator Light Mode):", officeLightShot);

  await browser.close();
  console.log("✅ All visual verification screenshots captured successfully!");
}

main().catch(err => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
