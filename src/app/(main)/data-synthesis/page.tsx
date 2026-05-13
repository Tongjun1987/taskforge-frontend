"use client";
import React, { useState } from "react";
import {
  Plus, Search, Cpu, X, Play, Trash2, Eye, RefreshCw,
  ChevronRight, ChevronDown, Image, FileText, Video, Sparkles,
  Layers, Zap, Settings, Globe, KeyRound, ArrowRight, CheckCircle2,
  AlertCircle, Clock, Loader2, Download, Upload, ExternalLink,
  BarChart3, ToggleLeft, ToggleRight, Bot, Wand2, Server,
  Activity, Database, Code, Link as LinkIcon, Pencil, Filter
} from "lucide-react";

type SynthesisType = "image" | "text";
type Provider = "dalle" | "midjourney" | "stable-diffusion" | "gpt-vision" | "claude-vision" | "qwen-vl" | "llama-3" | "qwen" | "baichuan";
type TaskStatus = "idle" | "generating" | "completed" | "failed";

interface SynthesisTask {
  id: string;
  name: string;
  type: SynthesisType;
  provider: Provider;
  status: TaskStatus;
  progress: number;
  prompt: string;
  target_count: number;
  generated_count: number;
  created_at: string;
  duration?: string;
  api_key_config?: boolean;
}

interface ApiConfig {
  id: string;
  name: string;
  provider: Provider;
  endpoint: string;
  api_key: string;
  model: string;
  enabled: boolean;
  max_rpm: number;
  cost_today: number;
}

const PROVIDERS: Record<Provider, { label: string; color: string; desc: string; icon: React.ReactNode; type: SynthesisType[] }> = {
  "dalle": { label: "DALL-E 3", color: "#10b981", desc: "OpenAI 图像生成模型，支持高质量图像创作", icon: <Image size={16} />, type: ["image"] },
  "midjourney": { label: "Midjourney", color: "#6366f1", desc: "艺术风格图像生成，支持多种风格控制", icon: <Sparkles size={16} />, type: ["image"] },
  "stable-diffusion": { label: "Stable Diffusion", color: "#ec4899", desc: "开源图像生成，支持本地部署和微调", icon: <Layers size={16} />, type: ["image"] },
  "gpt-vision": { label: "GPT-4V", color: "#10b981", desc: "OpenAI 多模态模型，支持图像理解与描述", icon: <Bot size={16} />, type: ["text"] },
  "claude-vision": { label: "Claude Vision", color: "#f59e0b", desc: "Anthropic 多模态模型，高精度图像分析", icon: <Bot size={16} />, type: ["text"] },
  "qwen-vl": { label: "Qwen-VL", color: "#3b82f6", desc: "阿里通义千问视觉语言模型", icon: <Bot size={16} />, type: ["text"] },
  "llama-3": { label: "Llama 3", color: "#f97316", desc: "Meta 开源大语言模型，支持文本生成", icon: <Cpu size={16} />, type: ["text"] },
  "qwen": { label: "通义千问", color: "#3b82f6", desc: "阿里大语言模型，支持长文本生成", icon: <Cpu size={16} />, type: ["text"] },
  "baichuan": { label: "百川大模型", color: "#8b5cf6", desc: "百川智能开源大语言模型", icon: <Cpu size={16} />, type: ["text"] },
};

const MOCK_TASKS: SynthesisTask[] = [
  {
    id: "syn-001", name: "产品展示图合成", type: "image", provider: "dalle",
    status: "completed", progress: 100, target_count: 200, generated_count: 200,
    prompt: "A high-quality product photography of a modern electronic device on a clean white background, studio lighting, professional commercial photography style",
    created_at: "2026-04-18 09:00", duration: "00:15:30", api_key_config: true,
  },
  {
    id: "syn-002", name: "交通事故场景图像合成", type: "image", provider: "stable-diffusion",
    status: "generating", progress: 45, target_count: 500, generated_count: 225,
    prompt: "A realistic traffic accident scene on a highway, multiple vehicles involved, various weather conditions including rain and fog, professional accident reconstruction photography style",
    created_at: "2026-04-18 10:30", api_key_config: true,
  },
  {
    id: "syn-003", name: "意图识别问答对生成", type: "text", provider: "qwen",
    status: "completed", progress: 100, target_count: 1000, generated_count: 1000,
    prompt: "生成客服场景下的多轮对话数据，包含用户意图、槽位填充、回复内容，涵盖产品咨询、投诉处理、订单查询三类场景",
    created_at: "2026-04-17 14:00", duration: "01:22:15", api_key_config: true,
  },
  {
    id: "syn-004", name: "商品描述文案生成", type: "text", provider: "gpt-vision",
    status: "failed", progress: 30, target_count: 500, generated_count: 150,
    prompt: "根据产品图像生成中文商品描述文案，包含产品名称、功能特点、适用场景，字数控制在100-200字",
    created_at: "2026-04-17 16:00", api_key_config: false,
  },
  {
    id: "syn-005", name: "情感分析语料扩充", type: "text", provider: "llama-3",
    status: "generating", progress: 78, target_count: 3000, generated_count: 2340,
    prompt: "针对以下情感类别（正面、负面、中性）生成多样化的中文评论文本，要求语言自然流畅，覆盖多种表达方式",
    created_at: "2026-04-18 08:00", api_key_config: true,
  },
];

const MOCK_API_CONFIGS: ApiConfig[] = [
  { id: "api-1", name: "OpenAI API", provider: "dalle", endpoint: "https://api.openai.com/v1", api_key: "sk-****-****-abcd", model: "dall-e-3", enabled: true, max_rpm: 50, cost_today: 12.5 },
  { id: "api-2", name: "阿里云 DashScope", provider: "qwen", endpoint: "https://dashscope.aliyuncs.com", api_key: "sk-****-****-efgh", model: "qwen-turbo", enabled: true, max_rpm: 100, cost_today: 3.2 },
  { id: "api-3", name: "Stable Diffusion API", provider: "stable-diffusion", endpoint: "https://api.stability.ai", api_key: "sk-****-****-ijkl", model: "sd-xl-1.0", enabled: false, max_rpm: 20, cost_today: 0 },
];

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { bg: string; color: string; label: string; Icon: any }> = {
    idle: { bg: "#f1f5f9", color: "#64748b", label: "待启动", Icon: Clock },
    generating: { bg: "#dbeafe", color: "#2563eb", label: "生成中", Icon: Loader2 },
    completed: { bg: "#dcfce7", color: "#16a34a", label: "已完成", Icon: CheckCircle2 },
    failed: { bg: "#fee2e2", color: "#dc2626", label: "失败", Icon: AlertCircle },
  };
  const s = map[status];
  const Icon = s.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={11} />{s.label}
    </span>
  );
}

function TypeBadge({ type }: { type: SynthesisType }) {
  const color = type === "image" ? "#ec4899" : "#3b82f6";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: `${color}15`, color, fontSize: 11, fontWeight: 600 }}>
      {type === "image" ? <Image size={11} /> : <FileText size={11} />}
      {type === "image" ? "图像" : "文本"}
    </span>
  );
}

function DetailModal({ task, onClose }: { task: SynthesisTask; onClose: () => void }) {
  const prov = PROVIDERS[task.provider];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: 620, maxHeight: "80vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${prov.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: prov.color }}>
              {prov.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>{task.name}</h2>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{prov.label} · {task.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { label: "服务商", value: prov.label },
              { label: "数据类型", value: task.type === "image" ? "图像合成" : "文本生成" },
              { label: "目标数量", value: task.target_count.toLocaleString() + " 条" },
              { label: "已生成", value: task.generated_count.toLocaleString() + " 条" },
              { label: "创建时间", value: task.created_at },
              { label: "运行耗时", value: task.duration || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>状态</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <StatusBadge status={task.status} />
              {task.api_key_config ? (
                <span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600 }}>API已配置</span>
              ) : (
                <span style={{ padding: "2px 8px", borderRadius: 4, background: "#fef9c3", color: "#ca8a04", fontSize: 11, fontWeight: 600 }}>待配置API</span>
              )}
            </div>
            {task.status === "generating" && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  <span>进度</span><span>{task.progress}%（{task.generated_count.toLocaleString()} / {task.target_count.toLocaleString()}）</span>
                </div>
                <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                  <div style={{ width: `${task.progress}%`, height: "100%", background: "#2563eb", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>生成 Prompt</div>
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14 }}>
              <p style={{ fontSize: 13, color: "#334155", margin: 0, lineHeight: 1.7 }}>{task.prompt}</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {task.status === "idle" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#8b5cf6", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Play size={13} />启动生成</button>}
          {task.status === "generating" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#f59e0b", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={13} />暂停</button>}
          {task.status === "completed" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Download size={13} />导出数据</button>}
          {task.status === "failed" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#dc2626", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><RefreshCw size={13} />重新生成</button>}
          {!task.api_key_config && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#fef9c3", color: "#ca8a04", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><KeyRound size={13} />配置API</button>}
          <button style={{ padding: "8px 18px", borderRadius: 8, background: "#f1f5f9", color: "#64748b", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Trash2 size={13} />删除</button>
        </div>
      </div>
    </div>
  );
}

export default function DataSynthesisPage() {
  const [tasks, setTasks] = useState<SynthesisTask[]>(MOCK_TASKS);
  const [showCreate, setShowCreate] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [tab, setTab] = useState<"tasks" | "providers" | "api-config">("tasks");
  const [synthType, setSynthType] = useState<SynthesisType>("image");
  const [provider, setProvider] = useState<Provider>("dalle");
  const [prompt, setPrompt] = useState("");
  const [targetCount, setTargetCount] = useState(100);
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState<SynthesisType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [detailTask, setDetailTask] = useState<SynthesisTask | null>(null);

  const stats = {
    total: tasks.length,
    generating: tasks.filter(t => t.status === "generating").length,
    completed: tasks.filter(t => t.status === "completed").length,
    generated: tasks.reduce((acc, t) => acc + t.generated_count, 0),
  };

  const visibleProviders = Object.entries(PROVIDERS).filter(([, p]) => p.type.includes(synthType));

  const filtered = tasks.filter(t => {
    if (keyword && !t.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* TopBar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wand2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>数据合成</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>第三方 API 合成 · 图像/文本生成 · 数据补充增强</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="搜索任务名称..."
                style={{ padding: "7px 12px 7px 32px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: "#f8fafc" }}
              />
            </div>
            <button onClick={() => setShowApiConfig(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#fff", color: "#334155", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              <KeyRound size={14} />API 配置
            </button>
            <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#8b5cf6", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={14} />新建合成任务
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px 0" }}>
        {/* 统计卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "合成任务", value: stats.total, unit: "个", color: "#8b5cf6" },
            { label: "生成中", value: stats.generating, unit: "个", color: "#2563eb" },
            { label: "已完成", value: stats.completed, unit: "个", color: "#16a34a" },
            { label: "已生成总量", value: stats.generated.toLocaleString(), unit: "条", color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
                {s.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab切换 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 0 }}>
          {([
            { key: "tasks", label: "合成任务", icon: <Activity size={14} /> },
            { key: "providers", label: "服务商管理", icon: <Globe size={14} /> },
            { key: "api-config", label: "API 配置", icon: <Code size={14} /> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "8px 8px 0 0",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: tab === t.key ? "#8b5cf6" : "#f1f5f9",
              color: tab === t.key ? "#fff" : "#64748b",
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 32px 32px" }}>
        {tab === "tasks" && (
          <>
            {/* 筛选器 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 300 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="搜索任务名称..."
                  style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8fafc" }}
                />
              </div>
              <select value={filterType} onChange={e => setFilterType(e.target.value as SynthesisType | "all")} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer", color: "#334155" }}>
                <option value="all">全部类型</option>
                <option value="image">图像合成</option>
                <option value="text">文本生成</option>
              </select>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | "all")} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer", color: "#334155" }}>
                <option value="all">全部状态</option>
                <option value="idle">待启动</option>
                <option value="generating">生成中</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
                <Filter size={13} />高级筛选
              </button>
            </div>

            {/* 表格 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 80px 100px 1fr 100px 80px", gap: 12, padding: "10px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>任务名称</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>类型</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>服务商</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>状态 / 进度</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>创建时间</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "center" }}>操作</span>
              </div>
              {filtered.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>暂无数据</div>
              ) : (
                filtered.map((task, i) => {
                  const prov = PROVIDERS[task.provider];
                  return (
                    <div key={task.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 80px 100px 1fr 100px 80px", gap: 12, padding: "12px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "center", background: "#fff" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: `${prov.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: prov.color, flexShrink: 0 }}>
                          {prov.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.name}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{prov.label}</div>
                        </div>
                      </div>
                      <TypeBadge type={task.type} />
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: `${prov.color}15`, color: prov.color, fontSize: 11, fontWeight: 600 }}>
                        {prov.label}
                      </span>
                      <div>
                        <StatusBadge status={task.status} />
                        {task.status === "generating" && (
                          <div style={{ marginTop: 6 }}>
                            <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2 }}>
                              <div style={{ width: `${task.progress}%`, height: "100%", background: "#2563eb", borderRadius: 2 }} />
                            </div>
                            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{task.generated_count.toLocaleString()} / {task.target_count.toLocaleString()}</div>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{task.created_at}</div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                        <button onClick={() => setDetailTask(task)} style={{ padding: "5px 6px", borderRadius: 6, background: "#eff6ff", color: "#2563eb", border: "none", cursor: "pointer" }} title="查看详情">
                          <Eye size={14} />
                        </button>
                        <button style={{ padding: "5px 6px", borderRadius: 6, background: "#f1f5f9", color: "#64748b", border: "none", cursor: "pointer" }} title="删除"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {tab === "providers" && (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569", marginBottom: 12 }}>第三方服务商</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {Object.entries(PROVIDERS).map(([key, prov]) => {
                const taskCount = tasks.filter(t => t.provider === key).length;
                return (
                  <div key={key} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${prov.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: prov.color }}>
                        {prov.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{prov.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{taskCount} 个任务</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px", lineHeight: 1.6 }}>{prov.desc}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={{ flex: 1, padding: "7px 10px", borderRadius: 6, background: prov.color, color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <Plus size={12} />创建任务
                      </button>
                      <button style={{ padding: "7px 10px", borderRadius: 6, background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0", fontSize: 12, cursor: "pointer" }}>
                        <Settings size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "api-config" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#475569", margin: 0 }}>API 密钥配置</h3>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#8b5cf6", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>
                <Plus size={14} />新增配置
              </button>
            </div>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", gap: 0, background: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "10px 16px" }}>
                {["服务商", "模型", "Endpoint", "限速(RPM)", "今日费用", "状态"].map(h => (
                  <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{h}</span>
                ))}
              </div>
              {MOCK_API_CONFIGS.map((cfg, i) => {
                const prov = PROVIDERS[cfg.provider];
                return (
                  <div key={cfg.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 80px", gap: 0, padding: "14px 16px", borderBottom: i < MOCK_API_CONFIGS.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{cfg.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{cfg.api_key}</div>
                    </div>
                    <span style={{ fontSize: 12, color: "#334155" }}>{cfg.model}</span>
                    <span style={{ fontSize: 12, color: "#64748b" }}>{cfg.endpoint.replace("https://", "")}</span>
                    <span style={{ fontSize: 12, color: "#334155" }}>{cfg.max_rpm}</span>
                    <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600 }}>${cfg.cost_today}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <button onClick={() => {}} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                        {cfg.enabled ? <ToggleRight size={20} color="#10b981" /> : <ToggleLeft size={20} color="#cbd5e1" />}
                      </button>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><Settings size={13} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 新建合成任务弹窗 */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 640, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>新建数据合成任务</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>任务名称 <span style={{ color: "#dc2626" }}>*</span></label>
                  <input placeholder="例如：产品展示图合成-v2" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>合成数据类型</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {([
                      { key: "image" as SynthesisType, label: "图像合成", icon: <Image size={14} /> },
                      { key: "text" as SynthesisType, label: "文本生成", icon: <FileText size={14} /> },
                    ] as const).map(t => (
                      <button key={t.key} onClick={() => setSynthType(t.key)} style={{
                        flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 10,
                        border: `2px solid ${synthType === t.key ? "#8b5cf6" : "#e2e8f0"}`,
                        background: synthType === t.key ? "#f5f3ff" : "#fff",
                        color: synthType === t.key ? "#8b5cf6" : "#64748b", fontSize: 14, fontWeight: 500, cursor: "pointer",
                      }}>
                        {t.icon}{t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>选择服务商</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {visibleProviders.map(([key, prov]) => (
                      <button key={key} onClick={() => setProvider(key as Provider)} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10,
                        border: `2px solid ${provider === key ? prov.color : "#e2e8f0"}`,
                        background: provider === key ? `${prov.color}10` : "#fff",
                        color: provider === key ? prov.color : "#64748b", fontSize: 13, cursor: "pointer", textAlign: "left",
                      }}>
                        {prov.icon}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{prov.label}</div>
                          <div style={{ fontSize: 10, opacity: 0.7 }}>{prov.desc.slice(0, 20)}...</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>生成 Prompt <span style={{ color: "#dc2626" }}>*</span></label>
                  <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder={synthType === "image" ? "描述想要生成的图像内容，包含主体、风格、光照、背景等要素..." : "描述想要生成的文本内容，包含话题、风格、格式等要求..."}
                    rows={5}
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: 1.7, boxSizing: "border-box" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Prompt 质量直接影响生成效果，建议详细描述</span>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#8b5cf6", fontWeight: 500 }}><Sparkles size={11} style={{ marginRight: 3 }} />AI优化</button>
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>目标生成数量</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input type="range" min={10} max={1000} value={targetCount} onChange={e => setTargetCount(Number(e.target.value))} style={{ flex: 1 }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#8b5cf6", minWidth: 50, textAlign: "right" }}>{targetCount}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>取消</button>
              <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#8b5cf6", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <Play size={14} />创建并启动
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API配置弹窗 */}
      {showApiConfig && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setShowApiConfig(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 560, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>API 密钥配置</h2>
              <button onClick={() => setShowApiConfig(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              {MOCK_API_CONFIGS.map(cfg => {
                const prov = PROVIDERS[cfg.provider];
                return (
                  <div key={cfg.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${prov.color}15`, display: "flex", alignItems: "center", justifyContent: "center", color: prov.color }}>
                      {prov.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{cfg.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{cfg.api_key}</div>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                      {cfg.enabled ? <ToggleRight size={22} color="#10b981" /> : <ToggleLeft size={22} color="#cbd5e1" />}
                    </button>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><Pencil size={14} /></button>
                  </div>
                );
              })}
              <button style={{ width: "100%", padding: "14px", borderRadius: 10, border: "2px dashed #e2e8f0", background: "transparent", color: "#94a3b8", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Plus size={14} />添加新的 API 配置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {detailTask && <DetailModal task={detailTask} onClose={() => setDetailTask(null)} />}
    </div>
  );
}
