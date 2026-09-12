import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/screenshots';
const baseUrl = 'https://open-seo.abdelsameaa.workers.dev';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function run() {
  console.log('Launching Chrome via Playwright...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: outDir, size: { width: 1440, height: 900 } }
  });

  const page = await context.newPage();

  const routes = [
    { name: '01_dashboard', url: `${baseUrl}/p/${projectId}` },
    { name: '02_growth_studio', url: `${baseUrl}/p/${projectId}/vorder-studio` },
    { name: '03_skills_hub', url: `${baseUrl}/p/${projectId}/skills-hub` },
    { name: '04_search_performance', url: `${baseUrl}/p/${projectId}/search-performance` },
    { name: '05_rank_tracking', url: `${baseUrl}/p/${projectId}/rank-tracking` },
    { name: '06_site_audit', url: `${baseUrl}/p/${projectId}/audit` },
    { name: '06_site_audit_detail', url: `${baseUrl}/p/${projectId}/audit/31d1117a-74c1-4609-8180-9923fee99869` },
    { name: '07_sam_chat', url: `${baseUrl}/p/${projectId}/sam` },
    { name: '09_portfolio_live_home', url: 'https://mohamed-abdelsamee-portfolio.vercel.app/' },
    { name: '10_portfolio_live_blog', url: 'https://mohamed-abdelsamee-portfolio.vercel.app/blog' },
  ];

  for (const r of routes) {
    try {
      console.log(`Navigating to ${r.name}: ${r.url}`);
      await page.goto(r.url, { waitUntil: 'domcontentloaded', timeout: 35000 });
      await page.waitForTimeout(4000);
      const file = path.join(outDir, `${r.name}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log(`Saved screenshot: ${file}`);
    } catch (err) {
      console.error(`Error capturing ${r.name}:`, err.message);
    }
  }

  // Also capture close-up of sidebar
  try {
    const sidebar = await page.$('nav');
    if (sidebar) {
      await sidebar.screenshot({ path: path.join(outDir, '08_sidebar_closeup.png') });
      console.log('Saved sidebar closeup!');
    }
  } catch (err) {
    console.error('Sidebar closeup error:', err);
  }

  await context.close();
  await browser.close();
  console.log('Playwright run completed successfully!');
}

run().catch(console.error);
