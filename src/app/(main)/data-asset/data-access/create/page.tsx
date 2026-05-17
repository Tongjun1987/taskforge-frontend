"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database, X, Upload, Image, FileText, Video, Music, Box, Brain,
  Sparkles, Cpu, BookOpen, Cloud, FileUp, Server, Globe, Layers,
  CheckCircle2, AlertCircle, Clock, ArrowLeft, Save, Target, Plus,
  Search, Sliders, UploadCloud, Wifi, Activity, HardDriveDownload,
  Database as DatabaseIcon, Server as ServerIcon, Shield, GitBranch,
  ChevronRight, ChevronLeft, Eye, EyeOff, Loader2, Play, Pause,
  FileCheck, Trash2, RefreshCw, ArrowRight, Info, AlertTriangle,
  Calendar, User, Lock, Users, Globe as GlobeIcon, Bell, Mail,
  MessageSquare, Send, Copy, Check, Zap, AlertCircle as AlertCircleIcon,
} from "lucide-react";

// ========== 类型定义 ==========
interface BasicInfo {
  name: string;
  type: string;
  project_name: string;
  related_task: string;
  description: string;
  detail: string; // 任务详情
}

interface DataSourceConfig {
  source_type: string;
  // 本地文件
  local_files?: File[];
  local_format?: string;
  // OSS
  oss_endpoint?: string;
  oss_access_key?: string;
  oss_secret_key?: string;
  oss_bucket?: string;
  oss_path?: string;
  // API
  api_url?: string;
  api_method?: string;
  api_headers?: Record<string, string>;
  api_auth_type?: string;
  api_data_format?: string;
  // Kafka
  kafka_brokers?: string;
  kafka_topic?: string;
  kafka_group_id?: string;
  kafka_auth_type?: string;
  // 关系型数据库
  rdb_host?: string;
  rdb_port?: string;
  rdb_database?: string;
  rdb_username?: string;
  rdb_password?: string;
  rdb_table?: string;
  // 非关系型数据库
  nrd_type?: string;
  nrd_host?: string;
  nrd_port?: string;
  nrd_database?: string;
  nrd_username?: string;
  nrd_password?: string;
  nrd_collection?: string;
  // RTSP
  rtsp_url?: string;
  // 公开数据
  public_url?: string;
}

interface CollectionConfig {
  collection_mode: "batch" | "stream";
  // 批量采集
  batch_scope?: "full" | "incremental";
  incremental_field?: string;
  batch_size?: number;
  batch_rate_limit?: number;
  // 流式采集
  stream_rate_limit?: string;
  stream_max_delay?: number;
  stream_error_handling?: string;
  stream_stop_rule?: string;
  // 调度
  schedule_type?: "once" | "periodic";
  schedule_time?: string;
  schedule_cron?: string;
  // 重试
  retry_enabled?: boolean;
  retry_max_attempts?: number;
  retry_interval?: number;
  // 优先级
  priority?: "high" | "medium" | "low";
  max_concurrent?: number;
  // 告警
  alert_enabled?: boolean;
  alert_channels?: string[];
  alert_conditions?: string[];
  alert_receivers?: string[];
}

interface StorageConfig {
  storage_type: "default" | "custom";
  storage_path?: string;
  storage_format_struct?: "parquet" | "csv" | "orc";
  storage_format_unstruct?: "raw" | "compressed";
  compression_level?: string;
  replica_count?: number;
  version_enabled?: boolean;
  version_max_count?: number;
  version_retention_days?: number;
  archive_enabled?: boolean;
  archive_trigger?: "time" | "size" | "status";
  archive_location?: "cold" | "hot";
  lifecycle_days?: number;
  lifecycle_action?: "delete" | "archive" | "cold";
}

// ========== 常量定义 ==========
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
  { value: "timeseries", label: "时序数据", icon: Activity, color: "#06b6d4" },
  { value: "pointcloud", label: "点云数据", icon: Target, color: "#f43f5e" },
];

const SOURCE_TYPES = [
  { value: "local", label: "本地文件", icon: FileUp, color: "#6366f6", desc: "从本地上传数据文件" },
  { value: "oss", label: "对象存储", icon: HardDriveDownload, color: "#f59e0b", desc: "连接阿里云OSS或AWS S3" },
  { value: "api", label: "API接口", icon: ServerIcon, color: "#3b82f6", desc: "通过HTTP REST API获取数据" },
  { value: "kafka", label: "Kafka消息队列", icon: Activity, color: "#14b8a6", desc: "消费Kafka Topic数据" },
  { value: "relational", label: "关系型数据库", icon: DatabaseIcon, color: "#3b82f6", desc: "MySQL / PostgreSQL / SQL Server 等" },
  { value: "non_relational", label: "非关系型数据库", icon: DatabaseIcon, color: "#ec4899", desc: "MongoDB / Redis / Elasticsearch 等" },
  { value: "rtsp", label: "RTSP视频流", icon: Wifi, color: "#dc2626", desc: "实时视频流采集" },
  { value: "public", label: "公开数据", icon: Globe, color: "#10b981", desc: "接入公开数据集" },
];

const FILE_FORMATS: Record<string, string[]> = {
  image: ["JPG", "PNG", "BMP", "TIFF", "WebP"],
  text: ["JSONL", "CSV", "TXT", "JSON", "XML"],
  video: ["MP4", "AVI", "MKV", "MOV", "FLV"],
  audio: ["WAV", "MP3", "FLAC", "AAC", "OGG"],
  multimodal: ["JSONL", "Parquet"],
  conversation: ["JSONL", "CSV"],
  knowledge: ["JSON", "RDF", "OWL"],
  embedding: ["JSONL", "Parquet", "CSV"],
  instruction: ["JSONL", "CSV"],
  timeseries: ["CSV", "Parquet", "JSON"],
  pointcloud: ["PLY", "LAS", "PCD", "OFF"],
};

const TASK_SUGGESTIONS = [
  "意图识别", "情感分析", "文本分类", "OCR识别", "目标检测",
  "图像分割", "语音识别", "视频理解", "多模态理解", "问答系统",
];

const ALERT_CHANNELS = [
  { value: "inapp", label: "站内信", icon: Bell },
  { value: "email", label: "邮件", icon: Mail },
  { value: "wecom", label: "企业微信", icon: MessageSquare },
  { value: "dingtalk", label: "钉钉", icon: Send },
];

const ALERT_CONDITIONS = [
  { value: "failed", label: "执行失败" },
  { value: "stuck", label: "进度停滞" },
  { value: "abnormal", label: "数据量异常" },
  { value: "disconnect", label: "连接中断" },
];

// ========== 组件 ==========

// 步骤指示器
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 0", background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
              background: i < current ? "#10b981" : i === current ? "#3b82f6" : "#e2e8f0",
              color: i <= current ? "#fff" : "#94a3b8", fontSize: 14, fontWeight: 600,
              transition: "all 0.3s",
              boxShadow: i === current ? "0 4px 12px rgba(59,130,246,0.4)" : "none",
            }}>
              {i < current ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span style={{ fontSize: 12, fontWeight: 500, color: i <= current ? "#334155" : "#94a3b8" }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 120, height: 2, margin: "0 16px 24px", background: i < current ? "#10b981" : "#e2e8f0",
              transition: "background 0.3s",
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// 输入框组件
function InputField({ label, value, onChange, placeholder, required, type = "text", disabled }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string; disabled?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8,
          fontSize: 13, outline: "none", transition: "border-color 0.2s",
          background: disabled ? "#f8fafc" : "#fff",
        }}
        onFocus={e => e.target.style.borderColor = "#3b82f6"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
    </div>
  );
}

// 选择器组件
function SelectField({ label, value, onChange, options, required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean; placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", padding: "10px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8,
          fontSize: 13, outline: "none", cursor: "pointer", background: "#fff",
        }}
        onFocus={e => e.target.style.borderColor = "#3b82f6"}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );
}

// 开关组件
function SwitchField({ label, checked, onChange, description }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #f1f5f9" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
          background: checked ? "#3b82f6" : "#e2e8f0", position: "relative", transition: "background 0.2s",
        }}
      >
        <div style={{
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 2, left: checked ? 22 : 2,
          transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }} />
      </button>
    </div>
  );
}

// ========== 步骤1：基础信息 ==========
const PROJECT_OPTIONS = [
  { value: "traffic", label: "交通事件识别" },
  { value: "intention", label: "意图识别" },
  { value: "sentiment", label: "情感分析" },
  { value: "multimodal", label: "多模态理解" },
  { value: "ocr", label: "OCR识别" },
];

const TASK_OPTIONS: Record<string, { value: string; label: string }[]> = {
  traffic: [
    { value: "obj-detect", label: "交通目标检测" },
    { value: "multi-track", label: "多目标跟踪" },
    { value: "behavior", label: "交通行为识别" },
    { value: "event", label: "交通事件识别" },
    { value: "timeseries", label: "时序建模与异常分析" },
  ],
  intention: [
    { value: "intent-v2", label: "意图识别 v2.1" },
    { value: "intent-v1", label: "意图识别 v1.0" },
  ],
  sentiment: [
    { value: "sentiment-v1", label: "情感分析 v1.0" },
  ],
  multimodal: [
    { value: "mm-v1", label: "多模态理解 v1.0" },
  ],
  ocr: [
    { value: "ocr-v1", label: "OCR识别 v1.0" },
  ],
};

function HintTip({ text }: { text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginTop: 6, padding: "6px 10px", background: "#f0f9ff", borderRadius: 6, border: "1px solid #e0f2fe" }}>
      <Info size={12} color="#0284c7" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 11, color: "#0369a1", lineHeight: 1.6 }}>{text}</span>
    </div>
  );
}

function Step1BasicInfo({ data, onChange }: { data: BasicInfo; onChange: (d: Partial<BasicInfo>) => void }) {
  const taskOptions = TASK_OPTIONS[data.project_name] || [];

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", gap: 24 }}>
        {/* 左侧表单 */}
        <div style={{ flex: 1 }}>
          <InputField
            label="任务名称"
            value={data.name}
            onChange={v => onChange({ name: v })}
            placeholder="请输入数据接入任务名称"
            required
          />
          <HintTip text="作为任务的唯一标识，建议使用业务含义清晰的中文名称，如「G15高速视频流采集」" />

          <div style={{ marginTop: 0 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 8 }}>
              任务详情 <span style={{ color: "#94a3b8", fontWeight: 400 }}>（选填）</span>
            </label>
            <textarea
              value={data.detail || ""}
              onChange={e => onChange({ detail: e.target.value })}
              placeholder="请输入任务描述，如数据来源、业务背景、接入目的等"
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontFamily: "inherit", color: "#334155", resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }}
            />
          </div>
          <HintTip text="详细描述有助于后续运维人员理解接入背景，不填不影响任务创建" />

          <SelectField
            label="数据类型"
            value={data.type}
            onChange={v => onChange({ type: v })}
            options={DATA_TYPES.map(t => ({ value: t.value, label: t.label }))}
            placeholder="请选择数据类型"
            required
          />
          <HintTip text="数据类型决定后续支持的文件格式、解析方式及采集协议，选择后不可随意变更" />

          <SelectField
            label="所属项目"
            value={data.project_name}
            onChange={v => onChange({ project_name: v, related_task: "" })}
            options={PROJECT_OPTIONS}
            placeholder="请选择所属项目"
            required
          />
          <HintTip text="选择该任务所属的业务场景大类，对应任务建模中的项目维度" />

          {data.project_name && (
            <SelectField
              label="关联任务"
              value={data.related_task}
              onChange={v => onChange({ related_task: v })}
              options={taskOptions}
              placeholder="请选择关联的建模任务"
              required
            />
          )}
          {data.project_name && (
            <HintTip text="将数据接入任务绑定到具体建模任务，便于数据血缘追溯和任务统一管理" />
          )}
        </div>
      </div>
    </div>
  );
}

// ========== 步骤2：数据源与采集配置 ==========
const API_AUTH_TYPES = [
  { value: "none", label: "无认证" },
  { value: "apikey", label: "API Key" },
  { value: "oauth2", label: "OAuth2" },
  { value: "basic", label: "Basic Auth" },
];

const NRD_TYPES = [
  { value: "mongodb", label: "MongoDB" },
  { value: "redis", label: "Redis" },
  { value: "elasticsearch", label: "Elasticsearch" },
  { value: "cassandra", label: "Cassandra" },
];

function Step2DataSource({ data, onChange }: { data: DataSourceConfig; onChange: (d: Partial<DataSourceConfig>) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "failed" | null>(null);
  const [apiAuthType, setApiAuthType] = useState("none");

  const handleTestConnection = () => {
    setTimeout(() => setTestResult(Math.random() > 0.2 ? "success" : "failed"), 1500);
  };

  return (
    <div style={{ padding: "24px 0" }}>
      {/* 数据源类型选择 */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 12 }}>
          数据源类型 <span style={{ color: "#dc2626" }}>*</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {SOURCE_TYPES.map(source => {
            const Icon = source.icon;
            const isSelected = data.source_type === source.value;
            return (
              <button
                key={source.value}
                onClick={() => onChange({ source_type: source.value })}
                style={{
                  padding: 16, borderRadius: 10, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${isSelected ? "#3b82f6" : "#e2e8f0"}`,
                  background: isSelected ? "#eff6ff" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={24} color={isSelected ? "#3b82f6" : "#94a3b8"} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#3b82f6" : "#334155", marginBottom: 2 }}>{source.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{source.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 动态配置表单 */}
      {data.source_type && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          {data.source_type === "local" && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 8 }}>上传数据文件</label>
                <div style={{
                  border: "2px dashed #cbd5e1", borderRadius: 10, padding: "40px 20px", textAlign: "center",
                  background: "#fff", cursor: "pointer", transition: "all 0.2s",
                }}>
                  <UploadCloud size={40} color="#94a3b8" style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: "#334155", marginBottom: 4 }}>点击或拖拽文件到此处上传</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>单文件不超过10GB，总文件数不超过1000个</div>
                </div>
              </div>
              <SelectField
                label="文件格式"
                value={data.local_format || ""}
                onChange={v => onChange({ local_format: v })}
                options={(FILE_FORMATS["text"] || []).map(f => ({ value: f, label: f }))}
                placeholder="请选择文件格式"
              />
            </>
          )}

          {data.source_type === "oss" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Endpoint" value={data.oss_endpoint || ""} onChange={v => onChange({ oss_endpoint: v })} placeholder="如：oss-cn-hangzhou.aliyuncs.com" required />
                <InputField label="Bucket名称" value={data.oss_bucket || ""} onChange={v => onChange({ oss_bucket: v })} placeholder="请输入Bucket名称" required />
                <InputField label="AccessKey ID" value={data.oss_access_key || ""} onChange={v => onChange({ oss_access_key: v })} placeholder="请输入AccessKey ID" required />
                <div style={{ position: "relative" }}>
                  <InputField label="AccessKey Secret" value={data.oss_secret_key || ""} onChange={v => onChange({ oss_secret_key: v })} placeholder="请输入AccessKey Secret" type={showPassword ? "text" : "password"} required />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", cursor: "pointer" }}>
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
                <InputField label="文件路径" value={data.oss_path || ""} onChange={v => onChange({ oss_path: v })} placeholder="如：/data/video/" />
              </div>
            </>
          )}

          {data.source_type === "api" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="接口地址" value={data.api_url || ""} onChange={v => onChange({ api_url: v })} placeholder="https://api.example.com/data" required />
                <SelectField
                  label="请求方式"
                  value={data.api_method || "GET"}
                  onChange={v => onChange({ api_method: v })}
                  options={[{ value: "GET", label: "GET" }, { value: "POST", label: "POST" }]}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 8 }}>认证方式</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {API_AUTH_TYPES.map(auth => (
                    <button
                      key={auth.value}
                      onClick={() => { setApiAuthType(auth.value); onChange({ api_auth_type: auth.value }); }}
                      style={{
                        padding: "8px 16px", borderRadius: 6,
                        border: `1px solid ${apiAuthType === auth.value ? "#3b82f6" : "#e2e8f0"}`,
                        background: apiAuthType === auth.value ? "#eff6ff" : "#fff",
                        fontSize: 12, cursor: "pointer",
                        color: apiAuthType === auth.value ? "#3b82f6" : "#64748b",
                      }}
                    >{auth.label}</button>
                  ))}
                </div>
              </div>
              <SelectField
                label="数据解析格式"
                value={data.api_data_format || "json"}
                onChange={v => onChange({ api_data_format: v })}
                options={[{ value: "json", label: "JSON" }, { value: "xml", label: "XML" }]}
              />
            </>
          )}

          {data.source_type === "kafka" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <InputField label="Broker地址" value={data.kafka_brokers || ""} onChange={v => onChange({ kafka_brokers: v })} placeholder="broker1:9092,broker2:9092" required />
                <InputField label="Topic名称" value={data.kafka_topic || ""} onChange={v => onChange({ kafka_topic: v })} placeholder="请输入Kafka Topic" required />
                <InputField label="消费组ID" value={data.kafka_group_id || ""} onChange={v => onChange({ kafka_group_id: v })} placeholder="请输入消费组ID" />
                <SelectField
                  label="认证方式"
                  value={data.kafka_auth_type || "none"}
                  onChange={v => onChange({ kafka_auth_type: v })}
                  options={[{ value: "none", label: "无认证" }, { value: "sasl", label: "SASL" }]}
                />
              </div>
            </>
          )}

          {data.source_type === "relational" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <InputField label="主机地址" value={data.rdb_host || ""} onChange={v => onChange({ rdb_host: v })} placeholder="localhost" required />
                <InputField label="端口" value={data.rdb_port || "3306"} onChange={v => onChange({ rdb_port: v })} placeholder="3306" />
                <InputField label="数据库名" value={data.rdb_database || ""} onChange={v => onChange({ rdb_database: v })} placeholder="请输入数据库名" required />
                <InputField label="用户名" value={data.rdb_username || ""} onChange={v => onChange({ rdb_username: v })} placeholder="请输入用户名" required />
                <div style={{ position: "relative" }}>
                  <InputField label="密码" value={data.rdb_password || ""} onChange={v => onChange({ rdb_password: v })} placeholder="请输入密码" type={showPassword ? "text" : "password"} required />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", cursor: "pointer" }}>
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
                <InputField label="数据表名" value={data.rdb_table || ""} onChange={v => onChange({ rdb_table: v })} placeholder="table_name" required />
              </div>
            </>
          )}

          {data.source_type === "non_relational" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <SelectField
                  label="数据库类型"
                  value={data.nrd_type || ""}
                  onChange={v => onChange({ nrd_type: v })}
                  options={NRD_TYPES}
                  placeholder="请选择非关系型数据库类型"
                  required
                />
                <InputField label="主机地址" value={data.nrd_host || ""} onChange={v => onChange({ nrd_host: v })} placeholder="localhost" required />
                <InputField label="端口" value={data.nrd_port || ""} onChange={v => onChange({ nrd_port: v })} placeholder="27017" />
                <InputField label="数据库名" value={data.nrd_database || ""} onChange={v => onChange({ nrd_database: v })} placeholder="请输入数据库名" required />
                <InputField label="用户名" value={data.nrd_username || ""} onChange={v => onChange({ nrd_username: v })} placeholder="请输入用户名（可选）" />
                <div style={{ position: "relative" }}>
                  <InputField label="密码" value={data.nrd_password || ""} onChange={v => onChange({ nrd_password: v })} placeholder="请输入密码（可选）" type={showPassword ? "text" : "password"} />
                  <button onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", cursor: "pointer" }}>
                    {showPassword ? <EyeOff size={16} color="#94a3b8" /> : <Eye size={16} color="#94a3b8" />}
                  </button>
                </div>
                <InputField label="Collection/索引" value={data.nrd_collection || ""} onChange={v => onChange({ nrd_collection: v })} placeholder="collection_name / index_name" />
              </div>
            </>
          )}

          {data.source_type === "rtsp" && (
            <>
              <InputField label="RTSP流地址" value={data.rtsp_url || ""} onChange={v => onChange({ rtsp_url: v })} placeholder="rtsp://ip:port/stream/path" required />
              <div style={{ padding: 12, background: "#fef9c3", borderRadius: 8, border: "1px solid #f59e0b", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertTriangle size={16} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: "#92400e" }}>
                  RTSP视频流采集为实时采集模式，将持续获取视频流数据。请确保网络稳定和授权合法。
                </div>
              </div>
            </>
          )}

          {data.source_type === "public" && (
            <>
              <InputField label="数据源URL" value={data.public_url || ""} onChange={v => onChange({ public_url: v })} placeholder="https://huggingface.co/datasets/... 或 Kaggle 数据集URL" required />
              <div style={{ padding: 12, background: "#ecfdf5", borderRadius: 8, border: "1px solid #10b981", display: "flex", gap: 8, alignItems: "flex-start" }}>
                <CheckCircle2 size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: "#065f46" }}>
                  支持接入 HuggingFace、Kaggle 等公开数据集。请填写完整的数据集或文件下载链接。
                </div>
              </div>
            </>
          )}

          {/* 测试连接按钮 */}
          {["oss", "api", "kafka", "relational", "non_relational"].includes(data.source_type) && (
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <button
                onClick={handleTestConnection}
                disabled={testResult !== null}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 20px",
                  borderRadius: 8, border: "1px solid #3b82f6", background: "#fff",
                  fontSize: 13, cursor: "pointer", color: "#3b82f6",
                  opacity: testResult !== null ? 0.7 : 1,
                }}
              >
                {testResult === null ? (
                  <><Zap size={16} />测试连接</>
                ) : testResult === "success" ? (
                  <><CheckCircle2 size={16} />连接成功</>
                ) : (
                  <><AlertCircleIcon size={16} />连接失败</>
                )}
              </button>
              {testResult === "success" && (
                <span style={{ fontSize: 12, color: "#10b981" }}>数据源连接正常，可以进行下一步</span>
              )}
              {testResult === "failed" && (
                <span style={{ fontSize: 12, color: "#dc2626" }}>连接失败，请检查配置信息</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========== 步骤3：采集与存储配置 ==========
function Step3CollectionStorage({ data, onChange }: { data: CollectionConfig & StorageConfig; onChange: (d: Partial<CollectionConfig & StorageConfig>) => void }) {
  return (
    <div style={{ padding: "24px 0" }}>
      {/* 采集模式 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Sliders size={18} color="#3b82f6" />采集模式配置
        </h3>
        <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
          {[
            { value: "batch", label: "批量离线采集", desc: "适用于静态历史数据，可配置一次性或周期性采集", icon: Database },
            { value: "stream", label: "流式实时采集", desc: "适用于实时数据，持续增量采集", icon: Activity },
          ].map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => onChange({ collection_mode: mode.value as "batch" | "stream" })}
                style={{
                  flex: 1, padding: 20, borderRadius: 12, cursor: "pointer", textAlign: "left",
                  border: `2px solid ${data.collection_mode === mode.value ? "#3b82f6" : "#e2e8f0"}`,
                  background: data.collection_mode === mode.value ? "#eff6ff" : "#fff",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <Icon size={24} color={data.collection_mode === mode.value ? "#3b82f6" : "#94a3b8"} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: data.collection_mode === mode.value ? "#3b82f6" : "#334155" }}>{mode.label}</span>
                </div>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>{mode.desc}</p>
              </button>
            );
          })}
        </div>

        {/* 批量采集配置 */}
        {data.collection_mode === "batch" && (
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SelectField
                label="采集范围"
                value={data.batch_scope || "full"}
                onChange={v => onChange({ batch_scope: v as "full" | "incremental" })}
                options={[{ value: "full", label: "全量采集" }, { value: "incremental", label: "增量采集" }]}
              />
              {data.batch_scope === "incremental" && (
                <InputField label="增量字段" value={data.incremental_field || ""} onChange={v => onChange({ incremental_field: v })} placeholder="如：update_time, id" />
              )}
              <InputField label="批次大小" value={data.batch_size?.toString() || "1000"} onChange={v => onChange({ batch_size: parseInt(v) })} placeholder="单批次采集数据量" type="number" />
              <InputField label="采集速率限制" value={data.batch_rate_limit?.toString() || "100"} onChange={v => onChange({ batch_rate_limit: parseInt(v) })} placeholder="每秒最大采集量" type="number" />
            </div>
          </div>
        )}

        {/* 流式采集配置 */}
        {data.collection_mode === "stream" && (
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SelectField
                label="消费速率"
                value={data.stream_rate_limit || "single"}
                onChange={v => onChange({ stream_rate_limit: v })}
                options={[{ value: "single", label: "单条消费" }, { value: "batch", label: "批量消费" }]}
              />
              <InputField label="最大延迟(秒)" value={data.stream_max_delay?.toString() || "60"} onChange={v => onChange({ stream_max_delay: parseInt(v) })} type="number" />
              <SelectField
                label="异常数据处理"
                value={data.stream_error_handling || "skip"}
                onChange={v => onChange({ stream_error_handling: v })}
                options={[{ value: "skip", label: "跳过" }, { value: "retry", label: "重试" }, { value: "dlq", label: "写入死信队列" }]}
              />
              <SelectField
                label="采集停止规则"
                value={data.stream_stop_rule || "never"}
                onChange={v => onChange({ stream_stop_rule: v })}
                options={[{ value: "never", label: "永不停止" }, { value: "bytime", label: "按时间停止" }, { value: "bysize", label: "按数据量停止" }]}
              />
            </div>
          </div>
        )}
      </div>

      {/* 调度配置 */}
      {data.collection_mode === "batch" && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} color="#3b82f6" />任务调度策略
          </h3>
          <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <SelectField
                label="调度类型"
                value={data.schedule_type || "once"}
                onChange={v => onChange({ schedule_type: v as "once" | "periodic" })}
                options={[{ value: "once", label: "一次性执行" }, { value: "periodic", label: "周期性执行" }]}
              />
              {data.schedule_type === "once" ? (
                <InputField label="执行时间" value={data.schedule_time || ""} onChange={v => onChange({ schedule_time: v })} type="datetime-local" />
              ) : (
                <InputField label="Cron表达式" value={data.schedule_cron || ""} onChange={v => onChange({ schedule_cron: v })} placeholder="0 0 * * * *" />
              )}
              <SelectField
                label="失败重试策略"
                value={data.retry_enabled ? "yes" : "no"}
                onChange={v => onChange({ retry_enabled: v === "yes" })}
                options={[{ value: "yes", label: "开启" }, { value: "no", label: "关闭" }]}
              />
              {data.retry_enabled && (
                <>
                  <InputField label="最大重试次数" value={data.retry_max_attempts?.toString() || "3"} onChange={v => onChange({ retry_max_attempts: parseInt(v) })} type="number" />
                  <InputField label="重试间隔(分钟)" value={data.retry_interval?.toString() || "5"} onChange={v => onChange({ retry_interval: parseInt(v) })} type="number" />
                </>
              )}
              <SelectField
                label="任务优先级"
                value={data.priority || "medium"}
                onChange={v => onChange({ priority: v as "high" | "medium" | "low" })}
                options={[{ value: "high", label: "高优先级" }, { value: "medium", label: "中优先级" }, { value: "low", label: "低优先级" }]}
              />
              <InputField label="最大并发数" value={data.max_concurrent?.toString() || "1"} onChange={v => onChange({ max_concurrent: parseInt(v) })} type="number" />
            </div>
          </div>
        </div>
      )}

      {/* 告警配置 */}
      <div style={{ marginBottom: 32 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <Bell size={18} color="#3b82f6" />异常告警配置
        </h3>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <SwitchField
            label="启用异常告警"
            checked={data.alert_enabled || false}
            onChange={v => onChange({ alert_enabled: v })}
            description="开启后将根据配置的条件发送告警通知"
          />
          {data.alert_enabled && (
            <div style={{ paddingTop: 16 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 8 }}>告警方式</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {ALERT_CHANNELS.map(ch => {
                    const Icon = ch.icon;
                    return (
                      <button key={ch.value} style={{
                        display: "flex", alignItems: "center", gap: 6, padding: "8px 14px",
                        borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff",
                        fontSize: 12, cursor: "pointer", color: "#64748b"
                      }}>
                        <Icon size={14} />{ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#475569", marginBottom: 8 }}>告警触发条件</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {ALERT_CONDITIONS.map(cond => (
                    <label key={cond.value} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", fontSize: 12, cursor: "pointer" }}>
                      <input type="checkbox" defaultChecked />{cond.label}
                    </label>
                  ))}
                </div>
              </div>
              <InputField label="告警接收人" value={data.alert_receivers?.join(", ") || ""} onChange={v => onChange({ alert_receivers: v.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="多个接收人用逗号分隔" />
            </div>
          )}
        </div>
      </div>

      {/* 存储配置 */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <HardDriveDownload size={18} color="#3b82f6" />存储配置
        </h3>
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <SelectField
              label="存储位置"
              value={data.storage_type || "default"}
              onChange={v => onChange({ storage_type: v as "default" | "custom" })}
              options={[{ value: "default", label: "平台默认存储" }, { value: "custom", label: "自定义对象存储" }]}
            />
            {data.storage_type === "custom" && (
              <InputField label="存储路径" value={data.storage_path || ""} onChange={v => onChange({ storage_path: v })} placeholder="请输入自定义存储路径" />
            )}
            <SelectField
              label="存储格式"
              value={data.storage_format_struct || "parquet"}
              onChange={v => onChange({ storage_format_struct: v as "parquet" | "csv" | "orc" })}
              options={[{ value: "parquet", label: "Parquet" }, { value: "csv", label: "CSV" }, { value: "orc", label: "ORC" }]}
            />
            <InputField label="副本数量" value={data.replica_count?.toString() || "1"} onChange={v => onChange({ replica_count: parseInt(v) })} type="number" />
          </div>

          <div style={{ marginTop: 16 }}>
            <SwitchField
              label="启用多版本管理"
              checked={data.version_enabled || false}
              onChange={v => onChange({ version_enabled: v })}
              description="开启后可保留历史版本，支持快速回溯"
            />
            {data.version_enabled && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
                <InputField label="最大版本数" value={data.version_max_count?.toString() || "10"} onChange={v => onChange({ version_max_count: parseInt(v) })} type="number" />
                <InputField label="版本保留天数" value={data.version_retention_days?.toString() || "30"} onChange={v => onChange({ version_retention_days: parseInt(v) })} type="number" />
              </div>
            )}
          </div>

          <div style={{ marginTop: 16 }}>
            <SwitchField
              label="启用数据归档"
              checked={data.archive_enabled || false}
              onChange={v => onChange({ archive_enabled: v })}
              description="开启后可按规则自动归档冷数据，降低存储成本"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 步骤4：确认与创建 ==========
function Step4Confirm({ basicInfo, dataSource, collectionStorage }: {
  basicInfo: BasicInfo;
  dataSource: DataSourceConfig;
  collectionStorage: CollectionConfig & StorageConfig;
}) {
  const router = useRouter();

  const getSourceLabel = () => {
    const source = SOURCE_TYPES.find(s => s.value === dataSource.source_type);
    return source?.label || dataSource.source_type;
  };

  const getTypeLabel = () => {
    const type = DATA_TYPES.find(t => t.value === basicInfo.type);
    return type?.label || basicInfo.type;
  };

  return (
    <div style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ flex: 1 }}>
          {/* 基础信息确认 */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Database size={16} color="#3b82f6" />基础信息
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "任务名称", value: basicInfo.name || "—" },
                { label: "数据类型", value: getTypeLabel() },
                { label: "所属项目", value: PROJECT_OPTIONS.find(p => p.value === basicInfo.project_name)?.label || "—" },
                { label: "关联任务", value: basicInfo.related_task ? TASK_OPTIONS[basicInfo.project_name]?.find(t => t.value === basicInfo.related_task)?.label || "—" : "—" },
              ].map(item => (
                <div key={item.label} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{item.value}</div>
                </div>
              ))}
              {basicInfo.detail && (
                <div style={{ padding: "8px 0" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>任务详情</div>
                  <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{basicInfo.detail}</div>
                </div>
              )}
            </div>
          </div>

          {/* 数据源配置确认 */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, marginBottom: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <Server size={16} color="#3b82f6" />数据源与采集配置
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "数据源类型", value: getSourceLabel() },
                { label: "采集模式", value: collectionStorage.collection_mode === "batch" ? "批量离线采集" : "流式实时采集" },
                { label: "任务优先级", value: collectionStorage.priority === "high" ? "高" : collectionStorage.priority === "low" ? "低" : "中" },
                { label: "异常告警", value: collectionStorage.alert_enabled ? "已启用" : "未启用" },
              ].map(item => (
                <div key={item.label} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 存储配置确认 */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20 }}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <HardDriveDownload size={16} color="#3b82f6" />存储配置
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { label: "存储位置", value: collectionStorage.storage_type === "default" ? "平台默认存储" : "自定义对象存储" },
                { label: "存储格式", value: collectionStorage.storage_format_struct?.toUpperCase() || "Parquet" },
                { label: "副本数量", value: `${collectionStorage.replica_count || 1} 个` },
                { label: "多版本管理", value: collectionStorage.version_enabled ? `保留 ${collectionStorage.version_max_count || 10} 个版本` : "未启用" },
              ].map(item => (
                <div key={item.label} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#334155" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧提示 */}
        <div style={{ width: 300 }}>
          <div style={{ background: "#eff6ff", borderRadius: 12, padding: 20, border: "1px solid #bfdbfe", position: "sticky", top: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <CheckCircle2 size={18} color="#3b82f6" />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>创建确认</span>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
              请确认以上配置信息无误后，点击「确认创建」按钮即可创建数据接入任务。
            </p>
            <ul style={{ fontSize: 12, color: "#64748b", lineHeight: 1.8, paddingLeft: 16, marginBottom: 16 }}>
              <li>任务创建后将自动进入执行状态</li>
              <li>您可以在任务详情页查看执行进度</li>
              <li>执行过程中的问题可在日志中查看</li>
            </ul>
            <button
              onClick={() => {
                const tasks = JSON.parse(localStorage.getItem("taskforge_access_tasks") || "[]");
                const newTask = {
                  id: `task-${Date.now()}`,
                  name: basicInfo.name,
                  type: basicInfo.type,
                  task_name: PROJECT_OPTIONS.find(p => p.value === basicInfo.project_name)?.label || "",
                  project_name: basicInfo.project_name,
                  related_task: basicInfo.related_task,
                  detail: basicInfo.detail,
                  source_type: dataSource.source_type,
                  collection_mode: collectionStorage.collection_mode,
                  access_status: "pending",
                  access_progress: 0,
                  item_count: 0,
                  creator: "当前用户",
                  created_at: new Date().toISOString().split("T")[0],
                  last_run_time: "—",
                };
                tasks.unshift(newTask);
                localStorage.setItem("taskforge_access_tasks", JSON.stringify(tasks));
                router.push("/data-asset/data-access");
              }}
              style={{
                width: "100%", padding: "12px 20px", borderRadius: 8, border: "none",
                background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
              }}
            >
              确认创建
            </button>
            <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 12 }}>
              创建后可随时编辑和调整任务配置
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 主组件 ==========
export default function CreateDataAccessPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: "",
    type: "",
    project_name: "",
    related_task: "",
    description: "",
    detail: "",
  });

  const [dataSource, setDataSource] = useState<DataSourceConfig>({
    source_type: "",
  });

  const [collectionStorage, setCollectionStorage] = useState<CollectionConfig & StorageConfig>({
    collection_mode: "batch",
    storage_type: "default",
    storage_format_struct: "parquet",
    replica_count: 1,
  });

  const steps = ["基础信息", "数据源配置", "采集与存储", "确认创建"];

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return basicInfo.name.trim() && basicInfo.type && basicInfo.project_name && basicInfo.related_task;
      case 1:
        return dataSource.source_type !== "";
      case 2:
        return true;
      default:
        return true;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff", cursor: "pointer", color: "#334155", fontSize: 13 }}>
            <ArrowLeft size={16} />返回
          </button>
          <div style={{ width: 1, height: 24, background: "#e2e8f0" }} />
          <Target size={24} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", margin: 0 }}>新建数据接入任务</h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: 0 }}>配置数据源、采集规则和存储策略</p>
          </div>
        </div>
      </div>

      {/* 步骤指示器 */}
      <StepIndicator current={currentStep} steps={steps} />

      {/* 步骤内容 */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px" }}>
        {currentStep === 0 && <Step1BasicInfo data={basicInfo} onChange={d => setBasicInfo({ ...basicInfo, ...d })} />}
        {currentStep === 1 && <Step2DataSource data={dataSource} onChange={d => setDataSource({ ...dataSource, ...d })} />}
        {currentStep === 2 && <Step3CollectionStorage data={collectionStorage} onChange={d => setCollectionStorage({ ...collectionStorage, ...d })} />}
        {currentStep === 3 && <Step4Confirm basicInfo={basicInfo} dataSource={dataSource} collectionStorage={collectionStorage} />}
      </div>

      {/* 底部操作栏 */}
      {currentStep < 3 && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e2e8f0", padding: "16px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button
            onClick={() => currentStep > 0 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 8,
              border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: currentStep === 0 ? "not-allowed" : "pointer",
              color: currentStep === 0 ? "#cbd5e1" : "#334155",
            }}>
            <ChevronLeft size={16} />上一步
          </button>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => router.push("/data-asset/data-access")}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, cursor: "pointer", color: "#64748b" }}>
              取消
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 8,
                border: "none", background: canProceed() ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "#e2e8f0",
                fontSize: 13, fontWeight: 600, cursor: canProceed() ? "pointer" : "not-allowed",
                color: canProceed() ? "#fff" : "#94a3b8",
                boxShadow: canProceed() ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
              }}>
              下一步<ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {currentStep < 3 && <div style={{ height: 80 }} />}
    </div>
  );
}
