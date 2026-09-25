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
    viewport: { width: 1440, height: 1000 },
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
  console.log("2. Navigating to Skills Hub:", targetUrl);
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(4000);

  // 1. Overview tab screenshot
  const overviewPath = `${artifactsDir}/verified_4_campaigns_overview.png`;
  await page.screenshot({ path: overviewPath, fullPage: false });
  console.log("📸 Overview screenshot:", overviewPath);

  // 2. Switch to Campaigns Tab
  const campaignsTab = page.locator("button:has-text('الحملات العضوية')").or(page.locator("button:has-text('Campaigns')"));
  if (await campaignsTab.count() > 0) {
    console.log("3. Switching to Campaigns Tab...");
    await campaignsTab.first().click();
    await page.waitForTimeout(3000);
    const campaignsPath = `${artifactsDir}/verified_4_campaigns_table.png`;
    await page.screenshot({ path: campaignsPath, fullPage: false });
    console.log("📸 Campaigns Tab screenshot:", campaignsPath);
  }

  // 3. Switch to Topic Clusters Tab
  const clustersTab = page.locator("button:has-text('المجموعات الدلالية')").or(page.locator("button:has-text('Topic Clusters')"));
  if (await clustersTab.count() > 0) {
    console.log("4. Switching to Topic Clusters Tab...");
    await clustersTab.first().click();
    await page.waitForTimeout(3000);
    const clustersPath = `${artifactsDir}/verified_4_campaigns_clusters.png`;
    await page.screenshot({ path: clustersPath, fullPage: false });
    console.log("📸 Clusters Tab screenshot:", clustersPath);
  }

  await browser.close();
  console.log("All verification screenshots captured successfully!");
}

main().catch((err) => {
  console.error("Verification script error:", err);
  process.exit(1);
});
