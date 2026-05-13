"use client";
import { TopNavBar, Sidebar } from "@/components/layout/TopNavBar";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      {/* 顶部三栏导航 */}
      <TopNavBar />
      {/* 主体区域：侧边栏 + 内容 */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* 左侧子菜单（按模块动态显示） */}
        <Sidebar />
        {/* 主内容 */}
        <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}
