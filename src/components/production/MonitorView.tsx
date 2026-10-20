"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, Boxes, Clock, Gauge, Layers, Zap, ChevronRight } from "lucide-react";
import {
  C,
  Metric,
  Panel,
  Grid,
  Tag,
  Dot,
  Bar,
  scrollArea,
  fmtSec,
  NODE_STATUS,
  PIPE_STATUS,
} from "./ui";
import { PIPELINES } from "./mock";
import { nodeMetric, nodeSeed, splitParts, nodeIdOf, bottleneckOf, PART_LEGEND, type Pipe } from "./monitorModel";

const COLS = "minmax(120px,1fr) 62px 78px 80px 66px 88px 62px 72px 104px";

// Queued tasks per pipeline, consistent with the resource scheduling page.
const QUEUE_MAP: Record<string, number> = {
  "PL-1042": 2,
  "PL-1043": 1,
  "PL-1044": 0,
  "PL-1045": 4,
  "PL-1046": 0,
  "PL-1047": 3,
};

function HeadCell({ children, align }: { children: React.ReactNode; align?: "right" | "center" }) {
  return <span style={{ textAlign: align || "left", fontSize: 11, color: C.faint, fontWeight: 500 }}>{children}</span>;
}

export default function MonitorView() {
  const router = useRouter();
  const [activeId, setActiveId] = useState(PIPELINES[0].id);
  const active = PIPELINES.find((p) => p.id === activeId) || PIPELINES[0];
  const [hover, setHover] = useState(-1);

  const doneCount = active.nodes.filter((n) => n.status === "done").length;
  const runCount = active.nodes.filter((n) => n.status === "running").length;
  const waitCount = active.nodes.filter((n) => n.status === "waiting" || n.status === "error").length;
  const totalSec = active.nodes.reduce((s, n) => s + n.seconds, 0);

  const running = PIPELINES.filter((p) => p.status === "running");
  const totalOutput = running.reduce((s, p) => s + p.output, 0);
  const avgUsage = Math.round(running.reduce((s, p) => s + p.usage, 0) / Math.max(1, running.length));
  const queuedTasks = Object.values(QUEUE_MAP).reduce((a, b) => a + b, 0);
  const alertCount = PIPELINES.reduce((s, p) => s + p.alerts, 0);

  const pick = (p: Pipe) => {
    setActiveId(p.id);
    setHover(-1);
  };

  const openNode = (idx: number) => {
    router.push(`/task-modeling/monitor/node/${nodeIdOf(active.id, idx)}`);
  };

  return (
    <div style={scrollArea}>
      {/* Layer map: global -> pipeline -> node -> node diagnosis page */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 12, color: C.sub }}>
        <Activity size={14} style={{ color: C.primary }} />
        <span style={{ color: C.faint }}>监控层级</span>
        {["全局指标", "产线状态", "节点明细"].map((s, i) => (
          <React.Fragment key={s}>
            {i > 0 && <ChevronRight size={12} style={{ color: C.faint }} />}
            <span style={{ color: C.text }}>{s}</span>
          </React.Fragment>
        ))}
        <ChevronRight size={12} style={{ color: C.faint }} />
        <span style={{ color: C.primary }}>节点诊断</span>
        <span style={{ color: C.faint }}>（点击任意节点行进入）</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, color: C.success }}>
          <Dot tone={C.success} pulse />
          实时刷新 · 5 秒
        </span>
      </div>

      {/* Layer 1: five global runtime metrics */}
      <Grid cols={5} gap={12}>
        <Metric
          icon={<Zap size={15} />}
          label="数据吞吐"
          value={totalOutput.toFixed(1)}
          unit="万条 / 今日"
          tone={C.success}
          delta={{ text: "8.2%", up: true }}
          hint={`${running.length} 条产线在跑 · 峰值 2.4 万条/分`}
        />
        <Metric
          icon={<Gauge size={15} />}
          label="处理延迟"
          value="1.42"
          unit="秒 · P95"
          tone={C.info}
          hint="长尾集中在标注与质检节点"
        />
        <Metric
          icon={<Clock size={15} />}
          label="队列积压"
          value={queuedTasks}
          unit="个任务"
          tone={C.warn}
          hint="最长等待 12 分钟 · 1 条产线排队"
        />
        <Metric
          icon={<Boxes size={15} />}
          label="资源占用"
          value={avgUsage}
          unit="% GPU 池"
          tone={C.primary}
          hint="GPU 训练池 A 78% · 池 B 41%"
        />
        <Metric
          icon={<AlertTriangle size={15} />}
          label="错误率"
          value="0.42"
          unit="%"
          tone={C.danger}
          hint={`近 1 小时 ${alertCount} 条告警 · 自动重试 2 次`}
        />
      </Grid>

      {/* Layer 2 + 3: pipeline list and node comparison table */}
      <Grid cols="292px minmax(0,1fr)" gap={12} style={{ marginTop: 12, alignItems: "stretch" }}>
        <Panel title="产线实时状态" desc={`${PIPELINES.length} 条产线 · 点击切换`} bodyStyle={{ padding: 8 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {PIPELINES.map((p) => {
              const st = PIPE_STATUS[p.status];
              const on = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => pick(p)}
                  style={{
                    textAlign: "left",
                    padding: "9px 10px",
                    border: `1px solid ${on ? C.primary : "transparent"}`,
                    background: on ? C.primarySoft : "#fff",
                    borderRadius: 7,
                    cursor: "pointer",
                    transition: "background .15s, border-color .15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!on) e.currentTarget.style.background = C.bg;
                  }}
                  onMouseLeave={(e) => {
                    if (!on) e.currentTarget.style.background = "#fff";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Dot tone={st.tone} pulse={p.status === "running"} />
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: on ? 600 : 500,
                        color: on ? C.primaryDeep : C.text,
                        flex: 1,
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.name}
                    </span>
                    <Tag tone={st.tone} soft={st.soft}>
                      {st.label}
                    </Tag>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 7 }}>
                    <Bar pct={p.progress} tone={st.tone} h={4} />
                    <span style={{ fontSize: 10.5, color: C.faint, width: 28, textAlign: "right" }}>{p.progress}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10.5, color: C.faint }}>
                    <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.currentNode}
                    </span>
                    <span>队列 {QUEUE_MAP[p.id] ?? 0}</span>
                    <span>资源 {p.usage}%</span>
                    <span style={{ color: p.alerts > 0 ? C.danger : C.faint }}>告警 {p.alerts}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <Panel
          title={`节点级明细 · ${active.name}`}
          desc={`${active.nodes.length} 个节点横向对比；点击任意一行进入该节点诊断页（耗时拆解 + 实时指标）`}
          extra={
            <Tag tone={C.primary} soft={C.primarySoft}>
              <Layers size={11} /> {active.id}
            </Tag>
          }
          style={{ display: "flex", flexDirection: "column" }}
          bodyStyle={{ padding: 0, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              gap: 8,
              padding: "9px 16px",
              background: C.bg,
              borderTop: `1px solid ${C.border}`,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <HeadCell>节点</HeadCell>
            <HeadCell align="center">状态</HeadCell>
            <HeadCell align="right">吞吐</HeadCell>
            <HeadCell align="right">延迟 P95</HeadCell>
            <HeadCell align="right">积压</HeadCell>
            <HeadCell align="right">资源占用</HeadCell>
            <HeadCell align="right">错误率</HeadCell>
            <HeadCell align="right">耗时</HeadCell>
            <HeadCell>耗时构成</HeadCell>
          </div>

          {active.nodes.map((n, i) => {
            const m = nodeMetric(active, n, i);
            const sm = NODE_STATUS[n.status];
            const parts = splitParts(n.seconds, nodeSeed(active, n, i));
            const bottleneck = parts ? bottleneckOf(parts) : null;
            const hovered = i === hover;
            return (
              <div
                key={n.name + i}
                onClick={() => openNode(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  gap: 8,
                  alignItems: "center",
                  padding: "9px 16px",
                  cursor: "pointer",
                  borderBottom: `1px solid ${C.borderSoft}`,
                  borderLeft: `3px solid ${hovered ? C.primary : "transparent"}`,
                  background: hovered ? C.primarySoft : "#fff",
                  transition: "background .12s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  <span style={{ fontSize: 10.5, color: C.faint, width: 30, flexShrink: 0 }}>#{i + 1}</span>
                  <span
                    style={{
                      fontSize: 12.5,
                      color: hovered ? C.primaryDeep : C.text,
                      fontWeight: hovered ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.name}
                  </span>
                </div>
                <div style={{ textAlign: "center" }}>
                  <Tag tone={sm.tone} soft={`${sm.tone}12`}>
                    {sm.label}
                  </Tag>
                </div>
                <span style={{ fontSize: 12, textAlign: "right", color: m.throughput ? C.text : C.faint }}>
                  {m.throughput ? `${m.throughput}` : "—"}
                </span>
                <span style={{ fontSize: 12, textAlign: "right", color: m.latency ? C.text : C.faint }}>
                  {m.latency ? `${m.latency}` : "—"}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    textAlign: "right",
                    color: m.backlog > 1200 ? C.danger : m.backlog ? C.warn : C.faint,
                  }}
                >
                  {m.backlog ? m.backlog : "—"}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {m.resource ? (
                    <>
                      <Bar pct={m.resource} tone={C.primary} h={4} />
                      <span style={{ fontSize: 11, color: C.sub, width: 28, textAlign: "right" }}>{m.resource}%</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 11, color: C.faint, width: "100%", textAlign: "right" }}>—</span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    textAlign: "right",
                    color: m.errorRate >= 1 ? C.danger : m.errorRate > 0 ? C.sub : C.faint,
                  }}
                >
                  {m.errorRate ? `${m.errorRate}%` : "—"}
                </span>
                <span style={{ fontSize: 12, textAlign: "right", color: n.seconds ? C.text : C.faint }}>
                  {n.seconds ? fmtSec(n.seconds) : "—"}
                </span>
                <div style={{ minWidth: 0 }}>
                  {parts && n.seconds ? (
                    <div>
                      <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: C.borderSoft }}>
                        {parts.map((p) => (
                          <span key={p.label} style={{ width: `${(p.v / n.seconds) * 100}%`, background: p.tone }} />
                        ))}
                      </div>
                      <div style={{ fontSize: 9.5, color: C.faint, marginTop: 3, whiteSpace: "nowrap" }}>
                        {bottleneck ? `${bottleneck.label} ${bottleneck.pct}%` : ""}
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: C.faint }}>—</span>
                  )}
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: "auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "9px 16px",
              borderTop: `1px solid ${C.border}`,
              background: C.bg,
              fontSize: 11.5,
              color: C.sub,
            }}
          >
            <span>{active.nodes.length} 个节点</span>
            <span style={{ color: C.success }}>已完成 {doneCount}</span>
            <span style={{ color: C.primary }}>运行中 {runCount}</span>
            <span style={{ color: C.faint }}>等待 {waitCount}</span>
            <span style={{ color: C.text }}>累计耗时 {fmtSec(totalSec)}</span>
            <span
              style={{
                marginLeft: "auto",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 10.5,
                color: C.faint,
              }}
            >
              {PART_LEGEND.map((p) => (
                <span key={p.label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 2, background: p.tone }} />
                  {p.label}
                </span>
              ))}
            </span>
          </div>
        </Panel>
      </Grid>
    </div>
  );
}
