"use client";
import React, { useState } from "react";
import {
  FileText, Plus, Search, Settings, Trash2, Eye, Edit3, Copy, Download,
  ChevronRight, ChevronDown, Tag, Layers, RefreshCw, Sparkles,
  MessageSquare, CheckCircle2, AlertCircle, X, Hash, ToggleLeft, ToggleRight,
  AlignLeft, Code2, Clock, ArrowUpDown
} from "lucide-react";
import toast from "react-hot-toast";

interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  tags: string[];
  system_prompt: string;
  user_prompt: string;
  variables: string[];
  version: string;
  updated_at: string;
  is_builtin: boolean;
  usage_count: number;
  avg_score?: number;
}

const MOCK_TEMPLATES: PromptTemplate[] = [
  {
    id: "p1", name: "通用助手", category: "对话", tags: ["通用", "助手"],
    system_prompt: "你是一个乐于助人、知识渊博的AI助手。请根据用户的提问，提供准确、全面且有用的回答。如果不确定答案，请诚实说明。",
    user_prompt: "{{user_question}}",
    variables: ["user_question"], version: "1.2.0", updated_at: "2025-04-10", is_builtin: true, usage_count: 2840,
  },
  {
    id: "p2", name: "代码生成助手", category: "代码", tags: ["编程", "代码"],
    system_prompt: "你是一位经验丰富的软件工程师，擅长编写高质量代码。请根据用户需求生成清晰、高效、可维护的代码，并附上必要的注释。",
    user_prompt: "请用{{language}}编写一个{{task_description}}，要求：\n{{requirements}}",
    variables: ["language", "task_description", "requirements"], version: "1.1.0", updated_at: "2025-04-08", is_builtin: true, usage_count: 1560,
  },
  {
    id: "p3", name: "客服问答", category: "客服", tags: ["客服", "FAQ"],
    system_prompt: "你是一位专业的客服代表，态度友好、专业。请根据产品知识和FAQ库，准确回答用户问题，并适时引导至相关资源。",
    user_prompt: "用户问题：{{question}}\n\n相关知识：\n{{context}}",
    variables: ["question", "context"], version: "1.0.0", updated_at: "2025-04-05", is_builtin: true, usage_count: 3200,
  },
  {
    id: "p4", name: "文章摘要", category: "文本处理", tags: ["摘要", "文本"],
    system_prompt: "你是一位专业的内容编辑，擅长提取文章的核心要点。请生成一段简洁、准确的摘要，长度控制在{{length}}字以内。",
    user_prompt: "请为以下文章写一段摘要：\n\n{{article_content}}",
    variables: ["length", "article_content"], version: "1.0.0", updated_at: "2025-04-01", is_builtin: false, usage_count: 430,
  },
  {
    id: "p5", name: "数据分析报告", category: "数据分析", tags: ["分析", "报告"],
    system_prompt: "你是一位资深数据分析师，擅长从数据中发现洞察。请对提供的数据进行分析，并生成结构化的分析报告。",
    user_prompt: "请分析以下数据并生成报告：\n{{data_description}}\n\n分析维度：{{dimensions}}",
    variables: ["data_description", "dimensions"], version: "1.0.0", updated_at: "2025-03-28", is_builtin: false, usage_count: 280,
  },
];

const CATEGORIES = ["全部", "对话", "代码", "客服", "文本处理", "数据分析", "其他"];
const CATEGORY_COLORS: Record<string, string> = {
  "对话": "#3b82f6", "代码": "#8b5cf6", "客服": "#10b981", "文本处理": "#f59e0b", "数据分析": "#ec4899", "其他": "#64748b",
};

export default function PromptManagementPage() {
  const [tab, setTab] = useState<"list" | "create" | "editor">("list");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");
  const [templates, setTemplates] = useState<PromptTemplate[]>(MOCK_TEMPLATES);
  const [editTemplate, setEditTemplate] = useState<PromptTemplate | null>(null);
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});
  const [previewResult, setPreviewResult] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "", category: "对话", tags: "", system_prompt: "", user_prompt: "",
  });

  const filtered = templates.filter(t => {
    const matchSearch = !search || t.name.includes(search) || t.tags.some(tag => tag.includes(search));
    const matchCat = category === "全部" || t.category === category;
    return matchSearch && matchCat;
  });

  const openEditor = (t: PromptTemplate) => {
    setEditTemplate(t);
    const vars: Record<string, string> = {};
    t.variables.forEach(v => { vars[v] = ""; });
    setPreviewVars(vars);
    setPreviewResult("");
    setTab("editor");
  };

  const getTokenCount = (text: string) => Math.ceil(text.length / 4);

  const runPreview = async () => {
    if (!editTemplate) return;
    setPreviewLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const filledSystem = editTemplate.system_prompt;
    const filledUser = editTemplate.user_prompt;
    const vars = editTemplate.variables;
    let userText = filledUser;
    vars.forEach(v => { userText = userText.replace(`{{${v}}}`, previewVars[v] || `[${v}]`); });
    setPreviewResult(`[System]\n${filledSystem}\n\n[User]\n${userText}\n\n[Assistant]\n这是一条模拟预览回复。实际调用时会由AI模型根据填写的变量内容生成真实的回复结果。`);
    setPreviewLoading(false);
  };

  const copyTemplate = (t: PromptTemplate) => {
    const text = `【系统提示词】\n${t.system_prompt}\n\n【用户提示词】\n${t.user_prompt}`;
    navigator.clipboard.writeText(text);
    toast.success("已复制到剪贴板");
  };

  const saveNew = () => {
    if (!newTemplate.name || !newTemplate.system_prompt) { toast.error("请填写名称和系统提示词"); return; }
    const tmpl: PromptTemplate = {
      id: "p" + Date.now(), ...newTemplate, tags: newTemplate.tags.split(",").map(t => t.trim()).filter(Boolean),
      variables: [...newTemplate.system_prompt.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]),
      version: "1.0.0", updated_at: new Date().toLocaleDateString("zh-CN"), is_builtin: false, usage_count: 0,
    };
    setTemplates(prev => [tmpl, ...prev]);
    setNewTemplate({ name: "", category: "对话", tags: "", system_prompt: "", user_prompt: "" });
    setTab("list");
    toast.success("模板创建成功");
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FileText size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>Prompt管理</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>提示词模板库 · 智能优化 · 企业级资产管理</p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button onClick={() => setTab("create")} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 14px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={13} />新建模板
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e2e8f0", marginBottom: 20 }}>
          {[{ key: "list", label: "模板列表", icon: AlignLeft }, { key: "create", label: "新建模板", icon: Plus }, { key: "editor", label: "模板编辑器", icon: Edit3 }].map(t => {
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
        {/* 模板列表 */}
        {tab === "list" && (
          <div>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 20px", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 220px" }}>
                  <Search size={13} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索模板名称或标签"
                    style={{ width: "100%", height: 34, paddingLeft: 32, paddingRight: 10, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                </div>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${category === c ? "#f59e0b" : "#e2e8f0"}`, background: category === c ? "#fffbeb" : "#fff", color: category === c ? "#d97706" : "#64748b", fontSize: 11, cursor: "pointer", fontWeight: category === c ? 600 : 400 }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(t => (
                <div key={t.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, transition: "box-shadow 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{t.name}</span>
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: `${CATEGORY_COLORS[t.category]}15`, color: CATEGORY_COLORS[t.category], fontWeight: 600 }}>{t.category}</span>
                        {t.is_builtin && <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: "#f0fdf4", color: "#16a34a", fontWeight: 600 }}>内置</span>}
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>v{t.version}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {t.tags.map(tag => (
                          <span key={tag} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={() => openEditor(t)} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                        <Edit3 size={11} color="#64748b" />编辑
                      </button>
                      <button onClick={() => copyTemplate(t)} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                        <Copy size={11} color="#64748b" />复制
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 10px 0", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {t.system_prompt}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9", fontSize: 11, color: "#94a3b8" }}>
                    <span>变量: {t.variables.join(", ")}</span>
                    <span>使用次数: <strong style={{ color: "#334155" }}>{t.usage_count.toLocaleString()}</strong></span>
                    <span>更新: {t.updated_at}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Hash size={11} />{getTokenCount(t.system_prompt + t.user_prompt)} tokens</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 新建模板 */}
        {tab === "create" && (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>模板名称 *</label>
                <input value={newTemplate.name} onChange={e => setNewTemplate(p => ({ ...p, name: e.target.value }))} placeholder="例如: 代码生成助手"
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>分类</label>
                <select value={newTemplate.category} onChange={e => setNewTemplate(p => ({ ...p, category: e.target.value }))}
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", background: "#fff" }}>
                  {CATEGORIES.filter(c => c !== "全部").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>标签 (逗号分隔)</label>
                <input value={newTemplate.tags} onChange={e => setNewTemplate(p => ({ ...p, tags: e.target.value }))} placeholder="例如: 编程, 代码, 开发"
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>
                系统提示词 * <span style={{ fontWeight: 400, color: "#94a3b8" }}>（使用 {{变量名}} 定义占位符）</span>
              </label>
              <textarea value={newTemplate.system_prompt} onChange={e => setNewTemplate(p => ({ ...p, system_prompt: e.target.value }))} placeholder="定义AI的角色、行为规则和约束..."
                rows={6} style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "right" }}><Hash size={11} style={{ display: "inline" }} /> {getTokenCount(newTemplate.system_prompt)} tokens</div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>用户提示词模板</label>
              <textarea value={newTemplate.user_prompt} onChange={e => setNewTemplate(p => ({ ...p, user_prompt: e.target.value }))} placeholder="用户输入的模板，使用 {{变量名}} 占位..."
                rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "right" }}><Hash size={11} style={{ display: "inline" }} /> {getTokenCount(newTemplate.user_prompt)} tokens</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setTab("list")} style={{ padding: "9px 20px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>取消</button>
              <button onClick={saveNew} style={{ padding: "9px 24px", borderRadius: 7, border: "none", background: "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>保存模板</button>
            </div>
          </div>
        )}

        {/* 模板编辑器 + 预览 */}
        {tab === "editor" && editTemplate && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>模板编辑</h3>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{editTemplate.name} · v{editTemplate.version}</div>
                </div>
                <button onClick={() => setTab("list")} style={{ padding: "5px 10px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>× 关闭</button>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>系统提示词</label>
                <div style={{ background: "#1e293b", borderRadius: 6, padding: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 10, color: "#64748b" }}>System</span>
                </div>
                <textarea value={editTemplate.system_prompt} readOnly
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box", minHeight: 120, background: "#f8fafc" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>用户提示词模板</label>
                <textarea value={editTemplate.user_prompt} readOnly
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", resize: "vertical", fontFamily: "monospace", boxSizing: "border-box", minHeight: 80, background: "#f8fafc" }} />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: "#94a3b8" }}>变量:</span>
                {editTemplate.variables.map(v => (
                  <span key={v} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", fontFamily: "monospace" }}>{`{{${v}}}`}</span>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 8 }}>填充变量</label>
                {editTemplate.variables.map(v => (
                  <div key={v} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 3, fontFamily: "monospace" }}>{v}</label>
                    <input value={previewVars[v] || ""} onChange={e => setPreviewVars(prev => ({ ...prev, [v]: e.target.value }))}
                      placeholder={`输入 ${v} 的值...`}
                      style={{ width: "100%", height: 32, padding: "0 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, outline: "none", background: "#f8fafc", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <button onClick={runPreview} disabled={previewLoading}
                style={{ width: "100%", height: 38, borderRadius: 7, border: "none", background: previewLoading ? "#e2e8f0" : "#f59e0b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: previewLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                {previewLoading ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />生成中...</> : <><Sparkles size={13} />预览效果</>}
              </button>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>实时预览</h3>
                {previewResult && (
                  <button onClick={() => navigator.clipboard.writeText(previewResult)}
                    style={{ padding: "4px 10px", borderRadius: 5, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                    <Copy size={11} />复制
                  </button>
                )}
              </div>
              {previewResult ? (
                <div>
                  {previewResult.split("\n\n").map((block, i) => {
                    const role = block.startsWith("[System]") ? "System" : block.startsWith("[User]") ? "User" : block.startsWith("[Assistant]") ? "Assistant" : null;
                    const colors: Record<string, string> = { System: "#3b82f6", User: "#16a34a", Assistant: "#f59e0b" };
                    const bgs: Record<string, string> = { System: "#eff6ff", User: "#f0fdf4", Assistant: "#fffbeb" };
                    return (
                      <div key={i} style={{ marginBottom: 12 }}>
                        {role && <div style={{ fontSize: 11, fontWeight: 700, color: colors[role], marginBottom: 4 }}>{role}</div>}
                        <div style={{ padding: "10px 14px", borderRadius: "0 10px 10px 10px", background: role ? bgs[role] : "#f8fafc", border: "1px solid #e2e8f0", fontSize: 12, color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: role ? "inherit" : "monospace" }}>
                          {block.replace(/^\[(System|User|Assistant)\]\n/, "")}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 13 }}>
                  <Sparkles size={32} style={{ display: "block", margin: "0 auto 12px", opacity: 0.5 }} />
                  填写左侧变量后点击"预览效果"查看
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}
