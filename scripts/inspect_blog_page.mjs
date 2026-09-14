import { chromium } from "./../node_modules/.pnpm/@playwright+test@1.59.1/node_modules/@playwright/test/index.mjs";

async function run() {
  const browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'ar-SA'
  });

  const page = await context.newPage();

  const networkReqs = [];
  page.on('request', req => {
    if (req.url().includes('article') || req.url().includes('api') || req.url().includes('blog')) {
      networkReqs.push(`[REQ] ${req.method()} ${req.url()}`);
    }
  });

  page.on('response', async res => {
    if (res.url().includes('article') || res.url().includes('api')) {
      let bodyText = '';
      try {
        const json = await res.json();
        bodyText = `JSON count: ${Array.isArray(json) ? json.length : 'object'}`;
      } catch {
        bodyText = 'non-json';
      }
      networkReqs.push(`[RES] ${res.status()} ${res.url()} -> ${bodyText}`);
    }
  });

  console.log("Directly opening https://mohamed-abdelsamee-portfolio.vercel.app/blog ...");
  await page.goto("https://mohamed-abdelsamee-portfolio.vercel.app/blog", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  console.log("Current URL:", page.url());
  console.log("Page Title:", await page.title());

  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/portfolio_blog_page_mobile.png"
  });

  // Evaluate the content on /blog
  const pageData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.innerText.trim());
    const cards = Array.from(document.querySelectorAll('a[href*="/blog/"], article, div[class*="article"], div[class*="blog"]')).map(el => ({
      text: el.innerText.trim().slice(0, 80),
      href: el.getAttribute('href') || ''
    }));

    // Check all links on the page
    const allLinks = Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim().slice(0, 60),
      href: a.href
    }));

    return {
      headings: headings.slice(0, 20),
      totalArticleLinks: allLinks.filter(l => l.href.includes('/blog/')).length,
      sampleArticleLinks: allLinks.filter(l => l.href.includes('/blog/')).slice(0, 15)
    };
  });

  console.log("Page Data:", JSON.stringify(pageData, null, 2));
  console.log("Network Reqs:", JSON.stringify(networkReqs, null, 2));

  await browser.close();
}

run().catch(console.error);
