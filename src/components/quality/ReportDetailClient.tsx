"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FilePlus2,
  BadgeCheck,
  AlertTriangle,
  Layers,
  TrendingUp,
  Database,
  GitCompare,
} from "lucide-react";
import toast from "react-hot-toast";
import { C, Panel, Metric, Grid, Table, Tag, Bar, Btn, IconBtn, scrollArea, LineChart, Kv, Donut } from "@/components/production/ui";
import {
  QC_DIMS,
  QC_DIM_MAP,
  QC_REPORTS,
  REPORT_MAP,
  gradeOf,
  issuesOf,
  issueDist,
  QC_LEVEL_META,
  type QcDim,
} from "./qcData";

export default function ReportDetailClient({ reportId }: { reportId: string }) {
  const router = useRouter();
  const rep = REPORT_MAP[reportId];
  const [distTab, setDistTab] = useState<"field" | "dim">("field");

  if (!rep) {
    return (
      <div style={{ ...scrollArea, textAlign: "center", paddingTop: 80, color: C.sub }}>
        <div style={{ fontSize: 15, marginBottom: 12 }}>未找到该质检报告：{reportId}</div>
        <Btn tone="primary" onClick={() => router.push("/quality?view=report")}>返回报告列表</Btn>
      </div>
    );
  }

  const g = gradeOf(rep.score);
  const issues = issuesOf(reportId);
  const dist = issueDist(reportId);
  const distList: { label: string; value: number; tone: string }[] =
    distTab === "field"
      ? dist.field.map((f) => ({ ...f, tone: C.primary }))
      : dist.dim.map((f) => ({ ...f, tone: f.tone }));
  const distMax = Math.max(...distList.map((x) => x.value), 1);

  // 趋势必须按检测时间升序：之前直接用数组顺序，会出现 10-15 → 10-19 → 10-11 的错乱
  const series = QC_REPORTS.filter((r) => r.dataset === rep.dataset)
    .slice()
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(-8);
  const selfIdx = series.findIndex((r) => r.id === rep.id);
  const trendLabels = series.map((r) => r.time.slice(5, 10));
  const trendData = series.map((r) => r.score);
  const prevScore = selfIdx > 0 ? series[selfIdx - 1].score : null;
  const delta = prevScore === null ? 0 : rep.score - prevScore;

  const exportCsv = () => {
    const head = ["样本编号", "字段", "命中规则", "维度", "实际值", "期望值", "级别", "建议处理"];
    const rows = issues.map((i) => [
      i.sampleId,
      i.field,
      `${i.ruleId} ${i.ruleName}`,
      QC_DIM_MAP[i.dim].label,
      i.actual,
      i.expect,
      QC_LEVEL_META[i.level].label,
      i.advice,
    ]);
    const csv = "\uFEFF" + [head, ...rows].map((a) => a.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${rep.id}-明细.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("明细已导出");
  };

  return (
    <div style={scrollArea}>
      {/* 页头 */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <IconBtn icon={<ArrowLeft size={14} />} label="返回报告列表" onClick={() => router.push("/quality?view=report")} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>{rep.name}</h1>
            <Tag tone={g.tone} soft={g.soft}>{g.label}</Tag>
            {rep.status === "published" && (
              <Tag tone={C.success} soft={C.successSoft}>
                <BadgeCheck size={11} /> 已随数据集发布
              </Tag>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.faint, marginTop: 4 }}>
            {rep.id} · {rep.dataset} {rep.datasetVersion} · 批次 {rep.batch} · {rep.pipeline} · 检测于 {rep.time}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn icon={<Download size={13} />} onClick={exportCsv}>导出明细</Btn>
          <Btn
            tone="primary"
            icon={<FilePlus2 size={13} />}
            onClick={() => {
              toast.success("已按严重级别生成 3 张问题工单");
              router.push("/quality?view=ticket");
            }}
          >
            生成问题工单
          </Btn>
        </div>
      </div>

      {/* 总分 + 六维 */}
      <Grid cols="minmax(0,0.95fr) minmax(0,2.05fr)" gap={12}>
        <Panel title="总体质量评分" desc="六维加权后归一至 100 分">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Donut
              size={128}
              thickness={13}
              centerValue={String(rep.score)}
              centerLabel="总分"
              data={[
                { label: "得分", value: rep.score, color: g.tone },
                { label: "扣分", value: 100 - rep.score, color: C.borderSoft },
              ]}
            />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: C.faint }}>质量等级</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: g.tone }}>{g.label}</div>
              </div>
              <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6 }}>
                样本 {rep.total.toLocaleString()} 条 · 问题 {rep.bad} 条 · 不良率 {((rep.bad / rep.total) * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.borderSoft}`, marginTop: 14, paddingTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
            {QC_DIMS.map((d) => {
              const v = rep.dims[d.key];
              return (
                <div key={d.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.sub }}>{d.label}</span>
                    <span style={{ fontWeight: 600, color: v >= 90 ? C.success : v >= 85 ? "#b45309" : C.danger }}>{v}</span>
                  </div>
                  <Bar pct={v} tone={d.tone} h={5} />
                </div>
              );
            })}
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Grid cols={4} gap={10}>
            <Metric icon={<Layers size={14} />} label="样本总数" value={rep.total.toLocaleString()} unit="条" tone={C.primary} />
            <Metric icon={<AlertTriangle size={14} />} label="严重问题" value={rep.critical} unit="条" tone={C.danger} hint="阻断下游发布" />
            <Metric icon={<AlertTriangle size={14} />} label="一般问题" value={rep.major} unit="条" tone={C.warn} hint="需处理后放行" />
            <Metric icon={<AlertTriangle size={14} />} label="提示项" value={rep.minor} unit="条" tone={C.info} hint="仅记录" />
          </Grid>

          <Panel
            title="问题分布"
            desc="按命中字段 / 质量维度查看问题集中位置"
            extra={
              <div style={{ display: "inline-flex", padding: 2, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6 }}>
                {[
                  { k: "field" as const, label: "按字段" },
                  { k: "dim" as const, label: "按维度" },
                ].map((t) => (
                  <button
                    key={t.k}
                    onClick={() => setDistTab(t.k)}
                    style={{
                      padding: "4px 10px",
                      fontSize: 12,
                      border: "none",
                      borderRadius: 4,
                      cursor: "pointer",
                      background: distTab === t.k ? "#fff" : "transparent",
                      color: distTab === t.k ? C.primary : C.sub,
                      fontWeight: distTab === t.k ? 600 : 400,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 18 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {distList.slice(0, 6).map((d) => (
                  <div key={d.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <code style={{ color: C.text, fontSize: 12 }}>{d.label}</code>
                      <span style={{ color: C.sub }}>{d.value} 条</span>
                    </div>
                    <Bar pct={(d.value / distMax) * 100} tone={d.tone} h={5} />
                  </div>
                ))}
              </div>

              <div style={{ borderLeft: `1px solid ${C.borderSoft}`, paddingLeft: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 8 }}>异常样本级别构成</div>
                <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", marginBottom: 10 }}>
                  {[
                    { v: rep.critical, tone: C.danger },
                    { v: rep.major, tone: C.warn },
                    { v: rep.minor, tone: C.info },
                  ].map((s, i) => (
                    <div key={i} style={{ width: `${(s.v / rep.bad) * 100}%`, background: s.tone }} />
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  {[
                    { label: "严重", v: rep.critical, tone: C.danger },
                    { label: "一般", v: rep.major, tone: C.warn },
                    { label: "提示", v: rep.minor, tone: C.info },
                  ].map((s) => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.tone }} />
                      <span style={{ color: C.sub, flex: 1 }}>{s.label}</span>
                      <span style={{ color: C.text, fontWeight: 600 }}>{s.v}</span>
                      <span style={{ color: C.faint, width: 46, textAlign: "right" }}>{((s.v / rep.bad) * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: `1px solid ${C.borderSoft}`, marginTop: 12, paddingTop: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>数据集绑定</div>
                  <Kv k="数据集" v={`${rep.dataset} ${rep.datasetVersion}`} w={56} />
                  <Kv k="质量分" v={<Tag tone={g.tone} soft={g.soft}>{rep.score} 分 · {g.label}</Tag>} w={56} />
                  <Kv
                    k="对外可见"
                    v={rep.status === "published" ? <span style={{ color: C.success }}>已随数据集版本发布</span> : <span style={{ color: C.faint }}>未发布，仅内部可见</span>}
                    w={56}
                  />
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </Grid>

      {/* 趋势 */}
      <Panel
        title="质量趋势对比"
        desc={`${rep.dataset} 近 ${series.length} 批次总体质量分走势`}
        style={{ marginTop: 12 }}
        extra={
          <span style={{ fontSize: 12, color: C.faint, display: "flex", alignItems: "center", gap: 5 }}>
            {prevScore === null ? (
              <>该数据集首个质检批次</>
            ) : (
              <>
                <TrendingUp size={13} style={{ color: delta >= 0 ? C.success : C.danger, transform: delta >= 0 ? undefined : "scaleY(-1)" }} />
                较上批次 {delta >= 0 ? "+" : ""}
                {delta.toFixed(1)} 分
                <span style={{ color: C.faint, marginLeft: 4 }}>（{prevScore.toFixed(1)} → {rep.score.toFixed(1)}）</span>
              </>
            )}
          </span>
        }
      >
        <LineChart height={190} labels={trendLabels} series={[{ name: "总体质量分", color: C.primary, data: trendData }]} yUnit="分" />
      </Panel>

      {/* 明细 */}
      <Panel
        title="问题样本明细"
        desc={`命中规则后抽取的代表性样本（共 ${rep.bad} 条，展示前 ${issues.length} 条）`}
        style={{ marginTop: 12 }}
        extra={
          <div style={{ display: "flex", gap: 6 }}>
            <Tag tone={C.danger} soft={C.dangerSoft}>严重 {rep.critical}</Tag>
            <Tag tone="#b45309" soft={C.warnSoft}>一般 {rep.major}</Tag>
            <Tag tone={C.info} soft={C.infoSoft}>提示 {rep.minor}</Tag>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["样本编号", "字段", "命中规则", "维度", "实际值", "期望值", "级别", "建议处理"]}
          widths={["15%", "10%", "17%", "8%", "15%", "15%", "7%", "auto"]}
          rows={issues.map((i) => [
            <code key="s" style={{ fontSize: 11, color: C.text }}>{i.sampleId}</code>,
            <code key="f" style={{ fontSize: 11, color: "#4338ca" }}>{i.field}</code>,
            <div key="r">
              <div style={{ fontSize: 12, color: C.text }}>{i.ruleName}</div>
              <div style={{ fontSize: 10, color: C.faint }}>{i.ruleId}</div>
            </div>,
            <Tag key="d" tone={QC_DIM_MAP[i.dim].tone} soft={QC_DIM_MAP[i.dim].soft}>{QC_DIM_MAP[i.dim].label}</Tag>,
            <code key="a" style={{ fontSize: 11, color: C.danger }}>{i.actual}</code>,
            <span key="e" style={{ fontSize: 11, color: C.sub }}>{i.expect}</span>,
            <Tag key="l" tone={QC_LEVEL_META[i.level].tone} soft={QC_LEVEL_META[i.level].soft}>{QC_LEVEL_META[i.level].label}</Tag>,
            <span key="ad" style={{ fontSize: 11, color: C.sub, lineHeight: 1.5 }}>{i.advice}</span>,
          ])}
        />
      </Panel>

      <div style={{ fontSize: 11, color: C.faint, marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
        <GitCompare size={12} /> 报告口径：六维得分按规则权重加权归一至 100 分；问题样本按命中级别统计，严重项自动阻断数据集发布。
        <span style={{ flex: 1 }} />
        <Database size={12} /> 关联数据集：{rep.dataset} {rep.datasetVersion}
      </div>
    </div>
  );
}
