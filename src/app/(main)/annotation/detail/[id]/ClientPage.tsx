"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Play, Users, CheckCircle2, AlertCircle, Clock,
  BarChart3, Tag, Calendar, Hash, FileText, Database
} from "lucide-react";
import { MOCK_JOBS, STORAGE_KEY } from "../../_mock";

function getJobs() {
  if (typeof window === "undefined") return [...MOCK_JOBS];
  const d = localStorage.getItem(STORAGE_KEY);
  const saved = d ? JSON.parse(d) : [];
  if (!d || saved.length === 0) return [...MOCK_JOBS];
  return saved;
}

// 根据标注模板描述配置信息
const TEMPLATE_META: Record<string, { label: string; color: string; fields: { label: string; value: (job: any) => string }[] }> = {
  image_classify: {
    label: "图片分类", color: "#8b5cf6",
    fields: [
      { label: "分类方式", value: () => "单图单标签" },
      { label: "标签数量", value: () => "4 类" },
      { label: "标注格式", value: () => "JSON" },
    ]
  },
  object_detect: {
    label: "目标检测", color: "#ec4899",
    fields: [
      { label: "框标注", value: () => "矩形框" },
      { label: "目标类别", value: () => "4 类" },
      { label: "标注格式", value: () => "COCO" },
    ]
  },
  text_classify: {
    label: "文本分类", color: "#3b82f6",
    fields: [
      { label: "分类方式", value: () => "单标签分类" },
      { label: "类别数量", value: () => "3 类" },
      { label: "标注格式", value: () => "JSONL" },
    ]
  },
  ner: {
    label: "实体识别", color: "#6366f1",
    fields: [
      { label: "标注方式", value: () => "片段标注" },
      { label: "实体类型", value: () => "PER / ORG / LOC / MISC" },
      { label: "标注格式", value: () => "BIO" },
    ]
  },
  sentiment: {
    label: "情感分析", color: "#f59e0b",
    fields: [
      { label: "情感粒度", value: () => "5 级情感" },
      { label: "维度", value: () => "正负向" },
      { label: "标注格式", value: () => "JSONL" },
    ]
  },
  audio_classify: {
    label: "音频分类", color: "#10b981",
    fields: [
      { label: "分类维度", value: () => "情绪识别" },
      { label: "类别数量", value: () => "5 类" },
      { label: "采样率", value: () => "16000 Hz" },
    ]
  },
  video_classify: {
    label: "视频分类", color: "#f97316",
    fields: [
      { label: "分类粒度", value: () => "片段级" },
      { label: "类别数量", value: () => "5 类" },
      { label: "帧率", value: () => "30 FPS" },
    ]
  },
  action_detect: {
    label: "行为检测", color: "#ec4899",
    fields: [
      { label: "检测类型", value: () => "时序检测" },
      { label: "行为类别", value: () => "10 类" },
      { label: "时序精度", value: () => "帧级" },
    ]
  },
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string; Icon: any }> = {
    in_progress: { bg: "#dbeafe", color: "#1d4ed8", label: "标注中",  Icon: Clock },
    completed:   { bg: "#dcfce7", color: "#15803d", label: "已完成",  Icon: CheckCircle2 },
    pending:     { bg: "#fef9c3", color: "#ca8a04", label: "待开始",  Icon: Clock },
    paused:      { bg: "#fee2e2", color: "#dc2626", label: "已暂停",  Icon: AlertCircle },
  };
  const s = map[status] || map.pending;
  const Icon = s.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      <Icon size={13} /> {s.label}
    </span>
  );
}

function ProgressRing({ pct, size = 80 }: { pct: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const color = pct === 100 ? "#16a34a" : pct > 50 ? "#6366f1" : "#f59e0b";
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} style={{ transition: "stroke-dashoffset 0.5s" }} />
      <text x={size/2} y={size/2 + 5} textAnchor="middle" fontSize={15} fontWeight={700} fill={color}>{pct}%</text>
    </svg>
  );
}

export default function AnnotationDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const all = getJobs();
    const found = all.find((j: any) => j.id === id);
    setJob(found || null);
    setLoading(false);
  }, [id]);

  if (loading) return null;
  if (!job) return (
    <main style={{ padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#64748b" }}>
      <AlertCircle size={48} color="#cbd5e1" />
      <p style={{ fontSize: 16 }}>任务不存在或已被删除</p>
      <button onClick={() => router.push("/annotation")} style={{ padding: "8px 20px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>返回列表</button>
    </main>
  );

  const template = job.label_template || "text_classify";
  const meta = TEMPLATE_META[template] || TEMPLATE_META["text_classify"];
  const pct = job.total_items > 0 ? Math.round((job.completed_items / job.total_items) * 100) : 0;

  const tabs = [
    { key: "overview",  label: "概览" },
    { key: "template",  label: "标注配置" },
    { key: "annotators", label: `标注人员 (${job.annotators?.length || 0})` },
  ];

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.push("/annotation")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
            <ArrowLeft size={16} /> 返回列表
          </button>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>{job.name}</h1>
          <span style={{ padding: "3px 10px", borderRadius: 6, background: `${meta.color}15`, color: meta.color, fontSize: 12, fontWeight: 600 }}>
            {meta.label}
          </span>
        </div>
        {(job.status === "in_progress" || job.status === "pending") && (
          <button
            onClick={() => router.push(`/annotation/label/${id}`)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Play size={14} /> 进入标注
          </button>
        )}
      </div>

      {/* 头部信息卡 */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 24, alignItems: "center" }}>
          <ProgressRing pct={pct} />
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {[
                { label: "总数据量",   value: job.total_items.toLocaleString(),     icon: Database },
                { label: "已完成",     value: job.completed_items.toLocaleString(), icon: CheckCircle2 },
                { label: "Kappa值",   value: job.kappa_score != null ? job.kappa_score.toFixed(2) : "—", icon: BarChart3 },
                { label: "关联数据集", value: job.dataset_name, icon: Tag },
                { label: "标注状态",   value: job.status, icon: Clock, isStatus: true },
                { label: "创建时间",   value: new Date(job.created_at).toLocaleDateString(), icon: Calendar },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon size={14} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.label}</div>
                    {(item as any).isStatus ? <StatusBadge status={item.value} /> : <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{item.value}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: 0, background: "#fff", borderRadius: "12px 12px 0 0", border: "1px solid #e2e8f0", borderBottom: "none", padding: "0 16px" }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: "14px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.key ? 700 : 500, color: activeTab === tab.key ? "#6366f1" : "#64748b", borderBottom: activeTab === tab.key ? "2px solid #6366f1" : "2px solid transparent" }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: "0 0 12px 12px", border: "1px solid #e2e8f0", padding: 24 }}>
        {activeTab === "overview" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>标注进度明细</div>
            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 4, marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#16a34a" : "#6366f1", borderRadius: 4, transition: "width 0.5s" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
              <span>已完成: {job.completed_items.toLocaleString()}</span>
              <span>剩余: {(job.total_items - job.completed_items).toLocaleString()}</span>
              <span>总计: {job.total_items.toLocaleString()}</span>
            </div>
            {job.kappa_score != null && (
              <div style={{ padding: 16, borderRadius: 10, background: job.kappa_score >= 0.8 ? "#f0fdf4" : job.kappa_score >= 0.6 ? "#fffbeb" : "#fef2f2", border: "1px solid", borderColor: job.kappa_score >= 0.8 ? "#bbf7d0" : job.kappa_score >= 0.6 ? "#fde68a" : "#fecaca" }}>
                <div style={{ fontSize: 13, color: "#475569", marginBottom: 4 }}>一致性 Kappa 系数</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: job.kappa_score >= 0.8 ? "#16a34a" : job.kappa_score >= 0.6 ? "#d97706" : "#dc2626" }}>
                  {job.kappa_score.toFixed(2)}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {job.kappa_score >= 0.8 ? "✅ 一致性良好" : job.kappa_score >= 0.6 ? "⚠️ 一致性一般，建议复查" : "❌ 一致性差，需要重新标注"}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "template" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Tag size={18} color={meta.color} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>{meta.label}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>标注模板配置</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {meta.fields.map(f => (
                <div key={f.label} style={{ padding: 14, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{f.value(job)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "annotators" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>标注人员</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(job.annotators || []).map((name: string, i: number) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: `hsl(${i * 60}, 60%, 85%)`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: `hsl(${i * 60}, 60%, 35%)`, fontSize: 14 }}>
                    {name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>标注员</div>
                  </div>
                  <span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#16a34a", fontSize: 11, fontWeight: 600 }}>进行中</span>
                </div>
              ))}
              {(!job.annotators || job.annotators.length === 0) && (
                <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>暂无标注人员</div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
