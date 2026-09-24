# Agent guidance

## Engineering principles

- Prefer simple, readable, flat code with minimal indirection.
- Search for existing implementations and installed libraries before creating new helpers or abstractions.
- Abstract when it prevents meaningful drift and makes the result simpler to maintain. Avoid speculative or one-use abstraction layers.
- Keep product data normalized and relationships explicit. Do not encode relational data in JSON or text merely to avoid joins.
- For new application-backed backend functionality, default to: TanStack server function → service → repository.
- Keep schema changes, queries, and mutations compatible with both SQLite and Postgres.
- Use idiomatic TypeScript. Use Zod to validate untrusted data and narrow runtime values at trust boundaries.
- Prefer established project helpers and libraries over hand-rolled implementations.
- Prefer idiomatic TanStack Query, Router, and Form patterns for server state, routing, and submitted forms.

## Log papercuts

When small, non-blocking repository friction occurs—a retried tool call, confusing setup step, flaky command, stale cache, misleading error, or non-obvious gotcha—use the `papercuts` skill and append it to `.agents/PAPERCUTS.md` in the moment. Continue the current task. Real bugs and tracked work are not papercuts, and sensitive data must never be logged.

Do not mine an entire session for papercuts or start a broad cleanup unless the user explicitly asks.

## Authoritative Ground Truth & Autonomous Synchronization Rules (قواعد الحقيقة الرقمية والمزامنة الذاتية)

1. **Live Page-Level GSC Truth (مزامنة الظهور الحي بأبعاد الصفحات):**
   - All performance metrics (Impressions, Clicks, Avg Position) must be derived dynamically from live Google Search Console API using `dimensions: ["page"]` and `dataState: "all"`.
   - Never use static mock fallbacks or desktop overview aggregations (which lag by 48-72h).
   - Authoritative Impressions = the sum of all pages in the property (`rows.reduce((sum, r) => sum + r.impressions, 0)`). For example, 14 pages = 23 impressions, weighted avg position = 35.52.
   - Zero-Trust Viewport Audit: Never sum visible UI table rows from a screenshot/viewport; always verify the full array count (e.g. 14 pages total vs 12 visible on screen).

2. **Database & Publishing Alignment (تطابق المقالات وخريطة الموقع):**
   - Total published articles displayed in UI and agents must strictly equal `SELECT COUNT(*) FROM autonomous_content_queue WHERE status = 'published'` in Cloudflare D1 (currently 738), verified against Vercel blog edge SSR.
   - Live Sitemap URL count must strictly equal `published_articles + static_routes` (e.g. 738 + 2 = 740 URLs).
   - Campaign progress must isolate campaign-assigned articles (e.g. 645/1500 = 43%) while presenting the global system total (738).
   - Topic cluster cards must dynamically group from D1 across all 738 published articles instead of displaying hardcoded legacy previews (470).

3. **Closed-Loop Background Automation (الأتمتة المغلقة وحارس الحصص):**
   - Cloudflare Worker crons (`*/15` and `*/30`) must autonomously keep D1, Vercel, and GSC in continuous sync without human intervention.
   - Circuit breakers must guard Cloudflare D1 row reads (5M free tier) and Gemini API quotas.
   - All code, automations, and configurations must remain in a Private GitHub Repository to prevent unauthorized scraping and cloud resource depletion.

## Preserve review learnings

After a merge-ready or other code review verifies a finding, use `maintain-greptile-rules` only when the finding exposes a recurring or high-risk repository invariant that existing `.greptile/` context and automated checks do not capture. Do not promote one-off bugs or preferences into permanent review rules.

Changes to `.greptile/**`, `AGENTS.md`, `CLAUDE.md`, `.agents/skills/**`, and `.github/**` alter the review control plane and must receive explicit maintainer review. CODEOWNERS requests that review; where repository settings allow, enable GitHub's requirement for code-owner approval. Repository-specific rules live in `.greptile/`; maintainers should configure or retain a minimal org-enforced Greptile baseline for external-contribution, secret, authentication, billing, CI, and rule-tampering risks. Agents should report an unverified or missing baseline and must not mutate dashboard or organization rules without explicit user authorization.

