"use client";
import React, { useState, useCallback } from "react";
import {
  BookOpen, Plus, Search, Settings, Upload, Download, Trash2, Eye,
  ChevronRight, Database, Cpu, Zap, Layers, RefreshCw,
  X, CheckCircle2, AlertCircle, Tag, ArrowRight, FileUp,
  BarChart3, MessageSquare, ToggleLeft, ToggleRight, EyeOff, FolderOpen,
  Edit3, Copy, ExternalLink, Trash, Clock, HardDrive
} from "lucide-react";

// ============ Mock Data ============
const MOCK_KB_LIST = [
  {
    id: "kb-001",
    name: "产品文档知识库",
    description: "零数数智工厂产品功能介绍、使用指南和常见问题解答",
    status: "active",
    docCount: 328,
    chunkCount: 2456,
    vectorModel: "text2vec-base-chinese",
    lastUpdated: "2026-04-18 10:30",
    creator: "admin",
    size: "128 MB",
  },
  {
    id: "kb-002",
    name: "技术文档知识库",
    description: "开发团队技术文档、API接口说明和架构设计文档",
    status: "active",
    docCount: 156,
    chunkCount: 1102,
    vectorModel: "text2vec-base-chinese",
    lastUpdated: "2026-04-17 16:45",
    creator: "admin",
    size: "96 MB",
  },
  {
    id: "kb-003",
    name: "交通事件知识库",
    description: "交通场景下的事件定义、分类标准和处理流程文档",
    status: "building",
    docCount: 89,
    chunkCount: 0,
    vectorModel: "text2vec-base-chinese",
    lastUpdated: "2026-04-16 09:20",
    creator: "admin",
    size: "45 MB",
  },
  {
    id: "kb-004",
    name: "Windows API文档知识库",
    description: "Windows PowerShell API文档及开发指南",
    status: "active",
    docCount: 76,
    chunkCount: 489,
    vectorModel: "text2vec-base-chinese",
    lastUpdated: "2026-04-15 11:20",
    creator: "admin",
    size: "34 MB",
  },
];

const MOCK_VECTOR_DATASETS = [
  { id: "vd-001", name: "产品文档向量集", kbId: "kb-001", docCount: 328, chunkCount: 2456, dimension: 768, status: "ready" },
  { id: "vd-002", name: "技术文档向量集", kbId: "kb-002", docCount: 156, chunkCount: 1102, dimension: 768, status: "ready" },
  { id: "vd-003", name: "交通文档向量集", kbId: "kb-003", docCount: 89, chunkCount: 0, dimension: 768, status: "building" },
  { id: "vd-004", name: "Windows API向量集", kbId: "kb-004", docCount: 76, chunkCount: 489, dimension: 768, status: "ready" },
];

const MOCK_FILES = [
  { id: "f-001", name: "产品文档介绍.pdf", size: "2.3 MB", type: "pdf", uploadTime: "2026-04-18 10:15", status: "indexed", chunkCount: 156 },
  { id: "f-002", name: "API接口文档v2.1.docx", size: "856 KB", type: "docx", uploadTime: "2026-04-17 14:30", status: "indexed", chunkCount: 89 },
  { id: "f-003", name: "架构设计白电.pdf", size: "4.1 MB", type: "pdf", uploadTime: "2026-04-16 11:00", status: "indexed", chunkCount: 234 },
  { id: "f-004", name: "交通事件分类标准.xlsx", size: "128 KB", type: "xlsx", uploadTime: "2026-04-15 09:30", status: "pending", chunkCount: 0 },
];

// ============ Types ============
type Tab = "kb" | "vector" | "search" | "file";
type Modal = "create-kb" | "config-kb" | "upload" | null;
type KbStatus = "active" | "building" | "error";

// ============ Helpers ============
const statusColor = (s: KbStatus): string => {
  if (s === "active") return "#16a34a";
  if (s === "building") return "#2563eb";
  return "#dc2626";
};
const statusLabel = (s: KbStatus): string => {
  if (s === "active") return "运行中";
  if (s === "building") return "构建中";
  return "异常";
};
const statusBg = (s: KbStatus): string => {
  if (s === "active") return "#dcfce7";
  if (s === "building") return "#dbeafe";
  return "#fee2e2";
};
const fileTypeColor = (t: string): string => {
  const map: Record<string, string> = { pdf: "#ef4444", docx: "#3b82f6", xlsx: "#22c55e", txt: "#6b7280" };
  return map[t] || "#6b7280";
};

// ============ Components ============
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)", display: "flex",
        alignItems: "center", justifyContent: "center",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "28px 32px",
        width: 560, maxHeight: "80vh", overflowY: "auto",
        boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
        borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
        transition: "all 0.2s",
        background: active ? "#2563eb" : "#f1f5f9",
        color: active ? "#fff" : "#64748b",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function KbCard({ kb, onConfig, onDelete }: { kb: typeof MOCK_KB_LIST[0]; onConfig: () => void; onDelete: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff", borderRadius: 16, padding: 24,
        border: "1px solid #e2e8f0",
        transition: "all 0.25s",
        transform: hover ? "translateY(-2px)" : "none",
        boxShadow: hover ? "0 8px 25px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={18} color="#2563eb" />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1e293b" }}>{kb.name}</span>
          </div>
          <span style={{
            display: "inline-block", fontSize: 12, padding: "2px 10px", borderRadius: 99,
            background: statusBg(kb.status as KbStatus), color: statusColor(kb.status as KbStatus),
            fontWeight: 500, marginBottom: 10,
          }}>
            {statusLabel(kb.status as KbStatus)}
          </span>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, margin: "8px 0" }}>{kb.description}</p>
          <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
            {[
              { label: "文档", value: kb.docCount },
              { label: "切片", value: kb.chunkCount },
              { label: "向量模型", value: kb.vectorModel },
              { label: "大小", value: kb.size },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#64748b" }}>
                <span style={{ color: "#94a3b8" }}>{item.label}:</span>
                <span style={{ fontWeight: 500, color: "#334155" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 12, color: "#94a3b8" }}>
            <Clock size={12} />
            <span>最后更新: {kb.lastUpdated}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 16 }}>
          <button
            onClick={onConfig}
            style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
          >
            <Settings size={13} /> 配置
          </button>
          <button
            onClick={onDelete}
            style={{ background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
          >
            <Trash2 size={13} /> 删除
          </button>
        </div>
      </div>
    </div>
  );
}

function VectorRow({ vd }: { vd: typeof MOCK_VECTOR_DATASETS[0] }) {
  const [expanded, setExpanded] = useState(false);
  const readyPct = vd.status === "ready" ? 100 : 45;
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ display: "flex", alignItems: "center", padding: "16px 20px", cursor: "pointer", gap: 12 }}
      >
        <ChevronRight size={16} style={{ transform: expanded ? "rotate(90deg)" : "none", transition: "0.2s", color: "#94a3b8" }} />
        <Database size={16} color="#2563eb" />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#1e293b" }}>{vd.name}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>文档 {vd.docCount} | 切片 {vd.chunkCount}</span>
        <span style={{ fontSize: 12, color: "#64748b" }}>维度 {vd.dimension}</span>
        <span style={{
          fontSize: 12, padding: "2px 10px", borderRadius: 99, fontWeight: 500,
          background: vd.status === "ready" ? "#dcfce7" : "#dbeafe",
          color: vd.status === "ready" ? "#16a34a" : "#2563eb",
        }}>
          {vd.status === "ready" ? "就绪" : "构建中"}
        </span>
        {vd.status === "building" && (
          <div style={{ width: 80, height: 4, background: "#e2e8f0", borderRadius: 2 }}>
            <div style={{ width: `${readyPct}%`, height: "100%", background: "#2563eb", borderRadius: 2, transition: "width 0.3s" }} />
          </div>
        )}
      </div>
    </div>
  );
}

function FileRow({ f, onDelete }: { f: typeof MOCK_FILES[0]; onDelete: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid #f1f5f9", gap: 12, background: "#fff" }}>
      <FileUp size={16} color={fileTypeColor(f.type)} />
      <span style={{ flex: 1, fontSize: 13, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
      <span style={{ fontSize: 12, color: "#94a3b8", width: 80 }}>{f.size}</span>
      <span style={{ fontSize: 12, color: "#94a3b8", width: 140 }}>{f.uploadTime}</span>
      <span style={{
        fontSize: 12, padding: "2px 10px", borderRadius: 99, fontWeight: 500, width: 80, textAlign: "center",
        background: f.status === "indexed" ? "#dcfce7" : "#fef9c3",
        color: f.status === "indexed" ? "#16a34a" : "#ca8a04",
      }}>
        {f.status === "indexed" ? "已索引" : "待处理"}
      </span>
      <span style={{ fontSize: 12, color: "#64748b", width: 80 }}>切片 {f.chunkCount}</span>
      <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 4 }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ============ Main Page ============
export default function KnowledgeBasePage() {
  const [tab, setTab] = useState<Tab>("kb");
  const [modal, setModal] = useState<Modal>(null);
  const [search, setSearch] = useState("");
  const [kbs, setKbs] = useState(MOCK_KB_LIST);
  const [testQuery, setTestQuery] = useState("");
  const [testResults, setTestResults] = useState<Array<{ content: string; score: number; source: string }>>([]);
  const [searching, setSearching] = useState(false);

  const filtered = tab === "kb"
    ? kbs.filter(k => !search || k.name.includes(search) || k.description.includes(search))
    : tab === "vector"
    ? MOCK_VECTOR_DATASETS.filter(v => !search || v.name.includes(search))
    : tab === "file"
    ? MOCK_FILES.filter(f => !search || f.name.includes(search))
    : [];

  const handleSearch = useCallback(async () => {
    if (!testQuery.trim()) return;
    setSearching(true);
    await new Promise(r => setTimeout(r, 800));
    setTestResults([
      { content: "知识库管理模块支持配置向量模型、分片策略和召回参数，可以灵活适应不同的业务场景。", score: 0.92, source: "产品文档知识库" },
      { content: "RAG（检索增强生成）通过向量检索从知识库中获取相关片段，再交由大模型生成答案，显著提升回答准确性。", score: 0.87, source: "产品文档知识库" },
      { content: "系统支持多种嵌入模型，包括 text2vec-base-chinese、m3e-base 等，可根据性能与精度需求选择。", score: 0.81, source: "技术文档知识库" },
    ]);
    setSearching(false);
  }, [testQuery]);

  const handleDelete = useCallback((id: string) => {
    setKbs(prev => prev.filter(k => k.id !== id));
  }, []);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BookOpen size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>知识库管理</h1>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>配置 RAG 检索、嵌入模型与文档切片策略</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "8px 14px", gap: 8 }}>
              <Search size={15} color="#94a3b8" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索知识库..."
                style={{ border: "none", outline: "none", fontSize: 14, color: "#334155", width: 200, background: "transparent" }}
              />
            </div>
            {tab === "kb" && (
              <button
                onClick={() => setModal("create-kb")}
                style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
              >
                <Plus size={15} /> 新建知识库
              </button>
            )}
            {tab === "file" && (
              <button
                onClick={() => setModal("upload")}
                style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "8px 18px", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
              >
                <Upload size={15} /> 上传文件
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 0 }}>
          <TabButton active={tab === "kb"} onClick={() => setTab("kb")} icon={<BookOpen size={14} />} label="知识库管理" />
          <TabButton active={tab === "vector"} onClick={() => setTab("vector")} icon={<Database size={14} />} label="向量数据集" />
          <TabButton active={tab === "search"} onClick={() => setTab("search")} icon={<Search size={14} />} label="检索测试" />
          <TabButton active={tab === "file"} onClick={() => setTab("file")} icon={<FolderOpen size={14} />} label="文件管理" />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "24px 32px" }}>
        {/* KB Tab */}
        {tab === "kb" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))", gap: 16 }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "60px 0", color: "#94a3b8" }}>
                <BookOpen size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
                <p>暂无知识库，点击右上角新建</p>
              </div>
            ) : (
              filtered.map(kb => (
                <KbCard
                  key={kb.id}
                  kb={kb}
                  onConfig={() => setModal("config-kb")}
                  onDelete={() => handleDelete(kb.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Vector Tab */}
        {tab === "vector" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(vd => <VectorRow key={vd.id} vd={vd} />)}
          </div>
        )}

        {/* Search Test Tab */}
        {tab === "search" && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e2e8f0", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>实时检索测试</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", gap: 8 }}>
                  <Search size={16} color="#94a3b8" />
                  <input
                    value={testQuery}
                    onChange={e => setTestQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearch()}
                    placeholder="输入问题进行检索测试"
                    style={{ border: "none", outline: "none", fontSize: 14, color: "#334155", flex: 1, background: "transparent" }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={searching}
                  style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: searching ? "wait" : "pointer", opacity: searching ? 0.7 : 1, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
                >
                  {searching ? <RefreshCw size={14} /> : <Search size={14} />}
                  {searching ? "检索中..." : "检索"}
                </button>
              </div>
            </div>
            {testResults.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 4px" }}>检索到 {testResults.length} 条相关片段</p>
                {testResults.map((r, i) => (
                  <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 500 }}>{r.source}</span>
                      <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>相似度 {(r.score * 100).toFixed(1)}%</span>
                    </div>
                    <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.7, margin: 0 }}>{r.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* File Tab */}
        {tab === "file" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", gap: 8 }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#64748b" }}>文件名</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", width: 80 }}>大小</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", width: 140 }}>上传时间</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", width: 80 }}>状态</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", width: 80 }}>切片</span>
              <span style={{ width: 32 }} />
            </div>
            {filtered.map(f => <FileRow key={f.id} f={f} onDelete={() => {}} />)}
          </div>
        )}
      </div>

      {/* Create KB Modal */}
      {modal === "create-kb" && (
        <Modal title="新建知识库" onClose={() => setModal(null)}>
          {[
            { label: "知识库名称", placeholder: "例如：产品文档知识库", key: "name" },
            { label: "描述", placeholder: "简要描述知识库的用途和内容范围", key: "desc" },
            { label: "向量模型", placeholder: "text2vec-base-chinese", key: "model" },
          ].map(field => (
            <div key={field.key} style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{field.label}</label>
              <input
                placeholder={field.placeholder}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, color: "#334155", boxSizing: "border-box", outline: "none" }}
              />
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>切片策略</label>
            <select style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, color: "#334155", background: "#fff", outline: "none" }}>
              <option>自动切片（默认 512 字符，50 重\u叠）</option>
              <option>固定长度切片（1024 字符）</option>
              <option>段落切片（按段落边界）</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setModal(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>取消</button>
            <button onClick={() => setModal(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#2563eb", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 500 }}>创建</button>
          </div>
        </Modal>
      )}

      {/* Config Modal */}
      {modal === "config-kb" && (
        <Modal title="知识库配置" onClose={() => setModal(null)}>
          {[
            { label: "Top-K 召回数量", value: "5", hint: "每次召回的最相关切片数量" },
            { label: "相似度阈值", value: "0.7", hint: "低于此分数的切片将被过滤" },
            { label: "Rerank 模型", value: "bge-reranker-base", hint: "用于二次排序，提升召回精度" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>{f.label}</label>
              <input defaultValue={f.value} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, color: "#334155", boxSizing: "border-box", outline: "none" }} />
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>{f.hint}</p>
            </div>
          ))}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>状态</label>
            <div style={{ display: "flex", gap: 10 }}>
              {(["active", "building"] as const).map(s => (
                <label key={s} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer", fontSize: 13, color: "#374151" }}>
                  <input type="radio" name="status" value={s} defaultChecked={s === "active"} />
                  {s === "active" ? "启用" : "暂停"}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setModal(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>取消</button>
            <button onClick={() => setModal(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#16a34a", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 500 }}>保存配置</button>
          </div>
        </Modal>
      )}

      {/* Upload Modal */}
      {modal === "upload" && (
        <Modal title="上传文档" onClose={() => setModal(null)}>
          <div style={{
            border: "2px dashed #d1d5db", borderRadius: 12, padding: "48px 24px", textAlign: "center",
            marginBottom: 20, cursor: "pointer", transition: "all 0.2s",
          }}>
            <Upload size={36} color="#94a3b8" style={{ margin: "0 auto 12px", display: "block" }} />
            <p style={{ fontSize: 15, color: "#374151", margin: "0 0 4px" }}>拖拽文件到此处，或 <span style={{ color: "#2563eb", cursor: "pointer" }}>点击上传</span></p>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>支持 PDF、Word、Excel、TXT，单文件不超过 50MB</p>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setModal(null)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>关闭</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
