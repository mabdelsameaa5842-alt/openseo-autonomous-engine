import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const localBaseUrl = 'http://127.0.0.1:5173';

async function main() {
  console.log('=== Starting Forensic Verification of Root Cause Fixes ===');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
  });

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('Error') || text.includes('failed') || text.includes('Vorder')) {
      console.log('BROWSER LOG:', text);
    }
  });

  console.log(`1. Navigating to Root URL: ${localBaseUrl}/`);
  await page.goto(`${localBaseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  // Check current URL
  console.log(`Current URL after root navigation: ${page.url()}`);

  // Check for any DataForSEO banner or text
  const content = await page.content();
  const hasDataForSeoText = content.includes('DataForSEO');
  console.log(`Assertion 1: Is "DataForSEO" text present in page? -> ${hasDataForSeoText} (Expected: false)`);

  const hasUnexpectedError = content.includes('An unexpected error occurred');
  console.log(`Assertion 2: Is "An unexpected error occurred" present? -> ${hasUnexpectedError} (Expected: false)`);

  // Check if project dropdown or project header is loaded
  const projectSelected = !content.includes('Select project') || content.includes('cc58e018-8ef9-4be7-8f3a-2af2bc158d62');
  console.log(`Assertion 3: Project routed or selected? -> ${projectSelected}`);

  // Take screenshot of landing state
  const screenshotPath1 = path.join(outDir, 'verified_root_navigation_clean.png');
  await page.screenshot({ path: screenshotPath1, fullPage: true });
  console.log(`Saved screenshot 1: ${screenshotPath1}`);

  // Fill password and click sign in button
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible()) {
    console.log('Filling password...');
    await passInput.fill('Mm201915842');
    await page.waitForTimeout(300);
  }

  const loginBtn = page.locator('button:has-text("دخول لوحة الإدارة")').first();
  if (await loginBtn.isVisible()) {
    console.log('Logging in with Super Admin credentials...');
    await loginBtn.click();
    await page.waitForTimeout(5000);
    console.log(`URL after login: ${page.url()}`);
  }

  // Navigate to skills-hub directly
  console.log('2. Navigating to Skills Hub...');
  await page.goto(`${localBaseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);

  const skillsHubContent = await page.content();
  const hasDataForSeoInHub = skillsHubContent.includes('DataForSEO');
  console.log(`Assertion 4: Is DataForSEO anywhere in Skills Hub? -> ${hasDataForSeoInHub} (Expected: false)`);

  const hasUnexpectedErrorInHub = skillsHubContent.includes('An unexpected error occurred');
  console.log(`Assertion 5: Is "An unexpected error occurred" in Skills Hub? -> ${hasUnexpectedErrorInHub} (Expected: false)`);

  const screenshotPath2 = path.join(outDir, 'verified_skills_hub_clean.png');
  await page.screenshot({ path: screenshotPath2, fullPage: true });
  console.log(`Saved screenshot 2: ${screenshotPath2}`);

  await browser.close();
  console.log('=== Verification Run Complete ===');
}

main().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
