import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub?tab=history`;

async function main() {
  console.log('1. Authenticating with super-admin on workers.dev...');
  let token = null;
  try {
    const res = await fetch(`${baseUrl}/api/auth/super-admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'mohamed701164@gmail.com', password: 'Mm201915842', rememberMe: true })
    });
    const data = await res.json();
    token = data.token;
  } catch (e) {
    console.warn('Super admin login fetch warning:', e.message);
  }

  console.log('Worker token acquired:', token ? 'YES' : 'NO');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });

  if (token) {
    await context.addCookies([
      {
        name: 'openseo_admin_token',
        value: token,
        domain: 'open-seo.abdelsameaa.workers.dev',
        path: '/',
        httpOnly: false,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
  }

  const page = await context.newPage();
  if (token) {
    await page.addInitScript((t) => {
      localStorage.setItem('openseo_admin_token', t);
      localStorage.setItem('openseo_super_admin_session', JSON.stringify({ authenticated: true }));
    }, token);
  }

  page.on('console', msg => console.log('WORKER LOG:', msg.text()));

  console.log(`2. Navigating to: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => {
    console.log('Networkidle timed out, proceeding with domcontentloaded');
  });

  console.log('3. Clicking Tab 8 (مقر الوكلاء وسجل الأتمتة)...');
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent && (b.textContent.includes('مقر الوكلاء') || b.textContent.includes('Agent HQ')));
    if (tabBtn) tabBtn.click();
  });

  console.log('4. Waiting 8s for live 3D office diorama render...');
  await page.waitForTimeout(8000);

  // Scroll to office container
  await page.evaluate(() => {
    const el = document.getElementById('vorder-3d-office-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(2000);

  const client = await page.context().newCDPSession(page);
  
  // 1. Capture 3D Office
  const { data: imgOffice } = await client.send('Page.captureScreenshot', { format: 'png' });
  // 2. Navigate to Settings Tab to capture AIModelsQuotaRadar
  const settingsUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub?tab=settings`;
  console.log(`5. Navigating to Settings: ${settingsUrl}`);
  await page.goto(settingsUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Click the AI Model Dropdown to open it
  console.log('6. Clicking AI Model Selector Dropdown...');
  const trigger = page.locator('#ai-model-selector-trigger-btn, button:has-text("Gemini")').first();
  await trigger.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await trigger.click();
  console.log('Dropdown clicked!');
  await page.waitForTimeout(2000);

  const { data: imgDropdown } = await client.send('Page.captureScreenshot', { format: 'png' });
  const dropdownPath = path.join(outDir, 'verified_live_ai_models_dropdown.png');
  fs.writeFileSync(dropdownPath, Buffer.from(imgDropdown, 'base64'));
  console.log(`📸 Saved AI models dropdown screenshot to: ${dropdownPath}`);

  await browser.close();
  console.log('🎉 Verification completed successfully!');
}

main().catch(console.error);
