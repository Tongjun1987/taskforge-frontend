"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, CheckCircle2, AlertCircle, Clock, AlertTriangle,
  FileUp, Server, Cloud, Layers, Globe
} from "lucide-react";
import { DATA_TYPES, SOURCE_TYPES, TYPE_SPECIFIC_FIELDS } from "../../_shared";
import { MOCK_DATASETS, STORAGE_KEY, TRAFFIC_SCENE_DATASETS } from "../../_mock";

function getDatasets() {
  if (typeof window === "undefined") return [...MOCK_DATASETS, ...TRAFFIC_SCENE_DATASETS];
  const d = localStorage.getItem(STORAGE_KEY);
  // localStorage 为空时 fallback 到 Mock 数据
  const saved = d ? JSON.parse(d) : [];
  if (!d || saved.length === 0) return [...MOCK_DATASETS, ...TRAFFIC_SCENE_DATASETS];
  return saved;
}
function saveDatasets(data: any[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export default function EditDatasetPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [dataset, setDataset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const all = getDatasets();
    const found = all.find((d: any) => d.id === id);
    if (found) {
      setDataset(found);
      setForm({
        name: found.name,
        task_name: found.task_name,
        description: found.description || "",
        source_type: found.source_type,
        source_name: found.source_name,
        quality_status: found.quality_status,
        ...(found.type_meta || {}),
      });
    }
    setLoading(false);
  }, [id]);

  if (loading) return null;
  if (!dataset) return (
    <main style={{ padding: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, color: "#64748b" }}>
      <AlertCircle size={48} color="#cbd5e1" />
      <p style={{ fontSize: 16 }}>数据集不存在或已被删除</p>
      <button onClick={() => router.back()} style={{ padding: "8px 20px", background: "#1e293b", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>返回列表</button>
    </main>
  );

  const typeInfo = DATA_TYPES.find(t => t.value === dataset.type);
  const TypeIcon = typeInfo?.icon;
  const extraFields = TYPE_SPECIFIC_FIELDS[dataset.type] || [];

  const handleSave = () => {
    const all = getDatasets();
    const updated = all.map((d: any) => d.id === id ? {
      ...d,
      name: form.name,
      task_name: form.task_name,
      description: form.description,
      source_type: form.source_type,
      source_name: form.source_name,
      quality_status: form.quality_status,
      type_meta: Object.fromEntries(extraFields.map(f => [f.name, form[f.name] || ""])),
    } : d);
    saveDatasets(updated);
    setSaved(true);
    setTimeout(() => router.push("/data-asset/dataset"), 1000);
  };

  const Field = ({ label, name, type, options, required }: { label: string; name: string; type?: string; options?: string[]; required?: boolean }) => (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {type === "select" || options ? (
        <select
          value={form[name] || ""}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, background: "#fff" }}
        >
          <option value="">请选择</option>
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={form[name] || ""}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13 }}
        />
      )}
    </div>
  );

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#f8fafc", minHeight: "100vh" }}>
      {/* 顶部导航 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.push("/data-asset/dataset")} style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>
          <ArrowLeft size={16} /> 返回列表
        </button>
        <div style={{ width: 1, height: 20, background: "#e2e8f0" }} />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {TypeIcon && <TypeIcon size={20} color={typeInfo?.color} />}
          编辑数据集
        </h1>
        <span style={{ padding: "3px 10px", borderRadius: 20, background: `${typeInfo?.color}15`, color: typeInfo?.color, fontSize: 12, fontWeight: 600 }}>
          {typeInfo?.label}
        </span>
      </div>

      <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
        {/* 基本信息 */}
        <section style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>基本信息</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="数据集名称" name="name" required />
            <Field label="关联任务" name="task_name" type="select" options={["意图识别v2.1", "商品分类", "情感分析v1.0", "语音指令", "视频理解v1.0", "多模态理解", "对话系统v2.0", "知识抽取", "语义检索v1.0", "LLM指令微调"]} required />
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#475569", marginBottom: 6 }}>数据集描述</label>
              <textarea
                value={form.description || ""}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                placeholder="描述数据集的用途和特点..."
              />
            </div>
          </div>
        </section>

        {/* 数据来源 */}
        <section style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0" }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #f1f5f9" }}>数据来源</h3>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {SOURCE_TYPES.map(t => (
              <button key={t.value} onClick={() => setForm(f => ({ ...f, source_type: t.value }))}
                style={{ padding: "8px 14px", borderRadius: 6, border: "2px solid", borderColor: form.source_type === t.value ? t.color : "#e2e8f0", background: form.source_type === t.value ? `${t.color}10` : "#fff", color: form.source_type === t.value ? t.color : "#64748b", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="数据源名称" name="source_name" />
            <Field label="质量状态" name="quality_status" type="select" options={["passed", "failed", "pending"]} />
          </div>
        </section>

        {/* 类型专属配置 */}
        {extraFields.length > 0 && (
          <section style={{ background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${typeInfo?.color}30` }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: typeInfo?.color, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${typeInfo?.color}20`, display: "flex", alignItems: "center", gap: 8 }}>
              {TypeIcon && <TypeIcon size={16} />}
              {typeInfo?.label}数据配置
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {extraFields.map(f => (
                <Field key={f.name} label={f.label} name={f.name} type={f.type} options={f.options} />
              ))}
            </div>
          </section>
        )}

        {/* 保存按钮 */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button onClick={() => router.push("/data-asset/dataset")} style={{ padding: "10px 24px", borderRadius: 8, background: "#f1f5f9", color: "#64748b", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>取消</button>
          <button onClick={handleSave} style={{ padding: "10px 24px", borderRadius: 8, background: saved ? "#10b981" : "#8b5cf6", color: "#fff", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {saved ? <><CheckCircle2 size={16} /> 已保存</> : <><Save size={16} /> 保存修改</>}
          </button>
        </div>
      </div>
    </main>
  );
}
