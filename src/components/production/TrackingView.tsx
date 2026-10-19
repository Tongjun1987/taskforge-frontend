"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Pause, Play, RotateCcw, Search, Square, Timer, XCircle } from "lucide-react";
import { C, Panel, Grid, Btn, IconBtn, Tag, Table, Metric, scrollArea } from "./ui";
import { TASK_RUNS, RUN_STATUS, type RunStatus } from "./mock";

const FILTERS: { key: "all" | RunStatus; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "running", label: "执行中" },
  { key: "paused", label: "已暂停" },
  { key: "queued", label: "排队中" },
  { key: "success", label: "已完成" },
  { key: "failed", label: "执行失败" },
];

function Progress({ value, tone }: { value: number; tone: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 108 }}>
      <div
        style={{
          flex: 1,
          height: 6,
          background: C.borderSoft,
          borderRadius: 3,
          overflow: "hidden",
          minWidth: 56,
        }}
      >
        <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: tone, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 12, color: C.sub, width: 34, textAlign: "right" }}>{value}%</span>
    </div>
  );
}

function Mini({ label, v, tone }: { label: string; v: number; tone: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <span style={{ fontSize: 11, color: C.faint, width: 26 }}>{label}</span>
      <div style={{ width: 34, height: 5, background: C.borderSoft, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${v}%`, height: "100%", background: tone }} />
      </div>
      <span style={{ fontSize: 11, color: C.sub, width: 26 }}>{v}%</span>
    </div>
  );
}

export default function TrackingView() {
  const router = useRouter();
  const [runs, setRuns] = useState(TASK_RUNS);
  const [filter, setFilter] = useState<"all" | RunStatus>("all");
  const [q, setQ] = useState("");

  const act = (id: string, status: RunStatus, nodeNow?: string) =>
    setRuns((prev) => prev.map((r) => (r.id === id ? { ...r, status, nodeNow: nodeNow ?? r.nodeNow } : r)));

  const list = useMemo(
    () =>
      runs.filter(
        (r) =>
          (filter === "all" || r.status === filter) &&
          (q.trim() === "" ||
            r.name.includes(q.trim()) ||
            r.id.includes(q.trim()) ||
            r.scene.includes(q.trim()))
      ),
    [runs, filter, q]
  );

  const counts = {
    running: runs.filter((r) => r.status === "running").length,
    queued: runs.filter((r) => r.status === "queued").length,
    failed: runs.filter((r) => r.status === "failed").length,
    done: runs.filter((r) => r.status === "success").length,
  };

  const head = ["任务", "所属产线", "状态", "进度", "当前节点", "资源消耗", "耗时", "操作控制"];

  const rows = list.map((r) => {
    const st = RUN_STATUS[r.status];
    return [
      // 任务
      <div key="t" style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: C.text, whiteSpace: "nowrap" }}>{r.name}</span>
          <Tag tone={r.priority === "紧急" ? C.danger : r.priority === "高" ? C.warn : C.sub}>
            {r.priority}
          </Tag>
        </div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 3, whiteSpace: "nowrap" }}>
          {r.scene} · {r.id} · {r.schedule}
        </div>
      </div>,
      // 产线
      <span key="p" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>{r.pipeline}</span>,
      // 状态
      <Tag key="s" tone={st.tone} soft={st.soft}>
        {st.label}
      </Tag>,
      // 进度
      <Progress key="g" value={r.progress} tone={st.tone} />,
      // 当前节点
      <div key="n">
        <div style={{ fontSize: 12, color: C.text, whiteSpace: "nowrap" }}>{r.nodeNow}</div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
          节点 {r.nodesDone}/{r.nodesTotal}
        </div>
      </div>,
      // 资源
      <div key="r" style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Mini label="CPU" v={r.cpu} tone={C.info} />
        <Mini label="GPU" v={r.gpu} tone={C.primary} />
        <Mini label="MEM" v={r.ram} tone={C.purple} />
      </div>,
      // 耗时
      <div key="e">
        <div style={{ fontSize: 12, color: C.text, whiteSpace: "nowrap" }}>{r.elapsed}</div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 2, whiteSpace: "nowrap" }}>{r.startedAt}</div>
      </div>,
      // 操作
      <div key="a" style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
        {r.status === "running" && (
          <>
            <IconBtn size="sm" tone="warn" icon={<Pause size={13} />} label="暂停" onClick={() => act(r.id, "paused", "已暂停")} />
            <IconBtn size="sm" tone="danger" icon={<Square size={13} />} label="终止" onClick={() => act(r.id, "success", "已终止")} />
          </>
        )}
        {r.status === "paused" && (
          <>
            <IconBtn size="sm" tone="success" icon={<Play size={13} />} label="恢复" onClick={() => act(r.id, "running", "已恢复")} />
            <IconBtn size="sm" tone="danger" icon={<Square size={13} />} label="终止" onClick={() => act(r.id, "success", "已终止")} />
          </>
        )}
        {(r.status === "failed" || r.status === "success") && (
          <IconBtn size="sm" tone="primary" icon={<RotateCcw size={13} />} label="重跑" onClick={() => act(r.id, "running", "重新执行")} />
        )}
        {r.status === "queued" && (
          <IconBtn size="sm" tone="success" icon={<Play size={13} />} label="启动" onClick={() => act(r.id, "running", "启动中")} />
        )}
        <IconBtn
          size="sm"
          tone="ghost"
          icon={<Activity size={13} />}
          label="追踪详情"
          onClick={() => router.push(`/task-modeling/track/${r.id}`)}
        />
      </div>,
    ];
  });

  return (
    <div style={{ ...scrollArea, display: "flex", flexDirection: "column", gap: 12 }}>
      <Grid cols="repeat(4, minmax(0,1fr))" gap={12}>
        <Metric icon={<Activity size={15} />} label="执行中任务" value={counts.running} unit="个" tone={C.primary} />
        <Metric icon={<Timer size={15} />} label="排队等待" value={counts.queued} unit="个" tone={C.info} />
        <Metric icon={<XCircle size={15} />} label="执行失败" value={counts.failed} unit="个" tone={C.danger} />
        <Metric icon={<Play size={15} />} label="已完成" value={counts.done} unit="个" tone={C.success} />
      </Grid>

      <Panel
        title="任务跟踪"
        desc="全生命周期跟踪：执行状态 · 进度百分比 · 各节点耗时 · 资源消耗；支持暂停 / 恢复 / 终止 / 重跑与回溯排查"
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 6,
              }}
            >
              <Search size={13} style={{ color: C.faint }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索任务 / 场景 / 编号"
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 12,
                  width: 170,
                  color: C.text,
                }}
              />
            </div>
            <Btn icon={<RotateCcw size={13} />} size="sm" onClick={() => { setQ(""); setFilter("all"); }}>
              重置
            </Btn>
          </div>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "10px 16px",
            borderBottom: `1px solid ${C.borderSoft}`,
            flexWrap: "wrap",
          }}
        >
          {FILTERS.map((f) => {
            const on = filter === f.key;
            const n = f.key === "all" ? runs.length : runs.filter((r) => r.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 11px",
                  fontSize: 12,
                  borderRadius: 6,
                  cursor: "pointer",
                  border: `1px solid ${on ? C.primary : C.border}`,
                  background: on ? C.primarySoft : "#fff",
                  color: on ? C.primary : C.sub,
                  fontWeight: on ? 600 : 400,
                }}
              >
                {f.label}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{n}</span>
              </button>
            );
          })}
        </div>
        <Table head={head} rows={rows} rowKey={(i) => list[i].id} />
      </Panel>
    </div>
  );
}
