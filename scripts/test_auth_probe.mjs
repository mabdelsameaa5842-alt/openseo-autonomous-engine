import { chromium } from '@playwright/test';

async function probe() {
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });

  console.log('--- Probing workers.dev ---');
  await page.goto('https://open-seo.abdelsameaa.workers.dev/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio', { timeout: 30000 }).catch(e => console.log('workers err:', e.message));
  await page.waitForTimeout(3000);
  console.log('Workers Title:', await page.title());
  const passWorkers = await page.$('input[type="password"]');
  console.log('Workers Password field:', !!passWorkers);
  const emailValWorkers = await page.$eval('input[type="email"]', el => el.value).catch(() => 'no email');
  console.log('Workers Email val:', emailValWorkers);
  const buttonsWorkers = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()).filter(Boolean));
  console.log('Workers Buttons:', buttonsWorkers.slice(0, 5));

  console.log('--- Probing vercel.app ---');
  await page.goto('https://open-seo-ten.vercel.app/p/cc58e018-8ef9-4be7-8f3a-2af2bc158d62/vorder-studio', { timeout: 30000 }).catch(e => console.log('vercel err:', e.message));
  await page.waitForTimeout(3000);
  console.log('Vercel Title:', await page.title());
  const passVercel = await page.$('input[type="password"]');
  console.log('Vercel Password field:', !!passVercel);
  const emailValVercel = await page.$eval('input[type="email"]', el => el.value).catch(() => 'no email');
  console.log('Vercel Email val:', emailValVercel);
  const buttonsVercel = await page.$$eval('button', btns => btns.map(b => b.textContent?.trim()).filter(Boolean));
  console.log('Vercel Buttons:', buttonsVercel.slice(0, 5));

  await browser.close();
}

probe().catch(console.error);
