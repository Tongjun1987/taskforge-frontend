"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Target, ArrowLeft, Eye, Pencil, Trash2, Play, Pause, Square, RotateCw,
  CheckCircle2, AlertCircle, Clock, Loader2, Database, Server, HardDrive,
  Activity, Wifi, GitBranch, History, FileText, Settings2, Route, BarChart3,
  Download, Share2, X, ChevronRight, ChevronLeft, RefreshCw, AlertTriangle,
  FileSearch, Calendar, User, HardDriveDownload, Shield, EyeOff
} from "lucide-react";

interface AccessTask {
  id: string;
  name: string;
  type: string;
  source_type: string;
  source_name: string;
  item_count: number;
  quality_status: string;
  task_name: string;
  project_name?: string;
  access_protocol?: string;
  access_status?: string;
  access_progress?: number;
  access_rate?: number;
  source_url?: string;
  real_time_stream?: boolean;
  collection_mode?: string;
  error_message?: string;
  creator: string;
  created_at: string;
  last_run_time?: string;
  tags?: string[];
  permission?: string;
  md5_dedup?: boolean;
  collaborators?: string[];
}

const ACCESS_STATUS: Record<string, { label: string; bg: string; color: string }> = {
  accessing: { label: "运行中", bg: "#dbeafe", color: "#1d4ed8" },
  completed: { label: "已完成", bg: "#dcfce7", color: "#15803d" },
  failed: { label: "执行失败", bg: "#fee2e2", color: "#dc2626" },
  pending: { label: "待执行", bg: "#fef9c3", color: "#ca8a04" },
  paused: { label: "已暂停", bg: "#f3e8ff", color: "#7c3aed" },
  stopped: { label: "已终止", bg: "#f1f5f9", color: "#64748b" },
};

const DATA_TYPES: Record<string, { label: string; color: string }> = {
  image: { label: "图像", color: "#8b5cf6" },
  text: { label: "文本", color: "#3b82f6" },
  video: { label: "视频", color: "#ec4899" },
  audio: { label: "音频", color: "#f59e0b" },
  multimodal: { label: "多模态", color: "#10b981" },
  conversation: { label: "对话数据", color: "#6366f1" },
  timeseries: { label: "时序数据", color: "#06b6d4" },
};

// Mock 日志数据
const MOCK_LOGS = [
  { time: "14:30:25", level: "info", message: "任务已启动，开始采集数据" },
  { time: "14:30:26", level: "info", message: "连接数据源成功" },
  { time: "14:30:30", level: "info", message: "开始获取数据批次 1/10" },
  { time: "14:30:45", level: "info", message: "批次 1 完成，获取 1000 条记录" },
  { time: "14:30:50", level: "info", message: "开始获取数据批次 2/10" },
  { time: "14:31:05", level: "warning", message: "检测到 5 条重复数据，已自动过滤" },
  { time: "14:31:10", level: "info", message: "批次 2 完成，获取 995 条记录" },
  { time: "14:31:15", level: "info", message: "开始获取数据批次 3/10" },
];

// Mock 监控数据
const generateMonitorData = () => {
  const data = [];
  for (let i = 0; i < 24; i++) {
    data.push({
      time: `${i.toString().padStart(2, "0")}:00`,
      count: Math.floor(Math.random() * 5000) + 1000,
      rate: 95 + Math.random() * 5,
    });
  }
  return data;
};

export default function TaskDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [task, setTask] = useState<AccessTask | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [monitorData] = useState(generateMonitorData());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem("taskforge_access_tasks") || "[]");
    const found = tasks.find((t: AccessTask) => t.id === id);
    if (found) {
      setTask(found);
    } else {
      setTask({
        id: id,
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
        collection_mode: "stream",
        item_count: 3850000,
        quality_status: "pending",
        task_name: "交通目标检测",
        project_name: "智慧交通项目",
        creator: "王强",
        created_at: "2026-05-12",
        last_run_time: "2026-05-12 14:30:00",
        tags: ["视频流", "实时", "RTSP", "高速公路"],
        permission: "team",
        md5_dedup: false,
        collaborators: ["王强", "李明"],
      });
    }
  }, [id]);

  const handleAction = (action: string) => {
    if (!task) return;

    const actions: Record<string, () => void> = {
      start: () => {
        setTask({ ...task, access_status: "accessing" });
        updateTaskStatus("accessing");
      },
      pause: () => {
        setTask({ ...task, access_status: "paused" });
        updateTaskStatus("paused");
      },
      stop: () => {
        setTask({ ...task, access_status: "stopped" });
        updateTaskStatus("stopped");
      },
      restart: () => {
        setTask({ ...task, access_status: "pending", access_progress: 0 });
        updateTaskStatus("pending");
      },
    };

    if (action === "delete") {
      setShowDeleteConfirm(true);
      return;
    }

    if (actions[action]) {
      actions[action]();
    }
  };

  const updateTaskStatus = (status: string) => {
    const tasks = JSON.parse(localStorage.getItem("taskforge_access_tasks") || "[]");
    const updated = tasks.map((t: AccessTask) => t.id === id ? { ...t, access_status: status } : t);
    localStorage.setItem("taskforge_access_tasks", JSON.stringify(updated));
  };

  const confirmDelete = () => {
    const tasks = JSON.parse(localStorage.getItem("taskforge_access_tasks") || "[]");
    const filtered = tasks.filter((t: AccessTask) => t.id !== id);
    localStorage.setItem("taskforge_access_tasks", JSON.stringify(filtered));
    router.push("/data-asset/data-access");
  };

  if (!task) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite" }} />
        <p style={{ marginTop: 12 }}>加载中...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const statusInfo = ACCESS_STATUS[task.access_status || "pending"];
  const maxValue = Math.max(...monitorData.map(d => d.count));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => router.push("/data-asset/data-access")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#334155", fontSize: 13 }}>
              <ArrowLeft size={16} />返回列表
            </button>
            <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
            <Target size={24} color="#3b82f6" />
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h1 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>{task.name}</h1>
                <span style={{ padding: "2px 10px", borderRadius: 4, background: statusInfo.bg, color: statusInfo.color, fontSize: 12, fontWeight: 600 }}>
                  {statusInfo.label}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>
                任务ID：{task.id} · 创建时间：{task.created_at}
              </p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: "flex", gap: 8 }}>
            {task.access_status === "accessing" && (
              <>
                <button onClick={() => handleAction("pause")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #f59e0b", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#f59e0b", fontSize: 13 }}>
                  <Pause size={16} />暂停
                </button>
                <button onClick={() => handleAction("stop")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #dc2626", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>
                  <Square size={16} />终止
                </button>
              </>
            )}
            {task.access_status === "paused" && (
              <>
                <button onClick={() => handleAction("start")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #10b981", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#10b981", fontSize: 13 }}>
                  <Play size={16} />继续
                </button>
                <button onClick={() => handleAction("stop")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #dc2626", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>
                  <Square size={16} />终止
                </button>
              </>
            )}
            {(task.access_status === "failed" || task.access_status === "stopped") && (
              <button onClick={() => handleAction("restart")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #10b981", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#10b981", fontSize: 13 }}>
                <RotateCw size={16} />重新执行
              </button>
            )}
            <button onClick={() => router.push(`/data-asset/data-access/edit/${task.id}`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #3b82f6", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#3b82f6", fontSize: 13 }}>
              <Pencil size={16} />编辑
            </button>
            <button onClick={() => handleAction("delete")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #dc2626", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>
              <Trash2 size={16} />删除
            </button>
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 28px" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "overview", label: "任务概览", icon: Database },
            { key: "monitor", label: "执行监控", icon: Activity },
            { key: "versions", label: "数据版本", icon: History },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "12px 16px",
                  border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  background: "transparent",
                  color: activeTab === tab.key ? "#3b82f6" : "#64748b",
                  borderBottom: `2px solid ${activeTab === tab.key ? "#3b82f6" : "transparent"}`,
                  transition: "all 0.2s",
                }}
              >
                <Icon size={16} />{tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 内容 */}
      <div style={{ padding: "24px 28px" }}>
        {/* 任务概览 */}
        {activeTab === "overview" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* 基础信息 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Database size={18} color="#3b82f6" />基础信息
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "任务名称", value: task.name },
                  { label: "数据类型", value: DATA_TYPES[task.type]?.label || task.type },
                  { label: "采集模式", value: task.collection_mode === "stream" ? "流式实时采集" : "批量离线采集" },
                  { label: "关联任务", value: task.task_name || "—" },
                  { label: "所属项目", value: task.project_name || "—" },
                  { label: "创建人", value: task.creator },
                  { label: "创建时间", value: task.created_at },
                  { label: "数据权限", value: task.permission === "private" ? "私有" : task.permission === "team" ? "团队" : "公开" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              {task.tags && task.tags.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 8 }}>数据标签</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {task.tags.map(tag => (
                      <span key={tag} style={{ padding: "4px 10px", borderRadius: 4, background: "#eff6ff", color: "#2563eb", fontSize: 12 }}>#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 运行状态 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={18} color="#3b82f6" />运行状态
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "当前状态", value: statusInfo.label, color: statusInfo.color },
                  { label: "接入进度", value: `${task.access_progress || 0}%`, color: "#3b82f6" },
                  { label: "已采集数据量", value: task.item_count.toLocaleString(), color: "#10b981" },
                  { label: "接入成功率", value: `${task.access_rate || 0}%`, color: task.access_rate && task.access_rate >= 99 ? "#10b981" : "#f59e0b" },
                  { label: "开始时间", value: task.last_run_time || "—", color: "#64748b" },
                  { label: "实时数据流", value: task.real_time_stream ? "是" : "否", color: "#64748b" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{item.value}</div>
                  </div>
                ))}
              </div>

              {task.access_status === "failed" && task.error_message && (
                <div style={{ marginTop: 16, padding: 12, background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <AlertTriangle size={16} color="#dc2626" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#dc2626" }}>执行失败</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#991b1b", margin: 0, lineHeight: 1.6 }}>{task.error_message}</p>
                </div>
              )}
            </div>

            {/* 数据源信息 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <Server size={18} color="#3b82f6" />数据源信息
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "数据源类型", value: task.source_name },
                  { label: "接入协议", value: task.access_protocol || "—" },
                  { label: "数据源地址", value: task.source_url || "—", span: true },
                ].map(item => (
                  <div key={item.label} style={item.span ? { gridColumn: "span 2" } : {}}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#334155", wordBreak: "break-all" }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 存储信息 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <HardDrive size={18} color="#3b82f6" />存储信息
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { label: "存储位置", value: "平台默认分布式存储" },
                  { label: "存储路径", value: "/data/access/2026/05/12" },
                  { label: "存储格式", value: "Parquet" },
                  { label: "总存储大小", value: "128.5 GB" },
                  { label: "文件数量", value: "1,284" },
                  { label: "副本数量", value: "3 个" },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{item.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>存储空间使用</h4>
                <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: "45%", height: "100%", background: "linear-gradient(90deg, #10b981, #34d399)", borderRadius: 4 }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#64748b" }}>
                  <span>已使用：128.5 GB</span>
                  <span>剩余：156.3 GB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 执行监控 */}
        {activeTab === "monitor" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
            {/* 监控图表区域 */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={18} color="#3b82f6" />采集监控
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "当前采集速率", value: "2,350", unit: "条/秒", color: "#3b82f6" },
                  { label: "今日累计", value: task.item_count.toLocaleString(), unit: "条", color: "#10b981" },
                  { label: "成功率", value: `${task.access_rate || 0}`, unit: "%", color: "#8b5cf6" },
                  { label: "预计完成", value: "剩余约 12 分钟", unit: "", color: "#f59e0b" },
                ].map(metric => (
                  <div key={metric.label} style={{ background: "#f8fafc", borderRadius: 10, padding: 16, border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{metric.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: metric.color }}>
                      {metric.value}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 4 }}>{metric.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>24小时采集趋势</h4>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 120 }}>
                  {monitorData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{
                        width: "100%",
                        height: `${(d.count / maxValue) * 100}px`,
                        background: "linear-gradient(180deg, #3b82f6, #6366f1)",
                        borderRadius: "4px 4px 0 0",
                        minHeight: 4,
                      }} />
                      <span style={{ fontSize: 9, color: "#94a3b8" }}>{d.time.split(":")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 12 }}>采集节点状态</h4>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {[
                    { name: "主节点", status: "running", detail: "CPU: 45% | 内存: 62%" },
                    { name: "数据处理节点-1", status: "running", detail: "CPU: 78% | 内存: 85%" },
                    { name: "数据存储节点", status: "running", detail: "磁盘: 156GB/512GB" },
                  ].map(node => (
                    <div key={node.name} style={{ padding: 12, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>{node.name}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{node.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 执行日志区域（合并） */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={18} color="#3b82f6" />执行日志
                </h3>
                <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 12, color: "#64748b" }}>
                  <Download size={14} />导出日志
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {["全部", "信息", "警告", "错误"].map(level => (
                  <button key={level} style={{
                    padding: "4px 12px", borderRadius: 4, border: "1px solid",
                    borderColor: level === "全部" ? "#3b82f6" : "#e2e8f0",
                    background: level === "全部" ? "#eff6ff" : "#fff",
                    color: level === "全部" ? "#3b82f6" : "#64748b",
                    fontSize: 12, cursor: "pointer",
                  }}>
                    {level}
                  </button>
                ))}
              </div>

              <div style={{ background: "#0f172a", borderRadius: 8, padding: 16, maxHeight: 300, overflowY: "auto" }}>
                {MOCK_LOGS.map((log, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 8, fontSize: 12, fontFamily: "monospace" }}>
                    <span style={{ color: "#64748b", whiteSpace: "nowrap" }}>{log.time}</span>
                    <span style={{
                      padding: "0 6px", borderRadius: 3,
                      background: log.level === "info" ? "#1e40af" : log.level === "warning" ? "#b45309" : "#991b1b",
                      color: "#fff",
                    }}>{log.level.toUpperCase()}</span>
                    <span style={{ color: "#e2e8f0" }}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 数据版本 */}
        {activeTab === "versions" && (
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <History size={18} color="#3b82f6" />数据版本管理
              </h3>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #3b82f6", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, color: "#3b82f6" }}>
                <Activity size={14} />创建版本快照
              </button>
            </div>

            {/* 版本说明 */}
            <div style={{ padding: 16, background: "#f0f9ff", borderRadius: 10, border: "1px solid #e0f2fe", marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: "#0369a1", lineHeight: 1.8 }}>
                <strong>版本说明：</strong>数据从采集到使用会经历多个阶段，每个阶段都会生成对应的数据版本。
                静态数据（如图片、文档）按文件快照管理版本；动态数据（如视频流、传感器数据）按时间窗口快照管理版本。
              </div>
            </div>

            {/* 版本列表 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 采集版本 */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#3b82f6" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>采集阶段</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>共 3 个版本</span>
                </div>
                <div style={{ padding: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>版本号</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>时间范围</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>数据量</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>存储大小</th>
                        <th style={{ textAlign: "center", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>v1.3 <span style={{ fontSize: 10, color: "#10b981", background: "#dcfce7", padding: "2px 6px", borderRadius: 3, marginLeft: 6 }}>当前</span></td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>2026-05-16 14:00 ~ 现在</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>3,850,000 条</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>128.5 GB</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#dbeafe", color: "#1d4ed8", fontSize: 11 }}>采集中</span></td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>v1.2</td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>2026-05-15 00:00 ~ 14:00</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>4,210,000 条</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>142.3 GB</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#15803d", fontSize: 11 }}>已完成</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>v1.1</td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>2026-05-14 00:00 ~ 24:00</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>3,980,000 条</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>135.1 GB</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#15803d", fontSize: 11 }}>已完成</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 汇聚版本（新增） */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>汇聚阶段</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>基于采集版本，汇聚多个数据源</span>
                </div>
                <div style={{ padding: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>版本号</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>来源版本</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>汇聚数据量</th>
                        <th style={{ textAlign: "center", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>数据源数</th>
                        <th style={{ textAlign: "center", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>hj-v1.0 <span style={{ fontSize: 10, color: "#10b981", background: "#dcfce7", padding: "2px 6px", borderRadius: 3, marginLeft: 6 }}>当前</span></td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>v1.2 + 其他采集任务</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>8,520,000 条</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "center" }}>3 个</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#15803d", fontSize: 11 }}>已完成</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 清洗版本 */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>清洗阶段</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>共 2 个版本</span>
                </div>
                <div style={{ padding: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>版本号</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>来源版本</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>清洗后数据量</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>过滤率</th>
                        <th style={{ textAlign: "center", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>cl-v1.2 <span style={{ fontSize: 10, color: "#10b981", background: "#dcfce7", padding: "2px 6px", borderRadius: 3, marginLeft: 6 }}>当前</span></td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>基于 hj-v1.0</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>8,196,000 条</td>
                        <td style={{ padding: "10px 0", color: "#10b981", textAlign: "right" }}>↓ 3.8%</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#15803d", fontSize: 11 }}>已完成</span></td>
                      </tr>
                      <tr>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>cl-v1.1</td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>基于 v1.1</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>3,820,000 条</td>
                        <td style={{ padding: "10px 0", color: "#10b981", textAlign: "right" }}>↓ 4.0%</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#dcfce7", color: "#15803d", fontSize: 11 }}>已完成</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 标注版本 */}
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#8b5cf6" }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>标注阶段</span>
                  <span style={{ fontSize: 11, color: "#64748b", marginLeft: "auto" }}>共 1 个版本</span>
                </div>
                <div style={{ padding: 16 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>版本号</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>来源版本</th>
                        <th style={{ textAlign: "left", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>标注类型</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>已标注</th>
                        <th style={{ textAlign: "right", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>标注进度</th>
                        <th style={{ textAlign: "center", padding: "8px 0", color: "#94a3b8", fontWeight: 500 }}>状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: "10px 0", color: "#334155", fontWeight: 500 }}>bz-v1.0</td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>基于 cl-v1.2</td>
                        <td style={{ padding: "10px 0", color: "#64748b" }}>目标检测 - 车辆</td>
                        <td style={{ padding: "10px 0", color: "#64748b", textAlign: "right" }}>1,250,000 条</td>
                        <td style={{ padding: "10px 0", color: "#3b82f6", textAlign: "right" }}>32.5%</td>
                        <td style={{ padding: "10px 0", textAlign: "center" }}><span style={{ padding: "2px 8px", borderRadius: 4, background: "#fef9c3", color: "#ca8a04", fontSize: 11 }}>标注中</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 400, boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle size={24} color="#dc2626" />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", margin: 0 }}>确认删除</h3>
                <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>此操作不可恢复</p>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6, marginBottom: 24 }}>
              确定要删除数据接入任务「{task.name}」吗？删除后将无法恢复，关联数据也将一并清除。
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", color: "#334155" }}>
                取消
              </button>
              <button onClick={confirmDelete} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#dc2626", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff" }}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
