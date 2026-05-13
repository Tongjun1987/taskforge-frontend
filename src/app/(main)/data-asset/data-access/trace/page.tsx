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
  TrashIcon, PauseCircle, PlayCircle, FileText, XCircle, AlertOctagon,
  ArrowLeft, FileCode, DatabaseBackup, Sparkles, TestTube, Eye as EyeIcon,
  ArrowDown, Check, AlertBadge, Info, Sliders, Scissors, GitCombine,
  FileWarning, Save, ChevronUp, ChevronFirst, ChevronLast, FileSearch as FileSearchIcon,
  MapPin, Clock3, User as UserIcon, Hash, ArrowUpRight, ArrowDownRight,
  CircleDot, GitCommitHorizontal, MoreHorizontal, Package, Cpu, Layers as LayersIcon,
  HardDrive, FileCode2, Download as DownloadIcon, Printer, Share
} from "lucide-react";

// ==================== 类型定义 ====================
interface TraceRecord {
  id: string;
  data_name: string;
  data_type: string;
  data_id: string;
  source_task: string;
  source_type: string;
  creator: string;
  created_at: string;
  last_operator: string;
  last_operation: string;
  last_operation_time: string;
  status: "active" | "archived" | "deleted";
  flow_nodes: FlowNode[];
}

interface FlowNode {
  id: string;
  name: string;
  type: "source" | "collect" | "process" | "validate" | "store" | "access";
  operator: string;
  time: string;
  details: string;
}

interface OperationLog {
  id: string;
  operator: string;
  operation: string;
  time: string;
  ip: string;
  result: "success" | "failed";
  detail: string;
}

// ==================== Mock 数据 ====================
const MOCK_TRACE_RECORDS: TraceRecord[] = [
  {
    id: "TR001",
    data_name: "G15高速监控视频_20260421_0830",
    data_type: "video",
    data_id: "D001234567890",
    source_task: "AT001",
    source_type: "RTSP视频流",
    creator: "张伟",
    created_at: "2026-04-21 08:30:15",
    last_operator: "李娜",
    last_operation: "数据访问",
    last_operation_time: "2026-04-21 14:22:30",
    status: "active",
    flow_nodes: [
      { id: "N1", name: "RTSP数据源", type: "source", operator: "张伟", time: "2026-04-21 08:30:15", details: "G15高速K128+500监控点" },
      { id: "N2", name: "视频流采集", type: "collect", operator: "张伟", time: "2026-04-21 08:30:20", details: "采集帧率25fps，分辨率1920x1080" },
      { id: "N3", name: "H.264编码", type: "process", operator: "系统", time: "2026-04-21 08:31:00", details: "编码码率4Mbps，关键帧间隔2秒" },
      { id: "N4", name: "质量校验", type: "validate", operator: "系统", time: "2026-04-21 08:31:30", details: "质量评分98.5%，通过校验" },
      { id: "N5", name: "分布式存储", type: "store", operator: "系统", time: "2026-04-21 08:32:00", details: "存储路径:/data/video/g15/2026-04-21/" },
    ]
  },
  {
    id: "TR002",
    data_name: "城市路网卡口图像_20260420_1425",
    data_type: "image",
    data_id: "D001234567891",
    source_task: "AT003",
    source_type: "API多源接入",
    creator: "李娜",
    created_at: "2026-04-20 14:25:00",
    last_operator: "王强",
    last_operation: "数据下载",
    last_operation_time: "2026-04-21 09:15:45",
    status: "active",
    flow_nodes: [
      { id: "N1", name: "API数据源", type: "source", operator: "李娜", time: "2026-04-20 14:25:00", details: "杭州城市大脑卡口数据接口" },
      { id: "N2", name: "图像采集", type: "collect", operator: "李娜", time: "2026-04-20 14:25:10", details: "采集图像1200张" },
      { id: "N3", name: "图像处理", type: "process", operator: "系统", time: "2026-04-20 14:26:00", details: "分辨率标准化，格式转换JPEG" },
      { id: "N4", name: "质量校验", type: "validate", operator: "系统", time: "2026-04-20 14:26:30", details: "过滤模糊图像85张" },
      { id: "N5", name: "OSS存储", type: "store", operator: "系统", time: "2026-04-20 14:27:00", details: "存储至oss://dataplatform/images/" },
    ]
  },
  {
    id: "TR003",
    data_name: "浮动车GPS轨迹_20260419_0800",
    data_type: "timeseries",
    data_id: "D001234567892",
    source_task: "AT005",
    source_type: "Kafka实时流",
    creator: "王强",
    created_at: "2026-04-19 08:00:00",
    last_operator: "陈静",
    last_operation: "数据导出",
    last_operation_time: "2026-04-20 16:45:20",
    status: "active",
    flow_nodes: [
      { id: "N1", name: "Kafka数据源", type: "source", operator: "王强", time: "2026-04-19 08:00:00", details: "浮动车GPS Topic: vehicle_gps" },
      { id: "N2", name: "轨迹采集", type: "collect", operator: "王强", time: "2026-04-19 08:00:05", details: "实时消费速度5000条/秒" },
      { id: "N3", name: "坐标转换", type: "process", operator: "系统", time: "2026-04-19 08:00:30", details: "GCJ-02转WGS84坐标系" },
      { id: "N4", name: "轨迹校验", type: "validate", operator: "系统", time: "2026-04-19 08:01:00", details: "异常轨迹过滤3.2%" },
      { id: "N5", name: "时序存储", type: "store", operator: "系统", time: "2026-04-19 08:01:30", details: "存储至时序数据库TSDB" },
    ]
  },
  {
    id: "TR004",
    data_name: "交通事件数据库_20260418",
    data_type: "text",
    data_id: "D001234567893",
    source_task: "AT006",
    source_type: "MySQL CDC",
    creator: "陈静",
    created_at: "2026-04-18 10:00:00",
    last_operator: "刘洋",
    last_operation: "数据访问",
    last_operation_time: "2026-04-19 11:30:15",
    status: "active",
    flow_nodes: [
      { id: "N1", name: "MySQL数据源", type: "source", operator: "陈静", time: "2026-04-18 10:00:00", details: "交通事件表:t_traffic_incident" },
      { id: "N2", name: "CDC采集", type: "collect", operator: "陈静", time: "2026-04-18 10:00:10", details: "Binlog采集，增量同步" },
      { id: "N3", name: "格式转换", type: "process", operator: "系统", time: "2026-04-18 10:01:00", details: "转换为JSONL格式" },
      { id: "N4", name: "数据校验", type: "validate", operator: "系统", time: "2026-04-18 10:01:30", details: "校验通过率99.7%" },
      { id: "N5", name: "归档存储", type: "store", operator: "系统", time: "2026-04-18 10:02:00", details: "存储至数据湖DLF" },
    ]
  },
  {
    id: "TR005",
    data_name: "道路拓扑数据_v3.2",
    data_type: "knowledge",
    data_id: "D001234567894",
    source_task: "AT010",
    source_type: "平台内部数据",
    creator: "周涛",
    created_at: "2026-04-17 09:00:00",
    last_operator: "赵敏",
    last_operation: "版本更新",
    last_operation_time: "2026-04-18 14:20:00",
    status: "archived",
    flow_nodes: [
      { id: "N1", name: "内部数据源", type: "source", operator: "周涛", time: "2026-04-17 09:00:00", details: "道路拓扑基础数据库" },
      { id: "N2", name: "数据抽取", type: "collect", operator: "周涛", time: "2026-04-17 09:00:30", details: "抽取节点450,000个" },
      { id: "N3", name: "图谱构建", type: "process", operator: "系统", time: "2026-04-17 09:05:00", details: "构建道路拓扑关系" },
      { id: "N4", name: "一致性校验", type: "validate", operator: "系统", time: "2026-04-17 09:10:00", details: "拓扑一致性校验通过" },
      { id: "N5", name: "图数据库存储", type: "store", operator: "系统", time: "2026-04-17 09:15:00", details: "存储至Neo4j图数据库" },
    ]
  },
  {
    id: "TR006",
    data_name: "气象数据_20260416",
    data_type: "timeseries",
    data_id: "D001234567895",
    source_task: "AT008",
    source_type: "API + Kafka",
    creator: "孙磊",
    created_at: "2026-04-16 08:00:00",
    last_operator: "孙磊",
    last_operation: "数据采集",
    last_operation_time: "2026-04-16 20:00:00",
    status: "active",
    flow_nodes: [
      { id: "N1", name: "多源数据源", type: "source", operator: "孙磊", time: "2026-04-16 08:00:00", details: "气象API + Kafka气象流" },
      { id: "N2", name: "流式采集", type: "collect", operator: "孙磊", time: "2026-04-16 08:00:05", details: "采集频率1分钟/次" },
      { id: "N3", name: "数据融合", type: "process", operator: "系统", time: "2026-04-16 08:01:00", details: "多源数据时空对齐" },
      { id: "N4", name: "质量控制", type: "validate", operator: "系统", time: "2026-04-16 08:01:30", details: "质量评分99.2%" },
      { id: "N5", name: "时序存储", type: "store", operator: "系统", time: "2026-04-16 08:02:00", details: "存储至InfluxDB" },
    ]
  }
];

const MOCK_OPERATION_LOGS: OperationLog[] = [
  { id: "L001", operator: "李娜", operation: "数据访问", time: "2026-04-21 14:22:30", ip: "192.168.1.105", result: "success", detail: "访问视频数据，播放时长: 15分钟" },
  { id: "L002", operator: "系统", operation: "质量校验", time: "2026-04-21 08:31:30", ip: "127.0.0.1", result: "success", detail: "质量评分98.5%，校验通过" },
  { id: "L003", operator: "张伟", operation: "数据接入", time: "2026-04-21 08:30:15", ip: "192.168.1.102", result: "success", detail: "创建数据接入任务，来源:RTSP视频流" },
  { id: "L004", operator: "王强", operation: "数据下载", time: "2026-04-21 09:15:45", ip: "192.168.1.108", result: "success", detail: "下载图像数据1200张，格式:JPEG" },
  { id: "L005", operator: "陈静", operation: "数据导出", time: "2026-04-20 16:45:20", ip: "192.168.1.110", result: "success", detail: "导出轨迹数据2.4GB，格式:GeoJSON" },
];

const DATA_TYPES = [
  { value: "video", label: "视频", color: "#ec4899", icon: "🎬" },
  { value: "image", label: "图像", color: "#8b5cf6", icon: "🖼️" },
  { value: "text", label: "文本", color: "#3b82f6", icon: "📄" },
  { value: "audio", label: "音频", color: "#f59e0b", icon: "🎵" },
  { value: "timeseries", label: "时序数据", color: "#06b6d4", icon: "📊" },
  { value: "multimodal", label: "多模态", color: "#10b981", icon: "🔄" },
  { value: "knowledge", label: "知识图谱", color: "#14b8a6", icon: "🧠" },
];

const FLOW_NODE_CONFIG = {
  source: { label: "数据源", color: "#3b82f6", bg: "#dbeafe", icon: Database },
  collect: { label: "数据采集", color: "#8b5cf6", bg: "#ede9fe", icon: Activity },
  process: { label: "数据处理", color: "#10b981", bg: "#dcfce7", icon: Cpu },
  validate: { label: "质量校验", color: "#f59e0b", bg: "#fef9c3", icon: Shield },
  store: { label: "数据存储", color: "#ec4899", bg: "#fce7f3", icon: HardDrive },
  access: { label: "数据访问", color: "#64748b", bg: "#f1f5f9", icon: Eye },
};

// ==================== 辅助组件 ====================
function TypeBadge({ type }: { type: string }) {
  const config = DATA_TYPES.find(d => d.value === type) || { label: type, color: "#64748b", icon: "📦" };
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
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    active: { label: "活跃", color: "#10b981", bg: "#dcfce7" },
    archived: { label: "已归档", color: "#64748b", bg: "#f1f5f9" },
    deleted: { label: "已删除", color: "#dc2626", bg: "#fee2e2" },
  }[status] || { label: status, color: "#64748b", bg: "#f1f5f9" };
  
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
      {config.label}
    </span>
  );
}

// ==================== 主组件 ====================
export default function TracePage() {
  const router = useRouter();
  const [records, setRecords] = useState<TraceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<TraceRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "detail">("list");
  const [detailTab, setDetailTab] = useState<"flow" | "logs" | "info">("flow");
  
  // 筛选状态
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // 加载数据
  useEffect(() => {
    const stored = localStorage.getItem("taskforge_trace_records");
    if (stored) {
      setRecords(JSON.parse(stored));
    } else {
      setRecords(MOCK_TRACE_RECORDS);
      localStorage.setItem("taskforge_trace_records", JSON.stringify(MOCK_TRACE_RECORDS));
    }
  }, []);

  // 筛选后的记录
  const filteredRecords = records.filter(record => {
    if (searchText && !record.data_name.toLowerCase().includes(searchText.toLowerCase()) &&
        !record.data_id.toLowerCase().includes(searchText.toLowerCase()) &&
        !record.creator.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    if (typeFilter && record.data_type !== typeFilter) return false;
    if (statusFilter && record.status !== statusFilter) return false;
    return true;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // 打开详情
  const openDetail = (record: TraceRecord) => {
    setSelectedRecord(record);
    setShowDetail(true);
    setActiveTab("detail");
  };

  // 关闭详情
  const closeDetail = () => {
    setShowDetail(false);
    setActiveTab("list");
    setSelectedRecord(null);
  };

  // 导出报告
  const exportReport = () => {
    if (!selectedRecord) return;
    alert(`正在生成溯源报告...\n数据名称: ${selectedRecord.data_name}\n数据ID: ${selectedRecord.data_id}`);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* 页面标题区 */}
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Route size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据溯源</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>全链路追踪 · 操作记录 · 数据血缘 · 合规审计</p>
          </div>
        </div>
        <button
          onClick={() => alert("溯源查询功能")}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8,
            background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none",
            fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(139,92,246,0.3)"
          }}>
          <Search size={16} />溯源查询
        </button>
      </div>

      <div style={{ display: "flex" }}>
        {/* 主内容区 */}
        <div style={{ flex: 1, padding: 24 }}>
          {/* 列表视图 */}
          {activeTab === "list" && (
            <>
              {/* 统计卡片 - 数字在上，标签在下，自适应宽度 */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{records.length}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>条</span></div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>全部记录</div>
                </div>
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{records.filter(r => r.status === "active").length}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>条</span></div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>活跃数据</div>
                </div>
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#64748b" }}>{records.filter(r => r.status === "archived").length}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>条</span></div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>已归档</div>
                </div>
                <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>{new Set(records.map(r => r.source_task)).size}<span style={{ fontSize: 13, fontWeight: 400, color: "#94a3b8", marginLeft: 2 }}>个</span></div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>数据来源</div>
                </div>
              </div>

              {/* 操作栏 */}
              <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                    <input
                      type="text"
                      placeholder="搜索数据名称、ID、创建人..."
                      value={searchText}
                      onChange={e => setSearchText(e.target.value)}
                      style={{
                        padding: "8px 12px 8px 36px",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 14,
                        width: 280,
                        outline: "none",
                      }}
                    />
                  </div>
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
                  <button
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#64748b",
                    }}
                  >
                    <DownloadIcon size={16} />
                    批量导出
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
                          minWidth: 120,
                        }}
                      >
                        <option value="">全部</option>
                        {DATA_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 6 }}>状态</label>
                      <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        style={{
                          padding: "6px 12px",
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          fontSize: 13,
                          outline: "none",
                          cursor: "pointer",
                          minWidth: 100,
                        }}
                      >
                        <option value="">全部</option>
                        <option value="active">活跃</option>
                        <option value="archived">已归档</option>
                        <option value="deleted">已删除</option>
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
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据记录</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据类型</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>数据来源</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>创建人/时间</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>最近操作</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>状态</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: "#64748b" }}>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, idx) => (
                      <tr
                        key={record.id}
                        style={{
                          borderBottom: idx < filteredRecords.length - 1 ? "1px solid #f1f5f9" : "none",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                      >
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontWeight: 500, color: "#1e293b", marginBottom: 2 }}>{record.data_name}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>ID: {record.data_id}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <TypeBadge type={record.data_type} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, color: "#1e293b" }}>{record.source_task}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{record.source_type}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, color: "#1e293b" }}>{record.creator}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{record.created_at}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ fontSize: 13, color: "#1e293b" }}>{record.last_operator}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>{record.last_operation}</div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <StatusBadge status={record.status} />
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              onClick={() => openDetail(record)}
                              style={{ padding: "4px 8px", border: "none", background: "#f1f5f9", borderRadius: 6, cursor: "pointer", color: "#64748b" }}
                              title="查看详情"
                            >
                              <Route size={14} />
                            </button>
                            <button
                              onClick={exportReport}
                              style={{ padding: "4px 8px", border: "none", background: "#eff6ff", borderRadius: 6, cursor: "pointer", color: "#3b82f6" }}
                              title="导出报告"
                            >
                              <FileCode2 size={14} />
                            </button>
                            <button
                              style={{ padding: "4px 8px", border: "none", background: "#f1f5f9", borderRadius: 6, cursor: "pointer", color: "#64748b" }}
                              title="更多"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRecords.length === 0 && (
                  <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>
                    <Route size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                    <div style={{ fontSize: 14 }}>暂无溯源记录</div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 详情视图 */}
          {activeTab === "detail" && selectedRecord && (
            <>
              {/* 详情头部 */}
              <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <button
                    onClick={closeDetail}
                    style={{ padding: 6, border: "none", background: "#f1f5f9", borderRadius: 6, cursor: "pointer", color: "#64748b", marginBottom: 12 }}
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: "#1e293b" }}>{selectedRecord.data_name}</h2>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8", fontFamily: "monospace" }}>ID: {selectedRecord.data_id}</span>
                    <TypeBadge type={selectedRecord.data_type} />
                    <StatusBadge status={selectedRecord.status} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={exportReport}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #3b82f6",
                      background: "#eff6ff",
                      color: "#3b82f6",
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FileCode2 size={16} />
                    导出报告
                  </button>
                  <button
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #e2e8f0",
                      background: "white",
                      borderRadius: 8,
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      color: "#64748b",
                    }}
                  >
                    <Share size={16} />
                    分享
                  </button>
                </div>
              </div>

              {/* Tab切换 */}
              <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 24 }}>
                  {[
                    { key: "flow", label: "溯源链路", icon: Route },
                    { key: "logs", label: "操作记录", icon: Clock3 },
                    { key: "info", label: "详细信息", icon: FileSearchIcon },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setDetailTab(tab.key as any)}
                      style={{
                        padding: "12px 0",
                        background: "none",
                        border: "none",
                        borderBottom: `2px solid ${detailTab === tab.key ? "#3b82f6" : "transparent"}`,
                        color: detailTab === tab.key ? "#3b82f6" : "#64748b",
                        fontWeight: 600,
                        fontSize: 14,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab内容 */}
              {detailTab === "flow" && (
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 24 }}>数据溯源链路</h3>
                  
                  {/* 链路可视化 */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, position: "relative" }}>
                    {selectedRecord.flow_nodes.map((node, idx) => {
                      const config = FLOW_NODE_CONFIG[node.type];
                      const IconComponent = config.icon;
                      return (
                        <React.Fragment key={node.id}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
                            <div style={{
                              width: 56,
                              height: 56,
                              borderRadius: "50%",
                              background: config.bg,
                              border: `2px solid ${config.color}`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginBottom: 8,
                            }}>
                              <IconComponent size={24} color={config.color} />
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#1e293b", textAlign: "center" }}>{config.label}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", maxWidth: 80 }}>{node.time.split(" ")[1]}</div>
                          </div>
                          {idx < selectedRecord.flow_nodes.length - 1 && (
                            <div style={{
                              flex: 1,
                              height: 2,
                              background: "linear-gradient(90deg, #e2e8f0 0%, #3b82f6 50%, #e2e8f0 100%)",
                              margin: "0 -8px",
                              marginBottom: 32,
                            }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* 节点详情 */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
                    {selectedRecord.flow_nodes.map((node) => {
                      const config = FLOW_NODE_CONFIG[node.type];
                      const IconComponent = config.icon;
                      return (
                        <div
                          key={node.id}
                          style={{
                            padding: 16,
                            background: config.bg,
                            borderRadius: 12,
                            border: `1px solid ${config.color}30`,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <IconComponent size={16} color={config.color} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: config.color }}>{config.label}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "#1e293b", marginBottom: 4 }}>{node.name}</div>
                          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{node.details}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>
                            {node.operator} · {node.time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {detailTab === "logs" && (
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#1e293b" }}>操作记录</h3>
                    <button
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #e2e8f0",
                        background: "white",
                        borderRadius: 6,
                        fontSize: 13,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        color: "#64748b",
                      }}
                    >
                      <DownloadIcon size={14} />
                      导出
                    </button>
                  </div>
                  <div style={{ maxHeight: 400, overflow: "auto" }}>
                    {MOCK_OPERATION_LOGS.map((log, idx) => (
                      <div
                        key={log.id}
                        style={{
                          padding: "16px 20px",
                          borderBottom: idx < MOCK_OPERATION_LOGS.length - 1 ? "1px solid #f1f5f9" : "none",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: log.result === "success" ? "#10b981" : "#dc2626",
                          marginTop: 6,
                          flexShrink: 0,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{log.operation}</span>
                            <span style={{ fontSize: 12, color: "#94a3b8" }}>{log.time}</span>
                          </div>
                          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{log.detail}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8" }}>
                            操作人: {log.operator} · IP: {log.ip}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === "info" && (
                <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 24 }}>详细信息</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 12 }}>基础信息</div>
                      <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>数据名称</span>
                          <span style={{ color: "#1e293b" }}>{selectedRecord.data_name}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>数据ID</span>
                          <span style={{ color: "#1e293b", fontFamily: "monospace" }}>{selectedRecord.data_id}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>数据类型</span>
                          <TypeBadge type={selectedRecord.data_type} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>当前状态</span>
                          <StatusBadge status={selectedRecord.status} />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 12 }}>来源信息</div>
                      <div style={{ background: "#f8fafc", padding: 16, borderRadius: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>来源任务</span>
                          <span style={{ color: "#1e293b" }}>{selectedRecord.source_task}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>来源类型</span>
                          <span style={{ color: "#1e293b" }}>{selectedRecord.source_type}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                          <span style={{ color: "#94a3b8" }}>创建人</span>
                          <span style={{ color: "#1e293b" }}>{selectedRecord.creator}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
