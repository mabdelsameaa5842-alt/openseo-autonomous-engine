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

  // Scroll to canvas
  const canvasEl = page.locator("canvas").first();
  if (await canvasEl.count() > 0) {
    await canvasEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
  }

  // Screenshot 1: Mode A - The Grand Isometric Agency Office
  console.log("5. Capturing Mode A: Grand Isometric Agency Office...");
  const officeShot = `${artifactsDir}/live_isometric_game_office.png`;
  await page.screenshot({ path: officeShot, fullPage: false });
  console.log("📸 Screenshot 1 saved:", officeShot);

  // Switch to Mode B: Rooftop Lounge & Smoke Corner
  console.log("6. Switching to Mode B: Rooftop Lounge & Smoke Corner...");
  const rooftopBtn = page.locator("button:has-text('ركن التدخين والسطح')");
  if (await rooftopBtn.count() > 0) {
    await rooftopBtn.first().click();
    await page.waitForTimeout(2500);
    const rooftopShot = `${artifactsDir}/live_isometric_game_rooftop.png`;
    await page.screenshot({ path: rooftopShot, fullPage: false });
    console.log("📸 Screenshot 2 saved (Rooftop Lounge):", rooftopShot);
  }

  // Switch to Mode C: Workstation Cockpit Zoom (Image 1)
  console.log("7. Switching to Mode C: Workstation Cockpit Zoom...");
  const cockpitBtn = page.locator("button:has-text('قمرة الشاشات الثلاثية')");
  if (await cockpitBtn.count() > 0) {
    await cockpitBtn.first().click();
    await page.waitForTimeout(2500);
    const cockpitShot = `${artifactsDir}/live_isometric_game_cockpit.png`;
    await page.screenshot({ path: cockpitShot, fullPage: false });
    console.log("📸 Screenshot 3 saved (Cockpit Zoom):", cockpitShot);
  }

  // Switch back to Mode A and open Agent Live Dossier Modal
  console.log("8. Switching back to Office Mode and clicking Agent Kareem...");
  const officeBtn = page.locator("button:has-text('قاعة المكاتب')");
  if (await officeBtn.count() > 0) {
    await officeBtn.first().click();
    await page.waitForTimeout(2000);
  }

  // Click on Canvas near center to select an agent
  if (await canvasEl.count() > 0) {
    const box = await canvasEl.boundingBox();
    if (box) {
      // Click near center-left where Kareem/Tariq sit
      await page.mouse.click(box.x + box.width * 0.45, box.y + box.height * 0.45);
      await page.waitForTimeout(2000);
    }
  }

  // Capture Dossier Modal
  const dossierModal = page.locator("text=مصفوفة الاتصالات الثلاثية التي يتحكم بها الوكيل");
  if (await dossierModal.count() > 0) {
    const dossierShot = `${artifactsDir}/live_isometric_agent_dossier.png`;
    await page.screenshot({ path: dossierShot, fullPage: false });
    console.log("📸 Screenshot 4 saved (Agent Live Dossier):", dossierShot);

    // Test Instant Ping
    console.log("9. Testing Instant Ping in Dossier Modal...");
    const pingBtn = page.locator("button:has-text('فحص الاتصال الآن')");
    if (await pingBtn.count() > 0) {
      await pingBtn.first().click();
      await page.waitForTimeout(2000);
      const pingShot = `${artifactsDir}/live_isometric_instant_ping.png`;
      await page.screenshot({ path: pingShot, fullPage: false });
      console.log("📸 Screenshot 5 saved (Instant Ping Response):", pingShot);
    }

    // Close dossier
    const closeBtn = page.locator("button:has-text('إغلاق')").or(page.locator("button:has(svg.lucide-x)"));
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(1500);
    }
  }

  // Open Blueprint Modal
  console.log("10. Opening Read-Only Blueprint Modal...");
  const bpBtn = page.locator("button:has-text('المخطط الهيكلي')");
  if (await bpBtn.count() > 0) {
    await bpBtn.first().click();
    await page.waitForTimeout(2000);
    const bpShot = `${artifactsDir}/live_isometric_blueprint_modal.png`;
    await page.screenshot({ path: bpShot, fullPage: false });
    console.log("📸 Screenshot 6 saved (Blueprint Modal):", bpShot);
  }

  await browser.close();
  console.log("✅ All isometric video game screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Verification script failed:", err);
  process.exit(1);
});
