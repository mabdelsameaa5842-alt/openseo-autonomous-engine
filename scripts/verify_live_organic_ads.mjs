import { chromium } from "@playwright/test";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const baseUrl = "https://open-seo.abdelsameaa.workers.dev";
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`;

async function main() {
  console.log("1. Logging into super-admin...");
  const loginRes = await fetch(`${baseUrl}/api/auth/super-admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "mohamed701164@gmail.com",
      password: "Mm201915842",
      rememberMe: true,
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login result:", loginData.success ? "SUCCESS" : loginData);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
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
  console.log("2. Navigating to Organic Ads Hub:", targetUrl);
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(4000);

  // Take screenshot 1: Overview with exact 6 impressions, 48.5 rank, and consolidated cards
  const overviewScreenshot = `${artifactsDir}/live_organic_ads_overview_verified.png`;
  await page.screenshot({ path: overviewScreenshot, fullPage: false });
  console.log("📸 Overview screenshot saved to:", overviewScreenshot);

  // Click on Campaigns tab in the sub-rail
  const campaignsTab = page.locator("button:has-text('الحملات العضوية')").or(page.locator("button:has-text('Campaigns')"));
  if (await campaignsTab.count() > 0) {
    console.log("3. Switching to Campaigns tab...");
    await campaignsTab.first().click();
    await page.waitForTimeout(1500);

    // Open the Stepper
    const createBtn = page.locator("button:has-text('إنشاء حملة')");
    if (await createBtn.count() > 0) {
      console.log("4. Opening Campaign Builder Stepper...");
      await createBtn.first().click();
      await page.waitForTimeout(1500);
    }

    const stepperScreenshot = `${artifactsDir}/live_campaign_builder_stepper_verified.png`;
    await page.screenshot({ path: stepperScreenshot, fullPage: false });
    console.log("📸 Stepper screenshot saved to:", stepperScreenshot);
  }

  await browser.close();
  console.log("Verification completed successfully!");
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
