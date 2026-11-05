"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X, Package, Upload, Check, FolderTree, FileJson, FileCheck2, FileText,
  Layers, AlertCircle, AlertTriangle, ArrowRight,
} from "lucide-react";

import { C, Tag } from "@/components/production/ui";
import {
  type PackTemplate, type Level, LEVEL_TONE,
  DATASETS, DATA_TYPES, INDUSTRIES, COMMON_META_FIELDS, tplMetaFields, metaByGroup,
} from "./publishData";

// ---------------------------------------------------------------- 选项
const CATEGORIES = ["训练数据集", "评测数据集", "微调数据集", "语料数据集"];
const SUBJECTS = ["企业主体", "个人主体", "政府机构", "设备与物", "研究机构"];
const LEVELS: Level[] = ["公开", "内部", "受限", "核心"];
const UNITS = ["MB", "GB", "TB"];

const PART_ICON: Record<string, React.ReactNode> = {
  目录结构: <FolderTree size={12} />,
  元数据字段: <FileJson size={12} />,
  质量报告: <FileCheck2 size={12} />,
  说明文档: <FileText size={12} />,
  标注规范: <Layers size={12} />,
  脱敏声明: <FileText size={12} />,
  许可协议: <FileText size={12} />,
};

type FormState = {
  name: string;
  category: string;
  modality: string;
  industry: string;
  subject: string;
  domain: string;
  owner: string;
  license: string;
  scale: string;
  unit: string;
  summary: string;
  usageLimit: string;
  hasPii: "是" | "否";
  needsAuth: "是" | "否";
  level: Level;
};

// ---------------------------------------------------------------- 表单原子
function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: C.text, marginBottom: 6 }}>
      {required && <span style={{ color: C.danger, lineHeight: 1 }}>*</span>}
      {text}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "7px 10px", fontSize: 12.5,
  color: C.text, background: "#fff", border: `1px solid ${C.border}`,
  borderRadius: 6, outline: "none",
};

function Select({
  value, onChange, options, placeholder, labels,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  /** value 与展示文案不同时使用 */
  labels?: Record<string, string>;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...inputStyle, color: value ? C.text : C.faint, cursor: "pointer" }}
    >
      <option value="">{placeholder || "请选择"}</option>
      {options.map((o) => (
        <option key={o} value={o} style={{ color: C.text }}>{labels?.[o] || o}</option>
      ))}
    </select>
  );
}

function Radio({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, height: 32 }}>
      {options.map((o) => {
        const on = value === o;
        return (
          <label
            key={o}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12.5,
              color: on ? C.text : C.sub, cursor: "pointer",
            }}
          >
            <span
              onClick={() => onChange(o)}
              style={{
                width: 13, height: 13, borderRadius: "50%",
                border: `1px solid ${on ? C.primary : "#cbd5e1"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#fff", flexShrink: 0,
              }}
            >
              {on && <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary }} />}
            </span>
            <span onClick={() => onChange(o)}>{o}</span>
          </label>
        );
      })}
    </div>
  );
}

function TextArea({
  value, onChange, placeholder, max = 200, rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  rows?: number;
}) {
  return (
    <div style={{ position: "relative" }}>
      <textarea
        value={value}
        rows={rows}
        maxLength={max}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle, resize: "vertical", lineHeight: 1.65,
          paddingBottom: 20, fontFamily: "inherit",
        }}
      />
      <span
        style={{
          position: "absolute", right: 9, bottom: 7, fontSize: 10.5,
          color: value.length >= max ? C.warn : C.faint, pointerEvents: "none",
        }}
      >
        {value.length}/{max}
      </span>
    </div>
  );
}

/** 小节容器 */
function Section({
  step, title, desc, extra, children,
}: {
  step: string;
  title: string;
  desc?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginTop: 16, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
          background: C.bg, borderBottom: `1px solid ${C.border}`,
        }}
      >
        <span
          style={{
            width: 17, height: 17, borderRadius: "50%", background: C.primary,
            color: "#fff", fontSize: 10.5, display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0,
          }}
        >
          {step}
        </span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{title}</span>
        {desc && <span style={{ fontSize: 11, color: C.faint }}>{desc}</span>}
        <div style={{ flex: 1 }} />
        {extra}
      </div>
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------- 表单初值（由数据集对象带入）
function categoryOf(scene: string) {
  if (scene.includes("微调")) return "微调数据集";
  if (scene.includes("问答") || scene.includes("分类")) return "语料数据集";
  return "训练数据集";
}

function scaleParts(scale: string) {
  const m = scale.match(/([\d.]+)\s*([A-Za-z]+)/);
  const unit = m && UNITS.includes(m[2].toUpperCase()) ? m[2].toUpperCase() : "GB";
  return { scale: m ? m[1] : "", unit };
}

function formFromDataset(id: string): FormState {
  const d = DATASETS.find((x) => x.id === id);
  const sp = scaleParts(d?.scale || "");
  const pii = d ? d.tags.some((t) => /隐私|脱敏/.test(t)) : false;
  return {
    name: d?.name || "",
    category: d ? categoryOf(d.scene) : "",
    modality: d?.dataType || "",
    industry: d && INDUSTRIES.includes(d.domain) ? d.domain : "",
    subject: "企业主体",
    domain: d?.scene || "",
    owner: d?.owner || "",
    license: d?.license || "",
    scale: sp.scale,
    unit: sp.unit,
    summary: d?.summary || "",
    usageLimit: d ? (d.license.startsWith("公开") ? "允许公开使用，需标注数据来源" : "限授权范围内使用，禁止对外二次分发") : "",
    hasPii: pii ? "是" : "否",
    needsAuth: d && d.license.includes("授权") ? "是" : "否",
    level: d?.level || "内部",
  };
}

// ================================================================
// 封装数据集弹窗
// ① 数据集对象（选一条已登记数据集）→ ② 数据集信息（同「新建数据集」表单，按对象带入可调整）
// → ③ 模板扩展元数据（按数据类型追加）→ ④ 封装规范（版本 / 随包材料）
// ================================================================
export default function PackDatasetModal({
  tpl, onClose, onSubmit,
}: {
  tpl: PackTemplate;
  onClose: () => void;
  onSubmit: (name: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [srcId, setSrcId] = useState(
    DATASETS.find((d) => d.templateId === tpl.id)?.id || DATASETS[0].id
  );
  const [form, setForm] = useState<FormState>(() => formFromDataset(
    DATASETS.find((d) => d.templateId === tpl.id)?.id || DATASETS[0].id
  ));
  const [parts, setParts] = useState<string[]>(tpl.parts);
  const [doc, setDoc] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const docRef = useRef<HTMLInputElement>(null);
  const extraRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const tplFields = useMemo(() => tplMetaFields(tpl), [tpl]);
  const extraFields = useMemo(
    () => tplFields.filter((f) => f.scope === "模板"),
    [tplFields]
  );

  const src = DATASETS.find((d) => d.id === srcId);

  // 模板扩展元数据（模板带入默认值，用户按实际数据核对修改）
  const [tplValues, setTplValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(extraFields.map((f) => [f.key, f.example]))
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const patch = (p: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...p }));
    setErr("");
  };

  /** 切换数据集对象：表单内容整体换成该数据集已登记的信息 */
  const pickDataset = (id: string) => {
    setSrcId(id);
    setForm(formFromDataset(id));
    setErr("");
  };

  const togglePart = (p: string) =>
    setParts((cur) => (cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]));

  const missing = useMemo(() => {
    const out: string[] = [];
    if (!src) out.push("数据集对象");
    if (!form.name.trim()) out.push("数据集名称");
    if (!form.category) out.push("数据集分类");
    if (!form.modality) out.push("数据模态");
    if (!form.industry) out.push("所属行业");
    if (!form.subject) out.push("数据主体");
    if (!form.domain) out.push("业务领域");
    if (!form.scale.trim()) out.push("数据规模");
    if (!form.owner.trim()) out.push("数据所有者");
    if (!form.summary.trim()) out.push("应用场景说明");
    if (!form.usageLimit.trim()) out.push("使用限制");
    extraFields.forEach((f) => {
      if (f.required && !(tplValues[f.key] || "").trim()) out.push(f.label);
    });
    return out;
  }, [src, form, extraFields, tplValues]);

  const submit = () => {
    if (missing.length > 0) {
      setErr(`请完善必填项：${missing.join("、")}`);
      window.setTimeout(() => {
        if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
      }, 40);
      return;
    }
    onSubmit(form.name.trim());
  };

  if (!mounted) return null;

  const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" };

  return createPortal(
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed", inset: 0, zIndex: 1200, padding: 24,
        background: "rgba(15,23,42,.45)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 800, maxWidth: "100%", maxHeight: "92vh",
          display: "flex", flexDirection: "column",
          background: "#fff", borderRadius: 12, overflow: "hidden",
          boxShadow: "0 24px 64px rgba(15,23,42,.24)",
        }}
      >
        {/* 头部 */}
        <div
          style={{
            display: "flex", alignItems: "flex-start", gap: 10, padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`, flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #10b981, #0ea5e9)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <Package size={16} style={{ color: "#fff" }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>封装数据集</div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>
              以预置模板 {tpl.id} · {tpl.name} 为封装规范，元数据 {tplFields.length} 项（通用 {COMMON_META_FIELDS.length} + 模板扩展 {extraFields.length}）
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              width: 26, height: 26, borderRadius: 6, border: "none", background: "transparent",
              color: C.faint, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 表单体 */}
        <div ref={bodyRef} style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0 20px 20px" }}>
          {/* ① 数据集对象 */}
          <Section
            step="1"
            title="数据集对象"
            desc="选择一条已登记的数据集，表单按它带入"
            extra={<Tag tone={C.info}>必选</Tag>}
          >
            <Select
              value={srcId}
              onChange={pickDataset}
              options={DATASETS.map((d) => d.id)}
              labels={Object.fromEntries(DATASETS.map((d) => [d.id, `${d.id} · ${d.name}`]))}
              placeholder="请选择要封装的数据集"
            />
            {src && (
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 12, marginTop: 10,
                  padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6, background: C.bg,
                }}
              >
                <FolderTree size={14} style={{ color: C.warn, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: C.text, fontWeight: 500 }}>
                    {src.name} <span style={{ fontSize: 11, color: C.faint, fontWeight: 400 }}>· {src.id} · {src.version}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                    {src.domain} / {src.dataType} / {src.scene} · 规模 {src.scale} · 质量总分 {src.quality.score} · 元信息完整度 {src.meta.completeness}%
                  </div>
                </div>
                <Tag tone={LEVEL_TONE[src.level]}>{src.level}</Tag>
              </div>
            )}
            <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.7 }}>
              选择后表单按该数据集的登记内容带入，可按本次封装需要调整；封装只影响本封装版本，不改动数据集管理中的登记信息。
            </div>
          </Section>

          {/* ② 基础元数据 */}
          <Section step="2" title="基础元数据">
            <div style={grid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label text="数据集名称" required />
                <input
                  value={form.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder={`如：${tpl.industry}${tpl.scene}数据集`}
                  style={inputStyle}
                />
              </div>

              <div>
                <Label text="数据集分类" required />
                <Select value={form.category} onChange={(v) => patch({ category: v })} options={CATEGORIES} placeholder="请选择数据集分类" />
              </div>
              <div>
                <Label text="数据模态" required />
                <Select value={form.modality} onChange={(v) => patch({ modality: v })} options={DATA_TYPES} placeholder="请选择数据模态" />
              </div>

              <div>
                <Label text="所属行业" required />
                <Select value={form.industry} onChange={(v) => patch({ industry: v })} options={INDUSTRIES} placeholder="请选择所属行业" />
              </div>
              <div>
                <Label text="数据主体" required />
                <Select value={form.subject} onChange={(v) => patch({ subject: v })} options={SUBJECTS} placeholder="请选择数据主体" />
              </div>

              <div>
                <Label text="业务领域" required />
                <input
                  value={form.domain}
                  onChange={(e) => patch({ domain: e.target.value })}
                  placeholder="如：车路协同 / 行为识别 / 事件研判"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label text="数据规模" required />
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={form.scale}
                    onChange={(e) => patch({ scale: e.target.value.replace(/[^\d.]/g, "") })}
                    placeholder="请输入规模"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <select
                    value={form.unit}
                    onChange={(e) => patch({ unit: e.target.value })}
                    style={{ ...inputStyle, width: 78, flexShrink: 0, cursor: "pointer" }}
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <Label text="数据所有者" required />
                <input
                  value={form.owner}
                  onChange={(e) => patch({ owner: e.target.value })}
                  placeholder="如：智慧交通事业部"
                  style={inputStyle}
                />
              </div>
              <div>
                <Label text="许可协议" />
                <input
                  value={form.license}
                  onChange={(e) => patch({ license: e.target.value })}
                  placeholder="如：内部使用 / 受限使用（需授权）"
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <Label text="应用场景说明" required />
                <TextArea
                  value={form.summary}
                  onChange={(v) => patch({ summary: v })}
                  placeholder="描述数据集内容与应用场景，如覆盖什么数据、可用于哪类模型训练 / 评测"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <Label text="使用限制" required />
                <TextArea
                  value={form.usageLimit}
                  onChange={(v) => patch({ usageLimit: v })}
                  placeholder="如使用范围、授权要求、禁止用途"
                />
              </div>

              <div>
                <Label text="是否涉及个人信息" required />
                <Radio value={form.hasPii} onChange={(v) => patch({ hasPii: v as "是" | "否" })} options={["是", "否"]} />
              </div>
              <div>
                <Label text="是否需要授权" required />
                <Radio value={form.needsAuth} onChange={(v) => patch({ needsAuth: v as "是" | "否" })} options={["是", "否"]} />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <Label text="数据等级" required />
                <div style={{ display: "flex", gap: 6 }}>
                  {LEVELS.map((lv) => {
                    const on = form.level === lv;
                    const tone = LEVEL_TONE[lv];
                    return (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => patch({ level: lv })}
                        style={{
                          flex: 1, padding: "6px 0", fontSize: 12, cursor: "pointer", borderRadius: 6,
                          color: on ? tone : C.sub, fontWeight: on ? 600 : 400,
                          background: on ? `${tone}14` : "#fff",
                          border: `1px solid ${on ? `${tone}66` : C.border}`,
                        }}
                      >
                        {lv}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* ③ 模板扩展元数据 */}
          <Section
            step="3"
            title="模板扩展元数据"
            desc={`由 ${tpl.id} 按「${tpl.dataType}」类型追加 · ${extraFields.length} 项`}
            extra={<Tag tone={C.purple}>模板带入</Tag>}
          >
            <div style={grid}>
              {extraFields.map((f) => (
                <div key={f.key} style={f.type === "长文本" ? { gridColumn: "1 / -1" } : undefined}>
                  <Label text={f.label} required={f.required} />
                  <input
                    value={tplValues[f.key] || ""}
                    onChange={(e) => {
                      setErr("");
                      setTplValues((v) => ({ ...v, [f.key]: e.target.value }));
                    }}
                    placeholder={`如：${f.example}`}
                    style={inputStyle}
                  />
                  <div style={{ fontSize: 10.5, color: C.faint, marginTop: 3, fontFamily: "monospace" }}>{f.key}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* ④ 随包材料 */}
          <Section
            step="4"
            title="随包材料"
            extra={<Tag tone={C.purple}>模板带入</Tag>}
          >
            <div style={grid}>
              <div style={{ gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {tpl.parts.map((p) => {
                    const on = parts.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePart(p)}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "5px 10px", fontSize: 11.5, borderRadius: 5, cursor: "pointer",
                          color: on ? C.primary : C.faint,
                          background: on ? C.primarySoft : "#fff",
                          border: `1px solid ${on ? `${C.primary}55` : C.border}`,
                        }}
                      >
                        {on ? <Check size={11} /> : (PART_ICON[p] || <FileText size={11} />)}
                        {p}
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                  已选 {parts.length} / {tpl.parts.length} 项，随数据集一同打包发布
                </div>
              </div>

              <div>
                <Label text="说明文档" />
                <input
                  ref={docRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => setDoc(e.target.files?.[0]?.name || "")}
                />
                <button type="button" onClick={() => docRef.current?.click()} style={fileBtn}>
                  <Upload size={12} /> {doc ? "重新选择文件" : "选择文件"}
                </button>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 5, lineHeight: 1.6 }}>
                  {doc ? (
                    <span style={{ color: C.text, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <FileText size={11} style={{ color: C.info }} />{doc}
                    </span>
                  ) : (
                    "支持 PDF、Word，单文件不超过 20MB"
                  )}
                </div>
              </div>

              <div>
                <Label text="其他文件" />
                <input
                  ref={extraRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => setExtras(Array.from(e.target.files || []).slice(0, 3).map((f) => f.name))}
                />
                <button type="button" onClick={() => extraRef.current?.click()} style={fileBtn}>
                  <Upload size={12} /> {extras.length ? "重新选择文件" : "选择文件"}
                </button>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 5, lineHeight: 1.6 }}>
                  {extras.length ? (
                    <span style={{ color: C.text, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <FileText size={11} style={{ color: C.info }} />
                      {extras.join("、")}
                    </span>
                  ) : (
                    "最多 3 个文件，单个不超过 20MB"
                  )}
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <Label text="封装目录结构" />
                <div
                  style={{
                    display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
                    padding: "8px 10px", background: C.bg, borderRadius: 6,
                    fontFamily: "monospace", fontSize: 11.5, color: C.sub,
                  }}
                >
                  {["data/", "annotations/", "metadata/", "quality/", "README.md"].map((d, i, arr) => (
                    <React.Fragment key={d}>
                      <span style={{ color: C.text }}>{d}</span>
                      {i < arr.length - 1 && <span style={{ color: C.faint }}>›</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {err && (
            <div
              style={{
                display: "flex", alignItems: "center", gap: 6, marginTop: 14,
                padding: "8px 12px", borderRadius: 6, fontSize: 12,
                color: C.danger, background: C.dangerSoft, border: `1px solid ${C.danger}33`,
              }}
            >
              <AlertCircle size={13} /> {err}
            </div>
          )}

          {form.hasPii === "是" && (
            <div
              style={{
                display: "flex", alignItems: "flex-start", gap: 6, marginTop: 10,
                padding: "8px 12px", borderRadius: 6, fontSize: 11.5, lineHeight: 1.7,
                color: "#b45309", background: C.warnSoft, border: `1px solid ${C.warn}33`,
              }}
            >
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
              涉及个人信息的数据集需勾选「脱敏声明」随包材料，并在提交后补充脱敏说明，审核通过后方可发布。
            </div>
          )}
        </div>

        {/* 底部 */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
            borderTop: `1px solid ${C.border}`, background: "#fff", flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11.5, color: C.faint }}>
            {missing.length === 0 ? "必填项已完善，可提交封装" : `还有 ${missing.length} 项必填未完成`}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={{ ...footerBtn, color: C.text, background: "#fff", border: `1px solid ${C.border}` }}>
            取消
          </button>
          <button
            onClick={submit}
            style={{ ...footerBtn, color: "#fff", background: C.primary, border: `1px solid ${C.primary}`, display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <ArrowRight size={13} /> 确认封装
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const fileBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 11px",
  fontSize: 12, color: C.primary, background: "#fff",
  border: `1px dashed ${C.primary}77`, borderRadius: 6, cursor: "pointer",
};

const footerBtn: React.CSSProperties = {
  padding: "7px 16px", fontSize: 12.5, borderRadius: 6, cursor: "pointer",
};
