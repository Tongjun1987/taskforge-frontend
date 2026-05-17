"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles, Plus, Search, RefreshCw, Play, Eye, Trash2,
  CheckCircle2, AlertCircle, Clock, X, Filter, ChevronRight,
  ChevronLeft, ChevronRight as ChevronRightAlt
} from "lucide-react";
import toast from "react-hot-toast";

// 清洗任务类型
interface CleaningJob {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  data_type: string;
  rules: string[];          // 启用的清洗规则
  total_items: number;      // 原始量
  passed_items: number;     // 清洗后
  removed_items: number;    // 被过滤
  removed_rate: string;     // 剔除率
  quality_score?: number;   // 质量分
  status: string;           // idle | running | completed | failed
  report: {
    duplicates: number;
    format_errors: number;
    pii_found: number;
    dirty_data: number;
    length_outliers: number;
  };
  created_at: string;
}

// ==================== 清洗算子接口 ====================
interface CleaningOperator {
  id: string;
  name: string;
  description: string;
  data_type: string;        // 适用数据类型
  category: "dedup" | "filter" | "transform" | "quality";
  params?: Record<string, any>;
  usage_count: number;
  avg_effectiveness?: string;  // 平均剔除率
  created_at: string;
}

const MOCK_OPERATORS: CleaningOperator[] = [
  // 文本类算子
  { id: "op-text-dedup", name: "文本去重", description: "基于 SimHash + MinHash 双重算法检测并去除重复文本，保留最早出现的记录。", data_type: "text", category: "dedup", usage_count: 8, avg_effectiveness: "6.8%", created_at: "2026-03-01" },
  { id: "op-text-format", name: "格式校验", description: "校验文本编码格式（UTF-8）、JSON 结构完整性、必填字段存在性，自动修复或标记问题样本。", data_type: "text", category: "quality", usage_count: 6, avg_effectiveness: "4.2%", created_at: "2026-03-02" },
  { id: "op-text-pii", name: "PII检测", description: "识别并脱敏个人信息（姓名/身份证/手机号/邮箱/地址），支持自定义正则规则库。", data_type: "text", category: "filter", usage_count: 5, avg_effectiveness: "2.1%", created_at: "2026-03-03" },
  { id: "op-text-dirty", name: "脏数据过滤", description: "过滤乱码、低信息量、广告文本、特殊字符异常等低质量文本内容。", data_type: "text", category: "filter", usage_count: 7, avg_effectiveness: "8.5%", created_at: "2026-03-04" },
  { id: "op-text-length", name: "长度检查", description: "过滤超出长度阈值（max 4096 tokens）或过短（< 5 字符）的无效文本。", data_type: "text", category: "filter", usage_count: 4, avg_effectiveness: "3.7%", created_at: "2026-03-05" },
  // 图像类算子
  { id: "op-img-dedup", name: "图像Hash去重", description: "使用 pHash / aHash / dHash 计算图片感知哈希，去除视觉相似或完全相同的图片。", data_type: "image", category: "dedup", usage_count: 6, avg_effectiveness: "5.3%", created_at: "2026-03-06" },
  { id: "op-img-res", name: "分辨率校验", description: "过滤分辨率低于 64×64 像素的图片，可配置最低分辨率阈值。", data_type: "image", category: "filter", usage_count: 5, avg_effectiveness: "3.9%", created_at: "2026-03-07" },
  { id: "op-img-corrupt", name: "损坏检测", description: "使用 PIL/OpenCV 检测图片文件是否损坏或无法解码，自动剔除问题图片。", data_type: "image", category: "quality", usage_count: 4, avg_effectiveness: "1.2%", created_at: "2026-03-08" },
  // 视频类算子
  { id: "op-video-blur", name: "去模糊", description: "基于 Laplacian 方差检测画面模糊程度，过滤方差低于阈值的视频帧。", data_type: "video", category: "filter", usage_count: 5, avg_effectiveness: "7.1%", created_at: "2026-03-09" },
  { id: "op-video-normalize", name: "归一化", description: "统一视频编码格式（H.264）、分辨率、帧率（30fps），重采样音频为 AAC 44.1kHz。", data_type: "video", category: "transform", usage_count: 3, avg_effectiveness: "—", created_at: "2026-03-10" },
  { id: "op-video-frame", name: "帧抽稀", description: "按指定间隔（如每隔5帧）采样，去除冗余帧，同时保留关键动作帧。", data_type: "video", category: "transform", usage_count: 4, avg_effectiveness: "12.5%", created_at: "2026-03-11" },
  // 音频类算子
  { id: "op-audio-silence", name: "静音检测", description: "检测音频文件中的静音段（< -50dB），过滤静音比例超过 80% 的样本。", data_type: "audio", category: "filter", usage_count: 3, avg_effectiveness: "9.2%", created_at: "2026-03-12" },
  { id: "op-audio-noise", name: "噪声检测", description: "使用信噪比（SNR）评估音频质量，过滤 SNR < 10dB 的含噪样本。", data_type: "audio", category: "filter", usage_count: 3, avg_effectiveness: "6.8%", created_at: "2026-03-13" },
  // 时序类算子
  { id: "op-ts-outlier", name: "异常值过滤", description: "使用 Z-Score / IQR 方法检测数值异常点，3σ 以外数据标记为异常并处理。", data_type: "timeseries", category: "filter", usage_count: 5, avg_effectiveness: "7.7%", created_at: "2026-03-14" },
  { id: "op-ts-impute", name: "缺失补全", description: "对时序数据中的缺失值进行线性插值或前向填充，支持最多连续 10 个缺失点。", data_type: "timeseries", category: "transform", usage_count: 4, avg_effectiveness: "—", created_at: "2026-03-15" },
  { id: "op-ts-smooth", name: "平滑处理", description: "应用 Savitzky-Golay 滤波器对时序数据进行平滑，减少高频噪声干扰。", data_type: "timeseries", category: "transform", usage_count: 3, avg_effectiveness: "—", created_at: "2026-03-16" },
];

const OPERATOR_CATEGORY: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  dedup:     { label: "去重算子", color: "#7c3aed", bg: "#f3e8ff", icon: Trash2 },
  filter:    { label: "过滤算子", color: "#dc2626", bg: "#fef2f2", icon: Filter },
  transform: { label: "转换算子", color: "#2563eb", bg: "#eff6ff", icon: RefreshCw },
  quality:   { label: "质量算子", color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2 },
};

const DATA_TYPE_MAP: Record<string, { label: string; color: string }> = {
  text:       { label: "文本", color: "#1d4ed8" },
  image:      { label: "图像", color: "#7c3aed" },
  video:      { label: "视频", color: "#db2777" },
  audio:      { label: "音频", color: "#d97706" },
  timeseries: { label: "时序", color: "#0d9488" },
};

const MOCK_CLEANING_JOBS: CleaningJob[] = [
  // ========== 交通事件识别场景 - 五核心任务清洗 ==========
  {
    id: "cl-traffic-det",
    name: "目标检测数据清洗",
    dataset_id: "ds_traffic_det",
    dataset_name: "交通目标检测数据集",
    data_type: "image",
    rules: ["去模糊", "去重", "归一化", "帧抽稀"],
    total_items: 20200,
    passed_items: 18500,
    removed_items: 1700,
    removed_rate: "8.4%",
    quality_score: 94.2,
    status: "completed",
    report: { duplicates: 850, format_errors: 120, pii_found: 0, dirty_data: 480, length_outliers: 250 },
    created_at: "2026-04-18T10:00:00Z",
  },
  {
    id: "cl-traffic-mot",
    name: "MOT 轨迹数据清洗",
    dataset_id: "ds_traffic_mot",
    dataset_name: "多目标跟踪数据集",
    data_type: "video",
    rules: ["GPS去噪", "轨迹平滑", "遮挡补全", "去重"],
    total_items: 13800,
    passed_items: 12400,
    removed_items: 1400,
    removed_rate: "10.1%",
    quality_score: 92.7,
    status: "completed",
    report: { duplicates: 420, format_errors: 280, pii_found: 0, dirty_data: 560, length_outliers: 140 },
    created_at: "2026-04-17T10:00:00Z",
  },
  {
    id: "cl-traffic-beh",
    name: "行为识别片段清洗",
    dataset_id: "ds_traffic_beh",
    dataset_name: "交通行为识别数据集",
    data_type: "video",
    rules: ["低画质过滤", "类别均衡", "边界裁剪"],
    total_items: 11200,
    passed_items: 9800,
    removed_items: 1400,
    removed_rate: "12.5%",
    quality_score: 93.1,
    status: "completed",
    report: { duplicates: 380, format_errors: 420, pii_found: 0, dirty_data: 420, length_outliers: 180 },
    created_at: "2026-04-16T10:00:00Z",
  },
  {
    id: "cl-traffic-event",
    name: "事件识别数据清洗",
    dataset_id: "ds_traffic_event",
    dataset_name: "交通事件识别数据集",
    data_type: "video",
    rules: ["去模糊", "去重", "归一化", "帧抽稀"],
    total_items: 8650,
    passed_items: 7980,
    removed_items: 670,
    removed_rate: "7.7%",
    quality_score: 93.8,
    status: "completed",
    report: { duplicates: 210, format_errors: 95, pii_found: 0, dirty_data: 275, length_outliers: 90 },
    created_at: "2026-04-15T10:00:00Z",
  },
  {
    id: "cl-traffic-ts",
    name: "时序流量数据清洗",
    dataset_id: "ds_traffic_ts",
    dataset_name: "交通流时序数据集",
    data_type: "timeseries",
    rules: ["异常值过滤", "缺失补全", "平滑", "去重"],
    total_items: 520000,
    passed_items: 480000,
    removed_items: 40000,
    removed_rate: "7.7%",
    quality_score: 95.3,
    status: "completed",
    report: { duplicates: 12000, format_errors: 8500, pii_found: 0, dirty_data: 15500, length_outliers: 4000 },
    created_at: "2026-04-14T10:00:00Z",
  },
  // ========== 其他清洗任务（保留原有数据）==========
  {
    id: "cl-1",
    name: "客服语料-文本清洗",
    dataset_id: "ds-1",
    dataset_name: "客服意图识别数据集",
    data_type: "text",
    rules: ["dedup", "format_check", "pii_detect", "dirty_filter", "length_check"],
    total_items: 15800,
    passed_items: 14720,
    removed_items: 1080,
    removed_rate: "6.8%",
    quality_score: 91.5,
    status: "completed",
    report: { duplicates: 320, format_errors: 180, pii_found: 45, dirty_data: 435, length_outliers: 100 },
    created_at: "2026-04-10T08:00:00Z",
  },
  {
    id: "cl-2",
    name: "产品图片-图像清洗",
    dataset_id: "ds-2",
    dataset_name: "产品分类图像集",
    data_type: "image",
    rules: ["image_hash_dedup", "resolution_check", "corrupt_check"],
    total_items: 8500,
    passed_items: 8120,
    removed_items: 380,
    removed_rate: "4.5%",
    quality_score: 89.8,
    status: "completed",
    report: { duplicates: 220, format_errors: 60, pii_found: 0, dirty_data: 0, length_outliers: 100 },
    created_at: "2026-04-09T10:00:00Z",
  },
  {
    id: "cl-3",
    name: "语音指令-音频清洗",
    dataset_id: "ds-4",
    dataset_name: "语音指令识别集",
    data_type: "audio",
    rules: ["silence_detect", "duration_check", "noise_detect"],
    total_items: 4200,
    passed_items: 3780,
    removed_items: 420,
    removed_rate: "10.0%",
    quality_score: 88.2,
    status: "running",
    report: { duplicates: 0, format_errors: 80, pii_found: 0, dirty_data: 0, length_outliers: 340 },
    created_at: "2026-04-11T09:00:00Z",
  },
];

const STORAGE_KEY = "taskforge_cleaning_jobs";

function getJobs(): CleaningJob[] {
  if (typeof window === "undefined") return MOCK_CLEANING_JOBS;
  const d = localStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : MOCK_CLEANING_JOBS;
}

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

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    text:    { bg: "#dbeafe", color: "#1d4ed8", label: "文本" },
    image:   { bg: "#f3e8ff", color: "#7c3aed", label: "图像" },
    video:   { bg: "#fce7f3", color: "#db2777", label: "视频" },
    audio:   { bg: "#fef3c7", color: "#d97706", label: "音频" },
    multimodal: { bg: "#d1fae5", color: "#059669", label: "多模态" },
  };
  const s = map[type] || { bg: "#f1f5f9", color: "#64748b", label: type };
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function DataCleaningPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"jobs" | "operators">("jobs");
  const [jobs, setJobs] = useState<CleaningJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setJobs(getJobs());
    setLoading(false);
  }, []);

  // 按创建时间倒序排列
  const sorted = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = sorted.filter(j => {
    const nameMatch = !searchName || j.name.includes(searchName) || j.dataset_name.includes(searchName);
    const typeMatch = !typeFilter || j.data_type === typeFilter;
    return nameMatch && typeMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 搜索或筛选时重置页码
  useEffect(() => { setPage(1); }, [searchName, typeFilter]);

  const stats = {
    total: jobs.length,
    completed: jobs.filter(j => j.status === "completed").length,
    totalProcessed: jobs.reduce((s, j) => s + j.total_items, 0),
    totalRemoved: jobs.reduce((s, j) => s + j.removed_items, 0),
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`确认删除「${name}」？`)) {
      const updated = jobs.filter(j => j.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据清洗</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>多维度清洗规则 · 提升数据质量 · 降低标注成本</p>
            </div>
          </div>
          <button
            onClick={() => router.push("/data-cleaning/create")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Plus size={16} /> 新建清洗任务
          </button>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "清洗任务", value: stats.total, unit: "个", color: "#10b981" },
            { label: "已完成",   value: stats.completed, unit: "个", color: "#16a34a" },
            { label: "处理数据总量", value: stats.totalProcessed.toLocaleString(), unit: "条", color: "#d97706" },
            { label: "过滤问题数据", value: stats.totalRemoved.toLocaleString(), unit: "条", color: "#dc2626" },
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

      <div style={{ padding: "24px 32px" }}>
        {/* Tab 切换 */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {([
            { key: "jobs", label: "清洗任务", icon: Sparkles },
            { key: "operators", label: "清洗算子", icon: RefreshCw },
          ] as const).map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 18px", borderRadius: 8,
                  border: isActive ? "1px solid #10b981" : "1px solid #e2e8f0",
                  background: isActive ? "#ecfdf5" : "#fff",
                  color: isActive ? "#10b981" : "#64748b",
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s"
                }}
              >
                <Icon size={14} />{tab.label}
              </button>
            );
          })}
        </div>

        {/* ===== 清洗任务视图 ===== */}
        {activeTab === "jobs" && (
          <>
            {/* 筛选区 */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
            <Search size={15} color="#94a3b8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="搜索任务名称、数据集..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              style={{ width: "100%", padding: "9px 12px 9px 36px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13 }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, background: "#fff" }}
          >
            <option value="">全部类型</option>
            <option value="text">文本</option>
            <option value="image">图像</option>
            <option value="video">视频</option>
            <option value="audio">音频</option>
            <option value="timeseries">时序</option>
          </select>
        </div>

        {/* 列表 */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* 表头 - 按数据接入风格：清洗任务、算子组合、原始量、清洗后、剔除率、质量分、状态 */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 2.2fr 90px 90px 80px 80px 90px 100px", padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: 11, fontWeight: 700, color: "#64748b" }}>
            <span>清洗任务</span>
            <span>算子组合</span>
            <span style={{ textAlign: "right" }}>原始量</span>
            <span style={{ textAlign: "right" }}>清洗后</span>
            <span style={{ textAlign: "center" }}>剔除率</span>
            <span style={{ textAlign: "center" }}>质量分</span>
            <span style={{ textAlign: "center" }}>状态</span>
            <span style={{ textAlign: "center" }}>操作</span>
          </div>

          {loading ? (
            <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>加载中...</div>
          ) : paged.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>暂无清洗任务</div>
          ) : (
            paged.map((job) => (
              <div key={job.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 2.2fr 90px 90px 80px 80px 90px 100px", padding: "12px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center", fontSize: 13, transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafbff")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                {/* 清洗任务 */}
                <div>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{job.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{job.dataset_name}</div>
                </div>
                {/* 算子组合 */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {job.rules.slice(0, 3).map((rule, i) => (
                    <span key={i} style={{ padding: "2px 6px", background: "#f0fdf4", color: "#15803d", borderRadius: 3, fontSize: 11 }}>{rule}</span>
                  ))}
                  {job.rules.length > 3 && (
                    <span style={{ padding: "2px 6px", background: "#f1f5f9", color: "#64748b", borderRadius: 3, fontSize: 11 }}>+{job.rules.length - 3}</span>
                  )}
                </div>
                {/* 原始量 */}
                <div style={{ textAlign: "right", fontWeight: 600, color: "#1e293b" }}>
                  {job.total_items.toLocaleString()}
                </div>
                {/* 清洗后 */}
                <div style={{ textAlign: "right", color: "#10b981", fontWeight: 600 }}>
                  {job.passed_items.toLocaleString()}
                </div>
                {/* 剔除率 */}
                <div style={{ textAlign: "center" }}>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    background: parseFloat(job.removed_rate) > 10 ? "#fee2e2" : parseFloat(job.removed_rate) > 5 ? "#fef3c7" : "#dcfce7",
                    color: parseFloat(job.removed_rate) > 10 ? "#dc2626" : parseFloat(job.removed_rate) > 5 ? "#d97706" : "#15803d"
                  }}>
                    {job.removed_rate}
                  </span>
                </div>
                {/* 质量分 */}
                <div style={{ textAlign: "center" }}>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 700,
                    background: job.quality_score && job.quality_score >= 94 ? "#dcfce7" : job.quality_score && job.quality_score >= 90 ? "#fef3c7" : "#fee2e2",
                    color: job.quality_score && job.quality_score >= 94 ? "#15803d" : job.quality_score && job.quality_score >= 90 ? "#d97706" : "#dc2626"
                  }}>
                    {job.quality_score || "—"}
                  </span>
                </div>
                {/* 状态 */}
                <div style={{ textAlign: "center" }}>
                  <StatusBadge status={job.status} />
                </div>
                {/* 操作 */}
                <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                  <button onClick={() => router.push(`/data-cleaning/detail/${job.id}`)} title="查看报告" style={{ padding: 5, border: "none", background: "#eff6ff", borderRadius: 5, cursor: "pointer" }}><Eye size={13} color="#2563eb" /></button>
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
                      borderColor: page === p ? "#10b981" : "#e2e8f0",
                      borderRadius: 6,
                      background: page === p ? "#10b981" : "#fff",
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

          </>
        )}

        {/* ===== 清洗算子视图 ===== */}
        {activeTab === "operators" && (
          <>
            {/* 算子统计 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { label: "算子总数", value: MOCK_OPERATORS.length, unit: "个", color: "#10b981" },
                { label: "过滤算子", value: MOCK_OPERATORS.filter(o => o.category === "filter").length, unit: "个", color: "#dc2626" },
                { label: "去重算子", value: MOCK_OPERATORS.filter(o => o.category === "dedup").length, unit: "个", color: "#7c3aed" },
                { label: "累计使用", value: MOCK_OPERATORS.reduce((s, o) => s + o.usage_count, 0), unit: "次", color: "#2563eb" },
              ].map(card => (
                <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>
                    {card.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{card.unit}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* 算子卡片网格 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 18 }}>
              {MOCK_OPERATORS.map(op => {
                const cat = OPERATOR_CATEGORY[op.category];
                const CatIcon = cat.icon;
                const dt = DATA_TYPE_MAP[op.data_type];
                return (
                  <div key={op.id} style={{
                    background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
                    padding: 18, transition: "box-shadow 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                  >
                    {/* 卡片头部 */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <CatIcon size={16} color={cat.color} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{op.name}</div>
                          <span style={{ display: "inline-block", marginTop: 2, padding: "1px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: cat.bg, color: cat.color }}>
                            {cat.label}
                          </span>
                        </div>
                      </div>
                      <span style={{ padding: "2px 8px", borderRadius: 4, background: dt ? `${dt.color}15` : "#f1f5f9", color: dt ? dt.color : "#64748b", fontSize: 11, fontWeight: 600 }}>
                        {dt?.label || op.data_type}
                      </span>
                    </div>

                    {/* 描述 */}
                    <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, margin: "0 0 12px" }}>{op.description}</p>

                    {/* 指标行 */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>使用</span>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#10b981" }}>{op.usage_count}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>次</span>
                      </div>
                      {op.avg_effectiveness && op.avg_effectiveness !== "—" && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>平均剔除率</span>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#dc2626" }}>{op.avg_effectiveness}</span>
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div style={{ display: "flex", gap: 6, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                      <button style={{ flex: 1, padding: "6px", border: "1px solid #e2e8f0", borderRadius: 5, background: "#fff", fontSize: 11, cursor: "pointer", color: "#64748b" }}>查看详情</button>
                      <button style={{ flex: 1, padding: "6px", border: "none", borderRadius: 5, background: "#10b981", fontSize: 11, cursor: "pointer", color: "#fff", fontWeight: 600 }}>应用到任务</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

