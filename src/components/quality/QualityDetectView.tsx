"use client";

import React, { useState } from "react";
import {
  Brain,
  Play,
  Check,
  X,
  RefreshCw,
  Sparkles,
  ScanSearch,
  FileWarning,
  ArrowRight,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { C, Panel, Grid, Table, Tag, Bar, Btn, IconBtn, scrollArea, LineChart, Metric } from "@/components/production/ui";
import {
  QC_DETECTORS,
  QC_DETECT_JOBS,
  QC_SAMPLES,
  QC_DATASETS,
  DETECTOR_MAP,
  type QcDetector,
  type QcDetectJob,
  type QcSample,
  type DetectorKey,
} from "./qcData";

const JOB_STATUS: Record<QcDetectJob["status"], { label: string; tone: string; soft: string }> = {
  running: { label: "检测中", tone: "#2563eb", soft: "#eff6ff" },
  done: { label: "已完成", tone: "#16a34a", soft: "#f0fdf4" },
  failed: { label: "异常中断", tone: "#dc2626", soft: "#fef2f2" },
};

/** 列表里用短名，避免窄列把长名称折成两行 */
const DETECTOR_SHORT: Record<DetectorKey, string> = {
  outlier: "分布异常",
  noise: "噪声识别",
  semantic: "语义一致",
  imageq: "图像质量",
};

const REVIEW_META: Record<QcSample["review"], { label: string; tone: string; soft: string }> = {
  pending: { label: "待复核", tone: "#b45309", soft: "#fffbeb" },
  confirmed: { label: "确认问题", tone: "#dc2626", soft: "#fef2f2" },
  false: { label: "误报", tone: "#64748b", soft: "#f8fafc" },
};

const FIELD_STYLE: React.CSSProperties = {
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

const LABEL_STYLE: React.CSSProperties = { fontSize: 12, color: C.sub, marginBottom: 6, display: "block" };

export default function QualityDetectView() {
  const router = useRouter();
  const [detectors, setDetectors] = useState<QcDetector[]>(QC_DETECTORS);
  const [jobs, setJobs] = useState<QcDetectJob[]>(QC_DETECT_JOBS);
  const [samples, setSamples] = useState<QcSample[]>(QC_SAMPLES);
  const [curveKey, setCurveKey] = useState<DetectorKey>("noise");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ dataset: QC_DATASETS[0] as string, batch: "RUN-2003", picked: ["outlier", "noise"] as DetectorKey[] });

  const totalFound = detectors.reduce((s, d) => s + d.found, 0);
  const avgF1 = Math.round((detectors.reduce((s, d) => s + d.f1, 0) / detectors.length) * 10) / 10;
  const pending = samples.filter((s) => s.review === "pending").length;

  const curve = DETECTOR_MAP[curveKey];

  const toggle = (key: DetectorKey) =>
    setDetectors((prev) => prev.map((d) => (d.key === key ? { ...d, on: !d.on } : d)));

  const review = (id: string, r: QcSample["review"]) => {
    setSamples((prev) => prev.map((s) => (s.id === id ? { ...s, review: r } : s)));
    toast.success(r === "confirmed" ? "已确认问题，可在问题工单中跟进" : "已标记为误报，将回流至模型迭代样本池");
  };

  const startJob = () => {
    if (form.picked.length === 0) return;
    const job: QcDetectJob = {
      id: `QDJ-20261020-${String(jobs.length + 1).padStart(2, "0")}`,
      dataset: form.dataset,
      batch: form.batch,
      detectors: form.picked,
      total: 6000 + jobs.length * 1300,
      found: 0,
      status: "running",
      startedAt: "2026-10-20 17:52",
      cost: "运行 0 分钟",
      operator: "李工 · 数据质量",
    };
    setJobs((prev) => [job, ...prev]);
    setOpen(false);
    toast.success(`检测任务已提交，${form.picked.length} 个检测器并行执行`);

    // 模拟完成
    window.setTimeout(() => {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "done", found: 96 + (j.total % 120), cost: "12 分 38 秒" } : j))
      );
      toast.success(`${job.id} 检测完成`);
    }, 6000);
  };

  return (
    <div style={scrollArea}>
      <Grid cols={4} gap={12}>
        <Metric icon={<ScanSearch size={15} />} label="检出异常（近 7 天）" value={totalFound} unit="条" tone={C.danger} hint="四类检测器合计" />
        <Metric icon={<Brain size={15} />} label="检测器平均 F1" value={avgF1} unit="%" tone={C.primary} hint="较上一版本 +2.4pt" />
        <Metric icon={<FileWarning size={15} />} label="待人工复核" value={pending} unit="条" tone={C.warn} hint="复核结论回流训练集" />
        <Metric icon={<Activity size={15} />} label="检测任务（近 7 天）" value={jobs.length} unit="个" tone={C.teal} hint={`${jobs.filter((j) => j.status === "done").length} 个已完成`} />
      </Grid>

      {/* 四个检测器 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 12, marginTop: 12 }}>
        {detectors.map((d) => (
          <div key={d.key} style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: 14, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: `${d.tone}14`, color: d.tone, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Brain size={14} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{d.algo}</div>
                </div>
              </div>
              <button
                onClick={() => toggle(d.key)}
                title={d.on ? "点击停用" : "点击启用"}
                style={{
                  flexShrink: 0,
                  width: 34,
                  height: 18,
                  borderRadius: 9,
                  border: "none",
                  cursor: "pointer",
                  background: d.on ? d.tone : "#cbd5e1",
                  position: "relative",
                  transition: "background .15s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    left: d.on ? 18 : 2,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left .15s",
                  }}
                />
              </button>
            </div>

            <div style={{ fontSize: 11, color: C.sub, lineHeight: 1.6, marginTop: 9, minHeight: 54 }}>{d.desc}</div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.faint, marginTop: 2 }}>
              <Tag tone={d.tone}>{d.version}</Tag>
              {d.samples > 0 ? `训练样本 ${(d.samples / 1000).toFixed(1)}K` : "统计方法 · 免训练"}
            </div>

            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                { k: "准确率", v: d.precision },
                { k: "召回率", v: d.recall },
              ].map((m) => (
                <div key={m.k}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
                    <span style={{ color: C.faint }}>{m.k}</span>
                    <span style={{ color: C.text, fontWeight: 600 }}>{m.v}%</span>
                  </div>
                  <Bar pct={m.v} tone={d.tone} h={4} />
                </div>
              ))}
            </div>

            <div style={{ borderTop: `1px solid ${C.borderSoft}`, marginTop: 10, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11, color: C.faint }}>
              <span>近 7 天检出 <b style={{ color: C.text }}>{d.found}</b></span>
              <span>{d.lastTrain.length > 12 ? "上次训练 " + d.lastTrain.slice(5, 10) : "—"}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 迭代趋势 + 任务列表 */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,1fr)", gap: 12, marginTop: 12 }}>
        <Panel
          title="模型迭代趋势"
          desc="人工复核结论回流训练，版本迭代带来准确率与召回率提升"
          extra={
            <select value={curveKey} onChange={(e) => setCurveKey(e.target.value as DetectorKey)} style={{ ...FIELD_STYLE, height: 28, fontSize: 12 }}>
              {detectors.map((d) => (
                <option key={d.key} value={d.key}>
                  {d.name}
                </option>
              ))}
            </select>
          }
        >
          <LineChart
            height={210}
            labels={curve.history.map((h) => h.version)}
            series={[
              { name: "准确率", color: C.primary, data: curve.history.map((h) => h.precision) },
              { name: "召回率", color: C.teal, data: curve.history.map((h) => h.recall) },
            ]}
            yUnit="%"
          />
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 11, color: C.sub }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 2, background: C.primary }} /> 准确率
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 10, height: 2, background: C.teal }} /> 召回率
            </span>
            <span style={{ marginLeft: "auto", color: C.faint }}>
              当前 {curve.version} · 训练样本 {curve.samples > 0 ? (curve.samples / 1000).toFixed(1) + "K" : "免训练"} · {curve.lastTrain}
            </span>
          </div>
        </Panel>

        <Panel
          title="检测任务"
          desc="按批次发起，多检测器并行"
          extra={
            <Btn size="sm" tone="primary" icon={<Play size={12} />} onClick={() => setOpen(true)}>
              发起检测
            </Btn>
          }
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ maxHeight: 274, overflowY: "auto" }}>
            <Table
              head={["任务 / 批次", "数据集", "检测器", "检出", "状态"]}
              widths={["26%", "23%", "12%", "9%", "auto"]}
              rows={jobs.map((j) => {
                const st = JOB_STATUS[j.status];
                return [
                  <div key="i" style={{ whiteSpace: "nowrap" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{j.batch}</div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{j.id}</div>
                  </div>,
                  <div key="d" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {j.dataset}
                  </div>,
                  <span key="t" style={{ fontSize: 11, color: C.sub, whiteSpace: "nowrap" }}>
                    {j.detectors.length} 个
                  </span>,
                  <span key="f" style={{ fontSize: 13, fontWeight: 600, color: j.found > 200 ? C.danger : C.text, whiteSpace: "nowrap" }}>
                    {j.found || "—"}
                  </span>,
                  <div key="s" style={{ whiteSpace: "nowrap" }}>
                    <Tag tone={st.tone} soft={st.soft}>
                      {j.status === "running" ? <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} /> : null}
                      {st.label}
                    </Tag>
                  </div>,
                ];
              })}
            />
          </div>
        </Panel>
      </div>

      {/* 检出样例 */}
      <Panel
        title="检出样例与人工复核"
        desc="复核结论回流训练集，形成「检测 → 复核 → 训练」闭环"
        style={{ marginTop: 12 }}
        extra={<Tag tone={C.warn} soft={C.warnSoft}>{pending} 条待复核</Tag>}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["检测器", "样本 / 数据集", "字段", "检出内容", "判定理由", "置信度", "复核结论", "操作"]}
          widths={["12%", "15%", "10%", "18%", "22%", "8%", "10%", "auto"]}
          rows={samples.map((s) => {
            const d = DETECTOR_MAP[s.detector];
            const rv = REVIEW_META[s.review];
            return [
              <span
                key="d"
                style={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  lineHeight: "18px",
                  padding: "2px 8px",
                  borderRadius: 4,
                  color: d.tone,
                  background: `${d.tone}12`,
                }}
              >
                {DETECTOR_SHORT[d.key]}
              </span>,
              <div key="s" style={{ whiteSpace: "nowrap" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{s.sampleId}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>{s.dataset}</div>
              </div>,
              <code key="f" style={{ fontSize: 11, color: "#4338ca", whiteSpace: "nowrap" }}>{s.field}</code>,
              <span key="c" style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{s.content}</span>,
              <span key="r" style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>{s.reason}</span>,
              <div key="p" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Bar pct={s.confidence * 100} tone={s.confidence > 0.9 ? C.danger : C.warn} h={4} />
                <span style={{ fontSize: 11, color: C.sub, width: 30, whiteSpace: "nowrap" }}>{(s.confidence * 100).toFixed(0)}%</span>
              </div>,
              <div key="v" style={{ whiteSpace: "nowrap" }}>
                <Tag tone={rv.tone} soft={rv.soft}>{rv.label}</Tag>
              </div>,
              <div key="a" style={{ display: "flex", gap: 4 }}>
                <IconBtn
                  icon={<Check size={13} />}
                  label="确认问题"
                  tone="danger"
                  disabled={s.review === "confirmed"}
                  onClick={() => review(s.id, "confirmed")}
                />
                <IconBtn
                  icon={<X size={13} />}
                  label="标记误报"
                  tone="ghost"
                  disabled={s.review === "false"}
                  onClick={() => review(s.id, "false")}
                />
                <IconBtn
                  icon={<ArrowRight size={13} />}
                  label="转问题工单"
                  tone="purple"
                  disabled={s.review !== "confirmed"}
                  onClick={() => router.push("/quality?view=ticket")}
                />
              </div>,
            ];
          })}
        />
      </Panel>

      {/* 发起检测弹窗 */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.42)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ width: 520, maxWidth: "100%", background: "#fff", borderRadius: 10, boxShadow: "0 20px 48px rgba(15,23,42,.25)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>发起智能质量检测</div>
                <div style={{ fontSize: 12, color: C.faint, marginTop: 2 }}>选择批次与检测器，检测结果自动写入质量报告</div>
              </div>
              <IconBtn icon={<X size={14} />} label="关闭" onClick={() => setOpen(false)} />
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LABEL_STYLE}>检测数据集</label>
                <select value={form.dataset} onChange={(e) => setForm({ ...form, dataset: e.target.value })} style={{ ...FIELD_STYLE, width: "100%" }}>
                  {QC_DATASETS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>关联批次</label>
                <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })} style={{ ...FIELD_STYLE, width: "100%" }}>
                  {["RUN-2001", "RUN-2002", "RUN-2003", "RUN-2004", "RUN-2005", "RUN-2006", "RUN-2007"].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={LABEL_STYLE}>检测器（可多选，已选 {form.picked.length} 个）</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {detectors.map((d) => {
                    const on = form.picked.includes(d.key);
                    return (
                      <button
                        key={d.key}
                        onClick={() =>
                          setForm({ ...form, picked: on ? form.picked.filter((k) => k !== d.key) : [...form.picked, d.key] })
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 11px",
                          borderRadius: 7,
                          textAlign: "left",
                          cursor: "pointer",
                          border: `1px solid ${on ? d.tone : C.border}`,
                          background: on ? `${d.tone}0d` : "#fff",
                        }}
                      >
                        <span
                          style={{
                            width: 15,
                            height: 15,
                            borderRadius: 4,
                            border: `1px solid ${on ? d.tone : C.border}`,
                            background: on ? d.tone : "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {on && <Check size={10} style={{ color: "#fff" }} />}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: on ? d.tone : C.text }}>{d.name}</span>
                        <span style={{ fontSize: 11, color: C.faint, flex: 1 }}>{d.algo}</span>
                        <span style={{ fontSize: 11, color: C.faint }}>F1 {d.f1}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: `1px solid ${C.border}` }}>
              <Btn onClick={() => setOpen(false)}>取消</Btn>
              <Btn tone="primary" icon={<Sparkles size={13} />} disabled={form.picked.length === 0} onClick={startJob}>
                提交检测
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
