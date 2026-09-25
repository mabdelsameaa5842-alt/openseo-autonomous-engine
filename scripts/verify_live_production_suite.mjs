import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo-ten.vercel.app';
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub?tab=history`;

async function main() {
  console.log('1. Fetching token from production login API...');
  const res = await fetch(`${baseUrl}/api/auth/super-admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mohamed701164@gmail.com', password: 'Mm201915842', rememberMe: true })
  });
  const data = await res.json();
  const token = data.token;
  console.log('Production token acquired:', token ? 'YES' : 'NO');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });

  if (token) {
    await context.addCookies([
      {
        name: 'openseo_admin_token',
        value: token,
        domain: 'open-seo-ten.vercel.app',
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

  page.on('console', msg => console.log('PROD LOG:', msg.text()));

  console.log(`2. Navigating to: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

  console.log('3. Clicking Tab 8 (مقر الوكلاء وسجل الأتمتة)...');
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const tabBtn = buttons.find(b => b.textContent && (b.textContent.includes('مقر الوكلاء') || b.textContent.includes('Agent HQ')));
    if (tabBtn) tabBtn.click();
  });

  console.log('4. Waiting 8s for live 3D diorama render...');
  await page.waitForTimeout(8000);

  await page.evaluate(() => {
    const el = document.getElementById('vorder-3d-office-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(2000);

  const client = await page.context().newCDPSession(page);
  const { data: imgData } = await client.send('Page.captureScreenshot', { format: 'png' });
  const livePath = path.join(outDir, 'verified_live_production_office.png');
  fs.writeFileSync(livePath, Buffer.from(imgData, 'base64'));
  console.log(`Saved live production screenshot to: ${livePath}`);

  await browser.close();
  console.log('DONE!');
}

main().catch(console.error);
