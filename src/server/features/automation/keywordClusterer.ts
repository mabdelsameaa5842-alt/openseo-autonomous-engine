import type { HarvestedKeyword } from "./keywordHarvester";

export interface ArticleTopicCluster {
  queueOrder: number;
  articleSlug: string;
  articleTitle: string;
  intent: "informational" | "commercial" | "transactional";
  primaryKeyword: string;
  secondaryKeywords: string[];
  monthlyVolume: number;
  briefOutline: {
    h1: string;
    sections: string[];
    targetAudience: string;
  };
}

export function clusterKeywordsIntoArticles(
  keywords: HarvestedKeyword[],
  clusterCount = 100,
): ArticleTopicCluster[] {
  // Sort keywords by search volume descending
  const sorted = [...keywords].sort((a, b) => b.monthlyVolume - a.monthlyVolume);

  // Take top `clusterCount` keywords as primary focus keywords
  const primaryCandidates = sorted.slice(0, clusterCount);
  const remainingCandidates = sorted.slice(clusterCount);

  const clusters: ArticleTopicCluster[] = [];

  for (let i = 0; i < primaryCandidates.length; i++) {
    const primary = primaryCandidates[i];
    // Assign 4 secondary keywords per cluster
    const startIdx = i * 4;
    const secondaries = remainingCandidates
      .slice(startIdx, startIdx + 4)
      .map((k) => k.keyword);

    // If remaining candidates ran out, synthesize relevant LSI keywords
    while (secondaries.length < 4) {
      secondaries.push(`${primary.keyword} tips`);
      secondaries.push(`${primary.keyword} best practices`);
      secondaries.push(`${primary.keyword} guide`);
      secondaries.push(`${primary.keyword} checklist`);
    }

    // Determine intent from keyword pattern
    let intent: "informational" | "commercial" | "transactional" = "informational";
    const kwLower = primary.keyword.toLowerCase();
    if (
      kwLower.includes("buy") ||
      kwLower.includes("price") ||
      kwLower.includes("hire") ||
      kwLower.includes("service") ||
      kwLower.includes("agency")
    ) {
      intent = "transactional";
    } else if (
      kwLower.includes("best") ||
      kwLower.includes("vs") ||
      kwLower.includes("review") ||
      kwLower.includes("comparison") ||
      kwLower.includes("top")
    ) {
      intent = "commercial";
    }

    // Generate English SEO-friendly clean slug
    const cleanSlug = primary.keyword
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);

    // Format professional title
    const capitalized = primary.keyword
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const title =
      intent === "transactional"
        ? `${capitalized}: Complete Strategic Guide & Implementation`
        : intent === "commercial"
          ? `Top ${capitalized} Comparison & Expert Evaluation (2026)`
          : `The Ultimate Guide to ${capitalized} for Modern Businesses`;

    clusters.push({
      queueOrder: i + 1,
      articleSlug: cleanSlug || `seo-article-topic-${i + 1}`,
      articleTitle: title,
      intent,
      primaryKeyword: primary.keyword,
      secondaryKeywords: secondaries.slice(0, 4),
      monthlyVolume: primary.monthlyVolume,
      briefOutline: {
        h1: title,
        sections: [
          `Introduction & Core Concepts of ${capitalized}`,
          `Why ${primary.keyword} Matters for High-Performance Growth`,
          `Step-by-Step Tactical Implementation Plan`,
          `Common Pitfalls & How to Avoid Ranking Drops`,
          `Conclusion & Measurable Action Items`,
        ],
        targetAudience: "Digital marketing directors, SEO specialists, e-commerce founders",
      },
    });
  }

  return clusters;
}
