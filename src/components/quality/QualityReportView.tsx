"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Download, Eye, Search, TrendingUp, AlertTriangle, BadgeCheck, X } from "lucide-react";
import toast from "react-hot-toast";
import { C, Panel, Metric, Grid, Table, Tag, Bar, Btn, IconBtn, scrollArea, LineChart } from "@/components/production/ui";
import { QC_REPORTS, QC_DATASETS, QC_DIMS, gradeOf, reportStats, type QcReport } from "./qcData";

const FIELD_STYLE: React.CSSProperties = {
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  color: C.text,
  background: "#fff",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
};

export default function QualityReportView() {
  const router = useRouter();
  const stats = reportStats();

  const [kw, setKw] = useState("");
  const [ds, setDs] = useState("all");
  const [batch, setBatch] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [grade, setGrade] = useState("all");

  const batches = Array.from(new Set(QC_REPORTS.map((r) => r.batch))).sort();

  const list = QC_REPORTS.filter((r) => {
    if (ds !== "all" && r.dataset !== ds) return false;
    if (batch !== "all" && r.batch !== batch) return false;
    if (grade !== "all" && gradeOf(r.score).label !== grade) return false;
    const day = r.time.slice(0, 10);
    if (from && day < from) return false;
    if (to && day > to) return false;
    if (kw && !(r.name + r.id + r.dataset).toLowerCase().includes(kw.toLowerCase())) return false;
    return true;
  });

  const exportCsv = (r: QcReport) => {
    const head = ["报告编号", "报告名称", "数据集", "批次", "产线", "检测时间", "总分", ...QC_DIMS.map((d) => d.label + "得分"), "样本总数", "问题样本", "严重", "一般", "提示", "状态"];
    const row = [
      r.id,
      r.name,
      r.dataset,
      r.batch,
      r.pipeline,
      r.time,
      r.score,
      ...QC_DIMS.map((d) => r.dims[d.key]),
      r.total,
      r.bad,
      r.critical,
      r.major,
      r.minor,
      r.status === "published" ? "已随数据集发布" : "未发布",
    ];
    const csv = "\uFEFF" + [head, row].map((a) => a.map((v) => `"${v}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`已导出 ${r.id}.csv`);
  };

  const avgTrend = QC_DIMS.length
    ? QC_REPORTS.slice(0, 8)
        .map((r) => r.score)
        .reverse()
    : [];

  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        <Metric icon={<FileText size={15} />} label="质检报告" value={stats.total} unit="份" tone={C.primary} hint={`覆盖 ${new Set(QC_REPORTS.map((r) => r.dataset)).size} 个数据集`} />
        <Metric icon={<TrendingUp size={15} />} label="平均质量分" value={stats.avg} unit="分" tone={C.teal} hint={`近 8 批次 ${avgTrend[0]} → ${avgTrend[avgTrend.length - 1]}`} />
        <Metric icon={<AlertTriangle size={15} />} label="问题样本（累计）" value={stats.abnormal.toLocaleString()} unit="条" tone={C.warn} hint={`${stats.unqualified} 份报告低于 85 分`} />
        <Metric icon={<BadgeCheck size={15} />} label="已随数据集发布" value={stats.published} unit="份" tone={C.success} hint="质量分随数据集对外可见" />
      </Grid>

      {/* 筛选 */}
      <Panel style={{ marginTop: 12 }} bodyStyle={{ padding: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", width: 220 }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: 9, color: C.faint }} />
            <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="报告名称 / 编号" style={{ ...FIELD_STYLE, width: "100%", paddingLeft: 28 }} />
          </div>

          <select value={ds} onChange={(e) => setDs(e.target.value)} style={{ ...FIELD_STYLE, width: 170 }}>
            <option value="all">全部数据集</option>
            {QC_DATASETS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select value={batch} onChange={(e) => setBatch(e.target.value)} style={{ ...FIELD_STYLE, width: 130 }}>
            <option value="all">全部批次</option>
            {batches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select value={grade} onChange={(e) => setGrade(e.target.value)} style={{ ...FIELD_STYLE, width: 110 }}>
            <option value="all">全部等级</option>
            {["优秀", "良好", "合格", "不合格"].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 12, color: C.faint }}>检测时间</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={{ ...FIELD_STYLE, width: 132 }} />
            <span style={{ fontSize: 12, color: C.faint }}>至</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={{ ...FIELD_STYLE, width: 132 }} />
          </div>

          {(kw || ds !== "all" || batch !== "all" || grade !== "all" || from || to) && (
            <Btn
              size="sm"
              tone="plain"
              icon={<X size={12} />}
              onClick={() => {
                setKw("");
                setDs("all");
                setBatch("all");
                setGrade("all");
                setFrom("");
                setTo("");
              }}
            >
              清空
            </Btn>
          )}

          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: C.faint }}>共 {list.length} 份</span>
        </div>
      </Panel>

      {/* 列表 */}
      <Panel style={{ marginTop: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          head={["报告", "数据集", "批次", "检测时间", "总分", "等级", "问题样本", "状态", "操作"]}
          widths={["26%", "17%", "11%", "11%", "13%", "7%", "9%", "11%", "auto"]}
          onRowClick={(i) => router.push(`/quality/report/${list[i].id}`)}
          rows={list.map((r) => {
            const g = gradeOf(r.score);
            return [
              <div key="n">
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                  {r.id} · {r.pipeline}
                </div>
              </div>,
              <div key="d">
                <div style={{ fontSize: 12, color: C.text }}>{r.dataset}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{r.datasetVersion}</div>
              </div>,
              <code key="b" style={{ fontSize: 12, color: C.sub }}>{r.batch}</code>,
              <span key="t" style={{ fontSize: 12, color: C.sub }}>{r.time}</span>,
              <div key="s" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: g.tone, width: 38 }}>{r.score}</span>
                <div style={{ flex: 1, minWidth: 40 }}>
                  <Bar pct={r.score} tone={g.tone} h={5} />
                </div>
              </div>,
              <Tag key="g" tone={g.tone} soft={g.soft}>{g.label}</Tag>,
              <div key="b2">
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{r.bad}</div>
                <div style={{ fontSize: 10, color: C.faint, marginTop: 1 }}>
                  严重 {r.critical} · 一般 {r.major}
                </div>
              </div>,
              <Tag key="st" tone={r.status === "published" ? C.success : C.faint} soft={r.status === "published" ? C.successSoft : C.bg}>
                {r.status === "published" ? "已发布" : "未发布"}
              </Tag>,
              <div key="a" style={{ display: "flex", gap: 4 }}>
                <IconBtn icon={<Eye size={13} />} label="查看报告" tone="primary" onClick={() => router.push(`/quality/report/${r.id}`)} />
                <IconBtn icon={<Download size={13} />} label="导出 CSV" tone="ghost" onClick={() => exportCsv(r)} />
              </div>,
            ];
          })}
        />
      </Panel>

      {/* 趋势 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: 12, marginTop: 12 }}>
        <Panel title="质量分趋势对比" desc="近 8 批次总体质量分，按最新在前">
          <LineChart
            height={200}
            labels={QC_REPORTS.slice(0, 8).map((r) => r.batch + " / " + r.time.slice(5, 10))}
            series={[
              {
                name: "总体质量分",
                color: C.primary,
                data: QC_REPORTS.slice(0, 8).map((r) => r.score).reverse(),
              },
            ]}
            yUnit="分"
          />
        </Panel>

        <Panel title="六维平均得分" desc="全部报告按维度取平均">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {QC_DIMS.map((d) => {
              const v = Math.round((QC_REPORTS.reduce((s, r) => s + r.dims[d.key], 0) / QC_REPORTS.length) * 10) / 10;
              return (
                <div key={d.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.text }}>{d.label}</span>
                    <span style={{ color: v >= 90 ? C.success : v >= 85 ? "#2563eb" : C.danger, fontWeight: 600 }}>{v}</span>
                  </div>
                  <Bar pct={v} tone={d.tone} h={6} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}
