import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片创作 — AI Task Hub",
};

export default function ImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
