"use client";

import React, { useState } from "react";
import { Cpu, HardDrive, Server, Sliders, Zap, Clock, RotateCcw, Boxes } from "lucide-react";
import { C, Metric, Panel, Grid, Table, Tag, Dot, Bar, Btn, scrollArea, Kv, Segmented } from "./ui";
import { RESOURCE_POOLS, RESOURCE_METRICS, SCHEDULE_POLICIES, QUEUE_TASKS, DISPATCH_LOGS } from "./mock";

const KIND_TONE: Record<string, string> = { GPU: C.primary, CPU: C.info, MIXED: C.teal };

const LOG_TONE: Record<string, string> = {
  info: C.info,
  warn: "#b45309",
  error: C.danger,
};

type ResTab = "pool" | "policy" | "log";

const TABS: { key: ResTab; label: string }[] = [
  { key: "pool", label: "算力资源池" },
  { key: "policy", label: "调度策略" },
  { key: "log", label: "调度日志" },
];

const TAB_DESC: Record<ResTab, string> = {
  pool: "K8s 集群与 GPU 节点统一纳管，按需分配",
  policy: "优先队列 + 资源配额 + 抢占，保障高优任务",
  log: "资源分配、抢占、释放与异常记录",
};

export default function ResourceView() {
  const [policies, setPolicies] = useState(SCHEDULE_POLICIES);
  const [tab, setTab] = useState<ResTab>("pool");

  const toggle = (id: string) =>
    setPolicies((p) => p.map((x) => (x.id === id ? { ...x, on: !x.on, tag: !x.on ? "已启用" : "未启用" } : x)));

  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        {RESOURCE_METRICS.map((m, i) => (
          <Metric
            key={m.label}
            icon={i === 0 ? <Cpu size={15} /> : i === 1 ? <Server size={15} /> : i === 2 ? <HardDrive size={15} /> : <Boxes size={15} />}
            label={m.label}
            value={m.value}
            unit={m.unit}
            tone={m.tone}
            hint={`整体占用 ${m.pct}%（含预留 10%）`}
          />
        ))}
      </Grid>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        <Segmented items={TABS} value={tab} onChange={(k) => setTab(k)} />
        <span style={{ fontSize: 12, color: C.faint }}>{TAB_DESC[tab]}</span>
      </div>

      {tab === "pool" && (
        <Panel
          title="算力资源池"
          desc={`${RESOURCE_POOLS.length} 个资源池 · 按池查看容量与分配`}
          style={{ marginTop: 12 }}
          extra={
            <Tag tone={C.primary} soft={C.primarySoft}>
              {RESOURCE_POOLS.filter((p) => p.status === "running").length} 个使用中
            </Tag>
          }
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["资源池", "类型", "状态", "容量", "已分配", "利用率"]}
            widths={["22%", "10%", "12%", "24%", "12%", "20%"]}
            rows={RESOURCE_POOLS.map((p) => [
              <div key="n">
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{p.id}</div>
              </div>,
              <Tag key="k" tone={KIND_TONE[p.kind]}>
                {p.kind}
              </Tag>,
              <Tag
                key="s"
                tone={p.status === "running" ? C.success : C.sub}
                soft={p.status === "running" ? C.successSoft : C.borderSoft}
              >
                <Dot tone={p.status === "running" ? C.success : C.sub} pulse={p.status === "running"} />
                {p.status === "running" ? "使用中" : "空闲"}
              </Tag>,
              <span key="t" style={{ fontSize: 12, color: C.sub }}>
                {p.total}
              </span>,
              <span key="u" style={{ fontSize: 12, color: C.text }}>
                {p.used}
              </span>,
              <div key="p" style={{ display: "flex", alignItems: "center", gap: 8, paddingRight: 8 }}>
                <Bar pct={p.pct} tone={p.pct > 80 ? C.danger : KIND_TONE[p.kind]} h={6} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: p.pct > 80 ? C.danger : C.text, width: 32, textAlign: "right" }}>
                  {p.pct}%
                </span>
              </div>,
            ])}
            rowKey={(i) => "pool" + i}
          />
        </Panel>
      )}

      {tab === "policy" && (
        <>
          <Panel
            title="调度策略"
            desc="策略变更立即生效，作用于后续调度"
            style={{ marginTop: 12 }}
            extra={<Btn size="sm" icon={<RotateCcw size={12} />}>重置策略</Btn>}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
              {policies.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "11px 12px",
                    border: `1px solid ${p.on ? C.primary + "33" : C.border}`,
                    background: p.on ? C.primarySoft : "#fff",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: p.on ? "#fff" : C.bg,
                      color: C.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sliders size={13} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</span>
                      <Tag tone={p.on ? C.success : C.sub} soft={p.on ? C.successSoft : C.borderSoft}>
                        {p.tag}
                      </Tag>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: C.sub, lineHeight: 1.6 }}>{p.desc}</p>
                  </div>
                  <button
                    onClick={() => toggle(p.id)}
                    style={{
                      width: 38,
                      height: 21,
                      borderRadius: 11,
                      border: "none",
                      background: p.on ? C.primary : C.border,
                      cursor: "pointer",
                      position: "relative",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        top: 2,
                        left: p.on ? 19 : 2,
                        width: 17,
                        height: 17,
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left .2s",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.borderSoft}`, display: "flex", gap: 20 }}>
              <div style={{ flex: 1 }}>
                <Kv k="调度器状态" v={<span style={{ color: C.success }}>● 运行中（k8s-scheduler v1.29）</span>} w={78} />
                <Kv k="当前排队" v={`${QUEUE_TASKS.length} 个任务`} w={78} />
                <Kv k="今日抢占" v="1 次" w={78} />
              </div>
              <div style={{ flex: 1 }}>
                <Kv k="平均等待" v="6.2 分钟" w={72} />
                <Kv k="配额使用" v="C 池 58% / A 池 75%" w={72} />
                <Kv k="弹性扩缩" v={<span style={{ color: C.faint }}>未启用</span>} w={72} />
              </div>
            </div>
          </Panel>

          <Panel
            title="当前排队"
            desc="按优先级等待算力，高优任务优先被调度"
            style={{ marginTop: 12 }}
            extra={<Tag tone={C.warn} soft={C.warnSoft}>{QUEUE_TASKS.length} 个任务等待</Tag>}
            bodyStyle={{ padding: 0 }}
          >
            <Table
              head={["任务", "优先级", "所属产线", "资源需求", "已等待"]}
              widths={["32%", "12%", "20%", "22%", "14%"]}
              rows={QUEUE_TASKS.map((t) => [
                <div key="n">
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{t.id}</div>
                </div>,
                <Tag
                  key="p"
                  tone={t.priority === "高" ? C.danger : t.priority === "中" ? "#b45309" : C.sub}
                  soft={t.priority === "高" ? C.dangerSoft : t.priority === "中" ? C.warnSoft : C.borderSoft}
                >
                  {t.priority}
                </Tag>,
                <span key="pl" style={{ fontSize: 12, color: C.sub }}>
                  {t.pipeline}
                </span>,
                <span key="d" style={{ fontSize: 12 }}>
                  {t.demand}
                </span>,
                <span key="w" style={{ fontSize: 12, color: C.sub }}>
                  {t.wait}
                </span>,
              ])}
              rowKey={(i) => "q" + i}
            />
          </Panel>
        </>
      )}

      {tab === "log" && (
        <Panel
          title="调度日志"
          desc="资源分配、抢占、释放与异常记录"
          style={{ marginTop: 12 }}
          extra={
            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" icon={<Clock size={12} />}>近 1 小时</Btn>
              <Btn size="sm" icon={<Zap size={12} />}>导出日志</Btn>
            </div>
          }
          bodyStyle={{ padding: 0 }}
        >
          <Table
            head={["时间", "动作", "产线", "详情"]}
            widths={["12%", "10%", "14%", "64%"]}
            rows={DISPATCH_LOGS.map((l) => [
              <span key="t" style={{ fontSize: 12, color: C.sub, fontFamily: "ui-monospace, monospace" }}>
                {l.time}
              </span>,
              <Tag key="a" tone={LOG_TONE[l.level]} soft={`${LOG_TONE[l.level]}12`}>
                {l.action}
              </Tag>,
              <span key="p" style={{ fontSize: 12 }}>{l.pipeline}</span>,
              <span key="d" style={{ fontSize: 12, color: C.sub }}>{l.detail}</span>,
            ])}
            rowKey={(i) => "log" + i}
          />
        </Panel>
      )}
    </div>
  );
}
