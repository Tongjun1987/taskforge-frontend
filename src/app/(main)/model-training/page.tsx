"use client";

import React, { useMemo, useState } from "react";
import {
  Brain, Plus, Eye, ArrowLeft, ArrowLeftRight, Ban, Download, Search,
  Activity, Target, Clock, FileCheck2, Database, CheckCircle2,
  Layers, Gauge, AlertTriangle, Info,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  C, Panel, Metric, Table, Tag, Btn, IconBtn, Bar, Kv, Grid, LineChart, Spark,
} from "@/components/production/ui";
import {
  TRAIN_EXPS, EXP_DATASETS, MODEL_TYPES, TRAIN_FRAMEWORKS, TRAIN_PRESETS,
  expDataset, avg, type TrainExp,
} from "@/components/model-exp/expData";
import {
  ExpHeader, Tabs, StatusTag, Field, Sel, NumInput, TextInput, Chips, SectionTitle, Empty, heatColor,
} from "@/components/model-exp/ui";

type TabKey = "list" | "compare" | "new";

const OVERFIT_TONE: Record<string, string> = { 低: C.success, 中: C.warn, 高: C.danger };

const pct = (v: number, digits = 1) => `${v.toFixed(digits)}%`;

// ================================================================
// 列表
// ================================================================
function TrainList({
  exps, onOpen, onCompare, onStop,
}: {
  exps: TrainExp[];
  onOpen: (id: string) => void;
  onCompare: (id: string) => void;
  onStop: (id: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [modelType, setModelType] = useState("");
  const [kw, setKw] = useState("");

  const rows = useMemo(
    () =>
      exps.filter(
        (e) =>
          (!status || e.status === status) &&
          (!modelType || e.modelType === modelType) &&
          (!kw || e.name.includes(kw) || e.id.includes(kw) || (expDataset(e.datasetId)?.name || "").includes(kw))
      ),
    [exps, status, modelType, kw]
  );

  return (
    <Panel
      title="训练评估试验"
      desc="选择数据集与模型类型后，平台自动完成环境配置、数据加载、训练与指标计算"
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sel
            value={status}
            onChange={setStatus}
            options={["运行中", "已完成", "排队中", "已终止"]}
            placeholder="全部状态"
          />
          <Sel value={modelType} onChange={setModelType} options={MODEL_TYPES} placeholder="全部模型类型" />
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索试验 / 数据集"
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
        head={["试验", "数据集", "模型类型 / 框架", "状态", "主指标", "精确率 / 召回率", "早停", "过拟合", "开始时间", "操作"]}
        widths={["196px", "180px", "172px", "86px", "92px", "128px", "104px", "76px", "124px", "92px"]}
        rowKey={(i) => rows[i].id}
        rows={rows.map((e) => {
          const ds = expDataset(e.datasetId);
          return [
            <div key="n">
              <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, lineHeight: 1.45 }}>{e.name}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.id} · {e.gpu}</div>
            </div>,
            <div key="d">
              <div style={{ fontSize: 12.5, color: C.text }}>{ds?.name || e.datasetId}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.datasetId} · {ds?.dataType} · {ds?.scale}</div>
            </div>,
            <div key="m">
              <div style={{ fontSize: 12.5, color: C.text }}>{e.modelType}</div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.framework}</div>
            </div>,
            <div key="s">
              <StatusTag status={e.status} />
              {e.status === "运行中" && (
                <div style={{ marginTop: 5, width: 62 }}>
                  <Bar pct={e.progress} tone={C.info} h={4} />
                </div>
              )}
            </div>,
            <div key="v">
              {e.metrics.length ? (
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{pct(e.mainValue)}</div>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
              <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>{e.mainLabel}</div>
            </div>,
            <div key="pr" style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
              {e.metrics.length > 1 ? (
                <>
                  {pct(e.metrics[1].value)} <span style={{ color: C.border }}>/</span> {pct(e.metrics[2].value)}
                </>
              ) : (
                "--"
              )}
            </div>,
            <div key="es" style={{ fontSize: 11.5 }}>
              {e.process.earlyStop ? (
                <Tag tone={C.warn}>第 {e.process.earlyStopEpoch} 轮</Tag>
              ) : (
                <Tag tone={C.faint}>{e.status === "运行中" ? `未触发/${e.process.patience}` : "未触发"}</Tag>
              )}
            </div>,
            <div key="of" style={{ fontSize: 11.5 }}>
              {e.metrics.length ? (
                <Tag tone={OVERFIT_TONE[e.process.overfit]}>{e.process.overfit} · {e.process.gap.toFixed(1)}pt</Tag>
              ) : (
                <span style={{ color: C.faint }}>--</span>
              )}
            </div>,
            <div key="t" style={{ fontSize: 11.5, color: C.sub, whiteSpace: "nowrap" }}>
              {e.startedAt}
              <div style={{ fontSize: 11, color: C.faint }}>{e.duration}</div>
            </div>,
            <div key="a" style={{ display: "flex", gap: 5 }}>
              <IconBtn size="sm" tone="primary" icon={<Eye size={13} />} label="查看评估报告" onClick={() => onOpen(e.id)} />
              <IconBtn size="sm" icon={<ArrowLeftRight size={13} />} label="加入对照实验" onClick={() => onCompare(e.id)} />
              {e.status === "运行中" && (
                <IconBtn size="sm" tone="danger" icon={<Ban size={13} />} label="终止试验" onClick={() => onStop(e.id)} />
              )}
            </div>,
          ];
        })}
      />
      {rows.length === 0 && <Empty text="没有符合条件的训练试验" />}
    </Panel>
  );
}

// ================================================================
// 对照实验：两个训练任务的结果比对
// ================================================================
type Dir = "high" | "low";

const VERDICT_EPS = 0.05;

function verdictOf(d: number, dir: Dir) {
  if (Math.abs(d) < VERDICT_EPS) return { text: "持平", tone: C.faint };
  const good = dir === "high" ? d > 0 : d < 0;
  return { text: good ? "更优" : "更差", tone: good ? C.success : C.danger };
}

/** 单个训练任务的结果卡：核心指标 + Loss 曲线 + 收敛足迹 */
function TaskResultCard({
  role, exp, tone, onOpen,
}: {
  role: string;
  exp: TrainExp;
  tone: string;
  onOpen: (id: string) => void;
}) {
  const ds = expDataset(exp.datasetId);
  const vals = exp.curves.map((c) => c.valLoss);
  const cur = vals.length ? vals[vals.length - 1] : 0;
  const low = vals.length ? Math.min(...vals) : 0;
  const drop = vals.length && vals[0] ? ((vals[0] - low) / vals[0]) * 100 : 0;
  // 平均单轮耗时：等价于参考图里的「速度」，但用可核对的耗时/轮次算出来
  const durMin = (() => {
    const h = /(\d+)h/.exec(exp.duration);
    const m = /(\d+)m/.exec(exp.duration);
    return (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  })();
  const perEpoch = durMin && exp.process.totalEpochs ? durMin / exp.process.totalEpochs : 0;

  const tiles = [
    { k: exp.mainLabel, v: pct(exp.mainValue), hint: "测试集结果" },
    {
      k: "train-val 差距",
      v: `${exp.process.gap.toFixed(1)}pt`,
      hint: `train ${pct(exp.process.trainAcc)} · val ${pct(exp.process.valAcc)}`,
    },
    {
      k: "最佳轮次",
      v: `${exp.process.bestEpoch} / ${exp.process.totalEpochs}`,
      hint: exp.process.earlyStop ? `早停于第 ${exp.process.earlyStopEpoch} 轮` : "未触发早停",
    },
    { k: "训练耗时", v: exp.duration, hint: exp.gpu },
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
          {exp.id} ｜ {ds?.name || exp.datasetId} ｜ {exp.modelType}
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
        <div style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, margin: "12px 0 2px" }}>Loss 曲线（val_loss）</div>
        {vals.length ? (
          <LineChart
            labels={exp.curves.map((c) => `E${c.epoch}`)}
            series={[{ name: "val_loss", color: tone, data: vals }]}
            height={150}
          />
        ) : (
          <Empty text="训练尚未产生曲线" />
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
            查看该任务完整结果
          </Btn>
        </div>
      </div>
    </div>
  );
}

function TrainCompare({
  exps, pair, setPair, onOpen,
}: {
  exps: TrainExp[];
  pair: string[];
  setPair: (ids: string[]) => void;
  onOpen: (id: string) => void;
}) {
  const ready = exps.filter((e) => e.metrics.length > 0);
  const a = ready.find((e) => e.id === pair[0]) || ready[0];
  const b =
    ready.find((e) => e.id === pair[1] && e.id !== a?.id) ||
    ready.find((e) => e.id !== a?.id) ||
    ready[0];

  if (!a || !b || a.id === b.id) {
    return (
      <Panel title="对比实验" desc="以训练任务为单位，任选 2 个任务比对训练结果">
        <Empty text="至少需要 2 个已产出结果的训练任务才能对比" />
      </Panel>
    );
  }

  const dsA = expDataset(a.datasetId);
  const dsB = expDataset(b.datasetId);
  const sameDs = a.datasetId === b.datasetId;
  const sameModel = a.modelType === b.modelType;
  const sameMain = a.mainLabel === b.mainLabel;

  const caliber = sameDs
    ? {
        tag: "同数据集 · 比模型",
        tone: C.info,
        desc: `两个任务使用同一数据集（${dsA?.name || a.datasetId}），结果差异来自模型结构或超参配置，结论用于模型选型`,
      }
    : sameModel
    ? {
        tag: "同模型类型 · 比数据集",
        tone: C.success,
        desc: `两个任务模型类型一致（${a.modelType}），结果差异来自数据集，结论用于判断数据集质量与适用性`,
      }
    : {
        tag: "口径不一致 · 仅作参考",
        tone: C.warn,
        desc: "两个任务的模型类型与数据集均不同，数值不可直接分优劣，建议先统一其中一个变量再对比",
      };

  const opts = ready.map((e) => ({ value: e.id, label: `${e.id} · ${e.name}` }));

  // ---------------- 指标差异 ----------------
  const dMain = b.mainValue - a.mainValue;
  const dGap = b.process.gap - a.process.gap;
  const dValAcc = b.process.valAcc - a.process.valAcc;
  const dTrainAcc = b.process.trainAcc - a.process.trainAcc;

  type DiffRow = { key: string; label: string; a: string; b: string; d: string; tone?: string; verdict: React.ReactNode };
  const rows: DiffRow[] = [];

  if (sameMain) {
    const v = verdictOf(dMain, "high");
    rows.push({
      key: "main", label: `主指标 · ${a.mainLabel}`, tone: v.tone,
      a: pct(a.mainValue), b: pct(b.mainValue),
      d: `${dMain > 0 ? "+" : ""}${dMain.toFixed(1)}pt`,
      verdict: <Tag tone={v.tone}>{v.text}</Tag>,
    });
    if (a.metrics[1] && b.metrics[1]) {
      const d = b.metrics[1].value - a.metrics[1].value;
      const vv = verdictOf(d, "high");
      rows.push({
        key: "p", label: "精确率", tone: vv.tone, a: pct(a.metrics[1].value), b: pct(b.metrics[1].value),
        d: `${d > 0 ? "+" : ""}${d.toFixed(1)}pt`, verdict: <Tag tone={vv.tone}>{vv.text}</Tag>,
      });
    }
    if (a.metrics[2] && b.metrics[2]) {
      const d = b.metrics[2].value - a.metrics[2].value;
      const vv = verdictOf(d, "high");
      rows.push({
        key: "r", label: "召回率", tone: vv.tone, a: pct(a.metrics[2].value), b: pct(b.metrics[2].value),
        d: `${d > 0 ? "+" : ""}${d.toFixed(1)}pt`, verdict: <Tag tone={vv.tone}>{vv.text}</Tag>,
      });
    }
  } else {
    rows.push({
      key: "main", label: "主指标", tone: C.faint,
      a: `${pct(a.mainValue)}（${a.mainLabel}）`, b: `${pct(b.mainValue)}（${b.mainLabel}）`,
      d: "—", verdict: <Tag tone={C.faint}>口径不同</Tag>,
    });
  }

  const vVal = verdictOf(dValAcc, "high");
  rows.push({
    key: "va", label: "val_acc", tone: vVal.tone, a: pct(a.process.valAcc), b: pct(b.process.valAcc),
    d: `${dValAcc > 0 ? "+" : ""}${dValAcc.toFixed(1)}pt`, verdict: <Tag tone={vVal.tone}>{vVal.text}</Tag>,
  });
  const vTrain = verdictOf(dTrainAcc, "high");
  rows.push({
    key: "ta", label: "train_acc", tone: vTrain.tone, a: pct(a.process.trainAcc), b: pct(b.process.trainAcc),
    d: `${dTrainAcc > 0 ? "+" : ""}${dTrainAcc.toFixed(1)}pt`, verdict: <Tag tone={vTrain.tone}>{vTrain.text}</Tag>,
  });
  const vGap = verdictOf(dGap, "low");
  rows.push({
    key: "gap", label: "train-val 差距（越小越好）", tone: vGap.tone, a: `${a.process.gap.toFixed(1)}pt`, b: `${b.process.gap.toFixed(1)}pt`,
    d: `${dGap > 0 ? "+" : ""}${dGap.toFixed(1)}pt`, verdict: <Tag tone={vGap.tone}>{vGap.text}</Tag>,
  });
  rows.push({
    key: "ep", label: "最佳轮次",
    a: `第 ${a.process.bestEpoch} / ${a.process.totalEpochs} 轮`,
    b: `第 ${b.process.bestEpoch} / ${b.process.totalEpochs} 轮`,
    d: "—", verdict: <span style={{ color: C.faint, fontSize: 11 }}>收敛速度</span>,
  });
  rows.push({
    key: "es", label: "早停",
    a: a.process.earlyStop ? `第 ${a.process.earlyStopEpoch} 轮触发` : "未触发",
    b: b.process.earlyStop ? `第 ${b.process.earlyStopEpoch} 轮触发` : "未触发",
    d: "—", verdict: <span style={{ color: C.faint, fontSize: 11 }}>过程标记</span>,
  });

  // ---------------- 结论 ----------------
  const winner = sameMain && Math.abs(dMain) >= VERDICT_EPS ? (dMain > 0 ? b : a) : null;
  const loser = winner ? (winner.id === a.id ? b : a) : null;
  const dsWinner = winner ? expDataset(winner.datasetId) : undefined;
  const dsLoser = loser ? expDataset(loser.datasetId) : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel
        title="选择对比的两个训练任务"
        desc="对比以训练任务为单位：各选 1 个有结果的任务，左侧为任务 A（基线），右侧为任务 B（对比）"
        extra={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Tag tone={caliber.tone}>{caliber.tag}</Tag>
            <Btn size="sm" tone="plain" icon={<Download size={13} />} onClick={() => toast.success("对比分析报告（PDF）已开始下载")}>
              导出对比报告
            </Btn>
          </div>
        }
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.sub, marginBottom: 5 }}>任务 A（基线）</label>
            <Sel value={a.id} onChange={(v) => setPair([v, b.id])} options={opts} />
          </div>
          <Btn size="sm" icon={<ArrowLeftRight size={13} />} onClick={() => setPair([b.id, a.id])} title="交换 A / B">
            交换
          </Btn>
          <div style={{ flex: 1, minWidth: 250 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: C.sub, marginBottom: 5 }}>任务 B（对比）</label>
            <Sel
              value={b.id}
              onChange={(v) => setPair([a.id, v])}
              options={opts.filter((o) => o.value !== a.id)}
            />
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
          <span style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6 }}>{caliber.desc}</span>
        </div>
      </Panel>

      <Grid cols={2}>
        <TaskResultCard role="A · 基线" exp={a} tone={C.primary} onOpen={onOpen} />
        <TaskResultCard role="B · 对比" exp={b} tone={C.teal} onOpen={onOpen} />
      </Grid>

      <Panel title="Loss 收敛对比" desc="两条 val_loss 曲线叠在同一轮次轴上，越低越接近收敛">
        <LineChart
          labels={a.curves.slice(0, Math.min(a.curves.length, b.curves.length)).map((c) => `E${c.epoch}`)}
          series={[
            { name: `A · ${dsA?.name || a.id}`, color: C.primary, data: a.curves.slice(0, Math.min(a.curves.length, b.curves.length)).map((c) => c.valLoss) },
            { name: `B · ${dsB?.name || b.id}`, color: C.teal, data: b.curves.slice(0, Math.min(a.curves.length, b.curves.length)).map((c) => c.valLoss) },
          ]}
          height={190}
        />
        <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5, flexWrap: "wrap" }}>
          <LegendItem color={C.primary} text={`A · ${a.id}`} />
          <LegendItem color={C.teal} text={`B · ${b.id}`} />
          <span style={{ color: C.faint }}>
            终轮 val_loss：A {a.curves.length ? a.curves[a.curves.length - 1].valLoss.toFixed(3) : "--"} ｜ B{" "}
            {b.curves.length ? b.curves[b.curves.length - 1].valLoss.toFixed(3) : "--"}
          </span>
        </div>
      </Panel>

      <Panel title="指标差异" desc="差值 = 任务 B − 任务 A；主指标方向为越高越好，train-val 差距为越低越好">
        <Table
          head={["对比项", "任务 A", "任务 B", "差值（B − A）", "判定"]}
          widths={["220px", "150px", "150px", "130px", "auto"]}
          rowKey={(i) => rows[i].key}
          rows={rows.map((r) => [
            <span key="l" style={{ fontSize: 12, color: C.text }}>{r.label}</span>,
            <span key="a" style={{ fontSize: 12, color: C.sub }}>{r.a}</span>,
            <span key="b" style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{r.b}</span>,
            <span key="d" style={{ fontSize: 12, fontWeight: 500, color: r.tone || C.faint }}>
              {r.d}
            </span>,
            <span key="v">{r.verdict}</span>,
          ])}
        />
      </Panel>

      <Panel title="训练配置对照" desc="配置项差异会影响结果，判定优劣前先确认两边只差一个变量">
        <Table
          head={["对比项", "任务 A（基线）", "任务 B（对比）"]}
          widths={["140px", "auto", "auto"]}
          rowKey={(i) => String(i)}
          rows={[
            [
              <span key="1" style={{ fontSize: 12, color: C.text }}>数据集</span>,
              <span key="1a" style={{ fontSize: 12, color: C.sub }}>{a.datasetId} · {dsA?.name || "-"}</span>,
              <span key="1b" style={{ fontSize: 12, color: C.sub }}>{b.datasetId} · {dsB?.name || "-"}</span>,
            ],
            [
              <span key="2" style={{ fontSize: 12, color: C.text }}>模型类型</span>,
              <span key="2a" style={{ fontSize: 12, color: sameModel ? C.sub : C.warn }}>{a.modelType}</span>,
              <span key="2b" style={{ fontSize: 12, color: sameModel ? C.sub : C.warn }}>{b.modelType}</span>,
            ],
            [
              <span key="3" style={{ fontSize: 12, color: C.text }}>训练框架</span>,
              <span key="3a" style={{ fontSize: 12, color: C.sub }}>{a.framework}</span>,
              <span key="3b" style={{ fontSize: 12, color: C.sub }}>{b.framework}</span>,
            ],
            [
              <span key="4" style={{ fontSize: 12, color: C.text }}>流程预设</span>,
              <span key="4a" style={{ fontSize: 12, color: C.sub }}>{a.preset}</span>,
              <span key="4b" style={{ fontSize: 12, color: C.sub }}>{b.preset}</span>,
            ],
            [
              <span key="5" style={{ fontSize: 12, color: C.text }}>算力 / 耗时</span>,
              <span key="5a" style={{ fontSize: 12, color: C.sub }}>{a.gpu} · {a.duration}</span>,
              <span key="5b" style={{ fontSize: 12, color: C.sub }}>{b.gpu} · {b.duration}</span>,
            ],
            [
              <span key="6" style={{ fontSize: 12, color: C.text }}>开始时间</span>,
              <span key="6a" style={{ fontSize: 12, color: C.sub }}>{a.startedAt}</span>,
              <span key="6b" style={{ fontSize: 12, color: C.sub }}>{b.startedAt}</span>,
            ],
          ]}
        />
      </Panel>

      <Panel
        title="对比结论"
        desc="按指标差异自动生成，可随对比报告一起归档"
        extra={
          winner ? (
            winner.id === b.id ? <Tag tone={C.success}>任务 B 更优</Tag> : <Tag tone={C.danger}>任务 A 更优</Tag>
          ) : (
            <Tag tone={C.faint}>无显著差异</Tag>
          )
        }
      >
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.95 }}>
          {sameMain ? (
            <>
              任务 B「{b.name}」的 {b.mainLabel} 为 <b>{pct(b.mainValue)}</b>，任务 A「{a.name}」为 <b>{pct(a.mainValue)}</b>，
              B {dMain >= 0 ? "高" : "低"}{" "}
              <b style={{ color: dMain >= 0 ? C.success : C.danger }}>{Math.abs(dMain).toFixed(1)}pt</b>；
              train-val 差距 {dGap <= 0 ? "收窄" : "扩大"} {Math.abs(dGap).toFixed(1)}pt（
              {a.process.overfit === b.process.overfit ? `过拟合程度均为${a.process.overfit}` : `${a.process.overfit} → ${b.process.overfit}`}），
              最佳轮次 {a.process.bestEpoch} → {b.process.bestEpoch} 轮。
              {sameModel && !sameDs && (
                <>
                  {" "}两个任务模型类型同为 {a.modelType}，因此差异主要来自数据集：{dsWinner?.name || "-"}（{pct(winner?.mainValue ?? 0)}）优于{" "}
                  {dsLoser?.name || "-"}（{pct(loser?.mainValue ?? 0)}）。
                </>
              )}
              {sameDs && (
                <>
                  {" "}两个任务使用同一数据集，差异主要来自模型结构或超参配置，可作为模型选型依据。
                </>
              )}
            </>
          ) : (
            <>
              两个任务的主指标口径不同（A 为 {a.mainLabel}、B 为 {b.mainLabel}），因此只做数值并列展示、不判定优劣。
              如需得到可用结论，建议统一评估指标或统一其中一项变量后重新对比。
            </>
          )}
        </div>

        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {(winner
            ? [
                `优先采用任务 B 对应配置：「${winner.name}」（${winner.id}）在同口径下主指标更高。`,
                loser && loser.advice.length
                  ? `任务 A 侧数据集需补强：${loser.advice[0]}`
                  : `任务 A 侧建议复核训练配置与数据分布，再复跑一轮验证稳定性。`,
                sameModel && !sameDs
                  ? `结论可回写数据集管理：${dsWinner?.name || "-"} 作为「${a.modelType}」场景的优先训练集。`
                  : `如需确认结论稳定性，建议固定当前配置再跑 1 次，观察主指标波动是否小于 0.5pt。`,
              ]
            : [
                "两任务指标差异在 0.05pt 以内，视为同一水平，暂不建议据此替换现有配置。",
                "如需拉开差距，建议扩大数据集规模或增加训练轮次后再对比。",
              ]
          ).map((t, i) => (
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
            报告内容：两任务配置 / Loss 曲线对比 / 指标差异 / 结论与建议
          </span>
          <div style={{ flex: 1 }} />
          <Btn size="sm" icon={<Download size={13} />} onClick={() => toast.success("对比分析报告（PDF）已开始下载")}>
            下载
          </Btn>
        </div>
      </Panel>
    </div>
  );
}

// ================================================================
// 新建训练评估（3 步向导）
// ================================================================
function TrainCreate({
  onDone, onCancel,
}: {
  onDone: (e: TrainExp) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    datasetId: "",
    modelType: "",
    framework: "",
    preset: TRAIN_PRESETS[0],
    epochs: 60,
    batch: 16,
    lr: "2e-4",
    patience: 8,
    valRatio: 15,
  });
  const [evalMetrics, setEvalMetrics] = useState<string[]>(["准确率", "精确率", "召回率", "F1"]);

  const patch = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const ds = expDataset(form.datasetId);

  const missing = (() => {
    const out: string[] = [];
    if (!form.name.trim()) out.push("试验名称");
    if (!form.datasetId) out.push("目标数据集");
    if (!form.modelType) out.push("模型类型");
    if (!form.framework) out.push("训练框架");
    if (!evalMetrics.length) out.push("评估指标");
    return out;
  })();

  const submit = () => {
    if (missing.length) {
      toast.error(`请完善：${missing.join("、")}`);
      return;
    }
    const id = `TE-2026-${String(15 + Math.floor(TRAIN_EXPS.length)).padStart(3, "0")}`;
    const exp: TrainExp = {
      id,
      name: form.name.trim(),
      datasetId: form.datasetId,
      modelType: form.modelType,
      framework: form.framework,
      preset: form.preset,
      status: "运行中",
      progress: 2,
      gpu: "4 × A100 80G",
      startedAt: "刚刚",
      duration: "0m",
      mainLabel: evalMetrics.includes("准确率") ? "准确率" : evalMetrics[0],
      mainValue: 0,
      metrics: [],
      process: {
        bestEpoch: 0, totalEpochs: form.epochs, earlyStop: false, patience: form.patience,
        trainAcc: 0, valAcc: 0, gap: 0, overfit: "低", stopReason: "训练环境配置中",
      },
      curves: [],
      conclusion: "试验已提交，系统正在自动配置训练环境。",
      advice: [],
    };
    onDone(exp);
  };

  const steps = ["数据集与模型", "训练与评估配置", "确认并启动"];

  return (
    <Panel
      title="新建训练评估试验"
      desc="选好数据集与模型类型后，训练环境、依赖与资源由平台自动配置"
      extra={<Btn size="sm" onClick={onCancel}>取消</Btn>}
    >
      {/* 步骤条 */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 22 }}>
        {steps.map((s, i) => {
          const num = i + 1;
          const done = step > num;
          const on = step === num;
          return (
            <React.Fragment key={s}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 24, height: 24, borderRadius: "50%", fontSize: 11, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? C.success : on ? C.primary : C.borderSoft,
                    color: done || on ? "#fff" : C.faint,
                  }}
                >
                  {done ? <CheckCircle2 size={13} /> : num}
                </span>
                <span style={{ fontSize: 12.5, fontWeight: on ? 600 : 400, color: on || done ? C.text : C.faint }}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, background: done ? `${C.success}44` : C.borderSoft, margin: "0 14px" }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="试验名称" required>
            <TextInput value={form.name} onChange={(v) => patch("name", v)} placeholder="例如：交通视频行为识别 · YOLOv8 基线" />
          </Field>

          <SectionTitle step="1" title="目标数据集" desc="来自数据发布中心的数据集管理，仅可选已发布数据集" />
          <Grid cols={2}>
            <Field label="数据集" required>
              <Sel
                value={form.datasetId}
                onChange={(v) => {
                  patch("datasetId", v);
                  const d = expDataset(v);
                  if (d && !form.name) patch("name", `${d.name} · ${form.modelType || "训练评估"}`);
                }}
                options={EXP_DATASETS.filter((d) => d.id).map((d) => ({
                  value: d.id,
                  label: `${d.id} · ${d.name}`,
                }))}
                placeholder="请选择数据集"
              />
            </Field>
            <Field label="数据模态（随数据集带入）">
              <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>
                {ds ? `${ds.dataType} · ${ds.scale} · 质量总分 ${ds.quality.score}` : "选择数据集后自动带入"}
              </div>
            </Field>
          </Grid>

          <SectionTitle step="2" title="模型类型与训练框架" desc="框架决定自动配置的运行时镜像与依赖版本" />
          <Grid cols={2}>
            <Field label="模型类型" required>
              <Sel value={form.modelType} onChange={(v) => patch("modelType", v)} options={MODEL_TYPES} placeholder="请选择模型类型" />
            </Field>
            <Field label="训练框架" required>
              <Sel value={form.framework} onChange={(v) => patch("framework", v)} options={TRAIN_FRAMEWORKS} placeholder="请选择训练框架" />
            </Field>
          </Grid>
          <Field label="标准化训练流程" hint="平台内置流程：数据加载 → 划分 → 训练 → 指标计算 → 报告生成">
            <Sel value={form.preset} onChange={(v) => patch("preset", v)} options={TRAIN_PRESETS} />
          </Field>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
            <Btn onClick={onCancel}>取消</Btn>
            <Btn
              tone="primary"
              disabled={!form.datasetId || !form.modelType || !form.framework}
              onClick={() => setStep(2)}
            >
              下一步：训练与评估配置
            </Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <SectionTitle step="3" title="训练参数" desc="默认值取自所选标准化流程，可按需调整" />
          <Grid cols={3}>
            <Field label="训练轮次 Epochs" required>
              <NumInput value={form.epochs} onChange={(v) => patch("epochs", v)} min={1} />
            </Field>
            <Field label="Batch Size">
              <NumInput value={form.batch} onChange={(v) => patch("batch", v)} min={1} />
            </Field>
            <Field label="学习率">
              <TextInput value={form.lr} onChange={(v) => patch("lr", v)} />
            </Field>
            <Field label="早停耐心值（轮）" hint="验证集指标连续 N 轮未提升则早停">
              <NumInput value={form.patience} onChange={(v) => patch("patience", v)} min={1} />
            </Field>
            <Field label="验证集比例">
              <NumInput value={form.valRatio} onChange={(v) => patch("valRatio", v)} min={5} max={40} />
            </Field>
            <Field label="随机种子">
              <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>42（固定，保证可复现）</div>
            </Field>
          </Grid>

          <Field label="评估指标" required hint="勾选的指标会在训练结束后计算并写入评估报告">
            <Chips
              options={["准确率", "精确率", "召回率", "F1", "mAP@0.5", "Dice", "WER", "MAE"]}
              value={evalMetrics}
              onChange={setEvalMetrics}
              multi
            />
          </Field>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 4 }}>
            <Btn onClick={() => setStep(1)}>← 上一步</Btn>
            <Btn tone="primary" onClick={() => setStep(3)}>下一步：确认并启动</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionTitle step="4" title="自动环境配置结果" desc="平台已根据数据集与模型类型生成运行环境" extra={<Tag tone={C.success}>已就绪</Tag>} />
          <Grid cols={2}>
            <Panel title="训练环境" bodyStyle={{ padding: "12px 16px" }}>
              <Kv k="运行时镜像" v={`tf-train-${form.framework.split(" ")[0].toLowerCase()}:2.3-cu121`} w={86} />
              <Kv k="框架" v={form.framework} w={86} />
              <Kv k="CUDA / 驱动" v="12.1 / 550.54" w={86} />
              <Kv k="计算资源" v="4 × A100 80G（自动分配）" w={86} />
              <Kv k="预计时长" v={`约 ${Math.max(1, Math.round(form.epochs * 2.6))} 分钟`} w={86} />
            </Panel>
            <Panel title="数据与评估" bodyStyle={{ padding: "12px 16px" }}>
              <Kv k="数据集" v={ds ? `${ds.id} · ${ds.name}` : "-"} w={86} />
              <Kv k="数据加载" v={`自动解析 ${ds?.dataType || "-"} 格式 · 按 ${100 - form.valRatio}/${form.valRatio} 划分`} w={86} />
              <Kv k="评估指标" v={evalMetrics.join("、")} w={86} />
              <Kv k="训练流程" v={form.preset} w={86} />
              <Kv k="报告" v="训练结束后自动生成（曲线 / 混淆矩阵 / 结论）" w={86} />
            </Panel>
          </Grid>

          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.8 }}>
            提交后试验进入「运行中」，平台按流程自动完成环境拉起、数据加载、训练与指标计算；
            训练结束自动生成评估报告，并标记早停轮次与过拟合程度。
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, paddingTop: 4 }}>
            <Btn onClick={() => setStep(2)}>← 上一步</Btn>
            <Btn tone="primary" icon={<Plus size={13} />} onClick={submit}>确认并启动试验</Btn>
          </div>
        </div>
      )}
    </Panel>
  );
}

// ================================================================
// 详情
// ================================================================
function TrainDetail({ exp, onBack }: { exp: TrainExp; onBack: () => void }) {
  const ds = expDataset(exp.datasetId);
  const maxCell = exp.confusion ? Math.max(...exp.confusion.matrix.flat()) : 1;

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
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>
              {ds?.id} · {ds?.name} ｜ {exp.modelType} ｜ {exp.framework} ｜ {exp.gpu} ｜ 开始 {exp.startedAt} ｜ 耗时 {exp.duration}
            </div>
          </div>
          <Btn
            size="sm"
            icon={<Download size={13} />}
            onClick={() => toast.success("训练评估报告（PDF）已开始下载")}
            disabled={!exp.metrics.length}
          >
            下载评估报告
          </Btn>
        </div>
      </Panel>

      <Grid cols={4}>
        <Metric icon={<Target size={15} />} label={exp.mainLabel} value={exp.metrics.length ? pct(exp.mainValue) : "--"} tone={C.primary} hint="测试集计算结果" />
        <Metric icon={<Gauge size={15} />} label="精确率 / 召回率" value={exp.metrics.length > 1 ? `${pct(exp.metrics[1].value)} / ${pct(exp.metrics[2].value)}` : "--"} tone={C.teal} hint="核心性能指标" />
        <Metric
          icon={<Clock size={15} />}
          label="最佳轮次 / 早停"
          value={exp.process.bestEpoch ? `${exp.process.bestEpoch} / ${exp.process.totalEpochs}` : "--"}
          tone={C.warn}
          hint={exp.process.earlyStop ? `早停触发于第 ${exp.process.earlyStopEpoch} 轮` : "未触发早停"}
        />
        <Metric
          icon={<Activity size={15} />}
          label="过拟合程度"
          value={exp.metrics.length ? exp.process.overfit : "--"}
          tone={OVERFIT_TONE[exp.process.overfit]}
          hint={exp.metrics.length ? `train-val 差距 ${exp.process.gap.toFixed(1)}pt` : "无有效结果"}
        />
      </Grid>

      <Grid cols={2}>
        <Panel title="训练曲线 · 损失" desc="train_loss / val_loss 随轮次变化">
          {exp.curves.length ? (
            <>
              <LineChart
                labels={exp.curves.map((c) => `E${c.epoch}`)}
                series={[
                  { name: "train_loss", color: C.primary, data: exp.curves.map((c) => c.trainLoss) },
                  { name: "val_loss", color: C.danger, data: exp.curves.map((c) => c.valLoss) },
                ]}
                height={190}
              />
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5 }}>
                <LegendItem color={C.primary} text="train_loss" />
                <LegendItem color={C.danger} text="val_loss" />
              </div>
            </>
          ) : (
            <Empty text="训练尚未产生曲线" />
          )}
        </Panel>
        <Panel title="训练曲线 · 准确率" desc="train_acc / val_acc 随轮次变化">
          {exp.curves.length ? (
            <>
              <LineChart
                labels={exp.curves.map((c) => `E${c.epoch}`)}
                series={[
                  { name: "train_acc", color: C.teal, data: exp.curves.map((c) => c.trainAcc) },
                  { name: "val_acc", color: C.warn, data: exp.curves.map((c) => c.valAcc) },
                ]}
                height={190}
                yUnit="%"
              />
              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5 }}>
                <LegendItem color={C.teal} text="train_acc" />
                <LegendItem color={C.warn} text="val_acc" />
              </div>
            </>
          ) : (
            <Empty text="训练尚未产生曲线" />
          )}
        </Panel>
      </Grid>

      <Grid cols={exp.confusion ? "1.1fr 1fr" : "1fr"}>
        {exp.confusion && (
          <Panel title="混淆矩阵" desc="测试集逐类判定结果，深色为高命中">
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse", fontSize: 11.5 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "6px 8px", color: C.faint, fontWeight: 500, textAlign: "left" }}>真实 \ 预测</th>
                    {exp.confusion.labels.map((l) => (
                      <th key={l} style={{ padding: "6px 8px", color: C.sub, fontWeight: 500, whiteSpace: "nowrap" }}>{l}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exp.confusion.matrix.map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: "6px 8px", color: C.sub, whiteSpace: "nowrap" }}>{exp.confusion!.labels[i]}</td>
                      {row.map((v, j) => {
                        const h = heatColor(v, maxCell);
                        return (
                          <td
                            key={j}
                            style={{
                              padding: "6px 8px", textAlign: "center", background: h.bg, color: h.fg,
                              fontWeight: i === j ? 700 : 400, borderRadius: 3,
                            }}
                          >
                            {v}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 10 }}>对角线为正确判定；非对角线数值反映类别混淆。</div>
          </Panel>
        )}

        <Panel title="训练过程指标" desc="用于判断训练是否收敛、是否过拟合">
          <Kv k="最佳轮次" v={`第 ${exp.process.bestEpoch} / ${exp.process.totalEpochs} 轮`} w={92} />
          <Kv
            k="早停标记"
            v={
              exp.process.earlyStop ? (
                <Tag tone={C.warn}>已触发 · 第 {exp.process.earlyStopEpoch} 轮</Tag>
              ) : (
                <Tag tone={C.faint}>未触发（耐心值 {exp.process.patience}）</Tag>
              )
            }
            w={92}
          />
          <Kv k="train_acc" v={exp.metrics.length ? pct(exp.process.trainAcc) : "--"} w={92} />
          <Kv k="val_acc" v={exp.metrics.length ? pct(exp.process.valAcc) : "--"} w={92} />
          <Kv k="过拟合程度" v={<Tag tone={OVERFIT_TONE[exp.process.overfit]}>{exp.process.overfit}（差距 {exp.process.gap.toFixed(1)}pt）</Tag>} w={92} />
          <Kv k="停止原因" v={exp.process.stopReason} w={92} />
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.borderSoft}` }}>
            <div style={{ fontSize: 11.5, color: C.faint, marginBottom: 6 }}>Loss 下降趋势</div>
            <Spark data={exp.curves.map((c) => c.trainLoss)} color={C.primary} w={280} h={38} />
          </div>
        </Panel>
      </Grid>

      <Panel
        title="训练评估结论"
        desc="自动生成，随评估报告一同归档"
        extra={<Tag tone={C.success}>报告已生成</Tag>}
      >
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.9, marginBottom: 12 }}>{exp.conclusion}</div>
        {exp.advice.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.sub, marginBottom: 8 }}>数据集优化方向</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exp.advice.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex", gap: 8, padding: "9px 12px", borderRadius: 6,
                    background: C.warnSoft, border: `1px solid ${C.warn}22`,
                    fontSize: 12, color: "#92400e", lineHeight: 1.7,
                  }}
                >
                  <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                  {a}
                </div>
              ))}
            </div>
          </>
        )}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", gap: 10 }}>
          <FileCheck2 size={14} style={{ color: C.success }} />
          <span style={{ fontSize: 11.5, color: C.sub }}>
            报告内容：训练配置 / 训练曲线 / 混淆矩阵 / 核心指标 / 过程指标 / 结论与建议
          </span>
          <div style={{ flex: 1 }} />
          <Btn size="sm" icon={<Download size={13} />} onClick={() => toast.success("训练评估报告（PDF）已开始下载")}>
            下载
          </Btn>
        </div>
      </Panel>
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

// ================================================================
// 主页面
// ================================================================
export default function ModelTrainingEvalPage() {
  const [exps, setExps] = useState<TrainExp[]>(TRAIN_EXPS);
  const [tab, setTab] = useState<TabKey>("list");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [comparePair, setComparePair] = useState<string[]>(["TE-2026-008", "TE-2026-012"]);

  const done = exps.filter((e) => e.status === "已完成" && e.metrics.length > 0);
  const running = exps.filter((e) => e.status === "运行中");
  const avgMain = avg(done.map((e) => e.mainValue));
  const reportCount = done.length;

  const stop = (id: string) => {
    setExps((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: "已终止", process: { ...e.process, stopReason: "管理员手动终止" } } : e))
    );
    toast.success("试验已终止");
  };

  const detail = exps.find((e) => e.id === detailId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <ExpHeader
        icon={<Brain size={17} color="#fff" />}
        title="模型训练评估"
        subtitle="数据中试中心 · 模型试验 ｜ 基于数据集的模型训练与效果评估，自动生成训练评估报告"
        right={
          <>
            <Btn size="sm" onClick={() => setTab("compare")} icon={<ArrowLeftRight size={13} />}>对照实验</Btn>
            <Btn size="sm" tone="primary" icon={<Plus size={13} />} onClick={() => { setDetailId(null); setTab("new"); }}>
              新建训练评估
            </Btn>
          </>
        }
      />

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {detail ? (
          <TrainDetail exp={detail} onBack={() => setDetailId(null)} />
        ) : (
          <>
            <Grid cols={4} style={{ marginBottom: 12 }}>
              <Metric icon={<Database size={15} />} label="训练评估试验" value={exps.length} unit="个" hint={`已完成 ${done.length} · 运行中 ${running.length}`} />
              <Metric icon={<Activity size={15} />} label="平均主指标" value={avgMain ? pct(avgMain) : "--"} tone={C.teal} hint="已完成试验的主指标均值" />
              <Metric icon={<Gauge size={15} />} label="平均过拟合差距" value={`${avg(done.map((e) => e.process.gap)).toFixed(1)}pt`} tone={C.warn} hint="train-val 准确率差值" />
              <Metric icon={<FileCheck2 size={15} />} label="自动评估报告" value={reportCount} unit="份" tone={C.purple} hint="训练结束自动生成" />
            </Grid>

            <Tabs<TabKey>
              value={tab}
              onChange={(k) => setTab(k)}
              items={[
                { key: "list", label: "训练试验", icon: <Layers size={13} />, count: exps.length },
                { key: "compare", label: "对照实验", icon: <ArrowLeftRight size={13} /> },
                { key: "new", label: "新建试验", icon: <Plus size={13} /> },
              ]}
            />

            {tab === "list" && (
              <TrainList
                exps={exps}
                onOpen={(id) => setDetailId(id)}
                onCompare={(id) => {
                  setComparePair((prev) => [prev[0] || id, id]);
                  setTab("compare");
                  toast.success("已作为任务 B 加入对比");
                }}
                onStop={stop}
              />
            )}
            {tab === "compare" && (
              <TrainCompare exps={exps} pair={comparePair} setPair={setComparePair} onOpen={(id) => {
                setDetailId(id);
              }} />
            )}
            {tab === "new" && (
              <TrainCreate
                onCancel={() => setTab("list")}
                onDone={(e) => {
                  setExps((prev) => [e, ...prev]);
                  setTab("list");
                  toast.success(`试验「${e.name}」已提交，训练环境自动配置中`);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
