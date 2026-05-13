"use client";
import React, { useState } from "react";
import {
  CheckCircle2, XCircle, Clock, AlertCircle, Play, Database,
  Cpu, Search, Download, RefreshCw, BarChart3, TrendingUp,
  TrendingDown, Target, ChevronDown, Eye
} from "lucide-react";
import toast from "react-hot-toast";

interface EvalTask {
  id: string;
  name: string;
  model: string;
  dataset: string;
  metric: string;
  score: number;
  previous_score?: number;
  status: "running" | "completed" | "failed";
  started_at: string;
  finished_at?: string;
  details?: Record<string, number>;
}

const MOCK_EVAL_TASKS: EvalTask[] = [
  {
    id: "e1", name: "Qwen2.5-7B MMLU评测", model: "Qwen2.5-7B-Instruct", dataset: "MMLU",
    metric: "Accuracy", score: 74.2, previous_score: 72.8, status: "completed", started_at: "2025-04-18 10:00", finished_at: "2025-04-18 10:45",
    details: { "MMLU": 74.2, "ARC": 81.3, "HellaSwag": 78.5, "TruthfulQA": 65.1 },
  },
  {
    id: "e2", name: "DeepSeek-V2.5 数学评测", model: "DeepSeek-V2.5", dataset: "GSM8K",
    metric: "Accuracy", score: 89.4, previous_score: 86.2, status: "completed", started_at: "2025-04-17 14:00", finished_at: "2025-04-17 15:20",
    details: { "GSM8K": 89.4, "MATH": 76.3, "GSM-Hard": 62.1 },
  },
  {
    id: "e3", name: "LLaMA-3 中文理解评测", model: "LLaMA-3-8B", dataset: "C-Eval",
    metric: "Accuracy", score: 58.7, previous_score: 55.3, status: "completed", started_at: "2025-04-17 09:00", finished_at: "2025-04-17 10:10",
    details: { "C-Eval": 58.7, "CMMLU": 61.2 },
  },
  {
    id: "e4", name: "BGE-M3 检索评测", model: "BGE-M3", dataset: "BEIR",
    metric: "NDCG@10", score: 0.612, previous_score: 0.598, status: "completed", started_at: "2025-04-16 16:00", finished_at: "2025-04-16 17:30",
    details: { "NDCG@10": 0.612, "MRR@10": 0.587, "Recall@10": 0.734 },
  },
  {
    id: "e5", name: "Qwen2-VL 视觉问答评测", model: "Qwen2-VL-72B", dataset: "VQAv2",
    metric: "Accuracy", score: 84.1, status: "running", started_at: "2025-04-18 11:00",
  },
  {
    id: "e6", name: "ChatGLM4 代码生成评测", model: "ChatGLM4-9B", dataset: "HumanEval",
    metric: "Pass@1", score: 51.3, previous_score: 48.7, status: "completed", started_at: "2025-04-15 10:00", finished_at: "2025-04-15 11:00",
    details: { "HumanEval": 51.3, "MBPP": 55.8, "MultiPL-E": 43.2 },
  },
];

const METRIC_ICONS: Record<string, string> = {
  "Accuracy": "#2563eb", "NDCG@10": "#7c3aed", "MRR@10": "#059669", "Recall@10": "#d97706", "Pass@1": "#dc2626",
};

export default function ModelEvaluationPage() {
  const [tasks, setTasks] = useState<EvalTask[]>(MOCK_EVAL_TASKS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState("");
  const [detailTask, setDetailTask] = useState<EvalTask | null>(null);

  const filtered = tasks.filter(t => !modelFilter || t.model.includes(modelFilter));

  const rerunEval = (task: EvalTask) => {
    const newTask: EvalTask = { ...task, id: task.id + "-r", name: task.name + " (重测)", status: "running" as const, started_at: new Date().toLocaleString() };
    setTasks(prev => [newTask, ...prev]);
    toast.success("评估任务已重新提交");
  };

  const summaryCards = [
    { label: "已完成评估", value: tasks.filter(t => t.status === "completed").length, color: "#16a34a", bg: "#f0fdf4" },
    { label: "评估中", value: tasks.filter(t => t.status === "running").length, color: "#2563eb", bg: "#eff6ff" },
    { label: "平均得分", value: (tasks.filter(t => t.status === "completed").reduce((s, t) => s + t.score, 0) / Math.max(tasks.filter(t => t.status === "completed").length, 1)).toFixed(1) + "%", color: "#7c3aed", bg: "#fdf4ff" },
    { label: "环比提升", value: "+3.2%", color: "#059669", bg: "#f0fdf4" },
  ];

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart3 size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型评估</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>性能验证 · 数据集评估 · 指标对比</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {summaryCards.map(c => (
            <div key={c.label} style={{ background: c.bg, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: c.color, fontWeight: 600, marginBottom: 4 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 260px" }}>
              <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input value={modelFilter} onChange={e => setModelFilter(e.target.value)} placeholder="搜索模型名称"
                style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 10, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
            </div>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>共 {filtered.length} 条评估记录</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(task => (
            <div key={task.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.name}</span>
                    <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: task.status === "completed" ? "#f0fdf4" : task.status === "running" ? "#eff6ff" : "#fef2f2", color: task.status === "completed" ? "#16a34a" : task.status === "running" ? "#2563eb" : "#dc2626", fontWeight: 600 }}>
                      {task.status === "completed" ? "已完成" : task.status === "running" ? "评估中" : "失败"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748b" }}>
                    <span>模型: <strong style={{ color: "#334155" }}>{task.model}</strong></span>
                    <span>数据集: <strong style={{ color: "#334155" }}>{task.dataset}</strong></span>
                    <span>指标: <strong style={{ color: "#334155" }}>{task.metric}</strong></span>
                    <span><Clock size={11} style={{ marginRight: 2 }} />{task.started_at}</span>
                  </div>
                </div>
                {task.status === "completed" && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: METRIC_ICONS[task.metric] || "#1e293b" }}>{task.score}{task.metric.includes("NDCG") || task.metric.includes("MRR") || task.metric.includes("Recall") ? "" : "%"}</div>
                    {task.previous_score !== undefined && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 3, fontSize: 11, color: task.score > task.previous_score ? "#16a34a" : "#dc2626" }}>
                        {task.score > task.previous_score ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {task.score > task.previous_score ? "+" : ""}{(task.score - task.previous_score).toFixed(1)} vs 上次
                      </div>
                    )}
                  </div>
                )}
                {task.status === "running" && (
                  <div style={{ width: 120 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <RefreshCw size={14} color="#2563eb" style={{ animation: "spin 1s linear infinite" }} />
                      <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 600 }}>评估中...</span>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 4 }}>
                  {task.status === "completed" && (
                    <>
                      <button onClick={() => rerunEval(task)} title="重新评估" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
                        <RefreshCw size={12} color="#64748b" />
                      </button>
                      <button onClick={() => setDetailTask(task)} title="查看详情" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
                        <Eye size={12} color="#64748b" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setExpanded(expanded === task.id ? null : task.id)} title="展开" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
                    <ChevronDown size={12} color="#64748b" style={{ transform: expanded === task.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                </div>
              </div>
              {expanded === task.id && task.details && (
                <div style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>各子指标得分</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
                    {Object.entries(task.details).map(([key, val]) => (
                      <div key={key} style={{ background: "#fff", borderRadius: 6, padding: "8px 12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{val}{String(val).includes(".") ? "" : "%"}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
