"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Database, Search, Plus, Eye, Edit2, Trash2, Download, Upload,
  X, CheckCircle2, AlertCircle, Clock, Layers, Shield, Share2,
  GitBranch, ChevronRight, BarChart3, PieChart, Sliders, Globe,
  Lock, Users, TrendingUp, AlertTriangle, Star, FileText,
  Image, Video, Music, Box, Brain, Sparkles, Cpu, BookOpen,
  ChevronDown, Target, Link as LinkIcon, FileCode, Activity,
  RefreshCw, ArrowUpRight, Settings, FileCheck, Target as TargetIcon,
  GitMerge, EyeOff, UserCheck, KeyRound, DownloadCloud,
  ChevronLeft, ChevronRight as ChevronRightAlt, ActivitySquare
} from "lucide-react";

// ==================== Types ====================
interface DatasetVersion {
  version: string;
  date: string;
  item_count: number;
  uploader: string;
  note: string;
  md5?: string;
  size?: string;
  change_log?: string;
}

interface ChangelogEntry {
  id: string;
  action: string;
  user: string;
  time: string;
  detail: string;
  version_from?: string;
  version_to?: string;
}

interface CollaborationBranch {
  name: string;
  creator: string;
  created_at: string;
  item_count: number;
  status: "active" | "merged" | "archived";
  description: string;
}

interface Dataset {
  id: string;
  name: string;
  type: string;
  source_type: string;
  source_name: string;
  item_count: number;
  quality_status: string;
  quality_score?: number;
  task_name: string;
  versions: DatasetVersion[];
  created_at: string;
  has_smart_annotation?: boolean;
  smart_annotation_count?: number;
  scene_name?: string;
  tags?: string[];
  collaborators?: string[];
  permission?: "private" | "team" | "public";
  md5_dedup?: boolean;
  import_format?: string[];
  traceability?: string;
  changelog?: ChangelogEntry[];
  branches?: CollaborationBranch[];
  split_ratio?: { train: number; val: number; test: number };
  eval_score?: number;
  publish_status?: "published" | "draft" | "archived";
  claimed_count?: number;
  download_count?: number;
}

// ==================== Constants ====================
const DATA_TYPES = [
  { value: "image", label: "图像", icon: Image, color: "#8b5cf6" },
  { value: "text", label: "文本", icon: FileText, color: "#3b82f6" },
  { value: "video", label: "视频", icon: Video, color: "#ec4899" },
  { value: "audio", label: "音频", icon: Music, color: "#f59e0b" },
  { value: "multimodal", label: "多模态", icon: Box, color: "#10b981" },
  { value: "conversation", label: "对话数据", icon: Brain, color: "#6366f1" },
  { value: "knowledge", label: "知识图谱", icon: Sparkles, color: "#14b8a6" },
  { value: "embedding", label: "Embedding", icon: Cpu, color: "#8b5cf6" },
  { value: "instruction", label: "指令数据", icon: BookOpen, color: "#f97316" },
  { value: "timeseries", label: "时序", icon: ActivitySquare, color: "#0d9488" },
  { value: "video/image", label: "视频/图像", icon: Video, color: "#db2777" },
  { value: "video/json", label: "视频/JSON", icon: Video, color: "#7c3aed" },
];

const STORAGE_KEY = "taskforge_datasets_mgr";

const MOCK_DATASETS: Dataset[] = [
  // ========== 交通事件识别场景 - 五核心任务数据集 ==========
  {
    id: "mgr-traffic-det",
    name: "交通目标检测数据集",
    type: "video/image",
    source_type: "cloud",
    source_name: "G15高速监控",
    item_count: 18500,
    quality_status: "passed",
    quality_score: 94.2,
    task_name: "交通目标检测",
    tags: ["交通", "目标检测", "已发布", "video/image"],
    collaborators: ["王强", "李明", "张伟"],
    permission: "team",
    md5_dedup: true,
    traceability: "完整可追溯",
    import_format: ["MP4", "JPG", "JSON"],
    split_ratio: { train: 70, val: 15, test: 15 },
    eval_score: 94.2,
    publish_status: "published",
    claimed_count: 8,
    download_count: 25,
    versions: [
      { version: "v3.0", date: "2026-04-20", item_count: 18500, uploader: "王强", note: "全量发布", md5: "traffic-det-v30", size: "1.2 TB", change_log: "全链路仿真数据集发布" },
    ],
    changelog: [
      { id: "cl-1", action: "数据发布", user: "王强", time: "2026-04-20 10:00", detail: "发布 v3.0 版本", version_from: undefined, version_to: "v3.0" },
      { id: "cl-2", action: "数据集划分", user: "王强", time: "2026-04-20 10:30", detail: "训练70% / 验证15% / 测试15%" },
    ],
    branches: [
      { name: "main", creator: "王强", created_at: "2026-04-20", item_count: 18500, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-20",
  },
  {
    id: "mgr-traffic-mot",
    name: "多目标跟踪数据集",
    type: "video/json",
    source_type: "cloud",
    source_name: "MOT17-Traffic",
    item_count: 12400,
    quality_status: "reviewing",
    quality_score: 92.7,
    task_name: "多目标跟踪",
    tags: ["交通", "MOT", "多目标跟踪", "video/json"],
    collaborators: ["李明", "赵磊"],
    permission: "team",
    md5_dedup: true,
    traceability: "完整可追溯",
    import_format: ["MP4", "JSON", "CSV"],
    publish_status: "draft",
    versions: [
      { version: "v1.1", date: "2026-04-19", item_count: 12400, uploader: "李明", note: "复核中", md5: "traffic-mot-v11", size: "680 GB", change_log: "轨迹数据复核" },
    ],
    changelog: [
      { id: "cl-1", action: "数据导入", user: "李明", time: "2026-04-19 14:00", detail: "导入MOT17-Traffic轨迹数据" },
    ],
    branches: [
      { name: "main", creator: "李明", created_at: "2026-04-19", item_count: 12400, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-19",
  },
  {
    id: "mgr-traffic-beh",
    name: "交通行为识别数据集",
    type: "video",
    source_type: "cloud",
    source_name: "TrafficBehavior-V3",
    item_count: 9800,
    quality_status: "passed",
    quality_score: 93.1,
    task_name: "交通行为识别",
    tags: ["交通", "行为识别", "video"],
    collaborators: ["王雪梅", "赵磊"],
    permission: "team",
    md5_dedup: true,
    traceability: "完整可追溯",
    import_format: ["MP4", "JSON"],
    split_ratio: { train: 70, val: 15, test: 15 },
    eval_score: 93.1,
    publish_status: "published",
    claimed_count: 5,
    download_count: 18,
    versions: [
      { version: "v1.2", date: "2026-04-18", item_count: 9800, uploader: "王雪梅", note: "已发布", md5: "traffic-beh-v12", size: "2.8 TB", change_log: "交通行为识别数据集发布" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王雪梅", time: "2026-04-18 15:00", detail: "发布 v1.2", version_from: "v1.1", version_to: "v1.2" },
    ],
    branches: [
      { name: "main", creator: "王雪梅", created_at: "2026-04-18", item_count: 9800, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-18",
  },
  {
    id: "mgr-traffic-event",
    name: "交通事件识别数据集",
    type: "video/image",
    source_type: "cloud",
    source_name: "TrafficEvent-2026",
    item_count: 7980,
    quality_status: "passed",
    quality_score: 93.8,
    task_name: "交通事件识别",
    tags: ["交通", "事件识别", "video/image"],
    collaborators: ["张伟", "王强", "李明"],
    permission: "team",
    md5_dedup: true,
    traceability: "完整可追溯",
    import_format: ["MP4", "JPG", "JSON"],
    split_ratio: { train: 70, val: 15, test: 15 },
    eval_score: 93.8,
    publish_status: "published",
    claimed_count: 6,
    download_count: 20,
    versions: [
      { version: "v2.1", date: "2026-04-17", item_count: 7980, uploader: "张伟", note: "已发布", md5: "traffic-event-v21", size: "1.5 TB", change_log: "交通事件识别数据集发布" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "张伟", time: "2026-04-17 10:00", detail: "发布 v2.1", version_from: "v2.0", version_to: "v2.1" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-17", item_count: 7980, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-17",
  },
  {
    id: "mgr-traffic-ts",
    name: "交通流时序数据集",
    type: "timeseries",
    source_type: "cloud",
    source_name: "TrafficTimeSeries",
    item_count: 480000,
    quality_status: "pending",
    quality_score: 95.3,
    task_name: "时序建模与异常分析",
    tags: ["交通", "时序", "异常检测", "标注中"],
    collaborators: ["陈志远", "李娜"],
    permission: "team",
    md5_dedup: true,
    traceability: "完整可追溯",
    import_format: ["CSV", "JSON"],
    publish_status: "draft",
    versions: [
      { version: "v0.8", date: "2026-04-16", item_count: 480000, uploader: "陈志远", note: "标注中", md5: "traffic-ts-v08", size: "120 MB", change_log: "交通流时序数据导入" },
    ],
    changelog: [
      { id: "cl-1", action: "数据导入", user: "陈志远", time: "2026-04-16 09:00", detail: "导入交通流时序数据" },
    ],
    branches: [
      { name: "main", creator: "陈志远", created_at: "2026-04-16", item_count: 480000, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-16",
  },
  // ========== 其他数据集（保留原有数据）==========
  {
    id: "mgr-001",
    name: "客服意图识别数据 v2.1",
    type: "text",
    source_type: "cloud",
    source_name: "生产环境OSS",
    item_count: 5800,
    quality_status: "passed",
    quality_score: 94.5,
    task_name: "意图识别v2.1",
    tags: ["意图识别", "客服", "对话AI", "已发布"],
    collaborators: ["张伟", "李娜", "王芳"],
    permission: "team",
    md5_dedup: true,
    traceability: "完整可追溯",
    import_format: ["JSONL", "CSV", "TXT"],
    split_ratio: { train: 70, val: 15, test: 15 },
    eval_score: 94.5,
    publish_status: "published",
    claimed_count: 12,
    download_count: 38,
    versions: [
      { version: "v2.1", date: "2026-04-08", item_count: 5800, uploader: "张伟", note: "新增春季话术数据", md5: "a3f7c91d2e...", size: "128 MB", change_log: "新增春季话术1200条" },
      { version: "v2.0", date: "2026-03-25", item_count: 10000, uploader: "李娜", note: "扩充意图类别", md5: "b8e2c47a1f...", size: "96 MB", change_log: "从8类扩充至12类意图" },
      { version: "v1.0", date: "2026-03-01", item_count: 5000, uploader: "张伟", note: "初始版本", md5: "c90d38e2b7...", size: "48 MB", change_log: "初始版本导入" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "张伟", time: "2026-04-08 14:30", detail: "发布 v2.1 版本", version_from: "v2.0", version_to: "v2.1" },
      { id: "cl-2", action: "MD5去重", user: "系统", time: "2026-04-08 14:28", detail: "自动去除 23 条重复数据" },
      { id: "cl-3", action: "数据集划分", user: "张伟", time: "2026-04-08 15:00", detail: "训练70% / 验证15% / 测试15%" },
      { id: "cl-4", action: "质量测评", user: "系统", time: "2026-04-08 16:00", detail: "综合评分 94.5 分" },
      { id: "cl-5", action: "数据发布", user: "张伟", time: "2026-04-08 17:00", detail: "发布数据集，可被领取使用" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-03-01", item_count: 5800, status: "active", description: "主分支，稳定版本" },
      { name: "feature/intent-expand", creator: "李娜", created_at: "2026-03-10", item_count: 5000, status: "merged", description: "意图类别扩充" },
    ],
    created_at: "2026-03-01",
  },
  {
    id: "mgr-002",
    name: "产品分类图像数据 v1.2",
    type: "image",
    source_type: "local",
    source_name: "本地文件",
    item_count: 3500,
    quality_status: "passed",
    quality_score: 91.2,
    task_name: "商品分类",
    tags: ["图像分类", "电商", "商品识别", "已发布"],
    collaborators: ["王芳"],
    permission: "private",
    md5_dedup: true,
    import_format: ["JPG", "PNG", "ZIP"],
    split_ratio: { train: 80, val: 10, test: 10 },
    eval_score: 91.2,
    publish_status: "published",
    claimed_count: 8,
    download_count: 24,
    versions: [
      { version: "v1.2", date: "2026-04-05", item_count: 3500, uploader: "王芳", note: "新增家电类目", md5: "d5e9b82c1a...", size: "2.1 GB", change_log: "新增家电类目标注" },
      { version: "v1.1", date: "2026-03-20", item_count: 5000, uploader: "张伟", note: "优化图片质量", md5: "e1f0c73d9b...", size: "1.5 GB", change_log: "去除模糊图像 500 张" },
      { version: "v1.0", date: "2026-03-10", item_count: 3000, uploader: "张伟", note: "初始版本", md5: "f2a1d84eac...", size: "0.9 GB", change_log: "初始版本" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王芳", time: "2026-04-05 16:00", detail: "发布 v1.2", version_from: "v1.1", version_to: "v1.2" },
      { id: "cl-2", action: "数据集划分", user: "王芳", time: "2026-04-05 17:30", detail: "训练80% / 验证10% / 测试10%" },
      { id: "cl-3", action: "质量测评", user: "系统", time: "2026-04-05 18:00", detail: "综合评分 91.2 分" },
      { id: "cl-4", action: "数据发布", user: "王芳", time: "2026-04-05 17:00", detail: "发布数据集" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-03-10", item_count: 3500, status: "active", description: "主分支" },
      { name: "feature/appliance", creator: "王芳", created_at: "2026-03-25", item_count: 1500, status: "merged", description: "家电类目" },
    ],
    created_at: "2026-03-10",
  },
  {
    id: "mgr-003",
    name: "交通事故检测数据 v2.1",
    type: "video",
    source_type: "cloud",
    source_name: "高速公路监控中心",
    item_count: 3500,
    quality_status: "passed",
    quality_score: 96.8,
    task_name: "交通事故检测",
    tags: ["交通事件", "视频", "目标检测", "已发布"],
    collaborators: ["王强", "李明", "张伟"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "AVI"],
    split_ratio: { train: 70, val: 15, test: 15 },
    eval_score: 96.8,
    publish_status: "published",
    claimed_count: 5,
    download_count: 15,
    versions: [
      { version: "v2.1", date: "2026-04-10", item_count: 3500, uploader: "王强", note: "新增雨天事故场景", md5: "k7f6i39jgf...", size: "820 GB", change_log: "新增雨天事故监控视频" },
      { version: "v2.0", date: "2026-04-05", item_count: 5000, uploader: "李明", note: "扩充夜间事故样本", md5: "l8g7j40khg...", size: "600 GB", change_log: "夜间事故样本 2000 段" },
      { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "张伟", note: "初始版本", md5: "m9h8k51lig...", size: "350 GB", change_log: "初始版本" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王强", time: "2026-04-10 10:00", detail: "发布 v2.1", version_from: "v2.0", version_to: "v2.1" },
      { id: "cl-2", action: "数据集划分", user: "王强", time: "2026-04-10 11:00", detail: "训练70% / 验证15% / 测试15%" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-01", item_count: 3500, status: "active", description: "主分支" },
      { name: "feature/night-accident", creator: "李明", created_at: "2026-03-15", item_count: 2000, status: "merged", description: "夜间事故" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "mgr-004",
    name: "情感分析语料库 v1.0",
    type: "text",
    source_type: "platform",
    source_name: "平台数据",
    item_count: 12000,
    quality_status: "pending",
    quality_score: 88.3,
    task_name: "情感分析v1.0",
    tags: ["情感分析", "NLP", "自然语言", "草稿"],
    collaborators: ["李娜", "赵磊"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JSONL", "CSV"],
    publish_status: "draft",
    versions: [
      { version: "v1.0", date: "2026-04-03", item_count: 12000, uploader: "李娜", note: "初始版本", md5: "g3b2e95fbd...", size: "3.2 MB", change_log: "平台数据导入" },
    ],
    changelog: [
      { id: "cl-1", action: "数据导入", user: "李娜", time: "2026-04-03 11:00", detail: "从平台 ODS 层导入 12000 条" },
    ],
    branches: [
      { name: "main", creator: "李娜", created_at: "2026-04-03", item_count: 12000, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-03",
  },
  {
    id: "mgr-005",
    name: "交通事件分类数据 v1.2",
    type: "image",
    source_type: "cloud",
    source_name: "城市道路监控",
    item_count: 5000,
    quality_status: "passed",
    quality_score: 92.1,
    task_name: "事件类型分类",
    tags: ["交通事件", "图像分类", "智慧城市"],
    collaborators: ["赵磊", "张伟", "李娜"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JPG", "PNG", "ZIP"],
    split_ratio: { train: 60, val: 20, test: 20 },
    eval_score: 92.1,
    publish_status: "published",
    claimed_count: 3,
    download_count: 9,
    versions: [
      { version: "v1.2", date: "2026-04-08", item_count: 5000, uploader: "赵磊", note: "新增7类事件标注", md5: "n0i9l62mjh...", size: "3.2 GB", change_log: "新增 7 类事件" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "赵磊", time: "2026-04-08 15:00", detail: "发布 v1.2", version_from: "v1.1", version_to: "v1.2" },
    ],
    branches: [
      { name: "main", creator: "李娜", created_at: "2026-04-01", item_count: 5000, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "mgr-006",
    name: "图文多模态语料 v1.0",
    type: "multimodal",
    source_type: "public",
    source_name: "HuggingFace",
    item_count: 32000,
    quality_status: "pending",
    task_name: "多模态理解",
    tags: ["多模态", "图文对", "公开数据"],
    collaborators: ["李娜"],
    permission: "public",
    md5_dedup: true,
    import_format: ["JSONL", "Parquet"],
    publish_status: "draft",
    versions: [
      { version: "v1.0", date: "2026-04-06", item_count: 32000, uploader: "李娜", note: "公开数据导入", md5: "j6e5h28ief...", size: "4.5 GB", change_log: "从 HuggingFace 导入" },
    ],
    changelog: [],
    branches: [
      { name: "main", creator: "李娜", created_at: "2026-04-06", item_count: 32000, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-06",
  },
];

// ==================== Helpers ====================
function getDatasets(): Dataset[] {
  if (typeof window === "undefined") return MOCK_DATASETS;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : MOCK_DATASETS;
}

function saveDatasets(datasets: Dataset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
}

// ==================== Badges ====================
function QualityBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string; Icon: any }> = {
    passed: { bg: "#dcfce7", color: "#15803d", label: "已通过", Icon: CheckCircle2 },
    failed: { bg: "#fee2e2", color: "#dc2626", label: "未通过", Icon: AlertCircle },
    pending: { bg: "#fef9c3", color: "#ca8a04", label: "检测中", Icon: Clock },
  };
  const s = map[status] || map.pending;
  const Icon = s.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={12} />{s.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const t = DATA_TYPES.find(d => d.value === type);
  if (!t) return <span style={{ padding: "2px 8px", borderRadius: 4, background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 600 }}>未知</span>;
  const Icon = t.icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 4, background: `${t.color}15`, color: t.color, fontSize: 11, fontWeight: 600 }}>
      <Icon size={12} />{t.label}
    </span>
  );
}

function PermissionBadge({ perm }: { perm: string }) {
  const map: Record<string, { bg: string; color: string; label: string; Icon: any }> = {
    private: { bg: "#fee2e2", color: "#dc2626", label: "私有", Icon: Lock },
    team: { bg: "#dbeafe", color: "#2563eb", label: "团队", Icon: Users },
    public: { bg: "#dcfce7", color: "#16a34a", label: "公开", Icon: Globe },
  };
  const s = map[perm] || map.private;
  const Icon = s.Icon;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 10, fontWeight: 600 }}>
      <Icon size={10} />{s.label}
    </span>
  );
}

function PublishStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    published: { bg: "#dcfce7", color: "#15803d", label: "已发布" },
    draft: { bg: "#fef9c3", color: "#ca8a04", label: "草稿" },
    archived: { bg: "#f1f5f9", color: "#64748b", label: "归档" },
  };
  const s = map[status] || map.draft;
  return (
    <span style={{ padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, fontSize: 11, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

function ScoreBadge({ score }: { score?: number }) {
  if (!score) return <span style={{ color: "#94a3b8", fontSize: 12 }}>—</span>;
  const color = score >= 90 ? "#15803d" : score >= 80 ? "#ca8a04" : "#dc2626";
  return (
    <span style={{ fontWeight: 700, fontSize: 13, color }}>
      {score.toFixed(1)}
      <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 2 }}>分</span>
    </span>
  );
}

// ==================== DetailModal Tabs ====================

// --- 概览 Tab ---
function OverviewTab({ ds }: { ds: Dataset }) {
  const collaborators = ds.collaborators || [];
  const actionColors: Record<string, string> = {
    "版本发布": "#10b981", "数据导入": "#3b82f6", "分支合并": "#8b5cf6",
    "MD5去重": "#f59e0b", "权限变更": "#6366f1", "格式转换": "#ec4899",
    "数据集划分": "#14b8a6", "质量测评": "#f97316", "数据发布": "#15803d",
  };
  const color = actionColors[ds.changelog?.[0]?.action || ""] || "#64748b";

  return (
    <div style={{ padding: "0 4px" }}>
      {/* 基本信息 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "数据集名称", value: ds.name },
            { label: "所属任务", value: ds.task_name },
            { label: "数据总量", value: `${ds.item_count.toLocaleString()} 条` },
            { label: "创建时间", value: ds.created_at },
            { label: "来源类型", value: ds.source_type === "cloud" ? "云平台" : ds.source_type === "local" ? "本地文件" : ds.source_type === "platform" ? "平台数据" : "公开数据" },
            { label: "质量状态", value: <QualityBadge status={ds.quality_status} /> },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 标签 */}
      {ds.tags && ds.tags.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>标签</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ds.tags.map(tag => (
              <span key={tag} style={{ padding: "2px 10px", borderRadius: 20, background: "#f1f5f9", color: "#64748b", fontSize: 11 }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 关键指标 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "数据总量", value: ds.item_count.toLocaleString(), color: "#3b82f6", unit: "条" },
          { label: "质量评分", value: ds.quality_score ? ds.quality_score.toFixed(1) : "—", color: ds.quality_score && ds.quality_score >= 90 ? "#10b981" : "#f59e0b", unit: "分" },
          { label: "协作成员", value: String(collaborators.length), color: "#8b5cf6", unit: "人" },
          { label: "版本数", value: String(ds.versions.length), color: "#ec4899", unit: "个" },
        ].map(({ label, value, color, unit }) => (
          <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", textAlign: "center", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}<span style={{ fontSize: 10, marginLeft: 2 }}>{unit}</span></div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* 划分比例 */}
      {ds.split_ratio && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>数据集划分</div>
          <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", height: 24, borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ flex: ds.split_ratio.train, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>{ds.split_ratio.train}%</div>
              <div style={{ flex: ds.split_ratio.val, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>{ds.split_ratio.val}%</div>
              <div style={{ flex: ds.split_ratio.test, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>{ds.split_ratio.test}%</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
              <span>训练集 {Math.round(ds.item_count * ds.split_ratio.train / 100).toLocaleString()} 条</span>
              <span>验证集 {Math.round(ds.item_count * ds.split_ratio.val / 100).toLocaleString()} 条</span>
              <span>测试集 {Math.round(ds.item_count * ds.split_ratio.test / 100).toLocaleString()} 条</span>
            </div>
          </div>
        </div>
      )}

      {/* 导入格式 */}
      {ds.import_format && ds.import_format.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>支持格式</div>
          <div style={{ display: "flex", gap: 6 }}>
            {ds.import_format.map(fmt => (
              <span key={fmt} style={{ padding: "2px 8px", borderRadius: 4, background: "#f1f5f9", color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{fmt}</span>
            ))}
          </div>
        </div>
      )}

      {/* 版本历史 */}
      <div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>版本历史</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ds.versions.slice(0, 3).map((v, idx) => (
            <div key={v.version} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: idx === 0 ? "#3b82f6" : "#e2e8f0", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: "#1e293b" }}>{v.version}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>{v.date} · {v.uploader}</span>
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{v.note}</div>
              </div>
              <span style={{ fontSize: 10, color: "#94a3b8", background: "#f1f5f9", padding: "1px 6px", borderRadius: 3 }}>{v.size}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- 数据集划分 Tab ---
function SplitTab({ ds }: { ds: Dataset }) {
  const [train, setTrain] = useState(ds.split_ratio?.train ?? 70);
  const [val, setVal] = useState(ds.split_ratio?.val ?? 15);
  const [test, setTest] = useState(ds.split_ratio?.test ?? 15);
  const [splitType, setSplitType] = useState<"ratio" | "rule">("ratio");
  const [splitting, setSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(!!ds.split_ratio);

  const handleSplit = () => {
    if (train + val + test !== 100) return;
    setSplitting(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setSplitting(false);
          setCompleted(true);
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 200);
  };

  const total = ds.item_count;
  const trainCount = Math.round(total * train / 100);
  const valCount = Math.round(total * val / 100);
  const testCount = Math.round(total * test / 100);

  return (
    <div style={{ padding: "0 4px" }}>
      {/* 划分类型选择 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[
          { key: "ratio", label: "比例划分" },
          { key: "rule", label: "规则划分" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setSplitType(t.key as "ratio" | "rule")}
            style={{
              flex: 1, padding: "8px 16px", borderRadius: 6, border: "1.5px solid",
              borderColor: splitType === t.key ? "#3b82f6" : "#e2e8f0",
              background: splitType === t.key ? "#eff6ff" : "#fff",
              color: splitType === t.key ? "#3b82f6" : "#64748b",
              fontSize: 12, cursor: "pointer", fontWeight: 500,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {splitType === "ratio" ? (
        <>
          {/* 比例滑块 */}
          <div style={{ marginBottom: 20 }}>
            {[
              { label: "训练集", key: "train" as const, value: train, set: setTrain, color: "#3b82f6" },
              { label: "验证集", key: "val" as const, value: val, set: setVal, color: "#10b981" },
              { label: "测试集", key: "test" as const, value: test, set: setTest, color: "#f59e0b" },
            ].map(({ label, value, set, color }) => (
              <div key={label} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}%</span>
                </div>
                <input
                  type="range" min={5} max={90} value={value}
                  onChange={e => {
                    const nv = parseInt(e.target.value);
                    const other = label === "训练集" ? "train" : label === "验证集" ? "val" : "test";
                    if (other === "train") { setTrain(nv); }
                    else if (other === "val") { setVal(nv); }
                    else { setTest(nv); }
                  }}
                  style={{ width: "100%", accentColor: color }}
                />
              </div>
            ))}
          </div>

          {/* 总和提示 */}
          <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 16, fontSize: 12, textAlign: "center",
            background: train + val + test === 100 ? "#dcfce7" : "#fee2e2", color: train + val + test === 100 ? "#15803d" : "#dc2626" }}>
            {train + val + test === 100 ? "比例合法，可以执行划分" : `比例总和：${train + val + test}%（需等于 100%）`}
          </div>

          {/* 进度条 */}
          {splitting && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "#475569" }}>
                <span>正在划分数据...</span>
                <span style={{ color: "#3b82f6" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #3b82f6, #60a5fa)", borderRadius: 3, transition: "width 0.2s" }} />
              </div>
            </div>
          )}

          {/* 结果展示 */}
          {completed && (
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", marginBottom: 16, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>划分结果</div>
              <div style={{ display: "flex", height: 24, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ flex: train, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>{train}%</div>
                <div style={{ flex: val, background: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>{val}%</div>
                <div style={{ flex: test, background: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 600 }}>{test}%</div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                <span style={{ color: "#3b82f6" }}>训练 {trainCount.toLocaleString()} 条</span>
                <span style={{ color: "#10b981" }}>验证 {valCount.toLocaleString()} 条</span>
                <span style={{ color: "#f59e0b" }}>测试 {testCount.toLocaleString()} 条</span>
              </div>
            </div>
          )}

          {/* 执行按钮 */}
          <button
            onClick={handleSplit}
            disabled={splitting || train + val + test !== 100}
            style={{
              width: "100%", padding: "10px", borderRadius: 6, border: "none",
              background: splitting || train + val + test !== 100 ? "#e2e8f0" : "#3b82f6",
              color: splitting || train + val + test !== 100 ? "#94a3b8" : "#fff",
              fontSize: 13, fontWeight: 600, cursor: splitting || train + val + test !== 100 ? "not-allowed" : "pointer",
            }}
          >
            {splitting ? "划分中..." : completed ? "重新划分" : "执行划分"}
          </button>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 13 }}>
          <Sliders size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <p>按规则划分（支持按类别/时间/来源规则自动分配）</p>
          <p style={{ fontSize: 11, marginTop: 8, opacity: 0.7 }}>功能开发中，敬请期待</p>
        </div>
      )}
    </div>
  );
}

// --- 数据集测评 Tab ---
function EvalTab({ ds }: { ds: Dataset }) {
  const [evaluating, setEvaluating] = useState(false);
  const [evalProgress, setEvalProgress] = useState(0);
  const [reportGenerated, setReportGenerated] = useState(!!ds.eval_score);

  const metrics = [
    { name: "准确率", score: ds.quality_score ? ds.quality_score - 3.2 + Math.random() * 2 : 0, threshold: 85 },
    { name: "召回率", score: ds.quality_score ? ds.quality_score - 5.1 + Math.random() * 3 : 0, threshold: 80 },
    { name: "F1分数", score: ds.quality_score ?? 0, threshold: 80 },
    { name: "覆盖率", score: ds.quality_score ? ds.quality_score - 1.5 + Math.random() : 0, threshold: 75 },
    { name: "一致性", score: ds.quality_score ? ds.quality_score - 7.0 + Math.random() * 4 : 0, threshold: 85 },
    { name: "去重率", score: ds.md5_dedup ? 92 + Math.random() * 5 : 0, threshold: 80 },
  ];

  const handleEvaluate = () => {
    setEvaluating(true);
    setEvalProgress(0);
    const interval = setInterval(() => {
      setEvalProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setEvaluating(false);
          setReportGenerated(true);
          return 100;
        }
        return p + Math.random() * 10;
      });
    }, 300);
  };

  return (
    <div style={{ padding: "0 4px" }}>
      {/* 质量概览 */}
      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "16px", marginBottom: 20, textAlign: "center", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>综合质量评分</div>
        {ds.quality_score ? (
          <>
            <div style={{ fontSize: 48, fontWeight: 800, color: ds.quality_score >= 90 ? "#10b981" : ds.quality_score >= 80 ? "#f59e0b" : "#ef4444", lineHeight: 1 }}>
              {ds.quality_score.toFixed(1)}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>分 / 100</div>
            {/* 评分条 */}
            <div style={{ marginTop: 12, height: 6, background: "#e2e8f0", borderRadius: 3 }}>
              <div style={{
                height: "100%", width: `${ds.quality_score}%`,
                background: ds.quality_score >= 90 ? "#10b981" : ds.quality_score >= 80 ? "#f59e0b" : "#ef4444",
                borderRadius: 3,
              }} />
            </div>
          </>
        ) : (
          <div style={{ fontSize: 32, color: "#cbd5e1", fontWeight: 700 }}>—</div>
        )}
      </div>

      {/* 详细指标 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>质量指标详情</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {metrics.map(({ name, score, threshold }) => {
            const isAnomaly = score < threshold;
            return (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#475569" }}>{name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {isAnomaly && <AlertTriangle size={12} color="#ef4444" />}
                    <span style={{ fontSize: 12, fontWeight: 600, color: isAnomaly ? "#ef4444" : "#1e293b" }}>
                      {score > 0 ? score.toFixed(1) : "—"}
                    </span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>/ {threshold}</span>
                  </div>
                </div>
                <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.min((score / 100) * 100, 100)}%`,
                    background: isAnomaly ? "#ef4444" : score >= threshold ? "#10b981" : "#f59e0b",
                    borderRadius: 2,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 报告 */}
      {reportGenerated && (
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 16px", marginBottom: 16, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>测评报告</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileCheck size={16} color="#10b981" />
            <span style={{ fontSize: 12, color: "#1e293b", flex: 1 }}>质量评估报告已生成</span>
            <button style={{ padding: "4px 12px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", color: "#3b82f6", fontSize: 11, cursor: "pointer" }}>
              导出报告
            </button>
          </div>
        </div>
      )}

      {/* 评估按钮 */}
      <button
        onClick={handleEvaluate}
        disabled={evaluating}
        style={{
          width: "100%", padding: "10px", borderRadius: 6, border: "none",
          background: evaluating ? "#e2e8f0" : "#8b5cf6",
          color: evaluating ? "#94a3b8" : "#fff",
          fontSize: 13, fontWeight: 600, cursor: evaluating ? "not-allowed" : "pointer",
        }}
      >
        {evaluating ? `评估中 ${Math.round(evalProgress)}%...` : reportGenerated ? "重新评估" : "开始质量评估"}
      </button>
    </div>
  );
}

// ==================== DetailModal ====================
function DetailModal({ ds, onClose }: { ds: Dataset; onClose: () => void }) {
  const [tab, setTab] = useState<"overview" | "split" | "eval">("overview");

  const tabs = [
    { key: "overview", label: "概览" },
    { key: "split", label: "数据集划分" },
    { key: "eval", label: "数据集测评" },
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      backdropFilter: "blur(4px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0",
        width: "100%", maxWidth: 680, maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Database size={20} color="#3b82f6" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{ds.name}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <TypeBadge type={ds.type} />
              <QualityBadge status={ds.quality_status} />
              <PermissionBadge perm={ds.permission || "private"} />
              <PublishStatusBadge status={ds.publish_status || "draft"} />
              <ScoreBadge score={ds.quality_score} />
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 4, flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, padding: "16px 24px 0", borderBottom: "1px solid #e2e8f0" }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              style={{
                padding: "8px 16px", borderRadius: "8px 8px 0 0", border: "none", borderBottom: `2px solid`,
                borderBottomColor: tab === t.key ? "#3b82f6" : "transparent",
                background: "transparent", color: tab === t.key ? "#3b82f6" : "#94a3b8",
                fontSize: 13, fontWeight: 500, cursor: "pointer", marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>
          {tab === "overview" && <OverviewTab ds={ds} />}
          {tab === "split" && <SplitTab ds={ds} />}
          {tab === "eval" && <EvalTab ds={ds} />}
        </div>
      </div>
    </div>
  );
}

// ==================== Main Page ====================
export default function DatasetManagerPage() {
  const router = useRouter();
  const [data, setData] = useState<Dataset[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setData(getDatasets());
  }, []);

  // 按创建时间倒序排列
  const sorted = [...data].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const filtered = sorted.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.task_name.toLowerCase().includes(search.toLowerCase()) ||
      d.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchType = filterType === "all" || d.type === filterType;
    const matchStatus = filterStatus === "all" || d.publish_status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 搜索或筛选时重置页码
  useEffect(() => { setPage(1); }, [search, filterType, filterStatus]);

  const publishedCount = data.filter(d => d.publish_status === "published").length;
  const splitDoneCount = data.filter(d => d.split_ratio).length;
  const evalDoneCount = data.filter(d => d.quality_score).length;
  const totalItems = data.reduce((sum, d) => sum + d.item_count, 0);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#1e293b", fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
      {/* Top Bar */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #e2e8f0",
        padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={20} color="#3b82f6" />
            数据集管理
          </h1>
          <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 28px" }}>数据集列表 · 数据集划分 · 数据集测评</p>
        </div>
      </div>

      <div style={{ padding: "20px 28px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "数据集总数", value: data.length, unit: "个", color: "#3b82f6" },
            { label: "已发布", value: publishedCount, unit: "个", color: "#10b981" },
            { label: "已完成划分", value: splitDoneCount, unit: "个", color: "#8b5cf6" },
            { label: "已完成测评", value: evalDoneCount, unit: "个", color: "#f59e0b" },
          ].map(({ label, value, unit, color }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color }}>
                {value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{unit}</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索数据集名称、标签..."
              style={{ width: 280, padding: "8px 12px 8px 36px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#1e293b", fontSize: 13, outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#1e293b", fontSize: 13, outline: "none", cursor: "pointer" }}>
            <option value="all">全部类型</option>
            {DATA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e2e8f0", background: "#fff", color: "#1e293b", fontSize: 13, outline: "none", cursor: "pointer" }}>
            <option value="all">全部状态</option>
            <option value="published">已发布</option>
            <option value="draft">草稿</option>
            <option value="archived">归档</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 100px 80px 60px 80px 60px 80px 48px", gap: 12, padding: "10px 20px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>数据集</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap" }}>类型</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textAlign: "right" }}>总条数</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}>质量</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}>训练/验证/测试</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}>版本</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}>状态</span>
            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, whiteSpace: "nowrap", textAlign: "center" }}></span>
          </div>

          {/* Table Rows */}
          {paged.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
              <Database size={32} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
              <p>未找到匹配的数据集</p>
            </div>
          ) : (
            paged.map((ds, idx) => (
              <div
                key={ds.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 100px 80px 60px 80px 60px 80px 48px",
                  gap: 12, padding: "12px 20px", alignItems: "center",
                  borderBottom: idx < paged.length - 1 ? "1px solid #f1f5f9" : "none",
                  background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#fafbfc")}
              >
                {/* 数据集名称 */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{ds.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8" }}>{ds.task_name}</div>
                </div>
                {/* 类型 */}
                <TypeBadge type={ds.type} />
                {/* 总条数 */}
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b", textAlign: "right" }}>
                  {ds.item_count.toLocaleString()}
                </div>
                {/* 质量 */}
                <ScoreBadge score={ds.quality_score} />
                {/* 训练/验证/测试 */}
                <div style={{ fontSize: 11, color: ds.split_ratio ? "#10b981" : "#cbd5e1", textAlign: "center" }}>
                  {ds.split_ratio ? `${ds.split_ratio.train}/${ds.split_ratio.val}/${ds.split_ratio.test}` : "—"}
                </div>
                {/* 版本 */}
                <div style={{ fontSize: 11, color: "#64748b", textAlign: "center" }}>
                  {ds.versions?.[0]?.version || "v1.0"}
                </div>
                {/* 状态 */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <PublishStatusBadge status={ds.publish_status || "draft"} />
                </div>
                {/* 操作 - 图标 */}
                <div onClick={e => e.stopPropagation()} style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    onClick={() => router.push(`/data-asset/dataset/detail/${ds.id}`)}
                    title="查看详情"
                    style={{
                      width: 32, height: 32, borderRadius: 6, border: "1px solid #e2e8f0",
                      background: "#fff", color: "#3b82f6", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
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
                      borderColor: page === p ? "#3b82f6" : "#e2e8f0",
                      borderRadius: 6,
                      background: page === p ? "#3b82f6" : "#fff",
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
      </div>

    </main>
  );
}
