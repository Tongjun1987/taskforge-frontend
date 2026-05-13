"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Database, X, Upload, Image, FileText, Video, Music, Box, Brain,
  Sparkles, Cpu, BookOpen, Cloud, FileUp, Server, Globe, Layers,
  CheckCircle2, AlertCircle, Clock, ArrowLeft, Eye, EyeOff, Save
} from "lucide-react";

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
];

const SOURCE_TYPES = [
  { value: "local", label: "本地文件", icon: FileUp, color: "#6366f1" },
  { value: "server", label: "文件服务器", icon: Server, color: "#8b5cf6" },
  { value: "cloud", label: "云平台", icon: Cloud, color: "#3b82f6" },
  { value: "platform", label: "平台数据", icon: Layers, color: "#10b981" },
  { value: "public", label: "公开数据", icon: Globe, color: "#f59e0b" },
];

const TASK_SUGGESTIONS = [
  "意图识别", "情感分析", "文本分类", "OCR识别", "目标检测",
  "图像分割", "语音识别", "视频理解", "多模态理解", "问答系统",
];

interface FormData {
  name: string;
  type: string;
  source_type: string;
  source_name: string;
  task_name: string;
  item_count: string;
  tags: string[];
  permission: string;
  md5_dedup: boolean;
  import_format: string[];
  note: string;
}

export default function CreateDatasetPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    name: "",
    type: "text",
    source_type: "local",
    source_name: "",
    task_name: "",
    item_count: "",
    tags: [],
    permission: "private",
    md5_dedup: true,
    import_format: [],
    note: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  };

  const canNext = step === 1
    ? form.name.trim() && form.type && form.task_name.trim()
    : true;

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      router.push("/data-asset/data-access");
    }, 800);
  };

  return (
    <main style={{
      minHeight: "100vh", background: "#f8fafc", color: "#1e293b",
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #e2e8f0", padding: "16px 28px",
        display: "flex", alignItems: "center", gap: 12,
        background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        <button
          onClick={() => router.push("/data-asset/data-access")}
          style={{
            background: "none", border: "1px solid #e2e8f0", borderRadius: 6,
            color: "#64748b", cursor: "pointer", padding: "6px 12px",
            fontSize: 13, display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <ArrowLeft size={14} />返回列表
        </button>
        <div style={{ height: 20, width: 1, background: "#e2e8f0" }} />
        <h1 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          新建数据集
        </h1>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 28px" }}>
        {/* Step Indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, position: "relative" }}>
          {[
            { num: 1, label: "基本信息" },
            { num: 2, label: "导入配置" },
            { num: 3, label: "确认创建" },
          ].map(({ num, label }, idx) => (
            <React.Fragment key={num}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", border: `2px solid`,
                  borderColor: step >= num ? "#3b82f6" : "#e2e8f0",
                  background: step >= num ? "#eff6ff" : "#f8fafc",
                  color: step >= num ? "#2563eb" : "#94a3b8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 700, fontSize: 13, marginBottom: 8,
                }}>
                  {step > num ? <CheckCircle2 size={16} /> : num}
                </div>
                <span style={{ fontSize: 12, color: step >= num ? "#475569" : "#94a3b8" }}>{label}</span>
              </div>
              {idx < 2 && (
                <div style={{
                  flex: 1, height: 2, background: step > num + 1 ? "#3b82f6" : "#e2e8f0",
                  marginTop: 15, alignSelf: "flex-start", marginLeft: -1, marginRight: -1,
                }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Section title="数据集名称" required>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="例如：客服意图识别数据集 v1.0"
                style={inputStyle}
              />
            </Section>

            <Section title="数据任务" required>
              <input
                value={form.task_name}
                onChange={e => setForm(f => ({ ...f, task_name: e.target.value }))}
                placeholder="所属任务名称"
                style={inputStyle}
              />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {TASK_SUGGESTIONS.map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, task_name: t }))}
                    style={{
                      padding: "3px 10px", borderRadius: 20, border: "1px solid",
                      borderColor: form.task_name === t ? "#3b82f6" : "#e2e8f0",
                      background: form.task_name === t ? "#eff6ff" : "#fff",
                      color: form.task_name === t ? "#2563eb" : "#64748b",
                      fontSize: 11, cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="数据类型" required>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {DATA_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setForm(f => ({ ...f, type: value }))}
                    style={{
                      padding: "10px 8px", borderRadius: 8, border: "1px solid",
                      borderColor: form.type === value ? color : "#e2e8f0",
                      background: form.type === value ? `${color}10` : "#fff",
                      color: form.type === value ? color : "#64748b",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 6, fontSize: 11,
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="标签">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                {form.tags.map(tag => (
                  <span key={tag} style={{
                    padding: "3px 10px", borderRadius: 20, background: "#eff6ff",
                    color: "#3b82f6", fontSize: 12, display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {tag}
                    <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addTag()}
                  placeholder="输入标签后按回车添加"
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addTag} style={btnStyle("outline")}>添加</button>
              </div>
            </Section>

            <Section title="权限">
              <div style={{ display: "flex", gap: 8 }}>
                {[
                  { value: "private", label: "私有", desc: "仅自己可见" },
                  { value: "team", label: "团队", desc: "团队成员可用" },
                  { value: "public", label: "公开", desc: "平台所有项目可用" },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    onClick={() => setForm(f => ({ ...f, permission: value }))}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid",
                      borderColor: form.permission === value ? "#3b82f6" : "#e2e8f0",
                      background: form.permission === value ? "#eff6ff" : "#fff",
                      color: form.permission === value ? "#2563eb" : "#64748b",
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 11, marginTop: 2, color: "#94a3b8" }}>{desc}</div>
                  </button>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Step 2: Import Config */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Section title="数据来源">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {SOURCE_TYPES.map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => setForm(f => ({ ...f, source_type: value }))}
                    style={{
                      padding: "10px 8px", borderRadius: 8, border: "1px solid",
                      borderColor: form.source_type === value ? color : "#e2e8f0",
                      background: form.source_type === value ? `${color}10` : "#fff",
                      color: form.source_type === value ? color : "#64748b",
                      cursor: "pointer", display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 6, fontSize: 11,
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title="来源名称">
              <input
                value={form.source_name}
                onChange={e => setForm(f => ({ ...f, source_name: e.target.value }))}
                placeholder="例如：生产环境OSS、腾讯COS、HuggingFace"
                style={inputStyle}
              />
            </Section>

            <Section title="预估数据量">
              <input
                value={form.item_count}
                onChange={e => setForm(f => ({ ...f, item_count: e.target.value }))}
                placeholder="预计导入的数据条数"
                style={inputStyle}
              />
            </Section>

            <Section title="数据质量">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  onClick={() => setForm(f => ({ ...f, md5_dedup: !f.md5_dedup }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                    background: form.md5_dedup ? "#3b82f6" : "#334155",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3,
                    left: form.md5_dedup ? 23 : 3,
                    transition: "left 0.2s",
                  }} />
                </button>
                <span style={{ fontSize: 13, color: "#94a3b8" }}>启用 MD5 去重检测</span>
              </div>
            </Section>

            <Section title="备注">
              <textarea
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                placeholder="数据集描述、数据来源说明等..."
                style={{ ...inputStyle, height: 80, resize: "vertical", fontFamily: "inherit" }}
              />
            </Section>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>确认以下信息</div>
              {[
                { label: "数据集名称", value: form.name || "—" },
                { label: "所属任务", value: form.task_name || "—" },
                { label: "数据类型", value: DATA_TYPES.find(t => t.value === form.type)?.label || "—" },
                { label: "数据来源", value: SOURCE_TYPES.find(s => s.value === form.source_type)?.label || "—" },
                { label: "来源名称", value: form.source_name || "—" },
                { label: "权限", value: { private: "私有", team: "团队", public: "公开" }[form.permission] || "—" },
                { label: "MD5 去重", value: form.md5_dedup ? "启用" : "禁用" },
                { label: "标签", value: form.tags.length > 0 ? form.tags.join("、") : "—" },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                  <span style={{ fontSize: 12, color: "#1e293b", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", gap: 12, marginTop: 32, justifyContent: "flex-end" }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} style={btnStyle("outline")}>
              上一步
            </button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext} style={btnStyle("primary", !canNext)}>
              下一步
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} style={btnStyle("primary", submitting)}>
              {submitting ? "创建中..." : "创建数据集"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

function Section({ title, children, required }: { title: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#475569", marginBottom: 8, display: "flex", gap: 4 }}>
        {title}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e2e8f0",
  background: "#fff", color: "#1e293b", fontSize: 13, outline: "none",
  boxSizing: "border-box",
};

function btnStyle(variant: "primary" | "outline", disabled?: boolean) {
  if (variant === "primary") {
    return {
      padding: "9px 24px", borderRadius: 8, border: "none",
      background: disabled ? "#e2e8f0" : "#3b82f6",
      color: disabled ? "#94a3b8" : "#fff",
      fontSize: 13, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer",
    };
  }
  return {
    padding: "9px 24px", borderRadius: 8, border: "1px solid #e2e8f0",
    background: "#fff", color: "#475569",
    fontSize: 13, fontWeight: 600, cursor: "pointer",
  };
}
