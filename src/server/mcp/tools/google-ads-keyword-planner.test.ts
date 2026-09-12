import { describe, expect, it, vi } from "vitest";

vi.mock("cloudflare:workers", () => ({
  env: {},
}));

import { getGoogleAdsKeywordIdeasTool } from "./google-ads-keyword-planner";

describe("Google Ads & Keyword Planner tool", () => {
  it("defines the tool correctly", () => {
    expect(getGoogleAdsKeywordIdeasTool.name).toBe("get_google_ads_keyword_ideas");
    expect(getGoogleAdsKeywordIdeasTool.config.title).toBe("Get Google Ads Keyword Planner ideas");
  });
});
