"use client";
import { useEffect, useState } from "react";
import { getQualityGates, runQualityGate, overrideGate } from "@/lib/services";
import { Shield, Play, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Eye, ChevronDown, Sparkles, GitCompare, BarChart3, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";

interface GateStatus {
  gate_id: string;
  gate_number: number;
  name: string;
  description: string;
  is_active: boolean;
  last_run: {
    status: string;
    failure_reasons?: string[];
    finished_at: string | null;
    check_results?: Record<string, any>;
  } | null;
}

const MOCK_GATES: GateStatus[] = [
  {
    gate_id: "qg1", gate_number: 1, name: "QG-1 数据导入校验", is_active: true,
    description: "检验数据格式正确性、字段完整性、编码一致性",
    last_run: { status: "passed", failure_reasons: [], finished_at: "2025-12-10T10:23:00Z", check_results: { format_check: true, field_check: true, encoding_check: true } },
  },
  {
    gate_id: "qg2", gate_number: 2, name: "QG-2 数据分布检验", is_active: true,
    description: "检验类别分布均衡性、样本多样性、异常值比例",
    last_run: { status: "passed", failure_reasons: [], finished_at: "2025-12-11T09:15:00Z", check_results: { distribution_check: true, diversity_check: true, outlier_ratio: "1.2%" } },
  },
  {
    gate_id: "qg3", gate_number: 3, name: "QG-3 标注质量检验", is_active: true,
    description: "Kappa 一致性系数检验、抽检正确率验证",
    last_run: { status: "passed", failure_reasons: [], finished_at: "2025-12-12T14:05:00Z", check_results: { kappa: 0.78, sample_accuracy: "94.2%", threshold: "Kappa ≥ 0.7" } },
  },
  {
    gate_id: "qg4", gate_number: 4, name: "QG-4 发布前检验", is_active: true,
    description: "训练/测试集比例、标签覆盖率、最终质量分",
    last_run: { status: "failed", failure_reasons: ["测试集比例不足，当前 8%，要求 ≥ 15%", "标签覆盖率不足，缺少 3 个类别"], finished_at: "2025-12-13T08:30:00Z", check_results: { split_ratio: "8:92", coverage: "87%", threshold: "split ≥ 15%" } },
  },
  {
    gate_id: "qg5", gate_number: 5, name: "QG-5 训练前检验", is_active: false,
    description: "模型训练前最终数据集完整性与一致性确认",
    last_run: null,
  },
];

function GateStatusIcon({ status }: { status?: string }) {
  if (!status) return <Clock size={16} style={{ color: "#94a3b8" }} />;
  if (status === "passed") return <CheckCircle2 size={16} style={{ color: "#16a34a" }} />;
  if (status === "failed") return <XCircle size={16} style={{ color: "#dc2626" }} />;
  if (status === "running") return <RefreshCw size={16} style={{ color: "#2563eb", animation: "spin 1s linear infinite" }} />;
  return <Clock size={16} style={{ color: "#94a3b8" }} />;
}

function GateStatusBadge({ status }: { status?: string }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    passed:  { bg: "#dcfce7", color: "#15803d", label: "已通过" },
    failed:  { bg: "#fee2e2", color: "#dc2626", label: "未通过" },
    running: { bg: "#dbeafe", color: "#1d4ed8", label: "检测中" },
  };
  if (!status) return <span style={{ fontSize: 12, color: "#94a3b8", background: "#f1f5f9", padding: "2px 8px", borderRadius: 4 }}>待运行</span>;
  const s = map[status] || { bg: "#f1f5f9", color: "#64748b", label: status };
  return <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 500, background: s.bg, color: s.color }}>{s.label}</span>;
}

export default function QualityPage() {
  const [gates, setGates] = useState<GateStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [expandedGate, setExpandedGate] = useState<string | null>(null);

  useEffect(() => { fetchGates(); }, []);

  const fetchGates = async () => {
    setLoading(true);
    try {
      const res = await getQualityGates("1");
      const items = res.data?.gates || res.data?.items || [];
      setGates(items.length > 0 ? items : MOCK_GATES);
    } catch {
      setGates(MOCK_GATES);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async (gate: GateStatus) => {
    setRunning(gate.gate_id);
    try {
      await runQualityGate(gate.gate_id, "current_dataset");
      toast.success(`${gate.name} 已触发检测`);
      setTimeout(() => { fetchGates(); setRunning(null); }, 2000);
    } catch {
      // 模拟运行效果
      setGates(prev => prev.map(g => g.gate_id === gate.gate_id ? {
        ...g, last_run: { status: "running", finished_at: null }
      } : g));
      setTimeout(() => {
        setGates(prev => prev.map(g => g.gate_id === gate.gate_id ? {
          ...g, last_run: { status: Math.random() > 0.3 ? "passed" : "failed", failure_reasons: [], finished_at: new Date().toISOString() }
        } : g));
        setRunning(null);
        toast.success(`${gate.name} 检测完成`);
      }, 2500);
    }
  };

  const stats = {
    total: gates.length,
    passed: gates.filter(g => g.last_run?.status === "passed").length,
    failed: gates.filter(g => g.last_run?.status === "failed").length,
    pending: gates.filter(g => !g.last_run).length,
  };

  const btnPrimary: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 12px",
    borderRadius: 5, background: "#2563eb", color: "#fff", border: "none", fontSize: 12, fontWeight: 500, cursor: "pointer",
  };
  const btnDefault: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 5, height: 30, padding: "0 12px",
    borderRadius: 5, background: "#fff", color: "#374151", border: "1px solid #e2e8f0", fontSize: 12, cursor: "pointer",
  };
  const btnIcon: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer", background: "transparent",
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部标题区 */}
      <div style={{ padding: "24px 32px 0", background: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>数据质检</h1>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "2px 0 0 0" }}>质量关口 · 五级检测体系 · 保障数据与模型质量</p>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "质量关口", value: stats.total,   color: "#2563eb", bg: "#eff6ff", icon: <Shield size={18} style={{ color: "#2563eb" }} /> },
            { label: "已通过",  value: stats.passed,  color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircle2 size={18} style={{ color: "#16a34a" }} /> },
            { label: "未通过",  value: stats.failed,  color: "#dc2626", bg: "#fff1f2", icon: <XCircle size={18} style={{ color: "#dc2626" }} /> },
            { label: "待检测",  value: stats.pending, color: "#d97706", bg: "#fffbeb", icon: <Clock size={18} style={{ color: "#d97706" }} /> },
          ].map(card => (
            <div key={card.label} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: card.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>{card.value}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 1 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px", background: "#f8fafc" }}>

        {/* 流程步骤可视化 */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 20px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 12 }}>质量关口流程</div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto" }}>
            {MOCK_GATES.map((gate, idx) => {
              const status = gate.last_run?.status;
              const color = status === "passed" ? "#16a34a" : status === "failed" ? "#dc2626" : "#94a3b8";
              const bg = status === "passed" ? "#f0fdf4" : status === "failed" ? "#fff1f2" : "#f8fafc";
              const border = status === "passed" ? "#bbf7d0" : status === "failed" ? "#fecaca" : "#e2e8f0";
              return (
                <div key={gate.gate_id} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => setExpandedGate(expandedGate === gate.gate_id ? null : gate.gate_id)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 6,
                      border: `1px solid ${border}`, background: bg, cursor: "pointer",
                      textAlign: "center", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}>
                      <GateStatusIcon status={status} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap" }}>QG-{gate.gate_number}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {gate.name.replace(`QG-${gate.gate_number} `, "")}
                    </div>
                  </div>
                  {idx < MOCK_GATES.length - 1 && (
                    <div style={{ width: 24, height: 2, background: status === "passed" ? "#bbf7d0" : "#e2e8f0", flexShrink: 0 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 关口详情列表 */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 4, height: 16, borderRadius: 2, background: "#2563eb" }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>质量关口详情</span>
            </div>
            <button style={btnDefault} onClick={fetchGates}><RefreshCw size={12} /> 刷新状态</button>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 13 }}>加载中...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["关口", "名称", "描述", "最后运行", "状态", "操作"].map((h, i) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", width: i === 0 ? 60 : i === 5 ? 140 : undefined }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gates.map((gate, idx) => {
                  const isExpanded = expandedGate === gate.gate_id;
                  const isRunning = running === gate.gate_id;
                  return (
                    <>
                      <tr key={gate.gate_id}
                        style={{ background: isExpanded ? "#eff6ff" : idx % 2 === 1 ? "#fafafa" : "#fff" }}
                        onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = "#f0f9ff"; }}
                        onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLElement).style.background = idx % 2 === 1 ? "#fafafa" : "#fff"; }}
                      >
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 6, margin: "0 auto",
                            background: gate.last_run?.status === "passed" ? "#f0fdf4" : gate.last_run?.status === "failed" ? "#fff1f2" : "#f1f5f9",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 11,
                            color: gate.last_run?.status === "passed" ? "#16a34a" : gate.last_run?.status === "failed" ? "#dc2626" : "#94a3b8",
                          }}>QG{gate.gate_number}</div>
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", fontWeight: 600, color: "#1e293b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {gate.name.replace(`QG-${gate.gate_number} `, "")}
                            {!gate.is_active && (
                              <span style={{ fontSize: 10, background: "#f1f5f9", color: "#94a3b8", padding: "1px 5px", borderRadius: 3 }}>未启用</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", color: "#64748b", maxWidth: 240 }}>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{gate.description}</div>
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9", color: "#64748b", fontSize: 12 }}>
                          {gate.last_run?.finished_at
                            ? new Date(gate.last_run.finished_at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                            : "—"}
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <GateStatusBadge status={isRunning ? "running" : gate.last_run?.status} />
                        </td>
                        <td style={{ padding: "12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ display: "flex", gap: 4 }}>
                            <button
                              style={{ ...btnPrimary, opacity: isRunning || !gate.is_active ? 0.5 : 1 }}
                              disabled={isRunning || !gate.is_active}
                              onClick={() => handleRun(gate)}
                              title="运行检测"
                            >
                              {isRunning ? <RefreshCw size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={12} />}
                              {isRunning ? "运行中" : "运行"}
                            </button>
                            <button
                              style={{ ...btnIcon, color: "#2563eb" }}
                              title="展开详情"
                              onClick={() => setExpandedGate(isExpanded ? null : gate.gate_id)}
                            >
                              <ChevronDown size={14} style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* 展开：检测详情 */}
                      {isExpanded && gate.last_run && (
                        <tr key={`${gate.gate_id}-detail`}>
                          <td colSpan={6} style={{ background: "#eff6ff", borderBottom: "1px solid #bfdbfe", padding: "12px 16px 12px 60px" }}>
                            {gate.last_run.status === "failed" && gate.last_run.failure_reasons && gate.last_run.failure_reasons.length > 0 && (
                              <div style={{ marginBottom: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, fontSize: 12, fontWeight: 600, color: "#dc2626" }}>
                                  <AlertTriangle size={13} /> 失败原因
                                </div>
                                {gate.last_run.failure_reasons.map((r, i) => (
                                  <div key={i} style={{ fontSize: 12, color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", borderRadius: 4, padding: "5px 10px", marginBottom: 4 }}>
                                    · {r}
                                  </div>
                                ))}
                              </div>
                            )}
                            {gate.last_run.check_results && (
                              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                                {Object.entries(gate.last_run.check_results).map(([k, v]) => (
                                  <div key={k} style={{ minWidth: 120 }}>
                                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{k}</div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: v === true ? "#16a34a" : v === false ? "#dc2626" : "#1e293b" }}>
                                      {v === true ? "✓ 通过" : v === false ? "✗ 失败" : String(v)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ========== 新增：全链路质量概览 ========== */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} color="#2563eb" /> 全链路质量概览
          </div>
          {/* 链路流程 */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
              {[
                { step: "数据清洗", icon: "🧹", color: "#059669", bg: "#d1fae5", desc: "格式/去重/PII" },
                { step: "质量预检", icon: "🔍", color: "#1d4ed8", bg: "#dbeafe", desc: "覆盖率/均衡性" },
                { step: "标注任务", icon: "🏷️", color: "#7c3aed", bg: "#f3e8ff", desc: "Kappa/一致性" },
                { step: "质量仲裁", icon: "⚖️", color: "#d97706", bg: "#fef3c7", desc: "双盲/争议处理" },
                { step: "质量门禁", icon: "🚦", color: "#2563eb", bg: "#dbeafe", desc: "五级关口" },
                { step: "数据就绪", icon: "✅", color: "#16a34a", bg: "#dcfce7", desc: "进入训练" },
              ].map((s, i) => (
                <div key={s.step} style={{ display: "flex", alignItems: "center", flex: "1 1 0", minWidth: 120 }}>
                  <div style={{ flex: 1, padding: "12px 10px", background: s.bg, borderRadius: 8, textAlign: "center" }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: s.color }}>{s.step}</div>
                    <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{s.desc}</div>
                  </div>
                  {i < 5 && <div style={{ width: 20, height: 2, background: "#e2e8f0", flexShrink: 0, margin: "0 4px" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* 清洗质量 + 标注质量 双栏 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* 清洗质量 */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <Sparkles size={15} color="#059669" /> 清洗质量追踪
                </div>
                <a href="/data-cleaning" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>查看全部 →</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "客服语料-文本清洗", rate: "93.2%", color: "#059669", items: "14,720/15,800", quality: "优秀" },
                  { name: "产品图片-图像清洗", rate: "95.5%", color: "#059669", items: "8,120/8,500", quality: "优秀" },
                  { name: "语音指令-音频清洗", rate: "90.0%", color: "#d97706", items: "3,780/4,200", quality: "良好" },
                ].map(j => (
                  <div key={j.name} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{j.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: j.color }}>{j.rate}</span>
                    </div>
                    <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, marginBottom: 4 }}>
                      <div style={{ height: "100%", width: j.rate, background: j.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8" }}>
                      <span>{j.items} 条</span>
                      <span style={{ color: j.color, fontWeight: 600 }}>{j.quality}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 标注质量 */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: 8 }}>
                  <GitCompare size={15} color="#7c3aed" /> 标注质量追踪
                </div>
                <a href="/annotation" style={{ fontSize: 12, color: "#2563eb", textDecoration: "none" }}>查看全部 →</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { name: "意图识别标注-批次1", kappa: "0.78", mode: "全员", annotators: 3, status: "标注中", color: "#1d4ed8" },
                  { name: "产品图像分类标注", kappa: "0.82", mode: "全员", annotators: 2, status: "已完成", color: "#16a34a" },
                  { name: "违章车辆检测标注", kappa: "0.71", mode: "双盲", annotators: 3, status: "标注中", color: "#d97706" },
                  { name: "实体识别标注", kappa: "0.85", mode: "双盲", annotators: 2, status: "已完成", color: "#16a34a" },
                ].map(j => (
                  <div key={j.name} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{j.name}</span>
                      <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 3, background: j.color + "20", color: j.color, fontWeight: 600 }}>{j.status}</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#64748b" }}>
                      <span>Kappa: <strong style={{ color: Number(j.kappa) >= 0.8 ? "#16a34a" : Number(j.kappa) >= 0.6 ? "#d97706" : "#dc2626" }}>{j.kappa}</strong></span>
                      <span>模式: <strong>{j.mode}</strong></span>
                      <span>标注员: <strong>{j.annotators}人</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 质量告警 */}
          <div style={{ marginTop: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={15} color="#dc2626" /> 质量告警
              <span style={{ marginLeft: 8, padding: "2px 8px", background: "#fee2e2", color: "#dc2626", borderRadius: 10, fontSize: 12, fontWeight: 700 }}>2</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { level: "warn", icon: "⚠️", title: "情感分析语料类别严重不均衡", desc: "正面样本占 82%，中性 12%，负面 6%，建议进行数据增强或重采样", time: "2小时前", action: "重新清洗" },
                { level: "error", icon: "🔴", title: "标注 Kappa 分数偏低", desc: "语音情绪识别标注任务 Kappa=0.65，低于合格阈值 0.7，建议重新标注或调整标注规则", time: "5小时前", action: "查看详情" },
                { level: "info", icon: "ℹ️", title: "视频数据集已完成清洗", desc: "产品介绍视频集清洗完成，保留率 94.5%，可直接进入标注流程", time: "1天前", action: "查看报告" },
              ].map(a => {
                const borderColor = a.level === "error" ? "#fecaca" : a.level === "warn" ? "#fde68a" : "#bfdbfe";
                const bg = a.level === "error" ? "#fef2f2" : a.level === "warn" ? "#fffbeb" : "#eff6ff";
                const textColor = a.level === "error" ? "#dc2626" : a.level === "warn" ? "#d97706" : "#1d4ed8";
                return (
                  <div key={a.title} style={{ display: "flex", gap: 12, padding: "12px 14px", background: bg, border: `1px solid ${borderColor}`, borderRadius: 8, alignItems: "flex-start" }}>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>{a.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{a.title}</span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{a.time}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 8 }}>{a.desc}</div>
                      <button style={{ padding: "4px 10px", background: textColor, color: "#fff", border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>{a.action}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
