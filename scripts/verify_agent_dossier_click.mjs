import { chromium } from "@playwright/test";
import { execSync } from "child_process";

const artifactsDir = "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d";
const baseUrl = "https://open-seo.abdelsameaa.workers.dev";
const targetUrl = `${baseUrl}/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/skills-hub`;

async function main() {
  const curlCmd = `curl -s -X POST ${baseUrl}/api/auth/super-admin/login -H "Content-Type: application/json" -d '{"email":"mohamed701164@gmail.com","password":"Mm201915842","rememberMe":true}'`;
  const curlOutput = execSync(curlCmd, { encoding: "utf8" });
  const loginData = JSON.parse(curlOutput);

  const browser = await chromium.launch({
    headless: true,
    executablePath: "/usr/bin/google-chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
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
  await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(3500);

  // Switch to Tab 8
  const autoTab = page.locator("button:has-text('مخطط وسجل الأتمتة')");
  if (await autoTab.count() > 0) {
    await autoTab.first().click();
    await page.waitForTimeout(2500);
  }

  const canvasEl = page.locator("canvas").first();
  await canvasEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const box = await canvasEl.boundingBox();
  if (box) {
    // Click exactly on Kareem's desk: (704/1440, 288/800)
    const clickX = box.x + (704 / 1440) * box.width;
    const clickY = box.y + (288 / 800) * box.height;
    console.log("Clicking on Kareem at:", clickX, clickY);
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(2000);

    const dossierModal = page.locator("text=مصفوفة الاتصالات الثلاثية التي يتحكم بها الوكيل");
    if (await dossierModal.count() > 0) {
      console.log("Dossier Modal opened successfully!");
      const dossierShot = `${artifactsDir}/live_isometric_agent_dossier.png`;
      await page.screenshot({ path: dossierShot, fullPage: false });
      console.log("📸 Saved dossier shot:", dossierShot);

      // Test Instant Ping
      const pingBtn = page.locator("button:has-text('فحص الاتصال الآن')");
      if (await pingBtn.count() > 0) {
        await pingBtn.first().click();
        await page.waitForTimeout(2000);
        const pingShot = `${artifactsDir}/live_isometric_instant_ping.png`;
        await page.screenshot({ path: pingShot, fullPage: false });
        console.log("📸 Saved instant ping shot:", pingShot);
      }
    } else {
      console.log("Dossier modal not found on click, retrying slightly higher...");
      await page.mouse.click(clickX, clickY - 15);
      await page.waitForTimeout(2000);
      if (await dossierModal.count() > 0) {
        const dossierShot = `${artifactsDir}/live_isometric_agent_dossier.png`;
        await page.screenshot({ path: dossierShot, fullPage: false });
      }
    }
  }

  await browser.close();
}

main().catch(console.error);
