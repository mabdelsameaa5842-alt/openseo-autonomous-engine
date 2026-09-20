import { chromium } from "@playwright/test";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";

async function run() {
  console.log("Authenticating as super admin...");
  const loginRes = await fetch("http://localhost:3001/api/auth/super-admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "mohamed701164@gmail.com",
      password: "Mm201915842",
      rememberMe: true,
    }),
  });
  const loginData = await loginRes.json();
  console.log("Login status:", loginData.success ? "Authenticated" : "Failed");

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
  });

  if (loginData.token) {
    await context.addCookies([
      {
        name: "openseo_admin_token",
        value: loginData.token,
        domain: "localhost",
        path: "/",
      },
    ]);
  }

  const page = await context.newPage();

  console.log("Navigating to real project skills-hub: /p/80e19092-284f-471a-8499-1e75d0d9f3ea/skills-hub ...");
  await page.goto("http://localhost:3001/p/80e19092-284f-471a-8499-1e75d0d9f3ea/skills-hub", {
    waitUntil: "domcontentloaded",
  });

  console.log("Waiting 4s for Skills Hub page to render...");
  await page.waitForTimeout(4000);
  console.log("Current page URL:", page.url());

  // 1. Stage 3 (Default: Campaign Hub)
  console.log("Capturing Stage 3: Campaign Hub...");
  await page.screenshot({
    path: `${artifactsDir}/visual_audit_stage3_campaign_hub.png`,
    fullPage: true,
  });

  // 2. Click Stage 2: Strategy & Briefs
  console.log("Navigating to Stage 2...");
  const stage2Btn = page.locator("button:has-text('المرحلة 2'), button:has-text('Stage 2')").first();
  if (await stage2Btn.count() > 0) {
    await stage2Btn.click();
    await page.waitForTimeout(2500);
    console.log("Capturing Stage 2: Strategy & Briefs...");
    await page.screenshot({
      path: `${artifactsDir}/visual_audit_stage2_brief_skills.png`,
      fullPage: true,
    });
  }

  // 3. Click Stage 4: SERP & AI Radar
  console.log("Navigating to Stage 4...");
  const stage4Btn = page.locator("button:has-text('المرحلة 4'), button:has-text('Stage 4')").first();
  if (await stage4Btn.count() > 0) {
    await stage4Btn.click();
    await page.waitForTimeout(2500);
    console.log("Capturing Stage 4: SERP & AI Radar...");
    await page.screenshot({
      path: `${artifactsDir}/visual_audit_stage4_serp_geo.png`,
      fullPage: true,
    });
  }

  // 4. Click Stage 1: Site Foundation & Audit
  console.log("Navigating to Stage 1...");
  const stage1Btn = page.locator("button:has-text('المرحلة 1'), button:has-text('Stage 1')").first();
  if (await stage1Btn.count() > 0) {
    await stage1Btn.click();
    await page.waitForTimeout(2500);
    console.log("Capturing Stage 1: Site Foundation & Audit...");
    await page.screenshot({
      path: `${artifactsDir}/visual_audit_stage1_foundation_audit.png`,
      fullPage: true,
    });
  }

  await browser.close();
  console.log("ALL 4 STAGE SCREENSHOTS RE-CAPTURED SUCCESSFULLY ON REAL PROJECT!");
}

run().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
