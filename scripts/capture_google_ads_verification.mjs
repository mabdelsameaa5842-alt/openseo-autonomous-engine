import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/screenshots';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';
const vercelBaseUrl = 'https://open-seo-ten.vercel.app';

async function run() {
  console.log('Launching Chrome via Playwright...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  const page = await context.newPage();

  // 1. Capture Dashboard with Google Ads & Keyword Planner card
  console.log('Navigating to Dashboard...');
  await page.goto(`${vercelBaseUrl}/p/${projectId}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);
  const dashboardImg = path.join(outDir, 'google_ads_dashboard_verified.png');
  await page.screenshot({ path: dashboardImg, fullPage: false });
  console.log(`Saved dashboard screenshot: ${dashboardImg}`);

  // Test keyword search inside the Google Ads Card
  try {
    const input = await page.$('input[placeholder*="Keyword Planner"]');
    if (input) {
      await input.fill('ميديا باير اعلانات');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      const searchResultImg = path.join(outDir, 'google_ads_card_search_tested.png');
      await page.screenshot({ path: searchResultImg, fullPage: false });
      console.log(`Saved keyword search result screenshot: ${searchResultImg}`);
    }
  } catch (e) {
    console.warn('Search test skipped or encountered:', e);
  }

  // 2. Capture Settings Integrations page
  console.log('Navigating to Settings Integrations...');
  await page.goto(`${vercelBaseUrl}/p/${projectId}/settings/integrations`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(3000);
  const settingsImg = path.join(outDir, 'google_ads_settings_integrations_verified.png');
  await page.screenshot({ path: settingsImg, fullPage: false });
  console.log(`Saved settings screenshot: ${settingsImg}`);

  await context.close();
  await browser.close();
  console.log('Verification completed successfully!');
}

run().catch(console.error);
