"use client";

import React, { useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Square,
  AlertTriangle,
  Wrench,
  Clock,
  Activity,
  Timer,
  Gauge,
} from "lucide-react";
import { C, Tag, Bar, Btn, LineChart, Table, Dot, fmtSec, Kv, Metric, Panel } from "./ui";
import { TASK_TRACKING, TASK_RUNS, RUN_STATUS, type RunStatus } from "./mock";
import { buildSnapshot } from "./runSnapshot";

const RES_COLORS = { cpu: C.primary, gpu: C.purple, ram: C.info };

/**
 * 运行详情（属于「生产任务管理 > 任务追踪」的详情层）
 * 入口：任务追踪列表「追踪详情」、任务列表「跟踪」→ 同一个 URL /task-modeling/track/{runId}
 * 参数既可以是运行批次 ID（RUN-xxxx），也可以是任务 ID（该任务无运行记录时用于展示空状态）。
 */
export default function TaskTrackingPanel({ runId }: { runId: string }) {
  const run =
    TASK_RUNS.find((r) => r.id === runId) ?? TASK_RUNS.find((r) => r.taskId === runId);
  const [state, setState] = useState<RunStatus>(run?.status ?? "queued");

  // 没有运行记录时不做假数据，直接给空状态
  if (!run) {
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
        <Activity size={40} style={{ color: "#cbd5e1", marginBottom: 16 }} />
        <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>该任务尚未产生运行记录</div>
        <p style={{ fontSize: 13, color: C.sub, margin: "8px 0 0", lineHeight: 1.8 }}>
          这个任务还没有执行批次。启动任务后，这里会显示节点耗时、资源消耗曲线、历史执行对比与失败归档。
        </p>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
          <Btn tone="primary" icon={<Play size={13} />}>
            启动执行
          </Btn>
        </div>
      </div>
    );
  }

  const st = RUN_STATUS[state];
  // 节点耗时与「产线快照」tab 同源，保证两个 tab 看到的节点名与秒数完全一致
  const snap = buildSnapshot(run.id);
  const costBars = snap
    ? snap.nodes.map((n) => ({ name: n.name, seconds: n.seconds, tone: n.tone }))
    : TASK_TRACKING.nodeCost;
  const doneN = snap ? snap.totals.done : run.nodesDone;
  const totalN = snap ? snap.totals.nodes : run.nodesTotal;
  const maxSec = Math.max(...costBars.map((n) => n.seconds), 1);
  const totalSec = costBars.reduce((s, n) => s + n.seconds, 0);
  const pct = state === "success" ? 100 : state === "queued" ? 0 : run.progress;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 运行实例概览 + 生命周期控制 */}
      <div
        style={{
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{run.name}</span>
          <Tag tone={st.tone} soft={st.soft}>
            <Dot tone={st.tone} pulse={state === "running"} />
            {st.label}
          </Tag>
          <span style={{ fontSize: 12, color: C.sub }}>
            {run.id} · {run.pipeline} · 开始于 {run.startedAt}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {state !== "running" && (
              <Btn size="sm" tone="success" icon={<Play size={12} />} onClick={() => setState("running")}>
                {state === "queued" ? "启动" : "恢复"}
              </Btn>
            )}
            {state === "running" && (
              <Btn size="sm" tone="warn" icon={<Pause size={12} />} onClick={() => setState("paused")}>
                暂停
              </Btn>
            )}
            {(state === "running" || state === "paused") && (
              <Btn size="sm" tone="danger" icon={<Square size={12} />} onClick={() => setState("failed")}>
                终止
              </Btn>
            )}
            <Btn size="sm" icon={<RotateCcw size={12} />} onClick={() => setState("running")}>
              重跑
            </Btn>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            <Bar pct={pct} tone={state === "failed" ? C.danger : C.primary} h={8} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.text, width: 42, textAlign: "right" }}>{pct}%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 10, fontSize: 12, color: C.sub }}>
          <span>
            当前节点 <b style={{ color: C.text }}>{state === "running" ? run.nodeNow : st.label}</b>
          </span>
          <span>
            节点进度{" "}
            <b style={{ color: C.text }}>
              {doneN}/{totalN}
            </b>
          </span>
          <span>
            执行批次 <b style={{ color: C.text }}>#3</b>
          </span>
          <span>
            调度周期 <b style={{ color: C.text }}>{run.schedule}</b>
          </span>
        </div>
      </div>

      {/* KPI */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12 }}>
        <Metric icon={<Gauge size={15} />} label="执行进度" value={pct} unit="%" tone={C.primary} />
        <Metric
          icon={<Activity size={15} />}
          label="已完成节点"
          value={`${doneN}/${totalN}`}
          unit="个"
          tone={C.info}
        />
        <Metric icon={<Timer size={15} />} label="累计耗时" value={fmtSec(totalSec)} tone={C.purple} />
        <Metric icon={<Clock size={15} />} label="资源消耗" value="2.4" unit="GPU·h" tone={C.success} />
      </div>

      {/* 节点耗时 + 资源曲线 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
        <Panel title="节点耗时" desc={snap ? `按 ${snap.pipe.id} ${snap.version} 实际执行` : "各工序节点实际耗时（秒）"}>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {costBars.map((n) => (
              <div key={n.name}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: C.text, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.name}</span>
                  <span style={{ color: n.seconds ? C.sub : C.faint, whiteSpace: "nowrap", flexShrink: 0 }}>{n.seconds ? fmtSec(n.seconds) : "未开始"}</span>
                </div>
                <Bar pct={(n.seconds / maxSec) * 100} tone={n.tone} h={6} />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 18,
              marginTop: 14,
              paddingTop: 12,
              borderTop: `1px solid ${C.borderSoft}`,
              fontSize: 12,
            }}
          >
            <span style={{ color: C.sub }}>
              累计耗时 <b style={{ color: C.text }}>{fmtSec(totalSec)}</b>
            </span>
            <span style={{ color: C.sub }}>
              预计总耗时 <b style={{ color: C.text }}>8m 38s</b>
            </span>
          </div>
        </Panel>

        <Panel title="资源消耗曲线" desc="CPU / GPU / RAM 占用率（%）">
          <LineChart
            series={[
              { name: "CPU", color: RES_COLORS.cpu, data: TASK_TRACKING.resource.cpu },
              { name: "GPU", color: RES_COLORS.gpu, data: TASK_TRACKING.resource.gpu },
              { name: "RAM", color: RES_COLORS.ram, data: TASK_TRACKING.resource.ram },
            ]}
            labels={TASK_TRACKING.resource.labels}
            height={200}
          />
          <div style={{ display: "flex", gap: 16, paddingLeft: 44, marginTop: 6 }}>
            {[
              { n: "CPU", c: RES_COLORS.cpu },
              { n: "GPU", c: RES_COLORS.gpu },
              { n: "RAM", c: RES_COLORS.ram },
            ].map((s) => (
              <span key={s.n} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.sub }}>
                <Dot tone={s.c} />
                {s.n}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0,1fr))",
              gap: 12,
              marginTop: 12,
              paddingTop: 12,
              borderTop: `1px solid ${C.borderSoft}`,
            }}
          >
            <div>
              <Kv k="峰值 CPU" v="71%" w={62} />
              <Kv k="峰值 GPU" v="68%" w={62} />
            </div>
            <div>
              <Kv k="峰值内存" v="58%" w={62} />
              <Kv k="算力消耗" v="2.4 GPU·h" w={62} />
            </div>
          </div>
        </Panel>
      </div>

      {/* 历史执行记录 */}
      <Panel title="历史执行记录" desc="同一任务的历次执行，可对比耗时与产出">
        <Table
          head={["批次", "开始时间", "耗时", "产出条数", "状态"]}
          widths={["12%", "26%", "18%", "22%", "22%"]}
          rows={TASK_TRACKING.history.map((h) => [
            <span key="r" style={{ fontWeight: 600 }}>
              {h.run}
            </span>,
            <span key="s" style={{ fontSize: 12, color: C.sub }}>
              {h.start}
            </span>,
            <span key="d" style={{ fontSize: 12 }}>
              {h.duration}
            </span>,
            <span key="o" style={{ fontSize: 12 }}>
              {h.output}
            </span>,
            <Tag
              key="st"
              tone={h.status === "已完成" ? C.success : h.status === "运行中" ? C.primary : C.danger}
              soft={h.status === "已完成" ? C.successSoft : h.status === "运行中" ? C.primarySoft : C.dangerSoft}
            >
              {h.status}
            </Tag>,
          ])}
          rowKey={(i) => "h" + i}
        />
      </Panel>

      {/* 失败归档 */}
      <Panel
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <AlertTriangle size={14} style={{ color: "#b45309" }} />
            失败归档与修复建议
          </span>
        }
        desc="按「问题数据 / 代码问题」分类归档，自动给出修复建议"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TASK_TRACKING.failureArchive.map((f, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${f.category === "问题数据" ? "#f59e0b" : C.purple}`,
                borderRadius: 6,
                padding: "11px 13px",
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Tag
                  tone={f.category === "问题数据" ? "#b45309" : C.purple}
                  soft={f.category === "问题数据" ? C.warnSoft : C.purpleSoft}
                >
                  {f.category}
                </Tag>
                <span style={{ fontSize: 11, color: C.faint }}>来自执行批次 {f.run}</span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: C.text, lineHeight: 1.7 }}>{f.reason}</p>
              <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
                <Wrench size={13} style={{ color: C.primary, flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: C.primary, lineHeight: 1.6 }}>{f.advice}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
