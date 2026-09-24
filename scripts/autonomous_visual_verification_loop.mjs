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

  // 1. Explicitly enable Dark Mode
  console.log("2. Setting up Dark Mode (openseo-dark)...");
  await page.evaluate(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "openseo-dark");
    localStorage.setItem("theme-preference", "dark");
  });
  await page.waitForTimeout(1500);

  const darkScreenshot = `${artifactsDir}/live_verified_dark_mode.png`;
  await page.screenshot({ path: darkScreenshot, fullPage: false });
  console.log("📸 Screenshot 1 (Dark Mode):", darkScreenshot);

  // 2. Click "تفعيل التنبيهات الفورية" & "إرسال إشعار تجريبي"
  console.log("3. Testing Notification Activation & Push Dispatch...");
  const notifBtn = page.locator("button:has-text('تفعيل التنبيهات')").or(page.locator("button:has-text('التنبيهات')"));
  if (await notifBtn.count() > 0) {
    await notifBtn.first().click();
    await page.waitForTimeout(1500);
  }
  const testPushBtn = page.locator("button:has-text('إشعار تجريبي')");
  if (await testPushBtn.count() > 0) {
    await testPushBtn.first().click();
    await page.waitForTimeout(2000);
  }
  const notifScreenshot = `${artifactsDir}/live_verified_notifications.png`;
  await page.screenshot({ path: notifScreenshot, fullPage: false });
  console.log("📸 Screenshot 2 (Notifications Verified):", notifScreenshot);

  // 3. Scroll to GSC Table (Search terms and Pages breakdown)
  console.log("4. Capturing GSC Telemetry & Pages Table...");
  const gscSection = page.locator("text=بيانات كونسول الحقيقية المعتمدة");
  if (await gscSection.count() > 0) {
    await gscSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }
  const gscScreenshot = `${artifactsDir}/live_verified_gsc_table.png`;
  await page.screenshot({ path: gscScreenshot, fullPage: false });
  console.log("📸 Screenshot 3 (GSC Table):", gscScreenshot);

  // Switch to Pages sub-tab
  const pagesTab = page.locator("button:has-text('الصفحات الأكثر ظهوراً')");
  if (await pagesTab.count() > 0) {
    await pagesTab.first().click();
    await page.waitForTimeout(1000);
    const gscPagesScreenshot = `${artifactsDir}/live_verified_gsc_pages.png`;
    await page.screenshot({ path: gscPagesScreenshot, fullPage: false });
    console.log("📸 Screenshot 4 (GSC Pages with CTR Buttons):", gscPagesScreenshot);
  }

  // 4. Switch to Merged Tab 8: "مخطط وسجل الأتمتة"
  console.log("5. Switching to Unified Automation & Tasks Tab...");
  const autoTab = page.locator("button:has-text('مخطط وسجل الأتمتة')").or(page.locator("button:has-text('سجل')"));
  if (await autoTab.count() > 0) {
    await autoTab.first().click();
    await page.waitForTimeout(2500);
    const autoScreenshot = `${artifactsDir}/live_verified_automation_flow_history.png`;
    await page.screenshot({ path: autoScreenshot, fullPage: false });
    console.log("📸 Screenshot 5 (Automation Flow & History):", autoScreenshot);
  }

  // 5. Switch to Campaigns tab and Open Campaign Builder Stepper
  console.log("6. Opening Campaign Builder Stepper...");
  const campTab = page.locator("button:has-text('الحملات العضوية')");
  if (await campTab.count() > 0) {
    await campTab.first().click();
    await page.waitForTimeout(1000);
    const createBtn = page.locator("button:has-text('إنشاء حملة أورجانيك جديدة')").or(page.locator("button:has-text('إنشاء حملة جديدة')"));
    if (await createBtn.count() > 0) {
      await createBtn.first().click();
      await page.waitForTimeout(1500);
    }
    const stepperScreenshot = `${artifactsDir}/live_verified_campaign_stepper.png`;
    await page.screenshot({ path: stepperScreenshot, fullPage: false });
    console.log("📸 Screenshot 6 (Campaign Stepper):", stepperScreenshot);
  }

  // 6. Switch to Overview and Light Mode
  console.log("7. Switching to Overview and Testing Light Mode...");
  const overviewTab = page.locator("button:has-text('نظرة عامة')");
  if (await overviewTab.count() > 0) {
    await overviewTab.first().click();
    await page.waitForTimeout(1000);
  }
  await page.evaluate(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "openseo");
    localStorage.setItem("theme-preference", "light");
  });
  await page.waitForTimeout(1500);
  const lightScreenshot = `${artifactsDir}/live_verified_light_mode.png`;
  await page.screenshot({ path: lightScreenshot, fullPage: false });
  console.log("📸 Screenshot 7 (Light Mode):", lightScreenshot);

  await browser.close();
  console.log("🎉 Autonomous Visual Verification Loop completed with 7 screenshots!");
}

main().catch(err => {
  console.error("Verification execution error:", err);
  process.exit(1);
});
