"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Play,
  BookMarked,
  Trash2,
  Edit3,
  Info,
  AlertTriangle,
} from "lucide-react";
import { C, Panel, Table, Tag, Bar, Btn, IconBtn, scrollArea, Kv } from "@/components/production/ui";
import { RULE_TEMPLATES } from "@/components/production/mock";
import {
  QC_DIMS,
  QC_DIM_MAP,
  QC_RULES,
  QC_DATASETS,
  QC_FIELDS,
  QC_RULE_TYPE_LABEL,
  QC_LEVEL_META,
  rulesByDim,
  type QcDim,
  type QcLevel,
  type QcRule,
  type QcRuleType,
} from "./qcData";

// ---------------------------------------------------------- 稳定哈希（试跑结果固定）
function h32(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const FIELD_STYLE: React.CSSProperties = {
  width: "100%",
  height: 32,
  padding: "0 10px",
  fontSize: 13,
  color: C.text,
  background: "#fff",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 12,
  color: C.sub,
  marginBottom: 6,
  display: "block",
};

type Step = 1 | 2 | 3;

interface Draft {
  name: string;
  dim: QcDim;
  dataset: string;
  fields: string[];
  type: QcRuleType;
  expr: string;
  op: string;
  threshold: string;
  sampleRate: number;
  level: QcLevel;
  fromTemplate?: string;
}

const EMPTY_DRAFT: Draft = {
  name: "",
  dim: "completeness",
  dataset: "交通事件识别数据集",
  fields: [],
  type: "expression",
  expr: "",
  op: "<=",
  threshold: "",
  sampleRate: 100,
  level: "major",
};

export default function QualityRulesView() {
  const [rules, setRules] = useState<QcRule[]>(QC_RULES);
  const [kw, setKw] = useState("");
  const [dimFilter, setDimFilter] = useState<QcDim | "all">("all");
  const [dsFilter, setDsFilter] = useState<string>("all");

  // 弹窗
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tplOpen, setTplOpen] = useState(false);
  const [ran, setRan] = useState<{ hits: number; total: number } | null>(null);

  const dimStats = useMemo(() => rulesByDim(), []);

  const list = rules.filter((r) => {
    if (dimFilter !== "all" && r.dim !== dimFilter) return false;
    if (dsFilter !== "all" && r.dataset !== dsFilter) return false;
    if (kw && !(r.name + r.id + r.expr + r.dataset).toLowerCase().includes(kw.toLowerCase())) return false;
    return true;
  });

  const fields = QC_FIELDS[draft.dataset] || [];
  const exprValid = draft.expr.trim().length > 0 && (draft.expr.match(/\(/g) || []).length === (draft.expr.match(/\)/g) || []).length;

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setStep(1);
    setRan(null);
    setOpen(true);
  };

  const openEdit = (r: QcRule) => {
    setDraft({
      name: r.name,
      dim: r.dim,
      dataset: r.dataset,
      fields: [...r.fields],
      type: r.type,
      expr: r.expr,
      op: r.op,
      threshold: r.threshold,
      sampleRate: r.sampleRate,
      level: r.level,
      fromTemplate: r.fromTemplate,
    });
    setEditingId(r.id);
    setStep(1);
    setRan(null);
    setOpen(true);
  };

  const useTemplate = (tplId: string) => {
    const tpl = RULE_TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    const dimParam = tpl.params.find((p) => p.k === "维度")?.v || "";
    const dimKey = QC_DIMS.find((d) => d.label === dimParam)?.key || "completeness";
    const threshold = tpl.params.find((p) => p.k !== "维度")?.v || "";
    setDraft({
      ...EMPTY_DRAFT,
      name: tpl.name,
      dim: dimKey,
      expr: tpl.summary,
      threshold,
      fromTemplate: tpl.id,
      level: tpl.id === "RUL-QC-001" || tpl.id === "RUL-QC-002" ? "critical" : "major",
    });
    setEditingId(null);
    setStep(1);
    setRan(null);
    setTplOpen(false);
    setOpen(true);
  };

  const save = () => {
    const item: QcRule = {
      id: editingId || `QCR-${String(rules.length + 1).padStart(4, "0")}`,
      name: draft.name || "未命名规则",
      dim: draft.dim,
      dataset: draft.dataset,
      fields: draft.fields.length ? draft.fields : [fields[0]?.name || "unknown"],
      type: draft.type,
      expr: draft.expr,
      op: draft.op,
      threshold: draft.threshold || "—",
      sampleRate: draft.sampleRate,
      level: draft.level,
      on: true,
      hits7d: ran?.hits ?? 0,
      owner: "李工 · 数据质量",
      updatedAt: "2026-10-20 17:50",
      fromTemplate: draft.fromTemplate,
    };
    setRules((prev) => (editingId ? prev.map((r) => (r.id === editingId ? { ...item, on: r.on, hits7d: r.hits7d } : r)) : [item, ...prev]));
    setOpen(false);
  };

  const runTest = () => {
    const seed = h32(`${draft.expr}|${draft.dataset}|${draft.fields.join(",")}`);
    const total = 100;
    // 阈值越严苛，命中越多；整体控制在 0~12 条，避免"试跑必失败"
    const hits = seed % 13;
    setRan({ hits, total });
  };

  const toggleOn = (id: string) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  const remove = (id: string) => setRules((prev) => prev.filter((r) => r.id !== id));

  const stepNext = () => {
    if (step === 1 && (!draft.name.trim() || !draft.dataset)) return;
    if (step === 2 && (draft.fields.length === 0 || !exprValid)) return;
    setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };

  return (
    <div style={scrollArea}>
      {/* 六维概览 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0,1fr))", gap: 10 }}>
        {dimStats.map((d) => {
          const on = dimFilter === d.key;
          return (
            <button
              key={d.key}
              onClick={() => setDimFilter(on ? "all" : d.key)}
              style={{
                textAlign: "left",
                padding: "11px 12px",
                background: on ? d.soft : "#fff",
                border: `1px solid ${on ? d.tone + "55" : C.border}`,
                borderRadius: 8,
                cursor: "pointer",
                transition: "all .12s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: on ? d.tone : C.text }}>{d.label}</span>
                <span style={{ fontSize: 11, color: C.faint }}>
                  {d.enabled}/{d.total}
                </span>
              </div>
              <div style={{ marginTop: 8 }}>
                <Bar pct={d.total ? (d.enabled / d.total) * 100 : 0} tone={d.tone} h={4} />
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                近 7 天命中 <b style={{ color: d.hits > 10 ? C.danger : C.sub }}>{d.hits}</b> 次
              </div>
            </button>
          );
        })}
      </div>

      {/* 工具条 */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 240 }}>
          <Search size={13} style={{ position: "absolute", left: 9, top: 9, color: C.faint }} />
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="搜索规则名称 / 编号 / 表达式"
            style={{ ...FIELD_STYLE, paddingLeft: 28 }}
          />
        </div>

        <select value={dsFilter} onChange={(e) => setDsFilter(e.target.value)} style={{ ...FIELD_STYLE, width: 180 }}>
          <option value="all">全部数据集</option>
          {QC_DATASETS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={dimFilter}
          onChange={(e) => setDimFilter(e.target.value as QcDim | "all")}
          style={{ ...FIELD_STYLE, width: 140 }}
        >
          <option value="all">全部维度</option>
          {QC_DIMS.map((d) => (
            <option key={d.key} value={d.key}>
              {d.label}
            </option>
          ))}
        </select>

        <span style={{ fontSize: 12, color: C.faint }}>
          共 {list.length} 条 · 启用 {list.filter((r) => r.on).length} 条
        </span>

        <div style={{ flex: 1 }} />

        <Btn icon={<BookMarked size={14} />} onClick={() => setTplOpen(true)}>
          从模板库引用
        </Btn>
        <Btn tone="primary" icon={<Plus size={14} />} onClick={openCreate}>
          新建规则
        </Btn>
      </div>

      {/* 规则列表 */}
      <Panel style={{ marginTop: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          head={["规则", "维度", "适用对象", "类型", "校验表达式", "阈值", "级别", "近7天命中", "状态", "操作"]}
          widths={["18%", "7%", "17%", "6%", "25%", "8%", "6%", "7%", "8%", "auto"]}
          rows={list.map((r) => {
            const d = QC_DIM_MAP[r.dim];
            const lv = QC_LEVEL_META[r.level];
            return [
              <div key="n">
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 6 }}>
                  {r.name}
                  {r.fromTemplate && <Tag tone={C.faint}>模板</Tag>}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                  {r.id} · {r.owner}
                </div>
              </div>,
              <Tag key="d" tone={d.tone} soft={d.soft}>
                {d.label}
              </Tag>,
              <div key="o">
                <div style={{ fontSize: 12, color: C.text }}>{r.dataset}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
                  {r.fields.slice(0, 3).join(" · ")}
                  {r.fields.length > 3 ? ` 等 ${r.fields.length} 个字段` : ""}
                </div>
              </div>,
              <Tag key="t">{QC_RULE_TYPE_LABEL[r.type]}</Tag>,
              <code
                key="e"
                style={{
                  fontSize: 11,
                  color: "#4338ca",
                  background: C.primarySoft,
                  padding: "3px 6px",
                  borderRadius: 4,
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
                title={r.expr}
              >
                {r.expr}
              </code>,
              <span
                key="th"
                style={{
                  fontSize: 12,
                  color: C.text,
                  fontFamily: "ui-monospace, monospace",
                  whiteSpace: "nowrap",
                }}
              >
                {r.op} {r.threshold}
              </span>,
              <Tag key="l" tone={lv.tone} soft={lv.soft}>
                {lv.label}
              </Tag>,
              <span key="h" style={{ fontSize: 13, fontWeight: 600, color: r.hits7d > 10 ? C.danger : C.text }}>
                {r.hits7d}
              </span>,
              <button
                key="s"
                onClick={() => toggleOn(r.id)}
                title={r.on ? "点击停用" : "点击启用"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  fontSize: 11,
                  borderRadius: 10,
                  border: `1px solid ${r.on ? C.success + "33" : C.border}`,
                  background: r.on ? C.successSoft : C.bg,
                  color: r.on ? C.success : C.faint,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.on ? C.success : C.faint }} />
                {r.on ? "已启用" : "已停用"}
              </button>,
              <div key="a" style={{ display: "flex", gap: 4 }}>
                <IconBtn icon={<Edit3 size={13} />} label="编辑规则" tone="primary" onClick={() => openEdit(r)} />
                <IconBtn icon={<Trash2 size={13} />} label="删除规则" tone="danger" onClick={() => remove(r.id)} />
              </div>,
            ];
          })}
        />
      </Panel>

      {/* ============ 新建 / 编辑规则弹窗 ============ */}
      {open && (
        <Modal onClose={() => setOpen(false)} width={720}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{editingId ? "编辑质检规则" : "新建质检规则"}</div>
              <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>
                {draft.fromTemplate ? `引用模板 ${draft.fromTemplate}，保存后成为独立实例` : "规则保存后立即生效，可随时停用"}
              </div>
            </div>
            <IconBtn icon={<X size={14} />} label="关闭" onClick={() => setOpen(false)} />
          </div>

          {/* 步骤条 */}
          <div style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: `1px solid ${C.borderSoft}`, background: C.bg }}>
            {[
              { n: 1, label: "维度与对象" },
              { n: 2, label: "字段与表达式" },
              { n: 3, label: "阈值与试跑" },
            ].map((s, i) => (
              <React.Fragment key={s.n}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      fontSize: 11,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: step >= (s.n as Step) ? C.primary : "#fff",
                      color: step >= (s.n as Step) ? "#fff" : C.faint,
                      border: `1px solid ${step >= (s.n as Step) ? C.primary : C.border}`,
                    }}
                  >
                    {step > s.n ? <Check size={11} /> : s.n}
                  </span>
                  <span style={{ fontSize: 12, color: step >= (s.n as Step) ? C.text : C.faint, fontWeight: step === s.n ? 600 : 400 }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <ChevronRight size={13} style={{ color: C.border, margin: "0 10px" }} />}
              </React.Fragment>
            ))}
          </div>

          <div style={{ padding: 18, maxHeight: "56vh", overflowY: "auto" }}>
            {/* ---- 步骤 1 ---- */}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={LABEL_STYLE}>规则名称</label>
                  <input
                    autoFocus
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="如：事件类型值域校验"
                    style={FIELD_STYLE}
                  />
                </div>

                <div>
                  <label style={LABEL_STYLE}>质量维度（决定该规则在报告中的六维得分归属）</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {QC_DIMS.map((d) => {
                      const on = draft.dim === d.key;
                      return (
                        <button
                          key={d.key}
                          onClick={() => setDraft({ ...draft, dim: d.key })}
                          style={{
                            textAlign: "left",
                            padding: "9px 11px",
                            borderRadius: 7,
                            border: `1px solid ${on ? d.tone : C.border}`,
                            background: on ? d.soft : "#fff",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.tone }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: on ? d.tone : C.text }}>{d.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: C.faint, marginTop: 4, lineHeight: 1.45 }}>{d.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>适用数据集</label>
                  <select
                    value={draft.dataset}
                    onChange={(e) => setDraft({ ...draft, dataset: e.target.value, fields: [] })}
                    style={FIELD_STYLE}
                  >
                    {QC_DATASETS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ---- 步骤 2 ---- */}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={LABEL_STYLE}>
                    适用字段（可多选，已选 {draft.fields.length} 个）
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {fields.map((f) => {
                      const on = draft.fields.includes(f.name);
                      return (
                        <button
                          key={f.name}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              fields: on ? draft.fields.filter((x) => x !== f.name) : [...draft.fields, f.name],
                            })
                          }
                          style={{
                            padding: "5px 9px",
                            borderRadius: 5,
                            fontSize: 12,
                            cursor: "pointer",
                            border: `1px solid ${on ? C.primary : C.border}`,
                            background: on ? C.primarySoft : "#fff",
                            color: on ? C.primary : C.sub,
                          }}
                        >
                          {f.label}
                          <span style={{ fontSize: 10, marginLeft: 5, color: C.faint }}>{f.type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={LABEL_STYLE}>规则类型</label>
                    <select
                      value={draft.type}
                      onChange={(e) => setDraft({ ...draft, type: e.target.value as QcRuleType })}
                      style={FIELD_STYLE}
                    >
                      <option value="expression">表达式（支持 AND / OR 组合）</option>
                      <option value="threshold">阈值（单指标比较）</option>
                      <option value="script">脚本（自定义 Python UDF）</option>
                      <option value="enum">枚举（白名单 / 字典校验）</option>
                    </select>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>严重级别（命中后生成的工单级别）</label>
                    <select
                      value={draft.level}
                      onChange={(e) => setDraft({ ...draft, level: e.target.value as QcLevel })}
                      style={FIELD_STYLE}
                    >
                      <option value="critical">严重 · 阻断下游</option>
                      <option value="major">一般 · 需处理后放行</option>
                      <option value="minor">提示 · 记录不改写</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={LABEL_STYLE}>
                    校验表达式
                    <span style={{ color: C.faint, marginLeft: 8 }}>
                      支持 null_ratio / range_between / enum_in / regex_match / count_dup / iou / match_rate
                    </span>
                  </label>
                  <textarea
                    value={draft.expr}
                    onChange={(e) => setDraft({ ...draft, expr: e.target.value })}
                    rows={3}
                    spellCheck={false}
                    placeholder="null_ratio(event_type, start_time) <= 0.001"
                    style={{
                      ...FIELD_STYLE,
                      height: "auto",
                      padding: 10,
                      fontFamily: "ui-monospace, monospace",
                      fontSize: 12,
                      lineHeight: 1.6,
                      resize: "vertical",
                    }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11 }}>
                    {draft.expr.trim() === "" ? (
                      <span style={{ color: C.faint }}>尚未填写表达式</span>
                    ) : exprValid ? (
                      <span style={{ color: C.success, display: "flex", alignItems: "center", gap: 4 }}>
                        <Check size={12} /> 语法校验通过
                      </span>
                    ) : (
                      <span style={{ color: C.danger, display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertTriangle size={12} /> 括号不匹配，请检查表达式
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---- 步骤 3 ---- */}
            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={LABEL_STYLE}>比较符</label>
                    <select value={draft.op} onChange={(e) => setDraft({ ...draft, op: e.target.value })} style={FIELD_STYLE}>
                      {[">=", "<=", "=", ">", "<"].map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>阈值</label>
                    <input
                      value={draft.threshold}
                      onChange={(e) => setDraft({ ...draft, threshold: e.target.value })}
                      placeholder="如 99.5% / 0.85 / 0 条"
                      style={FIELD_STYLE}
                    />
                  </div>
                  <div>
                    <label style={LABEL_STYLE}>采样率（%）</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={draft.sampleRate}
                      onChange={(e) => setDraft({ ...draft, sampleRate: Number(e.target.value) })}
                      style={FIELD_STYLE}
                    />
                  </div>
                </div>

                <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.text }}>
                      <Play size={13} style={{ color: C.primary }} /> 试跑预览
                    </div>
                    <Btn size="sm" icon={<Play size={12} />} onClick={runTest}>
                      试跑 100 条
                    </Btn>
                  </div>
                  <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>
                    从「{draft.dataset}」随机抽取 100 条样本，按当前表达式与阈值判定命中情况
                  </div>

                  {ran ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ display: "flex", gap: 20, alignItems: "flex-end" }}>
                        <div>
                          <div style={{ fontSize: 24, fontWeight: 700, color: ran.hits > 0 ? C.danger : C.success }}>
                            {ran.hits}
                          </div>
                          <div style={{ fontSize: 11, color: C.faint }}>命中样本（共 {ran.total} 条）</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <Bar pct={(ran.hits / ran.total) * 100} tone={ran.hits > 10 ? C.danger : C.warn} h={6} />
                          <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
                            命中率 {(ran.hits / ran.total * 100).toFixed(1)}%
                            {ran.hits > 10 ? " · 命中偏高，建议复核阈值是否过严" : " · 命中率处于合理区间"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, fontSize: 12, color: C.faint }}>尚未试跑</div>
                  )}
                </div>

                <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 6 }}>规则摘要</div>
                  <Kv k="规则名称" v={draft.name || "—"} w={72} />
                  <Kv k="质量维度" v={<Tag tone={QC_DIM_MAP[draft.dim].tone} soft={QC_DIM_MAP[draft.dim].soft}>{QC_DIM_MAP[draft.dim].label}</Tag>} w={72} />
                  <Kv k="适用对象" v={`${draft.dataset} · ${draft.fields.join(", ") || "—"}`} w={72} />
                  <Kv k="判定条件" v={<code style={{ fontSize: 11, color: "#4338ca" }}>{draft.expr || "—"} {draft.op} {draft.threshold || "—"}</code>} w={72} />
                  <Kv k="命中处置" v={QC_LEVEL_META[draft.level].label + (draft.level === "critical" ? " · 自动开工单并阻断下游" : draft.level === "major" ? " · 自动开工单" : " · 仅记录")} w={72} />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderTop: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11, color: C.faint }}>
              <Info size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
              保存后可在质量检测报告与问题工单中追溯命中记录
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {step > 1 && (
                <Btn icon={<ChevronLeft size={13} />} onClick={() => setStep((s) => (s - 1) as Step)}>
                  上一步
                </Btn>
              )}
              {step < 3 ? (
                <Btn
                  tone="primary"
                  icon={<ChevronRight size={13} />}
                  disabled={(step === 1 && !draft.name.trim()) || (step === 2 && (draft.fields.length === 0 || !exprValid))}
                  onClick={stepNext}
                >
                  下一步
                </Btn>
              ) : (
                <Btn tone="primary" icon={<Check size={13} />} onClick={save}>
                  {editingId ? "保存修改" : "保存并启用"}
                </Btn>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============ 模板库引用弹窗 ============ */}
      {tplOpen && (
        <Modal onClose={() => setTplOpen(false)} width={640}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>从规则模板库引用</div>
              <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>引用后成为独立实例，修改不影响原模板</div>
            </div>
            <IconBtn icon={<X size={14} />} label="关闭" onClick={() => setTplOpen(false)} />
          </div>
          <div style={{ padding: 14, maxHeight: "60vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {RULE_TEMPLATES.filter((t) => t.stage === "qc").map((t) => {
              const dimLabel = t.params.find((p) => p.k === "维度")?.v || "—";
              const dim = QC_DIMS.find((d) => d.label === dimLabel);
              return (
                <div
                  key={t.id}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{t.name}</span>
                      <Tag>{t.id}</Tag>
                      {dim && (
                        <Tag tone={dim.tone} soft={dim.soft}>
                          {dim.label}
                        </Tag>
                      )}
                      <span style={{ fontSize: 11, color: C.faint }}>{t.version}</span>
                    </div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 5, lineHeight: 1.55 }}>{t.summary}</div>
                  </div>
                  <Btn size="sm" tone="primary" onClick={() => useTemplate(t.id)}>
                    引用
                  </Btn>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ---------------------------------------------------------- 通用弹窗
function Modal({ children, onClose, width = 680 }: { children: React.ReactNode; onClose: () => void; width?: number }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.42)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "88vh",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 20px 48px rgba(15,23,42,.25)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export { Modal as QcModal };
