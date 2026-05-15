"use client";
import React, { useState, useEffect } from "react";
import {
  Brain, Plus, Play, Pause, RotateCcw, Trash2, Eye, Settings,
  ChevronRight, ChevronDown, Search, X, CheckCircle2, XCircle,
  Clock, AlertCircle, Server, Cpu, Zap, Layers, HardDrive,
  Database, FileText, BarChart3, LineChart, Activity, RefreshCw,
  Download, ArrowUpDown, Tag, Sparkles, ChevronUp, Link2, Package
} from "lucide-react";
import toast from "react-hot-toast";

// ============================================================
// Mock 数据
// ============================================================
interface TrainingTask {
  id: string;
  name: string;
  model: string;
  dataset: string;
  algorithm: string;
  precision: string;
  optimizer: string;
  status: "running" | "completed" | "failed" | "queued" | "paused";
  progress?: number;
  gpu_count: number;
  started_at: string;
  finished_at?: string;
  loss_current?: number;
  loss_initial?: number;
  eta?: string;
  logs?: string[];
}

const MOCK_TASKS: TrainingTask[] = [
  {
    id: "t1", name: "Qwen2.5-7B 指令微调", model: "Qwen2.5-7B-Instruct", dataset: "belle_subset_10k",
    algorithm: "SFT", precision: "BF16", optimizer: "AdamW + DoRA", status: "running", progress: 67,
    gpu_count: 4, started_at: "2025-04-18 09:30", loss_current: 1.23, loss_initial: 3.45, eta: "约2小时",
    logs: ["[09:30] Loading model Qwen2.5-7B-Instruct...", "[09:31] Loading dataset: belle_subset_10k (10240 samples)", "[09:32] Starting training with BF16 precision", "[09:35] Step 100/3000, loss: 2.87, lr: 2e-5", "[09:40] Step 200/3000, loss: 2.45, lr: 2e-5", "[09:45] Step 300/3000, loss: 1.98, lr: 2e-5", "[09:50] Step 400/3000, loss: 1.67, lr: 2e-5", "[09:55] Step 500/3000, loss: 1.43, lr: 2e-5", "[10:00] Step 600/3000, loss: 1.23, lr: 2e-5"],
  },
  {
    id: "t2", name: "DeepSeek-V2.5 增量预训练", model: "DeepSeek-V2.5", dataset: "corpus_pretrain_50B",
    algorithm: "Full-Pretrain", precision: "FP16", optimizer: "GaLore", status: "completed",
    gpu_count: 8, started_at: "2025-04-17 14:00", finished_at: "2025-04-18 06:23",
    loss_current: 0.87, loss_initial: 2.31,
  },
  {
    id: "t3", name: "LLaVA-1.6 多模态微调", model: "LLaVA-1.6-34B", dataset: "llava_instruct_8k",
    algorithm: "VLM-SFT", precision: "FP16", optimizer: "AdamW + LoRA", status: "failed",
    gpu_count: 4, started_at: "2025-04-17 08:00", finished_at: "2025-04-17 11:45",
    logs: ["[08:00] Loading model LLaVA-1.6-34B...", "[08:10] OOM Error: insufficient GPU memory", "[08:10] Training failed: CUDA OOM at step 234"],
  },
  {
    id: "t4", name: "Qwen2-VL 图文对齐训练", model: "Qwen2-VL-72B", dataset: "multimodal_align_5k",
    algorithm: "VLM-SFT", precision: "BF16", optimizer: "BAdam + DoRA", status: "queued",
    gpu_count: 8, started_at: "2025-04-18 15:00",
  },
  {
    id: "t5", name: "BGE-M3 Embedding微调", model: "BGE-M3", dataset: "text_retrieval_20k",
    algorithm: "Contrastive-SFT", precision: "INT8", optimizer: "AdamW", status: "completed",
    gpu_count: 2, started_at: "2025-04-16 10:00", finished_at: "2025-04-16 18:30",
    loss_current: 0.34, loss_initial: 1.82,
  },
  {
    id: "t6", name: "LLaMA-3 DPO偏好优化", model: "LLaMA-3-8B", dataset: "preference_pairs_5k",
    algorithm: "DPO", precision: "FP16", optimizer: "AdamW", status: "paused",
    gpu_count: 2, started_at: "2025-04-18 08:00", progress: 42,
    loss_current: 0.56, loss_initial: 1.12,
  },
];

const MODEL_OPTIONS = [
  "Qwen2.5-7B-Instruct", "Qwen2-VL-72B-Instruct", "DeepSeek-V2.5",
  "LLaMA-3-8B", "LLaVA-1.6-34B", "ChatGLM4-9B", "InternLM2.5-7B", "BGE-M3",
];
const DATASET_OPTIONS = [
  { label: "belle_subset_10k", desc: "中文开源指令数据集 (~10K)" },
  { label: "corpus_pretrain_50B", desc: "大规模预训练语料 (~50B tokens)" },
  { label: "llava_instruct_8k", desc: "多模态指令数据集 (~8K)" },
  { label: "multimodal_align_5k", desc: "图文对齐数据集 (~5K)" },
  { label: "text_retrieval_20k", desc: "文本检索数据集 (~20K)" },
  { label: "preference_pairs_5k", desc: "偏好对比数据集 (~5K)" },
];
const ALGORITHMS = [
  { value: "sft", label: "指令监督微调 (SFT)", desc: "标准指令微调，最常用" },
  { value: "full-pretrain", label: "增量预训练 (Full-Pretrain)", desc: "继续预训练，扩充知识" },
  { value: "vlm-sft", label: "多模态微调 (VLM-SFT)", desc: "视觉语言模型微调" },
  { value: "reward", label: "奖励模型训练 (Reward)", desc: "训练Reward模型" },
  { value: "ppo", label: "PPO强化学习", desc: "近端策略优化，强化学习训练" },
  { value: "dpo", label: "DPO直接偏好优化", desc: "直接优化偏好，无需RL" },
  { value: "kto", label: "KTO 知识蒸馏", desc: "基于知识的蒸馏优化" },
  { value: "orpo", label: "ORPO 赔率比优化", desc: "单一阶段偏好优化" },
  { value: "contrastive-sft", label: "对比学习微调", desc: "用于Embedding/检索模型" },
];
const PRECISIONS = [
  { value: "FP16", label: "FP16", desc: "半精度，速度快" },
  { value: "BF16", label: "BF16", desc: "BF16，稳定性好" },
  { value: "INT8", label: "INT8", desc: "量化，显存节省50%" },
  { value: "INT4", label: "INT4", desc: "超低精度，极致压缩" },
];
const OPTIMIZERS = [
  { value: "AdamW", label: "AdamW", desc: "标准优化器" },
  { value: "GaLore", label: "GaLore", desc: "梯度低秩投影，显存优化" },
  { value: "BAdam", label: "BAdam", desc: "块自适应优化，大模型高效" },
  { value: "DoRA", label: "DoRA", desc: "权重分解低秩适配" },
];
const FINE_TUNE_METHODS = [
  { value: "full", label: "全量微调", desc: "所有参数参与训练" },
  { value: "lora", label: "LoRA", desc: "低秩适配，显存占用低" },
  { value: "qlora", label: "QLoRA", desc: "量化+LoRA，极致效率" },
  { value: "dora", label: "DoRA", desc: "权重分解低秩适配" },
];
const DISTRIBUTED_MODES = [
  { value: "single", label: "单机单卡", icon: Cpu },
  { value: "single-multi", label: "单机多卡", icon: Layers },
  { value: "multi", label: "多机多卡", icon: Server },
];

// ============================================================
// 工具
// ============================================================
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string; label: string }> = {
    running: { bg: "#eff6ff", color: "#2563eb", label: "运行中" },
    completed: { bg: "#f0fdf4", color: "#16a34a", label: "已完成" },
    failed: { bg: "#fef2f2", color: "#dc2626", label: "失败" },
    queued: { bg: "#f8fafc", color: "#94a3b8", label: "排队中" },
    paused: { bg: "#fffbeb", color: "#d97706", label: "已暂停" },
  };
  const s = styles[status] || styles.queued;
  return <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}</span>;
}

// ============================================================
// Tab 1: 训练任务列表
// ============================================================
function TrainingListTab({ onCreate }: { onCreate: () => void }) {
  const [tasks, setTasks] = useState<TrainingTask[]>(MOCK_TASKS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState("全部");

  const filtered = filter === "全部" ? tasks : tasks.filter(t => t.status === filter);

  const toggleExpand = (id: string) => setExpanded(expanded === id ? null : id);

  const actionTask = (id: string, action: "pause" | "resume" | "stop" | "delete") => {
    if (action === "delete") {
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success("训练任务已删除");
    } else if (action === "pause") {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "paused" as const } : t));
      toast.success("训练已暂停");
    } else if (action === "resume") {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "running" as const } : t));
      toast.success("训练已恢复");
    } else if (action === "stop") {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "failed" as const, finished_at: new Date().toLocaleString() } : t));
      toast.success("训练已停止");
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>训练任务列表</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["全部", "running", "completed", "failed", "queued"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${filter === f ? "#f59e0b" : "#e2e8f0"}`, background: filter === f ? "#fffbeb" : "#fff", color: filter === f ? "#d97706" : "#64748b", fontSize: 11, cursor: "pointer", fontWeight: filter === f ? 600 : 400 }}>
                {f === "全部" ? "全部" : f === "running" ? "运行中" : f === "completed" ? "已完成" : f === "failed" ? "失败" : "排队"}
              </button>
            ))}
          </div>
          <button onClick={onCreate} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Plus size={13} />新建训练
          </button>
        </div>
      </div>

      {/* 任务卡片列表 */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(task => (
          <div key={task.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }}>
            {/* 主行 */}
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.name}</span>
                  <StatusBadge status={task.status} />
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748b" }}>
                  <span>模型: <strong style={{ color: "#334155" }}>{task.model}</strong></span>
                  <span>算法: <strong style={{ color: "#334155" }}>{task.algorithm}</strong></span>
                  <span>精度: <strong style={{ color: "#334155" }}>{task.precision}</strong></span>
                  <span><Cpu size={11} style={{ marginRight: 2 }} />{task.gpu_count} GPU</span>
                  <span><Clock size={11} style={{ marginRight: 2 }} />{task.started_at}</span>
                </div>
              </div>
              {task.progress !== undefined && task.status === "running" && (
                <div style={{ width: 120 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                    <span>进度</span><span style={{ fontWeight: 600, color: "#2563eb" }}>{task.progress}%</span>
                  </div>
                  <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${task.progress}%`, background: "#2563eb", borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                </div>
              )}
              {task.loss_current !== undefined && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>当前 Loss</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{task.loss_current}</div>
                  <div style={{ fontSize: 10, color: "#16a34a" }}>↓ {((task.loss_initial! - task.loss_current) / task.loss_initial! * 100).toFixed(1)}%</div>
                </div>
              )}
              <div style={{ display: "flex", gap: 4 }}>
                {task.status === "running" && (
                  <button onClick={() => actionTask(task.id, "pause")} title="暂停" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Pause size={12} color="#d97706" />
                  </button>
                )}
                {task.status === "paused" && (
                  <button onClick={() => actionTask(task.id, "resume")} title="恢复" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Play size={12} color="#16a34a" />
                  </button>
                )}
                {(task.status === "running" || task.status === "queued") && (
                  <button onClick={() => actionTask(task.id, "stop")} title="停止" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #fecaca", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <X size={12} color="#dc2626" />
                  </button>
                )}
                <button onClick={() => toggleExpand(task.id)} title="查看详情" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  {expanded === task.id ? <ChevronUp size={12} color="#64748b" /> : <ChevronDown size={12} color="#64748b" />}
                </button>
                {task.status !== "running" && (
                  <button onClick={() => actionTask(task.id, "delete")} title="删除" style={{ padding: "5px 8px", borderRadius: 5, border: "1px solid #fecaca", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Trash2 size={12} color="#dc2626" />
                  </button>
                )}
              </div>
            </div>

            {/* 展开：日志/指标 */}
            {expanded === task.id && (
              <div style={{ borderTop: "1px solid #f1f5f9", background: "#f8fafc", padding: "14px 16px" }}>
                {task.logs && task.logs.length > 0 ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>训练日志</div>
                    <pre style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", background: "#0f172a", color: "#e2e8f0", padding: 14, borderRadius: 6, maxHeight: 200, overflowY: "auto", margin: 0, lineHeight: 1.8 }}>
                      {task.logs.map((l, i) => <div key={i}>{l}</div>)}
                    </pre>
                  </>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
                    {[
                      { label: "初始 Loss", value: task.loss_initial?.toFixed(4) || "-" },
                      { label: "当前 Loss", value: task.loss_current?.toFixed(4) || "-" },
                      { label: "Loss 下降", value: task.loss_initial ? `${((task.loss_initial - (task.loss_current || 0)) / task.loss_initial * 100).toFixed(1)}%` : "-" },
                      { label: "GPU 利用率", value: task.status === "completed" ? "95%" : "78%" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "#fff", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                {task.eta && task.status === "running" && (
                  <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                    <Activity size={11} />预计剩余: <strong style={{ color: "#2563eb" }}>{task.eta}</strong>
                  </div>
                )}
                {task.finished_at && (
                  <div style={{ fontSize: 11, color: "#64748b" }}>结束时间: {task.finished_at}</div>
                )}
                {/* 断点2修复：训练完成 → 保存到模型仓库 */}
                {task.status === "completed" && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", gap: 8 }}>
                    <button
                      onClick={() => { toast.success(`模型「${task.name}」已保存到模型仓库`); }}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #16a34a", background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <Package size={12} />保存到模型仓库
                    </button>
                    <button
                      onClick={() => window.location.href = "/model-testing"}
                      style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                      <BarChart3 size={12} />进入模型测试 →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", fontSize: 13 }}>暂无训练任务</div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: 新建训练向导
// ============================================================
function CreateTrainingTab({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    name: "",
    model: "",
    dataset: "",
    algorithm: "sft",
    precision: "BF16",
    optimizer: "AdamW",
    fineTuneMethod: "lora",
    distributed: "single-multi",
    gpu_count: 4,
    learning_rate: "2e-5",
    batch_size: 8,
    epochs: 3,
    max_seq_len: 8192,
    warmup_ratio: 0.1,
    use_flash_attention: true,
    custom_args: "",
  });

  const update = (key: string, val: any) => setConfig(prev => ({ ...prev, [key]: val }));

  const submit = () => {
    if (!config.name) { toast.error("请填写训练任务名称"); return; }
    if (!config.model) { toast.error("请选择基础模型"); return; }
    if (!config.dataset) { toast.error("请选择数据集"); return; }
    toast.success(`训练任务「${config.name}」已提交，正在排队...`);
    onBack();
  };

  return (
    <div>
      {/* 步骤条 */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
        {["选择模型与数据集", "配置训练参数", "确认并启动"].map((s, i) => {
          const num = i + 1;
          const isDone = step > num;
          const isActive = step === num;
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: isDone ? "#16a34a" : isActive ? "#f59e0b" : "#e2e8f0", color: isDone || isActive ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                  {isDone ? <CheckCircle2 size={14} /> : num}
                </div>
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, color: isDone || isActive ? "#1e293b" : "#94a3b8" }}>{s}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: isDone ? "#bbf7d0" : "#e2e8f0", margin: "0 16px" }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* 任务名称 */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>训练任务名称 *</label>
        <input value={config.name} onChange={e => update("name", e.target.value)} placeholder="例如: Qwen2.5-7B 中文对话微调"
          style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* 步骤1: 模型与数据集 */}
      {step === 1 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>选择基础模型 *</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {MODEL_OPTIONS.map(m => (
                <div key={m} onClick={() => update("model", m)}
                  style={{ padding: "10px 12px", borderRadius: 7, border: `1px solid ${config.model === m ? "#f59e0b" : "#e2e8f0"}`, background: config.model === m ? "#fffbeb" : "#fff", cursor: "pointer", fontSize: 12, fontWeight: config.model === m ? 600 : 400, color: config.model === m ? "#d97706" : "#334155", transition: "all 0.1s", textAlign: "center" }}>
                  {m}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>选择训练数据集 *</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {DATASET_OPTIONS.map(d => (
                <div key={d.label} onClick={() => update("dataset", d.label)}
                  style={{ padding: "12px 16px", borderRadius: 7, border: `1px solid ${config.dataset === d.label ? "#f59e0b" : "#e2e8f0"}`, background: config.dataset === d.label ? "#fffbeb" : "#fff", cursor: "pointer", transition: "all 0.1s" }}>
                  <div style={{ fontSize: 13, fontWeight: config.dataset === d.label ? 600 : 400, color: config.dataset === d.label ? "#d97706" : "#1e293b" }}>{d.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{d.desc}</div>
                </div>
              ))}
            </div>

            {/* ====== 断点1修复：导入数据集管理中的数据集 ====== */}
            <DatasetPicker
              selected={config.dataset}
              onSelect={(ds) => update("dataset", ds)}
            />
          </div>

          <div style={{ marginTop: 20 }}>
            <button onClick={() => setStep(2)} disabled={!config.model || !config.dataset}
              style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: !config.model || !config.dataset ? "#e2e8f0" : "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: !config.model || !config.dataset ? "not-allowed" : "pointer" }}>
              下一步: 配置参数 →
            </button>
          </div>
        </div>
      )}

      {/* 步骤2: 训练参数 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#f59e0b" /> 训练算法
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {ALGORITHMS.map(a => (
                <div key={a.value} onClick={() => update("algorithm", a.value)}
                  style={{ padding: "10px 12px", borderRadius: 7, border: `1px solid ${config.algorithm === a.value ? "#f59e0b" : "#e2e8f0"}`, background: config.algorithm === a.value ? "#fffbeb" : "#fff", cursor: "pointer", transition: "all 0.1s" }}>
                  <div style={{ fontSize: 12, fontWeight: config.algorithm === a.value ? 600 : 400, color: config.algorithm === a.value ? "#d97706" : "#1e293b" }}>{a.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>运算精度</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {PRECISIONS.map(p => (
                    <div key={p.value} onClick={() => update("precision", p.value)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, border: `1px solid ${config.precision === p.value ? "#f59e0b" : "#e2e8f0"}`, background: config.precision === p.value ? "#fffbeb" : "#fff", cursor: "pointer" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${config.precision === p.value ? "#f59e0b" : "#cbd5e1"}`, background: config.precision === p.value ? "#f59e0b" : "transparent" }} />
                      <span style={{ fontSize: 12, color: config.precision === p.value ? "#d97706" : "#334155", fontWeight: config.precision === p.value ? 600 : 400 }}>{p.label}</span>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{p.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>优化算法</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {OPTIMIZERS.map(o => (
                    <div key={o.value} onClick={() => update("optimizer", o.value)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, border: `1px solid ${config.optimizer === o.value ? "#f59e0b" : "#e2e8f0"}`, background: config.optimizer === o.value ? "#fffbeb" : "#fff", cursor: "pointer" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${config.optimizer === o.value ? "#f59e0b" : "#cbd5e1"}`, background: config.optimizer === o.value ? "#f59e0b" : "transparent" }} />
                      <span style={{ fontSize: 12, color: config.optimizer === o.value ? "#d97706" : "#334155", fontWeight: config.optimizer === o.value ? 600 : 400 }}>{o.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>微调方式</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {FINE_TUNE_METHODS.map(m => (
                    <div key={m.value} onClick={() => update("fineTuneMethod", m.value)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 5, border: `1px solid ${config.fineTuneMethod === m.value ? "#f59e0b" : "#e2e8f0"}`, background: config.fineTuneMethod === m.value ? "#fffbeb" : "#fff", cursor: "pointer" }}>
                      <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${config.fineTuneMethod === m.value ? "#f59e0b" : "#cbd5e1"}`, background: config.fineTuneMethod === m.value ? "#f59e0b" : "transparent" }} />
                      <span style={{ fontSize: 12, color: config.fineTuneMethod === m.value ? "#d97706" : "#334155", fontWeight: config.fineTuneMethod === m.value ? 600 : 400 }}>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 分布式训练 */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Server size={14} color="#f59e0b" /> 分布式训练配置
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              {DISTRIBUTED_MODES.map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.value} onClick={() => update("distributed", m.value)}
                    style={{ flex: 1, padding: "12px", borderRadius: 7, border: `1px solid ${config.distributed === m.value ? "#f59e0b" : "#e2e8f0"}`, background: config.distributed === m.value ? "#fffbeb" : "#fff", cursor: "pointer", textAlign: "center" }}>
                    <Icon size={20} color={config.distributed === m.value ? "#d97706" : "#94a3b8"} style={{ display: "block", margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 12, fontWeight: config.distributed === m.value ? 600 : 400, color: config.distributed === m.value ? "#d97706" : "#334155" }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "GPU数量", key: "gpu_count", type: "number", min: 1, max: 64 },
                { label: "学习率", key: "learning_rate", type: "text", placeholder: "2e-5" },
                { label: "Batch Size", key: "batch_size", type: "number", min: 1 },
                { label: "训练轮次", key: "epochs", type: "number", min: 1 },
                { label: "最大序列长度", key: "max_seq_len", type: "number", min: 128 },
                { label: "Warmup比例", key: "warmup_ratio", type: "number", min: 0, max: 1, step: 0.05 },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 4 }}>{f.label}</label>
                  <input type={f.type} value={(config as any)[f.key]} step={f.step} min={f.min} max={f.max}
                    onChange={e => update(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <div onClick={() => update("use_flash_attention", !config.use_flash_attention)}
                style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 36, height: 20, borderRadius: 10, background: config.use_flash_attention ? "#f59e0b" : "#e2e8f0", padding: 2, display: "flex", alignItems: "center", justifyContent: config.use_flash_attention ? "flex-end" : "flex-start", transition: "all 0.2s" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff" }} />
                </div>
                <span style={{ fontSize: 12, color: "#334155" }}>启用 FlashAttention-2 加速</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} style={{ padding: "9px 20px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
            <button onClick={() => setStep(3)} style={{ padding: "9px 20px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>下一步: 确认启动 →</button>
          </div>
        </div>
      )}

      {/* 步骤3: 确认 */}
      {step === 3 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 20px 0" }}>确认训练配置</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "任务名称", value: config.name || "-" },
              { label: "基础模型", value: config.model || "-" },
              { label: "训练数据集", value: config.dataset || "-" },
              { label: "训练算法", value: ALGORITHMS.find(a => a.value === config.algorithm)?.label || "-" },
              { label: "运算精度", value: config.precision },
              { label: "优化算法", value: config.optimizer },
              { label: "微调方式", value: FINE_TUNE_METHODS.find(m => m.value === config.fineTuneMethod)?.label || "-" },
              { label: "GPU数量", value: `${config.gpu_count} 卡` },
              { label: "学习率", value: config.learning_rate },
              { label: "Batch Size", value: String(config.batch_size) },
              { label: "训练轮次", value: `${config.epochs} 轮` },
              { label: "FlashAttention-2", value: config.use_flash_attention ? "启用" : "禁用" },
            ].map(item => (
              <div key={item.label} style={{ padding: "10px 14px", background: "#f8fafc", borderRadius: 7 }}>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginTop: 2 }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => setStep(2)} style={{ flex: 1, padding: "10px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← 修改配置</button>
            <button onClick={submit} style={{ flex: 2, padding: "10px", borderRadius: 7, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Play size={14} />确认并启动训练
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab 3: 实验监控
// ============================================================
function MonitorTab() {
  const lossData = [
    { step: 0, value: 3.45 }, { step: 100, value: 2.87 }, { step: 200, value: 2.45 },
    { step: 300, value: 1.98 }, { step: 400, value: 1.67 }, { step: 500, value: 1.43 },
    { step: 600, value: 1.23 }, { step: 700, value: 1.08 }, { step: 800, value: 0.96 },
    { step: 900, value: 0.87 }, { step: 1000, value: 0.81 },
  ];
  const maxLoss = Math.max(...lossData.map(d => d.value));
  const w = 700, h = 180;
  const pts = lossData.map((d, i) => ({ x: (i / (lossData.length - 1)) * w, y: h - (d.value / maxLoss) * h }));

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>实验监控面板</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "当前步数", value: "600", icon: Activity, color: "#2563eb" },
          { label: "当前 Loss", value: "1.23", icon: LineChart, color: "#dc2626" },
          { label: "学习率", value: "2e-5", icon: Zap, color: "#f59e0b" },
          { label: "GPU利用率", value: "94%", icon: Cpu, color: "#16a34a" },
        ].map(m => (
          <div key={m.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <m.icon size={14} color={m.color} />
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{m.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1e293b" }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Loss 曲线</div>
        <svg width="100%" viewBox={`0 0 ${w} ${h + 30}`} style={{ overflow: "visible" }}>
          {pts.map((p, i) => {
            const next = pts[i + 1];
            return next ? (
              <line key={i} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="#2563eb" strokeWidth="2" />
            ) : null;
          })}
          {pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#2563eb" />
          ))}
          <text x={0} y={h + 20} fill="#94a3b8" fontSize="10">Step 0</text>
          <text x={w} y={h + 20} fill="#94a3b8" fontSize="10" textAnchor="end">Step 1000</text>
          <text x={0} y={12} fill="#94a3b8" fontSize="10">{maxLoss.toFixed(2)}</text>
          <text x={0} y={h} fill="#94a3b8" fontSize="10">0</text>
        </svg>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16, fontSize: 11, color: "#94a3b8" }}>
          <span>当前: <strong style={{ color: "#dc2626" }}>1.23</strong></span>
          <span>最低: <strong style={{ color: "#16a34a" }}>0.81</strong></span>
          <span>下降: <strong style={{ color: "#2563eb" }}>64.3%</strong></span>
          <span>速度: <strong style={{ color: "#f59e0b" }}>~120 steps/min</strong></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function ModelTrainingPage() {
  const [tab, setTab] = useState<"list" | "create" | "monitor">("list");

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型训练</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>训练任务管理 · 分布式训练 · 实验监控</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0" }}>
          {[
            { key: "list" as const, label: "训练任务", icon: Database },
            { key: "create" as const, label: "新建训练", icon: Plus },
            { key: "monitor" as const, label: "实验监控", icon: BarChart3 },
          ].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "none", background: "transparent", borderBottom: `2px solid ${isActive ? "#f59e0b" : "transparent"}`, color: isActive ? "#f59e0b" : "#64748b", fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer", marginBottom: -2 }}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ padding: "20px 32px 32px" }}>
        {tab === "list" && <TrainingListTab onCreate={() => setTab("create")} />}
        {tab === "create" && <CreateTrainingTab onBack={() => setTab("list")} />}
        {tab === "monitor" && <MonitorTab />}
      </div>
    </main>
  );
}

// ============================================================
// 断点1修复：数据集管理导入选择器
// ============================================================
function DatasetPicker({ selected, onSelect }: { selected: string; onSelect: (ds: string) => void }) {
  const [open, setOpen] = useState(false);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (open && datasets.length === 0) {
      try {
        const raw = localStorage.getItem("taskforge_datasets");
        if (raw) {
          setDatasets(JSON.parse(raw));
        }
      } catch { /* ignore */ }
    }
  }, [open, datasets.length]);

  const filtered = filter
    ? datasets.filter((d: any) => d.name?.includes(filter) || d.type?.includes(filter))
    : datasets;

  return (
    <>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px dashed #e2e8f0" }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 7,
            border: "1px solid #2563eb", background: "#eff6ff",
            color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
          <Link2 size={13} />从数据集管理导入 →
        </button>
        {selected && !DATASET_OPTIONS.some(d => d.label === selected) && (
          <span style={{ marginLeft: 10, fontSize: 12, color: "#16a34a" }}>
            ✓ 已选择：<strong>{selected}</strong>
          </span>
        )}
      </div>

      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "rgba(0,0,0,0.4)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: "#fff", borderRadius: 14,
            width: 600, maxHeight: "70vh",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            display: "flex", flexDirection: "column",
          }}>
            {/* 标题栏 */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Database size={18} color="#2563eb" />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>从数据集管理导入</span>
              </div>
              <button onClick={() => setOpen(false)} style={{ padding: 6, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", color: "#64748b", fontSize: 18, lineHeight: 1 }}>×</button>
            </div>
            {/* 搜索 */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ position: "relative" }}>
                <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="搜索数据集名称"
                  style={{ width: "100%", height: 36, paddingLeft: 34, paddingRight: 10, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
            {/* 列表 */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8", fontSize: 13 }}>
                  {datasets.length === 0 ? "数据集管理中暂无数据集" : "无匹配结果"}
                </div>
              ) : filtered.map((d: any) => (
                <div key={d.id} onClick={() => { onSelect(d.name || d.id); setOpen(false); }}
                  style={{
                    padding: "10px 14px", borderRadius: 8, marginBottom: 4, cursor: "pointer",
                    border: `1px solid ${(d.name || d.id) === selected ? "#2563eb" : "transparent"}`,
                    background: (d.name || d.id) === selected ? "#eff6ff" : "#f8fafc",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={e => { if ((d.name || d.id) !== selected) e.currentTarget.style.background = "#f1f5f9"; }}
                  onMouseLeave={e => { if ((d.name || d.id) !== selected) e.currentTarget.style.background = "#f8fafc"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{d.name || d.id}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{d.type || d.category || "—"} · {d.count || d.item_count || d.itemCount || 0} 条 · {d.version || "v1.0"}</div>
                    </div>
                    {d.status && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: d.status === "已发布" ? "#f0fdf4" : "#f8fafc", color: d.status === "已发布" ? "#16a34a" : "#94a3b8", fontWeight: 600 }}>
                        {d.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
