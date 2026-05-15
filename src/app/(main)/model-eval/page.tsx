"use client";
import React, { useState } from "react";
import {
  Gauge, Plus, Search, Settings, Play, Pause, Trash2, Eye, Download,
  ChevronRight, ChevronDown, CheckCircle2, XCircle, Clock, RefreshCw,
  FileText, Database, Cpu, BarChart3, LineChart, Activity, ArrowRight,
  Tag, Layers, Beaker
} from "lucide-react";
import toast from "react-hot-toast";

interface EvalJob {
  id: string;
  name: string;
  model: string;
  dataset: string;
  source: string;
  task_type: string;
  status: "pending" | "running" | "completed" | "failed";
  score?: number;
  progress?: number;
  started_at: string;
  finished_at?: string;
  log?: string;
}

const MOCK_JOBS: EvalJob[] = [
  { id: "j1", name: "Qwen2.5-7B 中文理解评测", model: "Qwen2.5-7B-Instruct", dataset: "C-Eval", source: "Huggingface", task_type: "选择题", status: "running", progress: 68, started_at: "2025-04-18 10:00", log: "[10:00] Loading model...\n[10:01] Loading dataset C-Eval (test set, 1242 samples)\n[10:02] Running inference on test set...\n[10:05] Completed 800/1242 samples\n[10:07] Completed 1000/1242 samples\n[10:09] Computing metrics..." },
  { id: "j2", name: "DeepSeek-V2.5 代码生成评测", model: "DeepSeek-V2.5", dataset: "HumanEval", source: "自定义", task_type: "代码生成", status: "completed", score: 89.4, started_at: "2025-04-18 08:00", finished_at: "2025-04-18 09:30" },
  { id: "j3", name: "BGE-M3 检索能力评测", model: "BGE-M3", dataset: "BEIR", source: "Modelscope", task_type: "段落检索", status: "completed", score: 0.612, started_at: "2025-04-17 16:00", finished_at: "2025-04-17 17:00" },
  { id: "j4", name: "LLaMA-3 问答任务评测", model: "LLaMA-3-8B", dataset: "SQuAD", source: "Huggingface", task_type: "问答", status: "completed", score: 83.2, started_at: "2025-04-17 10:00", finished_at: "2025-04-17 11:15" },
  { id: "j5", name: "Qwen-VL 视觉问答评测", model: "Qwen2-VL-72B", dataset: "VQAv2", source: "Huggingface", task_type: "视觉问答", status: "pending", started_at: "2025-04-18 14:00" },
];

const TASK_TYPES = [
  { value: "选择题", label: "选择题", desc: "判断题、选择题分类" },
  { value: "问答", label: "问答", desc: "阅读理解、问答" },
  { value: "翻译", label: "翻译", desc: "文本翻译、伪代码生成" },
  { value: "摘要", label: "摘要", desc: "文本摘要任务" },
  { value: "代码生成", label: "代码生成", desc: "代码补全、生成" },
  { value: "打分", label: "无标准答案打分", desc: "开放式质量评估" },
];

export default function ModelEvalPage() {
  const [tab, setTab] = useState<"tasks" | "config" | "results">("tasks");
  const [jobs, setJobs] = useState<EvalJob[]>(MOCK_JOBS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState(1);
  const [config, setConfig] = useState({ name: "", model: "", dataset: "", source: "Huggingface", task_type: "选择题", batch_size: 16, parallel: true });
  const [showCreate, setShowCreate] = useState(false);

  const updateConfig = (k: string, v: any) => setConfig(prev => ({ ...prev, [k]: v }));

  const submitJob = () => {
    if (!config.name || !config.model || !config.dataset) { toast.error("请填写完整配置"); return; }
    const job: EvalJob = { id: "j" + Date.now(), ...config, status: "pending", started_at: new Date().toLocaleString() };
    setJobs(prev => [job, ...prev]);
    setShowCreate(false);
    setCreateStep(1);
    setConfig({ name: "", model: "", dataset: "", source: "Huggingface", task_type: "选择题", batch_size: 16, parallel: true });
    toast.success("评测任务已提交");
  };

  const scoreColor = (score?: number) => {
    if (score === undefined) return "#94a3b8";
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#d97706";
    return "#dc2626";
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Gauge size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>评测管理</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>评测任务配置 · 推理评估 · 可视化结果</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
          {[{ key: "tasks", label: "评估任务", icon: FileText }, { key: "config", label: "评估策略", icon: Layers }, { key: "results", label: "历史结果", icon: BarChart3 }].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "none", background: "transparent", borderBottom: `2px solid ${isActive ? "#f59e0b" : "transparent"}`, color: isActive ? "#f59e0b" : "#64748b", fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer", marginBottom: -2 }}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
          <div style={{ marginLeft: "auto", marginBottom: 4 }}>
            <button onClick={() => { setShowCreate(true); setTab("tasks"); }} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={13} />新建评测
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "0 32px 32px" }}>
        {tab === "tasks" && (
          <div>
            {!showCreate && <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {jobs.map(job => (
                <div key={job.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{job.name}</span>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: job.status === "completed" ? "#f0fdf4" : job.status === "running" ? "#eff6ff" : job.status === "pending" ? "#f8fafc" : "#fef2f2", color: job.status === "completed" ? "#16a34a" : job.status === "running" ? "#2563eb" : job.status === "pending" ? "#94a3b8" : "#dc2626", fontWeight: 600 }}>
                          {job.status === "completed" ? "已完成" : job.status === "running" ? "运行中" : job.status === "pending" ? "排队中" : "失败"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748b" }}>
                        <span>模型: <strong style={{ color: "#334155" }}>{job.model}</strong></span>
                        <span>数据集: <strong style={{ color: "#334155" }}>{job.dataset}</strong></span>
                        <span>来源: <strong style={{ color: "#334155" }}>{job.source}</strong></span>
                        <span>任务类型: <strong style={{ color: "#334155" }}>{job.task_type}</strong></span>
                        <span><Clock size={11} style={{ marginRight: 2 }} />{job.started_at}</span>
                      </div>
                    </div>
                    {job.progress !== undefined && job.status === "running" && (
                      <div style={{ width: 120 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                          <span>进度</span><span style={{ fontWeight: 600, color: "#2563eb" }}>{job.progress}%</span>
                        </div>
                        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                          <div style={{ height: "100%", width: `${job.progress}%`, background: "#2563eb", borderRadius: 2 }} />
                        </div>
                      </div>
                    )}
                    {job.score !== undefined && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: scoreColor(job.score) }}>{job.score}{job.task_type === "段落检索" ? "" : "%"}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>评测得分</div>
                      </div>
                    )}
                    <button onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                      style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
                      <ChevronDown size={12} color="#64748b" style={{ transform: expanded === job.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>
                  {expanded === job.id && job.log && (
                    <div style={{ borderTop: "1px solid #f1f5f9", background: "#0f172a", padding: "14px 16px" }}>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>实时日志</div>
                      <pre style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "monospace", margin: 0, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{job.log}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>}

            {showCreate && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                  {["选择模型", "配置数据集", "确认启动"].map((s, i) => {
                    const n = i + 1;
                    const isDone = createStep > n;
                    const isActive = createStep === n;
                    return (
                      <React.Fragment key={s}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: isDone ? "#16a34a" : isActive ? "#f59e0b" : "#e2e8f0", color: isDone || isActive ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                            {isDone ? "✓" : n}
                          </div>
                          <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isDone || isActive ? "#1e293b" : "#94a3b8" }}>{s}</span>
                        </div>
                        {i < 2 && <div style={{ flex: 1, height: 2, background: isDone ? "#bbf7d0" : "#e2e8f0", margin: "0 12px" }} />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {createStep === 1 && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>评测任务名称 *</label>
                      <input value={config.name} onChange={e => updateConfig("name", e.target.value)} placeholder="例如: Qwen2.5 中文理解评测"
                        style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>选择模型 *</label>
                      <select value={config.model} onChange={e => updateConfig("model", e.target.value)}
                        style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff" }}>
                        <option value="">请选择模型</option>
                        <option>Qwen2.5-7B-Instruct</option><option>DeepSeek-V2.5</option><option>LLaMA-3-8B</option>
                        <option>Qwen2-VL-72B</option><option>BGE-M3</option>
                      </select>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>任务类型</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                        {TASK_TYPES.map(t => (
                          <div key={t.value} onClick={() => updateConfig("task_type", t.value)}
                            style={{ padding: "10px 12px", borderRadius: 7, border: `1px solid ${config.task_type === t.value ? "#f59e0b" : "#e2e8f0"}`, background: config.task_type === t.value ? "#fffbeb" : "#fff", cursor: "pointer" }}>
                            <div style={{ fontSize: 12, fontWeight: config.task_type === t.value ? 600 : 400, color: config.task_type === t.value ? "#d97706" : "#1e293b" }}>{t.label}</div>
                            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{t.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => { if (!config.name || !config.model) { toast.error("请填写名称并选择模型"); return; } setCreateStep(2); }}
                      style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>下一步 →</button>
                  </div>
                )}
                {createStep === 2 && (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>数据集名称 *</label>
                      <input value={config.dataset} onChange={e => updateConfig("dataset", e.target.value)} placeholder="例如: C-Eval, GSM8K, HumanEval"
                        style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>数据来源</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["Huggingface", "Modelscope", "自定义"].map(s => (
                          <button key={s} onClick={() => updateConfig("source", s)}
                            style={{ padding: "7px 14px", borderRadius: 6, border: `1px solid ${config.source === s ? "#f59e0b" : "#e2e8f0"}`, background: config.source === s ? "#fffbeb" : "#fff", color: config.source === s ? "#d97706" : "#64748b", fontSize: 12, fontWeight: config.source === s ? 600 : 400, cursor: "pointer" }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setCreateStep(1)} style={{ padding: "9px 20px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
                      <button onClick={() => { if (!config.dataset) { toast.error("请输入数据集名称"); return; } setCreateStep(3); }} style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>下一步 →</button>
                    </div>
                  </div>
                )}
                {createStep === 3 && (
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>确认评测配置</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                      {[
                        { label: "任务名称", value: config.name }, { label: "评测模型", value: config.model },
                        { label: "数据集", value: config.dataset }, { label: "数据来源", value: config.source },
                        { label: "任务类型", value: config.task_type },
                      ].map(item => (
                        <div key={item.label} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 7 }}>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginTop: 2 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setCreateStep(2)} style={{ flex: 1, padding: "9px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← 修改</button>
                      <button onClick={submitJob} style={{ flex: 2, padding: "9px", borderRadius: 7, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        <Play size={14} />确认并启动评测
                      </button>
                    </div>
                  </div>
                )}
                <button onClick={() => { setShowCreate(false); setCreateStep(1); }} style={{ position: "absolute", top: 16, right: 16, padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>× 关闭</button>
              </div>
            )}
          </div>
        )}

        {tab === "config" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>评估策略配置</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {TASK_TYPES.map(t => (
                <div key={t.value} style={{ padding: 16, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 12 }}>{t.desc}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ color: "#64748b" }}>评测指标</span>
                      <span style={{ color: "#334155", fontWeight: 600 }}>{t.value === "选择题" ? "Accuracy" : t.value === "代码生成" ? "Pass@1" : t.value === "段落检索" ? "NDCG@10" : "F1 Score"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ color: "#64748b" }}>状态</span>
                      <span style={{ padding: "1px 6px", borderRadius: 3, background: "#f0fdf4", color: "#16a34a", fontSize: 10, fontWeight: 600 }}>已启用</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "results" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {jobs.filter(j => j.score !== undefined).map(job => (
              <div key={job.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{job.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{job.finished_at || job.started_at} · {job.task_type}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {/* 断点3修复：评测完成 → 进入模型测试 */}
                    <button
                      onClick={() => window.location.href = "/model-testing"}
                      style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #2563eb", background: "#eff6ff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: "#2563eb", fontWeight: 600 }}>
                      <Beaker size={11} />进入模型测试 →
                    </button>
                    <button style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                      <Download size={11} color="#64748b" />导出报告
                    </button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                  {[
                    { label: "综合得分", value: job.score + (job.task_type === "段落检索" ? "" : "%"), color: "#1e293b" },
                    { label: "任务类型", value: job.task_type, color: "#64748b" },
                    { label: "评测时长", value: "约90分钟", color: "#64748b" },
                    { label: "样本数量", value: "1,242", color: "#64748b" },
                    { label: "模型来源", value: job.source, color: "#64748b" },
                  ].map(m => (
                    <div key={m.label} style={{ background: "#f8fafc", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: m.color }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
