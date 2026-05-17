"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Play, Users, CheckCircle2, AlertCircle, Clock,
  BarChart3, Tag, Calendar, Hash, FileText, Database
} from "lucide-react";
import { MOCK_JOBS, STORAGE_KEY, ANNOTATION_TYPES } from "../../_mock";

function getJobs() {
  if (typeof window === "undefined") return [...MOCK_JOBS];
  const d = localStorage.getItem(STORAGE_KEY);
  const saved = d ? JSON.parse(d) : [];
  if (!d || saved.length === 0) return [...MOCK_JOBS];
  return saved;
}

// 根据标注模板描述配置信息
type FieldItem = { label: string; value: string };
const TEMPLATE_META: Record<string, { label: string; color: string; fields: (j: any) => FieldItem[] }> = {
  // ── 文本标注 ──────────────────────────────────────────────
  text_annotation: {
    label: "文本标注", color: "#2563eb",
    fields: (j: any) => [
      { label: "标注类型", value: ANNOTATION_TYPES[j.annotation_type]?.label || "文本标注" },
      { label: "标注格式", value: j.annotation_type === "ner" ? "BIO / BIESO" : "JSONL" },
      { label: "实体/类别", value: j.annotation_type === "ner" ? "PER / ORG / LOC / TIME" : "多级分类" },
      { label: "数据集", value: j.dataset_name || "—" },
    ]
  },
  // ── 图像标注 ─────────────────────────────────────────────
  image_annotation: {
    label: "图像标注", color: "#7c3aed",
    fields: (j: any) => [
      { label: "标注类型", value: ANNOTATION_TYPES[j.annotation_type]?.label || "图像标注" },
      { label: "标注格式", value: j.annotation_type === "ocr" ? "JSON" : j.annotation_type === "keypoint" ? "COCO-Keypoints" : "COCO" },
      { label: "标签数量", value: j.annotation_type === "keypoint" ? "17点 / 人体" : "多类别" },
      { label: "数据集", value: j.dataset_name || "—" },
    ]
  },
  // ── 视频标注 ─────────────────────────────────────────────
  video_annotation: {
    label: "视频标注", color: "#dc2626",
    fields: (j: any) => [
      { label: "标注类型", value: ANNOTATION_TYPES[j.annotation_type]?.label || "视频标注" },
      { label: "帧率", value: "30 FPS" },
      { label: "标注精度", value: j.annotation_type === "event" ? "事件级" : "帧级" },
      { label: "数据集", value: j.dataset_name || "—" },
    ]
  },
  // ── 音频标注 ─────────────────────────────────────────────
  audio_annotation: {
    label: "音频标注", color: "#d97706",
    fields: (j: any) => [
      { label: "标注类型", value: ANNOTATION_TYPES[j.annotation_type]?.label || "音频标注" },
      { label: "采样率", value: "16000 Hz" },
      { label: "格式", value: "WAV / MP3" },
      { label: "数据集", value: j.dataset_name || "—" },
    ]
  },
  // ── 点云三维标注 ─────────────────────────────────────────
  pointcloud_anno: {
    label: "点云三维标注", color: "#059669",
    fields: (j: any) => [
      { label: "标注类型", value: ANNOTATION_TYPES[j.annotation_type]?.label || "3D点云目标检测" },
      { label: "标注格式", value: "KITTI / OpenPCDet" },
      { label: "坐标系", value: "LiDAR 坐标系" },
      { label: "数据集", value: j.dataset_name || "—" },
    ]
  },
  // ── 多模态对齐标注 ───────────────────────────────────────
  multimodal_anno: {
    label: "多模态对齐标注", color: "#db2777",
    fields: (j: any) => [
      { label: "标注类型", value: ANNOTATION_TYPES[j.annotation_type]?.label || "图文对齐" },
      { label: "模态组合", value: "图像 + 文本" },
      { label: "标注格式", value: "JSONL" },
      { label: "数据集", value: j.dataset_name || "—" },
    ]
  },
  // ── SFT监督微调标注 ──────────────────────────────────────
  sft_annotation: {
    label: "SFT监督微调标注", color: "#0284c7",
    fields: () => [
      { label: "任务类型", value: "Instruction-Input-Output" },
      { label: "样本格式", value: "ChatML / Alpaca" },
      { label: "质量要求", value: "专家审核" },
      { label: "质量维度", value: "有用性 / 安全性 / 流畅性" },
    ]
  },
  // ── DPO偏好优化标注 ──────────────────────────────────────
  dpo_annotation: {
    label: "DPO偏好优化标注", color: "#7c3aed",
    fields: () => [
      { label: "任务类型", value: "Chosen / Rejected 偏好对" },
      { label: "标注方式", value: "2选1偏好对比" },
      { label: "样本格式", value: "JSONL" },
      { label: "审核要求", value: "双盲标注" },
    ]
  },
  // ── PPO/RLHF样本构建 ─────────────────────────────────────
  ppo_annotation: {
    label: "PPO/RLHF样本构建", color: "#ea580c",
    fields: () => [
      { label: "任务类型", value: "奖励模型训练数据" },
      { label: "评分维度", value: "有用性 / 安全性 / 准确度" },
      { label: "评分范围", value: "1~5 分制" },
      { label: "样本格式", value: "JSON" },
    ]
  },
  // ── CoT思维链推理标注 ────────────────────────────────────
  cot_annotation: {
    label: "CoT思维链推理标注", color: "#16a34a",
    fields: () => [
      { label: "任务类型", value: "中间推理步骤标注" },
      { label: "推理节点", value: "多步因果链" },
      { label: "样本格式", value: "Chain-of-Thought JSON" },
      { label: "专家要求", value: "领域专家审核" },
    ]
  },
  // ── ToT树状推理标注 ──────────────────────────────────────
  tot_annotation: {
    label: "ToT树状推理标注", color: "#d97706",
    fields: () => [
      { label: "任务类型", value: "多分支推理路径" },
      { label: "分支策略", value: "树状思维结构" },
      { label: "样本格式", value: "Tree-of-Thought JSON" },
      { label: "路径评估", value: "最优路径标注" },
    ]
  },
  // ── GoT图状推理标注 ──────────────────────────────────────
  got_annotation: {
    label: "GoT图状推理标注", color: "#be185d",
    fields: () => [
      { label: "任务类型", value: "图结构推理过程" },
      { label: "图结构", value: "Graph-of-Thought" },
      { label: "节点类型", value: "推理节点 + 关系边" },
      { label: "样本格式", value: "Graph JSON" },
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
              {(() => { const fields = typeof meta.fields === "function" ? meta.fields(job) : meta.fields; return fields.map(f => (
                <div key={f.label} style={{ padding: 14, borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{f.value}</div>
                </div>
              )); })()}
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
