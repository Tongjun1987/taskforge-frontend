"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GitBranch, Info, Lock, ScrollText, Workflow } from "lucide-react";
import { C, Kv, NODE_STATUS, Panel, Tag, fmtSec } from "./ui";
import { buildSnapshot, type SnapshotNode } from "./runSnapshot";

/**
 * 产线快照（只读）—— 任务追踪详情的第二个 tab。
 *
 * 和「产线编排」长得像但语义完全不同：
 *   编排 = 定义态，可拖拽可配置，改一次影响此后所有批次；
 *   快照 = 运行态，冻结该批次当时的产线版本，只读、可逐节点下钻。
 * 因此这里刻意不提供组件库、不提供拖拽、不提供参数编辑。
 */
function defaultIndex(nodes: SnapshotNode[]) {
  const i = nodes.findIndex((n) => n.state === "running" || n.state === "error");
  if (i >= 0) return i;
  const done = nodes.filter((n) => n.state === "done").length;
  return Math.max(0, done - 1);
}

export default function PipelineSnapshot({ runId }: { runId: string }) {
  const router = useRouter();
  const snap = useMemo(() => buildSnapshot(runId), [runId]);
  const [picked, setPicked] = useState(-1);

  if (!snap) {
    return (
      <div
        style={{
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "64px 24px",
          textAlign: "center",
        }}
      >
        <Workflow size={40} style={{ color: "#cbd5e1", marginBottom: 16 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>该批次没有关联的产线快照</div>
        <p style={{ fontSize: 13, color: C.sub, margin: "8px 0 0", lineHeight: 1.8 }}>
          批次未记录产线版本，可能是在产线装配完成前产生的运行。产线装配完成后新起的批次才会生成快照。
        </p>
      </div>
    );
  }

  const active = picked >= 0 ? picked : defaultIndex(snap.nodes);
  const node = snap.nodes[active] ?? snap.nodes[0];
  const st = NODE_STATUS[node.state];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 快照信息条：唯一标识这批数据「跑的是哪一版产线」 */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "14px 18px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Tag tone={C.primary} soft={C.primarySoft}>
            <GitBranch size={11} /> {snap.pipe.id}
          </Tag>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{snap.pipe.name}</span>
          <Tag tone={C.sub} soft={C.borderSoft}>
            {snap.version}
          </Tag>
          <Tag tone="#b45309" soft={C.warnSoft}>
            <Lock size={11} /> 只读快照
          </Tag>
          {snap.stale && (
            <span style={{ fontSize: 12, color: "#b45309" }}>
              该批次使用 {snap.version}，产线现已更新至 {snap.currentVersion}
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.faint }}>
            {snap.run.startedAt === "--" ? "批次尚未开始执行" : `快照于 ${snap.run.startedAt}`}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 12,
            paddingTop: 12,
            borderTop: `1px solid ${C.borderSoft}`,
            fontSize: 12,
            color: C.sub,
            flexWrap: "wrap",
          }}
        >
          <span>
            <b style={{ color: C.text }}>{snap.totals.nodes}</b> 节点
          </span>
          <span style={{ color: C.border }}>|</span>
          <span>
            算子 <b style={{ color: C.text }}>{snap.totals.ops}</b> 个
          </span>
          <span style={{ color: C.border }}>|</span>
          <span>
            规则 <b style={{ color: C.text }}>{snap.totals.rules}</b> 条
          </span>
          <span style={{ color: C.border }}>|</span>
          <span>
            输入 <b style={{ color: C.text }}>{snap.totals.input.toLocaleString()}</b> 条
          </span>
          <span style={{ color: C.border }}>|</span>
          <span>
            产出 <b style={{ color: C.text }}>{snap.totals.output.toLocaleString()}</b> 条
          </span>
          <span style={{ color: C.border }}>|</span>
          <span>
            累计耗时 <b style={{ color: C.text }}>{fmtSec(snap.totals.seconds)}</b>
          </span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.faint }}>
            由运行批次 {snap.run.id} 触发
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 316px", gap: 12, alignItems: "start" }}>
        {/* 只读拓扑 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Panel
          title="产线执行拓扑"
          desc="按该批次的执行顺序排列，点击节点查看执行明细"
          extra={
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: C.faint }}>
              <Lock size={11} /> 只读
            </span>
          }
          bodyStyle={{ padding: "18px 16px" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", rowGap: 12 }}>
            {snap.nodes.map((n, i) => (
              <React.Fragment key={n.index}>
                <NodeCard node={n} on={n.index === active} onClick={() => setPicked(n.index)} />
                {i < snap.nodes.length - 1 && (
                  <svg width="22" height="84" style={{ flexShrink: 0 }} aria-hidden="true">
                    <line x1="2" y1="42" x2="13" y2="42" stroke="#cbd5e1" strokeWidth="1.5" />
                    <path d="M13 42 l-5 -3.5 v7 z" fill="#cbd5e1" />
                  </svg>
                )}
              </React.Fragment>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginTop: 16,
              paddingTop: 12,
              borderTop: `1px solid ${C.borderSoft}`,
              fontSize: 12,
              color: C.sub,
              flexWrap: "wrap",
            }}
          >
            {(["done", "running", "waiting", "error"] as const).map((k) => (
              <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: NODE_STATUS[k].tone }} />
                {NODE_STATUS[k].label}
              </span>
            ))}
            <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Info size={11} />
              快照冻结产线版本，改产线请到
              <button
                onClick={() => router.push("/task-modeling?view=pipeline")}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: C.primary,
                  fontSize: 12,
                }}
              >
                产线编排
              </button>
            </span>
          </div>
        </Panel>

        <Panel
          title="批次产出漏斗"
          desc="各节点实际产出条数，失败节点只保留中间结果"
          extra={
            <span style={{ fontSize: 11, color: C.faint }}>
              保留{" "}
              {snap.totals.input ? ((snap.totals.output / snap.totals.input) * 100).toFixed(1) : "0.0"}%
            </span>
          }
          bodyStyle={{ padding: "12px 16px" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {snap.nodes.map((n) => {
              const w = snap.totals.input ? (n.output / snap.totals.input) * 100 : 0;
              return (
                <div key={n.index} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    style={{
                      width: 76,
                      flexShrink: 0,
                      fontSize: 11,
                      color: n.output ? C.text : C.faint,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {n.name}
                  </span>
                  <div style={{ flex: 1, height: 7, background: C.borderSoft, borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.max(w, 0)}%`,
                        height: "100%",
                        background: n.state === "error" ? C.danger : n.tone,
                        borderRadius: 4,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 70,
                      flexShrink: 0,
                      textAlign: "right",
                      fontSize: 11,
                      color: n.output ? C.text : C.faint,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {n.output ? n.output.toLocaleString() : "--"}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
        </div>

        {/* 节点执行明细 */}
        <Panel
          title="节点执行明细"
          desc={`第 ${node.index + 1} / ${snap.totals.nodes} 步`}
          extra={
            <Tag tone={st.tone} soft={node.state === "waiting" ? C.borderSoft : undefined}>
              {st.label}
            </Tag>
          }
          bodyStyle={{ padding: 14 }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 12 }}>{node.name}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Kv k="实际耗时" v={node.seconds ? fmtSec(node.seconds) : "--"} w={78} />
            <Kv k="输入条数" v={node.state === "waiting" ? "--" : node.input.toLocaleString()} w={78} />
            <Kv k="输出条数" v={node.state === "waiting" ? "--" : node.output.toLocaleString()} w={78} />
            <Kv k="过滤条数" v={node.state === "waiting" ? "--" : node.dropped.toLocaleString()} w={78} />
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${C.borderSoft}`,
            }}
          >
            <div
              style={{
                flex: 1,
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 11, color: C.faint }}>算子</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginTop: 2 }}>{node.ops}</div>
            </div>
            <div
              style={{
                flex: 1,
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 11, color: C.faint }}>规则命中</div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: node.rulesHit ? C.primary : C.faint,
                  marginTop: 2,
                }}
              >
                {node.state === "waiting" ? "--" : `${node.rulesHit}/${node.rules}`}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 14,
              marginBottom: 8,
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
            }}
          >
            <ScrollText size={13} style={{ color: C.faint }} /> 执行日志
          </div>
          <div
            style={{
              background: "#0f172a",
              borderRadius: 6,
              padding: "9px 11px",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 11,
              lineHeight: 1.85,
              maxHeight: 132,
              overflowY: "auto",
            }}
          >
            {node.log.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: 8 }}>
                <span style={{ color: "#64748b", flexShrink: 0 }}>{l.t}</span>
                <span style={{ color: node.state === "error" && i === 1 ? "#fca5a5" : "#cbd5e1" }}>{l.text}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* 说明条：为什么这里不能编辑 */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
          background: C.infoSoft,
          border: "1px solid #bae6fd",
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
          color: "#0369a1",
          lineHeight: 1.7,
        }}
      >
        <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          快照是这一批数据的执行留痕，冻结在 {snap.version} 版本上，不随产线改版而变化。要调整节点顺序、算子或规则，请到「产线编排」修改定义，改动只对之后新起的批次生效。
        </span>
      </div>
    </div>
  );
}

function NodeCard({ node, on, onClick }: { node: SnapshotNode; on: boolean; onClick: () => void }) {
  const st = NODE_STATUS[node.state];
  const dim = node.state === "waiting";
  return (
    <button
      onClick={onClick}
      style={{
        width: 120,
        height: 84,
        flexShrink: 0,
        textAlign: "left",
        background: on ? C.primarySoft : "#fff",
        border: `1px solid ${on ? C.primary : C.border}`,
        borderLeft: `3px solid ${on ? C.primary : st.tone}`,
        borderRadius: 8,
        padding: "8px 10px",
        cursor: "pointer",
        boxShadow: on ? "0 4px 12px rgba(79,70,229,.12)" : "none",
        opacity: dim ? 0.72 : 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: C.faint }}>第 {node.index + 1} 步</span>
        <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: 3, background: st.tone }} />
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: dim ? C.sub : C.text,
          lineHeight: 1.3,
          height: 31,
          overflow: "hidden",
        }}
      >
        {node.name}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span style={{ fontSize: 11, color: node.seconds ? C.text : C.faint, fontVariantNumeric: "tabular-nums" }}>
          {node.seconds ? fmtSec(node.seconds) : "--"}
        </span>
        <span style={{ fontSize: 10, color: C.faint }}>{node.ops} 算子</span>
      </div>
    </button>
  );
}
