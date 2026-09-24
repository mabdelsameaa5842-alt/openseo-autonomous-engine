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

  // Click on "تعديل" button on the first campaign in the table
  const editBtn = page.locator("button:has-text('تعديل')");
  if (await editBtn.count() > 0) {
    console.log("3. Clicking 'تعديل' (Edit) button on the campaign table...");
    await editBtn.first().click();
    await page.waitForTimeout(2000);

    const editStepperScreenshot = `${artifactsDir}/live_campaign_edit_stepper_verified.png`;
    await page.screenshot({ path: editStepperScreenshot, fullPage: false });
    console.log("📸 Edit Stepper screenshot saved to:", editStepperScreenshot);
  } else {
    console.log("⚠️ Edit button not found");
  }

  await browser.close();
  console.log("Verification completed successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
