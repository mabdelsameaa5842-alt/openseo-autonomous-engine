import React from "react";

export interface BrandLogoProps {
  className?: string;
}

/**
 * 1. Official Google Search Console Multi-Color Vector Logo
 */
export function GoogleSearchConsoleLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M283.674 781.491L162.842 902.349C158.365 906.809 152.303 909.313 145.984 909.313C139.665 909.313 133.603 906.809 129.126 902.349L121.651 894.874C117.199 890.398 114.7 884.342 114.7 878.029C114.7 871.716 117.199 865.66 121.651 861.184L242.483 740.326C246.961 735.859 253.028 733.349 259.354 733.349C265.679 733.349 271.746 735.859 276.224 740.326L283.674 747.776C285.891 749.988 287.651 752.615 288.851 755.508C290.052 758.401 290.67 761.502 290.67 764.634C290.67 767.766 290.052 770.867 288.851 773.759C287.651 776.652 285.891 779.28 283.674 781.491Z"
        fill="#FBBC04"
      />
      <path
        d="M608 832H762.675C782.987 832.003 803.101 828.005 821.867 820.232C840.633 812.46 857.684 801.067 872.046 786.703C886.407 772.339 897.798 755.286 905.567 736.518C913.336 717.751 917.332 697.637 917.325 677.325V261.325C917.328 241.015 913.33 220.903 905.56 202.139C897.789 183.374 886.398 166.325 872.037 151.963C857.675 137.602 840.626 126.211 821.861 118.44C803.097 110.67 782.985 106.672 762.675 106.675C742.363 106.668 722.249 110.664 703.482 118.433C684.714 126.202 667.661 137.593 653.297 151.954C638.933 166.316 627.54 183.367 619.768 202.133C611.995 220.899 607.997 241.013 608 261.325V832Z"
        fill="#4285F4"
      />
      <path
        d="M352 832C372.314 832.007 392.43 828.01 411.2 820.24C429.969 812.469 447.023 801.076 461.387 786.712C475.751 772.347 487.144 755.293 494.915 736.524C502.686 717.755 506.682 697.639 506.675 677.325C506.679 657.013 502.68 636.899 494.908 618.133C487.135 599.367 475.742 582.316 461.378 567.954C447.014 553.593 429.961 542.202 411.194 534.433C392.426 526.664 372.312 522.668 352 522.675C331.688 522.668 311.574 526.664 292.806 534.433C274.039 542.202 256.986 553.593 242.622 567.954C228.258 582.316 216.865 599.367 209.092 618.133C201.32 636.899 197.321 657.013 197.325 677.325C197.318 697.639 201.314 717.755 209.085 736.524C216.856 755.293 228.249 772.347 242.613 786.712C256.977 801.076 274.031 812.469 292.8 820.24C311.57 828.01 331.686 832.007 352 832Z"
        fill="#FBBC04"
      />
      <path
        d="M716.032 832H565.325C545.013 832.003 524.899 828.005 506.133 820.232C487.367 812.46 470.316 801.067 455.954 786.703C441.593 772.339 430.202 755.286 422.433 736.518C414.664 717.751 410.668 697.637 410.675 677.325V474.675C410.668 454.363 414.664 434.249 422.433 415.482C430.202 396.714 441.593 379.661 455.954 365.297C470.316 350.933 487.367 339.54 506.133 331.768C524.899 323.995 545.013 319.997 565.325 320C585.639 319.993 605.755 323.989 624.524 331.76C643.294 339.531 660.347 350.924 674.712 365.288C689.076 379.653 700.469 396.706 708.24 415.476C716.011 434.245 720.007 454.361 720 474.675V828.058C720 829.103 719.585 830.106 718.845 830.845C718.106 831.585 717.103 832 716.058 832H716.032Z"
        fill="#34A853"
      />
      <path
        d="M720 828.058V474.675C719.997 441.097 709.068 408.432 688.863 381.614C668.658 354.795 640.275 335.28 608 326.016V832H716.032C716.552 832.003 717.067 831.904 717.549 831.707C718.03 831.511 718.467 831.221 718.836 830.854C719.205 830.488 719.498 830.052 719.697 829.572C719.897 829.092 720 828.577 720 828.058Z"
        fill="#1967D2"
      />
      <path
        d="M506.675 680.32C506.68 649.633 497.554 619.639 480.458 594.155C463.363 568.671 439.071 548.851 410.675 537.216V680.32C410.675 724.352 429.107 764.109 458.675 792.269C473.858 777.845 485.944 760.481 494.196 741.234C502.449 721.987 506.695 701.261 506.675 680.32Z"
        fill="#EA4335"
      />
    </svg>
  );
}

/**
 * 2. Official Google Analytics 4 (GA4) Multi-Color Vector Logo
 */
export function GoogleAnalytics4Logo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2195.9 2430.9"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M2195.9,2126.7c0.9,166.9-133.7,302.8-300.5,303.7c-12.4,0.1-24.9-0.6-37.2-2.1c-154.8-22.9-268.2-156.6-264.4-314V316.1c-3.7-156.6,110-291.3,264.9-314c165.7-19.4,315.8,99.2,335.2,264.9c1.4,12.2,2.1,24.4,2,36.7L2195.9,2126.7z"
        fill="#F9AB00"
      />
      <path
        d="M301.1,1828.7c166.3,0,301.1,134.8,301.1,301.1c0,166.3-134.8,301.1-301.1,301.1C134.8,2430.9,0,2296.1,0,2129.8C0,1963.5,134.8,1828.7,301.1,1828.7z M1093.3,916.2c-167.1,9.2-296.7,149.3-292.8,316.6v808.7c0,219.5,96.6,352.7,238.1,381.1c163.3,33.1,322.4-72.4,355.5-235.7c4.1-20,6.1-40.3,6-60.7v-907.4c0.3-166.9-134.7-302.4-301.6-302.7C1096.8,916.1,1095,916.1,1093.3,916.2z"
        fill="#E37400"
      />
    </svg>
  );
}

/**
 * 3. Official Google Ads Multi-Color Vector Logo
 */
export function GoogleAdsLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M43.71 28.21L30.83 5.92a7.35 7.35 0 0 0-10.05-2.69 7.35 7.35 0 0 0-2.69 10.05l12.88 22.29a7.35 7.35 0 0 0 10.05 2.69 7.35 7.35 0 0 0 2.69-10.05z"
        fill="#4285F4"
      />
      <path
        d="M15.4 35.58a7.35 7.35 0 0 0 10.05 2.69l7.35-4.24-12.88-22.3-7.35 4.24a7.35 7.35 0 0 0-2.69 10.05l5.52 9.56z"
        fill="#FBBC04"
      />
      <circle cx="10.45" cy="35.58" r="7.35" fill="#34A853" />
    </svg>
  );
}

/**
 * 4. Official Supabase Vector Logo
 */
export function SupabaseLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 263"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="supaGrad1" x1="53.9738%" y1="54.974%" x2="94.1635%" y2="71.8295%">
          <stop offset="0%" stopColor="#249361" />
          <stop offset="100%" stopColor="#3ECF8E" />
        </linearGradient>
        <linearGradient id="supaGrad2" x1="36.1558%" y1="30.578%" x2="54.4844%" y2="65.0806%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M149.602 258.579c-6.718 8.46-20.338 3.824-20.5-6.977l-2.367-157.984h106.229c19.24 0 29.971 22.223 18.007 37.292l-101.369 127.669z"
        fill="url(#supaGrad1)"
      />
      <path
        d="M149.602 258.579c-6.718 8.46-20.338 3.824-20.5-6.977l-2.367-157.984h106.229c19.24 0 29.971 22.223 18.007 37.292l-101.369 127.669z"
        fill="url(#supaGrad2)"
      />
      <path
        d="M106.399 4.37c6.717-8.461 20.338-3.825 20.5 6.976l1.037 157.984H23.073c-19.241 0-29.973-22.223-18.008-37.292L106.399 4.37z"
        fill="#3ECF8E"
      />
    </svg>
  );
}

/**
 * 5. Official GitHub Octocat Vector Logo
 */
export function GitHubLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

/**
 * 6. Official Vercel Triangle Vector Logo
 */
export function VercelLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 222"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="m128 0 128 221.705H0z" />
    </svg>
  );
}

/**
 * 7. Official Google Gemini / AI Studio Sparkle Vector Logo
 */
export function GeminiAiStudioLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1C7DFF" />
          <stop offset="52%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>
      <path
        d="M128 8C128 74.274 74.274 128 8 128C74.274 128 128 181.726 128 248C128 181.726 181.726 128 248 128C181.726 128 128 74.274 128 8Z"
        fill="url(#geminiGrad)"
      />
    </svg>
  );
}

/**
 * 8. Official Cloudflare Multi-Color Vector Logo
 */
export function CloudflareLogo({ className = "size-6" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 116"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M174.355 98.486l3.47-12.012c.734-2.541.44-4.888-.831-6.647-1.198-1.662-3.202-2.64-5.647-2.762l-94.965-1.222c-.635-.024-1.173-.342-1.49-.88-.318-.537-.367-1.197-.147-1.808.44-1.222 1.613-2.053 2.933-2.102l95.845-1.222c7.553-.342 15.742-6.477 18.577-13.98l8.116-21.217c.342-.88.513-1.833.513-2.786 0-.953-.171-1.907-.513-2.787C192.418 11.799 173.475 0 151.964 0c-19.652 0-36.665 11.408-44.365 28.012-4.448-3.324-10.144-5.084-16.255-4.448-10.681 1.075-19.286 9.68-20.361 20.361-.294 2.86-.025 5.647.733 8.238C55.901 52.651 43.24 65.581 43.24 81.567c0 1.49.122 2.958.342 4.375.196 1.247 1.271 2.176 2.542 2.176h125.03c1.491 0 2.811-.978 3.201-2.419v12.787z"
        fill="#F38020"
      />
      <path
        d="M204.664 50.842c-.709 0-1.418.024-2.127.073-.562.049-1.051.416-1.246.953l-4.889 16.964c-.733 2.542-.44 4.888.831 6.648 1.198 1.662 3.202 2.64 5.646 2.762l17.453 1.051c.611.024 1.149.342 1.467.88.317.538.366 1.198.146 1.809-.44 1.222-1.613 2.053-2.933 2.102l-18.186 1.051c-7.578.367-15.742 6.477-18.577 13.981l-2.053 5.377c-.391 1.027.366 2.127 1.466 2.127h49.816c1.296 0 2.42-.831 2.811-2.078 1.638-5.23 2.542-10.78 2.542-16.548 0-20.533-16.646-37.152-37.169-37.152z"
        fill="#FAAD3F"
      />
    </svg>
  );
}

/**
 * ★ Bespoke VORDER Organic Ads Icon (`أيقونة أورجانيك آدز الرسمية`)
 * Combines an emerald organic growth leaf, a golden SERP rising rocket trajectory, and an AI sparkle star.
 */
export function VorderOrganicAdsIcon({ className = "size-5" }: BrandLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vorderOrgBg" x1="0" y1="0" x2="256" y2="256" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#18181B" />
          <stop offset="55%" stopColor="#271219" />
          <stop offset="100%" stopColor="#97233A" />
        </linearGradient>
        <linearGradient id="vorderOrgLeaf" x1="48" y1="200" x2="176" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id="vorderOrgArrow" x1="88" y1="192" x2="208" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#FEF08A" />
        </linearGradient>
        <linearGradient id="vorderOrgRing" x1="40" y1="40" x2="216" y2="216" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#97233A" />
        </linearGradient>
      </defs>
      <rect x="12" y="12" width="232" height="232" rx="56" fill="url(#vorderOrgBg)" stroke="url(#vorderOrgRing)" strokeWidth="8" />
      <circle cx="128" cy="128" r="78" stroke="#FFFFFF" strokeOpacity="0.1" strokeWidth="3" strokeDasharray="8 8" />
      <path d="M56 188C56 122 102 72 172 68C168 138 124 188 56 188Z" fill="url(#vorderOrgLeaf)" fillOpacity="0.95" />
      <path d="M64 180C98 156 126 124 162 76" stroke="#ECFDF5" strokeWidth="7" strokeLinecap="round" strokeOpacity="0.75" />
      <path d="M72 192L132 132L156 156L204 80" stroke="url(#vorderOrgArrow)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M166 76H206V116" stroke="url(#vorderOrgArrow)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M84 48L91 66L109 73L91 80L84 98L77 80L59 73L77 66L84 48Z" fill="#FBBF24" />
      <circle cx="196" cy="188" r="14" fill="#10B981" />
    </svg>
  );
}

/**
 * Universal Platform Brand Logo Resolver
 */
export function PlatformBrandLogo({
  platform,
  className = "size-6",
}: {
  platform:
    | "gsc"
    | "ga4"
    | "google_ads"
    | "supabase"
    | "github"
    | "vercel"
    | "gemini"
    | "cloudflare"
    | "organic_ads"
    | string;
  className?: string;
}) {
  switch (platform) {
    case "gsc":
    case "google_search_console":
      return <GoogleSearchConsoleLogo className={className} />;
    case "ga4":
    case "google_analytics":
      return <GoogleAnalytics4Logo className={className} />;
    case "google_ads":
    case "ads":
      return <GoogleAdsLogo className={className} />;
    case "supabase":
      return <SupabaseLogo className={className} />;
    case "github":
      return <GitHubLogo className={className} />;
    case "vercel":
      return <VercelLogo className={className} />;
    case "gemini":
    case "google_ai_studio":
      return <GeminiAiStudioLogo className={className} />;
    case "cloudflare":
      return <CloudflareLogo className={className} />;
    case "organic_ads":
      return <VorderOrganicAdsIcon className={className} />;
    default:
      return <GeminiAiStudioLogo className={className} />;
  }
}
