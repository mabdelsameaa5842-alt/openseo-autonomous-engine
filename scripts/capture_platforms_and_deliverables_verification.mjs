import { chromium } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log('🚀 Starting Platforms & Deliverables Visual Verification...');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Get real super admin auth token
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  let loginData = {};
  try {
    const curlOutput = execSync(curlCmd, { encoding: "utf8" });
    loginData = JSON.parse(curlOutput);
  } catch (e) {
    console.error("Auth curl error:", e);
  }
  console.log("Super Admin Login Status:", loginData.success ? "SUCCESS" : "FAILED");

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--use-angle=gl'
    ]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 950 },
    permissions: ['clipboard-read', 'clipboard-write']
  });

  if (loginData.token) {
    await context.addCookies([
      {
        name: "openseo_admin_token",
        value: loginData.token,
        domain: "open-seo.abdelsameaa.workers.dev",
        path: "/",
      },
    ]);
  }

  const page = await context.newPage();

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

  // 1. Integrations Hub: Settings Integrations (11 Platforms)
  console.log('📸 Screen 1: Integrations Hub (/settings/integrations)...');
  await page.goto(`${baseUrl}/p/${projectId}/settings/integrations`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(4000);
  
  // Scroll down to the new strategic platforms (Clerk, Camber, Tavily)
  const clerkEl = await page.$('#clerk');
  if (clerkEl) {
    await clerkEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: path.join(outDir, 'screen_01_11_platforms_integrations.png'), fullPage: false });

  const tavilyEl = await page.$('#tavily');
  if (tavilyEl) {
    await tavilyEl.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: path.join(outDir, 'screen_06_tavily_card.png'), fullPage: false });

  // 2. Vorder Studio: Meeting Chamber, 360 Peer Surveillance & Deliverables
  console.log('📸 Screen 2: Vorder Studio (/vorder-studio)...');
  await page.goto(`${baseUrl}/p/${projectId}/vorder-studio`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(outDir, 'screen_02_vorder_studio_peer_surveillance.png'), fullPage: false });

  // 3. Project Overview: Platform Telemetry & Quotas
  console.log('📸 Screen 3: Project Overview (/p/${projectId})...');
  await page.goto(`${baseUrl}/p/${projectId}`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(outDir, 'screen_03_dashboard_telemetry_11_platforms.png'), fullPage: false });

  await browser.close();
  console.log('✅ Visual verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Fatal error during capture:', err);
  process.exit(1);
});
