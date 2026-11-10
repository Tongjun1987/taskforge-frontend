"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Sparkles, Plus, Eye, ArrowLeft, ArrowLeftRight, Info, Download, Search, RotateCcw, Layers,
  TrendingUp, Target, Clock, FileCheck2, Database, CheckCircle2, Trash2,
  BookOpen, ArrowRight, AlertTriangle, Wand2, Gauge,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  C, Panel, Metric, Table, Tag, Btn, IconBtn, Bar, Grid, Spark, LineChart,
} from "@/components/production/ui";
import {
  FINETUNE_EXPS, EXP_DATASETS, BASE_MODELS, FINETUNE_METHODS, FINETUNE_TASKS, WHAT_TO_EVAL,
  FINETUNE_CFG, expDataset, avg, finetuneGain, finetuneDomainGain, finetuneBest, finetuneScore,
  mixKey, mixLabel, type FinetuneExp,
} from "@/components/model-exp/expData";
import {
  ExpHeader, Tabs, StatusTag, Field, Sel, NumInput, TextInput, Chips, SectionTitle, Empty,
} from "@/components/model-exp/ui";

type TabKey = "list" | "compare" | "new";

const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
const signed = (v: number, d = 1) => `${v >= 0 ? "+" : ""}${v.toFixed(d)}`;
const gainTone = (v: number) => (v >= 10 ? C.success : v >= 5 ? C.info : v > 0 ? C.warn : C.danger);
const forgetTone = (v: number) => (v <= 1 ? C.success : v <= 2 ? C.warn : C.danger);

// ================================================================
// 列表
// ================================================================
function FinetuneList({
  exps, onOpen, onCompare, onStop,
}: {
  exps: FinetuneExp[];
  onOpen: (id: string) => void;
  onCompare: (id: string) => void;
  onStop: (id: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [kw, setKw] = useState("");

  const rows = useMemo(
    () =>
      exps.filter(
        (e) =>
          (!status || e.status === status) &&
          (!method || e.method === method) &&
          (!kw || e.name.includes(kw) || e.baseModel.includes(kw) || e.id.includes(kw))
      ),
    [exps, status, method, kw]
  );

  return (
    <Panel
      title="微调评估试验"
      desc="面向大模型微调场景，验证数据集在大模型适配场景下的效果"
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sel value={status} onChange={setStatus} options={["运行中", "已完成", "排队中", "已终止"]} placeholder="全部状态" />
          <Sel value={method} onChange={setMethod} options={[...FINETUNE_METHODS]} placeholder="全部微调方式" />
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索试验 / 基础模型"
              style={{
                width: 190, height: 34, paddingLeft: 28, paddingRight: 10, fontSize: 12.5,
                border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <Table
        head={["试验", "基础模型 / 微调方式", "数据配方", "状态", "下游任务提升", "通用能力回落", "领域知识注入", "开始时间", "操作"]}
        widths={["196px", "176px", "210px", "86px", "110px", "112px", "112px", "112px", "118px"]}
        rowKey={(i) => rows[i].id}
        rows={rows.map((e) => {
          const gain = finetuneGain(e);
          const domainGain = avg(e.domain.map((d) => d.after - d.before));
          return [
            <div key="n">
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, lineHeight: 1.45 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.id} · {e.gpu}</div>
            </div>,
            <div key="m">
              <div style={{ fontSize: 12.5, color: C.text }}>{e.baseModel}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.method} · {e.duration}</div>
            </div>,
            <div key="mix">
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 4 }}>
                {e.mix.map((m) => (
                  <Tag key={m.datasetId} tone={C.primary}>{m.ratio}%</Tag>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.5 }}>
                {e.mix.map((m) => (expDataset(m.datasetId)?.name || m.datasetId).replace(/数据集$/, "")).join(" / ")}
              </div>
            </div>,
            <div key="s">
              <StatusTag status={e.status} />
              {e.status === "运行中" && (
                <div style={{ marginTop: 5, width: 62 }}><Bar pct={e.progress} tone={C.info} h={4} /></div>
              )}
            </div>,
            <div key="g">
              {e.status === "已完成" ? (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, color: gainTone(gain), lineHeight: 1.1 }}>{signed(gain)}pt</div>
                  <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>下游任务均值</div>
                </>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="f" style={{ fontSize: 12 }}>
              {e.status === "已完成" ? (
                <Tag tone={forgetTone(e.forget)}>{e.forget.toFixed(1)}pt</Tag>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="d" style={{ fontSize: 12 }}>
              {e.status === "已完成" ? (
                <span style={{ color: C.text, fontWeight: 600 }}>{signed(domainGain)}pt</span>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="t" style={{ fontSize: 11.5, color: C.sub, whiteSpace: "nowrap" }}>{e.startedAt}</div>,
            <div key="a" style={{ display: "flex", gap: 5 }}>
              <IconBtn size="sm" tone="primary" icon={<Eye size={13} />} label="查看评估报告" onClick={() => onOpen(e.id)} />
              {e.status === "已完成" && (
                <IconBtn size="sm" icon={<ArrowLeftRight size={13} />} label="加入对照实验" onClick={() => onCompare(e.id)} />
              )}
              {e.status === "运行中" && (
                <IconBtn size="sm" tone="danger" icon={<Trash2 size={13} />} label="终止试验" onClick={() => onStop(e.id)} />
              )}
            </div>,
          ];
        })}
      />
      {rows.length === 0 && <Empty text="没有符合条件的微调试验" />}
    </Panel>
  );
}

// ================================================================
// 对照实验：两个微调试验的结果比对
// 与训练评估的口径差异：训练比的是「同一模型 / 不同数据集」，
// 微调比的是「不同数据配比 / 不同微调策略」——所以配置对照表列的是
// 数据配方、微调方式、LoRA 秩、学习率、可训练参数，而不是数据集与训练框架。
// ================================================================
type Dir = "high" | "low";

const VERDICT_EPS = 0.05;

function verdictOf(d: number, dir: Dir) {
  if (Math.abs(d) < VERDICT_EPS) return { text: "持平", tone: C.faint };
  const good = dir === "high" ? d > 0 : d < 0;
  return { text: good ? "更优" : "更差", tone: good ? C.success : C.danger };
}

const durMinutes = (d: string) => {
  const h = /(\d+)h/.exec(d);
  const m = /(\d+)m/.exec(d);
  return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
};

const ratioLabel = (exp: FinetuneExp) => exp.mix.map((m) => m.ratio).join(" : ");
const domainRatio = (exp: FinetuneExp) => Math.max(...exp.mix.map((m) => m.ratio), 0);

/** 单个微调试验的结果卡：微调侧四项核心指标 + loss 曲线 */
function FinetuneResultCard({
  role, exp, tone, onOpen,
}: {
  role: string;
  exp: FinetuneExp;
  tone: string;
  onOpen: (id: string) => void;
}) {
  const cfg = FINETUNE_CFG[exp.id];
  const gain = finetuneGain(exp);
  const domainGain = finetuneDomainGain(exp);
  const vals = exp.loss;
  const cur = vals.length ? vals[vals.length - 1] : 0;
  const low = vals.length ? Math.min(...vals) : 0;
  const drop = vals.length && vals[0] ? ((vals[0] - low) / vals[0]) * 100 : 0;
  const perEpoch = cfg?.epochs ? durMinutes(exp.duration) / cfg.epochs : 0;

  const tiles = [
    { k: "下游任务平均提升", v: `${signed(gain)}pt`, hint: `${exp.tasks.filter((t) => !t.task.includes("通用")).length} 项任务均值` },
    { k: "领域知识注入", v: `${signed(domainGain)}pt`, hint: `${exp.domain.length} 项领域指标` },
    { k: "通用能力回落", v: `${exp.forget.toFixed(1)}pt`, hint: "≤2pt 为可接受" },
    { k: "训练耗时", v: exp.duration, hint: `${cfg?.epochs ?? "-"} 轮 · ${exp.gpu}` },
  ];

  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", background: "#fff", minWidth: 0 }}>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8, padding: "9px 12px",
          background: `${tone}0d`, borderBottom: `1px solid ${C.borderSoft}`,
        }}
      >
        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: tone, borderRadius: 4, padding: "2px 6px", letterSpacing: 0.2 }}>
          {role}
        </span>
        <span
          title={exp.name}
          style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {exp.name}
        </span>
        <StatusTag status={exp.status} />
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 11, color: C.faint, marginBottom: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {exp.id} ｜ {exp.baseModel} ｜ {exp.method} ｜ 配方 {ratioLabel(exp)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {tiles.map((t) => (
            <div key={t.k} style={{ border: `1px solid ${C.borderSoft}`, borderRadius: 6, padding: "7px 9px", background: C.bg, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, color: C.faint, whiteSpace: "nowrap" }}>{t.k}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.35, marginTop: 1, whiteSpace: "nowrap" }}>{t.v}</div>
              <div style={{ fontSize: 10.5, color: C.faint, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.hint}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, margin: "12px 0 2px" }}>微调 loss 曲线</div>
        {vals.length ? (
          <LineChart
            labels={vals.map((_, i) => `S${i + 1}`)}
            series={[{ name: "loss", color: tone, data: vals }]}
            height={150}
          />
        ) : (
          <Empty text="尚未产生 loss 记录" />
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 11, marginTop: 6, paddingTop: 8, borderTop: `1px solid ${C.borderSoft}` }}>
          <span style={{ color: C.faint }}>当前 <b style={{ color: C.text }}>{cur.toFixed(3)}</b></span>
          <span style={{ color: C.faint }}>最低 <b style={{ color: C.success }}>{low.toFixed(3)}</b></span>
          <span style={{ color: C.faint }}>下降 <b style={{ color: C.info }}>{drop.toFixed(1)}%</b></span>
          <span style={{ color: C.faint }}>
            均速 <b style={{ color: C.warn }}>{perEpoch ? (perEpoch >= 1 ? `${perEpoch.toFixed(1)} min/轮` : `${Math.round(perEpoch * 60)} s/轮`) : "--"}</b>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
          <Btn size="sm" tone="plain" icon={<Eye size={12} />} onClick={() => onOpen(exp.id)}>
            查看该试验完整结果
          </Btn>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, text }: { color: string; text: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: C.sub }}>
      <span style={{ width: 10, height: 2, background: color, borderRadius: 2 }} />
      {text}
    </span>
  );
}

function FinetuneCompare({
  exps, pair, setPair, onOpen,
}: {
  exps: FinetuneExp[];
  pair: string[];
  setPair: (ids: string[]) => void;
  onOpen: (id: string) => void;
}) {
  const ready = exps.filter((e) => e.status === "已完成" && e.tasks.length > 0);
  const a = ready.find((e) => e.id === pair[0]) || ready[0];
  const b =
    ready.find((e) => e.id === pair[1] && e.id !== a?.id) ||
    ready.find((e) => e.id !== a?.id) ||
    ready[0];

  if (!a || !b || a.id === b.id) {
    return (
      <Panel title="对照实验" desc="以微调试验为单位，任选 2 个已完成评估的试验比对结果">
        <Empty text="至少需要 2 个已完成评估的微调试验才能对比" />
      </Panel>
    );
  }

  const cfgA = FINETUNE_CFG[a.id];
  const cfgB = FINETUNE_CFG[b.id];
  const sameModel = a.baseModel === b.baseModel;
  const sameMethod = a.method === b.method;
  const sameMix = mixKey(a) === mixKey(b);
  const sameHyper =
    !!cfgA && !!cfgB && cfgA.rank === cfgB.rank && cfgA.lr === cfgB.lr &&
    cfgA.epochs === cfgB.epochs && cfgA.seqLen === cfgB.seqLen;

  // 本次对比真正变化的变量（微调场景只有这 4 类算受控变量，样本量/耗时是结果不是变量）
  const vars: string[] = [];
  if (!sameModel) vars.push("基础模型");
  if (!sameMethod) vars.push("微调方式");
  if (!sameMix) vars.push("数据配方");
  if (!sameHyper) vars.push("微调超参");

  const caliber =
    vars.length === 0
      ? { tag: "配置一致 · 复跑稳定性", tone: C.faint, desc: "两个试验的模型、策略、配方与超参完全相同，结果差异应视为训练随机性波动，用于确认评估结论是否稳定" }
      : vars.length === 1
      ? {
          tag: `单一变量 · 比${vars[0]}`,
          tone: C.success,
          desc: {
            基础模型: `两个试验的配方、策略与超参一致，仅基础模型不同，结论用于模型选型`,
            微调方式: `两个试验同模型同配方，仅微调方式不同，结论用于选择低成本/高精度的微调策略`,
            数据配方: `两个试验同模型同策略，仅数据配比不同，结论用于确定最优数据配方`,
            微调超参: `两个试验同模型同配方同策略，仅 LoRA 秩 / 学习率 / 轮次不同，结论用于调参收敛`,
          }[vars[0]] || "",
        }
      : vars.length === 2
      ? { tag: `双变量 · ${vars.join(" + ")}`, tone: C.info, desc: "两个试验有 2 项变量同时变化，结果差异无法单独归因，建议固定其中一项后重跑再对比" }
      : { tag: "多变量 · 仅作参考", tone: C.warn, desc: "两个试验在多处配置上不同，数值不可直接分优劣，仅可作方向性参考" };

  const opts = ready.map((e) => ({ value: e.id, label: `${e.id} · ${e.name}` }));

  // ---------------- 指标差异 ----------------
  const gainA = finetuneGain(a);
  const gainB = finetuneGain(b);
  const domA = finetuneDomainGain(a);
  const domB = finetuneDomainGain(b);
  const scoreA = finetuneScore(a);
  const scoreB = finetuneScore(b);
  const bestA = finetuneBest(a);
  const bestB = finetuneBest(b);
  const dGain = gainB - gainA;
  const dDom = domB - domA;
  const dForget = b.forget - a.forget;
  const dScore = scoreB - scoreA;

  type DiffRow = { key: string; label: string; a: string; b: string; d: string; tone?: string; verdict: React.ReactNode };
  const diffRows: DiffRow[] = [
    {
      key: "score",
      label: "综合得分",
      ...(() => {
        const v = verdictOf(dScore, "high");
        return {
          tone: v.tone,
          a: `${scoreA}`,
          b: `${scoreB}`,
          d: `${dScore > 0 ? "+" : ""}${dScore.toFixed(1)}`,
          verdict: <Tag tone={v.tone}>{dScore > 0 ? "B 更优" : dScore < 0 ? "A 更优" : "持平"}</Tag>,
        };
      })(),
    },
    {
      key: "gain",
      label: "下游任务平均提升",
      ...(() => {
        const v = verdictOf(dGain, "high");
        return {
          tone: v.tone,
          a: `${signed(gainA)}pt`,
          b: `${signed(gainB)}pt`,
          d: `${dGain > 0 ? "+" : ""}${dGain.toFixed(1)}pt`,
          verdict: <Tag tone={v.tone}>{v.text}</Tag>,
        };
      })(),
    },
    {
      key: "best",
      label: "最佳单项",
      ...(() => {
        const v = verdictOf(bestB.gain - bestA.gain, "high");
        return {
          tone: v.tone,
          a: `${bestA.task} ${signed(bestA.gain)}pt`,
          b: `${bestB.task} ${signed(bestB.gain)}pt`,
          d: `${bestB.gain - bestA.gain > 0 ? "+" : ""}${(bestB.gain - bestA.gain).toFixed(1)}pt`,
          verdict: <Tag tone={v.tone}>{v.text}</Tag>,
        };
      })(),
    },
    {
      key: "dom",
      label: "领域知识注入",
      ...(() => {
        const v = verdictOf(dDom, "high");
        return {
          tone: v.tone,
          a: `${signed(domA)}pt`,
          b: `${signed(domB)}pt`,
          d: `${dDom > 0 ? "+" : ""}${dDom.toFixed(1)}pt`,
          verdict: <Tag tone={v.tone}>{v.text}</Tag>,
        };
      })(),
    },
    {
      key: "forget",
      label: "通用能力回落（越小越好）",
      ...(() => {
        const v = verdictOf(dForget, "low");
        return {
          tone: v.tone,
          a: `${a.forget.toFixed(1)}pt`,
          b: `${b.forget.toFixed(1)}pt`,
          d: `${dForget > 0 ? "+" : ""}${dForget.toFixed(1)}pt`,
          verdict: <Tag tone={v.tone}>{v.text}</Tag>,
        };
      })(),
    },
    {
      key: "cost",
      label: "训练耗时 / 算力",
      a: `${a.duration} · ${a.gpu}`,
      b: `${b.duration} · ${b.gpu}`,
      d: `${durMinutes(b.duration) - durMinutes(a.duration) > 0 ? "+" : ""}${durMinutes(b.duration) - durMinutes(a.duration)} min`,
      verdict: <span style={{ color: C.faint, fontSize: 11 }}>成本项 · 不参与判定</span>,
    },
  ];

  // ---------------- 配置对照（微调侧参数） ----------------
  // var = 受控变量（影响归因）；derived = 配方的派生结果（占比/样本量随配比联动，不算变量）；cost = 成本项
  type CfgKind = "var" | "derived" | "cost" | "same";
  const cfgRow = (label: string, av: string, bv: string, kind: CfgKind) => ({ label, av, bv, kind });
  const cfgRows = [
    cfgRow("基础模型", a.baseModel, b.baseModel, sameModel ? "same" : "var"),
    cfgRow("微调方式", a.method, b.method, sameMethod ? "same" : "var"),
    cfgRow("数据配方（领域 : 通用）", mixLabel(a.mix), mixLabel(b.mix), sameMix ? "same" : "var"),
    cfgRow("领域数据占比", `${domainRatio(a)}%`, `${domainRatio(b)}%`, domainRatio(a) === domainRatio(b) ? "same" : "derived"),
    cfgRow("LoRA 秩 / 缩放", cfgA?.rank || "-", cfgB?.rank || "-", cfgA?.rank === cfgB?.rank ? "same" : "var"),
    cfgRow("学习率", cfgA?.lr || "-", cfgB?.lr || "-", cfgA?.lr === cfgB?.lr ? "same" : "var"),
    cfgRow("微调轮次", cfgA ? `${cfgA.epochs} 轮` : "-", cfgB ? `${cfgB.epochs} 轮` : "-", cfgA?.epochs === cfgB?.epochs ? "same" : "var"),
    cfgRow("序列长度 / batch", cfgA ? `${cfgA.seqLen} / ${cfgA.batch}` : "-", cfgB ? `${cfgB.seqLen} / ${cfgB.batch}` : "-", cfgA && cfgB && (cfgA.seqLen !== cfgB.seqLen || cfgA.batch !== cfgB.batch) ? "var" : "same"),
    cfgRow("有效训练样本", cfgA ? `${cfgA.samples.toLocaleString()} 条` : "-", cfgB ? `${cfgB.samples.toLocaleString()} 条` : "-", cfgA?.samples === cfgB?.samples ? "same" : "derived"),
    cfgRow("训练 token 量", cfgA?.tokens || "-", cfgB?.tokens || "-", cfgA?.tokens === cfgB?.tokens ? "same" : "derived"),
    cfgRow("可训练参数", cfgA?.trainable || "-", cfgB?.trainable || "-", cfgA?.trainable === cfgB?.trainable ? "same" : "derived"),
    cfgRow("数值精度", cfgA?.precision || "-", cfgB?.precision || "-", cfgA?.precision === cfgB?.precision ? "same" : "derived"),
    cfgRow("算力 / 耗时", `${a.gpu} · ${a.duration}`, `${b.gpu} · ${b.duration}`, "cost"),
  ];

  // ---------------- 结论 ----------------
  const winner = Math.abs(dScore) >= VERDICT_EPS ? (dScore > 0 ? b : a) : null;
  const loser = winner ? (winner.id === a.id ? b : a) : null;
  const primaryVar = vars[0] || "配置";
  const winnerIsB = winner?.id === b.id;

  // 速览只列「同基础模型 + 同评测任务集」的试验：跨场景（如工单 vs 医疗）得分不可直接横比
  const taskKey = (e: FinetuneExp) =>
    e.tasks.filter((t) => !t.task.includes("通用")).map((t) => t.task).sort().join("|");
  const sameBase = ready.filter((e) => e.baseModel === a.baseModel && taskKey(e) === taskKey(a));
  const comparable = sameBase.length >= 2;
  const family = (comparable ? sameBase : ready).slice().sort((x, y) => finetuneScore(y) - finetuneScore(x));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel
        title="选择对比的两个微调试验"
        desc="各选 1 个已完成评估的试验，左侧为试验 A（基线配方/策略），右侧为试验 B（待验证配方/策略）"
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag tone={caliber.tone}>{caliber.tag}</Tag>
            <Btn size="sm" tone="plain" icon={<Download size={13} />} onClick={() => toast.success("微调对比分析报告（PDF）已开始下载")}>
              导出对比报告
            </Btn>
          </div>
        }
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.sub, marginBottom: 5 }}>试验 A（基线）</label>
            <Sel value={a.id} onChange={(v) => setPair([v, b.id])} options={opts} />
          </div>
          <Btn size="sm" icon={<ArrowLeftRight size={13} />} onClick={() => setPair([b.id, a.id])} title="交换 A / B">
            交换
          </Btn>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.sub, marginBottom: 5 }}>试验 B（对比）</label>
            <Sel value={b.id} onChange={(v) => setPair([a.id, v])} options={opts.filter((o) => o.value !== a.id)} />
          </div>
        </div>

        <div
          style={{
            marginTop: 12, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            padding: "9px 12px", borderRadius: 6,
            background: `${caliber.tone}0d`, border: `1px solid ${caliber.tone}33`,
          }}
        >
          <Info size={13} style={{ color: caliber.tone, flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6, flex: 1 }}>{caliber.desc}</span>
          <span style={{ fontSize: 11.5, color: C.faint, whiteSpace: "nowrap" }}>
            变量 {vars.length} 项{vars.length ? `：${vars.join(" / ")}` : ""}
          </span>
        </div>
      </Panel>

      <Grid cols={2}>
        <FinetuneResultCard role="A · 基线" exp={a} tone={C.primary} onOpen={onOpen} />
        <FinetuneResultCard role="B · 对比" exp={b} tone={C.teal} onOpen={onOpen} />
      </Grid>

      <Panel title="Loss 收敛对比" desc="两条微调 loss 曲线按记录步对齐，下降更快且更低者更易收敛">
        <LineChart
          labels={Array.from({ length: Math.min(a.loss.length, b.loss.length) }, (_, i) => `S${i + 1}`)}
          series={[
            { name: `A · ${a.id}`, color: C.primary, data: a.loss.slice(0, Math.min(a.loss.length, b.loss.length)) },
            { name: `B · ${b.id}`, color: C.teal, data: b.loss.slice(0, Math.min(a.loss.length, b.loss.length)) },
          ]}
          height={190}
        />
        <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5, flexWrap: "wrap" }}>
          <LegendItem color={C.primary} text={`A · ${a.method} · ${ratioLabel(a)}`} />
          <LegendItem color={C.teal} text={`B · ${b.method} · ${ratioLabel(b)}`} />
          <span style={{ color: C.faint }}>
            末次 loss：A {a.loss.length ? a.loss[a.loss.length - 1].toFixed(3) : "--"} ｜ B{" "}
            {b.loss.length ? b.loss[b.loss.length - 1].toFixed(3) : "--"}
          </span>
        </div>
      </Panel>

      <Panel title="指标差异" desc="差值 = 试验 B − 试验 A；综合得分 = 下游提升×60% + 领域注入×40% − 能力回落×1.5">
        <Table
          head={["对比项", "试验 A", "试验 B", "差值（B − A）", "判定"]}
          widths={["196px", "200px", "200px", "116px", "auto"]}
          rowKey={(i) => diffRows[i].key}
          rows={diffRows.map((r) => [
            <span key="l" style={{ fontSize: 12, color: C.text }}>{r.label}</span>,
            <span key="a" style={{ fontSize: 12, color: C.sub }}>{r.a}</span>,
            <span key="b" style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{r.b}</span>,
            <span key="d" style={{ fontSize: 12, fontWeight: 500, color: r.tone || C.faint }}>{r.d}</span>,
            <span key="v">{r.verdict}</span>,
          ])}
        />
      </Panel>

      <Panel
        title="微调配置对照"
        desc="标「差异」的行是本次对比的受控变量；「派生」行由配方联动产生，不计入变量数"
        extra={<Tag tone={caliber.tone}>{vars.length ? `${vars.length} 项变量` : "配置一致"}</Tag>}
      >
        <Table
          head={["配置项", "试验 A（基线）", "试验 B（对比）", "配置差异"]}
          widths={["168px", "auto", "auto", "92px"]}
          rowKey={(i) => String(i)}
          rows={cfgRows.map((r) => [
            <span key="l" style={{ fontSize: 12, color: C.text }}>{r.label}</span>,
            <span key="a" style={{ fontSize: 12, color: r.kind === "var" ? C.warn : C.sub, fontWeight: r.kind === "var" ? 500 : 400 }}>{r.av}</span>,
            <span key="b" style={{ fontSize: 12, color: r.kind === "var" ? C.warn : C.sub, fontWeight: r.kind === "var" ? 500 : 400 }}>{r.bv}</span>,
            r.kind === "var" ? (
              <Tag key="d" tone={C.warn}>差异</Tag>
            ) : r.kind === "derived" ? (
              <Tag key="d" tone={C.info}>派生</Tag>
            ) : (
              <span key="d" style={{ fontSize: 11, color: C.faint }}>{r.kind === "cost" ? "成本" : "一致"}</span>
            ),
          ])}
        />
        <div style={{ marginTop: 10, fontSize: 11.5, color: C.faint, lineHeight: 1.7 }}>
          领域占比 / 有效样本 / token 量随数据配方联动，可训练参数与数值精度由微调方式与秩决定，均属派生结果；算力与耗时是成本项，不参与优劣判定。
          LoRA 秩、学习率、轮次、序列长度同属「微调超参」一项变量，任一项不同即计为超参变化。
        </div>
      </Panel>

      <Panel
        title="对比结论"
        desc="按指标差异自动生成，可随对比报告一起归档"
        extra={
          winner ? (
            <Tag tone={C.success}>{winnerIsB ? "试验 B 更优" : "试验 A 更优"}</Tag>
          ) : (
            <Tag tone={C.faint}>无显著差异</Tag>
          )
        }
      >
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.95 }}>
          试验 B「{b.name}」综合得分 <b>{scoreB}</b>，试验 A「{a.name}」为 <b>{scoreA}</b>，
          B {dScore >= 0 ? "高" : "低"} <b style={{ color: dScore >= 0 ? C.success : C.danger }}>{Math.abs(dScore).toFixed(1)}</b> 分；
          下游任务平均提升 {signed(gainA)}pt → {signed(gainB)}pt（{dGain >= 0 ? "+" : ""}{dGain.toFixed(1)}pt），
          领域知识注入 {signed(domA)}pt → {signed(domB)}pt，
          通用能力回落 {a.forget.toFixed(1)}pt → {b.forget.toFixed(1)}pt
          {dForget < 0 ? "（回落收窄）" : dForget > 0 ? "（回落扩大）" : ""}。
          {vars.length === 1 ? (
            <>
              {" "}两个试验仅在<b>「{vars[0]}」</b>上存在差异，其余配置一致，结果差异可直接归因到该项。
            </>
          ) : vars.length === 0 ? (
            <> 两个试验配置完全一致，本次差异属训练随机性波动，可作为评估稳定性基线。</>
          ) : (
            <> 两个试验在 {vars.join("、")} 上同时存在差异，结论仅作方向性参考。</>
          )}
        </div>

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {(winner
            ? [
                vars.includes("数据配方")
                  ? `推荐配方：${ratioLabel(winner)}（领域数据 ${domainRatio(winner)}%）——综合得分 ${winnerIsB ? scoreB : scoreA}，可作为该场景的默认配方模板。`
                  : vars.includes("微调方式")
                  ? `推荐策略：${winner.method} —— 同配方下综合得分更高，可写入场景默认微调策略。`
                  : `推荐采用试验 ${winnerIsB ? "B" : "A"} 的配置组合，综合得分高 ${Math.abs(dScore).toFixed(1)} 分。`,
                loser
                  ? `试验 ${winnerIsB ? "A" : "B"} 侧后续建议：${loser.feedback[0]?.text || "配方与训练配置需与胜出一侧对齐后复跑验证。"}`
                  : "",
                `固定「${primaryVar}」之外的配置复跑 1 次，确认综合得分波动小于 0.5 分再固化为模板。`,
              ]
            : [
                "两个试验综合得分差异在 0.05 分以内，视为同一水平，暂不建议替换现有配方。",
                "如需拉开差距，建议扩大领域数据占比或增加微调轮次后再对比。",
                "配置完全一致时出现波动，说明当前评估集对配方差异不敏感，建议补充更难的下游任务样本。",
              ]
          )
            .filter(Boolean)
            .map((t, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 8, padding: "9px 12px", borderRadius: 6,
                  background: C.bg, border: `1px solid ${C.borderSoft}`,
                  fontSize: 12, color: C.sub, lineHeight: 1.7,
                }}
              >
                <CheckCircle2 size={13} style={{ flexShrink: 0, marginTop: 2, color: C.success }} />
                {t}
              </div>
            ))}
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
          <FileCheck2 size={14} style={{ color: C.success }} />
          <span style={{ fontSize: 11.5, color: C.sub }}>
            报告内容：两试验配置差异 / Loss 曲线对比 / 指标差异 / 配方与策略建议
          </span>
          <div style={{ flex: 1 }} />
          <Btn size="sm" icon={<Download size={13} />} onClick={() => toast.success("微调对比分析报告（PDF）已开始下载")}>
            下载
          </Btn>
        </div>
      </Panel>

      <Panel
        title="同族试验速览"
        desc={
          comparable
            ? `与试验 A 同基础模型、同评测任务集的试验（${a.baseModel} · ${a.tasks.filter((t) => !t.task.includes("通用")).length} 项任务），按综合得分排序`
            : "已完成试验按综合得分排序（口径不一致，得分不可直接横比）"
        }
        extra={<Tag tone={C.primary}>{family.length} 个可比试验</Tag>}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          head={["试验", "配方", "策略", "领域占比", "下游提升", "能力回落", "综合得分", "操作"]}
          widths={["230px", "76px", "86px", "86px", "96px", "92px", "96px", "86px"]}
          rowKey={(i) => family[i].id}
          rows={family.map((e, i) => {
            const isA = e.id === a.id;
            const isB = e.id === b.id;
            return [
              <div key="n">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.name}>
                    {e.name}
                  </span>
                  {isA && <Tag tone={C.primary}>A</Tag>}
                  {isB && <Tag tone={C.teal}>B</Tag>}
                </div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.id} · {e.baseModel}</div>
              </div>,
              <span key="m" style={{ fontSize: 12.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{ratioLabel(e)}</span>,
              <span key="s" style={{ fontSize: 12, color: C.sub }}>{e.method}</span>,
              <span key="r" style={{ fontSize: 12, color: C.sub }}>{domainRatio(e)}%</span>,
              <span key="g" style={{ fontSize: 12.5, fontWeight: 600, color: gainTone(finetuneGain(e)) }}>{signed(finetuneGain(e))}pt</span>,
              <Tag key="f" tone={forgetTone(e.forget)}>{e.forget.toFixed(1)}pt</Tag>,
              <div key="sc" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: i === 0 && comparable ? C.success : C.text }}>{finetuneScore(e)}</span>
                {i === 0 && comparable && <Tag tone={C.success}>最优</Tag>}
              </div>,
              <IconBtn
                key="a"
                size="sm"
                tone="primary"
                icon={<ArrowLeftRight size={13} />}
                label="设为对比试验 B"
                onClick={() => {
                  setPair([a.id, e.id]);
                  toast.success(`已把「${e.id}」设为试验 B`);
                }}
              />,
            ];
          })}
        />
      </Panel>
    </div>
  );
}

// ================================================================
// 新建微调评估
// ================================================================
function FinetuneCreate({
  onDone, onCancel,
}: {
  onDone: (e: FinetuneExp) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [baseModel, setBaseModel] = useState("");
  const [method, setMethod] = useState<string>("LoRA");
  const [mix, setMix] = useState<{ datasetId: string; ratio: number }[]>([
    { datasetId: "DS-2026-109", ratio: 60 },
    { datasetId: "DS-2026-104", ratio: 40 },
  ]);
  const [tasks, setTasks] = useState<string[]>(["医疗问答准确率", "通用指令跟随"]);
  const [evalWhat, setEvalWhat] = useState<string[]>(["下游任务准确率", "领域术语命中率"]);
  const [epochs, setEpochs] = useState(3);
  const [lr, setLr] = useState("2e-4");

  const total = mix.reduce((s, m) => s + m.ratio, 0) || 1;

  const update = (i: number, key: "datasetId" | "ratio", v: any) =>
    setMix((prev) => prev.map((m, j) => (j === i ? { ...m, [key]: v } : m)));

  const submit = () => {
    const miss: string[] = [];
    if (!name.trim()) miss.push("试验名称");
    if (!baseModel) miss.push("基础模型");
    if (!mix.length) miss.push("数据配方");
    if (!tasks.length) miss.push("下游任务");
    if (miss.length) {
      toast.error(`请完善：${miss.join("、")}`);
      return;
    }
    const id = `FT-2026-${String(9 + FINETUNE_EXPS.length).padStart(3, "0")}`;
    onDone({
      id,
      name: name.trim(),
      baseModel,
      method: method as FinetuneExp["method"],
      mix: mix.map((m) => ({ ...m })),
      status: "运行中",
      progress: 3,
      gpu: "4 × A100 80G",
      startedAt: "刚刚",
      duration: "0m",
      tasks: [],
      domain: [],
      forget: 0,
      loss: [],
      conclusion: "试验已提交，平台正在按配方构建训练集并配置微调环境。",
      feedback: [],
    });
  };

  return (
    <Panel
      title="新建微调评估"
      desc="选定基础模型与数据配方，平台自动完成配比采样、微调训练与下游任务评估"
      extra={<Btn size="sm" onClick={onCancel}>取消</Btn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Grid cols={3}>
          <Field label="试验名称" required span>
            <TextInput value={name} onChange={setName} placeholder="例如：医疗问答指令微调 · 6:4 配方" />
          </Field>
          <Field label="基础模型" required>
            <Sel value={baseModel} onChange={setBaseModel} options={BASE_MODELS} placeholder="请选择基础模型" />
          </Field>
          <Field label="微调方式" required>
            <Sel value={method} onChange={setMethod} options={[...FINETUNE_METHODS]} />
          </Field>
          <Field label="微调轮次">
            <NumInput value={epochs} onChange={setEpochs} min={1} />
          </Field>
        </Grid>

        <SectionTitle
          step="1"
          title="数据配方"
          desc="多个数据集按比例混合，比例自动归一；配方差异是微调对比实验的核心变量"
          extra={<Tag tone={total === 100 ? C.success : C.warn}>合计 {total}%</Tag>}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {mix.map((m, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 130px 88px 32px", gap: 8, alignItems: "center" }}>
              <Sel
                value={m.datasetId}
                onChange={(v) => update(i, "datasetId", v)}
                options={EXP_DATASETS.map((d) => ({ value: d.id, label: `${d.id} · ${d.name}` }))}
                placeholder="选择数据集"
              />
              <NumInput value={m.ratio} onChange={(v) => update(i, "ratio", v)} min={0} max={100} />
              <div style={{ fontSize: 12, color: C.sub, textAlign: "right" }}>
                归一后 <strong style={{ color: C.text }}>{Math.round((m.ratio / total) * 100)}%</strong>
              </div>
              <IconBtn
                size="sm"
                tone="danger"
                icon={<Trash2 size={13} />}
                label="移除该数据集"
                onClick={() => setMix((prev) => prev.filter((_, j) => j !== i))}
              />
            </div>
          ))}
          <div>
            <Btn size="sm" icon={<Plus size={13} />} onClick={() => setMix((prev) => [...prev, { datasetId: "", ratio: 20 }])}>
              添加数据集
            </Btn>
          </div>
        </div>

        <SectionTitle step="2" title="评估维度" desc="下游任务性能提升 + 领域知识注入效果" />
        <Field label="下游任务" required>
          <Chips options={FINETUNE_TASKS} value={tasks} onChange={setTasks} multi />
        </Field>
        <Field label="评估维度">
          <Chips options={WHAT_TO_EVAL} value={evalWhat} onChange={setEvalWhat} multi />
        </Field>

        <SectionTitle step="3" title="训练参数" desc="LoRA 系默认 r=16 / alpha=32，可按需调整学习率" />
        <Grid cols={3}>
          <Field label="学习率"><TextInput value={lr} onChange={setLr} /></Field>
          <Field label="LoRA Rank">
            <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>r=16, alpha=32（默认）</div>
          </Field>
          <Field label="计算资源">
            <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>4 × A100 80G（自动分配）</div>
          </Field>
        </Grid>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <Btn onClick={onCancel}>取消</Btn>
          <Btn tone="primary" icon={<Wand2 size={13} />} onClick={submit}>提交微调评估</Btn>
        </div>
      </div>
    </Panel>
  );
}

// 正负混合的提升幅度条：宽度按绝对值，颜色按正负（避免负值柱子画不出来）
function GainBars({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(...items.map((i) => Math.abs(i.value)), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {items.map((i) => {
        const neg = i.value < 0;
        const tone = neg ? C.danger : i.value >= 10 ? C.success : C.primary;
        return (
          <div key={i.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span style={{ color: C.text }}>{i.label}</span>
              <span style={{ color: tone, fontWeight: 600 }}>{signed(i.value)}pt</span>
            </div>
            <div style={{ height: 6, background: C.borderSoft, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${(Math.abs(i.value) / max) * 100}%`, height: "100%", background: tone, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ================================================================
// 详情
// ================================================================
function FinetuneDetail({ exp, onBack }: { exp: FinetuneExp; onBack: () => void }) {
  const gain = finetuneGain(exp);
  const domainGain = avg(exp.domain.map((d) => d.after - d.before));
  const maxTask = Math.max(...exp.tasks.map((t) => Math.max(t.before, t.after)), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel bodyStyle={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <IconBtn icon={<ArrowLeft size={15} />} label="返回试验列表" onClick={onBack} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{exp.name}</span>
              <StatusTag status={exp.status} />
              <Tag tone={C.sub}>{exp.id}</Tag>
              <Tag tone={C.primary}>{exp.method}</Tag>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>
              {exp.baseModel} ｜ {exp.gpu} ｜ 开始 {exp.startedAt} ｜ 耗时 {exp.duration}
            </div>
          </div>
          <Btn
            size="sm"
            icon={<Download size={13} />}
            disabled={exp.status !== "已完成"}
            onClick={() => toast.success("微调评估报告（PDF）已开始下载")}
          >
            下载评估报告
          </Btn>
        </div>
      </Panel>

      <Grid cols={4}>
        <Metric icon={<TrendingUp size={15} />} label="下游任务平均提升" value={exp.tasks.length ? `${signed(gain)}pt` : "--"} tone={gainTone(gain)} hint="不含通用能力项" />
        <Metric icon={<BookOpen size={15} />} label="领域知识注入" value={exp.domain.length ? `${signed(domainGain)}pt` : "--"} tone={C.purple} hint="术语命中 / 知识问答均值" />
        <Metric icon={<Gauge size={15} />} label="通用能力回落" value={exp.tasks.length ? `${exp.forget.toFixed(1)}pt` : "--"} tone={forgetTone(exp.forget)} hint="≤2pt 为可接受" />
        <Metric icon={<Clock size={15} />} label="训练耗时" value={exp.duration} tone={C.info} hint={`${exp.method} · ${exp.gpu}`} />
      </Grid>

      <Grid cols="1.15fr 1fr">
        <Panel title="下游任务：微调前 / 微调后" desc="同一评测集，基线为未微调的基础模型">
          {exp.tasks.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {exp.tasks.map((t) => {
                const d = t.after - t.before;
                const generic = t.task.includes("通用");
                return (
                  <div key={t.task}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12.5, color: C.text, flex: 1 }}>{t.task}</span>
                      <Tag tone={generic ? forgetTone(Math.abs(d)) : gainTone(d)}>{signed(d)}pt</Tag>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10.5, color: C.faint, width: 32 }}>基线</span>
                        <div style={{ flex: 1 }}><Bar pct={(t.before / maxTask) * 100} tone={C.faint} h={6} /></div>
                        <span style={{ fontSize: 11.5, color: C.sub, width: 46, textAlign: "right" }}>{pct(t.before)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10.5, color: C.faint, width: 32 }}>微调后</span>
                        <div style={{ flex: 1 }}><Bar pct={(t.after / maxTask) * 100} tone={generic ? C.warn : C.primary} h={6} /></div>
                        <span style={{ fontSize: 11.5, color: C.text, fontWeight: 600, width: 46, textAlign: "right" }}>{pct(t.after)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty text="评估尚未完成" />
          )}
        </Panel>

        <Panel title="数据配方" desc={mixLabel(exp.mix)}>
          <div style={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", marginBottom: 12 }}>
            {exp.mix.map((m, i) => (
              <div
                key={m.datasetId + i}
                style={{
                  width: `${m.ratio}%`,
                  background: [C.primary, C.teal, C.purple, C.warn][i % 4],
                }}
              />
            ))}
          </div>
          {exp.mix.map((m, i) => {
            const d = expDataset(m.datasetId);
            return (
              <div key={m.datasetId + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: [C.primary, C.teal, C.purple, C.warn][i % 4], flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.text, flex: 1 }}>{d?.name || m.datasetId}</span>
                <span style={{ fontSize: 11.5, color: C.faint }}>{d?.dataType} · {d?.scale}</span>
                <span style={{ fontSize: 12, color: C.text, fontWeight: 600, width: 40, textAlign: "right" }}>{m.ratio}%</span>
              </div>
            );
          })}
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 6 }}>微调 loss 曲线</div>
            {exp.loss.length ? <Spark data={exp.loss} color={C.primary} w={286} h={40} /> : <span style={{ fontSize: 12, color: C.faint }}>训练中</span>}
          </div>
        </Panel>
      </Grid>

      <Grid cols={2}>
        <Panel title="领域知识注入效果" desc="验证数据集在领域适配场景下的知识注入程度">
          {exp.domain.length ? (
            <Table
              head={["指标", "基线", "微调后", "提升", "评测口径"]}
              widths={["136px", "72px", "80px", "68px", "auto"]}
              rowKey={(i) => exp.domain[i].metric}
              rows={exp.domain.map((d) => [
                <span key="m" style={{ fontSize: 12.5, color: C.text }}>{d.metric}</span>,
                <span key="b" style={{ fontSize: 12, color: C.sub }}>{pct(d.before)}</span>,
                <span key="a" style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{pct(d.after)}</span>,
                <Tag key="g" tone={gainTone(d.after - d.before)}>{signed(d.after - d.before)}pt</Tag>,
                <span key="n" style={{ fontSize: 11.5, color: C.faint }}>{d.note}</span>,
              ])}
            />
          ) : (
            <Empty text="评估尚未完成" />
          )}
        </Panel>

        <Panel title="各任务提升幅度" desc="正向提升为蓝/绿，能力回落为红色">
          {exp.tasks.length ? (
            <GainBars
              items={exp.tasks.map((t) => ({ label: t.task, value: +(t.after - t.before).toFixed(1) }))}
            />
          ) : (
            <Empty text="评估尚未完成" />
          )}
          <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.85, marginTop: 12 }}>{exp.conclusion}</div>
        </Panel>
      </Grid>

      <Panel
        title="结果反哺数据生产"
        desc="评估结果回流至数据生产与发布环节，形成数据与模型的协同优化闭环"
        extra={<Tag tone={C.purple}>闭环建议</Tag>}
      >
        {exp.feedback.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {exp.feedback.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  border: `1px solid ${C.border}`, borderRadius: 6,
                }}
              >
                <Tag tone={C.purple}>{f.target}</Tag>
                <span style={{ flex: 1, fontSize: 12.5, color: C.text, lineHeight: 1.7 }}>{f.text}</span>
                <Link
                  href={f.href}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12,
                    color: C.primary, textDecoration: "none", whiteSpace: "nowrap",
                  }}
                >
                  前往处理 <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="评估完成后自动生成反哺建议" />
        )}
      </Panel>
    </div>
  );
}

// ================================================================
// 主页面
// ================================================================
export default function ModelFinetuneEvalPage() {
  const [exps, setExps] = useState<FinetuneExp[]>(FINETUNE_EXPS);
  const [tab, setTab] = useState<TabKey>("list");
  const [detailId, setDetailId] = useState<string | null>(null);
  // 对照实验默认一对「同模型同策略、仅配比不同」的试验，差异项一眼可归因
  const [comparePair, setComparePair] = useState<string[]>(["FT-2026-008", "FT-2026-005"]);

  const done = exps.filter((e) => e.status === "已完成");
  const running = exps.filter((e) => e.status === "运行中");
  const avgGain = avg(done.map((e) => finetuneGain(e)));
  const avgForget = avg(done.map((e) => e.forget));

  const stop = (id: string) => {
    setExps((prev) => prev.map((e) => (e.id === id ? { ...e, status: "已终止" } : e)));
    toast.success("微调试验已终止");
  };

  const detail = exps.find((e) => e.id === detailId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <ExpHeader
        icon={<Sparkles size={17} color="#fff" />}
        title="模型微调评估"
        subtitle="数据中试中心 · 模型试验 ｜ 面向大模型微调的专项评估，验证数据配方与微调策略"
        gradient="linear-gradient(135deg, #8b5cf6, #6366f1)"
        right={
          <>
            <Btn size="sm" onClick={() => setTab("compare")} icon={<ArrowLeftRight size={13} />}>对照实验</Btn>
            <Btn size="sm" tone="primary" icon={<Plus size={13} />} onClick={() => { setDetailId(null); setTab("new"); }}>
              新建微调评估
            </Btn>
          </>
        }
      />

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {detail ? (
          <FinetuneDetail exp={detail} onBack={() => setDetailId(null)} />
        ) : (
          <>
            <Grid cols={4} style={{ marginBottom: 12 }}>
              <Metric icon={<Database size={15} />} label="微调评估试验" value={exps.length} unit="个" hint={`已完成 ${done.length} · 运行中 ${running.length}`} />
              <Metric icon={<TrendingUp size={15} />} label="平均下游提升" value={avgGain ? `${signed(avgGain)}pt` : "--"} tone={C.success} hint="不含通用能力项" />
              <Metric icon={<BookOpen size={15} />} label="领域知识注入" value={`${signed(avg(done.map((e) => finetuneDomainGain(e))))}pt`} tone={C.purple} hint="术语命中 / 知识问答" />
              <Metric icon={<Gauge size={15} />} label="平均能力回落" value={`${avgForget.toFixed(1)}pt`} tone={forgetTone(avgForget)} hint="警戒线 2.0pt" />
            </Grid>

            <Tabs<TabKey>
              value={tab}
              onChange={setTab}
              items={[
                { key: "list", label: "微调试验", icon: <Layers size={13} />, count: exps.length },
                { key: "compare", label: "对照实验", icon: <ArrowLeftRight size={13} /> },
                { key: "new", label: "新建微调评估", icon: <Plus size={13} /> },
              ]}
            />

            {tab === "list" && (
              <FinetuneList
                exps={exps}
                onOpen={setDetailId}
                onCompare={(id) => {
                  setComparePair((prev) => [prev[0] || id, id]);
                  setTab("compare");
                  toast.success("已作为试验 B 加入对比");
                }}
                onStop={stop}
              />
            )}
            {tab === "compare" && (
              <FinetuneCompare exps={exps} pair={comparePair} setPair={setComparePair} onOpen={setDetailId} />
            )}
            {tab === "new" && (
              <FinetuneCreate
                onCancel={() => setTab("list")}
                onDone={(e) => {
                  setExps((prev) => [e, ...prev]);
                  setTab("list");
                  toast.success(`微调试验「${e.name}」已提交，正在构建训练配方`);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
