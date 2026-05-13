"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, CheckCircle2, ChevronRight, Users, GitCompare, Shield, AlertTriangle } from "lucide-react";

const DATA_TYPES = [
  { value: "image", label: "图片" },
  { value: "text",  label: "文本" },
  { value: "video", label: "视频" },
  { value: "audio", label: "音频" },
];

// 各数据类型对应的标注类型
const ANNOTATION_TYPES: Record<string, { value: string; label: string; desc: string; preview: string }[]> = {
  image: [
    { value: "image_classify",  label: "图片分类",  desc: "识别图片所属分类", preview: "🏷️" },
    { value: "object_detect",   label: "目标检测",  desc: "识别图片中的目标位置", preview: "🎯" },
    { value: "image_seg",       label: "语义分割",  desc: "对图片像素级分类", preview: "🖌️" },
    { value: "ocr",             label: "OCR识别",   desc: "识别图片中的文字", preview: "📝" },
  ],
  text: [
    { value: "text_classify",   label: "文本分类",  desc: "对文本进行分类标注", preview: "📂" },
    { value: "ner",             label: "实体识别",  desc: "标注文本中的命名实体", preview: "🔍" },
    { value: "relation",        label: "关系抽取",  desc: "标注实体间的关系", preview: "🔗" },
    { value: "sentiment",       label: "情感分析",  desc: "标注文本的情感倾向", preview: "💬" },
    { value: "qa",              label: "问答标注",  desc: "标注问题与答案对", preview: "❓" },
  ],
  video: [
    { value: "video_classify",  label: "视频分类",  desc: "对视频片段分类", preview: "🎬" },
    { value: "action_detect",   label: "行为检测",  desc: "检测视频中的行为动作", preview: "🏃" },
    { value: "video_seg",       label: "视频分割",  desc: "对视频帧进行分割", preview: "✂️" },
  ],
  audio: [
    { value: "audio_classify",  label: "音频分类",  desc: "对音频内容分类", preview: "🎵" },
    { value: "asr",             label: "语音识别",  desc: "将语音转为文字", preview: "🎙️" },
    { value: "emotion",         label: "情绪识别",  desc: "识别音频情绪", preview: "😊" },
  ],
};

// 各标注类型对应的模板
const TEMPLATES: Record<string, { value: string; label: string }[]> = {
  image_classify: [{ value: "single_label", label: "单图单标签" }, { value: "multi_label", label: "单图多标签" }],
  object_detect:  [{ value: "bbox",         label: "矩形框检测" }, { value: "polygon", label: "多边形检测" }],
  image_seg:      [{ value: "semantic_seg", label: "语义分割" },   { value: "instance_seg", label: "实例分割" }],
  ocr:            [{ value: "word_ocr",     label: "单词识别" },   { value: "line_ocr", label: "行识别" }],
  text_classify:  [{ value: "single_label", label: "单标签分类" }, { value: "multi_label", label: "多标签分类" }],
  ner:            [{ value: "span_ner",     label: "片段标注" },   { value: "token_ner", label: "Token标注" }],
  relation:       [{ value: "pair_rel",     label: "实体对关系" }, { value: "triple_rel", label: "三元组" }],
  sentiment:      [{ value: "3class",       label: "三分类" },     { value: "5class", label: "五分类" }],
  qa:             [{ value: "extractive",   label: "抽取式QA" },   { value: "abstractive", label: "生成式QA" }],
  video_classify: [{ value: "single_label", label: "单标签" },     { value: "multi_label", label: "多标签" }],
  action_detect:  [{ value: "temporal",     label: "时序检测" },   { value: "spatial", label: "空间检测" }],
  video_seg:      [{ value: "frame_seg",    label: "帧级分割" },   { value: "clip_seg", label: "片段分割" }],
  audio_classify: [{ value: "single_label", label: "单标签" },     { value: "multi_label", label: "多标签" }],
  asr:            [{ value: "word_asr",     label: "词级转写" },   { value: "sentence_asr", label: "句级转写" }],
  emotion:        [{ value: "basic_emo",    label: "基础情绪" },   { value: "valence_emo", label: "效价维度" }],
};

const MOCK_DATASETS = ["客服对话语料_v1", "产品图片集_v2", "评论语料库_v1", "交通监控数据集", "新闻语料_v1", "语音数据集_v1"];

const STORAGE_KEY = "taskforge_annotation_jobs";
function getJobs() {
  if (typeof window === "undefined") return [];
  const d = localStorage.getItem(STORAGE_KEY);
  return d ? JSON.parse(d) : [];
}
function saveJobs(jobs: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

export default function CreateAnnotationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    dataset_id: "",
    dataset_name: "",
    data_type: "image",
    ann_type: "",
    template: "",
    storage: "platform",  // platform | cloud
    storage_platform: "",
    storage_dir: "",
    annotators: "",
    version: "V1",
    // 新增：标注模式
    annotation_mode: "full_coverage", // full_coverage | double_blind
    annotator_count: 2,              // 双盲模式下每个条目的标注人数
    coverage_rate: 100,              // 全员标注覆盖率
  });

  const annTypes = ANNOTATION_TYPES[form.data_type] || [];
  const templates = TEMPLATES[form.ann_type] || [];

  const handleSubmit = () => {
    if (!form.name || !form.dataset_name || !form.ann_type) {
      alert("请填写必填项");
      return;
    }
    const newJob = {
      id: `aj-${Date.now()}`,
      name: form.name,
      dataset_id: form.dataset_id || `ds-${Date.now()}`,
      dataset_name: form.dataset_name,
      annotators: form.annotators.split(",").map(s => s.trim()).filter(Boolean),
      total_items: 0,
      completed_items: 0,
      kappa_score: undefined,
      status: "pending",
      task_type: annTypes.find(t => t.value === form.ann_type)?.label || form.ann_type,
      label_template: form.ann_type,
      created_at: new Date().toISOString(),
    };
    const existing = getJobs();
    saveJobs([newJob, ...existing]);
    router.push("/annotation");
  };

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部导航 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/annotation")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
          <ArrowLeft size={16} /> 返回标注列表
        </button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>新建标注任务</h1>
      </div>

      {/* 步骤指示器 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 32 }}>
        {[{ num: 1, label: "基本信息" }, { num: 2, label: "标注配置" }, { num: 3, label: "存储设置" }].map((s, i) => (
          <div key={s.num} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: step >= s.num ? "#6366f1" : "#e2e8f0", color: step >= s.num ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
              {step > s.num ? <CheckCircle2 size={16} /> : s.num}
            </div>
            <span style={{ fontSize: 13, fontWeight: step === s.num ? 600 : 500, color: step >= s.num ? "#1e293b" : "#94a3b8" }}>{s.label}</span>
            {i < 2 && <ChevronRight size={16} color="#94a3b8" />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {/* Step 1: 基本信息 */}
        {step === 1 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>基本信息</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* 数据集名称 */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  数据集名称 <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="请输入数据集名称"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              {/* 数据类型：图片/文本/视频/音频 */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
                  数据类型 <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 0, border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden" }}>
                  {DATA_TYPES.map(t => (
                    <button
                      key={t.value}
                      onClick={() => setForm(f => ({ ...f, data_type: t.value, ann_type: "", template: "" }))}
                      style={{
                        flex: 1, padding: "10px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                        background: form.data_type === t.value ? "#6366f1" : "#fff",
                        color: form.data_type === t.value ? "#fff" : "#64748b",
                        borderRight: "1px solid #e2e8f0",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 数据集版本 */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  数据集版本
                </label>
                <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, fontWeight: 700, color: "#6366f1" }}>
                  {form.version}
                </div>
              </div>

              {/* 关联数据集 */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  关联数据集
                </label>
                <select
                  value={form.dataset_name}
                  onChange={e => setForm(f => ({ ...f, dataset_name: e.target.value }))}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff" }}
                >
                  <option value="">选择关联数据集</option>
                  {MOCK_DATASETS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              {/* 标注人员 */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  标注人员 <span style={{ fontSize: 11, color: "#94a3b8" }}>（逗号分隔）</span>
                </label>
                <input
                  value={form.annotators}
                  onChange={e => setForm(f => ({ ...f, annotators: e.target.value }))}
                  placeholder="张三, 李四, 王五"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              {/* 标注模式 */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                  标注模式
                </label>
                <div style={{ display: "flex", gap: 12 }}>
                  {/* 全员标注 */}
                  <div
                    onClick={() => setForm(f => ({ ...f, annotation_mode: "full_coverage" }))}
                    style={{
                      flex: 1, padding: "16px 18px", borderRadius: 10, border: "2px solid",
                      borderColor: form.annotation_mode === "full_coverage" ? "#6366f1" : "#e2e8f0",
                      background: form.annotation_mode === "full_coverage" ? "#eef2ff" : "#fff",
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Users size={16} color={form.annotation_mode === "full_coverage" ? "#6366f1" : "#94a3b8"} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>全员标注</span>
                      {form.annotation_mode === "full_coverage" && <CheckCircle2 size={14} color="#6366f1" style={{ marginLeft: "auto" }} />}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                      每个标注人员标注全部数据，可计算 Kappa 一致性，用于质量评估
                    </div>
                    {form.annotation_mode === "full_coverage" && (
                      <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: 6 }}>
                        <label style={{ fontSize: 11, color: "#64748b", marginBottom: 4, display: "block" }}>覆盖率</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[20, 50, 100].map(r => (
                            <button key={r} onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, coverage_rate: r })); }}
                              style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: form.coverage_rate === r ? "#6366f1" : "#e2e8f0",
                                background: form.coverage_rate === r ? "#eef2ff" : "#fff", color: form.coverage_rate === r ? "#6366f1" : "#64748b",
                                fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {r}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 双盲标注+仲裁 */}
                  <div
                    onClick={() => setForm(f => ({ ...f, annotation_mode: "double_blind" }))}
                    style={{
                      flex: 1, padding: "16px 18px", borderRadius: 10, border: "2px solid",
                      borderColor: form.annotation_mode === "double_blind" ? "#7c3aed" : "#e2e8f0",
                      background: form.annotation_mode === "double_blind" ? "#f5f3ff" : "#fff",
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <GitCompare size={16} color={form.annotation_mode === "double_blind" ? "#7c3aed" : "#94a3b8"} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>双盲标注 + 仲裁</span>
                      {form.annotation_mode === "double_blind" && <CheckCircle2 size={14} color="#7c3aed" style={{ marginLeft: "auto" }} />}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>
                      每条数据由两名标注人员独立标注，结果不一致时由第三方仲裁，质量最高
                    </div>
                    {form.annotation_mode === "double_blind" && (
                      <div style={{ marginTop: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: 6 }}>
                        <label style={{ fontSize: 11, color: "#64748b", marginBottom: 4, display: "block" }}>每条数据标注人数</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[2, 3].map(n => (
                            <button key={n} onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, annotator_count: n })); }}
                              style={{ flex: 1, padding: "4px 0", borderRadius: 4, border: "1px solid", borderColor: form.annotator_count === n ? "#7c3aed" : "#e2e8f0",
                                background: form.annotator_count === n ? "#f5f3ff" : "#fff", color: form.annotator_count === n ? "#7c3aed" : "#64748b",
                                fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                              {n} 人
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {form.annotation_mode === "double_blind" && (
                  <div style={{ marginTop: 10, padding: "10px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 6, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <AlertTriangle size={14} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.6 }}>
                      <strong>仲裁规则：</strong>每条数据由{form.annotator_count}人独立标注后：结果一致则通过；结果不一致则进入仲裁池，由第三方仲裁人员确认最终标注结果。
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
              <button
                onClick={() => setStep(2)}
                disabled={!form.name}
                style={{ padding: "10px 24px", borderRadius: 8, background: form.name ? "#6366f1" : "#c7d2fe", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: form.name ? "pointer" : "not-allowed" }}
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 标注配置 */}
        {step === 2 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>标注配置</h3>

            {/* 标注类型 */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 12 }}>
                标注类型 <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {annTypes.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, ann_type: t.value, template: "" }))}
                    style={{
                      padding: 16, borderRadius: 10, border: "2px solid",
                      borderColor: form.ann_type === t.value ? "#6366f1" : "#e2e8f0",
                      background: form.ann_type === t.value ? "#eef2ff" : "#fff",
                      cursor: "pointer", textAlign: "left",
                      position: "relative",
                    }}
                  >
                    {form.ann_type === t.value && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, background: "#6366f1", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2 size={12} color="#fff" />
                      </div>
                    )}
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{t.preview}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 标注模板 */}
            {form.ann_type && templates.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                  标注模板 <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div style={{ display: "flex", gap: 16 }}>
                  {templates.map(t => (
                    <label key={t.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="template"
                        value={t.value}
                        checked={form.template === t.value}
                        onChange={() => setForm(f => ({ ...f, template: t.value }))}
                        style={{ accentColor: "#6366f1" }}
                      />
                      <span style={{ fontSize: 13, color: "#374151" }}>{t.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <button onClick={() => setStep(1)} style={{ padding: "10px 24px", borderRadius: 8, background: "#f1f5f9", color: "#64748b", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>上一步</button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.ann_type}
                style={{ padding: "10px 24px", borderRadius: 8, background: form.ann_type ? "#6366f1" : "#c7d2fe", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: form.ann_type ? "pointer" : "not-allowed" }}
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 存储设置 */}
        {step === 3 && (
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 20 }}>存储设置</h3>

            {/* 保存位置 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 10 }}>
                保存位置 <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <div style={{ display: "flex", gap: 24 }}>
                {[{ value: "platform", label: "平台存储" }, { value: "cloud", label: "云存储" }].map(opt => (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="storage"
                      value={opt.value}
                      checked={form.storage === opt.value}
                      onChange={() => setForm(f => ({ ...f, storage: opt.value }))}
                      style={{ accentColor: "#6366f1" }}
                    />
                    <span style={{ fontSize: 13, color: "#374151" }}>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 存储平台（云存储时显示） */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                存储平台 <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <select
                value={form.storage_platform}
                onChange={e => setForm(f => ({ ...f, storage_platform: e.target.value }))}
                disabled={form.storage === "platform"}
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: form.storage === "platform" ? "#f8fafc" : "#fff", color: form.storage === "platform" ? "#94a3b8" : "#1e293b" }}
              >
                <option value="">选择存储平台</option>
                {["阿里OSS", "腾讯COS", "华为OBS", "百度BOS", "MinIO"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* 存储目录 */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                存储目录 <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                value={form.storage_dir}
                onChange={e => setForm(f => ({ ...f, storage_dir: e.target.value }))}
                placeholder="请输入存储目录，可多级"
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}
              />
            </div>

            {/* 创建摘要 */}
            <div style={{ background: "#f8fafc", borderRadius: 10, padding: 16, marginBottom: 24, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 12 }}>创建摘要</div>
              {[
                { label: "任务名称", value: form.name },
                { label: "数据类型", value: DATA_TYPES.find(t => t.value === form.data_type)?.label || "" },
                { label: "标注类型", value: annTypes.find(t => t.value === form.ann_type)?.label || "" },
                { label: "标注模板", value: templates.find(t => t.value === form.template)?.label || "默认" },
                { label: "标注人员", value: form.annotators || "待分配" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", gap: 16, marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#94a3b8", width: 80, flexShrink: 0 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={{ padding: "10px 24px", borderRadius: 8, background: "#f1f5f9", color: "#64748b", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>上一步</button>
              <button
                onClick={handleSubmit}
                style={{ padding: "10px 24px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                <Save size={16} /> 创建任务
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
