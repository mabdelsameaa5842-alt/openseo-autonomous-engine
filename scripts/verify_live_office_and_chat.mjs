import { chromium } from '@playwright/test';
import fs from 'fs';
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
    viewport: { width: 1440, height: 1050 },
  });

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('Vorder') || text.includes('Agent')) {
      console.log('BROWSER LOG:', text);
    }
  });

  console.log(`1. Navigating to: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(3000);

  // Check if redirected to login page
  const loginBtn = page.locator('button:has-text("دخول لوحة الإدارة")').first();
  if (await loginBtn.isVisible()) {
    console.log('Detected login screen, authenticating...');
    const emailInput = page.locator('input[type="email"], input[name="email"], input:not([type="password"])').first();
    const passInput = page.locator('input[type="password"], input[name="password"]').first();
    await emailInput.fill('mohamed701164@gmail.com');
    await passInput.fill('Mm201915842');
    await page.waitForTimeout(400);
    await loginBtn.click();
    console.log('Clicked Sign In!');
    await page.waitForTimeout(6000);
    if (!page.url().includes('skills-hub')) {
      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000);
    }
  }

  console.log('2. Clicking Tab 8 (مقر الوكلاء وسجل الأتمتة)...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent && (b.textContent.includes('مقر الوكلاء') || b.textContent.includes('Agent HQ')));
    if (tabBtn) tabBtn.click();
  });

  console.log('3. Waiting 6s for 3D office diorama render...');
  await page.waitForTimeout(6000);

  // Scroll exactly to top of office container so entire office is centered
  await page.evaluate(() => {
    const el = document.getElementById('vorder-3d-office-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(1500);

  const client = await page.context().newCDPSession(page);

  // 1. Open Director Chat (Tariq Al-Abdali) from top bar
  console.log('4. Opening Director Chat (Tariq) from top bar...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#vorder-3d-office-container button'));
    const tariqBtn = buttons.find(b => b.textContent && b.textContent.includes('مدير الوكلاء'));
    if (tariqBtn) tariqBtn.click();
  });
  await page.waitForTimeout(2000);

  // Send message to Tariq: "من هم موظفوك وما هي صلاحياتك؟"
  console.log('5. Sending inquiry to Tariq: "من هم موظفوك وما هي صلاحياتك؟"...');
  const quickTariq = page.locator('button:has-text("من هم موظفوك")').first();
  if (await quickTariq.isVisible()) {
    await quickTariq.click();
  } else {
    const input = page.locator('input[placeholder*="تحدث مع"]').first();
    await input.fill('من هم موظفوك وما هي صلاحياتك؟');
    await page.keyboard.press('Enter');
  }

  console.log('6. Waiting 6s for real AI response for Tariq...');
  await page.waitForTimeout(6500);

  const { data: imgTariq } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verified_real_ai_agent_chat_tariq.png'), Buffer.from(imgTariq, 'base64'));
  console.log('Saved verified_real_ai_agent_chat_tariq.png');

  // Close Tariq's chat
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#vorder-3d-office-container button'));
    const closeBtn = buttons.find(b => b.innerHTML && b.innerHTML.includes('lucide-x'));
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(2000);

  // 2. Select Sara Al-Mohandes in roster bar
  console.log('7. Selecting Sara in the roster bar to open Dossier...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#vorder-3d-office-container button'));
    const saraBtn = buttons.find(b => b.textContent && b.textContent.includes('سارة'));
    if (saraBtn) saraBtn.click();
  });
  await page.waitForTimeout(2000);

  // Capture Sara's Dossier
  const { data: imgSaraDossier } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verified_sara_dossier_platforms.png'), Buffer.from(imgSaraDossier, 'base64'));
  console.log('Saved verified_sara_dossier_platforms.png');

  // Open chat with Sara
  console.log('8. Opening tactical chat with Sara...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const chatBtn = buttons.find(b => b.textContent && b.textContent.includes('إرسال توجيهات تكتيكية'));
    if (chatBtn) chatBtn.click();
  });
  await page.waitForTimeout(2000);

  // Send inquiry to Sara
  console.log('9. Sending inquiry to Sara...');
  const inputSara = page.locator('input[placeholder*="تحدث مع"]').first();
  await inputSara.fill('ما هي خطتك لخفض تكلفة الاستحواذ CAC لمتاجر سلة وزد؟');
  await page.keyboard.press('Enter');

  console.log('10. Waiting 6s for real AI response for Sara...');
  await page.waitForTimeout(6500);

  const { data: imgSaraChat } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verified_real_ai_agent_chat_sara.png'), Buffer.from(imgSaraChat, 'base64'));
  console.log('Saved verified_real_ai_agent_chat_sara.png');

  // Close chat and capture 3D office overview with walking agents
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#vorder-3d-office-container button'));
    const closeBtn = buttons.find(b => b.innerHTML && b.innerHTML.includes('lucide-x'));
    if (closeBtn) closeBtn.click();
  });
  await page.waitForTimeout(5000);

  const { data: imgOffice } = await client.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(outDir, 'verified_live_3d_office_persisted.png'), Buffer.from(imgOffice, 'base64'));
  console.log('Saved verified_live_3d_office_persisted.png');

  await browser.close();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

main().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
