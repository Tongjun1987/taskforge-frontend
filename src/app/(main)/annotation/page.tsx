"use client";
import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { listAnnotationJobs } from "@/lib/services";
import {
  MOCK_ANNOTATION_JOBS,
  ANNOTATION_TYPES,
  ANNOTATION_STATUS,
  LABEL_TEMPLATES,
} from "./_mock";
import {
  Plus, Search, RefreshCw, Play, Eye, Trash2, Tag, Users,
  ChevronLeft, ChevronRight, TrendingUp, FileText, CheckCircle2,
  Layers, Database, Zap, BookOpen, Video, Mic, Box, GitMerge, Brain, TreePine, Network, Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

interface AnnotationJob {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  annotators: string[];
  annotator_team?: string;
  total_items: number;
  completed_items: number;
  kappa_score?: number;
  status: string;
  task_type: string;
  annotation_type: string;
  label_template?: string;
  created_at: string;
}

const STORAGE_KEY = "taskforge_annotation_jobs";

function getJobs(): AnnotationJob[] {
  if (typeof window === "undefined") return MOCK_ANNOTATION_JOBS;
  try {
    const d = localStorage.getItem(STORAGE_KEY);
    return d ? JSON.parse(d) : MOCK_ANNOTATION_JOBS;
  } catch {
    return MOCK_ANNOTATION_JOBS;
  }
}
function saveJobs(jobs: AnnotationJob[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

// 标注模板定义
const TEMPLATE_GROUPS = [
  {
    title: "基础素材标注",
    icon: Database,
    color: "#6366f1",
    bg: "#eef2ff",
    templates: [
      { id: "text_annotation",   label: "文本标注",  desc: "实体识别、关系抽取、情感分析、问答标注",   icon: FileText,   color: "#2563eb", bg: "#dbeafe" },
      { id: "image_annotation",  label: "图像标注",  desc: "分类、目标检测、语义分割、OCR",         icon: Eye,        color: "#7c3aed", bg: "#f3e8ff" },
      { id: "video_annotation",  label: "视频标注",  desc: "视频分类、行为检测、关键帧标注",       icon: Video,      color: "#dc2626", bg: "#fee2e2" },
      { id: "audio_annotation",  label: "音频标注",  desc: "音频分类、语音识别、情绪识别",         icon: Mic,        color: "#d97706", bg: "#fef3c7" },
      { id: "pointcloud_anno",  label: "点云三维标注", desc: "3D点云目标检测、场景分割、位姿估计",  icon: Box,        color: "#059669", bg: "#d1fae5" },
      { id: "multimodal_anno",  label: "多模态对齐标注", desc: "图文对齐、视频-文本对齐、跨模态关联", icon: GitMerge,   color: "#db2777", bg: "#fce7f3" },
    ],
  },
  {
    title: "对齐推理标注",
    icon: Wrench,
    color: "#7c3aed",
    bg: "#f5f3ff",
    templates: [
      { id: "sft_annotation",   label: "SFT 监督微调标注", desc: "构建 Instruction-Input-Output 高质量样本",        icon: BookOpen,     color: "#0284c7", bg: "#e0f2fe" },
      { id: "dpo_annotation",   label: "DPO 偏好优化标注", desc: "标注 chosen/rejected 偏好对，用于DPO训练",          icon: Zap,          color: "#7c3aed", bg: "#f5f3ff" },
      { id: "ppo_annotation",   label: "PPO/RLHF 样本构建", desc: "构建奖励模型训练数据、RLHF样本对",                icon: TrendingUp,  color: "#ea580c", bg: "#fff7ed" },
      { id: "cot_annotation",   label: "CoT 思维链推理标注", desc: "标注中间推理步骤，构建思维链训练数据",            icon: Brain,        color: "#16a34a", bg: "#dcfce7" },
      { id: "tot_annotation",   label: "ToT 树状推理标注",  desc: "标注多分支推理路径，构建树状思维训练样本",      icon: TreePine,     color: "#d97706", bg: "#fef3c7" },
      { id: "got_annotation",   label: "GoT 图状推理标注",  desc: "标注图结构推理过程，构建图状思维训练数据",        icon: Network,      color: "#be185d", bg: "#fce7f3" },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const statusInfo = ANNOTATION_STATUS[status] || ANNOTATION_STATUS.pending;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 600,
      background: statusInfo.bg,
      color: statusInfo.color
    }}>
      {statusInfo.label}
    </span>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = pct === 100 ? "#16a34a" : pct > 50 ? "#2563eb" : "#f59e0b";
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3, fontSize: 11, color: "#94a3b8" }}>
        <span>{value.toLocaleString()} / {total.toLocaleString()}</span>
        <span style={{ color, fontWeight: 600 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export default function AnnotationPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<AnnotationJob[]>(MOCK_ANNOTATION_JOBS);
  const [refreshing, setRefreshing] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateTab, setTemplateTab] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 仅客户端执行：拉取 API + 读 localStorage（避免 hydration 不匹配）
  useEffect(() => {
    // 优先从 localStorage 恢复用户数据（比 mock 优先）
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          startTransition(() => setJobs(parsed));
        }
      }
    } catch { /* ignore */ }

    setRefreshing(true);
    (async () => {
      try {
        const res = await listAnnotationJobs();
        const items = res?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          startTransition(() => setJobs(items));
        }
      } catch {
        // API 失败，保留现有 mock/localStorage 数据
      } finally {
        setRefreshing(false);
      }
    })();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    (async () => {
      try {
        const res = await listAnnotationJobs();
        const items = res.data?.items || [];
        const list = items.length > 0 ? items : getJobs();
        startTransition(() => setJobs(list));
        toast.success("数据已刷新");
      } catch {
        toast.error("刷新失败，展示本地数据");
        startTransition(() => setJobs(getJobs()));
      } finally {
        setRefreshing(false);
      }
    })();
  };

  // 按创建时间倒序排列
  const sorted = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = sorted.filter(j => {
    const nameMatch = !searchName || j.name.includes(searchName) || j.dataset_name?.includes(searchName);
    const statusMatch = !statusFilter || j.status === statusFilter;
    const typeMatch = !typeFilter || j.annotation_type === typeFilter;
    return nameMatch && statusMatch && typeMatch;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确认删除「${name}」？`)) {
      const updated = jobs.filter(j => j.id !== id);
      saveJobs(updated);
      setJobs(updated);
      toast.success("已删除");
    }
  };

  const stats = {
    total: jobs.length,
    inProgress: jobs.filter(j => j.status === "in_progress").length,
    completed: jobs.filter(j => j.status === "completed").length,
    avgKappa: (() => {
      const withKappa = jobs.filter(j => j.kappa_score != null);
      return withKappa.length > 0 ? (withKappa.reduce((a, j) => a + (j.kappa_score || 0), 0) / withKappa.length).toFixed(2) : "—";
    })(),
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部标题 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tag size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据标注</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>人工标注 · 质量协同 · Kappa 一致性检验</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 8, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", fontSize: 13, fontWeight: 600, cursor: refreshing ? "not-allowed" : "pointer", opacity: refreshing ? 0.6 : 1 }}
          >
            <RefreshCw size={16} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} /> {refreshing ? "刷新中" : "刷新"}
          </button>
          <button
            onClick={() => setShowTemplates(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: showTemplates ? "#eef2ff" : "#fff", color: showTemplates ? "#6366f1" : "#64748b", border: `1px solid ${showTemplates ? "#6366f1" : "#e2e8f0"}`, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Layers size={16} /> 标注模板
          </button>
          <button
            onClick={() => router.push("/annotation/create")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={16} /> 新建标注任务
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "标注任务", value: stats.total, unit: "个", color: "#6366f1", bg: "#eef2ff" },
          { label: "进行中",   value: stats.inProgress, unit: "个", color: "#d97706", bg: "#fffbeb" },
          { label: "已完成",   value: stats.completed, unit: "个", color: "#16a34a", bg: "#f0fdf4" },
          { label: "平均 Kappa", value: stats.avgKappa, unit: "", color: "#7c3aed", bg: "#faf5ff" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>
              {card.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{card.unit}</span>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* 标注模板入口（仿数据清洗算子卡片样式） */}
      {showTemplates && (
        <div style={{ marginBottom: 24 }}>
          {/* 分组 Tab */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {TEMPLATE_GROUPS.map((g, i) => {
              const GI = g.icon;
              return (
                <button
                  key={g.title}
                  onClick={() => setTemplateTab(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 8,
                    border: templateTab === i ? `1px solid ${g.color}` : "1px solid #e2e8f0",
                    background: templateTab === i ? g.bg : "#fff",
                    color: templateTab === i ? g.color : "#64748b",
                    fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  <GI size={14} />
                  {g.title}
                </button>
              );
            })}
          </div>
          {/* 卡片网格（仿数据清洗算子样式） */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
            {TEMPLATE_GROUPS[templateTab].templates.map(t => {
              const TIcon = t.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => router.push(`/annotation/create?template=${t.id}`)}
                  style={{
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                    padding: 18, transition: "box-shadow 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  {/* 头部：图标 + 名称 + 标签 */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TIcon size={16} color={t.color} />
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{t.label}</div>
                    </div>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: t.bg, color: t.color }}>
                      {TEMPLATE_GROUPS[templateTab].title}
                    </span>
                  </div>
                  {/* 描述 */}
                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: "0 0 12px", whiteSpace: "pre-line" }}>{t.desc}</p>
                  {/* 操作按钮 */}
                  <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/annotation/create?template=${t.id}`); }}
                      style={{ flex: 1, padding: "6px", border: "none", borderRadius: 5, background: t.color, fontSize: 11, cursor: "pointer", color: "#fff", fontWeight: 600 }}
                    >使用此模板</button>
                    <button
                      onClick={e => { e.stopPropagation(); toast.success(`已复制 ${t.label} 模板信息`); }}
                      style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", fontSize: 11, cursor: "pointer", color: "#64748b" }}
                    >详情</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 筛选栏 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            style={{ padding: "8px 10px 8px 32px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, width: 200 }}
            placeholder="搜索任务名称..."
            value={searchName}
            onChange={e => { setSearchName(e.target.value); setPage(1); }}
          />
        </div>
        <select style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">全部标注类型</option>
          {/* 按模板分组展示 */}
          <optgroup label="— 基础素材 —" />
          {Object.entries(LABEL_TEMPLATES)
            .filter(([, v]) => v.group === "基础素材")
            .map(([tid, t]) => (
              <optgroup key={tid} label={`　${t.label}`}>
                {Object.entries(ANNOTATION_TYPES)
                  .filter(([, a]) => a.template === tid)
                  .map(([key, info]) => (
                    <option key={key} value={key}>　　{info.label}</option>
                  ))
                }
              </optgroup>
            ))
          }
          <optgroup label="— 对齐推理 —" />
          {Object.entries(LABEL_TEMPLATES)
            .filter(([, v]) => v.group === "对齐推理")
            .map(([tid, t]) => (
              <optgroup key={tid} label={`　${t.label}`}>
                {Object.entries(ANNOTATION_TYPES)
                  .filter(([, a]) => a.template === tid)
                  .map(([key, info]) => (
                    <option key={key} value={key}>　　{info.label}</option>
                  ))
                }
              </optgroup>
            ))
          }
        </select>
        <select style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">全部状态</option>
          {Object.entries(ANNOTATION_STATUS).map(([key, info]) => (
            <option key={key} value={key}>{info.label}</option>
          ))}
        </select>
        <button style={{ padding: "8px 14px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }} onClick={() => { setSearchName(""); setTypeFilter(""); setStatusFilter(""); setPage(1); }}>
          <RefreshCw size={13} /> 重置
        </button>
      </div>

      {/* 表格 */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 16, borderRadius: 2, background: "#6366f1" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>标注任务列表</span>
          <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "1px 7px", borderRadius: 10 }}>{filtered.length}</span>
          {refreshing && (
            <span style={{ fontSize: 12, color: "#6366f1", display: "flex", alignItems: "center", gap: 4 }}>
              <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> 同步中
            </span>
          )}
        </div>

            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>暂无标注任务，<button onClick={() => router.push("/annotation/create")} style={{ color: "#6366f1", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>新建一个</button></div>
            ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  {["标注任务", "标注员团队", "模板", "完成量", "Kappa", "状态", "操作"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "11px 16px", fontSize: 12, fontWeight: 600, color: "#64748b" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                    <Tag size={36} style={{ margin: "0 auto 10px", opacity: 0.3, display: "block" }} />
                    <div>暂无标注任务</div>
                  </td></tr>
                ) : paged.map((job, idx) => (
                  <tr key={job.id}
                    style={{ borderBottom: idx < paged.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                  >
                    {/* 标注任务 */}
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1e293b", maxWidth: 180 }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.name}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>{job.dataset_name}</div>
                    </td>
                    {/* 标注员团队 */}
                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Users size={12} color="#94a3b8" />
                        <span style={{ fontSize: 11 }}>{job.annotator_team || (job.annotators?.join("、"))}</span>
                      </div>
                    </td>
                    {/* 模板 / 标注类型 */}
                    <td style={{ padding: "12px 16px" }}>
                      {(() => {
                        const tmpl = LABEL_TEMPLATES[job.label_template];
                        const subtype = ANNOTATION_TYPES[job.annotation_type];
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            <span style={{
                              background: tmpl?.bg || "#f3e8ff",
                              color: tmpl?.color || "#7c3aed",
                              padding: "2px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}>
                              {tmpl?.label || job.task_type}
                            </span>
                            {subtype && subtype.label !== tmpl?.label && (
                              <span style={{
                                background: "#f8fafc",
                                color: "#64748b",
                                padding: "1px 6px",
                                borderRadius: 3,
                                fontSize: 10,
                                whiteSpace: "nowrap",
                              }}>
                                {subtype.label}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>
                    {/* 完成量 */}
                    <td style={{ padding: "12px 16px", minWidth: 140 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                        {job.completed_items.toLocaleString()} / {job.total_items.toLocaleString()}
                      </div>
                      <ProgressBar value={job.completed_items} total={job.total_items} />
                    </td>
                    {/* Kappa */}
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {job.kappa_score != null ? (
                        <span style={{ fontWeight: 700, fontSize: 13, color: job.kappa_score >= 0.85 ? "#16a34a" : job.kappa_score >= 0.8 ? "#d97706" : "#dc2626" }}>
                          {job.kappa_score.toFixed(2)}
                        </span>
                      ) : <span style={{ color: "#cbd5e1" }}>—</span>}
                    </td>
                    {/* 状态 */}
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={job.status} /></td>
                    {/* 操作 */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {(job.status === "in_progress" || job.status === "pending") && (
                          <button
                            onClick={() => router.push(`/annotation/label/${job.id}`)}
                            title="进入标注"
                            style={{ padding: 5, border: "none", background: "#f0fdf4", borderRadius: 5, cursor: "pointer" }}
                          ><Play size={13} color="#16a34a" /></button>
                        )}
                        <button
                          onClick={() => router.push(`/annotation/detail/${job.id}`)}
                          title="详情"
                          style={{ padding: 5, border: "none", background: "#eff6ff", borderRadius: 5, cursor: "pointer" }}
                        ><Eye size={13} color="#2563eb" /></button>
                        <button
                          onClick={() => handleDelete(job.id, job.name)}
                          title="删除"
                          style={{ padding: 5, border: "none", background: "#fef2f2", borderRadius: 5, cursor: "pointer" }}
                        ><Trash2 size={13} color="#dc2626" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
            {totalPages > 1 && (
              <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#64748b" }}>
                <span>共 {filtered.length} 条 · 第 {page} / {totalPages} 页</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button style={{ width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer" }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let p;
                    if (totalPages <= 5) {
                      p = i + 1;
                    } else if (page <= 3) {
                      p = i + 1;
                    } else if (page >= totalPages - 2) {
                      p = totalPages - 4 + i;
                    } else {
                      p = page - 2 + i;
                    }
                    return (
                      <button key={p} style={{ width: 32, height: 32, border: "none", borderRadius: 5, background: p === page ? "#6366f1" : "transparent", color: p === page ? "#fff" : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: p === page ? 600 : 400 }} onClick={() => setPage(p)}>{p}</button>
                    );
                  })}
                  <button style={{ width: 32, height: 32, border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", cursor: "pointer" }} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
      </div>
    </main>
  );
}
