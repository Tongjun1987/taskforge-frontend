"use client";
import { useState, useEffect } from "react";
import { History, GitBranch, Calendar, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface VersionRecord {
  id: string;
  version: string;
  date: string;
  requirement: string;
}

const STORAGE_KEY = "taskforge_version_history";

// 获取版本历史
function getVersionHistory(): VersionRecord[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// 初始化版本历史（自动升级到最新版本）
function initVersionHistory(): VersionRecord[] {
  const existing = getVersionHistory();
  const now = new Date().toISOString();

  if (existing.length === 0 || !existing.some(r => r.version === "1.0.6")) {
    const records: VersionRecord[] = [
      {
        id: "v1.0.6",
        version: "1.0.6",
        date: now,
        requirement: "菜单架构重构：数据生产中心新增数据处理模块（数据清洗/数据增强/数据合成），样本生产管理→数据标注，专家标注替代原数据标注，智能标注保留；质量控制管理→数据管理，新增数据集管理；模型生产中心新增大模型管理、提示词工程；任务建模中心菜单不变",
      },
      {
        id: "v1.0.5",
        version: "1.0.5",
        date: now,
        requirement: "交通事件识别完整链路：任务建模新增交通事件场景和4个任务、智能标注新增3个交通事件任务；场景详情侧边栏优化、关联数据集跳转；多处Bug修复",
      },
      {
        id: "v1.0.4",
        version: "1.0.4",
        date: now,
        requirement: "智能标注模块（AI预标注+主动学习+置信度过滤）；标注任务支持全员标注/双盲仲裁模式；数据清洗模块（文本/图像/视频/音频多维度清洗算子）；质量控制全链路增强（清洗质量追踪+标注质量追踪+质量告警）",
      },
      {
        id: "v1.0.3",
        version: "1.0.3",
        date: now,
        requirement: "数据集管理：编辑/详情独立页面（各类型专属配置）、列表覆盖全数据类型；数据标注：新建任务改为独立页面、标注工作台支持多模板（图片分类/目标检测/文本分类/NER/情感分析/音视频分类）、详情页面",
      },
      {
        id: "v1.0.2",
        version: "1.0.2",
        date: now,
        requirement: "数据集管理优化：新增数据集支持多数据来源类型（本地/文件服务器/云平台/平台数据/公开数据）、新增版本管理功能",
      },
      {
        id: "v1.0.1",
        version: "1.0.1",
        date: now,
        requirement: "数据资产管理模块：数据源管理（阿里OSS、腾讯COS、华为OBS、百度BOS、MinIO）、数据集管理",
      },
      {
        id: "v1.0",
        version: "1.0.0",
        date: now,
        requirement: "初始版本：六大中心架构、Dashboard、数据生产中心、模型生产中心、任务建模中心",
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    return records;
  }
  return existing;
}

export default function VersionHistoryPage() {
  const [history, setHistory] = useState<VersionRecord[]>([]);

  useEffect(() => {
    const data = initVersionHistory();
    setHistory(data);
  }, []);

  const currentVersion = history[0]?.version || "1.0.6";

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部标题栏 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 6,
          color: "#64748b", textDecoration: "none", fontSize: 13,
        }}>
          <ArrowLeft size={16} />
          返回首页
        </Link>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <History size={22} color="#3b82f6" />
          版本迭代历史
        </h1>
        <span style={{
          padding: "4px 10px", borderRadius: 20,
          background: "#eff6ff", color: "#2563eb",
          fontSize: 12, fontWeight: 600,
        }}>
          当前版本 v{currentVersion}
        </span>
      </div>

        {/* 版本历史列表 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {history.map((record, index) => {
            const date = new Date(record.date);
            const isLatest = index === 0;
            return (
              <div
                key={record.id}
                style={{
                  background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0",
                  padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  borderLeft: isLatest ? "3px solid #2563eb" : "3px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: isLatest ? "#eff6ff" : "#f8fafc",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <GitBranch size={18} color={isLatest ? "#2563eb" : "#94a3b8"} />
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#1e293b" }}>
                          v{record.version}
                        </span>
                        {isLatest && (
                          <span style={{
                            padding: "2px 8px", borderRadius: 20,
                            background: "#10b981", color: "#fff",
                            fontSize: 10, fontWeight: 600,
                          }}>
                            当前版本
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, fontSize: 12, color: "#94a3b8" }}>
                        <Calendar size={12} />
                        {date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <div style={{
                    padding: "4px 10px", borderRadius: 20,
                    background: "#f1f5f9", color: "#64748b",
                    fontSize: 12, fontWeight: 600,
                  }}>
                    #{index + 1}
                  </div>
                </div>
                <div style={{
                  padding: "12px 16px", background: "#f8fafc",
                  borderRadius: 8, display: "flex", alignItems: "flex-start", gap: 8,
                }}>
                  <FileText size={14} color="#64748b" style={{ marginTop: 2, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                    {record.requirement}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {history.length === 0 && (
          <div style={{
            textAlign: "center", padding: "60px 20px", color: "#94a3b8",
          }}>
            <History size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>暂无版本迭代记录</p>
          </div>
        )}
      </main>
  );
}
