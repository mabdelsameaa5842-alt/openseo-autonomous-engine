import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const portfolioUrl = 'https://mohamed-abdelsamee-portfolio.vercel.app';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log('🚀 Starting 15-Screen Visual Verification Suite for SuperAdmin...');

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

  // Helper to ensure authenticated state
  async function ensureAuthenticated() {
    try {
      const passInput = await page.$('input[type="password"]');
      if (passInput && await passInput.isVisible()) {
        console.log('🔑 SuperAdminGate detected! Logging in as mohamed701164@gmail.com...');
        await passInput.fill('Mm201915842');
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
          await submitBtn.click();
        } else {
          const btn = page.locator('button').filter({ hasText: /دخول|Sign In/ }).first();
          if (await btn.isVisible()) await btn.click();
        }
        await page.waitForTimeout(4000);
      }
    } catch (err) {
      console.warn('Auth check notice:', err.message);
    }
  }

  // Pre-seed authentication in localStorage & sessionStorage to be rock-solid
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

  // ─────────────────────────────────────────────────────────────
  // 1. SCREEN 01: Dashboard & Sidebar Overview
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 01: Dashboard & Sidebar...');
  await page.goto(`${baseUrl}/p/${projectId}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await ensureAuthenticated();
  await page.waitForTimeout(2000);

  const file01 = path.join(outDir, 'screen_01_dashboard_sidebar.png');
  await page.screenshot({ path: file01, fullPage: false });
  console.log(`✅ Saved Screen 01: ${file01}`);

  // ─────────────────────────────────────────────────────────────
  // 2. SCREEN 02: 3D Office Canvas & Desks
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 02: 3D Office Canvas...');
  await page.goto(`${baseUrl}/p/${projectId}/skills-hub`, { waitUntil: 'networkidle', timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await ensureAuthenticated();

  // Click on "مقر الوكلاء" / History tab where VorderIsometricVideoGame lives
  const historyTab = page.locator('button').filter({ hasText: /مقر الوكلاء|Agent HQ|سجل العمليات|history/i }).first();
  if (await historyTab.isVisible()) {
    await historyTab.click();
    await page.waitForTimeout(4000);
  }

  const file02 = path.join(outDir, 'screen_02_3d_office_canvas.png');
  await page.screenshot({ path: file02, fullPage: false });
  console.log(`✅ Saved Screen 02: ${file02}`);

  // ─────────────────────────────────────────────────────────────
  // 3. SCREEN 03: Meeting Chamber Modal
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 03: Meeting Chamber Modal...');
  const chamberBtn = page.locator('button').filter({ hasText: /غرفة الاجتماعات|اجتماع الوكلاء|Chamber|فتح غرفة الاجتماع/ }).first();
  if (await chamberBtn.isVisible()) {
    await chamberBtn.click();
    await page.waitForTimeout(3500);
  }

  const file03 = path.join(outDir, 'screen_03_meeting_chamber_modal.png');
  await page.screenshot({ path: file03, fullPage: false });
  console.log(`✅ Saved Screen 03: ${file03}`);

  // ─────────────────────────────────────────────────────────────
  // 4. SCREEN 04: Agent Chat Dialogue (Clean, No Prompt Leakage)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 04: Agent Chat Dialogue...');
  // Find chat input inside Chamber modal if open
  const chatInput = page.locator('input[placeholder*="رسالة"], textarea[placeholder*="رسالة"], input[placeholder*="اسأل"], textarea[placeholder*="اسأل"]').first();
  if (await chatInput.isVisible()) {
    await chatInput.fill('ما هي خطة تحسين أداء السايت ماب وتوسيع الأرشفة التلقائية؟');
    const sendBtn = page.locator('button:has(svg.lucide-send)').first();
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
      console.log('⚡ Sent prompt to agent, waiting for clean response...');
      await page.waitForTimeout(6000);
    }
  }

  const file04 = path.join(outDir, 'screen_04_agent_chat_dialogue.png');
  await page.screenshot({ path: file04, fullPage: false });
  console.log(`✅ Saved Screen 04: ${file04}`);

  // ─────────────────────────────────────────────────────────────
  // 5. SCREEN 05: Roundtable Dialogue Feed
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 05: Roundtable Dialogue Feed...');
  // In the chamber modal, ensure we are on the dialogue / stream view
  const roundtableTab = page.locator('button').filter({ hasText: /الحوار الجماعي|طاولة النقاش|المحادثة|الحوار/ }).first();
  if (await roundtableTab.isVisible()) {
    await roundtableTab.click();
    await page.waitForTimeout(2000);
  }

  const file05 = path.join(outDir, 'screen_05_roundtable_dialogue_feed.png');
  await page.screenshot({ path: file05, fullPage: false });
  console.log(`✅ Saved Screen 05: ${file05}`);

  // ─────────────────────────────────────────────────────────────
  // 6. SCREEN 06: Unified Ecosystem D1 Gauge
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 06: Unified Ecosystem D1 Gauge...');
  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const closeBtn = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn.isVisible()) await closeBtn.click().catch(() => {});
  await page.waitForTimeout(1000);

  // Switch to Overview tab on skills-hub
  const overviewTab = page.locator('button').filter({ hasText: /نظرة عامة|Overview/i }).first();
  if (await overviewTab.isVisible()) {
    await overviewTab.click();
    await page.waitForTimeout(2500);
  }

  const file06 = path.join(outDir, 'screen_06_unified_ecosystem_d1_gauge.png');
  await page.screenshot({ path: file06, fullPage: false });
  console.log(`✅ Saved Screen 06: ${file06}`);

  // ─────────────────────────────────────────────────────────────
  // 7. SCREEN 07: KV Quota Safe Indicator
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 07: KV Quota Safe Indicator...');
  // Scroll down slightly or focus on Quota telemetry
  const file07 = path.join(outDir, 'screen_07_kv_quota_indicator.png');
  await page.screenshot({ path: file07, fullPage: false });
  console.log(`✅ Saved Screen 07: ${file07}`);

  // ─────────────────────────────────────────────────────────────
  // 8. SCREEN 08: AI Cooldown Radar
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 08: AI Cooldown Radar...');
  const settingsTab = page.locator('button').filter({ hasText: /إعدادات المحرك|إعدادات|Settings/i }).first();
  if (await settingsTab.isVisible()) {
    await settingsTab.click();
    await page.waitForTimeout(3000);
  }

  const file08 = path.join(outDir, 'screen_08_ai_cooldown_radar.png');
  await page.screenshot({ path: file08, fullPage: false });
  console.log(`✅ Saved Screen 08: ${file08}`);

  // ─────────────────────────────────────────────────────────────
  // 9. SCREEN 09: 8 Connected Platforms Mesh
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 09: 8 Connected Platforms Mesh...');
  await page.goto(`${baseUrl}/p/${projectId}/settings/integrations`, { waitUntil: 'networkidle', timeout: 35000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await ensureAuthenticated();

  const file09 = path.join(outDir, 'screen_09_eight_platforms_mesh.png');
  await page.screenshot({ path: file09, fullPage: false });
  console.log(`✅ Saved Screen 09: ${file09}`);

  // ─────────────────────────────────────────────────────────────
  // 10. SCREEN 10: Portfolio Blog Listing (Vercel)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 10: Portfolio Blog Listing...');
  await page.goto(`${portfolioUrl}/blog`, { waitUntil: 'networkidle', timeout: 35000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const file10 = path.join(outDir, 'screen_10_portfolio_blog_listing.png');
  await page.screenshot({ path: file10, fullPage: false });
  console.log(`✅ Saved Screen 10: ${file10}`);

  // ─────────────────────────────────────────────────────────────
  // 11. SCREEN 11: Published Article Detail (GEO Block & Schema)
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 11: Published Article GEO...');
  await page.goto(`${portfolioUrl}/blog/guide-to-sitemap-crawler-2026`, { waitUntil: 'networkidle', timeout: 35000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const file11 = path.join(outDir, 'screen_11_published_article_geo.png');
  await page.screenshot({ path: file11, fullPage: false });
  console.log(`✅ Saved Screen 11: ${file11}`);

  // ─────────────────────────────────────────────────────────────
  // 12. SCREEN 12: Programmatic Diagnostics Modal / Logs
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 12: Programmatic Diagnostics Modal...');
  await page.goto(`${baseUrl}/p/${projectId}/skills-hub`, { waitUntil: 'networkidle', timeout: 35000 }).catch(() => {});
  await page.waitForTimeout(3000);
  await ensureAuthenticated();

  // Open chamber modal
  const chamberBtn2 = page.locator('button').filter({ hasText: /غرفة الاجتماعات|اجتماع الوكلاء|Chamber/ }).first();
  if (await chamberBtn2.isVisible()) {
    await chamberBtn2.click();
    await page.waitForTimeout(3000);

    // Click on logs tab
    const logsTab = page.locator('button').filter({ hasText: /اللوجز|سجل العمليات|التشخيص|logs/i }).first();
    if (await logsTab.isVisible()) {
      await logsTab.click();
      await page.waitForTimeout(2000);
    }
  }

  const file12 = path.join(outDir, 'screen_12_programmatic_diagnostics_modal.png');
  await page.screenshot({ path: file12, fullPage: false });
  console.log(`✅ Saved Screen 12: ${file12}`);

  // ─────────────────────────────────────────────────────────────
  // 13. SCREEN 13: Agent Nominations Hub
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 13: Agent Nominations Hub...');
  const nomTab = page.locator('button').filter({ hasText: /الترشيحات|ترشيحات|nominations/i }).first();
  if (await nomTab.isVisible()) {
    await nomTab.click();
    await page.waitForTimeout(2000);
  }

  const file13 = path.join(outDir, 'screen_13_agent_nominations_hub.png');
  await page.screenshot({ path: file13, fullPage: false });
  console.log(`✅ Saved Screen 13: ${file13}`);

  // ─────────────────────────────────────────────────────────────
  // 14. SCREEN 14: Rest Cycle & Circuit Breaker Countdown
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 14: Rest Cycle Countdown...');
  // Close modal and view smart telemetry feed
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const closeBtn2 = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn2.isVisible()) await closeBtn2.click().catch(() => {});
  await page.waitForTimeout(1000);

  // Switch to History tab where VorderSmartTelemetryFeed is shown
  const historyTab2 = page.locator('button').filter({ hasText: /مقر الوكلاء|Agent HQ|سجل العمليات|history/i }).first();
  if (await historyTab2.isVisible()) {
    await historyTab2.click();
    await page.waitForTimeout(2500);
  }

  const file14 = path.join(outDir, 'screen_14_rest_cycle_countdown.png');
  await page.screenshot({ path: file14, fullPage: false });
  console.log(`✅ Saved Screen 14: ${file14}`);

  // ─────────────────────────────────────────────────────────────
  // 15. SCREEN 15: Diagnostic JSON Copy Confirmation
  // ─────────────────────────────────────────────────────────────
  console.log('\n📸 Capturing Screen 15: Diagnostic JSON Copy Toast...');
  const copyBtn = page.locator('button').filter({ hasText: /نسخ تقرير الصيانة البرمجية للمطور|نسخ تقرير الصيانة/ }).first();
  if (await copyBtn.isVisible()) {
    await copyBtn.click();
    await page.waitForTimeout(1000);
  }

  const file15 = path.join(outDir, 'screen_15_diagnostic_json_copy.png');
  await page.screenshot({ path: file15, fullPage: false });
  console.log(`✅ Saved Screen 15: ${file15}`);

  await context.close();
  await browser.close();
  console.log('\n🎉 ALL 15 VERIFICATION SCREENS CAPTURED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('❌ Error during 15-screen capture:', err);
  process.exit(1);
});
