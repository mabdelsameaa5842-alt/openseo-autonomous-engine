import { chromium } from "@playwright/test";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const targetUrl = "https://open-seo-ten.vercel.app/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub";

async function main() {
  console.log("Authenticating on live production site...");
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
  console.log("Login result:", loginData.success ? "Authenticated" : "Failed", loginData);

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
  console.log(`Navigating to ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });

  console.log("Waiting 5s for dashboard rendering and data...");
  await page.waitForTimeout(5000);

  const currentUrl = page.url();
  console.log("Current page URL:", currentUrl);

  const screenshotPath = `${artifactsDir}/live_google_ads_production_verified.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log("📸 Screenshot saved to:", screenshotPath);

  await browser.close();
  console.log("Verification complete!");
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
