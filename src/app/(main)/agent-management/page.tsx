"use client";
import React, { useState, useEffect } from "react";
import {
  Cpu, Plus, Search, Settings, Trash2, Eye, Edit3, Play, Pause,
  ChevronRight, ChevronDown, ToggleLeft, ToggleRight, ArrowRight,
  MessageSquare, Brain, Database, Zap, GitBranch, Layers, ArrowUpDown,
  Copy, RefreshCw, Tag, FileText, Link2, Webhook, CheckCircle2, X, XCircle,
  BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "draft";
  model: string;
  components: string[];
  created_at: string;
  usage_count: number;
  avg_latency: string;
  knowledge_bases: string[];
  prompt_template: string;
}

interface FlowNode {
  id: string;
  type: "start" | "knowledge" | "generate" | "classify" | "condition" | "template" | "loop" | "end";
  label: string;
  icon: React.ReactNode;
  color: string;
  bg?: string;
  x: number;
  y: number;
}

const MOCK_AGENTS: Agent[] = [
  {
    id: "a1", name: "智能客服助手", description: "基于知识库的智能客服，自动回答用户咨询并引导下单",
    status: "active", model: "Qwen2.5-7B-Instruct", components: ["知识检索", "生成回答", "问题分类", "关键词提取"],
    created_at: "2025-04-10", usage_count: 3420, avg_latency: "128ms",
    knowledge_bases: ["产品知识库", "客服知识库"], prompt_template: "客服问答",
  },
  {
    id: "a2", name: "数据分析助手", description: "接收用户数据请求，自动查询数据库并生成分析报告",
    status: "active", model: "DeepSeek-V2.5", components: ["问题理解", "SQL生成", "数据查询", "报告生成"],
    created_at: "2025-04-08", usage_count: 1560, avg_latency: "890ms",
    knowledge_bases: ["技术文档库"], prompt_template: "数据分析报告",
  },
  {
    id: "a3", name: "内容审核智能体", description: "自动审核用户生成内容，识别违规信息并处理",
    status: "paused", model: "Qwen2.5-7B-Instruct", components: ["内容获取", "关键词检测", "分类判断", "消息发送"],
    created_at: "2025-04-05", usage_count: 8900, avg_latency: "95ms",
    knowledge_bases: ["内部制度知识图谱"], prompt_template: "通用助手",
  },
  {
    id: "a4", name: "代码审查助手", description: "自动审查Pull Request代码，给出优化建议和潜在问题标注",
    status: "draft", model: "Qwen2.5-7B-Instruct", components: ["代码获取", "静态分析", "建议生成"],
    created_at: "2025-04-12", usage_count: 0, avg_latency: "-",
    knowledge_bases: ["技术文档库"], prompt_template: "代码生成助手",
  },
];

const NODE_TYPES = [
  { type: "start", label: "开始", icon: <Play size={14} />, color: "#16a34a", bg: "#f0fdf4" },
  { type: "knowledge", label: "知识检索", icon: <Database size={14} />, color: "#2563eb", bg: "#eff6ff" },
  { type: "generate", label: "生成回答", icon: <Brain size={14} />, color: "#7c3aed", bg: "#fdf4ff" },
  { type: "classify", label: "问题分类", icon: <Tag size={14} />, color: "#d97706", bg: "#fffbeb" },
  { type: "condition", label: "条件判断", icon: <GitBranch size={14} />, color: "#dc2626", bg: "#fef2f2" },
  { type: "template", label: "模板转换", icon: <FileText size={14} />, color: "#0891b2", bg: "#ecfeff" },
  { type: "loop", label: "循环", icon: <RefreshCw size={14} />, color: "#be185d", bg: "#fdf2f8" },
  { type: "end", label: "结束", icon: <CheckCircle2 size={14} />, color: "#64748b", bg: "#f8fafc" },
];

const MCP_TOOLS = [
  { name: "web_search", label: "网页搜索", desc: "通过搜索引擎获取实时信息" },
  { name: "code_execute", label: "代码执行", desc: "执行Python/JS代码片段" },
  { name: "file_read", label: "文件读取", desc: "读取服务器上的文件内容" },
  { name: "db_query", label: "数据库查询", desc: "执行SQL查询操作" },
  { name: "http_request", label: "HTTP请求", desc: "发起外部API调用" },
];

export default function AgentManagementPage() {
  const [tab, setTab] = useState<"list" | "create" | "flow">("list");
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("全部");
  const [showFlow, setShowFlow] = useState(false);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [mcpEnabled, setMcpEnabled] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedKbs, setSelectedKbs] = useState<string[]>([]);

  const filtered = agents.filter(a => {
    const matchSearch = !search || a.name.includes(search) || a.description.includes(search);
    const matchStatus = statusFilter === "全部" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleAgent = (id: string) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "active" ? "paused" as const : "active" as const } : a));
    toast.success("智能体状态已切换");
  };

  const openFlow = (a: Agent) => {
    setActiveAgent(a);
    setShowFlow(true);
    // 默认流程
    const defaultNodes: FlowNode[] = [
      { id: "n1", type: "start", label: "开始", icon: <Play size={14} />, color: "#16a34a", bg: "#f0fdf4", x: 50, y: 200 },
      { id: "n2", type: "classify", label: "问题分类", icon: <Tag size={14} />, color: "#d97706", bg: "#fffbeb", x: 200, y: 200 },
      { id: "n3", type: "knowledge", label: "知识检索", icon: <Database size={14} />, color: "#2563eb", bg: "#eff6ff", x: 360, y: 200 },
      { id: "n4", type: "generate", label: "生成回答", icon: <Brain size={14} />, color: "#7c3aed", bg: "#fdf4ff", x: 520, y: 200 },
      { id: "n5", type: "end", label: "结束", icon: <CheckCircle2 size={14} />, color: "#64748b", bg: "#f8fafc", x: 680, y: 200 },
    ];
    setNodes(defaultNodes);
    setTab("flow");
  };

  const toggleTool = (name: string) => {
    setSelectedTools(prev => prev.includes(name) ? prev.filter(t => t !== name) : [...prev, name]);
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>智能体管理</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>低代码可视化智能体构建 · MCP配置 · 流程编排</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setTab("create")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={13} />新建智能体
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
          {[{ key: "list", label: "智能体列表", icon: Layers }, { key: "create", label: "新建智能体", icon: Plus }, { key: "flow", label: "流程画布", icon: GitBranch }].map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key as any)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", border: "none", background: "transparent", borderBottom: `2px solid ${isActive ? "#f59e0b" : "transparent"}`, color: isActive ? "#f59e0b" : "#64748b", fontSize: 13, fontWeight: isActive ? 600 : 400, cursor: "pointer", marginBottom: -2 }}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: "0 32px 32px" }}>
        {/* 智能体列表 */}
        {tab === "list" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 220px" }}>
                  <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索智能体名称"
                    style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 10, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                </div>
                {["全部", "active", "paused", "draft"].map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${statusFilter === s ? "#f59e0b" : "#e2e8f0"}`, background: statusFilter === s ? "#fffbeb" : "#fff", color: statusFilter === s ? "#d97706" : "#64748b", fontSize: 11, cursor: "pointer", fontWeight: statusFilter === s ? 600 : 400 }}>
                    {s === "全部" ? "全部" : s === "active" ? "运行中" : s === "paused" ? "已暂停" : "草稿"}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {filtered.map(a => (
                <div key={a.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 18, transition: "box-shadow 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Brain size={16} color="#f59e0b" />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{a.name}</span>
                        <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: a.status === "active" ? "#f0fdf4" : a.status === "paused" ? "#fffbeb" : "#f8fafc", color: a.status === "active" ? "#16a34a" : a.status === "paused" ? "#d97706" : "#94a3b8", fontWeight: 600 }}>
                          {a.status === "active" ? "运行中" : a.status === "paused" ? "已暂停" : "草稿"}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>模型: <strong style={{ color: "#334155" }}>{a.model}</strong></div>
                    </div>
                    <div onClick={() => toggleAgent(a.id)}
                      style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", padding: "4px 8px", borderRadius: 5, border: `1px solid ${a.status === "active" ? "#16a34a" : "#e2e8f0"}` }}>
                      {a.status === "active" ? <Pause size={13} color="#16a34a" /> : <Play size={13} color="#64748b" />}
                      <span style={{ fontSize: 11, color: a.status === "active" ? "#16a34a" : "#64748b" }}>{a.status === "active" ? "暂停" : "启动"}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.6 }}>{a.description}</p>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                    {a.components.map(c => (
                      <span key={c} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>{c}</span>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 12, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    {[
                      { label: "调用次数", value: a.usage_count.toLocaleString() },
                      { label: "平均延迟", value: a.avg_latency },
                      { label: "知识库", value: a.knowledge_bases.length + "个" },
                    ].map(m => (
                      <div key={m.label} style={{ background: "#f8fafc", borderRadius: 5, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{m.value}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    <button onClick={() => openFlow(a)} style={{ flex: 1, padding: "5px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <GitBranch size={11} color="#64748b" />流程画布
                    </button>
                    <button style={{ flex: 1, padding: "5px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <Edit3 size={11} color="#64748b" />编辑
                    </button>
                    <button style={{ flex: 1, padding: "5px", borderRadius: 5, border: "1px solid #fecaca", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <Trash2 size={11} color="#dc2626" />删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 新建智能体 */}
        {tab === "create" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>智能体名称 *</label>
                <input placeholder="例如: 智能客服助手"
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>选择模型</label>
                <select style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff" }}>
                  <option>Qwen2.5-7B-Instruct</option><option>DeepSeek-V2.5</option><option>LLaMA-3-8B</option>
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>描述</label>
                <input placeholder="简要描述智能体的功能和用途"
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
              </div>
            </div>

            {/* 组件配置 */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 10 }}>选择组件</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {NODE_TYPES.filter(n => n.type !== "start" && n.type !== "end").map(n => (
                  <div key={n.type} onClick={() => {}}
                    style={{ padding: "10px 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n.icon}</div>
                    <span style={{ fontSize: 12, color: "#334155" }}>{n.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ====== 断点4修复：关联知识库 ====== */}
            <KnowledgeBaseSelector
              selected={selectedKbs}
              onChange={setSelectedKbs}
            />

            {/* MCP 配置 */}
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>MCP 配置</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>Model Context Protocol · 连接外部工具与数据源</div>
                </div>
                <div onClick={() => setMcpEnabled(!mcpEnabled)} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                  {mcpEnabled ? <ToggleRight size={24} color="#f59e0b" /> : <ToggleLeft size={24} color="#94a3b8" />}
                  <span style={{ fontSize: 13, color: "#334155" }}>{mcpEnabled ? "已启用" : "已禁用"}</span>
                </div>
              </div>
              {mcpEnabled && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                  {MCP_TOOLS.map(t => (
                    <div key={t.name} onClick={() => toggleTool(t.name)}
                      style={{ padding: "12px 14px", borderRadius: 7, border: `1px solid ${selectedTools.includes(t.name) ? "#f59e0b" : "#e2e8f0"}`, background: selectedTools.includes(t.name) ? "#fffbeb" : "#fff", cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Webhook size={16} color={selectedTools.includes(t.name) ? "#d97706" : "#94a3b8"} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: selectedTools.includes(t.name) ? "#d97706" : "#1e293b" }}>{t.label}</div>
                          <div style={{ fontSize: 10, color: "#94a3b8" }}>{t.desc}</div>
                        </div>
                        {selectedTools.includes(t.name) && <CheckCircle2 size={16} color="#f59e0b" style={{ marginLeft: "auto" }} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTab("list")} style={{ padding: "9px 20px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>取消</button>
              <button onClick={() => { toast.success("智能体创建成功"); setTab("list"); }} style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>创建智能体</button>
            </div>
          </div>
        )}

        {/* 流程画布 */}
        {tab === "flow" && (
          <div>
            {activeAgent && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 20px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>流程画布</span>
                  <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>{activeAgent.name} · {nodes.length} 个节点</span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setTab("list")} style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, color: "#64748b" }}>← 返回</button>
                  <button style={{ padding: "5px 12px", borderRadius: 5, border: "none", background: "#16a34a", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                    <Play size={11} />部署
                  </button>
                </div>
              </div>
            )}

            {/* 组件工具栏 */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "12px 20px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 10 }}>组件库 — 拖拽添加到画布</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {NODE_TYPES.map(n => (
                  <div key={n.type} onClick={() => toast.success(`已将「${n.label}」节点添加到画布`)}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontSize: 12, color: "#334155" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{n.icon}</div>
                    {n.label}
                  </div>
                ))}
              </div>
            </div>

            {/* 流程图 */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24, overflowX: "auto" }}>
              <div style={{ display: "flex", alignItems: "center", minWidth: 800, gap: 0 }}>
                {nodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{
                        padding: "10px 16px", borderRadius: 8, background: node.bg, border: `2px solid ${node.color}`,
                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                      }}>
                        <div style={{ width: 28, height: 28, borderRadius: 6, background: node.color + "20", display: "flex", alignItems: "center", justifyContent: "center", color: node.color }}>
                          {node.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{node.label}</div>
                          {node.type !== "start" && node.type !== "end" && (
                            <div style={{ fontSize: 10, color: "#94a3b8" }}>点击配置</div>
                          )}
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{node.type === "start" ? "入口" : node.type === "end" ? "出口" : `步骤 ${i}`}</div>
                    </div>
                    {i < nodes.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: "#e2e8f0", margin: "0 -1px", position: "relative", minWidth: 40 }}>
                        <ArrowRight size={14} color="#94a3b8" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff" }} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// ============================================================
// 断点4修复：知识库选择器（关联知识库 → 智能体）
// ============================================================
function KnowledgeBaseSelector({ selected, onChange }: { selected: string[]; onChange: (kbs: string[]) => void }) {
  const [kbs, setKbs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadKbs = () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem("taskforge_knowledge_bases");
      if (raw) {
        const parsed = JSON.parse(raw);
        setKbs(Array.isArray(parsed) ? parsed : []);
      } else {
        setKbs([
          { id: "kb1", name: "产品知识库", doc_count: 126, status: "active" },
          { id: "kb2", name: "客服知识库", doc_count: 89, status: "active" },
          { id: "kb3", name: "技术文档库", doc_count: 54, status: "active" },
          { id: "kb4", name: "内部制度知识图谱", doc_count: 32, status: "active" },
        ]);
      }
    } catch {
      setKbs([]);
    }
    setLoading(false);
  };

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter(k => k !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div style={{ background: "#f8fafc", borderRadius: 10, padding: 20, marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 3, display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={14} color="#2563eb" />关联知识库
            {selected.length > 0 && (
              <span style={{ fontSize: 11, padding: "1px 8px", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 600 }}>
                {selected.length} 个
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>选择一个或多个知识库作为智能体的检索数据源</div>
        </div>
        <button onClick={loadKbs} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
          <RefreshCw size={11} />加载知识库
        </button>
      </div>

      {kbs.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 13 }}>
          点击"加载知识库"从知识库管理读取已有知识库，或直接创建智能体后再关联
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {kbs.map(kb => {
          const isSelected = selected.includes(kb.name || kb.id);
          return (
            <div key={kb.id} onClick={() => toggle(kb.name || kb.id)}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                border: `1px solid ${isSelected ? "#2563eb" : "#e2e8f0"}`,
                background: isSelected ? "#eff6ff" : "#fff",
                transition: "all 0.1s",
              }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = "#93c5fd"; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: isSelected ? "#2563eb20" : "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BookOpen size={16} color={isSelected ? "#2563eb" : "#94a3b8"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{kb.name}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{kb.doc_count || kb.docCount || 0} 个文档 · {kb.embedding_model || kb.model || "bge-m3"}</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isSelected ? "#2563eb" : "#cbd5e1"}`, background: isSelected ? "#2563eb" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {isSelected && <CheckCircle2 size={10} color="#fff" />}
              </div>
            </div>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0", display: "flex", gap: 6 }}>
          <span style={{ fontSize: 12, color: "#64748b", lineHeight: "26px" }}>已选：</span>
          {selected.map(name => (
            <span key={name} onClick={() => toggle(name)}
              style={{ padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              {name} <X size={10} />
            </span>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={() => window.location.href = "/knowledge-base"}
          style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
          <Plus size={11} />新建知识库
        </button>
        <span style={{ fontSize: 12, color: "#94a3b8", lineHeight: "32px" }}>或前往知识库管理创建</span>
      </div>
    </div>
  );
}

