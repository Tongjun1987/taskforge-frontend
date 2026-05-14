"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus, Search, Database, Pencil, Trash2, Eye, Upload, X, CheckCircle2,
  AlertCircle, Clock, FileUp, FolderOpen, Cloud, Globe, Server, Layers,
  ArrowLeft, Image, FileText, Video, Music, Box, Sparkles, Brain,
  ChevronRight, Save, HardDrive, Link as LinkIcon, Cpu, BookOpen,
  GitBranch, History, RotateCcw, Download, Share2, Users, Lock,
  Tag, Filter, BarChart3, GitCompare, RefreshCw, Shield, Hash,
  ChevronDown, FolderTree, FileCheck, ArrowUpDown, AlertTriangle,
  GitMerge, EyeOff, UserCheck, KeyRound, Target, ChevronLeft, ChevronRight as ChevronRightPage,
  Wifi, HardDriveDownload, CloudDownload, Database as DatabaseIcon, Server as ServerIcon,
  Activity, Loader2
} from "lucide-react";

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
  // 数据接入专用字段
  access_protocol?: string;        // 接入协议: RTSP/API/HTTP/本地/OSS/Kafka/MySQL CDC
  access_status?: "accessing" | "completed" | "failed" | "pending";  // 接入状态
  access_progress?: number;         // 接入进度 0-100
  access_rate?: number;             // 接入成功率
  source_url?: string;              // 接入源地址
  real_time_stream?: boolean;      // 是否实时流
}

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
  { value: "timeseries", label: "时序数据", icon: BarChart3, color: "#06b6d4" },
  { value: "pointcloud", label: "点云数据", icon: Target, color: "#f43f5e" },
];

const SOURCE_TYPES = [
  { value: "local", label: "本地文件", icon: FileUp, color: "#6366f1" },
  { value: "server", label: "文件服务器", icon: Server, color: "#8b5cf6" },
  { value: "cloud", label: "云平台", icon: Cloud, color: "#3b82f6" },
  { value: "platform", label: "平台数据", icon: Layers, color: "#10b981" },
  { value: "public", label: "公开数据", icon: Globe, color: "#f59e0b" },
  { value: "rtsp", label: "RTSP流", icon: Wifi, color: "#ec4899" },
  { value: "api", label: "API/HTTP", icon: ServerIcon, color: "#f59e0b" },
  { value: "kafka", label: "Kafka流", icon: Activity, color: "#14b8a6" },
  { value: "mysql_cdc", label: "MySQL CDC", icon: DatabaseIcon, color: "#3b82f6" },
  { value: "oss", label: "OSS对象存储", icon: CloudDownload, color: "#8b5cf6" },
];

// 接入协议字典
const ACCESS_PROTOCOLS: Record<string, { label: string; icon: any; color: string }> = {
  RTSP: { label: "RTSP 视频流", icon: Wifi, color: "#ec4899" },
  "API/HTTP": { label: "API/HTTP 接口", icon: ServerIcon, color: "#f59e0b" },
  "本地上传/OSS": { label: "本地上传 / OSS", icon: CloudDownload, color: "#8b5cf6" },
  Kafka: { label: "Kafka 消息队列", icon: Activity, color: "#14b8a6" },
  "OSS 批量": { label: "OSS 对象存储", icon: CloudDownload, color: "#8b5cf6" },
  "MySQL CDC": { label: "MySQL CDC", icon: DatabaseIcon, color: "#3b82f6" },
};

// 接入状态字典
const ACCESS_STATUS: Record<string, { label: string; bg: string; color: string; icon: any }> = {
  accessing: { label: "接入中", bg: "#dbeafe", color: "#1d4ed8", icon: Loader2 },
  completed: { label: "已完成", bg: "#dcfce7", color: "#15803d", icon: CheckCircle2 },
  failed: { label: "失败", bg: "#fee2e2", color: "#dc2626", icon: AlertCircle },
  pending: { label: "待接入", bg: "#fef9c3", color: "#ca8a04", icon: Clock },
};

const STORAGE_KEY = "taskforge_datasets_access";

const MOCK_DATASETS: Dataset[] = [
  {
    id: "ds-1", name: "客服意图识别数据", type: "text", source_type: "cloud", source_name: "生产环境OSS",
    item_count: 15800, quality_status: "passed", task_name: "意图识别v2.1",
    tags: ["意图识别", "客服", "对话AI"],
    collaborators: ["张伟", "李娜", "王芳"],
    permission: "team",
    md5_dedup: true, traceability: "完整可追溯",
    import_format: ["JSONL", "CSV", "TXT"],
    versions: [
      { version: "v2.1", date: "2026-04-08", item_count: 5800, uploader: "张伟", note: "新增春季话术数据", md5: "a3f7c91d2e...", size: "128 MB", change_log: "新增春季话术1200条，优化意图分类边界" },
      { version: "v2.0", date: "2026-03-25", item_count: 10000, uploader: "李娜", note: "扩充意图类别", md5: "b8e2c47a1f...", size: "96 MB", change_log: "从8类扩充至12类意图" },
      { version: "v1.0", date: "2026-03-01", item_count: 5000, uploader: "张伟", note: "初始版本", md5: "c90d38e2b7...", size: "48 MB", change_log: "初始版本导入" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "张伟", time: "2026-04-08 14:30", detail: "发布 v2.1 版本", version_from: "v2.0", version_to: "v2.1" },
      { id: "cl-2", action: "MD5去重", user: "系统", time: "2026-04-08 14:28", detail: "自动去除 23 条重复数据", version_from: "v2.1-draft", version_to: "v2.1" },
      { id: "cl-3", action: "分支合并", user: "李娜", time: "2026-03-25 10:15", detail: "合并分支 feature/intent-expand", version_from: "v1.0", version_to: "v2.0" },
      { id: "cl-4", action: "数据导入", user: "张伟", time: "2026-03-01 09:00", detail: "从OSS导入原始数据 5000 条", version_from: undefined, version_to: "v1.0" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-03-01", item_count: 5800, status: "active", description: "主分支，稳定版本" },
      { name: "feature/intent-expand", creator: "李娜", created_at: "2026-03-10", item_count: 5000, status: "merged", description: "意图类别扩充" },
      { name: "feature/spring-data", creator: "王芳", created_at: "2026-04-01", item_count: 1200, status: "merged", description: "春季话术数据" },
    ],
    created_at: "2026-03-01",
  },
  {
    id: "ds-2", name: "产品分类图像数据", type: "image", source_type: "local", source_name: "本地文件",
    item_count: 8500, quality_status: "passed", task_name: "商品分类",
    tags: ["图像分类", "电商", "商品识别"],
    collaborators: ["王芳"],
    permission: "private",
    md5_dedup: true,
    import_format: ["JPG", "PNG", "ZIP"],
    versions: [
      { version: "v1.2", date: "2026-04-05", item_count: 3500, uploader: "王芳", note: "新增家电类目", md5: "d5e9b82c1a...", size: "2.1 GB", change_log: "新增家电类目标注" },
      { version: "v1.1", date: "2026-03-20", item_count: 5000, uploader: "张伟", note: "优化图片质量", md5: "e1f0c73d9b...", size: "1.5 GB", change_log: "去除模糊图像 500 张" },
      { version: "v1.0", date: "2026-03-10", item_count: 3000, uploader: "张伟", note: "初始版本", md5: "f2a1d84eac...", size: "0.9 GB", change_log: "初始版本" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王芳", time: "2026-04-05 16:00", detail: "发布 v1.2", version_from: "v1.1", version_to: "v1.2" },
      { id: "cl-2", action: "格式转换", user: "系统", time: "2026-04-05 15:30", detail: "图片格式统一：JPEG 压缩率 85%", version_from: "v1.2-draft", version_to: "v1.2" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-03-10", item_count: 3500, status: "active", description: "主分支" },
      { name: "feature/appliance", creator: "王芳", created_at: "2026-03-25", item_count: 1500, status: "merged", description: "家电类目" },
    ],
    created_at: "2026-03-10",
  },
  {
    id: "ds-3", name: "情感分析语料库", type: "text", source_type: "platform", source_name: "平台数据",
    item_count: 12000, quality_status: "pending", task_name: "情感分析v1.0",
    tags: ["情感分析", "NLP", "自然语言"],
    collaborators: ["李娜", "赵磊"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JSONL", "CSV"],
    versions: [
      { version: "v1.0", date: "2026-04-03", item_count: 12000, uploader: "李娜", note: "初始版本", md5: "g3b2e95fbd...", size: "3.2 MB", change_log: "平台数据导入" },
    ],
    changelog: [
      { id: "cl-1", action: "数据导入", user: "李娜", time: "2026-04-03 11:00", detail: "从平台 ODS 层导入 12000 条", version_from: undefined, version_to: "v1.0" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-03 11:05", detail: "发现 156 条重复数据", version_from: "v1.0-draft", version_to: "v1.0" },
    ],
    branches: [
      { name: "main", creator: "李娜", created_at: "2026-04-03", item_count: 12000, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-03",
  },
  {
    id: "ds-4", name: "语音指令识别集", type: "audio", source_type: "cloud", source_name: "备份OBS",
    item_count: 4200, quality_status: "failed", task_name: "语音指令",
    tags: ["语音识别", "ASR", "指令控制"],
    collaborators: ["张伟"],
    permission: "private",
    md5_dedup: false,
    import_format: ["WAV", "MP3", "FLAC"],
    versions: [
      { version: "v1.0", date: "2026-04-01", item_count: 4200, uploader: "张伟", note: "初始版本", md5: "h4c3f06gce...", size: "8.7 GB", change_log: "初始版本" },
    ],
    changelog: [],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-01", item_count: 4200, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "ds-5", name: "产品介绍视频集", type: "video", source_type: "cloud", source_name: "腾讯COS",
    item_count: 620, quality_status: "passed", task_name: "视频理解v1.0",
    tags: ["视频理解", "多模态", "商品展示"],
    collaborators: ["赵磊", "王芳"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "AVI", "MKV"],
    versions: [
      { version: "v1.0", date: "2026-04-05", item_count: 620, uploader: "赵磊", note: "初始版本", md5: "i5d4g17hdf...", size: "156 GB", change_log: "从 COS 导入视频文件" },
    ],
    changelog: [
      { id: "cl-1", action: "数据导入", user: "赵磊", time: "2026-04-05 09:30", detail: "导入视频文件 620 个", version_from: undefined, version_to: "v1.0" },
    ],
    branches: [
      { name: "main", creator: "赵磊", created_at: "2026-04-05", item_count: 620, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-05",
  },
  {
    id: "ds-6", name: "图文多模态语料", type: "multimodal", source_type: "public", source_name: "HuggingFace",
    item_count: 32000, quality_status: "pending", task_name: "多模态理解",
    tags: ["多模态", "图文对", "公开数据"],
    collaborators: ["李娜"],
    permission: "public",
    md5_dedup: true,
    import_format: ["JSONL", "Parquet"],
    versions: [
      { version: "v1.0", date: "2026-04-06", item_count: 32000, uploader: "李娜", note: "公开数据集导入", md5: "j6e5h28ief...", size: "4.5 GB", change_log: "从 HuggingFace 导入" },
    ],
    changelog: [],
    branches: [
      { name: "main", creator: "李娜", created_at: "2026-04-06", item_count: 32000, status: "active", description: "主分支" },
    ],
    created_at: "2026-04-06",
  },
  {
    id: "traffic-ds-1", name: "交通事故检测数据", type: "video", source_type: "cloud", source_name: "高速公路监控中心",
    item_count: 8500, quality_status: "passed", task_name: "交通事故检测",
    scene_name: "交通事件识别",
    tags: ["交通事件", "视频", "目标检测"],
    collaborators: ["王强", "李明", "张伟"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "AVI"],
    versions: [
      { version: "v2.1", date: "2026-04-10", item_count: 3500, uploader: "王强", note: "新增雨天事故场景", md5: "k7f6i39jgf...", size: "820 GB", change_log: "新增雨天事故监控视频" },
      { version: "v2.0", date: "2026-04-05", item_count: 5000, uploader: "李明", note: "扩充夜间事故样本", md5: "l8g7j40khg...", size: "600 GB", change_log: "夜间事故样本 2000 段" },
      { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "张伟", note: "初始版本", md5: "m9h8k51lig...", size: "350 GB", change_log: "初始版本" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王强", time: "2026-04-10 10:00", detail: "发布 v2.1", version_from: "v2.0", version_to: "v2.1" },
      { id: "cl-2", action: "分支合并", user: "李明", time: "2026-04-05 14:30", detail: "合并 feature/night-accident", version_from: "v1.0", version_to: "v2.0" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-01", item_count: 3500, status: "active", description: "主分支" },
      { name: "feature/night-accident", creator: "李明", created_at: "2026-03-15", item_count: 2000, status: "merged", description: "夜间事故" },
      { name: "feature/rain-weather", creator: "王强", created_at: "2026-03-20", item_count: 1500, status: "merged", description: "雨天场景" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "traffic-ds-2", name: "交通事件分类数据", type: "image", source_type: "cloud", source_name: "城市道路监控",
    item_count: 12000, quality_status: "passed", task_name: "事件类型分类",
    scene_name: "交通事件识别",
    tags: ["交通事件", "图像分类", "智慧城市"],
    collaborators: ["赵磊", "张伟", "李娜"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JPG", "PNG", "ZIP"],
    versions: [
      { version: "v1.2", date: "2026-04-08", item_count: 5000, uploader: "赵磊", note: "新增7类事件标注", md5: "n0i9l62mjh...", size: "3.2 GB", change_log: "新增 7 类事件" },
      { version: "v1.1", date: "2026-04-03", item_count: 4000, uploader: "张伟", note: "扩充拥堵类样本", md5: "o1j0m73njh...", size: "2.5 GB", change_log: "扩充拥堵类" },
      { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "李娜", note: "初始版本", md5: "p2k1n84okh...", size: "1.8 GB", change_log: "5类基础事件" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "赵磊", time: "2026-04-08 15:00", detail: "发布 v1.2", version_from: "v1.1", version_to: "v1.2" },
      { id: "cl-2", action: "权限变更", user: "张伟", time: "2026-04-03 11:00", detail: "private → team", version_from: undefined, version_to: undefined },
    ],
    branches: [
      { name: "main", creator: "李娜", created_at: "2026-04-01", item_count: 5000, status: "active", description: "主分支" },
      { name: "feature/new-classes", creator: "赵磊", created_at: "2026-03-25", item_count: 2000, status: "merged", description: "新增事件标注" },
    ],
    created_at: "2026-04-01",
  },
  // ========== 五核心任务数据集 ==========
  {
    id: "core-ds-1", name: "COCO-Traffic-2024", type: "image", source_type: "cloud", source_name: "交通监控云存储",
    item_count: 18500, quality_status: "passed", task_name: "交通目标检测",
    scene_name: "交通事件识别",
    tags: ["目标检测", "交通", "COCO格式", "bbox"],
    collaborators: ["王强", "李明"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JPG", "JSON"],
    versions: [
      { version: "v2.1", date: "2026-04-15", item_count: 18500, uploader: "王强", note: "扩充车辆类别", md5: "coco-t-2024-v21", size: "45.2 GB", change_log: "新增车辆子类别：SUV/卡车/公交车" },
      { version: "v2.0", date: "2026-04-10", item_count: 15000, uploader: "李明", note: "标准化COCO格式", md5: "coco-t-2024-v20", size: "38.5 GB", change_log: "统一标注格式为COCO 1.0" },
      { version: "v1.0", date: "2026-04-01", item_count: 12000, uploader: "王强", note: "初始版本", md5: "coco-t-2024-v10", size: "32.1 GB", change_log: "12类目标检测数据" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王强", time: "2026-04-15 10:00", detail: "发布 v2.1", version_from: "v2.0", version_to: "v2.1" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-15 09:30", detail: "mAP@0.5 达到 91.2%", version_from: "v2.1-draft", version_to: "v2.1" },
    ],
    branches: [
      { name: "main", creator: "王强", created_at: "2026-04-01", item_count: 18500, status: "active", description: "主分支，稳定版本" },
      { name: "feature/vehicle-expand", creator: "李明", created_at: "2026-04-08", item_count: 3500, status: "merged", description: "车辆类别扩充" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "core-ds-2", name: "MOT17-Traffic", type: "video", source_type: "cloud", source_name: "交通视频流存储",
    item_count: 12400, quality_status: "passed", task_name: "多目标跟踪",
    scene_name: "交通事件识别",
    tags: ["多目标跟踪", "MOT", "视频", "ID关联"],
    collaborators: ["李明", "张伟", "陈志远"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "CSV"],
    versions: [
      { version: "v1.3", date: "2026-04-18", item_count: 12400, uploader: "李明", note: "扩充夜间场景", md5: "mot17-t-v13", size: "2.8 TB", change_log: "新增夜间跟踪视频 2000 段" },
      { version: "v1.2", date: "2026-04-12", item_count: 10200, uploader: "张伟", note: "优化遮挡场景", md5: "mot17-t-v12", size: "2.3 TB", change_log: "重点优化遮挡场景的ID连续性" },
      { version: "v1.1", date: "2026-04-06", item_count: 8000, uploader: "陈志远", note: "标准MOT格式", md5: "mot17-t-v11", size: "1.8 TB", change_log: "统一为MOT17格式" },
      { version: "v1.0", date: "2026-04-01", item_count: 5000, uploader: "李明", note: "初始版本", md5: "mot17-t-v10", size: "1.2 TB", change_log: "初始版本" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "李明", time: "2026-04-18 14:00", detail: "发布 v1.3", version_from: "v1.2", version_to: "v1.3" },
      { id: "cl-2", action: "分支合并", user: "张伟", time: "2026-04-12 16:30", detail: "合并 feature/occlusion-handling", version_from: "v1.1", version_to: "v1.2" },
    ],
    branches: [
      { name: "main", creator: "李明", created_at: "2026-04-01", item_count: 12400, status: "active", description: "主分支" },
      { name: "feature/night-scene", creator: "李明", created_at: "2026-04-10", item_count: 2200, status: "merged", description: "夜间场景" },
      { name: "feature/occlusion-handling", creator: "张伟", created_at: "2026-04-06", item_count: 2000, status: "merged", description: "遮挡处理" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "core-ds-3", name: "TrafficBehavior-V3", type: "video", source_type: "cloud", source_name: "行为分析云平台",
    item_count: 9800, quality_status: "passed", task_name: "交通行为识别",
    scene_name: "交通事件识别",
    tags: ["行为识别", "视频理解", "时序分析", "SlowFast"],
    collaborators: ["王雪梅", "陈志远", "赵磊"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "JSON"],
    versions: [
      { version: "v3.0", date: "2026-04-19", item_count: 9800, uploader: "王雪梅", note: "15类行为标注", md5: "tbv3-v30", size: "1.5 TB", change_log: "覆盖变道/超速/逆行/占道/急刹等15类行为" },
      { version: "v2.1", date: "2026-04-15", item_count: 7500, uploader: "陈志远", note: "扩充危险行为", md5: "tbv3-v21", size: "1.2 TB", change_log: "新增危险驾驶行为标注" },
      { version: "v2.0", date: "2026-04-10", item_count: 5000, uploader: "赵磊", note: "标准化格式", md5: "tbv3-v20", size: "0.8 TB", change_log: "统一为视频片段格式" },
      { version: "v1.0", date: "2026-04-01", item_count: 3000, uploader: "王雪梅", note: "初始版本", md5: "tbv3-v10", size: "0.5 TB", change_log: "8类基础行为" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "王雪梅", time: "2026-04-19 11:00", detail: "发布 v3.0", version_from: "v2.1", version_to: "v3.0" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-19 10:30", detail: "行为识别准确率 85.6%", version_from: "v3.0-draft", version_to: "v3.0" },
    ],
    branches: [
      { name: "main", creator: "王雪梅", created_at: "2026-04-01", item_count: 9800, status: "active", description: "主分支" },
      { name: "feature/danger-behavior", creator: "陈志远", created_at: "2026-04-08", item_count: 2500, status: "merged", description: "危险行为" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "core-ds-4", name: "TrafficEvent-Dataset-2026", type: "video", source_type: "cloud", source_name: "事件分析中心",
    item_count: 5600, quality_status: "passed", task_name: "交通事件识别",
    scene_name: "交通事件识别",
    tags: ["事件检测", "交通事故", "异常告警", "事故分析"],
    collaborators: ["张伟", "李明", "王强"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "JSON", "CSV"],
    versions: [
      { version: "v2.0", date: "2026-04-20", item_count: 5600, uploader: "张伟", note: "8类事件全覆盖", md5: "ted2026-v20", size: "3.2 TB", change_log: "覆盖交通事故/拥堵/违章停车/抛洒物等8类" },
      { version: "v1.2", date: "2026-04-15", item_count: 4200, uploader: "李明", note: "扩充拥堵事件", md5: "ted2026-v12", size: "2.4 TB", change_log: "新增拥堵类事件 800 段" },
      { version: "v1.1", date: "2026-04-08", item_count: 3500, uploader: "王强", note: "扩充事故类型", md5: "ted2026-v11", size: "2.0 TB", change_log: "新增3类事故子类型" },
      { version: "v1.0", date: "2026-04-01", item_count: 2500, uploader: "张伟", note: "初始版本", md5: "ted2026-v10", size: "1.5 TB", change_log: "5类基础事件" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "张伟", time: "2026-04-20 15:00", detail: "发布 v2.0", version_from: "v1.2", version_to: "v2.0" },
      { id: "cl-2", action: "分支合并", user: "李明", time: "2026-04-15 14:00", detail: "合并 feature/jam-event", version_from: "v1.1", version_to: "v1.2" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-01", item_count: 5600, status: "active", description: "主分支" },
      { name: "feature/jam-event", creator: "李明", created_at: "2026-04-08", item_count: 700, status: "merged", description: "拥堵事件" },
      { name: "feature/accident-subtype", creator: "王强", created_at: "2026-04-05", item_count: 1000, status: "merged", description: "事故子类型" },
    ],
    created_at: "2026-04-01",
  },
  {
    id: "core-ds-5", name: "TrafficTimeSeries-2026", type: "timeseries", source_type: "platform", source_name: "交通数据中台",
    item_count: 28000, quality_status: "passed", task_name: "时序建模与异常分析",
    scene_name: "交通事件识别",
    tags: ["时序建模", "流量预测", "异常检测", "Transformer"],
    collaborators: ["陈志远", "赵磊", "李娜"],
    permission: "team",
    md5_dedup: true,
    import_format: ["CSV", "Parquet"],
    versions: [
      { version: "v1.5", date: "2026-04-21", item_count: 28000, uploader: "陈志远", note: "扩充特征维度", md5: "tts2026-v15", size: "12.8 GB", change_log: "新增30维度特征：速度/流量/密度/占有率" },
      { version: "v1.4", date: "2026-04-18", item_count: 22000, uploader: "赵磊", note: "扩充历史数据", md5: "tts2026-v14", size: "10.2 GB", change_log: "扩充历史数据至365天" },
      { version: "v1.3", date: "2026-04-14", item_count: 18000, uploader: "李娜", note: "标准化采样率", md5: "tts2026-v13", size: "8.5 GB", change_log: "统一采样率5分钟/次" },
      { version: "v1.2", date: "2026-04-10", item_count: 15000, uploader: "陈志远", note: "扩充检测器", md5: "tts2026-v12", size: "7.2 GB", change_log: "扩充至500个检测器" },
      { version: "v1.1", date: "2026-04-05", item_count: 10000, uploader: "赵磊", note: "多路段数据", md5: "tts2026-v11", size: "4.8 GB", change_log: "扩充至10个路段" },
      { version: "v1.0", date: "2026-04-01", item_count: 5000, uploader: "陈志远", note: "初始版本", md5: "tts2026-v10", size: "2.4 GB", change_log: "初始版本" },
    ],
    changelog: [
      { id: "cl-1", action: "版本发布", user: "陈志远", time: "2026-04-21 10:00", detail: "发布 v1.5", version_from: "v1.4", version_to: "v1.5" },
      { id: "cl-2", action: "分支合并", user: "赵磊", time: "2026-04-18 15:00", detail: "合并 feature/history-expand", version_from: "v1.3", version_to: "v1.4" },
      { id: "cl-3", action: "质量检测", user: "系统", time: "2026-04-21 09:30", detail: "MAE < 2.0, RMSE < 3.0", version_from: "v1.5-draft", version_to: "v1.5" },
    ],
    branches: [
      { name: "main", creator: "陈志远", created_at: "2026-04-01", item_count: 28000, status: "active", description: "主分支" },
      { name: "feature/history-expand", creator: "赵磊", created_at: "2026-04-10", item_count: 4000, status: "merged", description: "历史数据扩充" },
      { name: "feature/feature-dim", creator: "李娜", created_at: "2026-04-15", item_count: 6000, status: "merged", description: "特征维度扩充" },
    ],
    created_at: "2026-04-01",
  },
  // ========== 全链路仿真数据接入任务 ==========
  {
    id: "sim-access-1",
    name: "G15高速全线监控视频流",
    type: "video",
    source_type: "rtsp",
    source_name: "G15沈海高速监控中心",
    source_url: "rtsp://10.0.1.100:554/stream/g15-full",
    access_protocol: "RTSP",
    access_status: "accessing",
    access_progress: 65,
    access_rate: 97.3,
    real_time_stream: true,
    item_count: 3850000,
    quality_status: "pending",
    task_name: "交通目标检测",
    scene_name: "交通事件识别",
    tags: ["视频流", "实时", "RTSP", "高速公路", "目标检测"],
    collaborators: ["王强", "李明"],
    permission: "team",
    md5_dedup: false,
    import_format: ["RTSP流", "H.264"],
    versions: [
      { version: "v1.0", date: "2026-04-21", item_count: 3850000, uploader: "王强", note: "接入中", md5: "sim-g15-v10", size: "—", change_log: "RTSP视频流接入任务创建" },
    ],
    changelog: [
      { id: "cl-1", action: "接入启动", user: "王强", time: "2026-04-21 08:00", detail: "启动G15高速RTSP视频流接入任务" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-21 10:30", detail: "当前接入成功率 97.3%，已接入 2,502,500 帧" },
    ],
    branches: [
      { name: "main", creator: "王强", created_at: "2026-04-21", item_count: 2502500, status: "active", description: "接入中" },
    ],
    created_at: "2026-04-21",
  },
  {
    id: "sim-access-2",
    name: "城市路网卡口图像流",
    type: "image",
    source_type: "api",
    source_name: "城市交通卡口系统",
    source_url: "https://api.traffic.gov.cn/v1/capture/stream",
    access_protocol: "API/HTTP",
    access_status: "accessing",
    access_progress: 42,
    access_rate: 99.1,
    real_time_stream: true,
    item_count: 980000,
    quality_status: "pending",
    task_name: "交通目标检测 & 行为识别",
    scene_name: "交通事件识别",
    tags: ["图像流", "API", "HTTP", "卡口", "目标检测", "行为识别"],
    collaborators: ["张伟", "陈志远"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JPEG", "JSON"],
    versions: [
      { version: "v1.0", date: "2026-04-21", item_count: 980000, uploader: "张伟", note: "接入中", md5: "sim-kakou-v10", size: "—", change_log: "城市路网卡口API接入任务创建" },
    ],
    changelog: [
      { id: "cl-1", action: "接入启动", user: "张伟", time: "2026-04-21 09:00", detail: "启动城市路网卡口图像流接入任务" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-21 11:00", detail: "当前接入成功率 99.1%，已接入 411,600 帧" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-21", item_count: 411600, status: "active", description: "接入中" },
    ],
    created_at: "2026-04-21",
  },
  {
    id: "sim-access-3",
    name: "无人机俯拍视频（MOT）",
    type: "video",
    source_type: "oss",
    source_name: "无人机数据OSS存储",
    source_url: "oss://traffic-drone/video/MOT17/",
    access_protocol: "本地上传/OSS",
    access_status: "completed",
    access_progress: 100,
    access_rate: 98.5,
    real_time_stream: false,
    item_count: 48000,
    quality_status: "passed",
    task_name: "多目标跟踪",
    scene_name: "交通事件识别",
    tags: ["视频", "OSS", "无人机", "MOT", "多目标跟踪"],
    collaborators: ["李明", "赵磊"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "CSV"],
    versions: [
      { version: "v1.0", date: "2026-04-20", item_count: 48000, uploader: "李明", note: "已完成", md5: "sim-drone-v10", size: "128 GB", change_log: "无人机俯拍视频接入完成" },
    ],
    changelog: [
      { id: "cl-1", action: "接入启动", user: "李明", time: "2026-04-20 10:00", detail: "启动无人机俯拍视频接入任务" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-20 15:30", detail: "接入完成，成功率 98.5%" },
      { id: "cl-3", action: "版本发布", user: "李明", time: "2026-04-20 15:45", detail: "发布 v1.0", version_from: undefined, version_to: "v1.0" },
    ],
    branches: [
      { name: "main", creator: "李明", created_at: "2026-04-20", item_count: 48000, status: "active", description: "已完成" },
    ],
    created_at: "2026-04-20",
  },
  {
    id: "sim-access-4",
    name: "高德浮动车GPS轨迹流",
    type: "timeseries",
    source_type: "kafka",
    source_name: "高德交通数据Kafka集群",
    source_url: "kafka://amap-traffic:9092/gps-trace-topic",
    access_protocol: "Kafka",
    access_status: "accessing",
    access_progress: 78,
    access_rate: 98.8,
    real_time_stream: true,
    item_count: 24000000,
    quality_status: "pending",
    task_name: "多目标跟踪 & 时序建模",
    scene_name: "交通事件识别",
    tags: ["GPS", "Kafka", "实时流", "轨迹", "时序建模", "多目标跟踪"],
    collaborators: ["陈志远", "李娜"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JSON", "CSV"],
    versions: [
      { version: "v1.0", date: "2026-04-21", item_count: 24000000, uploader: "陈志远", note: "接入中", md5: "sim-gps-v10", size: "—", change_log: "高德浮动车GPS轨迹流接入任务创建" },
    ],
    changelog: [
      { id: "cl-1", action: "接入启动", user: "陈志远", time: "2026-04-21 08:30", detail: "启动高德GPS轨迹Kafka流接入任务" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-21 11:30", detail: "当前接入成功率 98.8%，已接入 18,720,000 条" },
    ],
    branches: [
      { name: "main", creator: "陈志远", created_at: "2026-04-21", item_count: 18720000, status: "active", description: "接入中" },
    ],
    created_at: "2026-04-21",
  },
  {
    id: "sim-access-5",
    name: "交通行为语义视频片段",
    type: "video",
    source_type: "oss",
    source_name: "行为分析OSS存储",
    source_url: "oss://traffic-behavior/video-semantic/",
    access_protocol: "OSS 批量",
    access_status: "completed",
    access_progress: 100,
    access_rate: 99.4,
    real_time_stream: false,
    item_count: 9800,
    quality_status: "passed",
    task_name: "交通行为识别",
    scene_name: "交通事件识别",
    tags: ["视频", "OSS", "语义", "行为识别", "批量导入"],
    collaborators: ["王雪梅", "赵磊"],
    permission: "team",
    md5_dedup: true,
    import_format: ["MP4", "JSON"],
    versions: [
      { version: "v1.0", date: "2026-04-19", item_count: 9800, uploader: "王雪梅", note: "已完成", md5: "sim-behavior-v10", size: "1.5 TB", change_log: "交通行为语义视频片段接入完成" },
    ],
    changelog: [
      { id: "cl-1", action: "接入启动", user: "王雪梅", time: "2026-04-19 09:00", detail: "启动交通行为视频OSS批量接入任务" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-19 14:20", detail: "接入完成，成功率 99.4%" },
      { id: "cl-3", action: "版本发布", user: "王雪梅", time: "2026-04-19 14:30", detail: "发布 v1.0", version_from: undefined, version_to: "v1.0" },
    ],
    branches: [
      { name: "main", creator: "王雪梅", created_at: "2026-04-19", item_count: 9800, status: "active", description: "已完成" },
    ],
    created_at: "2026-04-19",
  },
  {
    id: "sim-access-6",
    name: "历史事故案例数据库",
    type: "text",
    source_type: "mysql_cdc",
    source_name: "交通事故CDC同步库",
    source_url: "mysql://traffic_cdc:***@10.0.2.50:3306/accident_db",
    access_protocol: "MySQL CDC",
    access_status: "completed",
    access_progress: 100,
    access_rate: 99.7,
    real_time_stream: false,
    item_count: 7200,
    quality_status: "passed",
    task_name: "交通事件识别 & 异常分析",
    scene_name: "交通事件识别",
    tags: ["MySQL", "CDC", "历史数据", "事故案例", "事件识别", "异常分析"],
    collaborators: ["张伟", "王强", "李明"],
    permission: "team",
    md5_dedup: true,
    import_format: ["JSON", "MySQL"],
    versions: [
      { version: "v1.0", date: "2026-04-18", item_count: 7200, uploader: "张伟", note: "已完成", md5: "sim-accident-v10", size: "45 MB", change_log: "历史事故案例数据库CDC同步完成" },
    ],
    changelog: [
      { id: "cl-1", action: "接入启动", user: "张伟", time: "2026-04-18 10:00", detail: "启动历史事故数据库MySQL CDC同步任务" },
      { id: "cl-2", action: "质量检测", user: "系统", time: "2026-04-18 12:15", detail: "CDC同步完成，成功率 99.7%" },
      { id: "cl-3", action: "版本发布", user: "张伟", time: "2026-04-18 12:30", detail: "发布 v1.0", version_from: undefined, version_to: "v1.0" },
    ],
    branches: [
      { name: "main", creator: "张伟", created_at: "2026-04-18", item_count: 7200, status: "active", description: "已完成" },
    ],
    created_at: "2026-04-18",
  },
];

function getDatasets(): Dataset[] {
  if (typeof window === "undefined") return MOCK_DATASETS;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : MOCK_DATASETS;
}

function saveDatasets(datasets: Dataset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(datasets));
}

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

function Md5Badge({ active }: { active: boolean }) {
  return active ? (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 4, background: "#f3e8ff", color: "#7c3aed", fontSize: 10, fontWeight: 600 }}>
      <Shield size={10} />MD5
    </span>
  ) : null;
}

function AccessStatusBadge({ status, progress }: { status: string; progress?: number }) {
  const info = ACCESS_STATUS[status] || ACCESS_STATUS.pending;
  const Icon = info.icon;
  const isAccessing = status === "accessing";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        borderRadius: 4,
        background: info.bg,
        color: info.color,
        fontSize: 11,
        fontWeight: 600,
      }}>
        {isAccessing ? <Icon size={11} style={{ animation: "spin 1s linear infinite" }} /> : <Icon size={11} />}
        {info.label}
      </span>
      {isAccessing && progress !== undefined && (
        <div style={{ width: 60, height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: info.color,
            borderRadius: 2,
            transition: "width 0.3s"
          }} />
        </div>
      )}
    </div>
  );
}

function AccessRateBadge({ rate }: { rate?: number }) {
  if (rate === undefined) return null;
  const color = rate >= 99 ? "#10b981" : rate >= 95 ? "#f59e0b" : "#dc2626";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      padding: "1px 6px",
      borderRadius: 3,
      background: `${color}15`,
      color: color,
      fontSize: 10,
      fontWeight: 600,
    }}>
      {rate}%
    </span>
  );
}

function DetailModal({ ds, onClose, onRollback }: { ds: Dataset; onClose: () => void; onRollback?: (v: string) => void }) {
  const [tab, setTab] = useState<"overview" | "version" | "changelog" | "branch" | "permission">("overview");

  const tabs = [
    { key: "overview", label: "概览" },
    { key: "version", label: "版本管理" },
    { key: "changelog", label: "变更日志" },
    { key: "branch", label: "协作分支" },
    { key: "permission", label: "权限控制" },
  ];

  const actionColors: Record<string, string> = {
    "版本发布": "#10b981",
    "MD5去重": "#8b5cf6",
    "分支合并": "#3b82f6",
    "数据导入": "#f59e0b",
    "格式转换": "#ec4899",
    "权限变更": "#64748b",
    "质量检测": "#14b8a6",
    "版本回滚": "#dc2626",
  };

  const branchStatus: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "#dcfce7", color: "#16a34a", label: "活跃" },
    merged: { bg: "#dbeafe", color: "#2563eb", label: "已合并" },
    archived: { bg: "#f1f5f9", color: "#94a3b8", label: "已归档" },
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#fff", borderRadius: 16, width: 900, maxHeight: "85vh", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 28px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Target size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1e293b", margin: 0 }}>{ds.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <TypeBadge type={ds.type} />
                <PermissionBadge perm={ds.permission || "private"} />
                {ds.md5_dedup && <Md5Badge active={true} />}
                <QualityBadge status={ds.quality_status} />
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ display: "flex", gap: 4, padding: "16px 28px 0", borderBottom: "1px solid #e2e8f0", marginTop: 16 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key as any)} style={{
              padding: "7px 16px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: tab === t.key ? "#3b82f6" : "transparent",
              color: tab === t.key ? "#fff" : "#64748b",
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
          {tab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { label: "数据总量", value: ds.item_count.toLocaleString(), color: "#3b82f6" },
                  { label: "版本数量", value: ds.versions.length, color: "#8b5cf6" },
                  { label: "分支数量", value: ds.branches?.length || 0, color: "#10b981" },
                  { label: "变更记录", value: ds.changelog?.length || 0, color: "#f59e0b" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
                {/* 接入信息卡片 */}
                {ds.access_protocol && (
                  <div style={{ background: "#f8fafc", borderRadius: 10, padding: 14, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>接入信息</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>接入协议</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginTop: 2 }}>{ACCESS_PROTOCOLS[ds.access_protocol]?.label || ds.access_protocol}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>接入状态</div>
                        <div style={{ marginTop: 2 }}>
                          <AccessStatusBadge status={ds.access_status || "pending"} progress={ds.access_progress} />
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>接入成功率</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: ds.access_rate && ds.access_rate >= 99 ? "#10b981" : ds.access_rate && ds.access_rate >= 95 ? "#f59e0b" : "#dc2626", marginTop: 2 }}>
                          {ds.access_rate ? `${ds.access_rate}%` : "—"}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#94a3b8" }}>实时流</div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#334155", marginTop: 2 }}>{ds.real_time_stream ? "是" : "否"}</div>
                      </div>
                    </div>
                    {ds.access_progress !== undefined && (
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                          <span>接入进度</span>
                          <span>{ds.access_progress}%</span>
                        </div>
                        <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{
                            width: `${ds.access_progress}%`,
                            height: "100%",
                            background: ds.access_progress === 100 ? "#10b981" : "#3b82f6",
                            borderRadius: 3,
                            transition: "width 0.3s"
                          }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 18, border: "1px solid #e2e8f0" }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 14 }}>基本信息</h4>
                {[
                  { label: "关联任务", value: ds.task_name },
                  { label: "数据来源", value: ds.source_name },
                  { label: "创建时间", value: ds.created_at },
                  { label: "导入格式", value: (ds.import_format || []).join("、") },
                  { label: "协作成员", value: (ds.collaborators || []).join("、") || "无" },
                  { label: "可追溯性", value: ds.traceability || "—" },
                  ...(ds.source_url ? [{ label: "接入地址", value: ds.source_url }] : []),
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ color: "#94a3b8" }}>{row.label}</span>
                    <span style={{ fontWeight: 500, color: "#334155", maxWidth: 200, textAlign: "right", wordBreak: "break-all" }}>{row.value}</span>
                  </div>
                ))}
                {ds.tags && ds.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {ds.tags.map(tag => (
                      <span key={tag} style={{ padding: "3px 10px", borderRadius: 99, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 500 }}>#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "version" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>版本历史</h4>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#334155" }}>
                    <GitCompare size={13} />版本对比
                  </button>
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer", color: "#334155" }}>
                    <Download size={13} />导出
                  </button>
                </div>
              </div>
              {ds.versions.map((v, i) => (
                <div key={v.version} style={{
                  display: "flex", alignItems: "flex-start", gap: 16, padding: 18, borderRadius: 12,
                  background: i === 0 ? "#eff6ff" : "#fff",
                  border: i === 0 ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: i === 0 ? "#3b82f6" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                    {v.version}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{v.note}</span>
                      {i === 0 && <span style={{ padding: "2px 8px", borderRadius: 4, background: "#10b981", color: "#fff", fontSize: 10, fontWeight: 700 }}>当前版本</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 8px", lineHeight: 1.6 }}>{v.change_log || "无变更说明"}</p>
                    <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#94a3b8" }}>
                      <span>{v.date}</span>
                      <span>上传者：{v.uploader}</span>
                      <span>数据量：{v.item_count.toLocaleString()} 条</span>
                      {v.size && <span>大小：{v.size}</span>}
                      {v.md5 && <span>MD5：{v.md5}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, cursor: "pointer", color: "#64748b" }}>
                      <Eye size={12} />预览
                    </button>
                    {i > 0 && (
                      <button
                        onClick={() => onRollback && onRollback(v.version)}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "1px solid #fee2e2", background: "#fff", fontSize: 11, cursor: "pointer", color: "#dc2626" }}>
                        <RotateCcw size={12} />回滚
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "changelog" && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>变更日志</h4>
              {(!ds.changelog || ds.changelog.length === 0) ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                  <History size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
                  <p>暂无变更记录</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                  {ds.changelog.map((entry, i) => (
                    <div key={entry.id} style={{ display: "flex", gap: 16, paddingBottom: 20, position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 80, flexShrink: 0 }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "#334155" }}>{entry.time.split(" ")[0]}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{entry.time.split(" ")[1]}</span>
                      </div>
                      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: actionColors[entry.action] || "#94a3b8", flexShrink: 0, marginTop: 3 }} />
                        {i < ds.changelog!.length - 1 && <div style={{ width: 1, flex: 1, background: "#e2e8f0", marginTop: 4, minHeight: 32 }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ padding: "2px 8px", borderRadius: 4, background: `${actionColors[entry.action] || "#94a3b8"}20`, color: actionColors[entry.action] || "#94a3b8", fontSize: 11, fontWeight: 600 }}>{entry.action}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{entry.user}</span>
                          {entry.version_from && (
                            <span style={{ fontSize: 11, color: "#64748b" }}>{entry.version_from} → {entry.version_to}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.6 }}>{entry.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "branch" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", margin: 0 }}>协作分支</h4>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                  <GitBranch size={13} />新建分支
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(ds.branches || []).map(b => {
                  const bs = branchStatus[b.status];
                  return (
                    <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                      <GitBranch size={18} color="#3b82f6" />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", fontFamily: "monospace" }}>{b.name}</span>
                          <span style={{ padding: "1px 7px", borderRadius: 4, background: bs.bg, color: bs.color, fontSize: 10, fontWeight: 600 }}>{bs.label}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>{b.description} · {b.creator} · {b.created_at} · {b.item_count.toLocaleString()} 条</p>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {b.status === "active" && (
                          <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, cursor: "pointer", color: "#64748b" }}>
                            <GitMerge size={12} />合并
                          </button>
                        )}
                        <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 11, cursor: "pointer", color: "#64748b" }}>
                          <Eye size={12} />查看
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "permission" && (
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>权限控制</h4>
              <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                {(["private", "team", "public"] as const).map(p => {
                  const labels: Record<string, { title: string; desc: string; icon: any }> = {
                    private: { title: "私有", desc: "仅创建者可见和操作", icon: Lock },
                    team: { title: "团队", desc: "团队成员可访问，需申请权限", icon: Users },
                    public: { title: "公开", desc: "平台所有用户可读取，不可写", icon: Globe },
                  };
                  const info = labels[p];
                  const Icon = info.icon;
                  return (
                    <button key={p} onClick={() => {}} style={{
                      flex: 1, padding: 16, borderRadius: 10, border: `2px solid ${ds.permission === p ? "#3b82f6" : "#e2e8f0"}`,
                      background: ds.permission === p ? "#eff6ff" : "#fff",
                      cursor: "pointer", textAlign: "left",
                    }}>
                      <Icon size={18} color={ds.permission === p ? "#3b82f6" : "#94a3b8"} style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: 14, fontWeight: 600, color: ds.permission === p ? "#3b82f6" : "#334155" }}>{info.title}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{info.desc}</div>
                    </button>
                  );
                })}
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: 18, border: "1px solid #e2e8f0" }}>
                <h5 style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>协作成员（{ds.collaborators?.length || 0}人）</h5>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {(ds.collaborators || []).map(c => (
                    <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", borderRadius: 99, border: "1px solid #e2e8f0" }}>
                      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{c[0]}</div>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{c}</span>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: "#dc2626", padding: 0 }}><X size={12} /></button>
                    </div>
                  ))}
                  <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#f8fafc", borderRadius: 99, border: "1px dashed #cbd5e1", cursor: "pointer", fontSize: 13, color: "#94a3b8" }}>
                    <Plus size={13} />添加成员
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DatasetPageContent() {
  const router = useRouter();
  const [data, setData] = useState<Dataset[]>(MOCK_DATASETS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [permFilter, setPermFilter] = useState("");
  const [accessFilter, setAccessFilter] = useState(""); // 接入状态筛选
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const stored = getDatasets();
    setData(stored);
  }, []);

  // 按创建时间排序（新的在前）
  const sortedData = [...data].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // 筛选
  const filtered = sortedData.filter(d => {
    const matchSearch = !search || d.name.includes(search) || d.task_name.includes(search) || (d.tags || []).some(t => t.includes(search));
    const matchType = !typeFilter || d.type === typeFilter;
    const matchPerm = !permFilter || d.permission === permFilter;
    const matchAccess = !accessFilter || d.access_status === accessFilter;
    return matchSearch && matchType && matchPerm && matchAccess;
  });

  // 分页
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedData = filtered.slice((page - 1) * pageSize, page * pageSize);

  // 重置页码当筛选变化时
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
    setter(value);
    setPage(1);
  };

  // 统计
  const totalCount = filtered.length;
  const accessingCount = filtered.filter(d => d.access_status === "accessing").length;
  const completedCount = filtered.filter(d => d.access_status === "completed").length;

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Target size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据接入</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>数据列表 · 版本控制 · MD5去重 · 多团队协作</p>
          </div>
        </div>
        <button
          onClick={() => typeof window !== "undefined" && (window.location.href = "/data-asset/data-access/create")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Plus size={16} />新增数据
        </button>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "数据集总数", value: data.length, unit: "个", color: "#3b82f6" },
          { label: "接入中", value: accessingCount, unit: "个", color: "#f59e0b" },
          { label: "已完成", value: completedCount, unit: "个", color: "#10b981" },
          { label: "质量通过", value: data.filter(d => d.quality_status === "passed").length, unit: "个", color: "#8b5cf6" },
          { label: "协作分支", value: data.reduce((a, d) => a + (d.branches?.length || 0), 0), unit: "个", color: "#ec4899" },
        ].map(card => (
          <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>
              {card.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>{card.unit}</span>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* 筛选栏 */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 300 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="搜索数据名称、标签..." style={{ width: "100%", padding: "8px 10px 8px 32px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={typeFilter} onChange={e => handleFilterChange(setTypeFilter)(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer" }}>
          <option value="">全部类型</option>
          {DATA_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={accessFilter} onChange={e => handleFilterChange(setAccessFilter)(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer" }}>
          <option value="">全部状态</option>
          <option value="accessing">接入中</option>
          <option value="completed">已完成</option>
          <option value="failed">失败</option>
          <option value="pending">待接入</option>
        </select>
        <select value={permFilter} onChange={e => handleFilterChange(setPermFilter)(e.target.value)} style={{ padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff", outline: "none", cursor: "pointer" }}>
          <option value="">全部权限</option>
          <option value="private">私有</option>
          <option value="team">团队</option>
          <option value="public">公开</option>
        </select>
        <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
          <Filter size={13} />高级筛选
        </button>
      </div>

      {/* 数据表格 */}
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              {["数据名称", "数据类型", "接入状态", "数据量", "成功率", "权限", "版本", "协作成员", "操作"].map(h => (
                <th key={h} style={{ padding: "11px 14px", textAlign: "center", fontSize: 11, fontWeight: 600, color: "#64748b", letterSpacing: "0.02em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i < paginatedData.length - 1 ? "1px solid #f1f5f9" : "none", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                <td style={{ padding: "13px 14px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{d.name}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 3, flexWrap: "wrap" }}>
                    {d.tags?.slice(0, 2).map(tag => (
                      <span key={tag} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 3, background: "#eff6ff", color: "#2563eb" }}>#{tag}</span>
                    ))}
                    {d.md5_dedup && <Md5Badge active={true} />}
                  </div>
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <TypeBadge type={d.type} />
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <AccessStatusBadge status={d.access_status || "pending"} progress={d.access_progress} />
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center", fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{d.item_count.toLocaleString()}</td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <AccessRateBadge rate={d.access_rate} />
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}><PermissionBadge perm={d.permission || "private"} /></td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <button onClick={() => router.push(`/data-asset/data-access/detail/${d.id}`)} style={{ padding: "3px 9px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    v{d.versions[0].version.replace("v", "")} ({d.versions.length})
                  </button>
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
                    {(d.collaborators || []).slice(0, 3).map(c => (
                      <div key={c} title={c} style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg, #3b82f6, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", border: "2px solid #fff" }}>{c[0]}</div>
                    ))}
                    {(d.collaborators || []).length > 3 && (
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#64748b", border: "2px solid #fff" }}>+{d.collaborators!.length - 3}</div>
                    )}
                  </div>
                </td>
                <td style={{ padding: "13px 14px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                    <button onClick={() => router.push(`/data-asset/data-access/detail/${d.id}`)} title="详情" style={{ padding: 5, border: "none", background: "#f1f5f9", borderRadius: 5, cursor: "pointer" }}><Eye size={13} color="#64748b" /></button>
                    <button title="编辑" style={{ padding: 5, border: "none", background: "#eff6ff", borderRadius: 5, cursor: "pointer" }}><Pencil size={13} color="#2563eb" /></button>
                    <button title="分支" style={{ padding: 5, border: "none", background: "#ecfdf5", borderRadius: 5, cursor: "pointer" }}><GitBranch size={13} color="#10b981" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            共 <span style={{ fontWeight: 600, color: "#334155" }}>{totalCount}</span> 条数据，当前第 <span style={{ fontWeight: 600, color: "#334155" }}>{page}</span> / {totalPages} 页
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: page === 1 ? "not-allowed" : "pointer", color: page === 1 ? "#cbd5e1" : "#334155", opacity: page === 1 ? 0.5 : 1 }}>
              <ChevronLeft size={14} />上一页
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5) {
                  if (page > 3) {
                    p = page - 2 + i;
                    if (p > totalPages) p = totalPages - 4 + i;
                  }
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid", borderColor: page === p ? "#3b82f6" : "#e2e8f0", background: page === p ? "#3b82f6" : "#fff", color: page === p ? "#fff" : "#334155", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: page === totalPages ? "not-allowed" : "pointer", color: page === totalPages ? "#cbd5e1" : "#334155", opacity: page === totalPages ? 0.5 : 1 }}>
              下一页<ChevronRightPage size={14} />
            </button>
          </div>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>
            <Database size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
            <p style={{ fontSize: 14 }}>未找到匹配的数据</p>
          </div>
        )}
      </div>

    </main>
  );
}

export default function DataAccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: 20, color: "#94a3b8" }}>加载中...</div>}>
      <DatasetPageContent />
    </Suspense>
  );
}
