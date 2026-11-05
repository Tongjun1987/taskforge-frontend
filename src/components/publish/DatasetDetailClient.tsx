"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft, FileCheck2, GitBranch, GitCommitVertical, Lock, FileJson,
} from "lucide-react";

import { C } from "@/components/production/ui";
import { datasetById, LEVEL_TONE, type Dataset } from "./publishData";
import {
  DatasetOverview, DatasetQualityTab, DatasetLineageTab,
  DatasetVersionTab, DatasetPermissionTab,
} from "./DatasetDetailTabs";

type TabKey = "overview" | "quality" | "lineage" | "version" | "permission";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "概览", icon: <FileJson size={14} /> },
  { key: "quality", label: "质量报告", icon: <FileCheck2 size={14} /> },
  { key: "lineage", label: "数据血缘", icon: <GitBranch size={14} /> },
  { key: "version", label: "版本管理", icon: <GitCommitVertical size={14} /> },
  { key: "permission", label: "权限管理", icon: <Lock size={14} /> },
];

const ALL_TABS = TABS.map((t) => t.key);

const STATUS_TONE: Record<string, string> = {
  已发布: C.success,
  审核中: C.warn,
  已下线: C.faint,
};

export default function DatasetDetailClient({ datasetId }: { datasetId: string }) {
  const ds: Dataset | undefined = datasetById(datasetId);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("tab");
    if (p && (ALL_TABS as string[]).includes(p)) setTab(p as TabKey);
  }, []);

  const changeTab = (k: TabKey) => {
    setTab(k);
    const url = new URL(window.location.href);
    if (k === "overview") url.searchParams.delete("tab");
    else url.searchParams.set("tab", k);
    window.history.replaceState(null, "", url.toString());
  };

  if (!ds) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: C.sub, fontSize: 13 }}>未找到该数据集</p>
          <Link href="/data-publish" style={{ fontSize: 12, color: C.primary }}>返回数据集管理</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      {/* 页头 */}
      <header
        style={{
          background: "#fff", borderBottom: `1px solid ${C.border}`,
          padding: "12px 20px 0", flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <Link
            href="/data-publish"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 30, height: 30, borderRadius: 7, border: `1px solid ${C.border}`,
              color: C.sub, flexShrink: 0, marginTop: 2,
            }}
            aria-label="返回数据集管理"
          >
            <ChevronLeft size={16} />
          </Link>

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: C.text, margin: 0, lineHeight: 1.3 }}>{ds.name}</h1>
              <span
                style={{
                  padding: "1px 7px", borderRadius: 4, fontSize: 11,
                  color: LEVEL_TONE[ds.level], background: `${LEVEL_TONE[ds.level]}14`,
                }}
              >
                {ds.level}
              </span>
              <span
                style={{
                  padding: "1px 7px", borderRadius: 4, fontSize: 11,
                  color: STATUS_TONE[ds.status], background: `${STATUS_TONE[ds.status]}14`,
                }}
              >
                {ds.status}
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: C.faint, margin: "3px 0 0" }}>
              数据发布中心 · 数据集管理 · {ds.id} · {ds.domain} / {ds.dataType} / {ds.scene} · {ds.owner}
            </p>
          </div>
        </div>

        {/* 关键指标条 */}
        <div style={{ display: "flex", gap: 28, margin: "12px 0 0 42px", flexWrap: "wrap" }}>
          {[
            { k: "当前版本", v: ds.version },
            { k: "数据规模", v: `${ds.scale} / ${ds.fileCount}` },
            { k: "质量总分", v: String(ds.quality.score) },
            { k: "元信息完整度", v: `${ds.meta.completeness}%` },
            { k: "版本数", v: `${ds.versions.length} 个` },
            { k: "累计下载", v: `${ds.downloads.toLocaleString()} 次` },
          ].map((x) => (
            <div key={x.k} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontSize: 11, color: C.faint }}>{x.k}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{x.v}</span>
            </div>
          ))}
        </div>

        {/* Tab 栏 */}
        <div style={{ display: "flex", gap: 4, marginTop: 12, marginLeft: 42 }}>
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => changeTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", fontSize: 12.5,
                  color: active ? C.primary : C.sub,
                  background: "none", border: "none",
                  borderBottom: `2px solid ${active ? C.primary : "transparent"}`,
                  cursor: "pointer", fontWeight: active ? 600 : 400,
                  marginBottom: -1,
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* 内容区 */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {tab === "overview" && <DatasetOverview ds={ds} />}
        {tab === "quality" && <DatasetQualityTab ds={ds} />}
        {tab === "lineage" && <DatasetLineageTab ds={ds} />}
        {tab === "version" && <DatasetVersionTab ds={ds} />}
        {tab === "permission" && <DatasetPermissionTab ds={ds} />}
      </div>
    </div>
  );
}
