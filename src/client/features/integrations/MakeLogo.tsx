import type { SVGProps } from "react";

export function MakeLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      fill="none"
      className={className}
      {...props}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="120" height="120" rx="26" fill="url(#make-grad)" />
      <path
        d="M28 88V32H40L60 62L80 32H92V88H80V52L64 76H56L40 52V88H28Z"
        fill="#FFFFFF"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <circle cx="86" cy="78" r="6" fill="#C084FC" />
      <defs>
        <linearGradient id="make-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6D28D9" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#4C1D95" />
        </linearGradient>
      </defs>
    </svg>
  );
}
