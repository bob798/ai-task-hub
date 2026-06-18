"use client";

import { type Locale, setLocale } from "@/lib/i18n";

export default function LocaleSwitcher({ locale }: { locale: Locale }) {
  const next: Locale = locale === "zh" ? "en" : "zh";
  return (
    <button
      onClick={() => setLocale(next)}
      className="px-2.5 py-1 rounded-md text-xs font-medium border transition-colors hover:opacity-80"
      style={{ borderColor: "var(--border)", color: "var(--muted)" }}
      title={next === "en" ? "Switch to English" : "切换为中文"}
    >
      {locale === "zh" ? "EN" : "中"}
    </button>
  );
}
