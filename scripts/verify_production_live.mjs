import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const liveUrl = 'https://open-seo-ten.vercel.app';

async function main() {
  console.log(`=== Testing Live Production at ${liveUrl} ===`);
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('failed')) {
      console.log('LIVE BROWSER LOG:', text);
    }
  });

  console.log('1. Navigating to live landing page...');
  await page.goto(`${liveUrl}/`, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(4000);

  const content = await page.content();
  const hasDataForSeo = content.includes('DataForSEO');
  const hasUnexpectedError = content.includes('An unexpected error occurred');

  console.log(`[LIVE TEST] DataForSEO banner visible? -> ${hasDataForSeo} (Expected: false)`);
  console.log(`[LIVE TEST] Unexpected error visible? -> ${hasUnexpectedError} (Expected: false)`);

  const screenshotPath1 = path.join(outDir, 'live_production_root_clean.png');
  await page.screenshot({ path: screenshotPath1, fullPage: true });
  console.log(`Saved screenshot: ${screenshotPath1}`);

  // Test Login on production
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible()) {
    console.log('Filling super admin credentials...');
    await passInput.fill('Mm201915842');
    await page.waitForTimeout(300);
    const loginBtn = page.locator('button:has-text("دخول لوحة الإدارة")').first();
    await loginBtn.click();
    await page.waitForTimeout(6000);
    console.log(`Live URL after login: ${page.url()}`);
  }

  const screenshotPath2 = path.join(outDir, 'live_production_authenticated.png');
  await page.screenshot({ path: screenshotPath2, fullPage: true });
  console.log(`Saved authenticated screenshot: ${screenshotPath2}`);

  const liveAuthContent = await page.content();
  const hasDataForSeoAuth = liveAuthContent.includes('DataForSEO');
  const hasUnexpectedErrorAuth = liveAuthContent.includes('An unexpected error occurred');

  console.log(`[LIVE AUTH TEST] DataForSEO visible after login? -> ${hasDataForSeoAuth} (Expected: false)`);
  console.log(`[LIVE AUTH TEST] Unexpected error after login? -> ${hasUnexpectedErrorAuth} (Expected: false)`);

  await browser.close();
  console.log('=== Live Production Verification Complete ===');
}

main().catch(err => {
  console.error('Live verification failed:', err);
  process.exit(1);
});
