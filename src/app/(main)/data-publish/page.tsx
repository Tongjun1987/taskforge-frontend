"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderTree, Download, Layers, Search, RotateCcw,
  FileCheck2, GitBranch, GitCommitVertical, ArrowRight, Package,
} from "lucide-react";

import { C, Panel, Metric, Table, Tag, Btn, IconBtn } from "@/components/production/ui";
import { DATASETS, INDUSTRIES, DATA_TYPES, LEVEL_TONE } from "@/components/publish/publishData";

const STATUS_TONE: Record<string, string> = {
  已发布: C.success,
  审核中: C.warn,
  已下线: C.faint,
};

const scoreTone = (s: number) =>
  s >= 93 ? C.success : s >= 88 ? C.info : s >= 84 ? C.warn : C.danger;

function Sel({
  label, value, onChange, options, w = 128,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  w?: number;
}) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: w, padding: "6px 8px", fontSize: 12, color: C.text,
          background: "#fff", border: `1px solid ${C.border}`, borderRadius: 6, outline: "none",
        }}
      >
        <option value="">全部</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function CatalogBody() {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [dataType, setDataType] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [kw, setKw] = useState("");
  const [refreshed, setRefreshed] = useState(false);

  const rows = useMemo(
    () =>
      DATASETS.filter(
        (d) =>
          (!domain || d.domain === domain) &&
          (!dataType || d.dataType === dataType) &&
          (!level || d.level === level) &&
          (!status || d.status === status) &&
          (!kw ||
            d.name.includes(kw) ||
            d.scene.includes(kw) ||
            d.tags.some((t) => t.includes(kw)))
      ),
    [domain, dataType, level, status, kw]
  );

  const published = DATASETS.filter((d) => d.status === "已发布").length;
  const totalDownloads = DATASETS.reduce((s, d) => s + d.downloads, 0);
  const avgScore = (
    DATASETS.reduce((s, d) => s + d.quality.score, 0) / DATASETS.length
  ).toFixed(1);

  const reset = () => {
    setDomain(""); setDataType(""); setLevel(""); setStatus(""); setKw("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <header
        style={{
          height: 56, background: "#fff", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #10b981, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <FolderTree size={17} style={{ color: "#fff" }} />
          </span>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.25 }}>数据集管理</h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              数据发布中心 · 数据集登记与分类管理 · 质量报告 / 血缘 / 版本 / 权限随数据集维护
            </p>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <Link
          href="/data-publish/templates"
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            fontSize: 13, color: C.text, background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 6, flexShrink: 0,
          }}
        >
          <Package size={14} /> 封装模板
        </Link>
        <button
          onClick={() => {
            setRefreshed(true);
            window.setTimeout(() => setRefreshed(false), 1500);
          }}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            fontSize: 13, color: "#1e293b", background: "#fff",
            border: "1px solid #e2e8f0", borderRadius: 6, cursor: "pointer", flexShrink: 0,
          }}
        >
          <RotateCcw size={14} />
          {refreshed ? "已刷新" : "刷新"}
        </button>
      </header>

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <Metric
            icon={<FolderTree size={15} />}
            label="数据集总数"
            value={DATASETS.length}
            unit="个"
            hint={`已发布 ${published} · 审核中 1 · 已下线 1`}
          />
          <Metric
            icon={<Layers size={15} />}
            label="覆盖业务领域"
            value={new Set(DATASETS.map((d) => d.domain)).size}
            unit="个"
            tone={C.purple}
            hint="按领域 / 类型 / 场景 / 等级多维编目"
          />
          <Metric
            icon={<FileCheck2 size={15} />}
            label="平均质量总分"
            value={avgScore}
            unit="分"
            tone={C.teal}
            hint="随数据集发布的正式质量报告"
          />
          <Metric
            icon={<Download size={15} />}
            label="累计下载"
            value={totalDownloads.toLocaleString()}
            unit="次"
            tone={C.info}
            hint="近 30 日 +682 次"
          />
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
            padding: "10px 14px", background: "#fff",
            border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 12,
          }}
        >
          <Sel label="业务领域" value={domain} onChange={setDomain} options={INDUSTRIES} w={120} />
          <Sel label="数据类型" value={dataType} onChange={setDataType} options={DATA_TYPES} w={100} />
          <Sel label="数据等级" value={level} onChange={setLevel} options={["公开", "内部", "受限", "核心"]} w={92} />
          <Sel label="发布状态" value={status} onChange={setStatus} options={["已发布", "审核中", "已下线"]} w={96} />
          <label
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "5px 10px",
              border: `1px solid ${C.border}`, borderRadius: 6, background: "#fff",
            }}
          >
            <Search size={13} style={{ color: C.faint }} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="关键词 / 标签 / 场景"
              style={{ border: "none", outline: "none", fontSize: 12, width: 150, color: C.text }}
            />
          </label>
          <div style={{ flex: 1 }} />
          <Btn size="sm" icon={<RotateCcw size={13} />} onClick={reset}>重置</Btn>
        </div>

        <Panel
          title="数据集清单"
          desc={`共 ${rows.length} 个数据集 · 点击行进入数据集详情，质量报告 / 血缘 / 版本 / 权限在详情内查看`}
          style={{ marginTop: 12 }}
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["数据集", "领域 / 类型", "场景", "等级", "规模", "版本", "质量", "状态", "子视图", "操作"]}
            widths={["25%", "12%", "10%", "7%", "13%", "7%", "8%", "8%", "6%", "4%"]}
            onRowClick={(i) => router.push(`/data-publish/dataset/${rows[i].id}`)}
            rowKey={(i) => rows[i].id}
            rows={rows.map((d) => [
              <div key="n">
                <div style={{ fontWeight: 500, fontSize: 13 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{d.id} · {d.owner}</div>
              </div>,
              <div key="dt">
                <div style={{ fontSize: 12 }}>{d.domain}</div>
                <div style={{ fontSize: 11, color: C.faint }}>{d.dataType}</div>
              </div>,
              <span key="s" style={{ fontSize: 12, color: C.sub }}>{d.scene}</span>,
              <Tag key="l" tone={LEVEL_TONE[d.level]}>{d.level}</Tag>,
              <span key="sc" style={{ fontSize: 12, color: C.sub }}>{d.scale}</span>,
              <span key="v" style={{ fontSize: 12 }}>{d.version}</span>,
              <span key="q" style={{ fontSize: 12.5, fontWeight: 600, color: scoreTone(d.quality.score) }}>
                {d.quality.score}
              </span>,
              <Tag key="st" tone={STATUS_TONE[d.status]}>{d.status}</Tag>,
              <div key="sub" style={{ display: "flex", gap: 4 }}>
                <Link href={`/data-publish/dataset/${d.id}?tab=quality`} onClick={(e) => e.stopPropagation()}>
                  <IconBtn icon={<FileCheck2 size={13} />} label="质量报告" size="sm" tone="success" />
                </Link>
                <Link href={`/data-publish/dataset/${d.id}?tab=lineage`} onClick={(e) => e.stopPropagation()}>
                  <IconBtn icon={<GitBranch size={13} />} label="数据血缘" size="sm" tone="purple" />
                </Link>
                <Link href={`/data-publish/dataset/${d.id}?tab=version`} onClick={(e) => e.stopPropagation()}>
                  <IconBtn icon={<GitCommitVertical size={13} />} label="版本管理" size="sm" tone="warn" />
                </Link>
              </div>,
              <Link key="a" href={`/data-publish/dataset/${d.id}`} onClick={(e) => e.stopPropagation()}>
                <IconBtn icon={<ArrowRight size={13} />} label="进入详情" size="sm" tone="primary" />
              </Link>,
            ])}
          />
        </Panel>
      </div>
    </div>
  );
}

export default function DataPublishPage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg }}>
          <p style={{ color: C.sub }}>加载中...</p>
        </div>
      }
    >
      <CatalogBody />
    </Suspense>
  );
}
