/** Better Auth provider ID for the dedicated Google Ads & Keyword Planner grant. */
export const GOOGLE_ADS_OAUTH_PROVIDER_ID = "google-ads";

export const GOOGLE_ADS_OAUTH_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/adwords",
] as const;

export const GOOGLE_ADS_SETUP_DOCS_URL =
  "https://developers.google.com/google-ads/api/docs/first-call/overview";

export type GoogleAdsCustomerAccount = {
  customerId: string;
  descriptiveName: string;
  currencyCode?: string;
  timeZone?: string;
  isSelected?: boolean;
};

export type KeywordPlannerMetric = {
  keyword: string;
  searchVolume: number | null;
  competition: "LOW" | "MEDIUM" | "HIGH" | "UNSPECIFIED";
  competitionIndex: number | null;
  lowTopOfPageBid: number | null;
  highTopOfPageBid: number | null;
  cpc: number | null;
  monthlySearches?: Array<{
    year: number;
    month: number;
    searchVolume: number;
  }>;
};
