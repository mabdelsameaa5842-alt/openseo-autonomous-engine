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

  console.log("Navigating to live landing page...");
  await page.goto("https://open-seo-ten.vercel.app/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2500);

  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible()) {
    await passInput.fill("Mm201915842");
    await page.waitForTimeout(300);
    const loginBtn = page.locator('button:has-text("دخول لوحة الإدارة")').first();
    await loginBtn.click();
    await page.waitForTimeout(4000);
  }

  console.log("Navigating to Integrations page...");
  await page.goto("https://open-seo-ten.vercel.app/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/settings/integrations", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await page.waitForTimeout(4000);

  console.log("Clicking 'ربط الحساب' on Supabase card...");
  const supabaseBtn = page.locator('button:has-text("ربط الحساب")').first();
  await supabaseBtn.click();
  await page.waitForTimeout(1000);

  const modalScreenshot =
    "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/live_integrations_modal_verified.png";
  await page.screenshot({ path: modalScreenshot, fullPage: true });
  console.log(`Saved modal screenshot to ${modalScreenshot}`);

  await browser.close();
}

main().catch(console.error);
