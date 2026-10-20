"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Gauge, Activity } from "lucide-react";
import {
  C,
  Panel,
  Grid,
  Tag,
  Dot,
  Btn,
  Kv,
  LineChart,
  Segmented,
  scrollArea,
  fmtSec,
  NODE_STATUS,
} from "@/components/production/ui";
import { PIPELINES } from "@/components/production/mock";
import {
  METRIC_TABS,
  METRIC_META,
  nodeMetric,
  nodeSeed,
  splitParts,
  bottleneckOf,
  buildTrend,
  trendLabels,
  nodeIdOf,
  parseNodeId,
  type MetricKey,
} from "@/components/production/monitorModel";

export default function NodeDetailClient({ nodeId }: { nodeId: string }) {
  const router = useRouter();
  const [metric, setMetric] = useState<MetricKey>("throughput");

  const parsed = parseNodeId(nodeId);
  const back = () => router.push("/task-modeling?view=monitor");
  const go = (pipelineId: string, i: number) => router.push(`/task-modeling/monitor/node/${nodeIdOf(pipelineId, i)}`);

  if (!parsed) {
    return (
      <div style={{ ...scrollArea, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: C.sub }}>
          <Activity size={26} style={{ color: C.border }} />
          <div style={{ marginTop: 10, fontSize: 14, color: C.text, fontWeight: 500 }}>节点不存在或已下线</div>
          <div style={{ marginTop: 6, fontSize: 12, color: C.faint }}>节点标识 {nodeId}</div>
          <div style={{ marginTop: 14 }}>
            <Btn tone="primary" size="sm" onClick={back}>
              返回实时监控
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  const pipe = PIPELINES.find((p) => p.id === parsed.pipelineId)!;
  const idx = parsed.idx;
  const node = pipe.nodes[idx];
  const sm = NODE_STATUS[node.status];
  const seed = nodeSeed(pipe, node, idx);
  const m = nodeMetric(pipe, node, idx);
  const parts = splitParts(node.seconds, seed);
  const bottleneck = parts ? bottleneckOf(parts) : null;

  const valid = pipe.nodes.filter((n) => n.seconds > 0);
  const avgSec = valid.length ? valid.reduce((s, n) => s + n.seconds, 0) / valid.length : 0;
  const deltaPct = avgSec && node.seconds ? Math.round(((node.seconds - avgSec) / avgSec) * 100) : 0;

  const meta = METRIC_META[metric];
  const cur = m[metric];
  const vals = buildTrend(cur, meta.digits, `${seed}|${metric}`);
  const hasTrend = vals.some((v) => v !== 0);
  const peak = Math.max(...vals, 0);
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;

  return (
    <div style={scrollArea}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, fontSize: 12, color: C.faint }}>
        <button
          onClick={back}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "4px 9px",
            border: `1px solid ${C.border}`,
            background: "#fff",
            borderRadius: 6,
            fontSize: 12,
            color: C.sub,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={13} /> 实时监控
        </button>
        <span>生产运行监管</span>
        <ChevronRight size={12} />
        <span>实时监控</span>
        <ChevronRight size={12} />
        <span>{pipe.id}</span>
        <ChevronRight size={12} />
        <span style={{ color: C.text }}>{node.name}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, color: C.success }}>
          <Dot tone={C.success} pulse />
          实时刷新 · 5 秒
        </span>
      </div>

      {/* Node header: where this node sits, plus upstream / downstream jumps */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "13px 16px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: C.text }}>{node.name}</span>
            <Tag tone={sm.tone} soft={`${sm.tone}12`}>
              {sm.label}
            </Tag>
            {node.seconds > 0 && (
              <span style={{ fontSize: 12, color: C.faint }}>
                第 {idx + 1} / {pipe.nodes.length} 个节点
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 5 }}>
            {pipe.id} · {pipe.name} · {pipe.business} · {pipe.type}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <Btn
            tone="ghost"
            size="sm"
            icon={<ChevronLeft size={13} />}
            disabled={idx === 0}
            onClick={() => go(pipe.id, idx - 1)}
          >
            {idx > 0 ? `上游 · ${pipe.nodes[idx - 1].name}` : "已是首个节点"}
          </Btn>
          <Btn
            tone="ghost"
            size="sm"
            icon={<ChevronRight size={13} />}
            disabled={idx === pipe.nodes.length - 1}
            onClick={() => go(pipe.id, idx + 1)}
          >
            {idx < pipe.nodes.length - 1 ? `下游 · ${pipe.nodes[idx + 1].name}` : "已是末个节点"}
          </Btn>
        </div>
      </div>

      {/* Pipeline position strip: keep the surrounding context the list used to give */}
      <Panel
        title="产线位置"
        desc={`同一条产线上 ${pipe.nodes.length} 个节点，点击任意节点直接切换`}
        style={{ marginTop: 12 }}
        bodyStyle={{ padding: "10px 12px" }}
      >
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2 }}>
          {pipe.nodes.map((n, i) => {
            const on = i === idx;
            const s = NODE_STATUS[n.status];
            return (
              <button
                key={n.name + i}
                onClick={() => go(pipe.id, i)}
                style={{
                  flex: "1 0 104px",
                  minWidth: 104,
                  textAlign: "left",
                  padding: "7px 9px",
                  border: `1px solid ${on ? C.primary : C.border}`,
                  background: on ? C.primarySoft : "#fff",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 10, color: C.faint }}>#{i + 1}</span>
                  <Dot tone={s.tone} pulse={n.status === "running"} />
                  <span style={{ marginLeft: "auto", fontSize: 10.5, color: C.faint }}>
                    {n.seconds ? fmtSec(n.seconds) : "—"}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 12,
                    fontWeight: on ? 600 : 400,
                    color: on ? C.primaryDeep : C.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {n.name}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>

      <Grid cols="minmax(0,1fr) minmax(0,1.12fr)" gap={12} style={{ marginTop: 12, alignItems: "stretch" }}>
        <Panel
          title="节点耗时拆解"
          desc="把该节点「耗时」拆成四段，用于定位瓶颈在排队、IO 还是计算"
          extra={
            <Tag tone={sm.tone} soft={`${sm.tone}12`}>
              {sm.label}
            </Tag>
          }
          style={{ display: "flex", flexDirection: "column" }}
          bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          {!parts ? (
            <div
              style={{
                flex: 1,
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: C.faint,
                fontSize: 12,
                gap: 8,
              }}
            >
              <Clock size={22} style={{ color: C.border }} />
              <span>{node.status === "waiting" ? "该节点尚未开始执行，暂无耗时数据" : "该节点暂无耗时记录"}</span>
              <span style={{ fontSize: 11 }}>
                {node.status === "waiting" ? "上游节点产出后会自动开始计时" : ""}
              </span>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{fmtSec(node.seconds)}</span>
                <span style={{ fontSize: 12, color: C.faint }}>单批次执行耗时</span>
                {bottleneck && (
                  <Tag tone={bottleneck.tone} soft={`${bottleneck.tone}12`}>
                    瓶颈 · {bottleneck.label} {bottleneck.pct}%
                  </Tag>
                )}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12 }}>
                <Gauge size={13} style={{ color: C.faint }} />
                <span style={{ color: C.faint }}>本产线节点均值 {fmtSec(Math.round(avgSec))}</span>
                <span style={{ color: deltaPct > 0 ? C.warn : C.success }}>
                  该节点{deltaPct > 0 ? "慢" : "快"} {Math.abs(deltaPct)}%
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  height: 12,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: C.borderSoft,
                  margin: "14px 0 6px",
                }}
              >
                {parts.map((p) => (
                  <div key={p.label} style={{ width: `${(p.v / Math.max(1, node.seconds)) * 100}%`, background: p.tone }} />
                ))}
              </div>

              <div style={{ marginTop: 8 }}>
                {parts.map((p) => (
                  <div
                    key={p.label}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) 62px 50px",
                      gap: 10,
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: `1px solid ${C.borderSoft}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: p.tone, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: C.text }}>{p.label}</span>
                      <span
                        style={{
                          fontSize: 11,
                          color: C.faint,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {p.desc}
                      </span>
                    </div>
                    <span style={{ fontSize: 12, color: C.text, textAlign: "right" }}>{p.v}s</span>
                    <span style={{ fontSize: 11.5, color: C.sub, textAlign: "right" }}>{p.pct}%</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: 10,
                  borderTop: `1px dashed ${C.border}`,
                  fontSize: 11,
                  color: C.faint,
                  lineHeight: 1.7,
                }}
              >
                口径：对应节点级明细中「{node.name}」这一行的耗时 {fmtSec(node.seconds)}，按单批次执行计时；「排队等待」只算本节点入队后的等待，不含上游节点耗时。
              </div>
            </>
          )}
        </Panel>

        <Panel title="节点实时指标" desc={`${node.name} · 近 12 分钟`} style={{ display: "flex", flexDirection: "column" }}>
          <Segmented items={METRIC_TABS} value={metric} onChange={(k) => setMetric(k as MetricKey)} />

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 14 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: hasTrend ? meta.tone : C.faint, lineHeight: 1 }}>
              {hasTrend ? cur.toFixed(meta.digits) : "—"}
            </span>
            <span style={{ fontSize: 12, color: C.faint }}>{meta.unit}</span>
            <span style={{ fontSize: 11, color: C.faint, marginLeft: "auto" }}>
              {node.status === "running" ? "当前节点 · 采样中" : "最近一个有数据的时点"}
            </span>
          </div>

          <div style={{ marginTop: 10 }}>
            {hasTrend ? (
              <LineChart
                series={[{ name: METRIC_TABS.find((t) => t.key === metric)!.label, color: meta.tone, data: vals }]}
                labels={trendLabels()}
                height={196}
                yUnit={meta.unit}
              />
            ) : (
              <div
                style={{
                  height: 196,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: C.faint,
                  fontSize: 12,
                  background: C.bg,
                  borderRadius: 6,
                }}
              >
                该节点在这一指标上暂无数值（未开始执行）
              </div>
            )}
          </div>

          <Grid cols={3} gap={10} style={{ marginTop: 10 }}>
            <div>
              <Kv k="峰值" v={hasTrend ? peak.toFixed(meta.digits) : "—"} w={52} />
            </div>
            <div>
              <Kv k="均值" v={hasTrend ? avg.toFixed(meta.digits) : "—"} w={52} />
            </div>
            <div>
              <Kv k="采样点" v={hasTrend ? `${vals.length} 个` : "—"} w={56} />
            </div>
          </Grid>
        </Panel>
      </Grid>
    </div>
  );
}
