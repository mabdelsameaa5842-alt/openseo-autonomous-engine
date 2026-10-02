import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log('🚀 Starting Exact Route SSOT (761 Articles) Visual Verification...');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['clipboard-read', 'clipboard-write']
  });

  const page = await context.newPage();

  // Pre-seed authentication in localStorage & sessionStorage
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
    try {
      localStorage.setItem("openseo_current_user", JSON.stringify(adminUser));
      localStorage.setItem("openseo_superadmin_auth", "true");
      sessionStorage.setItem("openseo_superadmin_auth", "true");
      localStorage.setItem("vorder_superadmin_session", "true");
      sessionStorage.setItem("vorder_superadmin_session", "true");
      localStorage.setItem("openseo_active_project_id", "cc58e018-8ef9-4be7-8f3a-2af2bc158d62");
    } catch {}
  });

  async function ensureAuthenticated() {
    try {
      const passInput = await page.$('input[type="password"]');
      if (passInput && await passInput.isVisible()) {
        console.log('🔑 Logging in as SuperAdmin...');
        await passInput.fill('Mm201915842');
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
          await submitBtn.click();
        } else {
          const btn = page.locator('button').filter({ hasText: /دخول|Sign In/ }).first();
          if (await btn.isVisible()) await btn.click();
        }
        await page.waitForTimeout(3000);
      }
    } catch (err) {
      console.warn('Auth check notice:', err.message);
    }
  }

  // 1. Google Ads / Organic Ads Skills Hub
  console.log('📸 Screen 1: Tactical Campaigns & Performance in Skills Hub (/skills-hub)...');
  await page.goto(`${baseUrl}/p/${projectId}/skills-hub`, { waitUntil: 'networkidle', timeout: 35000 });
  await ensureAuthenticated();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(outDir, 'screen_01_campaigns_ssot_761.png'), fullPage: false });

  // 2. Vorder Studio: Agent Chamber & Trainee Agent
  console.log('📸 Screen 2: Vorder Studio (/vorder-studio)...');
  await page.goto(`${baseUrl}/p/${projectId}/vorder-studio`, { waitUntil: 'networkidle', timeout: 35000 });
  await ensureAuthenticated();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(outDir, 'screen_02_agent_meetings_ssot_761.png'), fullPage: false });

  // 3. Main Project Overview
  console.log('📸 Screen 3: Project Overview (/p/${projectId})...');
  await page.goto(`${baseUrl}/p/${projectId}`, { waitUntil: 'networkidle', timeout: 35000 });
  await ensureAuthenticated();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(outDir, 'screen_03_ecosystem_overview_ssot_761.png'), fullPage: false });

  await browser.close();
  console.log('✅ All SSOT Verification Screenshots successfully captured in artifact directory!');
}

main().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
