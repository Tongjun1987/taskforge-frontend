"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, RotateCcw } from "lucide-react";

import QualityRulesView from "@/components/quality/QualityRulesView";
import QualityDetectView from "@/components/quality/QualityDetectView";
import QualityReportView from "@/components/quality/QualityReportView";
import QualityTicketView from "@/components/quality/QualityTicketView";

type ViewKey = "rules" | "detect" | "report" | "ticket";

const ALL_VIEWS: ViewKey[] = ["rules", "detect", "report", "ticket"];

const VIEW_META: Record<ViewKey, { label: string; desc: string }> = {
  rules: { label: "质量规则配置", desc: "六维质量规则 · 表达式与阈值 · 按数据集与字段配置" },
  detect: { label: "智能质量检测", desc: "统计分布 · 深度学习噪声 · 语义一致性 · 图像质量" },
  report: { label: "质量检测报告", desc: "总分与六维得分 · 问题分布 · 趋势对比 · 随数据集发布" },
  ticket: { label: "质量问题工单", desc: "自动开单 · 分派 · 处理反馈 · 复检验证闭环" },
};

function QualityCenter() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const resolve = (p: string | null): ViewKey =>
    p && (ALL_VIEWS as string[]).includes(p) ? (p as ViewKey) : "rules";

  const [view, setView] = useState<ViewKey>(() => resolve(viewParam));
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    const next = resolve(viewParam);
    setView((cur) => (cur === next ? cur : next));
  }, [viewParam]);

  const meta = VIEW_META[view];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
      <header
        style={{
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={17} style={{ color: "#fff" }} />
          </span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.25 }}>{meta.label}</h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>数据生产中心 · 数据质检管理 · {meta.desc}</p>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => {
            setRefreshed(true);
            window.setTimeout(() => setRefreshed(false), 1500);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            fontSize: 13,
            color: "#1e293b",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <RotateCcw size={14} />
          {refreshed ? "已刷新" : "刷新"}
        </button>
      </header>

      <div style={{ display: view === "rules" ? "flex" : "none", flex: 1, minHeight: 0, flexDirection: "column" }}>
        <QualityRulesView />
      </div>
      <div style={{ display: view === "detect" ? "flex" : "none", flex: 1, minHeight: 0, flexDirection: "column" }}>
        <QualityDetectView />
      </div>
      <div style={{ display: view === "report" ? "flex" : "none", flex: 1, minHeight: 0, flexDirection: "column" }}>
        <QualityReportView />
      </div>
      <div style={{ display: view === "ticket" ? "flex" : "none", flex: 1, minHeight: 0, flexDirection: "column" }}>
        <QualityTicketView />
      </div>
    </div>
  );
}

export default function QualityPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
          <p style={{ color: "#64748b" }}>加载中...</p>
        </div>
      }
    >
      <QualityCenter />
    </Suspense>
  );
}
