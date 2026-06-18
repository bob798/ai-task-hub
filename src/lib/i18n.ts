export type Locale = "zh" | "en";

export const translations = {
  zh: {
    nav: { home: "首页", imageCreate: "图片创作", codeCreate: "代码创作", smartDoc: "智能文档", pricing: "定价", myWorks: "我的作品", login: "登录", logout: "退出登录", wallet: "我的钱包" },
    hero: { badge: "图片 · 代码 · 文档 — 你的 AI 创作工作台", title1: "AI 驱动的", title2: "创作工作台", subtitle: "描述你的想法，AI 即刻创作。从灵感到作品，只需几秒。", cta: "开始创作", pricing: "查看定价" },
    common: { loading: "加载中...", error: "出错了", retry: "重试", balance: "余额", cost: "费用", topup: "充值" },
  },
  en: {
    nav: { home: "Home", imageCreate: "Image", codeCreate: "Code", smartDoc: "Document", pricing: "Pricing", myWorks: "My Works", login: "Login", logout: "Logout", wallet: "Wallet" },
    hero: { badge: "Image · Code · Document — Your AI Creative Studio", title1: "AI-Powered", title2: "Creative Studio", subtitle: "Describe your idea, AI creates instantly. From inspiration to creation in seconds.", cta: "Start Creating", pricing: "View Pricing" },
    common: { loading: "Loading...", error: "Something went wrong", retry: "Retry", balance: "Balance", cost: "Cost", topup: "Top Up" },
  },
} as const;

export function getLocale(): Locale {
  if (typeof window === "undefined") return "zh";
  return (localStorage.getItem("locale") as Locale) || "zh";
}

export function setLocale(locale: Locale) {
  localStorage.setItem("locale", locale);
  window.location.reload();
}

export function t(locale: Locale, path: string): string {
  const keys = path.split(".");
  let obj: unknown = translations[locale];
  for (const key of keys) {
    if (obj && typeof obj === "object") obj = (obj as Record<string, unknown>)[key];
    else return path;
  }
  return typeof obj === "string" ? obj : path;
}
