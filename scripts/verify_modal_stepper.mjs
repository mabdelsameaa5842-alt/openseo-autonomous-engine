import { chromium } from "@playwright/test";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const targetUrl = "https://open-seo-ten.vercel.app/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub";

async function main() {
  const loginRes = await fetch("https://open-seo-ten.vercel.app/api/auth/super-admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "mohamed701164@gmail.com",
      password: "Mm201915842",
      rememberMe: true,
    }),
  });
  const loginData = await loginRes.json();

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
        domain: "open-seo-ten.vercel.app",
        path: "/",
      },
    ]);
  }

  const page = await context.newPage();
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3000);

  // Click the table's create button to open the Stepper Modal
  const modalBtn = page.locator("button:has-text('إنشاء حملة اورجانيك جديدة')");
  if (await modalBtn.count() > 0) {
    console.log("Clicking + إنشاء حملة اورجانيك جديدة...");
    await modalBtn.first().click();
    await page.waitForTimeout(1000);
  }

  const modalScreenshot = `${artifactsDir}/campaign_builder_stepper_verified.png`;
  await page.screenshot({ path: modalScreenshot, fullPage: false });
  console.log("📸 Stepper Modal screenshot saved to:", modalScreenshot);

  await browser.close();
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
