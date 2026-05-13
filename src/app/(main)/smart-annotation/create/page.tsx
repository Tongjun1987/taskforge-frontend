"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Brain, Zap, Target, Cpu, BarChart3,
  CheckCircle2, ChevronRight, Database, Sliders, Shield
} from "lucide-react";

// Mock 模型列表
const AVAILABLE_MODELS = [
  { id: "m1", name: "意图识别模型-v3.2", type: "text", accuracy: 0.94, label_count: 12 },
  { id: "m2", name: "情感分析模型-v2.1", type: "text", accuracy: 0.91, label_count: 5 },
  { id: "m3", name: "BERT-NER-v1.5", type: "text", accuracy: 0.88, label_count: 8 },
  { id: "m4", name: "图像分类模型-ResNet50", type: "image", accuracy: 0.96, label_count: 80 },
  { id: "m5", name: "YOLOv8目标检测", type: "image", accuracy: 0.89, label_count: 4 },
  { id: "m6", name: "音频情绪识别模型", type: "audio", accuracy: 0.85, label_count: 5 },
];

// 主动学习策略
const ACTIVE_LEARNING_STRATEGIES = [
  {
    value: "uncertainty_sampling",
    label: "不确定性采样",
    icon: Target,
    color: "#7c3aed",
    desc: "优先标注模型最不确定的样本",
    detail: "计算预测熵值，熵越高的样本越优先"
  },
  {
    value: "margin_sampling",
    label: "边缘采样",
    icon: Sliders,
    color: "#2563eb",
    desc: "标注预测概率接近的类别",
    detail: "选择 top-2 预测概率最接近的样本"
  },
  {
    value: "random",
    label: "随机采样",
    icon: BarChart3,
    color: "#64748b",
    desc: "随机选取标注样本",
    detail: "作为 baseline 对比实验"
  },
];

// 预标注策略
const PRELABEL_STRATEGIES = [
  {
    value: "active_learning",
    label: "主动学习",
    icon: Target,
    color: "#7c3aed",
    desc: "AI 自动筛选最有价值的样本优先标注，效率最高",
    badge: "推荐"
  },
  {
    value: "full_prelabel",
    label: "全量预标注",
    icon: Brain,
    color: "#2563eb",
    desc: "AI 先标注全部数据，人工审核修正",
    badge: null
  },
  {
    value: "confidence_filter",
    label: "置信度过滤",
    icon: Shield,
    color: "#059669",
    desc: "高置信度自动通过，中低置信度人工审核",
    badge: null
  },
];

export default function CreateSmartAnnotationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1: 基础配置
  const [jobName, setJobName] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  // Step 2: 智能标注策略
  const [strategy, setStrategy] = useState("active_learning");
  const [alStrategy, setAlStrategy] = useState("uncertainty_sampling");
  const [batchSize, setBatchSize] = useState(100);
  const [targetLabelCount, setTargetLabelCount] = useState(500);

  // Step 3: 置信度阈值
  const [highConfThreshold, setHighConfThreshold] = useState(0.9);
  const [lowConfThreshold, setLowConfThreshold] = useState(0.6);
  const [autoApproveHighConf, setAutoApproveHighConf] = useState(true);

  const totalSteps = 3;
  const stepLabels = ["基础配置", "智能策略", "审核配置"];

  const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  const handleCreate = () => {
    const newJob = {
      id: `sa-${Date.now()}`,
      name: jobName,
      dataset_id: datasetId,
      dataset_name: "客服意图识别数据集",
      model_name: selectedModelInfo?.name || "",
      strategy,
      total_items: targetLabelCount,
      prelabeled_items: strategy !== "active_learning" ? targetLabelCount : Math.round(targetLabelCount * 0.6),
      pending_review: Math.round(targetLabelCount * 0.2),
      auto_approved: strategy === "confidence_filter" && autoApproveHighConf ? Math.round(targetLabelCount * 0.6) : 0,
      status: "idle",
      created_at: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("taskforge_smart_annotation_jobs") || "[]");
    localStorage.setItem("taskforge_smart_annotation_jobs", JSON.stringify([newJob, ...existing]));
    router.push("/smart-annotation");
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部导航 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => router.push("/smart-annotation")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
          <ArrowLeft size={16} /> 返回
        </button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Brain size={20} color="#7c3aed" />
          新建智能标注
        </h1>
      </div>

      {/* 步骤指示器 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
        {stepLabels.map((label, i) => {
          const idx = i + 1;
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < stepLabels.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isDone ? "#7c3aed" : isActive ? "#ede9fe" : "#f1f5f9",
                  color: isDone ? "#fff" : isActive ? "#7c3aed" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, border: isActive ? "2px solid #7c3aed" : "none",
                  transition: "all 0.2s",
                }}>
                  {isDone ? <CheckCircle2 size={16} /> : idx}
                </div>
                <span style={{ fontSize: 12, color: isActive ? "#7c3aed" : "#94a3b8", fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </div>
              {i < stepLabels.length - 1 && (
                <div style={{ flex: 1, height: 2, background: isDone ? "#7c3aed" : "#e2e8f0", margin: "0 8px", marginBottom: 18 }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Step 1: 基础配置 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>任务基本信息</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>任务名称 <span style={{ color: "#dc2626" }}>*</span></label>
                  <input value={jobName} onChange={e => setJobName(e.target.value)} placeholder="如：意图识别-主动学习标注" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>选择数据集 <span style={{ color: "#dc2626" }}>*</span></label>
                  <select value={datasetId} onChange={e => setDatasetId(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff" }}>
                    <option value="">请选择数据集</option>
                    <option value="ds-1">客服意图识别数据集 (ds-1)</option>
                    <option value="ds-3">情感分析语料库 (ds-3)</option>
                    <option value="ds-1">金融新闻语料 (ds-1)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>选择预标注模型</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {AVAILABLE_MODELS.map(m => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    style={{
                      padding: "14px 16px", borderRadius: 10, border: "2px solid",
                      borderColor: selectedModel === m.id ? "#7c3aed" : "#e2e8f0",
                      background: selectedModel === m.id ? "#f5f3ff" : "#fff",
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Cpu size={14} color={selectedModel === m.id ? "#7c3aed" : "#6366f1"} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{m.name}</span>
                      {selectedModel === m.id && <CheckCircle2 size={14} color="#7c3aed" style={{ marginLeft: "auto" }} />}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      类型: {m.type} &nbsp;|&nbsp; 准确率: {(m.accuracy * 100).toFixed(0)}% &nbsp;|&nbsp; 标签数: {m.label_count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 智能策略 */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>选择预标注策略</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>决定 AI 如何处理数据和分配人工标注任务</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {PRELABEL_STRATEGIES.map(s => {
                  const Icon = s.icon;
                  const isActive = strategy === s.value;
                  return (
                    <div key={s.value} onClick={() => setStrategy(s.value)} style={{
                      padding: "16px 20px", borderRadius: 10, border: "2px solid",
                      borderColor: isActive ? s.color : "#e2e8f0",
                      background: isActive ? `${s.color}08` : "#fff",
                      cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 14
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={18} color={s.color} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{s.label}</span>
                          {s.badge && <span style={{ padding: "2px 8px", borderRadius: 4, background: "#7c3aed", color: "#fff", fontSize: 11, fontWeight: 600 }}>{s.badge}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{s.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {strategy === "active_learning" && (
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #7c3aed30" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <Target size={16} /> 主动学习策略配置
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>选择采样策略以最大化每次标注的信息增益</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
                  {ACTIVE_LEARNING_STRATEGIES.map(s => {
                    const Icon = s.icon;
                    const isActive = alStrategy === s.value;
                    return (
                      <div key={s.value} onClick={() => setAlStrategy(s.value)} style={{
                        padding: "14px", borderRadius: 8, border: "2px solid",
                        borderColor: isActive ? s.color : "#e2e8f0",
                        background: isActive ? `${s.color}08` : "#fff",
                        cursor: "pointer", textAlign: "center", transition: "all 0.15s"
                      }}>
                        <Icon size={20} color={isActive ? s.color : "#94a3b8"} style={{ marginBottom: 6 }} />
                        <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? s.color : "#64748b", marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>{s.detail}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>每轮标注数量</label>
                    <input type="number" value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>每轮让标注人员标注多少条数据后重新训练</div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>目标标注数量</label>
                    <input type="number" value={targetLabelCount} onChange={e => setTargetLabelCount(Number(e.target.value))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>主动学习预计比随机减少 50%~70% 标注量</div>
                  </div>
                </div>
              </div>
            )}

            {strategy === "confidence_filter" && (
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #05966930" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#059669", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                  <Shield size={16} /> 置信度阈值配置
                </h3>
                <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>配置置信度阈值，决定哪些数据自动通过、哪些送审</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>高置信度阈值</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="range" min="0.7" max="0.98" step="0.01" value={highConfThreshold} onChange={e => setHighConfThreshold(Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#059669", minWidth: 48, textAlign: "right" }}>{(highConfThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>≥ 此阈值 → AI 自动通过，无需人工审核</div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>低置信度阈值</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <input type="range" min="0.3" max="0.7" step="0.01" value={lowConfThreshold} onChange={e => setLowConfThreshold(Number(e.target.value))} style={{ flex: 1 }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#d97706", minWidth: 48, textAlign: "right" }}>{(lowConfThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>≤ 此阈值 → 重点审核，标注人员需仔细确认</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, padding: "12px 16px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                  <div style={{ fontSize: 12, color: "#166534", marginBottom: 8 }}><strong>置信度分布预览（模型: {selectedModelInfo?.name || "未选择"}）</strong></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 12 }}>
                    <div style={{ padding: "8px 12px", background: "#dcfce7", borderRadius: 6, textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#15803d" }}>{(highConfThreshold * 100).toFixed(0)}%+</div>
                      <div style={{ color: "#64748b" }}>自动通过 ~{Math.round(targetLabelCount * (1 - lowConfThreshold)).toLocaleString()}条</div>
                    </div>
                    <div style={{ padding: "8px 12px", background: "#fef9c3", borderRadius: 6, textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#ca8a04" }}>{lowConfThreshold * 100}%-{highConfThreshold * 100}%</div>
                      <div style={{ color: "#64748b" }}>待审核 ~{Math.round(targetLabelCount * (highConfThreshold - lowConfThreshold)).toLocaleString()}条</div>
                    </div>
                    <div style={{ padding: "8px 12px", background: "#fee2e2", borderRadius: 6, textAlign: "center" }}>
                      <div style={{ fontWeight: 700, color: "#dc2626" }}>&lt;{lowConfThreshold * 100}%</div>
                      <div style={{ color: "#64748b" }}>重点审核 ~{Math.round(targetLabelCount * lowConfThreshold).toLocaleString()}条</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: 审核配置 */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>审核工作流配置</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={autoApproveHighConf} onChange={e => setAutoApproveHighConf(e.target.checked)} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>高置信度结果自动审核通过</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>置信度 ≥ {(highConfThreshold * 100).toFixed(0)}% 的结果无需人工确认，直接计入最终数据集</div>
                  </div>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>低置信度结果发送仲裁</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>置信度 ≤ {(lowConfThreshold * 100).toFixed(0)}% 的结果由两名标注人员独立标注后取一致结果</div>
                  </div>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>每日生成质量报告</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>自动统计每日标注量、通过率、返工率等关键指标</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 预估效果 */}
            <div style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", borderRadius: 12, padding: 24, border: "1px solid #c4b5fd" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#7c3aed", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <BarChart3 size={16} /> 预估效果
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { label: "数据总量", value: targetLabelCount.toLocaleString(), color: "#1e293b" },
                  { label: "AI 预标注", value: strategy === "active_learning" ? `${(0.6 * 100).toFixed(0)}%` : "100%", color: "#7c3aed" },
                  { label: "需人工审核", value: `${Math.round(targetLabelCount * (strategy === "active_learning" ? 0.2 : 0.3)).toLocaleString()}条`, color: "#d97706" },
                  { label: "节省标注量", value: strategy === "active_learning" ? "~60%" : "~0%", color: "#16a34a" },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fff", borderRadius: 8, padding: "12px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 底部按钮 */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            style={{ padding: "10px 24px", borderRadius: 8, background: step === 1 ? "#f1f5f9" : "#fff", color: step === 1 ? "#94a3b8" : "#475569", border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, cursor: step === 1 ? "not-allowed" : "pointer" }}
          >
            ← 上一步
          </button>
          {step < totalSteps ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!jobName || !datasetId || !selectedModel)}
              style={{ padding: "10px 24px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              下一步 <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              style={{ padding: "10px 24px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              <CheckCircle2 size={16} /> 创建智能标注任务
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
