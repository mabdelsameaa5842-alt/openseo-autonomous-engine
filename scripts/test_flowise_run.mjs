import { chromium } from "./../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/@playwright/test/index.mjs";

async function runTest() {
  console.log("Launching headless browser with system Chrome...");
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
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

  await page.addInitScript((t) => {
    localStorage.setItem("openseo_admin_token", t);
    localStorage.setItem(
      "openseo_super_admin_session",
      JSON.stringify({ authenticated: true })
    );
  }, token);

  console.log("1. Navigating to Vorder Studio...");
  await page.goto(
    "https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio",
    { waitUntil: "networkidle", timeout: 45000 }
  );
  await page.waitForTimeout(3000);

  // 2. Select Flowise Only from Dropdown
  console.log("2. Switching dropdown to Flowise Only...");
  const select = await page.$("select");
  if (select) {
    await select.scrollIntoViewIfNeeded();
    await select.selectOption("flowise_only");
    await page.waitForTimeout(1000);

    // 3. Click Save Button
    console.log("3. Clicking Save & Persist Button...");
    const saveBtn = await page.$('button:has-text("حفظ وتثبيت")');
    if (saveBtn) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }
  }

  // Take screenshot #1: Mode Saved
  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/01_flowise_mode_saved.png",
    fullPage: false,
  });
  console.log("Saved 01_flowise_mode_saved.png");

  // 4. Trigger the Cycle in Flowise Mode
  console.log("4. Triggering cycle via Flowise...");
  const triggerBtn = await page.$('button:has-text("تشغيل دورة فورية الآن")');
  if (triggerBtn) {
    await triggerBtn.click();
    console.log("Trigger button clicked, waiting for cycle execution...");
    await page.waitForTimeout(12000);
  } else {
    console.log("Trigger button not found, calling trigger API directly...");
    await fetch(
      "https://open-seo.abdelsameaa.workers.dev/api/automation/trigger-run",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: "cc58e018-8ef9-4be7-8f3a-2af2bc158d62" }),
      }
    );
    await page.waitForTimeout(10000);
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
  }

  // Take screenshot #2: Execution result & logs
  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/02_flowise_execution_completed.png",
    fullPage: false,
  });
  console.log("Saved 02_flowise_execution_completed.png");

  // 5. Open Canvas Tab
  console.log("5. Opening Flow Canvas Studio tab...");
  const canvasTab = await page.$('button[data-tab="canvas"]');
  if (canvasTab) {
    await canvasTab.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/03_flowise_canvas_in_action.png",
      fullPage: false,
    });
    console.log("Saved 03_flowise_canvas_in_action.png");
  }

  await browser.close();
  console.log("Test execution and capture complete!");
}

runTest().catch(console.error);
