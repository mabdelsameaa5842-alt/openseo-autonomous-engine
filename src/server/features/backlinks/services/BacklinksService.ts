import { buildCacheKey, getCached, setCached } from "@/server/lib/r2-cache";
import { normalizeBacklinksTarget } from "@/server/lib/dataforseo";
import {
  normalizeBacklinksSpamFilterOptions,
  type BacklinksLookupInput,
  type BacklinksSpamFilterOptions,
} from "@/types/schemas/backlinks";
import {
  profileBacklinksOverview,
  profileBacklinksRowsPage,
  profileReferringDomainsPage,
  profileTopPagesPage,
  type BacklinksCache,
  type BacklinksRowsPageServiceInput,
  type ReferringDomainsPageServiceInput,
  type TopPagesPageServiceInput,
} from "@/server/features/backlinks/services/backlinksServiceData";
import type { BillingCustomerContext } from "@/server/billing/subscription";
import type { CreditFeature } from "@/shared/billing-credit-features";

const defaultCache: BacklinksCache = {
  get: getCached,
  set: setCached,
};

type BacklinksPageCacheInput = {
  target: string;
  scope?: BacklinksLookupInput["scope"];
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: string;
  filters: Record<string, unknown>;
  /** Backlinks rows only: DataForSEO result grouping. */
  mode?: string;
};

function createBacklinksService(cache: BacklinksCache = defaultCache) {
  return {
    async profileOverview(
      input: BacklinksLookupInput,
      billingCustomer: BillingCustomerContext,
      // Lets a caller (e.g. onboarding) attribute the spend to its own credit
      // feature. Applied to the DataForSEO calls, not the cache key, so cached
      // results stay shared across callers.
      creditFeature?: CreditFeature,
    ) {
      try {
        const cacheKey = await buildCacheKey("backlinks:overview", {
          ...buildTargetCacheInput(input, billingCustomer),
        });

        return await profileBacklinksOverview(
          cache,
          cacheKey,
          input,
          billingCustomer,
          creditFeature,
        );
      } catch (err) {
        console.warn("Backlinks profileOverview failed, using fallback:", err);
        return {
          overview: {
            target: input.target,
            displayTarget: input.target,
            scope: (input.scope ?? "domain") as
              | "domain"
              | "exact_url"
              | "subfolder"
              | "subdomains",
            summary: {
              rank: null,
              backlinks: 0,
              referringPages: 0,
              referringDomains: 0,
              brokenBacklinks: 0,
              brokenPages: 0,
              backlinksSpamScore: 0,
              targetSpamScore: 0,
              newBacklinks: 0,
              lostBacklinks: 0,
              newReferringDomains: 0,
              lostReferringDomains: 0,
            },
            trends: [],
            newLostTrends: [],
            fetchedAt: new Date().toISOString(),
          },
        };
      }
    },
    async profileBacklinksPage(
      input: BacklinksRowsPageServiceInput,
      billingCustomer: BillingCustomerContext,
      options?: BacklinksSpamFilterOptions,
    ) {
      try {
        const cacheKey = await buildPageCacheKey(
          "backlinks:rows-page",
          input,
          billingCustomer,
          options,
        );

        return await profileBacklinksRowsPage(
          cache,
          cacheKey,
          input,
          billingCustomer,
          options,
        );
      } catch (err) {
        console.warn("Backlinks profileBacklinksPage failed, using fallback:", err);
        return {
          rows: [],
          totalCount: 0,
          hasMore: false,
          page: input.page || 1,
          pageSize: input.pageSize || 20,
          fetchedAt: new Date().toISOString(),
        };
      }
    },
    async profileReferringDomainsPage(
      input: ReferringDomainsPageServiceInput,
      billingCustomer: BillingCustomerContext,
      options?: BacklinksSpamFilterOptions,
    ) {
      try {
        const cacheKey = await buildPageCacheKey(
          "backlinks:referring-domains-page",
          input,
          billingCustomer,
          options,
        );

        return await profileReferringDomainsPage(
          cache,
          cacheKey,
          input,
          billingCustomer,
          options,
        );
      } catch (err) {
        console.warn("Backlinks profileReferringDomainsPage failed, using fallback:", err);
        return {
          rows: [],
          totalCount: 0,
          hasMore: false,
          page: input.page || 1,
          pageSize: input.pageSize || 20,
          fetchedAt: new Date().toISOString(),
        };
      }
    },
    async profileTopPagesPage(
      input: TopPagesPageServiceInput,
      billingCustomer: BillingCustomerContext,
    ) {
      try {
        const cacheKey = await buildPageCacheKey(
          "backlinks:top-pages-page",
          input,
          billingCustomer,
        );

        return await profileTopPagesPage(cache, cacheKey, input, billingCustomer);
      } catch (err) {
        console.warn("Backlinks profileTopPagesPage failed, using fallback:", err);
        return {
          rows: [],
          totalCount: 0,
          hasMore: false,
          page: input.page || 1,
          pageSize: input.pageSize || 20,
          fetchedAt: new Date().toISOString(),
        };
      }
    },
  } as const;
}

function buildTargetCacheInput(
  input: BacklinksLookupInput,
  billingCustomer: BillingCustomerContext,
) {
  const normalizedTarget = normalizeBacklinksTarget(input.target, {
    scope: input.scope,
  });

  return {
    organizationId: billingCustomer.organizationId,
    target: normalizedTarget.apiTarget,
    scope: normalizedTarget.scope,
    // Subfolder scope keeps the hostname as the API target, so the path must
    // separate cache entries.
    path: normalizedTarget.path,
    // Same hostname, different result set — and keeping it in the key retires
    // entries written before scopes could exclude subdomains.
    includeSubdomains: normalizedTarget.includeSubdomains,
  };
}

async function buildPageCacheKey(
  prefix: string,
  input: BacklinksPageCacheInput,
  billingCustomer: BillingCustomerContext,
  options?: BacklinksSpamFilterOptions,
): Promise<string> {
  const spamFilterOptions = normalizeBacklinksSpamFilterOptions(options);

  return buildCacheKey(prefix, {
    ...buildTargetCacheInput(input, billingCustomer),
    page: input.page,
    pageSize: input.pageSize,
    sortField: input.sortField,
    sortOrder: input.sortOrder,
    filters: input.filters,
    ...(input.mode ? { mode: input.mode } : {}),
    hideSpam: String(spamFilterOptions.hideSpam),
    ...(spamFilterOptions.hideSpam
      ? { spamThreshold: String(spamFilterOptions.spamThreshold) }
      : {}),
  });
}

export const BacklinksService = createBacklinksService();
export { createBacklinksService };
