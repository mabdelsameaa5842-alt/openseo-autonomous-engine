import { chromium } from "./../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/@playwright/test/index.mjs";

async function run() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'ar-SA'
  });

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsb2NhbC1hZG1pbiIsImVtYWlsIjoibW9oYW1lZDcwMTE2NEBnbWFpbC5jb20iLCJuYW1lIjoi2YUuINmF2K3ZhdivINi52KjYryDYp9mE2LPZhdmK2LkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJyb2xlVGl0bGUiOiLwn5GRINin2YTZhdiv2YrYsSDYp9mE2LnYp9mFINmI2KfZhNiq2YbZgdmK2LDZiiAoU3VwZXIgQWRtaW4pIiwicGVybWlzc2lvbnMiOlsiUEVSTV9BTEwiLCJQRVJNX0FVVE9OT01PVVNfU0VPIiwiUEVSTV9NQUtFX0lOVEVHUkFUSU9OIiwiUEVSTV9QUk9KRUNUU19GVUxMIl0sImlhdCI6MTc4OTMxMTExOCwiZXhwIjoxNzkxOTAzMTE4fQ.VNiZOId-stPHP20xFRzXoFkM7g0R65vsAc3rGP2cysk";

  await context.addCookies([
    {
      name: "openseo_admin_token",
      value: token,
      domain: "open-seo.abdelsameaa.workers.dev",
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  // 1. Visit Site Audit page (matching user's exact screen)
  await page.goto("https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/audit", {
    waitUntil: "domcontentloaded",
  });
  await page.evaluate((t) => {
    localStorage.setItem("openseo_admin_token", t);
  }, token);
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/04_iphone_site_audit_fixed.png"
  });

  // 2. Visit Vorder Studio page
  await page.goto("https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(3000);

  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/05_iphone_studio_top_fixed.png"
  });

  // Scroll to engine controller
  await page.evaluate(() => {
    const el = document.querySelector('select');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/06_iphone_engine_controller_fixed.png"
  });

  // Click Canvas tab
  const canvasTab = page.locator('button:has-text("Flow Canvas")');
  if (await canvasTab.count() > 0) {
    await canvasTab.first().click();
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/07_iphone_canvas_fixed.png"
    });
  }

  // Open the mobile sidebar drawer to verify it too!
  const menuBtn = page.locator('button[aria-label="Toggle sidebar"]');
  if (await menuBtn.count() > 0) {
    await menuBtn.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/08_iphone_sidebar_drawer_fixed.png"
    });
  }

  await browser.close();
  console.log("All iPhone screenshots captured successfully!");
}

run().catch(console.error);
