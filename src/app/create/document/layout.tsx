import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "智能文档 — AI Task Hub",
  description: "AI 帮你提炼、翻译、分析文档",
};
export default function CreateDocumentLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
