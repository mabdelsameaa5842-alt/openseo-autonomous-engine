// Shared building blocks for the dashboard cards.
// Styled according to Apple Human Interface Guidelines (OLED dark, hairline borders,
// monochrome typography, with semantic emerald green and red accents).
export function CardShell({
  title,
  subtitle,
  stamp,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  stamp?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl shadow-xl flex flex-col justify-between transition-colors duration-200 ${className}`}
      style={{
        background: "var(--apple-card)",
        border: "1px solid var(--apple-border)",
      }}
    >
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 transition-colors duration-200"
        style={{ borderBottom: "1px solid var(--apple-border)" }}
      >
        <div>
          <h2
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--apple-text-primary)" }}
          >
            {title}
          </h2>
          {subtitle ? (
            <p
              className="mt-0.5 text-[11px] leading-normal"
              style={{ color: "var(--apple-text-secondary)" }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between">
        {children}
        {stamp ? (
          <p
            className="mt-4 text-[11px] font-mono"
            style={{ color: "var(--apple-text-secondary)" }}
          >
            {stamp}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyCardBody({
  message,
  cta,
}: {
  message: string;
  cta: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-xs text-zinc-400 leading-relaxed">{message}</p>
      {cta}
    </div>
  );
}

export function Stat({
  label,
  value,
  tone,
  sub,
}: {
  label: string;
  value: string;
  tone?: "success" | "error";
  sub?: React.ReactNode;
}) {
  const toneClass =
    tone === "success"
      ? "text-[#30D158]"
      : tone === "error"
        ? "text-[#FF453A]"
        : "text-white";
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className={`mt-0.5 text-2xl font-bold tracking-tight font-mono ${toneClass}`}>
        {value}
      </p>
      {sub}
    </div>
  );
}

export function PercentDelta({
  current,
  previous,
}: {
  current: number;
  previous: number;
}) {
  if (previous <= 0) return null;
  const pct = ((current - previous) / previous) * 100;
  if (!Number.isFinite(pct)) return null;
  const rounded = Math.round(pct);
  const tone =
    rounded > 0 ? "text-[#30D158]" : rounded < 0 ? "text-[#FF453A]" : "text-zinc-400";
  return (
    <p className={`mt-1 text-xs font-mono font-medium tabular-nums ${tone}`}>
      {rounded > 0 ? "▲" : rounded < 0 ? "▼" : ""} {Math.abs(rounded)}%
    </p>
  );
}

export const moreDetailsClass =
  "inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white";

export function newLost(value: number | null): string {
  return value === null ? "—" : String(value);
}

export function formatDay(timestamp: string): string {
  const ms = Date.parse(
    // SQLite's current_timestamp default has no timezone marker; treat it as
    // UTC rather than letting the browser parse it as local time.
    /^\d{4}-\d{2}-\d{2} /.test(timestamp)
      ? `${timestamp.replace(" ", "T")}Z`
      : timestamp,
  );
  if (Number.isNaN(ms)) return timestamp;
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

