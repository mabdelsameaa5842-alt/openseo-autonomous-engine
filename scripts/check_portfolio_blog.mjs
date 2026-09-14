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
  
  const networkLogs = [];
  page.on('request', req => {
    networkLogs.push(`[REQ] ${req.method()} ${req.url()}`);
  });
  page.on('response', res => {
    if (res.url().includes('article') || res.url().includes('blog')) {
      networkLogs.push(`[RES] ${res.status()} ${res.url()}`);
    }
  });

  console.log("Navigating to portfolio homepage...");
  await page.goto("https://mohamed-abdelsamee-portfolio.vercel.app/", { waitUntil: "networkidle" });

  console.log("Current URL:", page.url());

  // Look for blog links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      text: a.innerText.trim(),
      href: a.href,
      pathname: a.pathname
    }));
  });
  console.log("All matching links on page:", JSON.stringify(links.filter(l => l.text.includes('مدون') || l.href.includes('blog') || l.text.includes('Blog') || l.text.includes('مقال')), null, 2));

  // Find hamburger menu button on mobile
  const hamburger = page.locator('button[aria-label*="قائمة"], button[aria-label*="menu"], nav button').first();
  if (await hamburger.isVisible()) {
    console.log("Clicking mobile menu hamburger...");
    await hamburger.click();
    await page.waitForTimeout(1000);
    
    // Check links in open menu
    const menuLinks = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.innerText.trim(),
        href: a.href,
        pathname: a.pathname
      }));
    });
    console.log("Menu links after hamburger:", JSON.stringify(menuLinks.filter(l => l.text.includes('مدون') || l.href.includes('blog') || l.text.includes('Blog') || l.text.includes('مقال')), null, 2));
  }

  // Look for any link with /blog
  const blogLink = page.locator('a[href*="blog"], a:has-text("المدونة"), a:has-text("مدونة")').first();
  if (await blogLink.count() > 0) {
    console.log("Clicking blog link:", await blogLink.getAttribute('href'), await blogLink.innerText());
    await blogLink.click();
    await page.waitForTimeout(3000);
  } else {
    console.log("Direct navigation to /blog...");
    await page.goto("https://mohamed-abdelsamee-portfolio.vercel.app/blog", { waitUntil: "networkidle" });
  }

  console.log("URL after clicking blog:", page.url());

  await page.screenshot({
    path: "/home/mohamed-ahmed/.gemini/antigravity/brain/186b40ac-7f24-4176-97f8-a771c82a841d/portfolio_blog_clicked.png"
  });

  // Evaluate page contents: how many articles? What titles?
  const blogInfo = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.innerText.trim());
    const articleCards = Array.from(document.querySelectorAll('article, a[href*="/blog/"]')).map(a => ({
      text: a.innerText.slice(0, 100),
      href: a.href || ''
    }));
    return {
      title: document.title,
      headings: headings.slice(0, 15),
      articleCount: articleCards.length,
      sampleArticles: articleCards.slice(0, 10)
    };
  });

  console.log("Blog Page Info:", JSON.stringify(blogInfo, null, 2));
  console.log("Network Logs:", JSON.stringify(networkLogs.filter(n => n.includes('article') || n.includes('blog')), null, 2));

  await browser.close();
}

run().catch(console.error);
