"use client";
import React, { useState, useEffect } from "react";
import {
  Plus, Search, Wand2, X, Play, Pause, Settings, Trash2, Eye,
  ChevronRight, ChevronDown, Image, FileText, Music, Video, BarChart3,
  Layers, Shuffle, FlipHorizontal, FlipVertical, Maximize, ZoomIn, Contrast,
  Palette, RefreshCw, Sparkles, CheckCircle2, AlertCircle,
  Clock, Loader2, EyeOff, ToggleLeft, ToggleRight, Download, Upload, Copy,
  Target, Gauge, Filter, ChevronLeft, ChevronRight as ChevronRightAlt
} from "lucide-react";

type AugmentationType = "image" | "text" | "audio" | "video";
type TaskStatus = "idle" | "running" | "completed" | "failed" | "paused";

interface AugRule {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
  enabled: boolean;
  params: Record<string, any>;
}

interface AugmentationTask {
  id: string;
  name: string;
  type: AugmentationType;
  status: TaskStatus;
  progress: number;
  source_dataset: string;
  output_dataset: string;
  rules: string[];
  created_at: string;
  duration?: string;
  before_count: number;
  after_count: number;
  augmentation_ratio?: string;  // 扩增比，如 "2.01×"
  focus_scenario?: string;       // 重点覆盖场景
}

const IMAGE_RULES: AugRule[] = [
  { id: "img-flip-h", name: "水平翻转", desc: "随机水平翻转图像，增加左右对称样本", icon: <FlipHorizontal size={14} />, color: "#8b5cf6", enabled: true, params: { probability: 0.5 } },
  { id: "img-flip-v", name: "垂直翻转", desc: "垂直镜像图像，增强上下视角泛化", icon: <FlipVertical size={14} />, color: "#7c3aed", enabled: false, params: { probability: 0.3 } },
  { id: "img-rotate", name: "随机旋转", desc: "随机旋转角度（-15° ~ 15°），增强方向不变性", icon: <RefreshCw size={14} />, color: "#3b82f6", enabled: true, params: { min_angle: -15, max_angle: 15 } },
  { id: "img-crop", name: "中心裁剪", desc: "从图像中心裁剪指定比例，保留核心区域", icon: <Target size={14} />, color: "#10b981", enabled: true, params: { scale: 0.9 } },
  { id: "img-zoom", name: "无损放大", desc: "使用超分辨率模型无损放大 2x/4x", icon: <ZoomIn size={14} />, color: "#06b6d4", enabled: false, params: { scale: 2 } },
  { id: "img-contrast", name: "对比度调整", desc: "随机调整图像对比度（0.8x ~ 1.2x）", icon: <Contrast size={14} />, color: "#f59e0b", enabled: true, params: { min: 0.8, max: 1.2 } },
  { id: "img-color", name: "色彩增强", desc: "随机调整亮度、饱和度、色相", icon: <Palette size={14} />, color: "#ec4899", enabled: true, params: { brightness: 0.2, saturation: 0.3 } },
  { id: "img-blur", name: "高斯模糊", desc: "添加随机高斯模糊，模拟失焦场景", icon: <EyeOff size={14} />, color: "#64748b", enabled: false, params: { max_kernel: 5 } },
  { id: "img-noise", name: "噪声注入", desc: "添加高斯/椒盐噪声，增强抗噪能力", icon: <Shuffle size={14} />, color: "#6366f1", enabled: true, params: { type: "gaussian", intensity: 0.05 } },
  { id: "img-synthesis", name: "图像合成", desc: "将多张图像按策略混合，生成新样本", icon: <Layers size={14} />, color: "#f97316", enabled: false, params: { method: "mixup", alpha: 0.5 } },
];

const TEXT_RULES: AugRule[] = [
  { id: "txt-synonym", name: "同义替换", desc: "基于同义词词林进行词语替换，保持语义不变", icon: <RefreshCw size={14} />, color: "#3b82f6", enabled: true, params: { ratio: 0.3 } },
  { id: "txt-random-insert", name: "随机插入", desc: "在句子中随机位置插入同义词", icon: <Plus size={14} />, color: "#8b5cf6", enabled: false, params: { count: 2 } },
  { id: "txt-random-swap", name: "随机交换", desc: "随机交换句子中两个词的位置", icon: <Shuffle size={14} />, color: "#10b981", enabled: false, params: { count: 1 } },
  { id: "txt-back-translate", name: "回译增强", desc: "翻译成中间语言再译回，丰富表达多样性", icon: <Copy size={14} />, color: "#f59e0b", enabled: true, params: { intermediate_lang: "en" } },
  { id: "txt-dropout", name: "Dropout", desc: "随机将词语替换为 [UNK]，增强模型鲁棒性", icon: <EyeOff size={14} />, color: "#64748b", enabled: true, params: { rate: 0.15 } },
  { id: "txt-context-aug", name: "上下文增强", desc: "使用预训练语言模型生成同义表达", icon: <Sparkles size={14} />, color: "#ec4899", enabled: true, params: { model: "llm-aug" } },
  { id: "txt-eed", name: "EED编辑距离", desc: "基于编辑距离的字符级增广", icon: <Gauge size={14} />, color: "#06b6d4", enabled: false, params: { max_edit: 2 } },
];

const AUDIO_RULES: AugRule[] = [
  { id: "aud-noise", name: "背景噪声", desc: "叠加环境噪声（白噪声、粉色噪声等）", icon: <Shuffle size={14} />, color: "#8b5cf6", enabled: true, params: { snr_db: [5, 15] } },
  { id: "aud-speed", name: "变速调整", desc: "随机改变语速（0.9x ~ 1.1x）", icon: <Play size={14} />, color: "#3b82f6", enabled: true, params: { min_rate: 0.9, max_rate: 1.1 } },
  { id: "aud-pitch", name: "音高变换", desc: "随机调整音调（-2 半音 ~ +2 半音）", icon: <Music size={14} />, color: "#10b981", enabled: true, params: { semitones: 2 } },
  { id: "aud-reverb", name: "混响效果", desc: "添加房间混响，模拟不同声学环境", icon: <Layers size={14} />, color: "#f59e0b", enabled: false, params: { room_size: 0.5 } },
  { id: "aud-time-shift", name: "时间偏移", desc: "随机截取音频片段并填充空白", icon: <ChevronRight size={14} />, color: "#ec4899", enabled: false, params: { shift_sec: 0.5 } },
  { id: "aud-vocal", name: "人声分离增强", desc: "分离并增强人声，再混合背景", icon: <BarChart3 size={14} />, color: "#06b6d4", enabled: false, params: { ratio: 0.3 } },
];

const VIDEO_RULES: AugRule[] = [
  { id: "vid-frame-drop", name: "丢帧增强", desc: "随机丢弃部分帧，训练时序模型", icon: <EyeOff size={14} />, color: "#8b5cf6", enabled: true, params: { drop_rate: 0.1 } },
  { id: "vid-speed", name: "帧率调整", desc: "调整视频播放速度（0.5x ~ 1.5x）", icon: <Play size={14} />, color: "#3b82f6", enabled: false, params: { min_rate: 0.8, max_rate: 1.2 } },
  { id: "vid-temporal", name: "时序扰动", desc: "打乱相邻帧顺序，增强时序建模", icon: <Shuffle size={14} />, color: "#10b981", enabled: false, params: { window: 3 } },
  { id: "vid-image-aug", name: "帧级图像增强", desc: "对每一帧独立应用图像增强策略", icon: <Image size={14} />, color: "#f59e0b", enabled: true, params: { method: "auto" } },
];

const MOCK_TASKS: AugmentationTask[] = [
  // ========== 交通事件识别场景 - 五核心任务增强 ==========
  {
    id: "aug-traffic-det",
    name: "目标检测增强",
    type: "image",
    status: "completed",
    progress: 100,
    source_dataset: "交通目标检测数据集",
    output_dataset: "目标检测增强集",
    rules: ["img-flip-h", "img-color", "img-noise", "img-rotate"],
    created_at: "2026-04-20 09:30",
    duration: "01:15:40",
    before_count: 18500,
    after_count: 37200,
    augmentation_ratio: "2.01×",
    focus_scenario: "夜间 / 雨雾场景",
  },
  {
    id: "aug-traffic-beh",
    name: "行为识别增强",
    type: "video",
    status: "completed",
    progress: 100,
    source_dataset: "交通行为识别数据集",
    output_dataset: "行为识别增强集",
    rules: ["vid-frame-drop", "vid-speed", "vid-temporal", "vid-image-aug"],
    created_at: "2026-04-19 10:00",
    duration: "02:30:20",
    before_count: 9800,
    after_count: 22100,
    augmentation_ratio: "2.26×",
    focus_scenario: "低速 / 高速异常",
  },
  {
    id: "aug-traffic-ts",
    name: "时序数据增强",
    type: "text",
    status: "completed",
    progress: 100,
    source_dataset: "交通流时序数据集",
    output_dataset: "时序增强集",
    rules: ["txt-context-aug", "txt-synonym", "txt-dropout", "txt-back-translate"],
    created_at: "2026-04-18 11:00",
    duration: "03:45:10",
    before_count: 480000,
    after_count: 1920000,
    augmentation_ratio: "4.00×",
    focus_scenario: "节假日 / 事故时段",
  },
  // ========== 其他增强任务（保留原有数据）==========
  {
    id: "aug-001",
    name: "产品图像数据增强",
    type: "image",
    status: "completed",
    progress: 100,
    source_dataset: "产品分类图像集",
    output_dataset: "产品分类增强集",
    rules: ["img-flip-h", "img-rotate", "img-color", "img-noise"],
    created_at: "2026-04-15 09:30",
    duration: "00:45:22",
    before_count: 8500,
    after_count: 42500,
    augmentation_ratio: "5.00×",
    focus_scenario: "多角度/光照变化",
  },
  {
    id: "aug-002",
    name: "意图识别语料增强",
    type: "text",
    status: "running",
    progress: 67,
    source_dataset: "客服意图识别数据集",
    output_dataset: "意图识别增强集",
    rules: ["txt-synonym", "txt-back-translate", "txt-context-aug"],
    created_at: "2026-04-14 11:00",
    before_count: 15800,
    after_count: 31600,
    augmentation_ratio: "2.00×",
    focus_scenario: "多意图表达",
  },
  {
    id: "aug-003",
    name: "语音指令数据增强",
    type: "audio",
    status: "paused",
    progress: 45,
    source_dataset: "语音指令识别集",
    output_dataset: "语音增强集",
    rules: ["aud-noise", "aud-speed", "aud-pitch"],
    created_at: "2026-04-13 16:20",
    before_count: 4200,
    after_count: 8400,
    augmentation_ratio: "2.00×",
    focus_scenario: "噪声环境",
  },
  {
    id: "aug-004",
    name: "交通事故视频增强",
    type: "video",
    status: "completed",
    progress: 100,
    source_dataset: "交通事故检测数据集",
    output_dataset: "交通事故增强集",
    rules: ["vid-frame-drop", "vid-image-aug"],
    created_at: "2026-04-12 10:15",
    duration: "02:30:10",
    before_count: 8500,
    after_count: 25500,
    augmentation_ratio: "3.00×",
    focus_scenario: "多种天气条件",
  },
  {
    id: "aug-005",
    name: "情感分析语料增强",
    type: "text",
    status: "failed",
    progress: 23,
    source_dataset: "情感分析语料库",
    output_dataset: "情感增强集",
    rules: ["txt-synonym", "txt-dropout"],
    created_at: "2026-04-11 14:00",
    before_count: 12000,
    after_count: 0,
    augmentation_ratio: "—",
    focus_scenario: "情感强度变化",
  },
];

const typeColors: Record<AugmentationType, string> = {
  image: "#8b5cf6",
  text: "#3b82f6",
  audio: "#f59e0b",
  video: "#ec4899",
};

const typeLabels: Record<AugmentationType, string> = {
  image: "图像",
  text: "文本",
  audio: "音频",
  video: "视频",
};

const typeIcons: Record<AugmentationType, React.ReactNode> = {
  image: <Image size={12} />,
  text: <FileText size={12} />,
  audio: <Music size={12} />,
  video: <Video size={12} />,
};

function StatusBadge({ status }: { status: TaskStatus }) {
  const map: Record<TaskStatus, { bg: string; color: string; label: string; Icon: any }> = {
    idle: { bg: "#f1f5f9", color: "#64748b", label: "待启动", Icon: Clock },
    running: { bg: "#dbeafe", color: "#2563eb", label: "运行中", Icon: Loader2 },
    completed: { bg: "#dcfce7", color: "#16a34a", label: "已完成", Icon: CheckCircle2 },
    failed: { bg: "#fee2e2", color: "#dc2626", label: "失败", Icon: AlertCircle },
    paused: { bg: "#fef9c3", color: "#ca8a04", label: "已暂停", Icon: Pause },
  };
  const s = map[status];
  const Icon = s.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={11} />{s.label}
    </span>
  );
}

function TypeBadge({ type }: { type: AugmentationType }) {
  const color = typeColors[type];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: `${color}15`, color, fontSize: 11, fontWeight: 600 }}>
      {typeIcons[type]}{typeLabels[type]}
    </span>
  );
}

function DetailModal({ task, onClose }: { task: AugmentationTask; onClose: () => void }) {
  const allRules = [...IMAGE_RULES, ...TEXT_RULES, ...AUDIO_RULES, ...VIDEO_RULES];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: 620, maxHeight: "80vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>{task.name}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            {[
              { label: "任务ID", value: task.id },
              { label: "数据类型", value: typeLabels[task.type] },
              { label: "源数据集", value: task.source_dataset },
              { label: "输出数据集", value: task.output_dataset || "—" },
              { label: "增强前数量", value: task.before_count > 0 ? task.before_count.toLocaleString() + " 条" : "—" },
              { label: "增强后数量", value: task.after_count > 0 ? task.after_count.toLocaleString() + " 条" : "—" },
              { label: "创建时间", value: task.created_at },
              { label: "运行耗时", value: task.duration || "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>状态</div>
            <StatusBadge status={task.status} />
            {task.status === "running" && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 6 }}>
                  <span>进度</span><span>{task.progress}%</span>
                </div>
                <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3 }}>
                  <div style={{ width: `${task.progress}%`, height: "100%", background: "#2563eb", borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>增强规则（{task.rules.length} 个）</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {task.rules.map(ruleId => {
                const rule = allRules.find(r => r.id === ruleId);
                return rule ? (
                  <span key={ruleId} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 99, background: `${rule.color}15`, color: rule.color, fontSize: 11, fontWeight: 500 }}>
                    {rule.icon} {rule.name}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {task.status === "idle" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#8b5cf6", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Play size={13} />启动</button>}
          {task.status === "running" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#f59e0b", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Pause size={13} />暂停</button>}
          {task.status === "paused" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#10b981", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Play size={13} />继续</button>}
          {task.status === "completed" && <button style={{ padding: "8px 18px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Download size={13} />导出数据</button>}
          <button style={{ padding: "8px 18px", borderRadius: 8, background: "#f1f5f9", color: "#64748b", border: "none", fontSize: 13, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}><Trash2 size={13} />删除</button>
        </div>
      </div>
    </div>
  );
}

export default function DataAugmentationPage() {
  const [tasks, setTasks] = useState<AugmentationTask[]>(MOCK_TASKS);
  const [type, setType] = useState<AugmentationType>("image");
  const [rules, setRules] = useState<AugRule[]>(IMAGE_RULES);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRules, setSelectedRules] = useState<string[]>(["img-flip-h", "img-rotate", "img-color", "img-noise"]);
  const [taskName, setTaskName] = useState("");
  const [sourceDs, setSourceDs] = useState("");
  const [tab, setTab] = useState<"tasks" | "rules">("tasks");
  const [keyword, setKeyword] = useState("");
  const [filterType, setFilterType] = useState<AugmentationType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [detailTask, setDetailTask] = useState<AugmentationTask | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const typeRules = {
    image: IMAGE_RULES, text: TEXT_RULES, audio: AUDIO_RULES, video: VIDEO_RULES,
  };

  const handleTypeChange = (newType: AugmentationType) => {
    setType(newType);
    setRules(typeRules[newType]);
    setSelectedRules([]);
  };

  const stats = {
    total: tasks.length,
    running: tasks.filter(t => t.status === "running").length,
    completed: tasks.filter(t => t.status === "completed").length,
    augmentation: tasks.reduce((acc, t) => acc + t.after_count, 0),
  };

  // 按创建时间倒序排列
  const sorted = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = sorted.filter(t => {
    if (keyword && !t.name.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 搜索或筛选时重置页码
  useEffect(() => { setPage(1); }, [keyword, filterType, filterStatus]);

  const toggleRule = (id: string) => {
    setSelectedRules(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* TopBar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 32px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Wand2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>数据增强</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>自动数据增强 · 自定义规则 · 增强任务管理</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
                placeholder="搜索任务名称..."
                style={{ padding: "7px 12px 7px 32px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", width: 200, background: "#f8fafc" }}
              />
            </div>
            <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#8b5cf6", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Plus size={14} />新建增强任务
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: "24px 32px 0" }}>
        {/* 统计卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "增强任务", value: stats.total, color: "#8b5cf6" },
            { label: "运行中", value: stats.running, color: "#2563eb" },
            { label: "已完成", value: stats.completed, color: "#16a34a" },
            { label: "增强后总量", value: stats.augmentation.toLocaleString(), color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab切换 */}
        <div style={{ display: "flex", gap: 6, marginBottom: 0 }}>
          {([
            { key: "tasks", label: "增强任务", icon: <BarChart3 size={14} /> },
            { key: "rules", label: "规则管理", icon: <Settings size={14} /> },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: "8px 8px 0 0",
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: tab === t.key ? "#8b5cf6" : "#f1f5f9",
              color: tab === t.key ? "#fff" : "#64748b",
            }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 32px 32px" }}>
        {tab === "tasks" && (
          <>
            {/* 筛选器 */}
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 300 }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="搜索任务名称..."
                  style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#f8fafc" }}
                />
              </div>
              <select value={filterType} onChange={e => { setFilterType(e.target.value as AugmentationType | "all"); setPage(1); }} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer", color: "#334155" }}>
                <option value="all">全部类型</option>
                <option value="image">图像增强</option>
                <option value="text">文本增强</option>
                <option value="audio">音频增强</option>
                <option value="video">视频增强</option>
              </select>
              <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value as TaskStatus | "all"); setPage(1); }} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer", color: "#334155" }}>
                <option value="all">全部状态</option>
                <option value="idle">等待中</option>
                <option value="running">运行中</option>
                <option value="paused">已暂停</option>
                <option value="completed">已完成</option>
                <option value="failed">失败</option>
              </select>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
                <Filter size={13} />高级筛选
              </button>
            </div>

            {/* 表格 - 按新格式：增强任务、算子、增强前、增强后、扩增比、重点覆盖、状态、操作 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 70px 70px 60px 1fr 80px 60px", gap: 12, padding: "10px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>增强任务</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>算子</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "right" }}>增强前</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "right" }}>增强后</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "center" }}>扩增比</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>重点覆盖</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "center" }}>状态</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textAlign: "center" }}>操作</span>
              </div>
              {paged.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>暂无数据</div>
              ) : (
                paged.map((task, i) => (
                  <div key={task.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 70px 70px 60px 1fr 80px 60px", gap: 12, padding: "12px 20px", borderBottom: i < paged.length - 1 ? "1px solid #f1f5f9" : "none", alignItems: "center", background: "#fff" }}>
                    {/* 增强任务 */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: `${typeColors[task.type]}15`, display: "flex", alignItems: "center", justifyContent: "center", color: typeColors[task.type], flexShrink: 0 }}>
                        {typeIcons[task.type]}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{task.name}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>{task.source_dataset}</div>
                      </div>
                    </div>
                    {/* 算子 */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {task.rules.slice(0, 3).map((ruleId, idx) => {
                        const rule = [...IMAGE_RULES, ...TEXT_RULES, ...AUDIO_RULES, ...VIDEO_RULES].find(r => r.id === ruleId);
                        return (
                          <span key={idx} style={{ padding: "2px 6px", background: "#f3e8ff", color: "#7c3aed", borderRadius: 3, fontSize: 10 }}>
                            {rule?.name || ruleId}
                          </span>
                        );
                      })}
                      {task.rules.length > 3 && (
                        <span style={{ padding: "2px 6px", background: "#f1f5f9", color: "#64748b", borderRadius: 3, fontSize: 10 }}>+{task.rules.length - 3}</span>
                      )}
                    </div>
                    {/* 增强前 */}
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", textAlign: "right" }}>
                      {task.before_count.toLocaleString()}
                    </div>
                    {/* 增强后 */}
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#10b981", textAlign: "right" }}>
                      {task.after_count > 0 ? task.after_count.toLocaleString() : "—"}
                    </div>
                    {/* 扩增比 */}
                    <div style={{ textAlign: "center" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        background: task.augmentation_ratio && parseFloat(task.augmentation_ratio) >= 3 ? "#dcfce7" : task.augmentation_ratio && parseFloat(task.augmentation_ratio) >= 2 ? "#fef3c7" : "#f1f5f9",
                        color: task.augmentation_ratio && parseFloat(task.augmentation_ratio) >= 3 ? "#15803d" : task.augmentation_ratio && parseFloat(task.augmentation_ratio) >= 2 ? "#d97706" : "#64748b"
                      }}>
                        {task.augmentation_ratio || "—"}
                      </span>
                    </div>
                    {/* 重点覆盖 */}
                    <div style={{ fontSize: 11, color: "#64748b" }}>
                      {task.focus_scenario || "—"}
                    </div>
                    {/* 状态 */}
                    <div style={{ textAlign: "center" }}>
                      <StatusBadge status={task.status} />
                    </div>
                    {/* 操作 */}
                    <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                      <button onClick={() => setDetailTask(task)} style={{ padding: "5px 6px", borderRadius: 6, background: "#eff6ff", color: "#2563eb", border: "none", cursor: "pointer" }} title="查看详情">
                        <Eye size={14} />
                      </button>
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
                          borderColor: page === p ? "#8b5cf6" : "#e2e8f0",
                          borderRadius: 6,
                          background: page === p ? "#8b5cf6" : "#fff",
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

        {tab === "rules" && (
          <div>
            {/* 类型选择 */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {([
                { key: "image" as AugmentationType, label: "图像增强", icon: <Image size={14} /> },
                { key: "text" as AugmentationType, label: "文本增强", icon: <FileText size={14} /> },
                { key: "audio" as AugmentationType, label: "音频增强", icon: <Music size={14} /> },
                { key: "video" as AugmentationType, label: "视频增强", icon: <Video size={14} /> },
              ] as const).map(t => (
                <button key={t.key} onClick={() => handleTypeChange(t.key)} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8,
                  border: `1px solid ${type === t.key ? typeColors[t.key] : "#e2e8f0"}`,
                  background: type === t.key ? `${typeColors[t.key]}10` : "#fff",
                  color: type === t.key ? typeColors[t.key] : "#64748b",
                  fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>

            {/* 规则卡片 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
              {rules.map(rule => (
                <div key={rule.id} style={{
                  background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #e2e8f0",
                  display: "flex", gap: 14, alignItems: "flex-start",
                  transition: "all 0.2s",
                }}>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    style={{
                      width: 36, height: 36, borderRadius: 8, border: "none", cursor: "pointer",
                      background: selectedRules.includes(rule.id) ? `${rule.color}20` : "#f1f5f9",
                      color: selectedRules.includes(rule.id) ? rule.color : "#cbd5e1",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      transition: "all 0.2s",
                    }}>
                    {rule.icon}
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{rule.name}</span>
                      <button
                        onClick={() => toggleRule(rule.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        {selectedRules.includes(rule.id) ? <ToggleRight size={20} color="#10b981" /> : <ToggleLeft size={20} color="#cbd5e1" />}
                      </button>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{rule.desc}</p>
                    {selectedRules.includes(rule.id) && (
                      <div style={{ marginTop: 8, fontSize: 11, color: "#94a3b8" }}>
                        参数：{Object.entries(rule.params).map(([k, v]) => `${k}=${v}`).join("，")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 新建增强任务弹窗 */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: 600, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 28px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>新建数据增强任务</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}><X size={20} /></button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>任务名称 <span style={{ color: "#dc2626" }}>*</span></label>
                  <input value={taskName} onChange={e => setTaskName(e.target.value)} placeholder="例如：产品图像增强-v1" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>数据类型</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {([
                      { key: "image" as AugmentationType, label: "图像", icon: <Image size={14} /> },
                      { key: "text" as AugmentationType, label: "文本", icon: <FileText size={14} /> },
                      { key: "audio" as AugmentationType, label: "音频", icon: <Music size={14} /> },
                      { key: "video" as AugmentationType, label: "视频", icon: <Video size={14} /> },
                    ] as const).map(t => (
                      <button key={t.key} onClick={() => { setType(t.key); setRules(typeRules[t.key]); }}
                        style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `1px solid ${type === t.key ? typeColors[t.key] : "#e2e8f0"}`, background: type === t.key ? `${typeColors[t.key]}10` : "#fff", color: type === t.key ? typeColors[t.key] : "#64748b", fontSize: 13, cursor: "pointer" }}>
                        {t.icon}{t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>源数据集 <span style={{ color: "#dc2626" }}>*</span></label>
                  <select value={sourceDs} onChange={e => setSourceDs(e.target.value)} style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, background: "#fff", outline: "none" }}>
                    <option value="">选择数据集</option>
                    <option value="ds-1">客服意图识别数据集（15800条）</option>
                    <option value="ds-2">产品分类图像集（8500条）</option>
                    <option value="ds-3">情感分析语料库（12000条）</option>
                    <option value="ds-4">语音指令识别集（4200条）</option>
                    <option value="traffic-1">交通事故检测数据集（8500条）</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>增强规则（{selectedRules.length}个已选）</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {rules.map(rule => (
                      <label key={rule.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", cursor: "pointer", background: selectedRules.includes(rule.id) ? `${rule.color}08` : "#fff", transition: "all 0.15s" }}>
                        <input type="checkbox" checked={selectedRules.includes(rule.id)} onChange={() => toggleRule(rule.id)} style={{ accentColor: rule.color }} />
                        <span style={{ fontSize: 13, color: "#334155", display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ color: rule.color }}>{rule.icon}</span>{rule.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>输出数据集名称</label>
                  <input placeholder="留空则自动生成" style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
            <div style={{ padding: "16px 28px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, cursor: "pointer", color: "#374151" }}>取消</button>
              <button onClick={() => setShowCreate(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#8b5cf6", fontSize: 14, cursor: "pointer", color: "#fff", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} />创建任务
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {detailTask && <DetailModal task={detailTask} onClose={() => setDetailTask(null)} />}
    </div>
  );
}
