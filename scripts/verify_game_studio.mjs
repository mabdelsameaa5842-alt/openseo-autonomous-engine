import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'http://localhost:3001';
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`;

async function run() {
  console.log('1. Fetching Super Admin token via curl...');
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOut = execSync(curlCmd, { encoding: 'utf8' });
  const loginData = JSON.parse(curlOut);
  console.log('Auth result:', loginData.success ? 'SUCCESS' : loginData);

  const token = loginData.token;

  console.log('2. Launching Chrome...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
  });

  if (token) {
    await context.addCookies([
      {
        name: 'openseo_admin_token',
        value: token,
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        secure: false,
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

  try {
    console.log(`3. Navigating to: ${targetUrl}`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    // Wait for initial queries and hydration to settle
    await page.waitForTimeout(6000);

    console.log('4. Clicking on "مقر الوكلاء وسجل الأتمتة" via DOM evaluate...');
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.innerText && b.innerText.includes('مقر الوكلاء وسجل الأتمتة'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    console.log('Clicked result:', clicked);

    // Wait for Three.js WebGL and War Table to load and render
    console.log('5. Waiting 9s for 3D War Table and agents rendering...');
    await page.waitForTimeout(9000);

    const overviewPath = path.join(outDir, 'verified_3d_war_table_studio.png');
    await page.screenshot({ path: overviewPath, fullPage: false });
    console.log(`Saved screenshot: ${overviewPath}`);

    console.log('6. Clicking on Tariq Al-Abdali pill via DOM evaluate...');
    const tariqClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const target = btns.find(b => b.innerText && b.innerText.includes('طارق العبدلي'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    console.log('Tariq clicked result:', tariqClicked);

    if (tariqClicked) {
      await page.waitForTimeout(2500);
      const dossierPath = path.join(outDir, 'verified_tariq_dossier_modal.png');
      await page.screenshot({ path: dossierPath, fullPage: false });
      console.log(`Saved dossier screenshot: ${dossierPath}`);
    }

  } catch (err) {
    console.error('Test run error:', err);
  } finally {
    await browser.close();
    console.log('Verification finished.');
  }
}

run();
