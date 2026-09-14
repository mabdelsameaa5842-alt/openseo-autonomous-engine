import * as React from "react";
import { useI18n } from "@/client/lib/i18n";

interface SplineAreaChartProps {
  data?: number[];
  height?: number;
  className?: string;
  labels?: string[];
}

function getSplinePath(points: Array<{ x: number; y: number }>): string {
  if (points.length < 2) return "";

  let path = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }

  return path;
}

export function SplineAreaChart({
  data = [14, 22, 18, 35, 28, 45, 52, 48, 62, 58, 75],
  height = 90,
  className = "",
  labels,
}: SplineAreaChartProps) {
  const { t } = useI18n();
  const id = React.useId().replace(/:/g, "");

  const defaultLabels = [
    t("time.1am", "1am"),
    t("time.2am", "2am"),
    t("time.3pm", "3pm"),
    t("time.9pm", "9pm"),
    t("time.2pm", "2pm"),
  ];

  const axisLabels = labels ?? defaultLabels;

  const width = 340;
  const paddingX = 10;
  const paddingTop = 12;
  const paddingBottom = 16;
  const chartHeight = height - paddingBottom;

  const minVal = Math.min(...data);
  const maxVal = Math.max(...data, minVal + 1);
  const range = maxVal - minVal;

  const points = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
    const normalizedY = (val - minVal) / range;
    const y = chartHeight - paddingTop - normalizedY * (chartHeight - 2 * paddingTop);
    return { x, y };
  });

  const linePath = getSplinePath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x},${chartHeight} L ${points[0].x},${chartHeight} Z`;

  return (
    <div className={`w-full flex flex-col justify-end ${className}`}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        preserveAspectRatio="none"
        style={{ height: `${height}px` }}
      >
        <defs>
          <linearGradient id={`grad-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id={`glow-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Subtle horizontal grid lines */}
        <line
          x1={paddingX}
          y1={paddingTop}
          x2={width - paddingX}
          y2={paddingTop}
          stroke="rgba(255, 255, 255, 0.04)"
          strokeDasharray="3 3"
        />
        <line
          x1={paddingX}
          y1={chartHeight / 2}
          x2={width - paddingX}
          y2={chartHeight / 2}
          stroke="rgba(255, 255, 255, 0.04)"
          strokeDasharray="3 3"
        />

        {/* Underfill Gradient Area */}
        <path d={areaPath} fill={`url(#grad-${id})`} />

        {/* Glowing Spline Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${id})`}
        />

        {/* Current Value Dot at the end */}
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3.5"
            fill="#ffffff"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Time Axis Labels */}
      <div className="flex justify-between px-2 pt-1 text-[10px] font-mono text-zinc-500">
        {axisLabels.map((lbl, i) => (
          <span key={i}>{lbl}</span>
        ))}
      </div>
    </div>
  );
}
