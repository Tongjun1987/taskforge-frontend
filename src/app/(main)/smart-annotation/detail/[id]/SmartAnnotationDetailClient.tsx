"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Brain, ArrowLeft, Cpu, Target, Zap, BarChart3, Clock, CheckCircle2,
  AlertCircle, RefreshCw, Play, Pause, Download, FileText, TrendingUp
} from "lucide-react";
import { MOCK_SMART_JOBS, getSmartJobs, saveSmartJobs, SmartAnnotationJob } from "../../_mock";

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
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 6, fontSize: 13, fontWeight: 600, background: s.bg, color: s.color }}>
      <Icon size={14} /> {s.label}
    </span>
  );
}

function StrategyBadge({ strategy }: { strategy: string }) {
  const map: Record<string, { bg: string; color: string; label: string; desc: string; Icon: any }> = {
    active_learning:    { bg: "#f3e8ff", color: "#7c3aed", label: "主动学习", desc: "AI筛选置信度最低的样本优先标注", Icon: Target },
    full_prelabel:      { bg: "#dbeafe", color: "#1d4ed8", label: "全量预标注", desc: "AI先对全部数据做推理，人工审核修正", Icon: Brain },
    confidence_filter:  { bg: "#fef3c7", color: "#d97706", label: "置信度过滤", desc: "高置信度自动通过，低置信度重点审核", Icon: Zap },
  };
  const s = map[strategy] || map.full_prelabel;
  const Icon = s.Icon;
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, background: s.bg, borderRadius: 8 }}>
      <div style={{ width: 32, height: 32, background: s.color, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color="#fff" />
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.label}</div>
        <div style={{ fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.desc}</div>
      </div>
    </div>
  );
}

export default function SmartAnnotationDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<SmartAnnotationJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getSmartJobs();
    if (stored.length === 0) {
      saveSmartJobs(MOCK_SMART_JOBS);
    }
    const jobs = stored.length > 0 ? stored : MOCK_SMART_JOBS;
    const found = jobs.find(j => j.id === id);
    setJob(found || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ color: "#94a3b8" }}>加载中...</div>
      </main>
    );
  }

  if (!job) {
    return (
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", flexDirection: "column", gap: 16 }}>
        <AlertCircle size={48} color="#dc2626" />
        <div style={{ fontSize: 16, color: "#1e293b", fontWeight: 600 }}>智能标注任务不存在</div>
        <button
          onClick={() => router.push("/smart-annotation")}
          style={{ padding: "10px 20px", background: "#8b5cf6", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
        >
          返回列表
        </button>
      </main>
    );
  }

  const prelabelRate = job.total_items > 0 ? Math.round((job.prelabeled_items / job.total_items) * 100) : 0;
  const autoPassRate = job.total_items > 0 ? Math.round((job.auto_approved / job.total_items) * 100) : 0;
  const reviewRate = job.total_items > 0 ? Math.round((job.pending_review / job.total_items) * 100) : 0;

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ padding: "20px 32px", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/smart-annotation")}
            style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", textDecoration: "none", fontSize: 13, background: "none", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft size={16} />
            返回智能标注
          </button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>{job.name}</h1>
          <StatusBadge status={job.status} />
        </div>
      </div>

      <div style={{ padding: "24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <FileText size={16} color="#6366f1" />
              任务基本信息
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", width: 80 }}>任务名称</span>
                <span style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{job.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", width: 80 }}>关联数据集</span>
                <span style={{ fontSize: 13, color: "#1e293b" }}>{job.dataset_name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", width: 80 }}>预标注模型</span>
                <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
                  <Cpu size={13} /> {job.model_name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#94a3b8", width: 80 }}>创建时间</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>{new Date(job.created_at).toLocaleString("zh-CN")}</span>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Target size={16} color="#7c3aed" />
              策略配置
            </h3>
            <StrategyBadge strategy={job.strategy} />
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {job.confidence_threshold !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>置信度阈值</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>≥ {job.confidence_threshold}</span>
                </div>
              )}
              {job.sampling_rate !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>采样比例</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{job.sampling_rate * 100}%</span>
                </div>
              )}
              {job.auto_pass_threshold !== undefined && (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>自动通过阈值</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>≥ {job.auto_pass_threshold}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} color="#2563eb" />
            标注进度
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
            <div style={{ textAlign: "center", padding: 16, background: "#f8fafc", borderRadius: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{job.total_items.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>总数据量</div>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "#eff6ff", borderRadius: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#2563eb" }}>{job.prelabeled_items.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>AI预标注</div>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "#dcfce7", borderRadius: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>{job.auto_approved.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>自动通过</div>
            </div>
            <div style={{ textAlign: "center", padding: 16, background: "#fef3c7", borderRadius: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#d97706" }}>{job.pending_review.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>待人工审核</div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#475569" }}>AI预标注进度</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>{prelabelRate}%</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${prelabelRate}%`, background: "linear-gradient(90deg, #3b82f6, #2563eb)", borderRadius: 4 }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#475569" }}>自动通过率</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>{autoPassRate}%</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${autoPassRate}%`, background: "linear-gradient(90deg, #22c55e, #16a34a)", borderRadius: 4 }} />
              </div>
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "#475569" }}>待人工审核</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#d97706" }}>{reviewRate}%</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${reviewRate}%`, background: "linear-gradient(90deg, #fbbf24, #d97706)", borderRadius: 4 }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <TrendingUp size={16} color="#10b981" />
            AI标注效率分析
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <div style={{ padding: 16, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
              <div style={{ fontSize: 11, color: "#16a34a", fontWeight: 600, marginBottom: 8 }}>节省人工工作量</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#15803d" }}>{Math.round((1 - job.pending_review / job.total_items) * 100)}%</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>AI 自动完成比例</div>
            </div>
            <div style={{ padding: 16, background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 600, marginBottom: 8 }}>审核效率提升</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1d4ed8" }}>{job.auto_approved.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>条数据无需人工审核</div>
            </div>
            <div style={{ padding: 16, background: "#faf5ff", borderRadius: 10, border: "1px solid #e9d5ff" }}>
              <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600, marginBottom: 8 }}>智能策略</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#6d28d9" }}>
                {job.strategy === "active_learning" ? "主动学习" : job.strategy === "full_prelabel" ? "全量预标注" : "置信度过滤"}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>当前使用策略</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
