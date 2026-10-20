"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Download, Eye, RotateCcw, Search, SearchX, X } from "lucide-react";
import { C, Panel, Table, Tag, Dot, Btn, IconBtn, scrollArea, Segmented } from "./ui";
import { REPORTS } from "./mock";

type Period = "day" | "week" | "month";
type Report = (typeof REPORTS)[number];

const TABS: { key: Period; label: string }[] = [
  { key: "day", label: "日报" },
  { key: "week", label: "周报" },
  { key: "month", label: "月报" },
];

const PERIOD_OF: Record<Period, string> = { day: "每日", week: "每周", month: "每月" };

const TYPES = Array.from(new Set(REPORTS.map((r) => r.type)));

const ctrlStyle: React.CSSProperties = {
  height: 30,
  padding: "0 8px",
  fontSize: 12,
  color: C.text,
  background: "#fff",
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: C.faint, whiteSpace: "nowrap" }}>{label}</span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------- 报表内容（FNV 稳定伪随机，刷新不变）
function fnv(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const num = (seed: string, min: number, max: number) => min + (fnv(seed) % (max - min + 1));
const dec = (seed: string, min: number, max: number) =>
  (min + (fnv(seed) % ((max - min) * 10 + 1)) / 10).toFixed(1);

type Kpi = { label: string; value: string; unit: string; tone: string };
type Block = { title: string; rows: { k: string; v: string }[] };

function buildReport(r: Report): { kpis: Kpi[]; blocks: Block[]; note: string } {
  const id = r.id;

  if (r.type === "资源利用率报表") {
    return {
      kpis: [
        { label: "GPU 利用率", value: dec(id + "g", 62, 88), unit: "%", tone: C.primary },
        { label: "CPU 利用率", value: dec(id + "c", 38, 66), unit: "%", tone: C.info },
        { label: "存储占用", value: dec(id + "s", 52, 79), unit: "%", tone: C.teal },
        { label: "平均排队", value: String(num(id + "q", 2, 9)), unit: "分钟", tone: C.purple },
      ],
      blocks: [
        {
          title: "集群资源消耗",
          rows: [
            { k: "GPU 卡时", v: `${num(id + "gh", 1200, 4800).toLocaleString()} 卡时` },
            { k: "CPU 核时", v: `${num(id + "ch", 12000, 38000).toLocaleString()} 核时` },
            { k: "存储增长", v: `+${dec(id + "sg", 1, 9)} TB` },
          ],
        },
        {
          title: "调度情况",
          rows: [
            { k: "调度次数", v: `${num(id + "sc", 240, 900)} 次` },
            { k: "抢占次数", v: `${num(id + "pr", 0, 4)} 次` },
            { k: "平均等待", v: `${num(id + "wt", 2, 11)} 分钟` },
          ],
        },
      ],
      note: "GPU 池在 14:00–17:00 处于高水位，建议将非紧急的预标注任务错峰至夜间；C 池仍有约 30% 余量可用于弹性扩容。",
    };
  }

  if (r.type === "质量趋势报表") {
    return {
      kpis: [
        { label: "质检通过率", value: dec(id + "p", 90, 97), unit: "%", tone: C.success },
        { label: "标注一致性", value: dec(id + "a", 88, 96), unit: "%", tone: C.primary },
        { label: "缺陷密度", value: String(num(id + "d", 2, 9)), unit: "条/千条", tone: "#b45309" },
        { label: "返工率", value: dec(id + "r", 2, 8), unit: "%", tone: "#d97706" },
      ],
      blocks: [
        {
          title: "质检结果",
          rows: [
            { k: "抽检样本", v: `${num(id + "sp", 8000, 26000).toLocaleString()} 条` },
            { k: "不合格样本", v: `${num(id + "ng", 120, 760)} 条` },
            { k: "主要问题", v: "类别混淆 / 框选偏移 / 漏标" },
          ],
        },
        {
          title: "问题归因",
          rows: [
            { k: "标注员一致性", v: `${dec(id + "ia", 86, 95)} %` },
            { k: "规则命中率", v: `${dec(id + "hr", 72, 93)} %` },
            { k: "复检覆盖率", v: `${dec(id + "cr", 30, 68)} %` },
          ],
        },
      ],
      note: "通过率较上周期小幅回升，但「类别混淆」仍占不合格样本的一半以上，建议针对行人 / 骑行人类别补充 200 条难例，并复训相关标注员。",
    };
  }

  if (r.type === "成本核算表") {
    const mom = num(id + "m", -9, 6);
    return {
      kpis: [
        { label: "算力成本", value: dec(id + "p", 18, 42), unit: "万元", tone: C.primary },
        { label: "人力成本", value: dec(id + "l", 9, 22), unit: "万元", tone: C.info },
        { label: "单位成本", value: dec(id + "u", 12, 26), unit: "元/万条", tone: C.teal },
        { label: "环比", value: `${mom}`, unit: "%", tone: mom <= 0 ? C.success : C.danger },
      ],
      blocks: [
        {
          title: "成本构成",
          rows: [
            { k: "算力（含存储）", v: `¥ ${dec(id + "c1", 12, 30)} 万` },
            { k: "人工标注", v: `¥ ${dec(id + "c2", 7, 19)} 万` },
            { k: "平台摊销", v: `¥ ${dec(id + "c3", 1, 5)} 万` },
          ],
        },
        {
          title: "环比变化",
          rows: [
            { k: "单位成本", v: `${dec(id + "m1", -12, 4)} %` },
            { k: "产出量", v: `+${dec(id + "m2", 1, 18)} %` },
            { k: "成本效率", v: `+${dec(id + "m3", 2, 21)} %` },
          ],
        },
      ],
      note: "产出量增长快于成本增长，单位成本继续下行；下周期可通过提高预标注占比，进一步压缩人工标注成本。",
    };
  }

  return {
    kpis: [
      { label: "完成任务", value: String(num(id + "t", 118, 186)), unit: "个", tone: C.primary },
      { label: "产出数据集", value: String(num(id + "d", 42, 78)), unit: "个", tone: C.info },
      { label: "交付批次", value: String(num(id + "b", 6, 14)), unit: "批", tone: C.teal },
      { label: "按时交付率", value: dec(id + "r", 93, 99), unit: "%", tone: C.success },
    ],
    blocks: [
      {
        title: "生产产出",
        rows: [
          { k: "总产出记录", v: `${num(id + "rec", 86, 268)}.${num(id + "rec2", 0, 9)} 万条` },
          { k: "平均单任务耗时", v: `${num(id + "dur", 42, 96)} 分钟` },
          { k: "峰值并发任务", v: `${num(id + "cc", 8, 18)} 个` },
        ],
      },
      {
        title: "交付情况",
        rows: [
          { k: "交付数据集", v: `${num(id + "ds", 6, 14)} 个` },
          { k: "质检驳回返工", v: `${num(id + "rw", 0, 3)} 个` },
          { k: "平均交付周期", v: `${num(id + "cy", 2, 6)}.${num(id + "cy2", 0, 9)} 天` },
        ],
      },
    ],
    note: "整体产出与上周期基本持平，交付节奏稳定；交通事件识别产线仍是主要产能来源，建议关注其质检返工对交付周期的影响。",
  };
}

// ---------------------------------------------------------------- 导出 CSV（真实下载）
function exportCsv(rows: Report[]) {
  const head = ["报表编号", "报表名称", "所属周期", "类型", "生成时间", "状态", "大小"];
  const body = rows.map((r) => [r.id, r.name, r.periodValue, r.type, r.generated, r.status, r.size]);
  const csv = [head, ...body]
    .map((cols) => cols.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download =
    rows.length === 1
      ? `${rows[0].name}_${rows[0].periodValue.replace(/[\s~]/g, "")}.csv`
      : "报表清单.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------- 查看报表 · 预览弹窗
function ReportPreview({ report, onClose }: { report: Report; onClose: () => void }) {
  const { kpis, blocks, note } = buildReport(report);
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
        zIndex: 90,
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 720,
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 20px 50px rgba(15,23,42,.22)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "16px 18px 14px",
            borderBottom: `1px solid ${C.borderSoft}`,
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 1,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{report.name}</span>
              <Tag tone={C.primary} soft={C.primarySoft}>
                {report.periodValue}
              </Tag>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 5 }}>
              {report.id} · {report.type} · 生成于 {report.generated} · {report.size}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="关闭"
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: C.faint,
              display: "flex",
              padding: 2,
            }}
          >
            <X size={17} />
          </button>
        </div>

        <div style={{ padding: "16px 18px 18px" }}>
          {report.status !== "已生成" && (
            <div
              style={{
                marginBottom: 14,
                padding: "8px 10px",
                borderRadius: 6,
                background: C.warnSoft,
                color: "#b45309",
                fontSize: 12,
              }}
            >
              该报表仍在生成中，以下为增量预览，完成后以正式版本为准。
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
            {kpis.map((k) => (
              <div key={k.label} style={{ background: C.bg, borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 11, color: C.faint }}>{k.label}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 4 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, color: k.tone, lineHeight: 1.1 }}>{k.value}</span>
                  <span style={{ fontSize: 11, color: C.sub }}>{k.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {blocks.map((b) => (
            <div key={b.title} style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 3, height: 13, borderRadius: 2, background: C.primary }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{b.title}</span>
              </div>
              <div style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 8, overflow: "hidden" }}>
                {b.rows.map((row, i) => (
                  <div
                    key={row.k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      padding: "8px 12px",
                      fontSize: 12.5,
                      background: i % 2 ? C.bg : "#fff",
                    }}
                  >
                    <span style={{ color: C.sub }}>{row.k}</span>
                    <span style={{ color: C.text, fontWeight: 500 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 18,
              padding: "10px 12px",
              borderRadius: 8,
              background: C.primarySoft,
              border: `1px solid ${C.primary}22`,
              fontSize: 12.5,
              color: C.text,
              lineHeight: 1.75,
            }}
          >
            <span style={{ fontWeight: 600 }}>结论与建议　</span>
            {note}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            padding: "12px 18px",
            borderTop: `1px solid ${C.borderSoft}`,
            position: "sticky",
            bottom: 0,
            background: "#fff",
          }}
        >
          <Btn size="sm" onClick={onClose}>
            关闭
          </Btn>
          <Btn size="sm" tone="primary" icon={<Download size={12} />} onClick={() => exportCsv([report])}>
            导出 CSV
          </Btn>
        </div>
      </div>
    </div>
  );
}

export default function ReportView() {
  const [tab, setTab] = useState<Period>("day");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("");
  const [type, setType] = useState("全部");
  const [kw, setKw] = useState("");
  const [preview, setPreview] = useState<Report | null>(null);

  const changeTab = (k: Period) => {
    setTab(k);
    setDate("");
    setFrom("");
    setTo("");
    setMonth("");
  };

  const rows = useMemo(() => {
    const q = kw.trim().toLowerCase();
    return REPORTS.filter((r) => r.period === PERIOD_OF[tab])
      .filter((r) => type === "全部" || r.type === type)
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q))
      .filter((r) => {
        if (tab === "day") return !date || r.periodValue === date;
        if (tab === "month") return !month || r.periodValue === month;
        if (!from && !to) return true;
        const [s, e] = r.periodValue.split(" ~ ");
        if (from && s < from) return false;
        if (to && e > to) return false;
        return true;
      });
  }, [tab, date, from, to, month, type, kw]);

  const dirty =
    date !== "" || from !== "" || to !== "" || month !== "" || type !== "全部" || kw.trim() !== "";

  const reset = () => {
    setDate("");
    setFrom("");
    setTo("");
    setMonth("");
    setType("全部");
    setKw("");
  };

  const done = rows.filter((r) => r.status === "已生成").length;

  return (
    <div style={scrollArea}>
      <Segmented items={TABS} value={tab} onChange={changeTab} />

      <Panel
        title={`${TABS.find((t) => t.key === tab)?.label}列表`}
        desc={`共 ${rows.length} 份 · 已生成 ${done} 份`}
        style={{ marginTop: 12 }}
        bodyStyle={{ padding: 0 }}
      >
        {/* 查询条件：所属周期（随 tab 变形态） / 类型 / 名称 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 16,
            padding: "12px 14px",
            borderBottom: `1px solid ${C.borderSoft}`,
            background: "#fff",
          }}
        >
          <Field label="所属周期">
            {tab === "day" && (
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ ...ctrlStyle, width: 148 }}
              />
            )}
            {tab === "week" && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ ...ctrlStyle, width: 148 }}
                />
                <span style={{ fontSize: 12, color: C.faint }}>~</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ ...ctrlStyle, width: 148 }}
                />
              </div>
            )}
            {tab === "month" && (
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{ ...ctrlStyle, width: 132 }}
              />
            )}
          </Field>

          <Field label="类型">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ ...ctrlStyle, width: 156, cursor: "pointer" }}
            >
              <option value="全部">全部类型</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="名称">
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: 9, top: 9, color: C.faint }} />
              <input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="报表名称 / 编号"
                style={{ ...ctrlStyle, width: 200, paddingLeft: 28 }}
              />
            </div>
          </Field>

          <Btn size="sm" icon={<RotateCcw size={12} />} onClick={reset} disabled={!dirty}>
            重置
          </Btn>
        </div>

        {rows.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "52px 0",
              color: C.faint,
            }}
          >
            <SearchX size={28} strokeWidth={1.5} />
            <div style={{ fontSize: 13 }}>没有符合条件的报表</div>
            <div style={{ fontSize: 12 }}>请调整所属周期、类型或名称后重试</div>
            <Btn size="sm" onClick={reset}>
              清空查询条件
            </Btn>
          </div>
        ) : (
          <Table
            head={["报表名称", "所属周期", "类型", "生成时间", "状态", "大小", "操作"]}
            widths={["27%", "21%", "15%", "16%", "9%", "6%", "6%"]}
            rows={rows.map((r) => [
              <div key="n">
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{r.id}</div>
              </div>,
              <span
                key="p"
                style={{
                  fontSize: 12,
                  color: C.text,
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {r.periodValue}
              </span>,
              <span key="t" style={{ fontSize: 12, color: C.sub }}>
                {r.type}
              </span>,
              <span key="g" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
                <Calendar size={11} style={{ marginRight: 5, verticalAlign: -1, color: C.faint }} />
                {r.generated}
              </span>,
              <Tag
                key="s"
                tone={r.status === "已生成" ? C.success : "#b45309"}
                soft={r.status === "已生成" ? C.successSoft : C.warnSoft}
              >
                <Dot tone={r.status === "已生成" ? C.success : "#f59e0b"} pulse={r.status !== "已生成"} />
                {r.status}
              </Tag>,
              <span key="z" style={{ fontSize: 12, color: C.faint }}>
                {r.size}
              </span>,
              <div key="a" style={{ display: "flex", gap: 6 }}>
                <IconBtn
                  size="sm"
                  tone="primary"
                  icon={<Eye size={13} />}
                  label="查看报表"
                  onClick={() => setPreview(r)}
                />
                <IconBtn
                  size="sm"
                  tone="ghost"
                  icon={<Download size={13} />}
                  label="导出 CSV"
                  onClick={() => exportCsv([r])}
                />
              </div>,
            ])}
            rowKey={(i) => "rep" + i}
          />
        )}
      </Panel>

      {preview && <ReportPreview report={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}
