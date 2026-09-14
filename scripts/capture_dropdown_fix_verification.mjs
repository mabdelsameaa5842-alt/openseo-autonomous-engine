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
    localStorage.setItem("openseo_super_admin_session", JSON.stringify({ authenticated: true }));
  }, token);

  console.log("Navigating to live studio...");
  await page.goto(
    "https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio",
    { waitUntil: "networkidle", timeout: 45000 }
  );

  await page.waitForTimeout(3000);

  // Click Canvas Tab
  const canvasTab = await page.$('button[data-tab="canvas"]');
  if (canvasTab) {
    console.log("Clicking Canvas Tab...");
    await canvasTab.click();
    await page.waitForTimeout(3000);

    // 1. Click the workflow selector dropdown button to open the list
    console.log("Opening Workflow Dropdown Menu...");
    const workflowDropdownBtn = await page.$(
      'button:has-text("Autonomous"), button:has-text("دورة النشر"), button:has-text("FLOWS")'
    ) || await page.$('div.relative button:has(.lucide-chevron-down)');
    
    if (workflowDropdownBtn) {
      await workflowDropdownBtn.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/104_workflow_dropdown_fixed_verified.png",
        fullPage: false,
      });
      console.log("Captured 104_workflow_dropdown_fixed_verified.png");

      // Click outside to close the dropdown
      const backdrop = await page.$('div.fixed.inset-0');
      if (backdrop) {
        await backdrop.click();
        await page.waitForTimeout(500);
      }
    } else {
      console.log("Could not find workflow dropdown button by text");
    }

    // 2. Open Add Node Modal
    const addNodeBtn = await page.$('button:has-text("إضافة عقدة")');
    if (addNodeBtn) {
      console.log("Clicking Add Node Button...");
      await addNodeBtn.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/105_add_node_modal_verified.png",
        fullPage: false,
      });
      console.log("Captured 105_add_node_modal_verified.png");

      // Close modal
      const closeBtn = await page.$('button:has-text("إلغاء")') || await page.$('div.fixed.inset-0');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(500);
      }
    }

    // 3. Click a canvas node to open Node Inspector Drawer
    const firstNode = await page.$('.react-flow__node') || await page.$('[data-id]');
    if (firstNode) {
      console.log("Clicking canvas node to open inspector...");
      await firstNode.click();
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/106_node_inspector_dag_connections_verified.png",
        fullPage: false,
      });
      console.log("Captured 106_node_inspector_dag_connections_verified.png");
    }
  }

  await browser.close();
  console.log("Dropdown verification finished!");
}

main().catch(console.error);
