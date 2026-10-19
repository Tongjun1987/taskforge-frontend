"use client";

import React, { useState } from "react";
import { Activity, Boxes, Clock, Layers, Timer, Zap, ArrowRight } from "lucide-react";
import { C, Metric, Panel, Grid, Tag, Dot, Bar, Btn, scrollArea, Kv, Table, fmtSec, NODE_STATUS, PIPE_STATUS } from "./ui";
import { PIPELINES } from "./mock";

const QUEUE_MAP: Record<string, number> = {
  "PL-1042": 2,
  "PL-1043": 1,
  "PL-1044": 0,
  "PL-1045": 4,
  "PL-1046": 0,
  "PL-1047": 3,
};

export default function MonitorView() {
  const [activeId, setActiveId] = useState(PIPELINES[0].id);
  const active = PIPELINES.find((p) => p.id === activeId) || PIPELINES[0];
  const maxSec = Math.max(...active.nodes.map((n) => n.seconds), 1);
  const totalSec = active.nodes.reduce((s, n) => s + n.seconds, 0);

  const runningNodes = 14;
  const totalQueue = Object.values(QUEUE_MAP).reduce((a, b) => a + b, 0);

  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        <Metric icon={<Layers size={15} />} label="运行中产线" value="3" unit="/ 6 条" tone={C.success} hint="1 条排队 · 1 条空闲 · 1 条异常" />
        <Metric icon={<Boxes size={15} />} label="运行中节点" value={runningNodes} unit="个" tone={C.primary} hint="全产线工序节点实时状态" />
        <Metric icon={<Clock size={15} />} label="排队任务" value={totalQueue} unit="个" tone={C.warn} hint="最长等待 12 分钟" />
        <Metric icon={<Timer size={15} />} label="平均链路耗时" value="42" unit="秒 / 万条" tone={C.info} delta={{ text: "8.6%", up: false }} hint="较昨日提速" />
      </Grid>

      <Grid cols="minmax(0,1fr) minmax(0,1.3fr)" gap={12} style={{ marginTop: 12 }}>
        <Panel title="产线实时状态" desc="点击产线查看节点级明细" bodyStyle={{ padding: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PIPELINES.map((p) => {
              const st = PIPE_STATUS[p.status];
              const on = p.id === activeId;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  style={{
                    textAlign: "left",
                    padding: "11px 12px",
                    border: `1px solid ${on ? C.primary : C.border}`,
                    background: on ? C.primarySoft : "#fff",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Dot tone={st.tone} pulse={p.status === "running"} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.name}
                    </span>
                    <Tag tone={st.tone} soft={st.soft}>
                      {st.label}
                    </Tag>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <Bar pct={p.progress} tone={st.tone} h={5} />
                    <span style={{ fontSize: 11, color: C.sub, width: 32 }}>{p.progress}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 11, color: C.faint }}>
                    <span>当前节点：{p.currentNode}</span>
                    <span>队列 {QUEUE_MAP[p.id]}</span>
                    <span>资源 {p.usage}%</span>
                    <span>{p.cycle}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Panel
            title={`节点耗时拆解 · ${active.name}`}
            desc={`已完成节点 ${active.nodes.filter((n) => n.status === "done").length} / ${active.nodes.length}，累计耗时 ${fmtSec(totalSec)}`}
            extra={<Btn size="sm" icon={<Zap size={12} />}>下钻任务节点</Btn>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {active.nodes.map((n, i) => {
                const meta = NODE_STATUS[n.status];
                return (
                  <div key={n.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 11, color: C.faint, width: 34 }}>第 {i + 1} 步</span>
                      <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{n.name}</span>
                      <Tag tone={meta.tone} soft={`${meta.tone}12`}>
                        {meta.label}
                      </Tag>
                      <span style={{ fontSize: 12, color: C.sub, width: 56, textAlign: "right" }}>{fmtSec(n.seconds)}</span>
                    </div>
                    <Bar pct={(n.seconds / maxSec) * 100} tone={meta.tone === C.faint ? C.border : meta.tone} h={7} />
                  </div>
                );
              })}
            </div>
          </Panel>

          <Grid cols={2} gap={12}>
            <Panel title="队列与资源">
              <Kv k="等待队列" v={`${QUEUE_MAP[active.id]} 个任务`} w={72} />
              <Kv k="资源占用" v={`${active.usage}%`} w={72} />
              <Kv k="并发节点" v={active.status === "running" ? "3 个" : "0 个"} w={72} />
              <Kv k="链路耗时" v={fmtSec(totalSec)} w={72} />
              <Kv k="预计完成" v={active.status === "running" ? "16:20" : "--"} w={72} />
            </Panel>
            <Panel title="实时吞吐">
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: C.text }}>{active.output || 0}</span>
                <span style={{ fontSize: 12, color: C.faint }}>万条 / 今日</span>
              </div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { k: "近 5 分钟", v: "1.2 万条", pct: 72 },
                  { k: "峰值吞吐", v: "2.4 万条/分", pct: 100 },
                  { k: "异常重试", v: active.alerts + " 次", pct: active.alerts * 12 },
                ].map((r) => (
                  <div key={r.k}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.sub }}>{r.k}</span>
                      <span style={{ color: C.text }}>{r.v}</span>
                    </div>
                    <Bar pct={r.pct} tone={C.info} h={5} />
                  </div>
                ))}
              </div>
            </Panel>
          </Grid>
        </div>
      </Grid>

      <Panel
        title="节点级明细"
        desc="产线 / 队列 / 资源占用 / 链路耗时，可下钻到单个任务节点"
        style={{ marginTop: 12 }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["产线 / 节点", "状态", "队列", "资源占用", "耗时", "链路"]}
          widths={["34%", "14%", "10%", "16%", "12%", "14%"]}
          rows={active.nodes.map((n, i) => [
            <div key="n" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <ArrowRight size={12} style={{ color: C.faint }} />
              <span style={{ fontSize: 13 }}>
                {active.id} · {n.name}
              </span>
            </div>,
            <Tag key="s" tone={NODE_STATUS[n.status].tone} soft={`${NODE_STATUS[n.status].tone}12`}>
              {NODE_STATUS[n.status].label}
            </Tag>,
            <span key="q" style={{ fontSize: 12, color: C.sub }}>
              {n.status === "waiting" ? QUEUE_MAP[active.id] : 0}
            </span>,
            <div key="r" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bar pct={n.status === "running" ? active.usage : n.status === "done" ? 0 : 0} tone={C.primary} h={5} />
              <span style={{ fontSize: 11, color: C.sub, width: 30 }}>{n.status === "running" ? active.usage + "%" : "--"}</span>
            </div>,
            <span key="t" style={{ fontSize: 12 }}>{fmtSec(n.seconds)}</span>,
            <span key="l" style={{ fontSize: 12, color: C.sub }}>
              第 {i + 1} / {active.nodes.length} 环
            </span>,
          ])}
          rowKey={(i) => "node" + i}
        />
      </Panel>
    </div>
  );
}
