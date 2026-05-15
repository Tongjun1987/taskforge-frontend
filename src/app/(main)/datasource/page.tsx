"use client";
import { useState, useEffect, Suspense } from "react";
import { 
  Database, Upload, Cloud, Server, GitBranch, 
  CheckCircle2, XCircle, Clock, Search, Filter,
  Plus, MoreHorizontal, RefreshCw, ArrowUpDown,
  FileText, Image, Video, Box, FileJson, Layers,
  Globe
} from "lucide-react";
import Link from "next/link";

type DataType = "structured" | "semi-structured" | "unstructured" | "multi-modal";
type SourceType = "local" | "oss" | "api" | "stream";
type Status = "running" | "completed" | "failed" | "pending";

interface DataSource {
  id: string;
  name: string;
  type: DataType;
  source: SourceType;
  size: string;
  count: number;
  status: Status;
  progress: number;
  lastRun: string;
  createdAt: string;
}

const DATA_TYPE_CONFIG: Record<DataType, { label: string; icon: any; color: string }> = {
  "structured": { label: "结构化数据", icon: Database, color: "#3b82f6" },
  "semi-structured": { label: "半结构化数据", icon: FileJson, color: "#8b5cf6" },
  "unstructured": { label: "非结构化数据", icon: FileText, color: "#f59e0b" },
  "multi-modal": { label: "多模态数据", icon: Layers, color: "#10b981" },
};

const SOURCE_TYPE_CONFIG: Record<SourceType, { label: string; icon: any }> = {
  "local": { label: "本地上传", icon: Upload },
  "oss": { label: "对象存储", icon: Cloud },
  "api": { label: "API接入", icon: Globe },
  "stream": { label: "流式采集", icon: GitBranch },
};

const MOCK_SOURCES: DataSource[] = [
  { id: "ds-001", name: "MySQL生产库-订单表", type: "structured", source: "api", size: "2.4GB", count: 1250000, status: "running", progress: 68, lastRun: "2026-04-17 14:30", createdAt: "2026-03-15" },
  { id: "ds-002", name: "MongoDB日志集合", type: "semi-structured", source: "stream", size: "8.7GB", count: 4560000, status: "running", progress: 45, lastRun: "2026-04-17 14:25", createdAt: "2026-03-18" },
  { id: "ds-003", name: "交通监控视频流", type: "unstructured", source: "stream", size: "128GB", count: 2400, status: "completed", progress: 100, lastRun: "2026-04-17 10:00", createdAt: "2026-03-20" },
  { id: "ds-004", name: "产品评论JSON", type: "semi-structured", source: "oss", size: "1.2GB", count: 890000, status: "completed", progress: 100, lastRun: "2026-04-16 22:00", createdAt: "2026-03-22" },
  { id: "ds-005", name: "图像训练数据集", type: "unstructured", source: "local", size: "45GB", count: 125000, status: "completed", progress: 100, lastRun: "2026-04-15 18:00", createdAt: "2026-04-01" },
  { id: "ds-006", name: "客服对话语料", type: "multi-modal", source: "api", size: "3.8GB", count: 560000, status: "failed", progress: 78, lastRun: "2026-04-17 09:15", createdAt: "2026-04-05" },
  { id: "ds-007", name: "点云标注数据", type: "multi-modal", source: "oss", size: "67GB", count: 8500, status: "pending", progress: 0, lastRun: "-", createdAt: "2026-04-10" },
  { id: "ds-008", name: "PostgreSQL用户画像", type: "structured", source: "api", size: "890MB", count: 450000, status: "completed", progress: 100, lastRun: "2026-04-17 08:00", createdAt: "2026-04-12" },
];

function StatusBadge({ status }: { status: Status }) {
  const config = {
    running: { bg: "#eff6ff", color: "#2563eb", icon: RefreshCw, text: "采集中" },
    completed: { bg: "#ecfdf5", color: "#059669", icon: CheckCircle2, text: "已完成" },
    failed: { bg: "#fef2f2", color: "#dc2626", icon: XCircle, text: "失败" },
    pending: { bg: "#fef3c7", color: "#d97706", icon: Clock, text: "待执行" },
  }[status];
  const Icon = config.icon;
  return (
    <span style={{ 
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 8px", borderRadius: 12, fontSize: 11, fontWeight: 500,
      background: config.bg, color: config.color 
    }}>
      <Icon size={10} style={{ animation: status === "running" ? "spin 1s linear infinite" : "none" }} />
      {config.text}
    </span>
  );
}

function DataSourceCard({ source }: { source: DataSource }) {
  const typeConfig = DATA_TYPE_CONFIG[source.type];
  const sourceConfig = SOURCE_TYPE_CONFIG[source.source];
  const TypeIcon = typeConfig.icon;
  const SourceIcon = sourceConfig.icon;

  return (
    <div style={{
      background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
      padding: 20, transition: "all 0.2s",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
    }}>
      {/* 头部 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ 
            width: 40, height: 40, borderRadius: 10, 
            background: typeConfig.color + "18", display: "flex", 
            alignItems: "center", justifyContent: "center" 
          }}>
            <TypeIcon size={18} color={typeConfig.color} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>
              {source.name}
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {source.id}</div>
          </div>
        </div>
        <StatusBadge status={source.status} />
      </div>

      {/* 标签 */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        <span style={{ 
          padding: "3px 8px", borderRadius: 6, fontSize: 11, 
          background: "#f1f5f9", color: "#64748b" 
        }}>
          <TypeIcon size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />
          {typeConfig.label}
        </span>
        <span style={{ 
          padding: "3px 8px", borderRadius: 6, fontSize: 11, 
          background: "#f1f5f9", color: "#64748b" 
        }}>
          <SourceIcon size={10} style={{ marginRight: 4, verticalAlign: "middle" }} />
          {sourceConfig.label}
        </span>
      </div>

      {/* 进度条 */}
      {source.status === "running" && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>采集进度</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#2563eb" }}>{source.progress}%</span>
          </div>
          <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ 
              width: source.progress + "%", height: "100%", 
              background: "linear-gradient(90deg, #3b82f6, #2563eb)",
              borderRadius: 3, transition: "width 0.3s"
            }} />
          </div>
        </div>
      )}

      {/* 统计 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>数据规模</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{source.size}</div>
        </div>
        <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>数据条数</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{source.count.toLocaleString()}</div>
        </div>
      </div>

      {/* 底部 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "#94a3b8" }}>
        <span>最近运行: {source.lastRun}</span>
        <button style={{
          padding: "4px 10px", borderRadius: 6, border: "none",
          background: "#f1f5f9", color: "#64748b", cursor: "pointer", fontSize: 11
        }}>
          查看日志
        </button>
      </div>
    </div>
  );
}

function DataSourceContent() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DataType | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<SourceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");

  useEffect(() => {
    // 模拟加载
    setSources(MOCK_SOURCES);
  }, []);

  const filtered = sources.filter(s => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && s.type !== typeFilter) return false;
    if (sourceFilter !== "all" && s.source !== sourceFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: sources.length,
    running: sources.filter(s => s.status === "running").length,
    completed: sources.filter(s => s.status === "completed").length,
    failed: sources.filter(s => s.status === "failed").length,
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "20px 24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 页面标题 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据接入</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0 0" }}>
            多类型数据采集任务管理，支持本地上传、对象存储、API等多种方式接入
          </p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 16px", borderRadius: 10, border: "none",
          background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
          color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 2px 8px rgba(139, 92, 246, 0.35)",
        }}>
          <Plus size={16} />
          新建接入任务
        </button>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "数据源总数", value: stats.total, icon: Database, color: "#3b82f6", bg: "#eff6ff" },
          { label: "采集中", value: stats.running, icon: RefreshCw, color: "#2563eb", bg: "#dbeafe" },
          { label: "已完成", value: stats.completed, icon: CheckCircle2, color: "#10b981", bg: "#ecfdf5" },
          { label: "失败", value: stats.failed, icon: XCircle, color: "#ef4444", bg: "#fef2f2" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{
              background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
              padding: 16, display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ 
                width: 44, height: 44, borderRadius: 12, 
                background: stat.bg, display: "flex", 
                alignItems: "center", justifyContent: "center" 
              }}>
                <Icon size={20} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 功能说明卡片 */}
      <div style={{ 
        background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
        borderRadius: 12, padding: 20, marginBottom: 20, color: "#fff" 
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>数据接入能力</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Database size={14} />
            <span>结构化/半结构化/非结构化/多模态数据</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Cloud size={14} />
            <span>本地上传、对象存储、API、流式采集</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <RefreshCw size={14} />
            <span>实时采集、进度可视化、分布式执行</span>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div style={{ 
        background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", 
        padding: 16, marginBottom: 16, display: "flex", gap: 12, alignItems: "center" 
      }}>
        {/* 搜索 */}
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="搜索数据源名称..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", height: 36, paddingLeft: 36, paddingRight: 12,
              borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13,
              outline: "none", boxSizing: "border-box"
            }}
          />
        </div>

        {/* 数据类型筛选 */}
        <select 
          value={typeFilter} 
          onChange={e => setTypeFilter(e.target.value as DataType | "all")}
          style={{ height: 36, padding: "0 28px 0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer", appearance: "none", background: "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\") no-repeat right 10px center" }}
        >
          <option value="all">全类型</option>
          {Object.entries(DATA_TYPE_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        {/* 接入方式筛选 */}
        <select 
          value={sourceFilter} 
          onChange={e => setSourceFilter(e.target.value as SourceType | "all")}
          style={{ height: 36, padding: "0 28px 0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer", appearance: "none", background: "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\") no-repeat right 10px center" }}
        >
          <option value="all">全方式</option>
          {Object.entries(SOURCE_TYPE_CONFIG).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>

        {/* 状态筛选 */}
        <select 
          value={statusFilter} 
          onChange={e => setStatusFilter(e.target.value as Status | "all")}
          style={{ height: 36, padding: "0 28px 0 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13, cursor: "pointer", appearance: "none", background: "white url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2394a3b8' d='M2 4l4 4 4-4'/%3E%3C/svg%3E\") no-repeat right 10px center" }}
        >
          <option value="all">全状态</option>
          <option value="running">采集中</option>
          <option value="completed">已完成</option>
          <option value="failed">失败</option>
          <option value="pending">待执行</option>
        </select>
      </div>

      {/* 数据源列表 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "#94a3b8" }}>
            <Database size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
            <p>暂无数据源</p>
          </div>
        ) : (
          filtered.map(source => <DataSourceCard key={source.id} source={source} />)
        )}
      </div>
    </main>
  );
}

export default function DatasourcePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>加载中...</div>}>
      <DataSourceContent />
    </Suspense>
  );
}
