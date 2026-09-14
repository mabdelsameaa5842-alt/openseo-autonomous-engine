import { chromium } from "./../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/@playwright/test/index.mjs";

async function main() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJsb2NhbC1hZG1pbiIsImVtYWlsIjoibW9oYW1lZDcwMTE2NEBnbWFpbC5jb20iLCJuYW1lIjoi2YUuINmF2K3ZhdivINi52KjYryDYp9mE2LPZhdmK2LkiLCJyb2xlIjoic3VwZXJfYWRtaW4iLCJyb2xlVGl0bGUiOiLwn5GRINin2YTZhdiv2YrYsSDYp9mE2LnYp9mFINmI2KfZhNiq2YbZgdmK2LDZiiAoU3VwZXIgQWRtaW4pIiwicGVybWlzc2lvbnMiOlsiUEVSTV9BTEwiLCJQRVJNX0FVVE9OT01PVVNfU0VPIiwiUEVSTV9NQUtFX0lOVEVHUkFUSU9OIiwiUEVSTV9QUk9KRUNUU19GVUxMIl0sImlhdCI6MTc4OTMxMTExOCwiZXhwIjoxNzkxOTAzMTE4fQ.VNiZOId-stPHP20xFRzXoFkM7g0R65vsAc3rGP2cysk";

  // Add authentication cookie and localStorage token
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

  // Set localStorage token
  await page.addInitScript((t) => {
    localStorage.setItem("openseo_admin_token", t);
    localStorage.setItem("openseo_super_admin_session", JSON.stringify({ authenticated: true }));
  }, token);

  console.log("Navigating to live studio...");
  await page.goto(
    "https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio",
    { waitUntil: "networkidle", timeout: 45000 }
  );

  await page.waitForTimeout(3000);

  // Take screenshot of engine selector bar
  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/dual_engine_mode_selector.png",
    fullPage: false,
  });
  console.log("Saved dual_engine_mode_selector.png");

  // Click on Canvas Tab
  const canvasTab = await page.$('button[data-tab="canvas"]');
  if (canvasTab) {
    console.log("Clicking Canvas Tab...");
    await canvasTab.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/flow_canvas_active_studio.png",
      fullPage: false,
    });
    console.log("Saved flow_canvas_active_studio.png");
  } else {
    console.log("Canvas tab button not found");
  }

  await browser.close();
}

main().catch(console.error);
