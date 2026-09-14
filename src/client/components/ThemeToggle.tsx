import * as React from "react";
import { useThemePreference } from "@/client/lib/theme";

/**
 * ThemeToggle — capsule button to switch between Light ☀️ and Dark 🌙.
 * Mirrors the style of LanguageToggle so they sit side-by-side in the header.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { themePreference, setThemePreference } = useThemePreference();

  // Resolve the *effective* mode (what the user sees right now)
  const isDark =
    themePreference === "dark" ||
    (themePreference === "system" &&
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-color-scheme: light)").matches);

  const toggle = () => setThemePreference(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to Light mode" : "Switch to Dark mode"}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1C1C1E] px-3 py-1 text-xs font-semibold text-zinc-300 hover:bg-[#2C2C2E] hover:text-white transition-all shadow-sm ${className}`}
      style={
        !isDark
          ? { borderColor: "rgba(0,0,0,0.12)", background: "#F5F5F7", color: "#1D1D1F" }
          : {}
      }
    >
      <span>{isDark ? "☀️" : "🌙"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
