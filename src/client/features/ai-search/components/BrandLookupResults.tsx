import { Info } from "lucide-react";
import { BrandLookupMentionTrendCard } from "@/client/features/ai-search/components/BrandLookupMentionTrendCard";
import { BrandLookupShareOfVoice } from "@/client/features/ai-search/components/BrandLookupShareOfVoice";
import { CitationTabsCard } from "@/client/features/ai-search/components/BrandLookupCitationsCard";
import {
  formatCount,
  formatPlatformLabel,
  PLATFORM_DOT_CLASS,
} from "@/client/features/ai-search/platformLabels";
import type { BrandLookupResult } from "@/types/schemas/ai-search";
import { RESEARCH_SCOPE_LABELS } from "@/shared/researchScope";
import { useI18n } from "@/client/lib/i18n";

type Props = {
  result: BrandLookupResult;
  projectId: string;
};

type PlatformRow = BrandLookupResult["perPlatform"][number];
type MetricKey = "mentions" | "aiSearchVolume";

const DOMAIN_LEVEL_TIP =
  "AI search providers report mentions per domain, not per page. This number covers the whole domain — the cited pages below are limited to your scope.";

/**
 * Marks a metric that could not be narrowed to a URL scope, so a page-scoped
 * lookup never reads as if the number belonged to that page.
 */
function DomainLevelBadge() {
  return (
    <span
      className="tooltip badge badge-ghost badge-sm shrink-0 normal-case"
      data-tip={DOMAIN_LEVEL_TIP}
    >
      Domain-level
    </span>
  );
}

export function BrandLookupResults({ result, projectId }: Props) {
  const { t, isRtl } = useI18n();

  if (!result.hasData) {
    const erroredPlatforms = result.perPlatform.filter(
      (p) => p.status === "error",
    );
    const allPlatformsErrored =
      erroredPlatforms.length === result.perPlatform.length &&
      result.perPlatform.length > 0;

    if (allPlatformsErrored) {
      return (
        <div className="rounded-2xl border border-[#222225] bg-[#141416] p-6 text-sm text-zinc-300 shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
              !
            </span>
            <p className="font-semibold text-white">
              {isRtl ? "تنبيه توثيق حساب مزود البيانات (DataForSEO)" : "DataForSEO Account Verification Notice"}
            </p>
          </div>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            {isRtl
              ? `حساب مزود البيانات يتطلب تأكيد التوثيق في لوحة التحكم الخاصة به لتفعيل مزامنة إشارات الذكاء الاصطناعي للنطاق ${result.resolvedTarget}.`
              : `The DataForSEO provider account requires verification in the user panel before LLM mention telemetry can be polled for ${result.resolvedTarget}.`}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href="https://app.dataforseo.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-zinc-200 transition-colors"
            >
              <span>{isRtl ? "فتح لوحة تحكم DataForSEO للتوثيق" : "Open DataForSEO Panel to Verify"}</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-[#222225] bg-[#141416] p-6 text-sm text-zinc-300 shadow-xl">
          <p className="font-semibold text-white">
            {t("brand.no_mentions_title", "No AI Mentions Detected Yet")}
          </p>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            {isRtl
              ? `لم يتم رصد إشارات أو استشهادات بعد للنطاق ${result.resolvedTarget} عبر نماذج الذكاء الاصطناعي (ChatGPT, Claude, Gemini, Perplexity). يمكنك البدء بنشر مقالات عبر محرك الأتمتة لرفع نسبة الظهور.`
              : `No brand mentions or citations detected yet for ${result.resolvedTarget} across AI models (ChatGPT, Claude, Gemini, Perplexity). Publishing tactical articles will build presence.`}
          </p>
        </div>
        {erroredPlatforms.length > 0 ? (
          <p className="text-xs text-zinc-500">
            {isRtl ? "ملاحظة: بعض المنصات تحتاج إعادة محاولة." : "Note: some platforms were unavailable and may need retry."}
          </p>
        ) : null}
      </div>
    );
  }

  const hasTrendData = result.monthlyVolume.length > 0;
  const sov = result.shareOfVoice;

  return (
    <div className="space-y-4">
      <BrandHeader result={result} />

      {/* One shared grid so the cards align by construction: stats left, trend
          right, Share of Voice flowing into the next free half-width cell —
          whichever of trend/SoV is absent, the rest stay column-aligned. A
          lone stats card keeps full width instead of half a grid. */}
      <div
        className={
          hasTrendData || sov ? "grid gap-4 lg:grid-cols-2" : undefined
        }
      >
        <StatsCard result={result} />
        {hasTrendData ? <MentionTrendCard result={result} /> : null}
        {sov ? (
          <BrandLookupShareOfVoice
            shareOfVoice={sov}
            isDomainLevel={result.aggregatesAreDomainLevel}
          />
        ) : null}
      </div>

      <CitationTabsCard result={result} projectId={projectId} />
    </div>
  );
}

function BrandHeader({ result }: { result: BrandLookupResult }) {
  return (
    <section className="flex flex-wrap items-baseline justify-between gap-2">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">
          {result.resolvedTarget}
        </h2>
        <span className="badge badge-ghost badge-sm">
          {result.detectedTargetType}
        </span>
        {result.scope ? (
          <span className="badge badge-ghost badge-sm">
            {RESEARCH_SCOPE_LABELS[result.scope]}
          </span>
        ) : null}
      </div>
      <p className="text-xs text-base-content/50">
        Updated {formatRelative(result.fetchedAt)}
      </p>
    </section>
  );
}

function StatsCard({ result }: { result: BrandLookupResult }) {
  return (
    <section className="rounded-xl border border-base-300 bg-base-100">
      <div className="flex h-full flex-col divide-y divide-base-200">
        <StatBlock
          label="Mentions"
          tooltip="Estimated count of AI answers where the searched brand or domain appeared in the answer text or cited sources."
          value={result.totalMentions}
          perPlatform={result.perPlatform}
          metric="mentions"
          isDomainLevel={result.aggregatesAreDomainLevel}
        />
        <StatBlock
          label="AI search volume"
          tooltip="Estimated monthly search demand for prompts where the searched brand or domain appears in AI answers. This is prompt demand, not mention count."
          value={result.totalAiSearchVolume}
          perPlatform={result.perPlatform}
          metric="aiSearchVolume"
          isDomainLevel={result.aggregatesAreDomainLevel}
        />
      </div>
    </section>
  );
}

function StatBlock({
  label,
  tooltip,
  value,
  perPlatform,
  metric,
  isDomainLevel,
}: {
  label: string;
  tooltip: string;
  value: number | null;
  perPlatform: PlatformRow[];
  metric: MetricKey;
  isDomainLevel: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center p-4">
      <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-base-content/50">
        {label}
        <span className="tooltip inline-flex normal-case" data-tip={tooltip}>
          <Info className="size-3 text-base-content/40" />
        </span>
        {isDomainLevel ? <DomainLevelBadge /> : null}
      </p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">
        {formatCount(value)}
      </p>
      <div className="mt-3 space-y-1 border-t border-base-200 pt-2.5">
        {perPlatform.map((row) => (
          <PlatformStatRow key={row.platform} row={row} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function PlatformStatRow({
  row,
  metric,
}: {
  row: PlatformRow;
  metric: MetricKey;
}) {
  const value = row.status === "error" ? null : row[metric];

  return (
    <div className="flex items-center justify-between text-xs">
      <span className="inline-flex items-center gap-1.5 text-base-content/70">
        <span
          className={`size-1.5 rounded-full ${PLATFORM_DOT_CLASS[row.platform]}`}
        />
        {formatPlatformLabel(row.platform)}
        {row.platform === "chat_gpt" ? (
          <span
            className="tooltip z-20 inline-flex"
            data-tip="DataForSEO indexes ChatGPT mentions for US English only — country selection is not available for this platform."
          >
            <Info className="size-3 text-base-content/40" />
          </span>
        ) : null}
        {row.status === "error" ? (
          <span className="text-error">unavailable</span>
        ) : null}
      </span>
      <span className="font-medium tabular-nums text-base-content/90">
        {formatCount(value)}
      </span>
    </div>
  );
}

function MentionTrendCard({ result }: { result: BrandLookupResult }) {
  return (
    <section className="overflow-hidden rounded-xl border border-base-300 bg-base-100">
      <div className="flex items-center justify-between gap-2 border-b border-base-300 px-4 py-3">
        <h3 className="text-sm font-semibold">
          Mention trend (last 12 months)
        </h3>
        {result.aggregatesAreDomainLevel ? <DomainLevelBadge /> : null}
      </div>
      <div className="p-4">
        <BrandLookupMentionTrendCard result={result} />
      </div>
    </section>
  );
}

function formatRelative(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "just now";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
