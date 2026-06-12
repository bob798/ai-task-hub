export const LANGUAGES = [
  "TypeScript",
  "JavaScript",
  "Python",
  "Go",
  "Java",
  "Rust",
  "SQL",
  "Shell",
] as const;

export type CodeLanguage = (typeof LANGUAGES)[number];
