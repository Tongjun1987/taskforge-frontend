"use client";

import React, { useState } from "react";
import { Cpu, HardDrive, Server, Sliders, Zap, Clock, RotateCcw, Boxes, ArrowUp } from "lucide-react";
import { C, Metric, Panel, Grid, Table, Tag, Dot, Bar, Btn, IconBtn, scrollArea, Kv, Segmented } from "./ui";
import { RESOURCE_POOLS, RESOURCE_METRICS, SCHEDULE_POLICIES, QUEUE_TASKS, DISPATCH_LOGS } from "./mock";

const KIND_TONE: Record<string, string> = { GPU: C.primary, CPU: C.info, MIXED: C.teal };

const LOG_TONE: Record<string, string> = {
  info: C.info,
  warn: "#b45309",
  error: C.danger,
};

export default function ResourceView() {
  const [policies, setPolicies] = useState(SCHEDULE_POLICIES);
  const [mode, setMode] = useState<"pool" | "queue">("pool");

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

      <Grid cols="minmax(0,1.15fr) minmax(0,1fr)" gap={12} style={{ marginTop: 12 }}>
        <Panel
          title="算力资源池"
          desc="K8s 集群 / GPU 节点统一纳管，按需分配"
          extra={
            <Segmented
              items={[
                { key: "pool", label: "资源池" },
                { key: "queue", label: "排队队列" },
              ]}
              value={mode}
              onChange={(k) => setMode(k)}
            />
          }
          bodyStyle={{ padding: mode === "pool" ? 16 : 0 }}
        >
          {mode === "pool" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {RESOURCE_POOLS.map((p) => (
                <div key={p.id} style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: 6,
                        background: `${KIND_TONE[p.kind]}14`,
                        color: KIND_TONE[p.kind],
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {p.kind === "GPU" ? <Cpu size={13} /> : <Server size={13} />}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.name}</span>
                    <Tag tone={KIND_TONE[p.kind]}>{p.kind}</Tag>
                    <span style={{ marginLeft: "auto" }}>
                      <Tag tone={p.status === "running" ? C.success : C.sub} soft={p.status === "running" ? C.successSoft : C.borderSoft}>
                        <Dot tone={p.status === "running" ? C.success : C.sub} pulse={p.status === "running"} />
                        {p.status === "running" ? "使用中" : "空闲"}
                      </Tag>
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.sub, margin: "10px 0 6px" }}>
                    <span>
                      容量 {p.total} · 已分配 <b style={{ color: C.text }}>{p.used}</b>
                    </span>
                    <span>
                      利用率 <b style={{ color: p.pct > 80 ? C.danger : C.text }}>{p.pct}%</b>
                    </span>
                  </div>
                  <Bar pct={p.pct} tone={p.pct > 80 ? C.danger : KIND_TONE[p.kind]} h={7} />
                </div>
              ))}
            </div>
          ) : (
            <Table
              head={["任务", "优先级", "所属产线", "资源需求", "已等待", "操作"]}
              widths={["30%", "10%", "18%", "20%", "12%", "10%"]}
              rows={QUEUE_TASKS.map((t) => [
                <div key="n">
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{t.id}</div>
                </div>,
                <Tag key="p" tone={t.priority === "高" ? C.danger : t.priority === "中" ? "#b45309" : C.sub} soft={t.priority === "高" ? C.dangerSoft : t.priority === "中" ? C.warnSoft : C.borderSoft}>
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
                <span key="a">
                  <IconBtn size="sm" tone="primary" icon={<ArrowUp size={13} />} label="提权" />
                </span>,
              ])}
            />
          )}
        </Panel>

        <Panel
          title="调度策略"
          desc="优先队列 + 资源配额 + 抢占，保障高优任务"
          extra={<Btn size="sm" icon={<RotateCcw size={12} />}>重置策略</Btn>}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              <Kv k="当前排队" v="4 个任务" w={78} />
              <Kv k="今日抢占" v="1 次" w={78} />
            </div>
            <div style={{ flex: 1 }}>
              <Kv k="平均等待" v="6.2 分钟" w={72} />
              <Kv k="配额使用" v="C 池 58% / A 池 75%" w={72} />
              <Kv k="弹性扩缩" v={<span style={{ color: C.faint }}>未启用</span>} w={72} />
            </div>
          </div>
        </Panel>
      </Grid>

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
            <span key="t" style={{ fontSize: 12, color: C.sub, fontFamily: "ui-monospace, monospace" }}>{l.time}</span>,
            <Tag key="a" tone={LOG_TONE[l.level]} soft={`${LOG_TONE[l.level]}12`}>
              {l.action}
            </Tag>,
            <span key="p" style={{ fontSize: 12 }}>{l.pipeline}</span>,
            <span key="d" style={{ fontSize: 12, color: C.sub }}>{l.detail}</span>,
          ])}
          rowKey={(i) => "log" + i}
        />
      </Panel>
    </div>
  );
}
