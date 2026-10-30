"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, ArrowLeft, ChevronRight, Workflow } from "lucide-react";
import TaskTrackingPanel from "@/components/production/TaskTracking";
import PipelineSnapshot from "@/components/production/PipelineSnapshot";
import { C } from "@/components/production/ui";
import { TASK_RUNS } from "@/components/production/mock";

/**
 * 运行详情页 —— 属于「生产任务管理 > 任务追踪」的详情层。
 * 入口：任务追踪列表「追踪详情」、任务列表「跟踪」，两处指向同一个 URL。
 *
 * 两个 tab 的职责边界：
 *   运行监控 = 这次跑得怎么样（进度 / 资源曲线 / 历史批次 / 失败归档）
 *   产线快照 = 这次跑的是哪一版产线（只读拓扑 + 逐节点执行明细），不提供任何编辑能力
 */
type TabKey = "monitor" | "snapshot";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "monitor", label: "运行监控", icon: <Activity size={14} /> },
  { key: "snapshot", label: "产线快照", icon: <Workflow size={14} /> },
];

export default function TrackDetailClient({ runId }: { runId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("monitor");

  // 静态导出下不读 server searchParams，改为挂载后读一次 URL，保证 ?tab=snapshot 可分享、刷新不丢
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("tab");
    if (t === "snapshot") setTab("snapshot");
  }, []);

  const switchTab = (next: TabKey) => {
    setTab(next);
    const url = new URL(window.location.href);
    if (next === "snapshot") url.searchParams.set("tab", "snapshot");
    else url.searchParams.delete("tab");
    window.history.replaceState(null, "", url.toString());
  };

  // runId 通常是运行批次 ID；也允许传任务 ID（该任务暂无运行记录时）
  const run =
    TASK_RUNS.find((r) => r.id === runId) ?? TASK_RUNS.find((r) => r.taskId === runId);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#f8fafc" }}>
      <div
        style={{
          height: 56,
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 16,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => router.push("/task-modeling?view=taskTrack")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 6,
            cursor: "pointer",
            color: "#64748b",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={16} /> 返回任务追踪
        </button>
        <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#1e293b",
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {run?.name ?? "运行详情"}
          </h1>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
            生产任务管理 / 任务追踪 / {run?.id ?? runId}
          </p>
        </div>
        {run && (
          <button
            onClick={() => router.push(`/task-modeling/task/${run.taskId}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "7px 14px",
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              cursor: "pointer",
              color: "#475569",
              fontSize: 13,
            }}
          >
            所属任务 <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          gap: 2,
          padding: "0 24px",
          flexShrink: 0,
        }}
      >
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "11px 14px",
                background: "none",
                border: "none",
                borderBottom: `2px solid ${on ? C.primary : "transparent"}`,
                marginBottom: -1,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: on ? 600 : 400,
                color: on ? C.primary : C.sub,
              }}
            >
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        {tab === "monitor" ? <TaskTrackingPanel runId={run?.id ?? runId} /> : <PipelineSnapshot runId={run?.id ?? runId} />}
      </div>
    </div>
  );
}
