"use client";

import React from "react";
import Link from "next/link";
import {
  Cpu, Brain, Rocket, Sparkles, ArrowRight, Database, FlaskConical,
  HardDrive, Activity, FileCheck2, TrendingUp, Target,
} from "lucide-react";
import ReactECharts from "echarts-for-react";

import { C, Panel, Metric, Tag, Bar, Grid } from "@/components/production/ui";
import { ExpHeader } from "@/components/model-exp/ui";
import { TRAIN_EXPS, FINETUNE_EXPS, INFER_EXPS, avg, finetuneGain } from "@/components/model-exp/expData";

// ── 近 7 日三类试验趋势 ──
const WEEKLY = [
  { date: "10/31", train: 3, finetune: 2, infer: 2 },
  { date: "11/01", train: 2, finetune: 1, infer: 3 },
  { date: "11/02", train: 4, finetune: 2, infer: 2 },
  { date: "11/03", train: 3, finetune: 3, infer: 4 },
  { date: "11/04", train: 5, finetune: 2, infer: 3 },
  { date: "11/05", train: 4, finetune: 4, infer: 5 },
  { date: "11/06", train: 6, finetune: 3, infer: 4 },
];

const trendOption = {
  backgroundColor: "transparent",
  grid: { top: 12, right: 12, bottom: 30, left: 44 },
  legend: { data: ["训练评估", "微调评估", "推理评估"], bottom: 0, textStyle: { color: "#64748b", fontSize: 11 }, itemWidth: 10, itemHeight: 8 },
  xAxis: {
    type: "category",
    data: WEEKLY.map((d) => d.date),
    axisLine: { lineStyle: { color: "#e2e8f0" } },
    axisLabel: { color: "#64748b", fontSize: 11 },
    axisTick: { show: false },
  },
  yAxis: {
    type: "value",
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: "#64748b", fontSize: 11 },
    splitLine: { lineStyle: { color: "#f1f5f9" } },
  },
  tooltip: {
    trigger: "axis",
    backgroundColor: "#1e293b",
    borderColor: "#334155",
    textStyle: { color: "#f8fafc", fontSize: 12 },
  },
  series: [
    { name: "训练评估", type: "bar", data: WEEKLY.map((d) => d.train), itemStyle: { color: "#4f46e5", borderRadius: [3, 3, 0, 0] }, barWidth: "20%" },
    { name: "微调评估", type: "bar", data: WEEKLY.map((d) => d.finetune), itemStyle: { color: "#8b5cf6", borderRadius: [3, 3, 0, 0] }, barWidth: "20%" },
    { name: "推理评估", type: "bar", data: WEEKLY.map((d) => d.infer), itemStyle: { color: "#14b8a6", borderRadius: [3, 3, 0, 0] }, barWidth: "20%" },
  ],
};

const MODULES = [
  { title: "模型仓库", desc: "训练与微调产物的版本管理、对比与发布", href: "/model-repo", icon: HardDrive, tone: C.info },
  { title: "模型训练评估", desc: "基于数据集的训练与效果评估，多组对照实验", href: "/model-training", icon: Brain, tone: C.primary },
  { title: "模型微调评估", desc: "大模型微调场景专项评估，验证数据配方", href: "/model-finetune", icon: Sparkles, tone: C.purple },
  { title: "模型推理评估", desc: "推理性能与鲁棒性边界测试", href: "/model-inference", icon: Rocket, tone: C.teal },
];

const LOOP = [
  { title: "数据集", desc: "来自数据发布中心", icon: Database, href: "/data-publish" },
  { title: "模型试验", desc: "训练 / 微调 / 推理评估", icon: FlaskConical, href: "/model-training" },
  { title: "评估结论", desc: "指标 + 报告 + 优化建议", icon: FileCheck2, href: "/model-training" },
  { title: "反哺数据生产", desc: "标注质量 / 数据分布 / 配比", icon: TrendingUp, href: "/quality" },
];

export default function DataPilotCenterPage() {
  const trainDone = TRAIN_EXPS.filter((e) => e.status === "已完成" && e.metrics.length > 0);
  const ftDone = FINETUNE_EXPS.filter((e) => e.status === "已完成");
  const inferDone = INFER_EXPS.filter((e) => e.status === "已完成");
  const total = TRAIN_EXPS.length + FINETUNE_EXPS.length + INFER_EXPS.length;
  const running =
    TRAIN_EXPS.filter((e) => e.status === "运行中").length +
    FINETUNE_EXPS.filter((e) => e.status === "运行中").length +
    INFER_EXPS.filter((e) => e.status === "运行中").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <ExpHeader
        icon={<Cpu size={17} color="#fff" />}
        title="数据中试中心"
        subtitle="数据中试中心 ｜ 以数据集为输入，训练 / 微调 / 推理三阶段验证数据质量与适用性"
      />

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <Grid cols={4} style={{ marginBottom: 12 }}>
          <Metric icon={<FlaskConical size={15} />} label="中试试验" value={total} unit="个" hint={`运行中 ${running} · 覆盖三类评估`} />
          <Metric icon={<Target size={15} />} label="训练试验平均主指标" value={`${avg(trainDone.map((e) => e.mainValue)).toFixed(1)}%`} tone={C.teal} hint={`${trainDone.length} 个已完成训练试验`} />
          <Metric icon={<Sparkles size={15} />} label="微调下游平均提升" value={`+${avg(ftDone.map((e) => finetuneGain(e))).toFixed(1)}pt`} tone={C.purple} hint="不含通用能力项" />
          <Metric icon={<Activity size={15} />} label="推理平均 P95 延迟" value={`${Math.round(avg(inferDone.map((e) => e.perf.p95)))}ms`} tone={C.info} hint={`${inferDone.length} 个已完成推理评估`} />
        </Grid>

        <Grid cols="1.45fr 1fr" style={{ marginBottom: 12 }}>
          <Panel title="近 7 日试验趋势" desc="训练评估 / 微调评估 / 推理评估任务数">
            <ReactECharts option={trendOption} style={{ height: 244 }} />
          </Panel>

          <Panel title="数据与模型协同优化闭环" desc="评估结果反哺数据生产，形成闭环" extra={<Tag tone={C.primary}>闭环</Tag>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LOOP.map((l, i) => {
                const Icon = l.icon;
                return (
                  <Link
                    key={l.title}
                    href={l.href}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 11px",
                      border: `1px solid ${C.border}`, borderRadius: 6, textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        width: 24, height: 24, borderRadius: 6, background: `${C.primary}12`,
                        color: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}
                    >
                      <Icon size={13} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text }}>{l.title}</div>
                      <div style={{ fontSize: 11, color: C.faint }}>{l.desc}</div>
                    </div>
                    <span style={{ fontSize: 11, color: C.faint }}>{i + 1}</span>
                    <ArrowRight size={12} style={{ color: C.faint }} />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </Grid>

        <Grid cols={3} style={{ marginBottom: 12 }}>
          <Panel
            title="训练评估进展"
            desc="数据集驱动的模型训练与指标计算"
            extra={<Link href="/model-training" style={{ fontSize: 11.5, color: C.primary, textDecoration: "none" }}>进入 →</Link>}
          >
            {TRAIN_EXPS.slice(0, 3).map((e) => (
              <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                  <Tag tone={e.status === "已完成" ? C.success : e.status === "运行中" ? C.info : C.faint}>{e.status}</Tag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}><Bar pct={e.status === "已完成" ? e.mainValue : e.progress} tone={e.status === "已完成" ? C.primary : C.info} h={4} /></div>
                  <span style={{ fontSize: 11, color: C.sub, width: 52, textAlign: "right" }}>
                    {e.status === "已完成" ? `${e.mainValue.toFixed(1)}%` : `${e.progress}%`}
                  </span>
                </div>
              </div>
            ))}
          </Panel>

          <Panel
            title="微调评估进展"
            desc="数据配方与微调策略对比"
            extra={<Link href="/model-finetune" style={{ fontSize: 11.5, color: C.primary, textDecoration: "none" }}>进入 →</Link>}
          >
            {FINETUNE_EXPS.slice(0, 3).map((e) => {
              const g = finetuneGain(e);
              return (
                <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                    <Tag tone={e.status === "已完成" ? C.success : C.info}>{e.status}</Tag>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ flex: 1 }}><Bar pct={e.status === "已完成" ? Math.min(g * 4, 100) : e.progress} tone={C.purple} h={4} /></div>
                    <span style={{ fontSize: 11, color: C.sub, width: 52, textAlign: "right" }}>
                      {e.status === "已完成" ? `+${g.toFixed(1)}pt` : `${e.progress}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </Panel>

          <Panel
            title="推理评估进展"
            desc="推理性能与鲁棒性边界"
            extra={<Link href="/model-inference" style={{ fontSize: 11.5, color: C.primary, textDecoration: "none" }}>进入 →</Link>}
          >
            {INFER_EXPS.slice(0, 3).map((e) => (
              <div key={e.id} style={{ padding: "8px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.model}</span>
                  <Tag tone={e.status === "已完成" ? C.success : C.info}>{e.status}</Tag>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.sub }}>
                  <span>P95 {e.perf.p95}ms</span>
                  <span style={{ color: C.border }}>|</span>
                  <span>{e.perf.qps.toFixed(0)} QPS</span>
                  <div style={{ flex: 1 }} />
                  <span>{e.status === "已完成" ? `${e.perf.accuracy.toFixed(1)}%` : `${e.progress}%`}</span>
                </div>
              </div>
            ))}
          </Panel>
        </Grid>

        <Panel title="中试能力入口" desc="模型仓库 + 模型试验三类评估">
          <Grid cols={4}>
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  style={{
                    display: "block", padding: "14px 16px", border: `1px solid ${C.border}`,
                    borderRadius: 8, textDecoration: "none", color: "inherit", background: "#fff",
                  }}
                >
                  <span
                    style={{
                      width: 30, height: 30, borderRadius: 8, background: `${m.tone}12`, color: m.tone,
                      display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10,
                    }}
                  >
                    <Icon size={15} />
                  </span>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, minHeight: 34 }}>{m.desc}</div>
                  <div style={{ fontSize: 11.5, color: m.tone, fontWeight: 600, marginTop: 4 }}>前往 →</div>
                </Link>
              );
            })}
          </Grid>
        </Panel>
      </div>
    </div>
  );
}
