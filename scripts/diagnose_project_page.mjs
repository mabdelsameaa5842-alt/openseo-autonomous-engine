import { chromium } from '@playwright/test';
import path from 'path';

const outDir = '/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d';
const projectUrl = 'https://open-seo-ten.vercel.app/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log(`=== Diagnosing Project Page at ${projectUrl} ===`);
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--use-gl=angle']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type().toUpperCase()}]`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('[UNCAUGHT PAGE ERROR]', err.message, err.stack);
  });

  page.on('requestfailed', req => {
    console.warn('[REQUEST FAILED]', req.method(), req.url(), req.failure()?.errorText);
  });

  page.on('response', async res => {
    if (res.status() >= 400) {
      let body = '';
      try {
        body = await res.text();
      } catch {}
      console.warn(`[HTTP ${res.status()}] ${res.url()} -> ${body.slice(0, 300)}`);
    }
  });

  // Pre-seed Super Admin authentication
  await page.addInitScript(() => {
    sessionStorage.setItem("vorder_super_admin_auth", "true");
    localStorage.setItem("vorder_super_admin_auth_remember", "true");
    const superUser = {
      id: "super-admin-001",
      name: "م. محمد عبد السميع",
      email: "mohamed701164@gmail.com",
      role: "owner",
      roleTitle: "المدير التنفيذي والمؤسس",
      avatar: "https://lh3.googleusercontent.com/a/ACg8ocL...",
      permissions: ["*"]
    };
    sessionStorage.setItem("vorder_super_admin_user", JSON.stringify(superUser));
    localStorage.setItem("vorder_super_admin_user", JSON.stringify(superUser));
  });

  console.log('Navigating directly to project URL...');
  const response = await page.goto(projectUrl, { waitUntil: 'networkidle', timeout: 35000 });
  console.log('Direct response status:', response?.status());

  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log('Current URL after wait:', currentUrl);

  const diagnosis = await page.evaluate(() => {
    const mainEl = document.querySelector('main');
    const allDivs = document.querySelectorAll('div');
    const bodyText = document.body.innerText;
    return {
      title: document.title,
      mainExists: !!mainEl,
      mainHTML: mainEl ? mainEl.innerHTML.slice(0, 300) : null,
      bodyTextLength: bodyText.length,
      snippet: bodyText.slice(0, 300)
    };
  });

  console.log('Diagnosis evaluation:', JSON.stringify(diagnosis, null, 2));

  const shotPath = path.join(outDir, 'live_diagnose_project_page.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log('Screenshot saved to:', shotPath);

  await browser.close();
}

main().catch(err => {
  console.error('Fatal error during diagnosis:', err);
  process.exit(1);
});
