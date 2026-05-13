"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles, AlertTriangle } from "lucide-react";

// 各数据类型对应的清洗算子
const CLEANING_RULES: Record<string, {
  label: string;
  icon: string;
  desc: string;
  defaultEnabled: boolean;
}[]> = {
  text: [
    { label: "重复数据去重", icon: "🔁", desc: "移除完全相同或相似度 > 95% 的重复文本", defaultEnabled: true },
    { label: "格式校验", icon: "📄", desc: "检查 JSON/JSONL/CSV 格式是否合规，必填字段是否缺失", defaultEnabled: true },
    { label: "PII 隐私信息检测", icon: "🔒", desc: "自动识别身份证、手机号、银行卡、姓名等个人信息", defaultEnabled: false },
    { label: "脏数据过滤", icon: "🗑️", desc: "过滤乱码、无意义文本（asdfghj）、单字符、纯数字等", defaultEnabled: true },
    { label: "长度异常检测", icon: "📏", desc: "过滤文本长度 < 5 字 或 > 5000 字的数据", defaultEnabled: true },
    { label: "语言检测", icon: "🌐", desc: "检测文本语言，过滤非目标语言的数据（如只需中文）", defaultEnabled: false },
    { label: "类别分布检测", icon: "📊", desc: "检测类别是否严重不均衡，预警某类 > 80% 的情况", defaultEnabled: false },
    { label: "标签质量检测", icon: "🏷️", desc: "检测标签是否合理，移除标签缺失或标签异常的数据", defaultEnabled: false },
  ],
  image: [
    { label: "Hash 去重", icon: "🔁", desc: "计算图片感知 Hash，移除视觉相似图片（相似度 > 90%）", defaultEnabled: true },
    { label: "分辨率校验", icon: "📐", desc: "过滤分辨率低于指定阈值的图片（建议 ≥ 224×224）", defaultEnabled: true },
    { label: "损坏图片检测", icon: "💾", desc: "自动检测并过滤无法正常打开的损坏图片", defaultEnabled: true },
    { label: "宽高比异常", icon: "🖼️", desc: "过滤宽高比严重偏离正常范围（如 1:100）的图片", defaultEnabled: false },
    { label: "纯色/模糊检测", icon: "🎨", desc: "过滤大面积纯色或模糊（信息量极低）的图片", defaultEnabled: false },
    { label: "水印检测", icon: "💧", desc: "检测图片是否带有大面积水印，预警以便后续处理", defaultEnabled: false },
    { label: "格式合规性", icon: "📁", desc: "只保留 jpg/png/webp 等指定格式，过滤其他格式", defaultEnabled: true },
  ],
  video: [
    { label: "Hash 去重", icon: "🔁", desc: "计算视频指纹，移除重复或高度相似的视频", defaultEnabled: true },
    { label: "时长校验", icon: "⏱️", desc: "过滤时长 < 1秒 或 > 30分钟 的异常视频", defaultEnabled: true },
    { label: "损坏视频检测", icon: "💾", desc: "检测视频文件是否损坏或无法正常播放", defaultEnabled: true },
    { label: "分辨率检查", icon: "📺", desc: "过滤分辨率低于指定阈值的视频（如 < 720p）", defaultEnabled: false },
    { label: "编码格式合规", icon: "🎬", desc: "只保留指定编码格式（mp4/avi/mov）的视频", defaultEnabled: false },
    { label: "黑屏/静帧检测", icon: "⬛", desc: "过滤视频开头或结尾的黑屏、纯色静帧片段", defaultEnabled: false },
  ],
  audio: [
    { label: "重复音频去重", icon: "🔁", desc: "移除音频指纹相同或相似的重复音频", defaultEnabled: true },
    { label: "时长校验", icon: "⏱️", desc: "过滤时长 < 1秒 或 > 10分钟 的异常音频", defaultEnabled: true },
    { label: "静音片段检测", icon: "🤫", desc: "检测并标记音频中的长静音片段（静音 > 50%）", defaultEnabled: true },
    { label: "噪声检测", icon: "🔊", desc: "评估音频信噪比，过滤噪声过大的音频", defaultEnabled: false },
    { label: "采样率校验", icon: "🎚️", desc: "只保留指定采样率（如 16000Hz）的音频", defaultEnabled: false },
    { label: "格式合规性", icon: "📁", desc: "只保留 wav/mp3/flac 等指定格式的音频", defaultEnabled: true },
  ],
};

const DATA_TYPES = [
  { value: "text", label: "文本", color: "#1d4ed8" },
  { value: "image", label: "图像", color: "#7c3aed" },
  { value: "video", label: "视频", color: "#db2777" },
  { value: "audio", label: "音频", color: "#d97706" },
];

export default function CreateCleaningPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [jobName, setJobName] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [dataType, setDataType] = useState("text");
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>({});
  const [thresholdConfig, setThresholdConfig] = useState({
    minLength: 5,
    maxLength: 5000,
    minResolution: 224,
    minDuration: 1,
    maxDuration: 600,
    dedupThreshold: 95,
  });
  const [selectedDatasets, setSelectedDatasets] = useState<string[]>([]);

  const rules = CLEANING_RULES[dataType] || [];

  const toggleRule = (label: string) => {
    setEnabledRules(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const enableAll = () => {
    const all: Record<string, boolean> = {};
    rules.forEach(r => { all[r.label] = true; });
    setEnabledRules(all);
  };

  const disableAll = () => setEnabledRules({});

  const enabledCount = Object.values(enabledRules).filter(Boolean).length;

  const handleCreate = () => {
    const newJob = {
      id: `cl-${Date.now()}`,
      name: jobName,
      dataset_id: datasetId,
      dataset_name: "客服意图识别数据集",
      data_type: dataType,
      rules: rules.filter(r => enabledRules[r.label]).map(r => r.label),
      total_items: 15000,
      passed_items: Math.round(15000 * (enabledCount > 3 ? 0.88 : 0.92)),
      removed_items: Math.round(15000 * (enabledCount > 3 ? 0.12 : 0.08)),
      removed_rate: `${(enabledCount > 3 ? 12 : 8).toFixed(1)}%`,
      status: "idle",
      report: { duplicates: 320, format_errors: 180, pii_found: 45, dirty_data: 435, length_outliers: 100 },
      created_at: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("taskforge_cleaning_jobs") || "[]");
    localStorage.setItem("taskforge_cleaning_jobs", JSON.stringify([newJob, ...existing]));
    router.push("/data-cleaning");
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <button onClick={() => router.push("/data-cleaning")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
          <ArrowLeft size={16} /> 返回
        </button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <Sparkles size={20} color="#059669" />
          新建数据清洗任务
        </h1>
      </div>

      {/* 步骤 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
        {["基础配置", "选择数据集", "配置清洗算子"].map((label, i) => {
          const idx = i + 1;
          const isActive = idx === step;
          const isDone = idx < step;
          return (
            <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: isDone ? "#059669" : isActive ? "#d1fae5" : "#f1f5f9",
                  color: isDone ? "#fff" : isActive ? "#059669" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, border: isActive ? "2px solid #059669" : "none", transition: "all 0.2s",
                }}>
                  {isDone ? <CheckCircle2 size={16} /> : idx}
                </div>
                <span style={{ fontSize: 12, color: isActive ? "#059669" : "#94a3b8", fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </div>
              {i < 2 && <div style={{ flex: 1, height: 2, background: isDone ? "#059669" : "#e2e8f0", margin: "0 8px", marginBottom: 18 }} />}
            </div>
          );
        })}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Step 1: 基础配置 */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>任务基础信息</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>清洗任务名称 <span style={{ color: "#dc2626" }}>*</span></label>
                  <input value={jobName} onChange={e => setJobName(e.target.value)} placeholder="如：客服语料-文本清洗" style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>选择清洗数据集</label>
                  <select value={datasetId} onChange={e => setDatasetId(e.target.value)} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff" }}>
                    <option value="">选择数据集</option>
                    <option value="ds-1">客服意图识别数据集 (15,800条)</option>
                    <option value="ds-3">情感分析语料库 (12,000条)</option>
                    <option value="ds-2">产品分类图像集 (8,500条)</option>
                    <option value="ds-4">语音指令识别集 (4,200条)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>选择数据类型</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 16px" }}>不同数据类型对应不同的清洗算子组合</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {DATA_TYPES.map(t => (
                  <div key={t.value} onClick={() => {
                    setDataType(t.value);
                    setEnabledRules({});
                  }} style={{
                    padding: "16px", borderRadius: 10, border: "2px solid",
                    borderColor: dataType === t.value ? t.color : "#e2e8f0",
                    background: dataType === t.value ? `${t.color}08` : "#fff",
                    cursor: "pointer", textAlign: "center", transition: "all 0.15s"
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{t.value === "text" ? "📝" : t.value === "image" ? "🖼️" : t.value === "video" ? "🎬" : "🎵"}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: dataType === t.value ? t.color : "#64748b" }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{CLEANING_RULES[t.value]?.length || 0} 个算子</div>
                    {dataType === t.value && <CheckCircle2 size={14} color={t.color} style={{ margin: "6px auto 0" }} />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 选择数据集（确认） */}
        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>确认清洗范围</h3>
            <div style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>将对以下数据集执行清洗：</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>客服意图识别数据集</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>数据量：15,800 条 &nbsp;|&nbsp; 类型：文本 &nbsp;|&nbsp; 格式：JSONL</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef3c7", borderRadius: 6, border: "1px solid #fcd34d" }}>
              <AlertTriangle size={14} color="#d97706" />
              <div style={{ fontSize: 12, color: "#92400e" }}>清洗操作会生成新版本数据集，不会修改原始数据</div>
            </div>
          </div>
        )}

        {/* Step 3: 配置清洗算子 */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>选择清洗算子</h3>
                  <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0" }}>
                    已选择 <strong style={{ color: "#059669" }}>{enabledCount}</strong> / {rules.length} 个算子
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={enableAll} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>全选</button>
                  <button onClick={disableAll} style={{ padding: "6px 12px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#fff", fontSize: 12, cursor: "pointer" }}>清空</button>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {rules.map((rule, i) => (
                  <div
                    key={rule.label}
                    onClick={() => toggleRule(rule.label)}
                    style={{
                      padding: "14px 16px", borderRadius: 8, border: "1px solid",
                      borderColor: enabledRules[rule.label] ? "#059669" : "#e2e8f0",
                      background: enabledRules[rule.label] ? "#f0fdf4" : "#fff",
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                      transition: "all 0.15s"
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, border: "2px solid",
                      borderColor: enabledRules[rule.label] ? "#059669" : "#cbd5e1",
                      background: enabledRules[rule.label] ? "#059669" : "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, transition: "all 0.15s"
                    }}>
                      {enabledRules[rule.label] && <CheckCircle2 size={12} color="#fff" />}
                    </div>
                    <div style={{ fontSize: 18, flexShrink: 0 }}>{rule.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 2 }}>{rule.label}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{rule.desc}</div>
                    </div>
                    {rule.defaultEnabled && (
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#f0fdf4", color: "#059669", fontWeight: 600 }}>推荐</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 阈值配置 */}
            {dataType === "text" && (
              <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>阈值配置</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, display: "block" }}>文本最小长度（字）</label>
                    <input type="number" value={thresholdConfig.minLength} onChange={e => setThresholdConfig(p => ({ ...p, minLength: Number(e.target.value) }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, display: "block" }}>文本最大长度（字）</label>
                    <input type="number" value={thresholdConfig.maxLength} onChange={e => setThresholdConfig(p => ({ ...p, maxLength: Number(e.target.value) }))} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6, display: "block" }}>去重相似度阈值（%）</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <input type="range" min="80" max="100" value={thresholdConfig.dedupThreshold} onChange={e => setThresholdConfig(p => ({ ...p, dedupThreshold: Number(e.target.value) }))} style={{ flex: 1 }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#059669", minWidth: 36 }}>{thresholdConfig.dedupThreshold}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 预估报告 */}
            <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 20, border: "1px solid #6ee7b7" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 12 }}>📊 预估清洗效果</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {[
                  { label: "数据总量", value: "15,800 条" },
                  { label: "启用算子", value: `${enabledCount} 个` },
                  { label: "预估通过", value: `${Math.round(15000 * (enabledCount > 3 ? 0.88 : 0.92)).toLocaleString()} 条` },
                  { label: "预估过滤", value: `${Math.round(15000 * (enabledCount > 3 ? 0.12 : 0.08)).toLocaleString()} 条` },
                ].map(s => (
                  <div key={s.label} style={{ background: "#fff", borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#065f46" }}>{s.value}</div>
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
          >← 上一步</button>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 && (!jobName || !datasetId)}
              style={{ padding: "10px 24px", borderRadius: 8, background: "#059669", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              下一步 <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={enabledCount === 0}
              style={{ padding: "10px 24px", borderRadius: 8, background: enabledCount === 0 ? "#cbd5e1" : "#059669", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: enabledCount === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
            >
              <CheckCircle2 size={16} /> 执行清洗（{enabledCount} 个算子）
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
