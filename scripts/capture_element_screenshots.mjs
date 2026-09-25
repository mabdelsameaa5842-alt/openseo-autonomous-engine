import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub?tab=history`;

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });

  const page = await context.newPage();

  console.log('1. Navigating to Skills Hub...');
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Authenticate if needed
  const loginBtn = page.locator('button:has-text("دخول لوحة الإدارة")').first();
  if (await loginBtn.isVisible()) {
    console.log('Authenticating...');
    const emailInput = page.locator('input[type="email"], input[name="email"], input:not([type="password"])').first();
    const passInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('mohamed701164@gmail.com');
    await passInput.fill('Mm201915842');
    await loginBtn.click();
    await page.waitForTimeout(6000);
    if (!page.url().includes('skills-hub')) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4000);
    }
  }

  console.log('2. Selecting Tab 8 (Agent HQ)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent && (b.textContent.includes('مقر الوكلاء') || b.textContent.includes('Agent HQ')));
    if (tabBtn) tabBtn.click();
  });

  console.log('3. Waiting 6s for 3D Office...');
  await page.waitForTimeout(6000);

  const officeLocator = page.locator('#vorder-3d-office-container');
  await officeLocator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  // 1. Capture Full 3D Office
  console.log('4. Capturing full 3D office...');
  await officeLocator.screenshot({ path: path.join(outDir, 'verified_live_3d_office_full.png') });
  console.log('Saved verified_live_3d_office_full.png');

  // 2. Open Ziad Dossier
  console.log('5. Clicking Ziad Imran to open Dossier...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#vorder-3d-office-container button'));
    const ziadBtn = buttons.find(b => b.textContent && b.textContent.includes('زياد'));
    if (ziadBtn) ziadBtn.click();
  });
  await page.waitForTimeout(1500);

  // Capture Ziad Dossier
  await officeLocator.screenshot({ path: path.join(outDir, 'verified_ziad_dossier_platforms.png') });
  console.log('Saved verified_ziad_dossier_platforms.png');

  // 3. Click "إرسال توجيهات تكتيكية" inside Dossier to open Chat with Ziad
  console.log('6. Opening tactical chat with Ziad...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const chatBtn = buttons.find(b => b.textContent && b.textContent.includes('إرسال توجيهات'));
    if (chatBtn) chatBtn.click();
  });
  await page.waitForTimeout(1500);

  // 4. Send message to Ziad via real AI
  console.log('7. Sending message to Ziad via real AI...');
  const input = page.locator('input[placeholder*="تحدث مع"]').first();
  await input.fill('كيف تحمي كوتا قاعدة D1 وسجل الأتمتة الميدانية؟');
  await page.keyboard.press('Enter');

  console.log('8. Waiting 6s for real AI response from Google AI Studio...');
  await page.waitForTimeout(6500);

  // Capture Ziad Chat with real AI response & model badge
  await officeLocator.screenshot({ path: path.join(outDir, 'verified_ziad_real_ai_chat.png') });
  console.log('Saved verified_ziad_real_ai_chat.png');

  await browser.close();
  console.log('Captured all element screenshots successfully!');
}

main().catch(err => {
  console.error('Execution failed:', err);
  process.exit(1);
});
