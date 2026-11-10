"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Eye,
  FileText,
  FileWarning,
  RefreshCw,
  ScanSearch,
  Search,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { C, Panel, Grid, Table, Tag, Bar, Btn, IconBtn, scrollArea, Metric } from "@/components/production/ui";
import {
  DETECTOR_MAP,
  QC_DETECTORS,
  QC_DETECT_TASKS,
  QC_SAMPLES,
  QC_TAG_CODE,
  QC_TAG_SHORT,
  QC_TASK_DATASETS,
  QC_TASK_STATE_META,
  QC_VERDICT_META,
  TICKET_MAP,
  failRateOf,
  tagHitsOf,
  taskStats,
  verdictOf,
  type DetectorKey,
  type QcDetectTask,
} from "./qcData";

/** 规则标签在筛选条上的展示名（保留需求原文口径） */
const TAG_LABEL: Record<DetectorKey, string> = {
  outlier: "统计分布异常",
  noise: "深度学习噪声",
  semantic: "语义一致性",
  imageq: "图像质量",
};

const FIELD: React.CSSProperties = {
  height: 32,
  padding: "0 9px",
  fontSize: 12,
  color: C.text,
  background: "#fff",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
};

const FILTER_LABEL: React.CSSProperties = { fontSize: 12, color: C.faint, whiteSpace: "nowrap" };

const LINK_BTN: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: 0,
  border: "none",
  background: "transparent",
  fontSize: 12,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

export default function QualityDetectView() {
  const router = useRouter();
  const [tasks, setTasks] = useState<QcDetectTask[]>(QC_DETECT_TASKS);

  // 检索条件
  const [ds, setDs] = useState("全部数据集");
  const [tagFilter, setTagFilter] = useState<DetectorKey[]>([]);
  const [stateFilter, setStateFilter] = useState("全部状态");
  const [q, setQ] = useState("");

  const [detailId, setDetailId] = useState<string | null>(null);
  const [seq, setSeq] = useState(5);
  const stats = taskStats(tasks);
  const detail = tasks.find((t) => t.id === detailId) || null;

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return tasks.filter((t) => {
      if (ds !== "全部数据集" && t.dataset !== ds) return false;
      // 规则标签：命中任一选中标签即保留
      if (tagFilter.length && !tagFilter.some((k) => t.tags.includes(k))) return false;
      if (stateFilter !== "全部状态") {
        const v = verdictOf(t);
        if (stateFilter === "结果正常" && v !== "pass") return false;
        if (stateFilter === "结果异常" && v !== "fail") return false;
        if (stateFilter === "检测中" && t.state !== "running") return false;
        if (stateFilter === "已中断" && t.state !== "failed") return false;
      }
      if (kw) {
        const hay = `${t.id} ${t.name} ${t.dataset} ${t.batch} ${t.tags.map((k) => TAG_LABEL[k]).join(" ")}`.toLowerCase();
        if (hay.indexOf(kw) < 0) return false;
      }
      return true;
    });
  }, [tasks, ds, tagFilter, stateFilter, q]);

  const toggleTag = (k: DetectorKey) =>
    setTagFilter((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));

  const resetFilters = () => {
    setDs("全部数据集");
    setTagFilter([]);
    setStateFilter("全部状态");
    setQ("");
  };

  return (
    <div style={scrollArea} data-view="quality-detect">
      <Grid cols={4} gap={12}>
        <Metric
          icon={<ScanSearch size={15} />}
          label="检测任务"
          value={stats.total}
          unit="个"
          tone={C.primary}
          hint={`${stats.running} 个检测中 · ${stats.failed} 个已中断`}
        />
        <Metric
          icon={<FileText size={15} />}
          label="结果正常 · 出报告"
          value={stats.pass}
          unit="个"
          tone={C.success}
          hint="自动生成质量报告并归入数据集档案"
        />
        <Metric
          icon={<FileWarning size={15} />}
          label="结果异常 · 转工单"
          value={stats.fail}
          unit="个"
          tone={C.danger}
          hint={`累计转出 ${stats.tickets} 张问题工单`}
        />
        <Metric
          icon={<Activity size={15} />}
          label="检出问题样本"
          value={stats.found}
          unit="条"
          tone={C.warn}
          hint="按任务累计，含已复核与待复核"
        />
      </Grid>

      <Panel
        title="检测任务"
        desc="以检测任务为核心：结果正常自动输出质量报告，结果异常自动转问题工单"
        style={{ marginTop: 12 }}
        bodyStyle={{ padding: 0 }}
      >
        {/* 检索条件：数据集 / 规则标签 / 状态 / 关键字 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            padding: "10px 14px",
            borderBottom: `1px solid ${C.borderSoft}`,
            background: "#fcfdff",
          }}
        >
          <span style={FILTER_LABEL}>数据集</span>
          <select value={ds} onChange={(e) => setDs(e.target.value)} style={{ ...FIELD, minWidth: 168 }}>
            <option>全部数据集</option>
            {QC_TASK_DATASETS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <span style={{ ...FILTER_LABEL, marginLeft: 4 }}>规则标签</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            {QC_DETECTORS.map((d) => {
              const on = tagFilter.includes(d.key);
              return (
                <button
                  key={d.key}
                  onClick={() => toggleTag(d.key)}
                  aria-pressed={on}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 10px",
                    fontSize: 12,
                    lineHeight: "18px",
                    borderRadius: 14,
                    cursor: "pointer",
                    border: `1px solid ${on ? d.tone : C.border}`,
                    background: on ? `${d.tone}12` : "#fff",
                    color: on ? d.tone : C.sub,
                  }}
                >
                  {on && <Check size={11} />}
                  {TAG_LABEL[d.key]}
                </button>
              );
            })}
          </div>

          <span style={{ ...FILTER_LABEL, marginLeft: 4 }}>状态</span>
          <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} style={{ ...FIELD, minWidth: 108 }}>
            {["全部状态", "结果正常", "结果异常", "检测中", "已中断"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 9, top: 10, color: C.faint }} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="搜索任务名 / 编号 / 批次"
                style={{ ...FIELD, width: 200, paddingLeft: 28 }}
              />
            </div>

            <span style={{ fontSize: 12, color: C.faint, whiteSpace: "nowrap" }}>
              已筛出 <b style={{ color: C.text }}>{filtered.length}</b> / {tasks.length}
            </span>
            <Btn size="sm" tone="plain" onClick={resetFilters}>
              重置
            </Btn>
          </div>
        </div>

        <Table
          head={["检测任务", "数据集", "规则标签", "检测样本", "检出", "异常率", "结论", "产出", "开始时间", "操作"]}
          widths={["20%", "12%", "15%", "7%", "5%", "8%", "7%", "9%", "10%", "8%"]}
          onRowClick={(i) => setDetailId(filtered[i].id)}
          rows={filtered.map((t) => {
            const v = verdictOf(t);
            const vm = QC_VERDICT_META[v];
            const rate = failRateOf(t);
            const sm = QC_TASK_STATE_META[t.state];
            return [
              <div key="n" style={{ minWidth: 0 }} title={`${t.name}（${t.id}）`}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text,
                    lineHeight: 1.4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.name}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2, whiteSpace: "nowrap" }}>{t.id}</div>
              </div>,
              <div
                key="d"
                title={t.dataset}
                style={{
                  fontSize: 12,
                  color: C.sub,
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t.dataset}
              </div>,
              <div key="t" style={{ display: "flex", gap: 4, flexWrap: "nowrap", overflow: "hidden" }}>
                {t.tags.slice(0, 2).map((k) => (
                  <span
                    key={k}
                    title={`${DETECTOR_MAP[k].name} · ${QC_TAG_CODE[k]}`}
                    style={{
                      fontSize: 11,
                      lineHeight: "18px",
                      padding: "0 7px",
                      borderRadius: 4,
                      color: DETECTOR_MAP[k].tone,
                      background: `${DETECTOR_MAP[k].tone}12`,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {QC_TAG_SHORT[k]}
                  </span>
                ))}
                {t.tags.length > 2 && (
                  <span style={{ fontSize: 11, lineHeight: "18px", color: C.faint, whiteSpace: "nowrap" }} title={t.tags.slice(2).map((k) => QC_TAG_SHORT[k]).join("、")}>
                    +{t.tags.length - 2}
                  </span>
                )}
              </div>,
              <span key="tt" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
                {t.total.toLocaleString()}
              </span>,
              <span
                key="f"
                style={{ fontSize: 13, fontWeight: 600, color: t.found > 0 ? (v === "fail" ? C.danger : C.text) : C.faint, whiteSpace: "nowrap" }}
              >
                {t.state !== "done" ? "—" : t.found}
              </span>,
              <span key="r" style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
                <span style={{ fontSize: 12, color: v === "fail" ? C.danger : C.text, fontWeight: v === "fail" ? 600 : 400 }}>
                  {t.state !== "done" ? "—" : `${rate.toFixed(2)}%`}
                </span>
                {t.state === "done" && <span style={{ fontSize: 11, color: C.faint }}>/ {t.threshold}%</span>}
              </span>,
              <div key="v" style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
                {t.state === "running" ? (
                  <Tag tone={QC_TASK_STATE_META.running.tone} soft={QC_TASK_STATE_META.running.soft}>
                    <RefreshCw size={10} style={{ animation: "spin 1s linear infinite" }} />
                    检测中
                  </Tag>
                ) : t.state === "failed" ? (
                  <Tag tone={sm.tone} soft={sm.soft}>
                    {sm.label}
                  </Tag>
                ) : (
                  <Tag tone={vm.tone} soft={vm.soft}>
                    {vm.label}
                  </Tag>
                )}
              </div>,
              <div key="o" style={{ whiteSpace: "nowrap" }}>
                {t.state === "done" && v === "pass" && t.reportId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/quality/report/${t.reportId}`);
                    }}
                    style={{ ...LINK_BTN, color: C.primary }}
                    title={`查看质量报告 ${t.reportId}`}
                  >
                    <FileText size={12} />
                    {t.reportId}
                  </button>
                )}
                {t.state === "done" && v === "fail" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/quality/ticket/${t.ticketIds[0]}`);
                    }}
                    style={{ ...LINK_BTN, color: C.danger }}
                    title={`查看问题工单 ${t.ticketIds.join("、")}`}
                  >
                    <FileWarning size={12} />
                    {t.ticketIds.length} 张工单
                  </button>
                )}
                {(t.state === "running" || t.state === "failed") && (
                  <span style={{ fontSize: 12, color: C.faint }}>—</span>
                )}
              </div>,
              <span key="s" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
                {t.startedAt}
              </span>,
              <div key="a" style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <IconBtn icon={<Eye size={13} />} label="查看任务详情" onClick={() => setDetailId(t.id)} />
                {t.state === "done" && v === "pass" && t.reportId && (
                  <IconBtn
                    icon={<FileText size={13} />}
                    label="查看质量报告"
                    tone="primary"
                    onClick={() => router.push(`/quality/report/${t.reportId}`)}
                  />
                )}
                {t.state === "done" && v === "fail" && (
                  <IconBtn
                    icon={<FileWarning size={13} />}
                    label="查看问题工单"
                    tone="danger"
                    onClick={() => router.push(`/quality/ticket/${t.ticketIds[0]}`)}
                  />
                )}
                {(t.state === "done" || t.state === "failed") && (
                  <IconBtn
                    icon={<RefreshCw size={13} />}
                    label="按当前规则标签重跑"
                    tone="ghost"
                    onClick={() => {
                      const id = `QDJ-2026-1020-${String(seq).padStart(2, "0")}`;
                      setSeq((s) => s + 1);
                      setTasks((prev) => [
                        {
                          ...t,
                          id,
                          name: `${t.dataset.replace("数据集", "")} · ${t.batch} 重跑`,
                          total: t.total,
                          found: 0,
                          state: "running",
                          verdict: "pending",
                          reportId: undefined,
                          ticketIds: [],
                          startedAt: "2026-10-20 17:52",
                          cost: "运行 0 分钟",
                        },
                        ...prev,
                      ]);
                      toast.success(`已按原规则标签重跑，任务 ${id}`);
                    }}
                  />
                )}
              </div>,
            ];
          })}
        />

        {filtered.length === 0 && (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <div style={{ fontSize: 13, color: C.sub }}>没有符合条件的检测任务</div>
            <div style={{ fontSize: 12, color: C.faint, marginTop: 6 }}>换个数据集或规则标签试试，或直接发起一次检测</div>
            <div style={{ marginTop: 14 }}>
              <Btn size="sm" onClick={resetFilters}>
                清空筛选条件
              </Btn>
            </div>
          </div>
        )}
      </Panel>

      {/* ---------- 任务详情抽屉 ---------- */}
      {detail && (
        <div
          onClick={() => setDetailId(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.32)", zIndex: 900 }}
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: 560,
              maxWidth: "94vw",
              background: "#fff",
              boxShadow: "-12px 0 40px rgba(15,23,42,.18)",
              display: "flex",
              flexDirection: "column",
              zIndex: 901,
            }}
          >
            <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>{detail.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                  <span style={{ fontSize: 11, color: C.faint }}>{detail.id}</span>
                  <Tag tone={QC_TASK_STATE_META[detail.state].tone} soft={QC_TASK_STATE_META[detail.state].soft}>
                    {QC_TASK_STATE_META[detail.state].label}
                  </Tag>
                  {detail.state === "done" && (
                    <Tag tone={QC_VERDICT_META[verdictOf(detail)].tone} soft={QC_VERDICT_META[verdictOf(detail)].soft}>
                      {QC_VERDICT_META[verdictOf(detail)].label}
                    </Tag>
                  )}
                </div>
              </div>
              <IconBtn icon={<X size={14} />} label="关闭" onClick={() => setDetailId(null)} />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18 }}>
              {/* 任务信息 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 18px", fontSize: 12 }}>
                {[
                  ["数据集", detail.dataset],
                  ["关联批次", detail.batch],
                  ["检测样本", detail.total.toLocaleString()],
                  ["检出问题", detail.state === "done" ? `${detail.found} 条` : "—"],
                  ["异常率", detail.state === "done" ? `${failRateOf(detail).toFixed(2)}%` : "—"],
                  ["异常率阈值", `${detail.threshold}%`],
                  ["开始时间", detail.startedAt],
                  ["耗时", detail.cost],
                  ["发起人", detail.operator],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, paddingBottom: 8, borderBottom: `1px solid ${C.borderSoft}` }}>
                    <span style={{ color: C.faint }}>{k}</span>
                    <span style={{ color: C.text, fontWeight: 500, textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* 规则标签执行明细 */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                  规则标签执行结果 <span style={{ fontSize: 12, fontWeight: 400, color: C.faint }}>· 每个标签的检出量</span>
                </div>
                <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                  {tagHitsOf(detail).map((h) => {
                    const pct = detail.found ? (h.hits / detail.found) * 100 : 0;
                    return (
                      <div
                        key={h.key}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: `1px solid ${C.borderSoft}` }}
                      >
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: h.tone, flexShrink: 0 }} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{h.name}</div>
                          <div style={{ fontSize: 11, color: C.faint, marginTop: 1 }}>
                            {h.code} · F1 {h.f1}% · 占比 {pct.toFixed(1)}%
                          </div>
                        </div>
                        <div style={{ width: 96 }}>
                          <Bar pct={pct} tone={h.tone} h={4} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: C.text, width: 42, textAlign: "right" }}>{h.hits}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 结论与产出 */}
              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>检测结论</div>
                {detail.state === "running" && (
                  <div style={{ border: "1px solid #bfdbfe", background: "#eff6ff", borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#2563eb" }}>
                      <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> 检测进行中
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", marginTop: 6, lineHeight: 1.6 }}>
                      任务完成后按异常率 {detail.threshold}% 自动判定：正常则输出质量报告，异常则转问题工单。
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Bar pct={62} tone="#2563eb" h={5} />
                    </div>
                  </div>
                )}

                {detail.state === "failed" && (
                  <div style={{ border: `1px solid ${C.border}`, background: C.bg, borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>任务已中断</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 6, lineHeight: 1.6 }}>
                      {detail.cost} · 检测节点 GPU 显存不足，标签 {detail.tags.map((k) => QC_TAG_SHORT[k]).join("、")} 未跑完，未产生结论与产出。
                    </div>
                  </div>
                )}

                {detail.state === "done" && verdictOf(detail) === "pass" && (
                  <div style={{ border: "1px solid #bbf7d0", background: "#f0fdf4", borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                      <Check size={14} /> 结果正常 · 已输出质量报告
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", marginTop: 6, lineHeight: 1.6 }}>
                      异常率 {failRateOf(detail).toFixed(2)}%，低于阈值 {detail.threshold}%，报告 {detail.reportId} 已归入数据集质量档案。
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Btn size="sm" tone="success" icon={<FileText size={12} />} onClick={() => router.push(`/quality/report/${detail.reportId}`)}>
                        查看质量报告 {detail.reportId}
                      </Btn>
                    </div>
                  </div>
                )}

                {detail.state === "done" && verdictOf(detail) === "fail" && (
                  <div style={{ border: "1px solid #fecaca", background: "#fef2f2", borderRadius: 8, padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#b91c1c" }}>
                      <FileWarning size={14} /> 结果异常 · 已自动转问题工单
                    </div>
                    <div style={{ fontSize: 12, color: "#334155", marginTop: 6, lineHeight: 1.6 }}>
                      异常率 {failRateOf(detail).toFixed(2)}%，超出阈值 {detail.threshold}%，按规则标签与责任归属拆分为 {detail.ticketIds.length} 张工单。
                    </div>
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                      {detail.ticketIds.map((tid) => {
                        const tk = TICKET_MAP[tid];
                        return (
                          <button
                            key={tid}
                            onClick={() => router.push(`/quality/ticket/${tid}`)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "7px 10px",
                              border: "1px solid #fecaca",
                              borderRadius: 6,
                              background: "#fff",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            <span style={{ fontSize: 11, color: C.faint, fontFamily: "monospace" }}>{tid}</span>
                            <span style={{ flex: 1, fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {tk ? tk.title : "问题工单"}
                            </span>
                            <ArrowRight size={12} style={{ color: C.faint, flexShrink: 0 }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 问题样本（异常任务） */}
              {detail.state === "done" && verdictOf(detail) === "fail" && (
                <div style={{ marginTop: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8 }}>问题样本</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {QC_SAMPLES.filter((s) => s.dataset === detail.dataset && detail.tags.includes(s.detector))
                      .slice(0, 4)
                      .map((s) => (
                        <div key={s.id} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: "9px 11px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: C.faint, fontFamily: "monospace" }}>{s.sampleId}</span>
                            <code style={{ fontSize: 11, color: "#4338ca" }}>{s.field}</code>
                            <span style={{ marginLeft: "auto", fontSize: 11, color: C.faint }}>置信度 {Math.round(s.confidence * 100)}%</span>
                          </div>
                          <div style={{ fontSize: 12, color: C.text, marginTop: 4, lineHeight: 1.55 }}>{s.content}</div>
                          <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{s.reason}</div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 18px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn onClick={() => setDetailId(null)}>关闭</Btn>
              {detail.state === "done" && verdictOf(detail) === "pass" && detail.reportId && (
                <Btn tone="primary" icon={<FileText size={13} />} onClick={() => router.push(`/quality/report/${detail.reportId}`)}>
                  查看质量报告
                </Btn>
              )}
              {detail.state === "done" && verdictOf(detail) === "fail" && (
                <Btn tone="danger" icon={<FileWarning size={13} />} onClick={() => router.push(`/quality/ticket/${detail.ticketIds[0]}`)}>
                  查看问题工单
                </Btn>
              )}
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
