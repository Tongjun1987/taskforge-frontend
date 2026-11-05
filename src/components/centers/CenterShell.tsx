"use client";

import React from "react";
import { C } from "@/components/production/ui";

// ============================================================
// 中心页通用外壳：页头（图标 + 标题 + 副标题 + 右侧操作）
// 供算力管理 / 运营管理 / 系统运行三个中心复用，保持与既有模块同风格
// ============================================================
export function CenterHead({
  icon,
  title,
  sub,
  color = C.primary,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  color?: string;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        background: C.white,
        borderBottom: `1px solid ${C.border}`,
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: `${color}14`,
          color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{sub}</div>
      </div>
      {right && <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>{right}</div>}
    </div>
  );
}

// 页面主体滚动区
export function CenterBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        background: C.bg,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}
