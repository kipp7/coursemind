import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourseMind | 校园课程智能体 MVP",
  description: "A school-facing course agent platform MVP with cited RAG answers and teacher oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
