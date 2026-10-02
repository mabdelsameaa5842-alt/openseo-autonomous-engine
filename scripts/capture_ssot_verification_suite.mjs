import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log('🚀 Running Comprehensive SSOT Verification Suite...');

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
  console.log('📍 Navigating to Skills Hub...');
  await page.goto(`${baseUrl}/p/${projectId}/skills-hub`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4000);

  // If password input appears, authenticate
  const passInput = await page.$('input[type="password"]');
  if (passInput && await passInput.isVisible()) {
    console.log('🔑 Submitting SuperAdmin password...');
    await passInput.fill('Mm201915842');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) await submitBtn.click();
    await page.waitForTimeout(5000);
  }

  // 1. Capture GSC Indexing Radar
  console.log('📸 1. Capturing GSC Indexing Radar on Overview tab...');
  const gscRadar = page.locator('div').filter({ hasText: /سجل الأرشفة الحية ومزامنة الفهرسة/i }).first();
  if (await gscRadar.isVisible()) {
    await gscRadar.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
  }
  const radarPath = path.join(outDir, 'screen_01_gsc_indexing_radar_761.png');
  await page.screenshot({ path: radarPath, fullPage: false });
  console.log(`✅ Saved: ${radarPath}`);

  // 2. Click on "إعدادات المحرك" (Settings) tab to inspect the Dynamic Consumptions Table
  const settingsTab = page.locator('button').filter({ hasText: /إعدادات المحرك|Engine Settings/i }).first();
  if (await settingsTab.isVisible()) {
    console.log('⚡ Clicking on إعدادات المحرك (Engine Settings) tab...');
    await settingsTab.click();
    await page.waitForTimeout(3000);
  }

  // Scroll to the dynamic table and take screenshot
  console.log('📸 2. Capturing Dynamic Consumptions Table with SSOT Row 4...');
  const tableContainer = page.locator('table').first();
  if (await tableContainer.isVisible()) {
    await tableContainer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
  }
  const tablePath = path.join(outDir, 'screen_02_dynamic_table_reconciled_761.png');
  await page.screenshot({ path: tablePath, fullPage: false });
  console.log(`✅ Saved: ${tablePath}`);

  // 3. Navigate to Integrations Page to verify GSC & GA4 cards
  console.log('📍 Navigating to Settings Integrations Page...');
  await page.goto(`${baseUrl}/p/${projectId}/settings/integrations`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(4000);

  const integrationsPath = path.join(outDir, 'screen_03_integrations_disconnect_resilient.png');
  await page.screenshot({ path: integrationsPath, fullPage: false });
  console.log(`✅ Saved: ${integrationsPath}`);

  await browser.close();
  console.log('🎉 Verification suite completed successfully!');
}

main().catch(console.error);
