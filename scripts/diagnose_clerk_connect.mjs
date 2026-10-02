import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

const baseUrl = 'https://open-seo-ten.vercel.app';
const projectId = 'cc58e018-8ef9-4be7-8f3a-2af2bc158d62';

async function main() {
  console.log("=== Diagnosing Clerk Connect Flow ===");

  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  let loginData = {};
  try {
    loginData = JSON.parse(execSync(curlCmd, { encoding: "utf8" }));
  } catch (e) {
    console.error(e);
  }

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  if (loginData.token) {
    await context.addCookies([{
      name: "openseo_admin_token",
      value: loginData.token,
      domain: "open-seo.abdelsameaa.workers.dev",
      path: "/",
    }]);
  }

  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  page.on('request', req => {
    if (req.url().includes('_server') || req.url().includes('platform')) {
      console.log('HTTP REQ:', req.method(), req.url());
      try {
        console.log('REQ POST DATA:', req.postData());
      } catch {}
    }
  });

  page.on('response', async res => {
    if (res.url().includes('_server') || res.url().includes('platform')) {
      console.log('HTTP RES STATUS:', res.status(), res.url());
      try {
        const text = await res.text();
        console.log('RES BODY:', text.slice(0, 300));
      } catch {}
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem("openseo_current_user", JSON.stringify({ id: "local-admin", name: "م. محمد عبد السميع", role: "super_admin" }));
    localStorage.setItem("openseo_superadmin_auth", "true");
    sessionStorage.setItem("openseo_superadmin_auth", "true");
  });

  console.log("Navigating to settings/integrations...");
  await page.goto(`${baseUrl}/p/${projectId}/settings/integrations`, { waitUntil: 'networkidle', timeout: 30000 });

  const clerkEl = await page.$('#clerk');
  if (clerkEl) await clerkEl.scrollIntoViewIfNeeded();

  // Find Clerk input
  const clerkInput = page.locator('#clerk input[type="text"], #clerk input[placeholder*="pk_test"]').first();
  if (await clerkInput.isVisible()) {
    console.log("Filling Clerk key...");
    await clerkInput.fill("pk_test_ZnJ1c2gtZG92ZS03OTgxLmNsZXJrLmFjY291bnRzLmRldiQ");
    const connectBtn = page.locator('#clerk button').filter({ hasText: /Connect/ }).first();
    console.log("Clicking connect button...");
    await connectBtn.click();
    await page.waitForTimeout(4000);
  } else {
    console.log("Clerk input not directly visible, checking card state...");
  }

  await browser.close();
}

main().catch(console.error);
