export interface PublishedArticleRecord {
  slug: string;
  publishedAt: string;
  title?: string;
}

export function generateRobotsTxt(domain: string): string {
  return `# ==============================================================================
# OpenSEO Autonomous Robots.txt Governor (Closed-Loop Synchronization Engine)
# Target Domain: https://${domain}
# Last Updated: ${new Date().toISOString()}
# ==============================================================================

# Search Engine Crawlers
User-agent: Googlebot
User-agent: Bingbot
User-agent: Slurp
User-agent: DuckDuckBot
User-agent: Baiduspider
User-agent: Yandex
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_private/
Disallow: /scratch/

# Modern AI Search Crawlers & LLM Indexers (Authorized for Citations & GEO/AEO)
User-agent: GPTBot
User-agent: ChatGPT-User
User-agent: PerplexityBot
User-agent: ClaudeBot
User-agent: anthropic-ai
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: Bytespider
User-agent: CCBot
Allow: /
Disallow: /api/

# Sitemaps Index & Feeds
Sitemap: https://${domain}/sitemap.xml
Sitemap: https://${domain}/sitemap-articles.xml
`;
}

export function generateSitemapXml(
  domain: string,
  articles: PublishedArticleRecord[],
  staticPages: string[] = ["", "about", "services", "contact", "portfolio"],
): string {
  const nowIso = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // 1. Static Pages
  for (const page of staticPages) {
    const url = page ? `https://${domain}/${page}` : `https://${domain}/`;
    const priority = page === "" ? "1.00" : "0.80";
    xml += `  <url>
    <loc>${url}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>
`;
  }

  // 2. Programmatic Tactical Articles
  for (const art of articles) {
    const artUrl = `https://${domain}/blog/${art.slug}`;
    const artDate = art.publishedAt || nowIso;
    xml += `  <url>
    <loc>${artUrl}</loc>
    <lastmod>${artDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}
