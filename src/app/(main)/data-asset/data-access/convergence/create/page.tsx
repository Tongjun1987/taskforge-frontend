"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Search, Database, Pencil, Trash2, Eye, Upload, X, CheckCircle2,
  AlertCircle, Clock, FileUp, Cloud, Globe, Server, Layers,
  GitBranch, History, RotateCcw, Download, Share2, Users, Lock,
  Tag, Filter, BarChart3, GitCompare, RefreshCw, Shield,
  ChevronDown, FolderTree, FileCheck, ArrowUpDown, AlertTriangle,
  GitMerge, EyeOff, UserCheck, KeyRound, Target, ChevronLeft, ChevronRight as ChevronRightPage,
  Wifi, HardDriveDownload, CloudDownload, Database as DatabaseIcon, Server as ServerIcon,
  Activity, Loader2, Play, Pause, Square, FileSearch, Route, Settings2,
  CheckSquare, Square as SquareIcon, Trash, RotateCw, ChevronRight, ListFilter,
  Calendar, User, FolderOpen, ExternalLink, RefreshCw as RefreshCwIcon,
  Link2, Merge, Gauge, ClipboardList, Settings, ArrowRight, Copy,
  TrashIcon, PauseCircle, PlayCircle, FileText, XCircle, AlertOctagon,
  ArrowLeft, FileCode, DatabaseBackup, Sparkles, TestTube, Eye as EyeIcon,
  ArrowDown, Check, AlertCircle, Info, Sliders, Scissors, GitMerge,
  FileWarning, Save, ChevronUp, ChevronFirst, ChevronLast
} from "lucide-react";

// ==================== 步骤指示器 ====================
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: i < current ? "#10b981" : i === current ? "#3b82f6" : "#e2e8f0",
              color: i <= current ? "#fff" : "#94a3b8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: 14,
              transition: "all 0.3s",
            }}>
              {i < current ? <Check size={18} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: i === current ? 600 : 400, color: i === current ? "#3b82f6" : "#64748b" }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 80,
              height: 2,
              background: i < current ? "#10b981" : "#e2e8f0",
              margin: "0 12px",
              marginBottom: 24,
              transition: "background 0.3s",
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ==================== 步骤1：选择数据源 ====================
function Step1DataSource({ data, onChange }: { data: any; onChange: (key: string, value: any) => void }) {
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  
  // 模拟已接入的采集任务
  const accessTasks = [
    { id: "AT001", name: "G15高速视频流", type: "video", count: 3850000, status: "running" },
    { id: "AT002", name: "城市路网卡口图像", type: "image", count: 980000, status: "completed" },
    { id: "AT003", name: "浮动车GPS轨迹", type: "timeseries", count: 24000000, status: "running" },
    { id: "AT004", name: "交通事件数据库", type: "text", count: 7200, status: "completed" },
    { id: "AT005", name: "道路传感器数据", type: "timeseries", count: 15600000, status: "running" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>选择数据源</h3>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
        选择需要汇聚的采集任务数据源，支持多选
      </p>

      {/* 已选数据源 */}
      {data.sourceTasks?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 12 }}>
            已选择的数据源 ({data.sourceTasks.length})
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {data.sourceTasks.map((id: string) => {
              const task = accessTasks.find(t => t.id === id);
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: 8,
                  }}
                >
                  <Database size={14} color="#3b82f6" />
                  <span style={{ fontSize: 13, color: "#1e293b" }}>{task?.name || id}</span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>({task?.count?.toLocaleString() || "-"} 条)</span>
                  <button
                    onClick={() => {
                      const newSources = data.sourceTasks.filter((s: string) => s !== id);
                      onChange("sourceTasks", newSources);
                    }}
                    style={{ padding: 2, border: "none", background: "none", cursor: "pointer", color: "#64748b" }}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 选择器 */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => setShowSourceSelector(!showSourceSelector)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "2px dashed #cbd5e1",
            borderRadius: 12,
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            color: "#64748b",
            fontSize: 14,
            transition: "all 0.2s",
          }}
        >
          <Plus size={18} />
          添加数据源
        </button>

        {showSourceSelector && (
          <div style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 8,
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            zIndex: 10,
            maxHeight: 320,
            overflow: "auto",
          }}>
            {accessTasks
              .filter(t => !data.sourceTasks?.includes(t.id))
              .map(task => (
                <div
                  key={task.id}
                  onClick={() => {
                    const newSources = [...(data.sourceTasks || []), task.id];
                    onChange("sourceTasks", newSources);
                    setShowSourceSelector(false);
                  }}
                  style={{
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f8fafc"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Database size={16} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: 14, color: "#1e293b", fontWeight: 500 }}>{task.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>ID: {task.id} · {task.type} · {task.count.toLocaleString()} 条</div>
                    </div>
                  </div>
                  <div style={{
                    padding: "2px 8px",
                    background: task.status === "running" ? "#dbeafe" : "#dcfce7",
                    color: task.status === "running" ? "#1d4ed8" : "#15803d",
                    borderRadius: 12,
                    fontSize: 11,
                  }}>
                    {task.status === "running" ? "采集中" : "已完成"}
                  </div>
                </div>
              ))}
            {accessTasks.filter(t => !data.sourceTasks?.includes(t.id)).length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                暂无可选数据源
              </div>
            )}
          </div>
        )}
      </div>

      {/* 汇聚配置 */}
      <div style={{ marginTop: 32 }}>
        <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>汇聚基础配置</h4>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 6 }}>
              汇聚任务名称 <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              value={data.name || ""}
              onChange={e => onChange("name", e.target.value)}
              placeholder="请输入汇聚任务名称"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 6 }}>
              目标数据类型 <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              value={data.targetType || ""}
              onChange={e => onChange("targetType", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                cursor: "pointer",
              }}
            >
              <option value="">选择数据类型</option>
              <option value="video">视频</option>
              <option value="image">图像</option>
              <option value="text">文本</option>
              <option value="timeseries">时序数据</option>
              <option value="multimodal">多模态</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 6 }}>
            描述说明
          </label>
          <textarea
            value={data.description || ""}
            onChange={e => onChange("description", e.target.value)}
            placeholder="请输入汇聚任务描述..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              outline: "none",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ==================== 步骤2：数据转换与归一化 ====================
function Step2Transform({ data, onChange }: { data: any; onChange: (key: string, value: any) => void }) {
  const formatOptions = [
    { value: "parquet", label: "Parquet", desc: "列式存储，适合分析场景" },
    { value: "csv", label: "CSV", desc: "通用格式，兼容性最好" },
    { value: "json", label: "JSON", desc: "适合半结构化数据" },
    { value: "jsonl", label: "JSONL", desc: "流式JSON，适合大数据" },
    { value: "h264", label: "H.264", desc: "视频编码格式" },
    { value: "jpeg", label: "JPEG", desc: "图像压缩格式" },
    { value: "geojson", label: "GeoJSON", desc: "地理信息专用格式" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>数据格式转换与归一化</h3>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
        配置数据格式转换规则和字段归一化处理
      </p>

      {/* 格式转换 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <FileCode size={16} color="#3b82f6" />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>格式转换</h4>
        </div>

        <div
          onClick={() => onChange("enableFormatConvert", !data.enableFormatConvert)}
          style={{
            padding: 16,
            background: data.enableFormatConvert ? "#eff6ff" : "#f8fafc",
            border: `1px solid ${data.enableFormatConvert ? "#3b82f6" : "#e2e8f0"}`,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", marginBottom: 4 }}>启用格式转换</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>将数据统一转换为平台标准格式</div>
          </div>
          <div style={{
            width: 48,
            height: 24,
            borderRadius: 12,
            background: data.enableFormatConvert ? "#3b82f6" : "#e2e8f0",
            position: "relative",
            transition: "background 0.2s",
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: 2,
              left: data.enableFormatConvert ? 26 : 2,
              transition: "left 0.2s",
            }} />
          </div>
        </div>

        {data.enableFormatConvert && (
          <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 12 }}>
              选择目标格式
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {formatOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => onChange("targetFormat", opt.value)}
                  style={{
                    padding: 12,
                    background: data.targetFormat === opt.value ? "#eff6ff" : "white",
                    border: `1px solid ${data.targetFormat === opt.value ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: data.targetFormat === opt.value ? "#3b82f6" : "#1e293b", marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{opt.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 字段映射 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#f0fdf4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <GitMerge size={16} color="#10b981" />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>字段映射</h4>
        </div>

        <div
          onClick={() => onChange("enableFieldMapping", !data.enableFieldMapping)}
          style={{
            padding: 16,
            background: data.enableFieldMapping ? "#f0fdf4" : "#f8fafc",
            border: `1px solid ${data.enableFieldMapping ? "#10b981" : "#e2e8f0"}`,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", marginBottom: 4 }}>启用字段映射</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>统一不同数据源的字段名称和格式</div>
          </div>
          <div style={{
            width: 48,
            height: 24,
            borderRadius: 12,
            background: data.enableFieldMapping ? "#10b981" : "#e2e8f0",
            position: "relative",
            transition: "background 0.2s",
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: 2,
              left: data.enableFieldMapping ? 26 : 2,
              transition: "left 0.2s",
            }} />
          </div>
        </div>

        {data.enableFieldMapping && (
          <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>
                目标字段列表
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(data.fields || []).map((field: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 10px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    <span style={{ color: "#3b82f6" }}>{field}</span>
                    <button
                      onClick={() => onChange("fields", (data.fields || []).filter((f: string, i: number) => i !== idx))}
                      style={{ padding: 0, border: "none", background: "none", cursor: "pointer", color: "#64748b" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newField = prompt("请输入字段名称：");
                    if (newField && newField.trim()) {
                      onChange("fields", [...(data.fields || []), newField.trim()]);
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "6px 10px",
                    background: "white",
                    border: "1px dashed #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={12} />
                  添加字段
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>空值填充策略</label>
                <select
                  value={data.nullFillStrategy || "skip"}
                  onChange={e => onChange("nullFillStrategy", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  <option value="skip">跳过</option>
                  <option value="null">填充为NULL</option>
                  <option value="empty">填充为空字符串</option>
                  <option value="default">填充默认值</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, color: "#64748b", marginBottom: 4 }}>时间字段格式</label>
                <select
                  value={data.timeFormat || "iso8601"}
                  onChange={e => onChange("timeFormat", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #e2e8f0",
                    borderRadius: 6,
                    fontSize: 13,
                  }}
                >
                  <option value="iso8601">ISO 8601 (推荐)</option>
                  <option value="unix">Unix时间戳</option>
                  <option value="custom">自定义格式</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 数据合并与拆分 */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#fdf4ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Merge size={16} color="#a855f7" />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>数据合并与拆分</h4>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div
            onClick={() => onChange("enableMerge", !data.enableMerge)}
            style={{
              padding: 16,
              background: data.enableMerge ? "#fdf4ff" : "#f8fafc",
              border: `1px solid ${data.enableMerge ? "#a855f7" : "#e2e8f0"}`,
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>数据合并</div>
              <div style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: data.enableMerge ? "#a855f7" : "#e2e8f0",
                position: "relative",
              }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: data.enableMerge ? 20 : 2,
                  transition: "left 0.2s",
                }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              将多个数据源合并为统一数据集
            </div>
          </div>

          <div
            onClick={() => onChange("enableSplit", !data.enableSplit)}
            style={{
              padding: 16,
              background: data.enableSplit ? "#fef9c3" : "#f8fafc",
              border: `1px solid ${data.enableSplit ? "#ca8a04" : "#e2e8f0"}`,
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b" }}>数据拆分</div>
              <div style={{
                width: 40,
                height: 22,
                borderRadius: 11,
                background: data.enableSplit ? "#ca8a04" : "#e2e8f0",
                position: "relative",
              }}>
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  position: "absolute",
                  top: 2,
                  left: data.enableSplit ? 20 : 2,
                  transition: "left 0.2s",
                }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              按条件或数量拆分数据
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 步骤3：质量校验配置 ====================
function Step3Quality({ data, onChange }: { data: any; onChange: (key: string, value: any) => void }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>数据质量校验配置</h3>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
        配置数据质量校验规则和异常处理方式
      </p>

      {/* 去重配置 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#fef2f2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Scissors size={16} color="#dc2626" />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>去重规则</h4>
        </div>

        <div
          onClick={() => onChange("enableDedup", !data.enableDedup)}
          style={{
            padding: 16,
            background: data.enableDedup ? "#fef2f2" : "#f8fafc",
            border: `1px solid ${data.enableDedup ? "#dc2626" : "#e2e8f0"}`,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#1e293b", marginBottom: 4 }}>启用去重</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>自动识别并过滤重复数据</div>
          </div>
          <div style={{
            width: 48,
            height: 24,
            borderRadius: 12,
            background: data.enableDedup ? "#dc2626" : "#e2e8f0",
            position: "relative",
          }}>
            <div style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              position: "absolute",
              top: 2,
              left: data.enableDedup ? 26 : 2,
            }} />
          </div>
        </div>

        {data.enableDedup && (
          <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>
                去重方式
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { value: "md5", label: "MD5", desc: "内容哈希" },
                  { value: "primary_key", label: "主键", desc: "按唯一字段" },
                  { value: "perceptual_hash", label: "感知哈希", desc: "内容相似" },
                  { value: "none", label: "不过滤", desc: "保留全部" },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => onChange("dedupMethod", opt.value)}
                    style={{
                      flex: 1,
                      padding: 12,
                      background: data.dedupMethod === opt.value ? "#fef2f2" : "white",
                      border: `1px solid ${data.dedupMethod === opt.value ? "#dc2626" : "#e2e8f0"}`,
                      borderRadius: 8,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 500, color: data.dedupMethod === opt.value ? "#dc2626" : "#1e293b", marginBottom: 2 }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>
                重复数据处理方式
              </label>
              <select
                value={data.dedupAction || "delete"}
                onChange={e => onChange("dedupAction", e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  fontSize: 14,
                }}
              >
                <option value="delete">直接删除重复数据</option>
                <option value="keep_latest">保留最新数据</option>
                <option value="keep_first">保留最早数据</option>
                <option value="merge">合并重复数据</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 基础校验规则 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <TestTube size={16} color="#3b82f6" />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>基础校验规则</h4>
        </div>

        <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {[
              { key: "requiredCheck", label: "必填字段校验", desc: "检查必填字段是否为空" },
              { key: "formatCheck", label: "数据格式校验", desc: "校验数据类型和格式" },
              { key: "rangeCheck", label: "数据范围校验", desc: "检查数值是否在合理范围内" },
              { key: "uniqueCheck", label: "唯一性校验", desc: "检查字段值是否唯一" },
            ].map(item => (
              <div
                key={item.key}
                onClick={() => onChange(item.key, !data[item.key])}
                style={{
                  padding: 12,
                  background: data[item.key] ? "#eff6ff" : "white",
                  border: `1px solid ${data[item.key] ? "#3b82f6" : "#e2e8f0"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <input
                  type="checkbox"
                  checked={data[item.key] || false}
                  onChange={() => onChange(item.key, !data[item.key])}
                  style={{ width: 18, height: 18, cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 质量阈值与告警 */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "#f59e0b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <AlertCircle size={16} color="white" />
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0 }}>质量阈值与告警</h4>
        </div>

        <div style={{ padding: 16, background: "#f8fafc", borderRadius: 12 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>
              数据合格率阈值 <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={data.qualityThreshold || 95}
                onChange={e => onChange("qualityThreshold", parseInt(e.target.value))}
                style={{ flex: 1, height: 6 }}
              />
              <div style={{
                width: 80,
                padding: "8px 12px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                textAlign: "center",
                fontSize: 14,
                fontWeight: 600,
                color: data.qualityThreshold >= 95 ? "#10b981" : data.qualityThreshold >= 90 ? "#f59e0b" : "#dc2626",
              }}>
                {data.qualityThreshold || 95}%
              </div>
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
              当合格率低于此阈值时，任务将终止或触发告警
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>
              异常数据处理
            </label>
            <select
              value={data.exceptionAction || "filter"}
              onChange={e => onChange("exceptionAction", e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                fontSize: 14,
              }}
            >
              <option value="filter">过滤并记录到异常文件</option>
              <option value="drop">直接丢弃</option>
              <option value="mark">标记后保留</option>
              <option value="stop">终止任务</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 步骤4：确认创建 ====================
function Step4Confirm({ data }: { data: any }) {
  const configSummary = [
    { label: "汇聚任务名称", value: data.name || "-" },
    { label: "目标数据类型", value: data.targetType || "-" },
    { label: "数据源数量", value: `${data.sourceTasks?.length || 0} 个` },
    { label: "格式转换", value: data.enableFormatConvert ? `启用 (${data.targetFormat || "-"})` : "未启用" },
    { label: "字段映射", value: data.enableFieldMapping ? "启用" : "未启用" },
    { label: "数据合并", value: data.enableMerge ? "启用" : "未启用" },
    { label: "数据拆分", value: data.enableSplit ? "启用" : "未启用" },
    { label: "去重规则", value: data.enableDedup ? `启用 (${data.dedupMethod || "MD5"})` : "未启用" },
    { label: "质量阈值", value: `${data.qualityThreshold || 95}%` },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>确认创建</h3>
      <p style={{ fontSize: 14, color: "#64748b", marginBottom: 24 }}>
        请确认汇聚任务的配置信息，确认无误后提交创建
      </p>

      {/* 配置概览 */}
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {configSummary.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 数据源列表 */}
      {data.sourceTasks?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>数据源详情</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.sourceTasks.map((id: string, idx: number) => (
              <div key={idx} style={{
                padding: 12,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <Database size={16} color="#3b82f6" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{id}</div>
                </div>
                <ChevronRight size={16} color="#94a3b8" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 质量配置 */}
      {data.enableDedup && (
        <div style={{ marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>质量校验配置</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.requiredCheck && <span style={{ padding: "4px 12px", background: "#eff6ff", color: "#3b82f6", borderRadius: 16, fontSize: 12 }}>必填字段校验</span>}
            {data.formatCheck && <span style={{ padding: "4px 12px", background: "#eff6ff", color: "#3b82f6", borderRadius: 16, fontSize: 12 }}>数据格式校验</span>}
            {data.rangeCheck && <span style={{ padding: "4px 12px", background: "#eff6ff", color: "#3b82f6", borderRadius: 16, fontSize: 12 }}>数据范围校验</span>}
            {data.uniqueCheck && <span style={{ padding: "4px 12px", background: "#eff6ff", color: "#3b82f6", borderRadius: 16, fontSize: 12 }}>唯一性校验</span>}
          </div>
        </div>
      )}

      {/* 提示 */}
      <div style={{ padding: 16, background: "#fef9c3", border: "1px solid #fde047", borderRadius: 12, display: "flex", gap: 12 }}>
        <Info size={20} color="#ca8a04" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: "#854d0e" }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>温馨提示</div>
          <ul style={{ margin: 0, paddingLeft: 16, lineHeight: 1.6 }}>
            <li>任务创建后将自动开始执行</li>
            <li>可在任务详情页查看执行进度和日志</li>
            <li>如需调整配置，可在执行前停止任务后重新编辑</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
export default function CreateConvergencePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // 步骤1
    name: "",
    targetType: "",
    description: "",
    sourceTasks: [] as string[],
    // 步骤2
    enableFormatConvert: true,
    targetFormat: "parquet",
    enableFieldMapping: true,
    fields: ["timestamp", "location", "source"],
    nullFillStrategy: "skip",
    timeFormat: "iso8601",
    enableMerge: false,
    enableSplit: false,
    // 步骤3
    enableDedup: true,
    dedupMethod: "md5",
    dedupAction: "delete",
    requiredCheck: true,
    formatCheck: true,
    rangeCheck: false,
    uniqueCheck: false,
    qualityThreshold: 95,
    exceptionAction: "filter",
  });

  const steps = ["选择数据源", "数据转换与归一化", "质量校验配置", "确认创建"];

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 提交创建
      const newTask = {
        id: `CT${String(Math.floor(Math.random() * 900) + 100)}`,
        name: formData.name,
        type: formData.targetType,
        data_source: "多源汇聚",
        source_tasks: formData.sourceTasks,
        item_count: 0,
        qualified_count: 0,
        qualified_rate: 0,
        created_at: new Date().toLocaleString("zh-CN", { hour12: false }).replace(/\//g, "-"),
        creator: "当前用户",
        status: "pending" as const,
        progress: 0,
        rule_name: "自定义汇聚规则",
        rule_config: {
          format_convert: formData.enableFormatConvert,
          field_mapping: formData.enableFieldMapping,
          deduplication: formData.enableDedup,
          quality_threshold: formData.qualityThreshold,
        },
        last_run_time: "-",
      };

      const stored = localStorage.getItem("taskforge_convergence_tasks");
      const tasks = stored ? JSON.parse(stored) : [];
      tasks.unshift(newTask);
      localStorage.setItem("taskforge_convergence_tasks", JSON.stringify(tasks));

      alert("汇聚任务创建成功！");
      router.push("/data-asset/data-access/convergence");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 步骤验证
  const canProceed = () => {
    if (currentStep === 0) {
      return formData.name && formData.targetType && formData.sourceTasks.length > 0;
    }
    return true;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      {/* 顶部导航 */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => router.push("/data-asset/data-access/convergence")}
            style={{ padding: 8, border: "none", background: "#f1f5f9", borderRadius: 8, cursor: "pointer", color: "#64748b" }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "#1e293b" }}>新建汇聚任务</h2>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>创建数据汇聚任务，统一管理和处理多源数据</div>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px" }}>
        <StepIndicator current={currentStep} steps={steps} />
      </div>

      {/* 内容区 */}
      <div style={{ padding: 24 }}>
        <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", minHeight: 400 }}>
          <div style={{ padding: 24 }}>
            {currentStep === 0 && <Step1DataSource data={formData} onChange={updateFormData} />}
            {currentStep === 1 && <Step2Transform data={formData} onChange={updateFormData} />}
            {currentStep === 2 && <Step3Quality data={formData} onChange={updateFormData} />}
            {currentStep === 3 && <Step4Confirm data={formData} />}
          </div>
        </div>
      </div>

      {/* 底部按钮 */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "white",
        borderTop: "1px solid #e2e8f0",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          style={{
            padding: "10px 20px",
            border: "1px solid #e2e8f0",
            background: "white",
            borderRadius: 8,
            fontSize: 14,
            cursor: currentStep === 0 ? "not-allowed" : "pointer",
            color: currentStep === 0 ? "#cbd5e1" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ArrowLeft size={16} />
          上一步
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => router.push("/data-asset/data-access/convergence")}
            style={{
              padding: "10px 20px",
              border: "1px solid #e2e8f0",
              background: "white",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            取消
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            style={{
              padding: "10px 24px",
              border: "none",
              background: canProceed() ? "#3b82f6" : "#e2e8f0",
              color: canProceed() ? "white" : "#94a3b8",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: canProceed() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {currentStep === steps.length - 1 ? (
              <>
                <Check size={16} />
                确认创建
              </>
            ) : (
              <>
                下一步
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          background: #e2e8f0;
          border-radius: 3px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border-radius: 50%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
