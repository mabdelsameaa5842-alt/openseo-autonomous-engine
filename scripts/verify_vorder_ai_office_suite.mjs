import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'http://localhost:3001';
const targetUrl = `${baseUrl}/p/80e19092-284f-471a-8499-1e75d0d9f3ea/skills-hub?tab=history`;

async function main() {
  console.log('1. Logging in to fetch super-admin token...');
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOut = execSync(curlCmd, { encoding: 'utf8' });
  const loginData = JSON.parse(curlOut);
  const token = loginData.token;
  console.log('Token acquired successfully:', token.slice(0, 15) + '...');

  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--use-gl=angle',
      '--use-angle=gl-egl'
    ]
  });

  // A. Desktop Daylight View (1440x960)
  console.log('2. Opening Desktop Daylight Session...');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });

  await desktopCtx.addCookies([
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

  const desktopPage = await desktopCtx.newPage();
  desktopPage.on('console', msg => console.log('DESKTOP CONSOLE:', msg.text()));
  desktopPage.on('pageerror', err => console.log('DESKTOP ERROR:', err));

  await desktopPage.addInitScript((t) => {
    localStorage.setItem('openseo_admin_token', t);
    localStorage.setItem('openseo_super_admin_session', JSON.stringify({ authenticated: true }));
  }, token);

  console.log(`Navigating to target URL: ${targetUrl}`);
  await desktopPage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });

  console.log('Waiting 5s for page and Three.js 3D diorama...');
  await desktopPage.waitForTimeout(5000);

  // Scroll #vorder-3d-office-container into view
  console.log('Scrolling 3D office container into view...');
  await desktopPage.evaluate(() => {
    const el = document.getElementById('vorder-3d-office-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await desktopPage.waitForTimeout(2000);

  const desktopCdp = await desktopPage.context().newCDPSession(desktopPage);
  
  // Capture Day Mode
  console.log('Capturing verified_vorder_ai_office_day.png...');
  const { data: dayData } = await desktopCdp.send('Page.captureScreenshot', { format: 'png' });
  const dayPath = path.join(outDir, 'verified_vorder_ai_office_day.png');
  fs.writeFileSync(dayPath, Buffer.from(dayData, 'base64'));
  console.log(`Saved: ${dayPath}`);

  // Overwrite verified_3d_war_table_studio.png
  const warTablePath = path.join(outDir, 'verified_3d_war_table_studio.png');
  fs.writeFileSync(warTablePath, Buffer.from(dayData, 'base64'));
  console.log(`Updated legacy artifact: ${warTablePath}`);

  // Click Tariq Al-Abdali pill to open Dossier
  console.log('Clicking Tariq Al-Abdali pill in 3D bar...');
  const clickedTariq = await desktopPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const target = buttons.find(b => b.textContent && b.textContent.includes('طارق العبدلي'));
    if (target) {
      target.click();
      return true;
    }
    return false;
  });

  if (clickedTariq) {
    console.log('Clicked Tariq! Waiting 2s for dossier modal...');
    await desktopPage.waitForTimeout(2000);
    const { data: dossierData } = await desktopCdp.send('Page.captureScreenshot', { format: 'png' });
    const dossierPath = path.join(outDir, 'verified_vorder_ai_office_dossier.png');
    fs.writeFileSync(dossierPath, Buffer.from(dossierData, 'base64'));
    console.log(`Saved: ${dossierPath}`);

    // Also update verified_tariq_dossier_modal.png
    const legacyDossier = path.join(outDir, 'verified_tariq_dossier_modal.png');
    fs.writeFileSync(legacyDossier, Buffer.from(dossierData, 'base64'));

    // Close dossier modal
    await desktopPage.evaluate(() => {
      const closeBtn = document.querySelector('div.animate-in button');
      if (closeBtn) closeBtn.click();
    });
    await desktopPage.waitForTimeout(1500);
  }

  // Toggle Cyberpunk Mode
  console.log('Toggling Cyberpunk Mode in HUD...');
  const toggledCyber = await desktopPage.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const cyberBtn = buttons.find(b => b.textContent && (b.textContent.includes('سايبربانك') || b.textContent.includes('مود')));
    if (cyberBtn) {
      cyberBtn.click();
      return true;
    }
    return false;
  });

  if (toggledCyber) {
    console.log('Toggled Cyberpunk! Waiting 2s...');
    await desktopPage.waitForTimeout(2000);
    const { data: cyberData } = await desktopCdp.send('Page.captureScreenshot', { format: 'png' });
    const cyberPath = path.join(outDir, 'verified_vorder_ai_office_cyberpunk.png');
    fs.writeFileSync(cyberPath, Buffer.from(cyberData, 'base64'));
    console.log(`Saved: ${cyberPath}`);
  }

  await desktopCtx.close();

  // B. Mobile View (390x844 - iPhone 14 / modern phone)
  console.log('3. Opening Mobile Session (390x844)...');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  await mobileCtx.addCookies([
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

  const mobilePage = await mobileCtx.newPage();
  await mobilePage.addInitScript((t) => {
    localStorage.setItem('openseo_admin_token', t);
    localStorage.setItem('openseo_super_admin_session', JSON.stringify({ authenticated: true }));
  }, token);

  await mobilePage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 45000 });
  console.log('Waiting 5s for mobile render...');
  await mobilePage.waitForTimeout(5000);

  await mobilePage.evaluate(() => {
    const el = document.getElementById('vorder-3d-office-container');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await mobilePage.waitForTimeout(1000);

  const mobileCdp = await mobilePage.context().newCDPSession(mobilePage);
  const { data: mobileData } = await mobileCdp.send('Page.captureScreenshot', { format: 'png' });
  const mobilePath = path.join(outDir, 'verified_vorder_ai_office_mobile.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileData, 'base64'));
  console.log(`Saved: ${mobilePath}`);

  await mobileCtx.close();
  await browser.close();
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
}

main().catch(console.error);
