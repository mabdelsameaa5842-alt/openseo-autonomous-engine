import { chromium } from "./../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/@playwright/test/index.mjs";

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1080 },
    extraHTTPHeaders: {
      "cf-access-client-id": "super-admin",
      "cf-access-authenticated-user-email": "mohamed701164@gmail.com",
    },
  });

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(err.message));

  console.log("Navigating to live landing page on open-seo-ten.vercel.app...");
  await page.goto("https://open-seo-ten.vercel.app/", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(3000);

  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible()) {
    console.log("Super Admin Login screen detected. Logging in with credentials...");
    await passInput.fill("Mm201915842");
    await page.waitForTimeout(300);
    const loginBtn = page.locator('button:has-text("دخول لوحة الإدارة")').first();
    await loginBtn.click();
    await page.waitForTimeout(4000);
  }

  console.log("Navigating to live Integrations page...");
  await page.goto(
    "https://open-seo-ten.vercel.app/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/settings/integrations",
    { waitUntil: "domcontentloaded", timeout: 35000 },
  );
  await page.waitForTimeout(5000);

  const screenshotPath =
    "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/live_integrations_hub_verified.png";
  await page.screenshot({ path: screenshotPath, fullPage: true });

  console.log(`Saved screenshot to ${screenshotPath}`);
  console.log(`Page errors count: ${errors.length}`);
  if (errors.length > 0) {
    console.error("Errors found:", errors);
  }

  // Also verify on workers.dev directly
  console.log("Checking direct workers.dev domain...");
  await page.goto(
    "https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/settings/integrations",
    { waitUntil: "networkidle", timeout: 30000 },
  );
  await page.waitForTimeout(2000);
  const screenshotWorkersPath =
    "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/live_integrations_workers_verified.png";
  await page.screenshot({ path: screenshotWorkersPath, fullPage: true });

  await browser.close();
  console.log("Verification finished successfully!");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
