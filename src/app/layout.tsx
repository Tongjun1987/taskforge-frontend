import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskForge — 任务驱动的行业 AI 数据·模型一体化平台",
  description: "先定场景，再定任务，最后定数据。构建高质量行业垂类 AI 数据集和模型。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <Toaster position="top-center" toastOptions={{ style: { fontSize: "14px" } }} />
      </body>
    </html>
  );
}
