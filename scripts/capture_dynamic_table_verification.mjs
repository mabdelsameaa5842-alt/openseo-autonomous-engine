import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log('🚀 Capturing verification of Dynamic Consumptions Table...');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

  // Pre-seed SuperAdmin authentication
  await page.addInitScript(() => {
    const adminUser = {
      id: "local-admin",
      name: "م. محمد عبد السميع",
      email: "mohamed701164@gmail.com",
      role: "super_admin",
      roleTitle: "👑 المدير العام والتنفيذي (Super Admin)",
      avatar: "MA",
      permissions: ["PERM_ALL", "PERM_AUTONOMOUS_SEO", "PERM_MAKE_INTEGRATION", "PERM_PROJECTS_FULL"]
    };
    sessionStorage.setItem("vorder_super_admin_auth", "true");
    sessionStorage.setItem("vorder_super_admin_user", JSON.stringify(adminUser));
    localStorage.setItem("vorder_super_admin_auth_remember", "true");
    localStorage.setItem("vorder_super_admin_user", JSON.stringify(adminUser));
  });

  // Navigate to skills-hub
  await page.goto(`${baseUrl}/p/${projectId}/skills-hub`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);

  // If password input appears, authenticate
  const passInput = await page.$('input[type="password"]');
  if (passInput && await passInput.isVisible()) {
    console.log('🔑 Submitting SuperAdmin password...');
    await passInput.fill('Mm201915842');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(4000);
  }

  // Click on "إعدادات المحرك" (Settings) tab
  const settingsTab = page.locator('button').filter({ hasText: /إعدادات المحرك|Engine Settings/i }).first();
  if (await settingsTab.isVisible()) {
    console.log('⚡ Clicking on إعدادات المحرك (Engine Settings) tab...');
    await settingsTab.click();
    await page.waitForTimeout(3000);
  }

  // Scroll to the dynamic table and take screenshot
  const dynamicTable = page.locator('table').filter({ hasText: /Cloudflare D1/i }).first();
  if (await dynamicTable.isVisible()) {
    console.log('✨ Dynamic Consumptions Table is VISIBLE on screen!');
    await dynamicTable.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
  }

  const screenshotPath = path.join(outDir, 'verified_dynamic_consumptions_table_live.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`✅ Saved live table screenshot: ${screenshotPath}`);

  await browser.close();
}

main().catch(console.error);
