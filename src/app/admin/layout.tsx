import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "管理后台 — AI Task Hub",
  description: "AI Task Hub 管理后台，查看运营数据。",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
