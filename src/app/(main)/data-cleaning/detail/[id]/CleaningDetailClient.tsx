"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Clock,
  Database, FileSearch, Sparkles, BarChart3, Calendar
} from "lucide-react";

interface CleaningReport {
  duplicates: number;
  format_errors: number;
  pii_found: number;
  dirty_data: number;
  length_outliers: number;
}

interface CleaningJob {
  id: string;
  name: string;
  dataset_id: string;
  dataset_name: string;
  data_type: string;
  rules: string[];
  total_items: number;
  passed_items: number;
  removed_items: number;
  removed_rate: string;
  quality_score?: number;
  status: string;
  report: CleaningReport;
  created_at: string;
}

const STORAGE_KEY = "taskforge_cleaning_jobs";

export default function CleaningDetailClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [job, setJob] = useState<CleaningJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 尝试从 localStorage 获取数据
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const jobs: CleaningJob[] = JSON.parse(stored);
        const found = jobs.find(j => j.id === id);
        if (found) {
          setJob(found);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load from localStorage", e);
    }

    // 如果 localStorage 没有，尝试使用 mock 数据
    const mockJobs: CleaningJob[] = [
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
        id: "cl-traffic-event",
        name: "交通事件识别数据清洗",
        dataset_id: "ds_traffic_event",
        dataset_name: "交通事件识别数据集",
        data_type: "video",
        rules: ["事件过滤", "场景过滤", "质量评分"],
        total_items: 16800,
        passed_items: 15200,
        removed_items: 1600,
        removed_rate: "9.5%",
        quality_score: 91.8,
        status: "completed",
        report: { duplicates: 380, format_errors: 450, pii_found: 0, dirty_data: 520, length_outliers: 250 },
        created_at: "2026-04-16T10:00:00Z",
      },
      {
        id: "cl-traffic-timeseries",
        name: "时序流量数据清洗",
        dataset_id: "ds_traffic_ts",
        dataset_name: "时序流量数据集",
        data_type: "timeseries",
        rules: ["异常值过滤", "缺失值填补", "归一化", "平稳性检验"],
        total_items: 9500,
        passed_items: 8900,
        removed_items: 600,
        removed_rate: "6.3%",
        quality_score: 95.6,
        status: "completed",
        report: { duplicates: 50, format_errors: 180, pii_found: 0, dirty_data: 220, length_outliers: 150 },
        created_at: "2026-04-15T10:00:00Z",
      },
    ];

    const found = mockJobs.find(j => j.id === id);
    if (found) {
      setJob(found);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: "center", color: "#94a3b8" }}>
        加载中...
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ padding: 60, textAlign: "center" }}>
        <XCircle size={48} color="#dc2626" style={{ margin: "0 auto 16px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>任务不存在</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>未找到 ID 为 {id} 的清洗任务</p>
        <button
          onClick={() => router.push("/data-cleaning")}
          style={{
            padding: "10px 20px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          返回列表
        </button>
      </div>
    );
  }

  const totalRemoved = job.report.duplicates + job.report.format_errors +
    job.report.pii_found + job.report.dirty_data + job.report.length_outliers;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* 顶部导航 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => router.push("/data-cleaning")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "#475569",
            fontSize: 13,
          }}
        >
          <ArrowLeft size={16} />
          返回列表
        </button>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ color: "#64748b", fontSize: 13 }}>数据清洗</span>
        <span style={{ color: "#cbd5e1" }}>/</span>
        <span style={{ color: "#1e293b", fontSize: 13, fontWeight: 600 }}>{job.name}</span>
      </div>

      {/* 标题区域 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{job.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#64748b", fontSize: 13 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Database size={14} />
            {job.dataset_name}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Calendar size={14} />
            {new Date(job.created_at).toLocaleString("zh-CN")}
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              background: job.status === "completed" ? "#dcfce7" : job.status === "running" ? "#dbeafe" : "#fef3c7",
              color: job.status === "completed" ? "#15803d" : job.status === "running" ? "#1d4ed8" : "#d97706",
            }}
          >
            {job.status === "completed" ? "已完成" : job.status === "running" ? "运行中" : "等待中"}
          </span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ padding: 8, background: "#eff6ff", borderRadius: 8 }}>
              <FileSearch size={18} color="#2563eb" />
            </div>
            <span style={{ color: "#64748b", fontSize: 13 }}>原始数据量</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>
            {job.total_items.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>条</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ padding: 8, background: "#dcfce7", borderRadius: 8 }}>
              <CheckCircle2 size={18} color="#15803d" />
            </div>
            <span style={{ color: "#64748b", fontSize: 13 }}>清洗后数据量</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#10b981" }}>
            {job.passed_items.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>条</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ padding: 8, background: "#fee2e2", borderRadius: 8 }}>
              <XCircle size={18} color="#dc2626" />
            </div>
            <span style={{ color: "#64748b", fontSize: 13 }}>剔除数据量</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>
            {job.removed_items.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>条（{job.removed_rate}）</div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ padding: 8, background: "#f3e8ff", borderRadius: 8 }}>
              <Sparkles size={18} color="#7c3aed" />
            </div>
            <span style={{ color: "#64748b", fontSize: 13 }}>质量评分</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: job.quality_score && job.quality_score >= 94 ? "#15803d" : job.quality_score && job.quality_score >= 90 ? "#d97706" : "#dc2626" }}>
            {job.quality_score || "—"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>分</div>
        </div>
      </div>

      {/* 详情内容 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} color="#2563eb" />
            清洗规则
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {job.rules.map((rule, i) => (
              <span
                key={i}
                style={{
                  padding: "6px 12px",
                  background: "#f0fdf4",
                  color: "#15803d",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {rule}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={18} color="#2563eb" />
            质量报告
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fef2f2", borderRadius: 6 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>重复数据</span>
              <span style={{ fontWeight: 600, color: "#dc2626" }}>{job.report.duplicates.toLocaleString()} 条</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fef3c7", borderRadius: 6 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>格式错误</span>
              <span style={{ fontWeight: 600, color: "#d97706" }}>{job.report.format_errors.toLocaleString()} 条</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f0fdf4", borderRadius: 6 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>脏数据</span>
              <span style={{ fontWeight: 600, color: "#15803d" }}>{job.report.dirty_data.toLocaleString()} 条</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#eff6ff", borderRadius: 6 }}>
              <span style={{ color: "#64748b", fontSize: 13 }}>长度异常</span>
              <span style={{ fontWeight: 600, color: "#2563eb" }}>{job.report.length_outliers.toLocaleString()} 条</span>
            </div>
            {job.report.pii_found > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fdf4f6", borderRadius: 6 }}>
                <span style={{ color: "#64748b", fontSize: 13 }}>隐私信息</span>
                <span style={{ fontWeight: 600, color: "#be123c" }}>{job.report.pii_found.toLocaleString()} 条</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 质量分布图（简化版） */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginTop: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertTriangle size={18} color="#2563eb" />
          剔除原因分布
        </h3>
        <div style={{ display: "flex", height: 32, borderRadius: 8, overflow: "hidden", background: "#f1f5f9" }}>
          {totalRemoved > 0 && (
            <>
              <div
                style={{
                  width: `${(job.report.duplicates / totalRemoved) * 100}%`,
                  background: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.report.duplicates > 0 && `${((job.report.duplicates / totalRemoved) * 100).toFixed(0)}%`}
              </div>
              <div
                style={{
                  width: `${(job.report.format_errors / totalRemoved) * 100}%`,
                  background: "#d97706",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.report.format_errors > 0 && `${((job.report.format_errors / totalRemoved) * 100).toFixed(0)}%`}
              </div>
              <div
                style={{
                  width: `${(job.report.dirty_data / totalRemoved) * 100}%`,
                  background: "#15803d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.report.dirty_data > 0 && `${((job.report.dirty_data / totalRemoved) * 100).toFixed(0)}%`}
              </div>
              <div
                style={{
                  width: `${(job.report.length_outliers / totalRemoved) * 100}%`,
                  background: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {job.report.length_outliers > 0 && `${((job.report.length_outliers / totalRemoved) * 100).toFixed(0)}%`}
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 24, marginTop: 16, justifyContent: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: "#dc2626" }} />
            重复数据 {job.report.duplicates.toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: "#d97706" }} />
            格式错误 {job.report.format_errors.toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: "#15803d" }} />
            脏数据 {job.report.dirty_data.toLocaleString()}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: "#2563eb" }} />
            长度异常 {job.report.length_outliers.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
