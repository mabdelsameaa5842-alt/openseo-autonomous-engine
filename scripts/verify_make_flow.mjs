import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function run() {
  console.log('Launching Playwright Chrome...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  console.log('1. Navigating to Dashboard...');
  await page.goto(`${baseUrl}/p/${projectId}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(5000);

  // Scroll to Make Automation card
  const makeCard = page.locator('text=Make.com AI Automation').first();
  await makeCard.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const shot1 = path.join(outDir, '01_dashboard_make_initial.png');
  await page.screenshot({ path: shot1 });
  console.log(`Saved screenshot 1: ${shot1}`);

  // Test Disconnect flow if currently connected
  const disconnectBtn = page.locator('button:has-text("قطع الاتصال")').first();
  if (await disconnectBtn.isVisible()) {
    console.log('2. Clicking Disconnect button...');
    await disconnectBtn.click();
    await page.waitForTimeout(2000);

    const shot2 = path.join(outDir, '02_dashboard_make_disconnected.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved screenshot 2 (Disconnected with detected Google email): ${shot2}`);

    // Verify 1-click Google connect button is present
    const googleConnectBtn = page.locator('button:has-text("تسجيل الدخول وتأكيد الربط بحساب Google")').first();
    const isGoogleBtnVisible = await googleConnectBtn.isVisible();
    console.log('Is 1-click Google Connect button visible?', isGoogleBtnVisible);

    if (isGoogleBtnVisible) {
      console.log('3. Clicking 1-click Google Connect button...');
      await googleConnectBtn.click();
      await page.waitForTimeout(2500);

      const shot3 = path.join(outDir, '03_dashboard_make_reconnected.png');
      await page.screenshot({ path: shot3 });
      console.log(`Saved screenshot 3 (Reconnected instantly): ${shot3}`);
    }
  }

  // Navigate to Integrations page
  console.log('4. Navigating to Integrations page...');
  await page.goto(`${baseUrl}/p/${projectId}/settings/integrations`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);

  const shot4 = path.join(outDir, '04_integrations_page_make.png');
  await page.screenshot({ path: shot4 });
  console.log(`Saved screenshot 4: ${shot4}`);

  await context.close();
  await browser.close();
  console.log('Playwright verification test finished successfully!');
}

run().catch((err) => {
  console.error('Playwright verification error:', err);
  process.exit(1);
});
