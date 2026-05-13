"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Database, Pencil, Trash2, Eye, Upload, X, CheckCircle2,
  AlertCircle, Clock, FileUp, Cloud, Globe, Server, Layers,
  GitBranch, History, RotateCcw, Download, Share2, Users, Lock,
  Tag, Filter, BarChart3, Compare, RefreshCw, Shield,
  ChevronDown, FolderTree, FileCheck, ArrowUpDown, AlertTriangle,
  GitMerge, EyeOff, UserCheck, KeyRound, Target, ChevronLeft, ChevronRight as ChevronRightPage,
  Wifi, HardDriveDownload, CloudDownload, Database as DatabaseIcon, Server as ServerIcon,
  Activity, Loader2, Play, Pause, Square, FileSearch, Route, Settings2,
  CheckSquare, Square as SquareIcon, Trash, RotateCw, ChevronRight, ListFilter,
  Calendar, User, FolderOpen, ExternalLink, RefreshCw as RefreshCwIcon,
  Link2, Merge, Gauge, ClipboardList, Settings, ArrowRight, Copy,
  TrashIcon, PauseCircle, PlayCircle, FileText, XCircle, AlertOctagon
} from "lucide-react";

// ==================== 类型定义 ====================
interface ConvergenceTask {
  id: string;
  name: string;
  type: string;
  data_source: string;
  source_tasks: string[];  // 关联的采集任务
  item_count: number;
  qualified_count: number;
  qualified_rate: number;
  created_at: string;
  creator: string;
  status: "running" | "completed" | "failed" | "stopped" | "pending";
  progress: number;
  rule_name: string;
  rule_config?: {
    format_convert: boolean;
    field_mapping: boolean;
    deduplication: boolean;
    quality_threshold: number;
  };
  last_run_time?: string;
  error_message?: string;
}

interface ConvergenceRule {
  id: string;
  name: string;
  description: string;
  data_type: string;
  source_types: string[];
  config: {
    format_convert: string;
    field_mapping: string[];
    deduplication: string;
    quality_threshold: number;
  };
  created_at: string;
  creator: string;
  usage_count: number;
  template: boolean;
}

// ==================== Mock 数据 ====================
const MOCK_CONVERGENCE_TASKS: ConvergenceTask[] = [
  {
    id: "CT001",
    name: "G15高速视频流汇聚",
    type: "video",
    data_source: "RTSP多路流",
    source_tasks: ["AT001", "AT002"],
    item_count: 3850000,
    qualified_count: 3748250,
    qualified_rate: 97.4,
    created_at: "2026-04-20 14:30",
    creator: "张伟",
    status: "running",
    progress: 68,
    rule_name: "视频流标准化汇聚",
    rule_config: { format_convert: true, field_mapping: true, deduplication: true, quality_threshold: 95 },
    last_run_time: "2026-04-21 10:25"
  },
  {
    id: "CT002",
    name: "城市路网卡口数据汇聚",
    type: "image",
    data_source: "API多源接入",
    source_tasks: ["AT003", "AT004"],
    item_count: 980000,
    qualified_count: 971220,
    qualified_rate: 99.1,
    created_at: "2026-04-19 09:15",
    creator: "李娜",
    status: "completed",
    progress: 100,
    rule_name: "图像数据质量过滤",
    rule_config: { format_convert: true, field_mapping: false, deduplication: true, quality_threshold: 95 },
    last_run_time: "2026-04-20 18:30"
  },
  {
    id: "CT003",
    name: "浮动车GPS轨迹汇聚",
    type: "timeseries",
    data_source: "Kafka实时流",
    source_tasks: ["AT005"],
    item_count: 24000000,
    qualified_count: 23712000,
    qualified_rate: 98.8,
    created_at: "2026-04-18 16:45",
    creator: "王强",
    status: "running",
    progress: 82,
    rule_name: "时序数据归一化汇聚",
    rule_config: { format_convert: true, field_mapping: true, deduplication: false, quality_threshold: 90 },
    last_run_time: "2026-04-21 09:40"
  },
  {
    id: "CT004",
    name: "交通事件数据库汇聚",
    type: "text",
    data_source: "MySQL CDC",
    source_tasks: ["AT006"],
    item_count: 7200,
    qualified_count: 7100,
    qualified_rate: 98.6,
    created_at: "2026-04-17 11:20",
    creator: "陈静",
    status: "completed",
    progress: 100,
    rule_name: "结构化数据整合",
    rule_config: { format_convert: true, field_mapping: true, deduplication: true, quality_threshold: 95 },
    last_run_time: "2026-04-18 14:15"
  },
  {
    id: "CT005",
    name: "事故案例视频汇聚",
    type: "video",
    data_source: "OSS批量",
    source_tasks: ["AT007"],
    item_count: 9800,
    qualified_count: 9526,
    qualified_rate: 97.2,
    created_at: "2026-04-16 08:00",
    creator: "刘洋",
    status: "failed",
    progress: 45,
    rule_name: "视频质量检测汇聚",
    rule_config: { format_convert: true, field_mapping: false, deduplication: true, quality_threshold: 98 },
    last_run_time: "2026-04-17 10:30",
    error_message: "部分视频文件损坏，无法完成解码"
  },
  {
    id: "CT006",
    name: "多源传感器数据汇聚",
    type: "multimodal",
    data_source: "多协议混合",
    source_tasks: ["AT001", "AT003", "AT005"],
    item_count: 15600000,
    qualified_count: 15132000,
    qualified_rate: 97.0,
    created_at: "2026-04-15 13:30",
    creator: "赵敏",
    status: "stopped",
    progress: 55,
    rule_name: "多模态数据融合",
    rule_config: { format_convert: true, field_mapping: true, deduplication: true, quality_threshold: 92 },
    last_run_time: "2026-04-16 20:00"
  },
  {
    id: "CT007",
    name: "气象数据实时汇聚",
    type: "timeseries",
    data_source: "API + Kafka",
    source_tasks: ["AT008", "AT009"],
    item_count: 8900000,
    qualified_count: 8832600,
    qualified_rate: 99.2,
    created_at: "2026-04-14 10:00",
    creator: "孙磊",
    status: "pending",
    progress: 0,
    rule_name: "气象数据标准化",
    rule_config: { format_convert: true, field_mapping: true, deduplication: false, quality_threshold: 95 },
    last_run_time: "-"
  },
  {
    id: "CT008",
    name: "道路拓扑数据汇聚",
    type: "knowledge",
    data_source: "平台内部数据",
    source_tasks: ["AT010"],
    item_count: 450000,
    qualified_count: 445500,
    qualified_rate: 99.0,
    created_at: "2026-04-13 15:20",
    creator: "周涛",
    status: "completed",
    progress: 100,
    rule_name: "知识图谱构建汇聚",
    rule_config: { format_convert: false, field_mapping: true, deduplication: true, quality_threshold: 95 },
    last_run_time: "2026-04-14 12:00"
  }
];

const MOCK_RULES: ConvergenceRule[] = [
  {
    id: "CR001",
    name: "视频流标准化汇聚",
    description: "将多路RTSP视频流统一转换为H.264编码，提取关键帧并进行质量评估",
    data_type: "video",
    source_types: ["rtsp", "oss", "local"],
    config: { format_convert: "H.264/AVC", field_mapping: ["timestamp", "location", "camera_id"], deduplication: "MD5", quality_threshold: 95 },
    created_at: "2026-04-10",
    creator: "张伟",
    usage_count: 3,
    template: true
  },
  {
    id: "CR002",
    name: "图像数据质量过滤",
    description: "对卡口图像进行分辨率、完整性、清晰度过滤，去除模糊和重复图像",
    data_type: "image",
    source_types: ["api", "oss"],
    config: { format_convert: "JPEG", field_mapping: ["plate", "timestamp", "location"], deduplication: " perceptual_hash", quality_threshold: 95 },
    created_at: "2026-04-08",
    creator: "李娜",
    usage_count: 5,
    template: true
  },
  {
    id: "CR003",
    name: "时序数据归一化汇聚",
    description: "对GPS轨迹进行时间对齐、坐标转换、速度计算等预处理",
    data_type: "timeseries",
    source_types: ["kafka", "api"],
    config: { format_convert: "GeoJSON", field_mapping: ["lng", "lat", "speed", "heading", "timestamp"], deduplication: "none", quality_threshold: 90 },
    created_at: "2026-04-05",
    creator: "王强",
    usage_count: 2,
    template: true
  },
  {
    id: "CR004",
    name: "结构化数据整合",
    description: "整合MySQL多表数据，进行字段映射、数据类型转换、空值填充",
    data_type: "text",
    source_types: ["mysql_cdc"],
    config: { format_convert: "JSONL", field_mapping: ["event_id", "event_type", "severity", "location", "time"], deduplication: "primary_key", quality_threshold: 95 },
    created_at: "2026-04-03",
    creator: "陈静",
    usage_count: 4,
    template: true
  }
];

const DATA_TYPES = [
  { value: "image", label: "图像", color: "#8b5cf6" },
  { value: "video", label: "视频", color: "#ec4899" },
  { value: "text", label: "文本", color: "#3b82f6" },
  { value: "audio", label: "音频", color: "#f59e0b" },
  { value: "timeseries", label: "时序数据", color: "#06b6d4" },
  { value: "multimodal", label: "多模态", color: "#10b981" },
  { value: "knowledge", label: "知识图谱", color: "#14b8a6" },
];

const STATUS_CONFIG = {
  running: { label: "运行中", color: "#1d4ed8", bg: "#dbeafe" },
  completed: { label: "已完成", color: "#15803d", bg: "#dcfce7" },
  failed: { label: "执行失败", color: "#dc2626", bg: "#fee2e2" },
  stopped: { label: "已终止", color: "#64748b", bg: "#f1f5f9" },
  pending: { label: "待执行", color: "#ca8a04", bg: "#fef9c3" },
};

// ==================== 辅助组件 ====================
function StatusBadge({ status }: { status: ConvergenceTask["status"] }) {
  const config = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 500,
      color: config.color,
      background: config.bg,
    }}>
      {status === "running" && <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />}
      {config.label}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config = DATA_TYPES.find(d => d.value === type) || { label: type, color: "#64748b" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 500,
      color: config.color,
      background: `${config.color}15`,
    }}>
      {config.label}
    </span>
  );
}

function ProgressBar({ value, color = "#3b82f6" }: { value: number; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        flex: 1,
        height: 6,
        background: "#e2e8f0",
        borderRadius: 3,
        overflow: "hidden",
      }}>
        <div style={{
          width: `${value}%`,
          height: "100%",
          background: color,
          borderRadius: 3,
          transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{ fontSize: 12, color: "#64748b", minWidth: 36 }}>{value}%</span>
    </div>
  );
}

function QualityBadge({ rate }: { rate: number }) {
  const color = rate >= 98 ? "#10b981" : rate >= 95 ? "#f59e0b" : "#dc2626";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: "2px 8px",
      borderRadius: 12,
      fontSize: 12,
      fontWeight: 600,
      color,
      background: `${color}15`,
    }}>
      <Gauge size={12} />
      {rate}%
    </span>
  );
}

// ==================== 主组件 ====================
export default function ConvergencePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ConvergenceTask[]>([]);
  const [rules] = useState<ConvergenceRule[]>(MOCK_RULES);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ConvergenceTask | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "rules">("tasks");
  
  // 筛选状态
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 加载数据
  useEffect(() => {
    const stored = localStorage.getItem("taskforge_convergence_tasks");
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      setTasks(MOCK_CONVERGENCE_TASKS);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(MOCK_CONVERGENCE_TASKS));
    }
  }, []);

  // 筛选后的任务
  const filteredTasks = tasks.filter(task => {
    if (searchText && !task.name.toLowerCase().includes(searchText.toLowerCase()) && 
        !task.id.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (statusFilter && task.status !== statusFilter) return false;
    if (typeFilter && task.type !== typeFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // 状态统计
  const statusStats = [
    { key: "all", label: "全部", value: tasks.length, color: "#64748b" },
    { key: "running", label: "运行中", value: tasks.filter(t => t.status === "running").length, color: "#1d4ed8" },
    { key: "completed", label: "已完成", value: tasks.filter(t => t.status === "completed").length, color: "#15803d" },
    { key: "failed", label: "执行失败", value: tasks.filter(t => t.status === "failed").length, color: "#dc2626" },
    { key: "stopped", label: "已终止", value: tasks.filter(t => t.status === "stopped").length, color: "#64748b" },
    { key: "pending", label: "待执行", value: tasks.filter(t => t.status === "pending").length, color: "#ca8a04" },
  ];

  // 批量选择
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTasks.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTasks.map(t => t.id)));
    }
  };

  // 批量操作
  const handleBatchAction = (action: string) => {
    const count = selectedIds.size;
    if (count === 0) return;
    
    if (action === "delete") {
      if (!confirm(`确认删除选中的 ${count} 个汇聚任务？`)) return;
      const newTasks = tasks.filter(t => !selectedIds.has(t.id));
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    } else if (action === "stop") {
      const newTasks = tasks.map(t => 
        selectedIds.has(t.id) && t.status === "running" 
          ? { ...t, status: "stopped" as const, progress: t.progress }
          : t
      );
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    } else if (action === "restart") {
      const newTasks = tasks.map(t => 
        selectedIds.has(t.id) && (t.status === "stopped" || t.status === "failed")
          ? { ...t, status: "running" as const }
          : t
      );
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    }
    
    setSelectedIds(new Set());
  };

  // 单个操作
  const handleAction = (action: string, task: ConvergenceTask) => {
    if (action === "detail") {
      setSelectedTask(task);
      setShowDetailDialog(true);
    } else if (action === "rule") {
      setShowRuleDialog(true);
    } else if (action === "delete") {
      if (!confirm(`确认删除汇聚任务「${task.name}」？`)) return;
      const newTasks = tasks.filter(t => t.id !== task.id);
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    } else if (action === "stop") {
      const newTasks = tasks.map(t => 
        t.id === task.id ? { ...t, status: "stopped" as const } : t
      );
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    } else if (action === "restart") {
      const newTasks = tasks.map(t => 
        t.id === task.id ? { ...t, status: "running" as const, error_message: undefined } : t
      );
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    } else if (action === "retry") {
      const newTasks = tasks.map(t => 
        t.id === task.id ? { ...t, status: "running" as const, error_message: undefined } : t
      );
      setTasks(newTasks);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(newTasks));
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* 页面标题区 */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #10b981, #059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Layers size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据汇聚</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>多源数据整合 · 格式转换 · 质量过滤 · 标准化输出</p>
          </div>
        </div>
        <button
          onClick={() => router.push("/data-asset/data-access/convergence/create")}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8,
            background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(16,185,129,0.3)"
          }}>
          <Plus size={16} />新建汇聚任务
        </button>
      </div>

      {/* 顶部统计卡片 - 数字在上，标签在下，自适应宽度 */}
      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
          {statusStats.map(stat => (
            <div
              key={stat.key}
              onClick={() => setStatusFilter(stat.key === "all" ? "" : stat.key)}
              style={{
                background: "white",
                border: `1px solid ${statusFilter === stat.key || (stat.key === "all" && !statusFilter) ? stat.color : "#e2e8f0"}`,
                borderRadius: 10,
                padding: 16,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>
                {stat.value}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>个</span>
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab切换 */}
      <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", gap: 24 }}>
          <button
            onClick={() => setActiveTab("tasks")}
            style={{
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${activeTab === "tasks" ? "#3b82f6" : "transparent"}`,
              color: activeTab === "tasks" ? "#3b82f6" : "#64748b",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <ClipboardList size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            汇聚任务 ({filteredTasks.length})
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            style={{
              padding: "12px 0",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${activeTab === "rules" ? "#3b82f6" : "transparent"}`,
              color: activeTab === "rules" ? "#3b82f6" : "#64748b",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Settings size={16} style={{ marginRight: 6, verticalAlign: "middle" }} />
            汇聚规则 ({rules.length})
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ padding: 24 }}>
        {activeTab === "tasks" ? (
          <>
            {/* 操作栏 */}
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {/* 搜索框 */}
                <div style={{ position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="搜索任务名称、ID..."
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    style={{
                      padding: "8px 12px 8px 36px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14,
                      width: 220,
                      outline: "none",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.target.style.borderColor = "#3b82f6"}
                    onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                  />
                </div>
                {/* 筛选按钮 */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    padding: "8px 12px",
                    border: `1px solid ${showFilters ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: 8,
                    background: showFilters ? "#eff6ff" : "white",
                    color: showFilters ? "#3b82f6" : "#64748b",
                    fontSize: 14,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ListFilter size={16} />
                  筛选
                </button>
              </div>
              
              <div style={{ display: "flex", gap: 8 }}>
                {/* 批量操作 */}
                {selectedIds.size > 0 && (
                  <div style={{ display: "flex", gap: 8, padding: "4px 12px", background: "#eff6ff", borderRadius: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#3b82f6", fontWeight: 500 }}>
                      已选择 {selectedIds.size} 项
                    </span>
                    <button
                      onClick={() => handleBatchAction("stop")}
                      style={{ padding: "4px 8px", border: "none", background: "#3b82f6", color: "white", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                    >
                      <PauseCircle size={14} style={{ marginRight: 4 }} /> 批量终止
                    </button>
                    <button
                      onClick={() => handleBatchAction("restart")}
                      style={{ padding: "4px 8px", border: "none", background: "#10b981", color: "white", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                    >
                      <PlayCircle size={14} style={{ marginRight: 4 }} /> 批量重启
                    </button>
                    <button
                      onClick={() => handleBatchAction("delete")}
                      style={{ padding: "4px 8px", border: "none", background: "#dc2626", color: "white", borderRadius: 6, fontSize: 12, cursor: "pointer" }}
                    >
                      <Trash2 size={14} style={{ marginRight: 4 }} /> 批量删除
                    </button>
                  </div>
                )}
                {/* 新建按钮 */}
                <button
                  onClick={() => router.push("/data-asset/data-access/convergence/create")}
                  style={{
                    padding: "8px 16px",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Plus size={16} />
                  新建汇聚任务
                </button>
              </div>
            </div>

            {/* 高级筛选 */}
            {showFilters && (
              <div style={{ padding: 16, background: "white", borderRadius: 12, marginBottom: 16, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>数据类型</label>
                    <select
                      value={typeFilter}
                      onChange={e => setTypeFilter(e.target.value)}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: 13,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">全部</option>
                      {DATA_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>数据来源</label>
                    <select
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: 13,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">全部</option>
                      <option value="rtsp">RTSP多路流</option>
                      <option value="api">API多源接入</option>
                      <option value="kafka">Kafka实时流</option>
                      <option value="mysql">MySQL CDC</option>
                      <option value="oss">OSS批量</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>创建人</label>
                    <select
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: 13,
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="">全部</option>
                      <option value="zhangwei">张伟</option>
                      <option value="lina">李娜</option>
                      <option value="wangqiang">王强</option>
                      <option value="chenjing">陈静</option>
                      <option value="liuyang">刘洋</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>创建时间</label>
                    <input
                      type="date"
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        fontSize: 13,
                        outline: "none",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                    <button
                      onClick={() => { setStatusFilter(""); setTypeFilter(""); setSearchText(""); }}
                      style={{ padding: "6px 12px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
                    >
                      重置筛选
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 表格 */}
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredTasks.length && filteredTasks.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: "pointer", width: 16, height: 16 }}
                      />
                    </th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>汇聚任务</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据类型</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据来源</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>关联采集任务</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据量</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>合格率</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>汇聚规则</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>进度</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>状态</th>
                    <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, idx) => (
                    <tr
                      key={task.id}
                      style={{ 
                        borderBottom: idx < filteredTasks.length - 1 ? "1px solid #f1f5f9" : "none",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(task.id)}
                          onChange={() => toggleSelect(task.id)}
                          style={{ cursor: "pointer", width: 16, height: 16 }}
                        />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 500, color: "#1e293b", marginBottom: 2 }}>{task.name}</div>
                        <div style={{ fontSize: 12, color: "#94a3b8" }}>ID: {task.id}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <TypeBadge type={task.type} />
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>{task.data_source}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {task.source_tasks.map(st => (
                            <span key={st} style={{
                              padding: "2px 6px",
                              background: "#f1f5f9",
                              borderRadius: 4,
                              fontSize: 11,
                              color: "#64748b",
                              fontFamily: "monospace",
                            }}>
                              {st}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 500 }}>
                          {task.item_count.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          合格: {task.qualified_count.toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <QualityBadge rate={task.qualified_rate} />
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#64748b" }}>
                        <button
                          onClick={() => handleAction("rule", task)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#3b82f6",
                            cursor: "pointer",
                            fontSize: 13,
                            padding: 0,
                          }}
                        >
                          {task.rule_name}
                        </button>
                      </td>
                      <td style={{ padding: "12px 16px", minWidth: 120 }}>
                        <ProgressBar value={task.progress} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge status={task.status} />
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={() => handleAction("detail", task)}
                            style={{ padding: "4px 8px", border: "none", background: "#f1f5f9", borderRadius: 6, cursor: "pointer", color: "#64748b" }}
                            title="查看详情"
                          >
                            <Eye size={14} />
                          </button>
                          {task.status === "running" && (
                            <button
                              onClick={() => handleAction("stop", task)}
                              style={{ padding: "4px 8px", border: "none", background: "#fef9c3", borderRadius: 6, cursor: "pointer", color: "#ca8a04" }}
                              title="终止"
                            >
                              <PauseCircle size={14} />
                            </button>
                          )}
                          {(task.status === "stopped" || task.status === "failed") && (
                            <button
                              onClick={() => handleAction("restart", task)}
                              style={{ padding: "4px 8px", border: "none", background: "#dcfce7", borderRadius: 6, cursor: "pointer", color: "#15803d" }}
                              title="重启"
                            >
                              <PlayCircle size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleAction("delete", task)}
                            style={{ padding: "4px 8px", border: "none", background: "#fee2e2", borderRadius: 6, cursor: "pointer", color: "#dc2626" }}
                            title="删除"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTasks.length === 0 && (
                <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                  <Database size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                  <div style={{ fontSize: 14 }}>暂无汇聚任务</div>
                  <button
                    onClick={() => router.push("/data-asset/data-access/convergence/create")}
                    style={{
                      marginTop: 16,
                      padding: "8px 16px",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    新建汇聚任务
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* 汇聚规则 Tab */
          <>
            <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ position: "relative" }}>
                  <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                  <input
                    type="text"
                    placeholder="搜索规则名称..."
                    style={{
                      padding: "8px 12px 8px 36px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      fontSize: 14,
                      width: 200,
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <button
                style={{
                  padding: "8px 16px",
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={16} />
                新建汇聚规则
              </button>
            </div>

            {/* 规则卡片 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
              {rules.map(rule => (
                <div
                  key={rule.id}
                  style={{
                    background: "white",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    padding: 20,
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.1)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>{rule.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>ID: {rule.id}</div>
                    </div>
                    {rule.template && (
                      <span style={{
                        padding: "2px 8px",
                        background: "#eff6ff",
                        color: "#3b82f6",
                        borderRadius: 12,
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                        模板
                      </span>
                    )}
                  </div>
                  
                  <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16, lineHeight: 1.5 }}>
                    {rule.description}
                  </p>
                  
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {rule.source_types.map(st => (
                      <span key={st} style={{
                        padding: "2px 8px",
                        background: "#f1f5f9",
                        borderRadius: 4,
                        fontSize: 11,
                        color: "#64748b",
                      }}>
                        {st}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      已使用 {rule.usage_count} 次 · 创建人: {rule.creator}
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button style={{ padding: "4px 8px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", color: "#64748b" }} title="复制">
                        <Copy size={14} />
                      </button>
                      <button style={{ padding: "4px 8px", border: "1px solid #e2e8f0", background: "white", borderRadius: 6, cursor: "pointer", color: "#64748b" }} title="编辑">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 任务详情弹窗 */}
      {showDetailDialog && selectedTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowDetailDialog(false); }}
        >
          <div style={{
            background: "white",
            borderRadius: 16,
            width: 720,
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            {/* 弹窗头部 */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1e293b" }}>{selectedTask.name}</h3>
                <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>汇聚任务详情 · {selectedTask.id}</div>
              </div>
              <button
                onClick={() => setShowDetailDialog(false)}
                style={{ padding: 8, border: "none", background: "#f1f5f9", borderRadius: 8, cursor: "pointer", color: "#64748b" }}
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 弹窗内容 */}
            <div style={{ padding: 24 }}>
              {/* 状态概览 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>任务状态</div>
                  <StatusBadge status={selectedTask.status} />
                </div>
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>汇聚进度</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#3b82f6" }}>{selectedTask.progress}%</div>
                </div>
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>数据总量</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>{selectedTask.item_count.toLocaleString()}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>数据合格率</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981" }}>{selectedTask.qualified_rate}%</div>
                </div>
              </div>

              {/* 详细信息 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>基本信息</div>
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>数据类型</span>
                      <TypeBadge type={selectedTask.type} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>数据来源</span>
                      <span style={{ color: "#1e293b" }}>{selectedTask.data_source}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>创建人</span>
                      <span style={{ color: "#1e293b" }}>{selectedTask.creator}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>创建时间</span>
                      <span style={{ color: "#1e293b" }}>{selectedTask.created_at}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>数据统计</div>
                  <div style={{ background: "#f8fafc", padding: 12, borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>合格数据量</span>
                      <span style={{ color: "#10b981", fontWeight: 500 }}>{selectedTask.qualified_count.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>不合格数据量</span>
                      <span style={{ color: "#dc2626", fontWeight: 500 }}>{(selectedTask.item_count - selectedTask.qualified_count).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>关联采集任务</span>
                      <span style={{ color: "#1e293b" }}>{selectedTask.source_tasks.length} 个</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: "#94a3b8" }}>最近运行</span>
                      <span style={{ color: "#1e293b" }}>{selectedTask.last_run_time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 规则配置 */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>汇聚规则</div>
                <div style={{ background: "#f8fafc", padding: 16, borderRadius: 8 }}>
                  <div style={{ fontWeight: 500, color: "#1e293b", marginBottom: 12 }}>{selectedTask.rule_name}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {selectedTask.rule_config?.format_convert ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#94a3b8" />
                      )}
                      <span style={{ fontSize: 13, color: selectedTask.rule_config?.format_convert ? "#10b981" : "#94a3b8" }}>格式转换</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {selectedTask.rule_config?.field_mapping ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#94a3b8" />
                      )}
                      <span style={{ fontSize: 13, color: selectedTask.rule_config?.field_mapping ? "#10b981" : "#94a3b8" }}>字段映射</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {selectedTask.rule_config?.deduplication ? (
                        <CheckCircle2 size={16} color="#10b981" />
                      ) : (
                        <XCircle size={16} color="#94a3b8" />
                      )}
                      <span style={{ fontSize: 13, color: selectedTask.rule_config?.deduplication ? "#10b981" : "#94a3b8" }}>去重处理</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Gauge size={16} color="#3b82f6" />
                      <span style={{ fontSize: 13, color: "#3b82f6" }}>阈值 {selectedTask.rule_config?.quality_threshold}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 错误信息 */}
              {selectedTask.error_message && (
                <div style={{ padding: 12, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <AlertOctagon size={16} color="#dc2626" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: "#dc2626" }}>执行失败</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#991b1b" }}>{selectedTask.error_message}</div>
                </div>
              )}
            </div>

            {/* 弹窗底部 */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                onClick={() => setShowDetailDialog(false)}
                style={{ padding: "8px 16px", border: "1px solid #e2e8f0", background: "white", borderRadius: 8, cursor: "pointer" }}
              >
                关闭
              </button>
              {selectedTask.status === "running" && (
                <button
                  onClick={() => { handleAction("stop", selectedTask); setShowDetailDialog(false); }}
                  style={{ padding: "8px 16px", border: "none", background: "#f59e0b", color: "white", borderRadius: 8, cursor: "pointer" }}
                >
                  终止任务
                </button>
              )}
              {(selectedTask.status === "stopped" || selectedTask.status === "failed") && (
                <button
                  onClick={() => { handleAction("restart", selectedTask); setShowDetailDialog(false); }}
                  style={{ padding: "8px 16px", border: "none", background: "#10b981", color: "white", borderRadius: 8, cursor: "pointer" }}
                >
                  重启任务
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 样式 */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
