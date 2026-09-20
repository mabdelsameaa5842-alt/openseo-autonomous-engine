import { chromium } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const URL = 'http://localhost:3001/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio';

async function run() {
  const browser = await chromium.launch({
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2, // High resolution Retina capture
  });

  await context.addInitScript(() => {
    localStorage.setItem('vorder_super_admin_auth_remember', 'true');
    sessionStorage.setItem('vorder_super_admin_auth', 'true');
    const adminUser = JSON.stringify({
      id: 'admin-1',
      name: 'م. محمد عبد السميع',
      email: 'mohamed701164@gmail.com',
      role: 'super_admin',
      roleTitle: 'المدير العام والتنفيذي',
      avatar: '',
      permissions: ['*'],
    });
    localStorage.setItem('vorder_super_admin_user', adminUser);
    sessionStorage.setItem('vorder_super_admin_user', adminUser);
  });

  const page = await context.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.route('**/_server/**', async route => {
    const url = route.request().url();
    if (url.includes('getProjectAccess')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { hasAccess: true, role: 'owner' } }),
      });
    }
    if (url.includes('getProjects')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: [{ id: 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62', name: 'OpenSEO Production' }],
        }),
      });
    }
    return route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('text=حارس استهلاك وموارد Cloudflare D1', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // 1. Full Expanded Island & Color Harmony View
  const p1 = path.join(ARTIFACT_DIR, 'visual_audit_expanded_sidebar.png');
  await page.screenshot({ path: p1, fullPage: false });
  console.log('Saved:', p1);

  // 2. Click to toggle Growth & Performance accordion group (to test drop-down collapse/expand)
  try {
    const growthHeader = page.locator('button:has-text("النمو والأداء"), button:has-text("Growth & Performance")').first();
    if (await growthHeader.isVisible()) {
      await growthHeader.click();
      await page.waitForTimeout(600); // Wait for grid transition
      const p2 = path.join(ARTIFACT_DIR, 'visual_audit_accordion_toggled.png');
      await page.screenshot({ path: p2, fullPage: false });
      console.log('Saved:', p2);
      // Toggle it back open
      await growthHeader.click();
      await page.waitForTimeout(400);
    }
  } catch (err) {
    console.warn('Accordion toggle note:', err.message);
  }

  // 3. Toggle sidebar collapse to test Collapsed Rail Mode
  try {
    const collapseBtn = page.locator('button[aria-label="Toggle sidebar collapse"]').first();
    if (await collapseBtn.isVisible()) {
      await collapseBtn.click();
      await page.waitForTimeout(600); // Wait for width transition
      const p3 = path.join(ARTIFACT_DIR, 'visual_audit_rail_collapsed.png');
      await page.screenshot({ path: p3, fullPage: false });
      console.log('Saved:', p3);
    }
  } catch (err) {
    console.warn('Rail collapse note:', err.message);
  }

  await browser.close();
  console.log('Visual audit captures complete!');
}

run().catch(console.error);
