import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "我的作品 — AI Task Hub",
  description: "查看你创作的所有作品",
};
export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
