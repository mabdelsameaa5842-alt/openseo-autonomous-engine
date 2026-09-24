import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'http://localhost:3001';
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub?tab=history`;

async function run() {
  console.log('1. Fetching token...');
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOut = execSync(curlCmd, { encoding: 'utf8' });
  const loginData = JSON.parse(curlOut);
  const token = loginData.token;

  console.log('2. Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
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

    console.log('4. Waiting 5s for WebGL scene...');
    await page.waitForTimeout(5000);

    // Capture screenshot via CDP (instantaneous, zero hang)
    console.log('5. Capturing screenshot via CDP...');
    const client = await page.context().newCDPSession(page);
    const { data } = await client.send('Page.captureScreenshot', { format: 'png' });
    const overviewPath = path.join(outDir, 'verified_3d_war_table_studio.png');
    fs.writeFileSync(overviewPath, Buffer.from(data, 'base64'));
    console.log(`Saved screenshot via CDP: ${overviewPath}`);

    // Click Tariq Al-Abdali pill at the bottom reliably
    console.log('6. Clicking Tariq Al-Abdali pill via evaluate...');
    const clicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes('طارق العبدلي'));
      if (target) {
        target.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('Successfully clicked Tariq pill! Waiting 2s...');
      await page.waitForTimeout(2000);
      const { data: dossierData } = await client.send('Page.captureScreenshot', { format: 'png' });
      const dossierPath = path.join(outDir, 'verified_tariq_dossier_modal.png');
      fs.writeFileSync(dossierPath, Buffer.from(dossierData, 'base64'));
      console.log(`Saved dossier screenshot via CDP: ${dossierPath}`);
    } else {
      console.log('Tariq pill not found via text match.');
    }

  } catch (err) {
    console.error('Run error:', err);
  } finally {
    await browser.close();
    console.log('Done.');
  }
}

run();
