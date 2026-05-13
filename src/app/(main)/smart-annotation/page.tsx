"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Brain, Plus, Search, RefreshCw, Eye, Trash2, Cpu,
  CheckCircle2, AlertCircle, Clock, BarChart3, Pencil,
  ClipboardCheck, CheckCircle, XCircle, ChevronLeft,
  ChevronRight as ChevronRightAlt
} from "lucide-react";
import toast from "react-hot-toast";
import { MOCK_SMART_JOBS, getSmartJobs, saveSmartJobs, SmartAnnotationJob } from "./_mock";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string; Icon: any }> = {
    idle:      { bg: "#f1f5f9", color: "#64748b", label: "空闲", Icon: Clock },
    running:   { bg: "#dbeafe", color: "#1d4ed8", label: "运行中", Icon: RefreshCw },
    completed: { bg: "#dcfce7", color: "#15803d", label: "已完成", Icon: CheckCircle2 },
    failed:    { bg: "#fee2e2", color: "#dc2626", label: "失败", Icon: AlertCircle },
  };
  const s = map[status] || map.idle;
  const Icon = s.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
      <Icon size={12} /> {s.label}
    </span>
  );
}

function StrategyBadge({ strategy }: { strategy: string }) {
  const map: Record<string, { label: string }> = {
    active_learning:    { label: "主动学习" },
    full_prelabel:      { label: "全量预标注" },
    confidence_filter:  { label: "置信度过滤" },
    unsupervised:       { label: "无监督标注" },
  };
  const s = map[strategy] || { label: strategy };
  return (
    <span style={{ fontSize: 12, fontWeight: 500, color: "#475569" }}>
      {s.label}
    </span>
  );
}

// 精简进度条组件
function CompactProgress({ job }: { job: SmartAnnotationJob }) {
  const { total_items, prelabeled_items, auto_approved, pending_review } = job;
  const pct = total_items > 0 ? Math.round(((prelabeled_items + auto_approved) / total_items) * 100) : 0;
  const reviewPct = total_items > 0 ? Math.round((pending_review / total_items) * 100) : 0;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {/* 百分比圆环 */}
      <div style={{ position: "relative", width: 40, height: 40, flexShrink: 0 }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="20" cy="20" r="16" fill="none"
            stroke="#6366f1" strokeWidth="4"
            strokeDasharray={`${pct * 1.005} 100.5`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
        <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#6366f1" }}>
          {pct}%
        </span>
      </div>
      {/* 数字 */}
      <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
        <div><span style={{ color: "#6366f1", fontWeight: 600 }}>{prelabeled_items.toLocaleString()}</span> 预标注</div>
        <div><span style={{ color: "#10b981", fontWeight: 600 }}>{auto_approved.toLocaleString()}</span> 自动通过</div>
        <div><span style={{ color: "#f59e0b", fontWeight: 600 }}>{pending_review.toLocaleString()}</span> 待审核</div>
      </div>
    </div>
  );
}

// 审核状态：已完成 / 未完成
function ReviewStatusBadge({ job }: { job: SmartAnnotationJob }) {
  if (job.status === "completed" && job.pending_review === 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>
        <CheckCircle size={12} /> 已完成
      </span>
    );
  }
  if (job.pending_review > 0) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: "#fef3c7", color: "#d97706" }}>
        <XCircle size={12} /> 未完成
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: "#f1f5f9", color: "#64748b" }}>
      <Clock size={12} /> 待处理
    </span>
  );
}

export default function SmartAnnotationPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<SmartAnnotationJob[]>(MOCK_SMART_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [strategyFilter, setStrategyFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const stored = getSmartJobs();
    if (stored.length === 0) {
      saveSmartJobs(MOCK_SMART_JOBS);
      setJobs(MOCK_SMART_JOBS);
    } else if (stored.length < MOCK_SMART_JOBS.length) {
      const existingIds = new Set(stored.map(j => j.id));
      const missingJobs = MOCK_SMART_JOBS.filter(j => !existingIds.has(j.id));
      const merged = [...stored, ...missingJobs];
      saveSmartJobs(merged);
      setJobs(merged);
    } else {
      setJobs(stored);
    }
  }, []);

  // 按创建时间倒序排列
  const sorted = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = sorted.filter(j => {
    const nameMatch = !searchName || j.name.includes(searchName) || j.dataset_name.includes(searchName);
    const strategyMatch = !strategyFilter || j.strategy === strategyFilter;
    return nameMatch && strategyMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 搜索或筛选时重置页码
  useEffect(() => { setPage(1); }, [searchName, strategyFilter]);

  const stats = {
    total: jobs.length,
    running: jobs.filter(j => j.status === "running").length,
    completed: jobs.filter(j => j.status === "completed" && j.pending_review === 0).length,
    pending: jobs.filter(j => j.pending_review > 0).length,
    totalItems: jobs.reduce((s, j) => s + j.total_items, 0),
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确认删除「${name}」？`)) {
      const updated = jobs.filter(j => j.id !== id);
      saveSmartJobs(updated);
      setJobs(updated);
      toast.success("已删除");
    }
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部标题区 */}
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#6366f1", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>智能标注</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>AI 预标注 · 主动学习 · 显著降低标注成本</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/smart-annotation/create")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={16} /> 新建智能标注
          </button>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "智能标注任务", value: stats.total, unit: "个", color: "#6366f1" },
            { label: "运行中",       value: stats.running, unit: "个", color: "#2563eb" },
            { label: "已完成",       value: stats.completed, unit: "个", color: "#16a34a" },
            { label: "待审核",       value: stats.pending, unit: "个", color: "#d97706" },
            { label: "数据总量",     value: stats.totalItems.toLocaleString(), unit: "条", color: "#0891b2" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>
                {s.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{s.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 32px 24px" }}>
        {/* 筛选区 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="搜索任务名称、数据集名称..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}
            />
          </div>
          <select
            value={strategyFilter}
            onChange={e => setStrategyFilter(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff" }}
          >
            <option value="">全部策略</option>
            <option value="active_learning">主动学习</option>
            <option value="full_prelabel">全量预标注</option>
            <option value="confidence_filter">置信度过滤</option>
            <option value="unsupervised">无监督标注</option>
          </select>
        </div>

        {/* 列表 - 按新格式：任务、数据集、AI模型、预标量、自动通过、待审核、策略、状态 */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* 表头 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1.6fr 1.3fr 1.2fr 80px 80px 80px 100px 90px 90px",
            padding: "10px 16px",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            fontSize: 11,
            fontWeight: 700,
            color: "#64748b"
          }}>
            <span>任务</span>
            <span>数据集</span>
            <span>AI模型</span>
            <span style={{ textAlign: "right" }}>预标量</span>
            <span style={{ textAlign: "right" }}>自动通过</span>
            <span style={{ textAlign: "right" }}>待审核</span>
            <span style={{ textAlign: "center" }}>策略</span>
            <span style={{ textAlign: "center" }}>状态</span>
            <span style={{ textAlign: "center" }}>操作</span>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>加载中...</div>
          ) : paged.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>暂无智能标注任务</div>
          ) : (
            paged.map((job) => (
              <div key={job.id} style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1.3fr 1.2fr 80px 80px 80px 100px 90px 90px",
                padding: "12px 16px",
                borderBottom: "1px solid #f1f5f9",
                alignItems: "center",
                fontSize: 13,
                transition: "background 0.15s",
              }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                {/* 任务 */}
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{job.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{job.task_name}</div>
                </div>
                {/* 数据集 */}
                <div style={{ fontSize: 12, color: "#475569" }}>{job.dataset_name}</div>
                {/* AI模型 */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6366f1", fontWeight: 600 }}>
                    <Cpu size={12} /> {job.model_name}
                  </div>
                </div>
                {/* 预标量 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", textAlign: "right" }}>
                  {job.total_items.toLocaleString()}
                </div>
                {/* 自动通过 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", textAlign: "right" }}>
                  {job.auto_approved.toLocaleString()}
                </div>
                {/* 待审核 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", textAlign: "right" }}>
                  {job.pending_review.toLocaleString()}
                </div>
                {/* 策略 */}
                <div style={{ textAlign: "center" }}>
                  <StrategyBadge strategy={job.strategy} />
                </div>
                {/* 状态 */}
                <div style={{ textAlign: "center" }}>
                  <StatusBadge status={job.status} />
                </div>
                {/* 操作 */}
                <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                  <button onClick={() => router.push(`/smart-annotation/detail/${job.id}`)} title="查看详情" style={{ padding: 5, border: "none", background: "#eff6ff", borderRadius: 5, cursor: "pointer" }}><Eye size={13} color="#2563eb" /></button>
                  <button onClick={() => handleDelete(job.id, job.name)} title="删除" style={{ padding: 5, border: "none", background: "#fef2f2", borderRadius: 5, cursor: "pointer" }}><Trash2 size={13} color="#dc2626" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, padding: "0 4px" }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>
              共 {filtered.length} 条 · 第 {page} / {totalPages} 页
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.5 : 1 }}
              >
                <ChevronLeft size={14} />
              </button>
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
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      padding: "6px 12px",
                      border: "1px solid",
                      borderColor: page === p ? "#6366f1" : "#e2e8f0",
                      borderRadius: 6,
                      background: page === p ? "#6366f1" : "#fff",
                      color: page === p ? "#fff" : "#64748b",
                      cursor: "pointer",
                      fontSize: 12
                    }}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.5 : 1 }}
              >
                <ChevronRightAlt size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 图例 */}
        <div style={{ marginTop: 12, display: "flex", gap: 20, justifyContent: "flex-end" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
            <span style={{ width: 12, height: 6, background: "#6366f1", borderRadius: 2 }} /> AI预标注
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
            <span style={{ width: 12, height: 6, background: "#10b981", borderRadius: 2 }} /> 自动通过
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
            <span style={{ width: 12, height: 6, background: "#f59e0b", borderRadius: 2 }} /> 待人工审核
          </span>
        </div>

        {/* 底部说明 */}
        <div style={{ marginTop: 24, padding: "16px 20px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>💡 智能标注说明</div>
          <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
            <div>• <strong>主动学习</strong>：AI 自动筛选置信度最低的数据优先送审，用最少的标注量达到最优效果</div>
            <div>• <strong>全量预标注</strong>：AI 先对全部数据做推理，标注人员只需审核修正结果</div>
            <div>• <strong>置信度过滤</strong>：高置信度(≥0.9)自动通过，中置信度送人工审核，低置信度(≤0.6)重点审核</div>
            <div>• AI 自动通过的数据不需要人工介入，大幅降低标注成本</div>
          </div>
        </div>
      </div>
    </main>
  );
}
