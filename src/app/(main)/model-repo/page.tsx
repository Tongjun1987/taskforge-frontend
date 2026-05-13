"use client";
import React, { useState } from "react";
import {
  Search, Download, Rocket, Star, Eye, Trash2, FolderOpen,
  ChevronRight, ChevronDown, ChevronUp, Package, Server, Cpu,
  Plus, Settings, Layers, Globe, Shield, Zap, HardDrive,
  CheckCircle2, XCircle, Clock, RefreshCw, Copy, ExternalLink,
  MessageSquare, Image, Mic, AlignLeft, Binary, X, ToggleLeft,
  ToggleRight, MoreHorizontal, EyeOff, Play, Pause, RotateCcw,
  ArrowUpDown, BookOpen, Hash, Gauge
} from "lucide-react";
import { MOCK_MODELS, MOCK_MODEL_FILES, DEPLOY_DEFAULTS } from "./_mock";
import type { Model, ModelFile, DeployConfig } from "./_mock";
import toast from "react-hot-toast";

// ============================================================
// 工具函数
// ============================================================
function formatNum(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  return n.toLocaleString();
}

function formatSize(s: string) {
  return s;
}

// ============================================================
// Tab 1: 模型仓库管理
// ============================================================
function ModelRegistryTab() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [format, setFormat] = useState("全部");
  const [favorites, setFavorites] = useState<Set<string>>(new Set(["m1", "m3"]));
  const [detailModel, setDetailModel] = useState<Model | null>(null);
  const [models] = useState<Model[]>(MOCK_MODELS);

  const categories = ["全部", "大语言模型", "视觉语言模型", "语音模型", "嵌入模型"];
  const formats = ["全部", "safetensors", "GGUF", "ONNX"];

  const filtered = models.filter(m => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.org.toLowerCase().includes(search.toLowerCase()) || m.domain_tags.some(t => t.includes(search));
    const matchCat = category === "全部" || m.category === category;
    const matchFmt = format === "全部" || m.precision.some(p => m.framework.some(f => f.toLowerCase().includes(format.toLowerCase())));
    return matchSearch && matchCat && matchFmt;
  });

  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const taskIcon = (type: string) => {
    if (type.includes("文本")) return <MessageSquare size={14} />;
    if (type.includes("视觉") || type.includes("图像")) return <Image size={14} />;
    if (type.includes("语音") || type.includes("ASR")) return <Mic size={14} />;
    if (type.includes("嵌入")) return <AlignLeft size={14} />;
    return <Cpu size={14} />;
  };

  return (
    <div>
      {/* 顶部标题 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={18} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型仓库</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>开源模型检索 · 一键下载 · 部署到Worker节点</p>
          </div>
        </div>
      </div>

      {/* 搜索与筛选 */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          {/* 搜索框 */}
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索模型名称 / 组织 / 领域标签"
              style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 10, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#f8fafc", boxSizing: "border-box" }}
            />
          </div>
          {/* 类别筛选 */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  height: 34, padding: "0 12px", borderRadius: 6, border: `1px solid ${category === c ? "#f59e0b" : "#e2e8f0"}`,
                  background: category === c ? "#fffbeb" : "#fff", color: category === c ? "#d97706" : "#64748b",
                  fontSize: 12, fontWeight: category === c ? 600 : 400, cursor: "pointer", transition: "all 0.1s",
                }}
              >{c}</button>
            ))}
          </div>
          {/* 格式筛选 */}
          <select
            value={format}
            onChange={e => setFormat(e.target.value)}
            style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#fff", cursor: "pointer" }}
          >
            {formats.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          共 <strong style={{ color: "#334155" }}>{filtered.length}</strong> 个模型
        </div>
      </div>

      {/* 模型卡片列表 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
        {filtered.map(m => (
          <div key={m.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 18, transition: "box-shadow 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
          >
            {/* 卡片头部 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{m.name}</span>
                  <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#eff6ff", color: "#3b82f6", fontWeight: 600 }}>{m.org}</span>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                  {taskIcon(m.task_type)}
                  <span>{m.task_type}</span>
                  <span style={{ color: "#e2e8f0" }}>·</span>
                  <span>{m.size}</span>
                  <span style={{ color: "#e2e8f0" }}>·</span>
                  <span>{m.precision[0]}</span>
                </div>
              </div>
              <button onClick={() => toggleFav(m.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0 }}>
                <Star size={15} fill={favorites.has(m.id) ? "#f59e0b" : "none"} color={favorites.has(m.id) ? "#f59e0b" : "#cbd5e1"} />
              </button>
            </div>

            {/* 描述 */}
            <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px 0", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {m.description}
            </p>

            {/* 领域标签 */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
              {m.domain_tags.map(tag => (
                <span key={tag} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>{tag}</span>
              ))}
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>{m.license}</span>
            </div>

            {/* 底部数据 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                  <Download size={11} />{formatNum(m.downloads)}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 3 }}>
                  <Star size={11} />{m.likes}
                </span>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>更新: {m.last_updated}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setDetailModel(m)} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                  <Eye size={11} />查看
                </button>
                <button onClick={() => toast.success(`开始下载 ${m.name}...`)} style={{ padding: "5px 10px", borderRadius: 5, border: "none", background: "#f59e0b", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
                  <Download size={11} />下载
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 模型详情弹窗 */}
      {detailModel && (
        <ModelDetailModal model={detailModel} onClose={() => setDetailModel(null)} favorites={favorites} toggleFav={toggleFav} />
      )}
    </div>
  );
}

// ============================================================
// 模型详情弹窗
// ============================================================
function ModelDetailModal({ model, onClose, favorites, toggleFav }: { model: Model; onClose: () => void; favorites: Set<string>; toggleFav: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 640, maxHeight: "80vh", overflowY: "auto", padding: 28 }} onClick={e => e.stopPropagation()}>
        {/* 头部 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>{model.name}</h2>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#3b82f6", fontWeight: 600 }}>{model.org}</span>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              {model.task_type} · {model.size} · {model.last_updated} 更新
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => toggleFav(model.id)} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={13} fill={favorites.has(model.id) ? "#f59e0b" : "none"} color={favorites.has(model.id) ? "#f59e0b" : "#94a3b8"} />
              {favorites.has(model.id) ? "已收藏" : "收藏"}
            </button>
            <button onClick={onClose} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer" }}>
              <X size={14} color="#94a3b8" />
            </button>
          </div>
        </div>

        {/* 统计数据 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "下载量", value: formatNum(model.downloads), color: "#2563eb" },
            { label: "关注度", value: model.likes, color: "#f59e0b" },
            { label: "协议", value: model.license, color: "#7c3aed" },
            { label: "精度", value: model.precision.length + "种", color: "#059669" },
          ].map(s => (
            <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 描述 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>模型描述</div>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, margin: 0 }}>{model.description}</p>
        </div>

        {/* 技术规格 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>支持精度</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {model.precision.map(p => <span key={p} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#3b82f6" }}>{p}</span>)}
            </div>
          </div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>推理框架</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {model.framework.map(f => <span key={f} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#f0fdf4", color: "#16a34a" }}>{f}</span>)}
            </div>
          </div>
        </div>

        {/* 领域标签 */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>适用领域</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {model.domain_tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* 操作按钮 */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { toast.success(`开始下载 ${model.name}`); onClose(); }} style={{ flex: 1, height: 40, borderRadius: 8, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Download size={14} />下载模型
          </button>
          <button onClick={() => { toast.success(`部署 ${model.name} 到 Worker`); onClose(); }} style={{ flex: 1, height: 40, borderRadius: 8, border: "1px solid #f59e0b", background: "#fff", color: "#f59e0b", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Rocket size={14} />部署到Worker
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 2: 模型文件管理
// ============================================================
function ModelFileTab() {
  const [search, setSearch] = useState("");
  const [workerFilter, setWorkerFilter] = useState("全部");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<ModelFile[]>(MOCK_MODEL_FILES);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const workers = ["全部", ...Array.from(new Set(files.map(f => f.worker)))];

  const filtered = files.filter(f => {
    const matchSearch = !search || f.name.includes(search) || f.path.includes(search);
    const matchWorker = workerFilter === "全部" || f.worker === workerFilter;
    return matchSearch && matchWorker;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(f => f.id)));
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setSelected(prev => { const next = new Set(prev); next.delete(id); return next; });
    setConfirmDelete(null);
    toast.success("文件已删除");
  };

  const batchDelete = () => {
    setFiles(prev => prev.filter(f => !selected.has(f.id)));
    setSelected(new Set());
    toast.success(`已删除 ${selected.size} 个文件`);
  };

  const statusBadge = (status: string) => {
    if (status === "ready") return <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}>就绪</span>;
    if (status === "deploying") return <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", fontWeight: 600 }}>部署中</span>;
    return <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: "#fef2f2", color: "#dc2626", fontWeight: 600 }}>异常</span>;
  };

  const fmtBadge = (fmt: string) => {
    const colors: Record<string, string> = { safetensors: "#f0fdf4:#16a34a", GGUF: "#eff6ff:#2563eb", onnx: "#fef3c7:#d97706", pytorch: "#fdf4ff:#7c3aed" };
    const [bg, color] = (colors[fmt] || "#f8fafc:#64748b").split(":");
    return <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: bg, color }}>{fmt}</span>;
  };

  return (
    <div>
      {/* 标题 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HardDrive size={18} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型文件管理</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>本地模型文件检索 · 下载 · 部署 · 删除 · 批量操作</p>
          </div>
        </div>
      </div>

      {/* 搜索与筛选 */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文件名 / 路径"
              style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 10, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
          </div>
          <select value={workerFilter} onChange={e => setWorkerFilter(e.target.value)}
            style={{ height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#fff", cursor: "pointer" }}>
            {workers.map(w => <option key={w}>{w}</option>)}
          </select>
          {selected.size > 0 && (
            <button onClick={batchDelete} style={{ height: 34, padding: "0 12px", borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
              <Trash2 size={12} />批量删除 ({selected.size})
            </button>
          )}
          <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>共 {filtered.length} 个文件</span>
        </div>

        {/* 表格 */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#64748b", width: 36, borderBottom: "1px solid #e2e8f0" }}>
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: "pointer" }} />
                </th>
                {["文件名", "路径", "格式", "大小", "Worker节点", "状态", "更新时间", "操作"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, idx) => (
                <tr key={f.id} style={{ background: idx % 2 === 1 ? "#fafafa" : "#fff" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f9ff")}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 1 ? "#fafafa" : "#fff")}
                >
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <input type="checkbox" checked={selected.has(f.id)} onChange={() => toggleSelect(f.id)} style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", fontWeight: 600, color: "#1e293b" }}>{f.name}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontFamily: "monospace", fontSize: 11 }}>{f.path}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{fmtBadge(f.format)}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{f.size}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>{f.worker}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>{statusBadge(f.status)}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9", color: "#94a3b8" }}>{f.uploaded_at}</td>
                  <td style={{ padding: "10px 12px", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => toast.success(`下载 ${f.name}`)} title="下载" style={{ padding: "4px 7px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
                        <Download size={11} color="#64748b" />
                      </button>
                      <button onClick={() => toast.success(`部署 ${f.name}`)} title="部署" style={{ padding: "4px 7px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
                        <Rocket size={11} color="#f59e0b" />
                      </button>
                      <button onClick={() => setConfirmDelete(f.id)} title="删除" style={{ padding: "4px 7px", borderRadius: 4, border: "1px solid #fecaca", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
                        <Trash2 size={11} color="#dc2626" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>暂无匹配的文件</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 确认删除弹窗 */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={20} color="#dc2626" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>确认删除文件？</h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 20px 0" }}>删除后不可恢复，请确认操作</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, height: 36, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>取消</button>
              <button onClick={() => deleteFile(confirmDelete)} style={{ flex: 1, height: 36, borderRadius: 6, border: "none", background: "#dc2626", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab 3: 模型部署管理
// ============================================================
function ModelDeployTab() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<DeployConfig>(DEPLOY_DEFAULTS);
  const [testingType, setTestingType] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [serviceUrl, setServiceUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("sk-model-xxxx-xxxx");
  const [envList, setEnvList] = useState<{ key: string; val: string }[]>([]);
  const [showEnvForm, setShowEnvForm] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState("");
  const [newEnvVal, setNewEnvVal] = useState("");

  const modelSources = [
    { label: "本地文件", value: "local", icon: HardDrive, color: "#8b5cf6" },
    { label: "开源仓库", value: "huggingface", icon: Globe, color: "#f59e0b" },
    { label: "平台模型库", value: "platform", icon: Package, color: "#2563eb" },
  ];

  const modelTypes = [
    { label: "文本生成", value: "text-generation", icon: MessageSquare, color: "#6366f1" },
    { label: "图像生成", value: "image-generation", icon: Image, color: "#ec4899" },
    { label: "语音识别", value: "asr", icon: Mic, color: "#f59e0b" },
    { label: "文本嵌入", value: "embedding", icon: AlignLeft, color: "#10b981" },
    { label: "重排序", value: "reranker", icon: ArrowUpDown, color: "#8b5cf6" },
  ];

  const backends = ["vLLM", "SGLang", "Transformers", "TGI", "Ollama"];
  const categories = [
    { label: "大语言模型 (LLM)", value: "llm" },
    { label: "视觉语言模型 (VLM)", value: "vlm" },
    { label: "语音模型", value: "speech" },
    { label: "Embedding模型", value: "embedding" },
  ];

  const testTypes = [
    { value: "chat", label: "对话交互", icon: MessageSquare, color: "#6366f1", placeholder: "请输入对话内容...", example: "请介绍一下人工智能的发展历史" },
    { value: "image", label: "图像生成", icon: Image, color: "#ec4899", placeholder: "请描述想要生成的图像...", example: "一只戴着墨镜的柯基在海边玩耍" },
    { value: "asr", label: "语音转文本", icon: Mic, color: "#f59e0b", placeholder: "上传音频文件路径...", example: "/audio/sample.wav" },
    { value: "embedding", label: "文本嵌入", icon: AlignLeft, color: "#10b981", placeholder: "输入文本获取向量...", example: "人工智能是计算机科学的一个分支" },
    { value: "rerank", label: "文本重排", icon: ArrowUpDown, color: "#8b5cf6", placeholder: "输入查询和文档...", example: "查询: 机器学习 | 文档: 深度学习是机器学习的子领域..." },
  ];

  const runTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    await new Promise(r => setTimeout(r, 1800));
    const results: Record<string, string> = {
      chat: `{"id":"gen-001","model":"${config.model_name || "model"}","choices":[{"message":{"role":"assistant","content":"这是AI助手的回复结果。当前模型已成功部署，正在正常提供服务。响应时间约 120ms，生成速度 45 tokens/s。"}}],"usage":{"prompt_tokens":28,"completion_tokens":52,"total_tokens":80}}`,
      image: `{"id":"img-001","model":"${config.model_name || "model"}","data":[{"url":"https://picsum.photos/512/512?random=1","revised_prompt":"Generated image based on your input"}],"usage":1}`,
      asr: `{"id":"asr-001","text":"这是一段语音转文本的示例输出，识别置信度 98.5%，处理耗时 320ms。","segments":[{"start":0.0,"end":3.2,"text":"这是一段语音转文本的示例输出"}]}`,
      embedding: `{"id":"emb-001","model":"${config.model_name || "model"}","data":[{"embedding":[0.0231,-0.0452,0.0876,...],"index":0}],"usage":{"prompt_tokens":12}}`,
      rerank: `{"id":"rerank-001","results":[{"index":0,"document":"深度学习是机器学习的一个分支","relevance_score":0.96},{"index":1,"document":"机器学习 applications","relevance_score":0.72}]}`,
    };
    setTestResult(results[testingType || "chat"]);
    setTestLoading(false);
  };

  const addEnvVar = () => {
    if (newEnvKey && newEnvVal) {
      setEnvList(prev => [...prev, { key: newEnvKey, val: newEnvVal }]);
      setConfig(prev => ({ ...prev, env_vars: { ...prev.env_vars, [newEnvKey]: newEnvVal } }));
      setNewEnvKey("");
      setNewEnvVal("");
    }
  };

  const removeEnvVar = (key: string) => {
    setEnvList(prev => prev.filter(e => e.key !== key));
    const updated = { ...config.env_vars };
    delete updated[key];
    setConfig(prev => ({ ...prev, env_vars: updated }));
  };

  const deploy = () => {
    if (!config.model_name) { toast.error("请填写模型名称"); return; }
    if (!config.model_source) { toast.error("请选择模型来源"); return; }
    toast.success("模型部署任务已提交，请稍候...");
    setServiceUrl("https://api.example.com/v1/chat/completions");
  };

  return (
    <div>
      {/* 标题 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Rocket size={18} color="#f59e0b" />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型部署管理</h2>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>模型部署与服务化 · 多副本负载均衡 · OpenAI兼容接口</p>
          </div>
        </div>
      </div>

      {/* 步骤条 */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
        {["选择模型", "配置参数", "测试验证", "部署发布"].map((s, i) => {
          const num = i + 1;
          const isActive = step === num;
          const isDone = step > num;
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: isDone ? "#16a34a" : isActive ? "#f59e0b" : "#e2e8f0",
                  color: isDone || isActive ? "#fff" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                }}>
                  {isDone ? <CheckCircle2 size={14} /> : num}
                </div>
                <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isDone || isActive ? "#1e293b" : "#94a3b8" }}>{s}</span>
              </div>
              {i < 3 && <div style={{ width: 40, height: 2, background: isDone ? "#bbf7d0" : "#e2e8f0", flexShrink: 0, margin: "0 4px", alignSelf: "center" }} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* 步骤1: 选择模型来源 */}
      {step === 1 && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>选择模型来源</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>选择本地文件、HuggingFace 开源模型或平台模型库</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
            {modelSources.map(s => {
              const Icon = s.icon;
              const isSelected = config.model_source === s.value;
              return (
                <div key={s.value} onClick={() => { setConfig(prev => ({ ...prev, model_source: s.value })); setStep(2); }}
                  style={{ borderRadius: 10, border: `2px solid ${isSelected ? s.color : "#e2e8f0"}`, background: isSelected ? `${s.color}08` : "#fff", padding: 20, cursor: "pointer", transition: "all 0.15s", textAlign: "center" }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = s.color; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                    <Icon size={22} color={s.color} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{s.label}</div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>选择模型类型</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 20 }}>
            {modelTypes.map(t => {
              const Icon = t.icon;
              const isSelected = config.model_type === t.value;
              return (
                <div key={t.value} onClick={() => setConfig(prev => ({ ...prev, model_type: t.value }))}
                  style={{ borderRadius: 8, border: `1px solid ${isSelected ? t.color : "#e2e8f0"}`, background: isSelected ? `${t.color}08` : "#fff", padding: "12px 10px", cursor: "pointer", textAlign: "center", transition: "all 0.1s" }}>
                  <Icon size={16} color={isSelected ? t.color : "#94a3b8"} style={{ display: "block", margin: "0 auto 6px" }} />
                  <div style={{ fontSize: 11, fontWeight: isSelected ? 600 : 400, color: isSelected ? t.color : "#64748b" }}>{t.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 步骤2: 配置参数 */}
      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* 基本信息 */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Settings size={14} color="#f59e0b" /> 基本配置
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "模型名称 *", key: "model_name", type: "text", placeholder: "例如: qwen2.5-7b-chat", full: true },
                { label: "模型描述", key: "description", type: "text", placeholder: "简要描述此部署用途", full: true },
                { label: "后端引擎 *", key: "backend", type: "select", options: backends },
                { label: "模型类别", key: "model_category", type: "select", options: categories.map(c => c.label), optionValues: categories.map(c => c.value) },
                { label: "副本数", key: "replicas", type: "number", min: 1, max: 10 },
                { label: "后端版本", key: "backend_version", type: "text", placeholder: "固定版本确保一致性", value: "v0.4.3" },
              ].map(field => (
                <div key={field.key} style={field.full ? { gridColumn: "1 / -1" } : {}}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>{field.label}</label>
                  {field.type === "select" ? (
                    <select value={(config as any)[field.key] || ""} onChange={e => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#fff" }}>
                      {(field.optionValues || field.options || []).map((o, i) => (
                        <option key={o} value={field.optionValues ? (field.optionValues as string[])[i] : o}>{field.optionValues ? (field.options as string[])[i] : o}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={field.type} value={(config as any)[field.key] || field.value || ""} placeholder={field.placeholder}
                      min={field.min} max={field.max}
                      onChange={e => setConfig(prev => ({ ...prev, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                      style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 调度配置 */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Server size={14} color="#f59e0b" /> 调度与放置策略
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>调度方式</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ label: "自动调度", value: "auto" }, { label: "手动调度", value: "manual" }].map(opt => (
                    <button key={opt.value} onClick={() => setConfig(prev => ({ ...prev, scheduling: opt.value as "auto" | "manual" }))}
                      style={{ flex: 1, height: 34, borderRadius: 6, border: `1px solid ${config.scheduling === opt.value ? "#f59e0b" : "#e2e8f0"}`, background: config.scheduling === opt.value ? "#fffbeb" : "#fff", color: config.scheduling === opt.value ? "#d97706" : "#64748b", fontSize: 12, fontWeight: config.scheduling === opt.value ? 600 : 400, cursor: "pointer" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>放置策略</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ label: "自动", value: "auto" }, { label: "分散", value: "spread" }, { label: "紧凑", value: "packed" }].map(opt => (
                    <button key={opt.value} onClick={() => setConfig(prev => ({ ...prev, placement: opt.value as "auto" | "spread" | "packed" }))}
                      style={{ flex: 1, height: 34, borderRadius: 6, border: `1px solid ${config.placement === opt.value ? "#f59e0b" : "#e2e8f0"}`, background: config.placement === opt.value ? "#fffbeb" : "#fff", color: config.placement === opt.value ? "#d97706" : "#64748b", fontSize: 12, fontWeight: config.placement === opt.value ? 600 : 400, cursor: "pointer" }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>Worker 选择器</label>
                <input value={config.worker_selector} onChange={e => setConfig(prev => ({ ...prev, worker_selector: e.target.value }))} placeholder="例如: gpu.mem >= 20Gi, gpu.count >= 1"
                  style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
            </div>
          </div>

          {/* 推理参数 */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Zap size={14} color="#f59e0b" /> 推理参数
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>最大 Token 数</label>
                <input type="number" value={config.inference_max_tokens} onChange={e => setConfig(prev => ({ ...prev, inference_max_tokens: Number(e.target.value) }))}
                  style={{ width: "100%", height: 34, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 5 }}>
                  Temperature <span style={{ fontWeight: 400 }}>({config.inference_temperature})</span>
                </label>
                <input type="range" min={0} max={2} step={0.1} value={config.inference_temperature} onChange={e => setConfig(prev => ({ ...prev, inference_temperature: Number(e.target.value) }))}
                  style={{ width: "100%", height: 34, display: "flex", alignItems: "center" }} />
              </div>
            </div>
          </div>

          {/* 环境变量 */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                <Hash size={14} color="#f59e0b" /> 环境变量
              </div>
              <button onClick={() => setShowEnvForm(!showEnvForm)} style={{ padding: "4px 12px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 4 }}>
                <Plus size={12} />添加变量
              </button>
            </div>
            {showEnvForm && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, padding: 14, background: "#f8fafc", borderRadius: 8 }}>
                <input value={newEnvKey} onChange={e => setNewEnvKey(e.target.value)} placeholder="变量名" style={{ flex: 1, height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none" }} />
                <input value={newEnvVal} onChange={e => setNewEnvVal(e.target.value)} placeholder="变量值" style={{ flex: 1, height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none" }} />
                <button onClick={addEnvVar} style={{ height: 32, padding: "0 12px", borderRadius: 6, border: "none", background: "#f59e0b", color: "#fff", fontSize: 12, cursor: "pointer" }}>保存</button>
              </div>
            )}
            {envList.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {envList.map(e => (
                  <div key={e.key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#f8fafc", borderRadius: 6 }}>
                    <code style={{ flex: 1, fontSize: 12, color: "#2563eb" }}>{e.key}</code>
                    <code style={{ flex: 1, fontSize: 12, color: "#64748b" }}>{e.val}</code>
                    <button onClick={() => removeEnvVar(e.key)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}><X size={13} color="#94a3b8" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: 16 }}>暂无环境变量</div>
            )}
          </div>

          {/* 下一步 */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(1)} style={{ height: 38, padding: "0 16px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
            <button onClick={() => setStep(3)} style={{ height: 38, padding: "0 20px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>下一步 → 测试验证</button>
          </div>
        </div>
      )}

      {/* 步骤3: 测试验证 */}
      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <Gauge size={14} color="#f59e0b" /> 模型测试
            </div>
            {/* 测试类型选择 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {testTypes.map(t => {
                const Icon = t.icon;
                const isSelected = testingType === t.value;
                return (
                  <button key={t.value} onClick={() => { setTestingType(t.value); setTestResult(null); setTestInput(t.example || ""); }}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 6, border: `1px solid ${isSelected ? t.color : "#e2e8f0"}`, background: isSelected ? `${t.color}10` : "#fff", color: isSelected ? t.color : "#64748b", fontSize: 12, fontWeight: isSelected ? 600 : 400, cursor: "pointer" }}>
                    <Icon size={13} />{t.label}
                  </button>
                );
              })}
            </div>

            {testingType && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <textarea
                    value={testInput}
                    onChange={e => setTestInput(e.target.value)}
                    placeholder={testTypes.find(t => t.value === testingType)?.placeholder}
                    rows={4}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, color: "#334155", outline: "none", background: "#f8fafc", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                  <button onClick={runTest} disabled={testLoading}
                    style={{ height: 36, padding: "0 18px", borderRadius: 6, border: "none", background: testLoading ? "#e2e8f0" : "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: testLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    {testLoading ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />测试中...</> : <><Play size={13} />发送请求</>}
                  </button>
                  {testLoading && <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center" }}>等待模型响应，请稍候...</div>}
                </div>
                {testResult && (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>返回结果</div>
                    <pre style={{ background: "#0f172a", color: "#e2e8f0", padding: 16, borderRadius: 8, fontSize: 11, overflowX: "auto", lineHeight: 1.6, margin: 0, maxHeight: 280, overflowY: "auto" }}>
                      {JSON.stringify(JSON.parse(testResult), null, 2)}
                    </pre>
                  </div>
                )}
              </>
            )}
            {!testingType && (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>请选择测试类型开始验证模型接口</div>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => setStep(2)} style={{ height: 38, padding: "0 16px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>← 上一步</button>
            <button onClick={() => { if (!testingType) { toast.error("请先进行模型测试"); return; } deploy(); setStep(4); }}
              style={{ height: 38, padding: "0 20px", borderRadius: 7, border: "none", background: "#16a34a", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              部署模型 →
            </button>
          </div>
        </div>
      )}

      {/* 步骤4: 部署完成 */}
      {step === 4 && serviceUrl && (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28, textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={30} color="#16a34a" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: "0 0 6px 0" }}>部署成功！</h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 24px 0" }}>模型已成功部署并开始提供服务，支持 OpenAI 兼容接口</p>

          <div style={{ background: "#0f172a", borderRadius: 10, padding: "16px 20px", textAlign: "left", marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>API 地址</span>
              <button onClick={() => { navigator.clipboard.writeText(serviceUrl); toast.success("已复制"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Copy size={12} color="#94a3b8" /> <span style={{ fontSize: 11, color: "#94a3b8" }}>复制</span>
              </button>
            </div>
            <code style={{ fontSize: 13, color: "#a5f3fc", fontFamily: "monospace", display: "block", marginBottom: 12, wordBreak: "break-all" }}>{serviceUrl}</code>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>API Key</span>
              <button onClick={() => { navigator.clipboard.writeText(apiKey); toast.success("已复制"); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <Copy size={12} color="#94a3b8" /> <span style={{ fontSize: 11, color: "#94a3b8" }}>复制</span>
              </button>
            </div>
            <code style={{ fontSize: 13, color: "#a5f3fc", fontFamily: "monospace" }}>{apiKey}</code>
          </div>

          {/* 使用统计 */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20, textAlign: "center" }}>
            {[
              { label: "累计调用", value: "2,847", unit: "次" },
              { label: "今日调用", value: "342", unit: "次" },
              { label: "平均延迟", value: "128", unit: "ms" },
              { label: "在线状态", value: "●", unit: "正常", color: "#16a34a" },
            ].map(s => (
              <div key={s.label} style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 10px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: s.color || "#1e293b" }}>{s.value}<span style={{ fontSize: 11, fontWeight: 400, marginLeft: 2 }}>{s.unit}</span></div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={() => { setStep(1); setServiceUrl(null); }} style={{ height: 38, padding: "0 18px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <RotateCcw size={13} />再次部署
            </button>
            <button onClick={() => window.open(serviceUrl, "_blank")} style={{ height: 38, padding: "0 18px", borderRadius: 7, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <ExternalLink size={13} />打开文档
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function ModelRepoPage() {
  const [tab, setTab] = useState<"registry" | "files" | "deploy">("registry");

  const tabs = [
    { key: "registry" as const, label: "模型仓库", icon: Package },
    { key: "files" as const, label: "模型文件", icon: HardDrive },
    { key: "deploy" as const, label: "模型部署", icon: Rocket },
  ];

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部标题 */}
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>模型仓库</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>模型检索 · 文件管理 · 部署与服务化</p>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div style={{ padding: "20px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0" }}>
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 16px",
                  border: "none", background: "transparent",
                  borderBottom: `2px solid ${isActive ? "#f59e0b" : "transparent"}`,
                  color: isActive ? "#f59e0b" : "#64748b",
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", marginBottom: -2,
                  transition: "all 0.15s",
                }}>
                <Icon size={14} />{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 内容区 */}
      <div style={{ padding: "20px 32px 32px" }}>
        {tab === "registry" && <ModelRegistryTab />}
        {tab === "files" && <ModelFileTab />}
        {tab === "deploy" && <ModelDeployTab />}
      </div>
    </main>
  );
}
