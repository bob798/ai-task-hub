export const DOC_MODES = [
  { key: "summarize", label: "总结摘要" },
  { key: "translate-zh", label: "翻译成中文" },
  { key: "translate-en", label: "翻译成英文" },
  { key: "analyze", label: "要点分析" },
] as const;

export type DocMode = (typeof DOC_MODES)[number]["key"];

export const DOC_MAX_LENGTH = 8000;
