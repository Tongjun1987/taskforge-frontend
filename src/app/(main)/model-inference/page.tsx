"use client";

import React, { useMemo, useState } from "react";
import {
  Rocket, Plus, Eye, ArrowLeft, Download, Search, Layers, Zap,
  Clock, Database, Gauge, ShieldAlert, Activity, AlertTriangle, Play,
  Target, TrendingDown,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  C, Panel, Metric, Table, Tag, Btn, IconBtn, Bar, Kv, Grid, LineChart, Columns, BarList,
} from "@/components/production/ui";
import {
  INFER_EXPS, EXP_DATASETS, INFER_ENGINES, INFER_DEVICES, ROBUST_TYPES,
  TRAINED_MODELS, expDataset, avg, type InferExp,
} from "@/components/model-exp/expData";
import {
  ExpHeader, Tabs, StatusTag, Field, Sel, NumInput, TextInput, Chips, SectionTitle, Empty,
} from "@/components/model-exp/ui";

type TabKey = "list" | "robust" | "new";

const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
const ms = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(2)}s` : `${v}ms`);
const dropTone = (d: number) => (d <= 2 ? C.success : d <= 6 ? C.warn : C.danger);

// ================================================================
// 列表
// ================================================================
function InferList({
  exps, onOpen, onStop,
}: {
  exps: InferExp[];
  onOpen: (id: string) => void;
  onStop: (id: string) => void;
}) {
  const [status, setStatus] = useState("");
  const [engine, setEngine] = useState("");
  const [kw, setKw] = useState("");

  const rows = useMemo(
    () =>
      exps.filter(
        (e) =>
          (!status || e.status === status) &&
          (!engine || e.engine === engine) &&
          (!kw || e.name.includes(kw) || e.model.includes(kw) || e.id.includes(kw))
      ),
    [exps, status, engine, kw]
  );

  return (
    <Panel
      title="推理评估任务"
      desc="将数据集作为测试集输入已训练模型，评估推理表现与鲁棒性"
      extra={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sel value={status} onChange={setStatus} options={["运行中", "已完成", "排队中", "已终止"]} placeholder="全部状态" />
          <Sel value={engine} onChange={setEngine} options={INFER_ENGINES} placeholder="全部推理引擎" />
          <div style={{ position: "relative" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: C.faint }} />
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索任务 / 模型"
              style={{
                width: 180, height: 34, paddingLeft: 28, paddingRight: 10, fontSize: 12.5,
                border: `1px solid ${C.border}`, borderRadius: 6, outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      }
      bodyStyle={{ padding: 0 }}
    >
      <Table
        head={["评估任务", "模型 / 版本", "测试数据集", "引擎 / 设备", "状态", "P95 延迟", "吞吐 QPS", "准确率", "操作"]}
        widths={["206px", "176px", "168px", "160px", "86px", "92px", "96px", "100px", "86px"]}
        rowKey={(i) => rows[i].id}
        rows={rows.map((e) => [
          <div key="n">
            <div style={{ fontSize: 12.5, fontWeight: 500, color: C.text, lineHeight: 1.45 }}>{e.name}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>
              {e.id} · 并发 {e.concurrency} · {e.samples.toLocaleString()} 条
            </div>
          </div>,
          <div key="m">
            <div style={{ fontSize: 12.5, color: C.text }}>{e.model}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.modelVersion}</div>
          </div>,
          <div key="d">
            <div style={{ fontSize: 12.5, color: C.text }}>{expDataset(e.datasetId)?.name || e.datasetId}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.datasetId}</div>
          </div>,
          <div key="e">
            <div style={{ fontSize: 12, color: C.text }}>{e.engine}</div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>{e.device}</div>
          </div>,
          <div key="s">
            <StatusTag status={e.status} />
            {e.status === "运行中" && (
              <div style={{ marginTop: 5, width: 62 }}><Bar pct={e.progress} tone={C.info} h={4} /></div>
            )}
          </div>,
          <div key="p">
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, lineHeight: 1.1 }}>{ms(e.perf.p95)}</div>
            <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>P50 {ms(e.perf.p50)}</div>
          </div>,
          <div key="q" style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{e.perf.qps.toFixed(1)}</div>,
          <div key="a">
            <div style={{ fontSize: 12.5, color: C.text, fontWeight: 600 }}>{pct(e.perf.accuracy)}</div>
            <div style={{ fontSize: 10.5, color: C.faint, marginTop: 2 }}>{e.perf.accuracyLabel}</div>
          </div>,
          <div key="op" style={{ display: "flex", gap: 5 }}>
            <IconBtn size="sm" tone="primary" icon={<Eye size={13} />} label="查看评估详情" onClick={() => onOpen(e.id)} />
            {e.status === "运行中" && (
              <IconBtn size="sm" tone="danger" icon={<AlertTriangle size={13} />} label="终止评估" onClick={() => onStop(e.id)} />
            )}
          </div>,
        ])}
      />
      {rows.length === 0 && <Empty text="没有符合条件的推理评估任务" />}
    </Panel>
  );
}

// ================================================================
// 鲁棒性测试
// ================================================================
function RobustCompare({ exps, onOpen }: { exps: InferExp[]; onOpen: (id: string) => void }) {
  const done = exps.filter((e) => e.status === "已完成" && e.robust.length > 0);
  // 行=扰动类型，列=模型：比“一行一个模型铺 12 列扰动”更易读
  const types = Array.from(new Set(done.flatMap((e) => e.robust.map((r) => r.type))));
  const shortName = (m: string) => m.split("-").slice(0, 2).join("-");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel
        title="鲁棒性横向对比"
        desc="通过对抗样本、噪声、遮挡等扰动数据检验模型与数据集的边界表现"
        extra={<Tag tone={C.primary}>{done.length} 个模型 · {types.length - 1} 类扰动</Tag>}
      >
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 760 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "10px 12px", background: C.bg, color: C.sub, fontWeight: 500, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", width: 168 }}>扰动类型</th>
                {done.map((e) => (
                  <th key={e.id} style={{ textAlign: "left", padding: "10px 12px", background: C.bg, color: C.sub, fontWeight: 500, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>
                    <div style={{ color: C.text, fontWeight: 600 }}>{shortName(e.model)}</div>
                    <div style={{ fontSize: 11, color: C.faint }}>{e.modelVersion}</div>
                  </th>
                ))}
                <th style={{ textAlign: "left", padding: "10px 12px", background: C.bg, color: C.sub, fontWeight: 500, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap", width: 88 }}>平均下降</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => {
                const isBase = t === "原始测试集";
                const vals = done
                  .map((e) => e.robust.find((r) => r.type === t)?.drop)
                  .filter((v): v is number => v !== undefined && v > 0);
                return (
                  <tr key={t}>
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderSoft}`, color: isBase ? C.sub : C.text, whiteSpace: "nowrap" }}>
                      {t}
                    </td>
                    {done.map((e) => {
                      const r = e.robust.find((x) => x.type === t);
                      return (
                        <td key={e.id} style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: "nowrap" }}>
                          {r ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                              <span style={{ color: C.text }}>{pct(r.acc)}</span>
                              {r.drop > 0 && <Tag tone={dropTone(r.drop)}>-{r.drop.toFixed(1)}</Tag>}
                            </span>
                          ) : (
                            <span style={{ color: C.faint }}>--</span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ padding: "10px 12px", borderBottom: `1px solid ${C.borderSoft}`, whiteSpace: "nowrap" }}>
                      {isBase || !vals.length ? <span style={{ color: C.faint }}>--</span> : <span style={{ color: dropTone(avg(vals)), fontWeight: 600 }}>-{avg(vals).toFixed(1)}pt</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 14, fontSize: 11.5, color: C.faint }}>
          <span>单元格为扰动后准确率，标签为相对原始测试集的下降幅度</span>
          <span>「--」表示该模型未配置此扰动测试</span>
        </div>
      </Panel>

      <Grid cols={2}>
        <Panel title="各模型最大下降幅度" desc="扰动下准确率下降越多，鲁棒性越弱">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {done.map((e) => {
              const worst = e.robust.filter((r) => r.type !== "原始测试集").sort((a, b) => b.drop - a.drop)[0];
              const drop = worst?.drop || 0;
              return (
                <div key={e.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: C.text }}>{shortName(e.model)} <span style={{ color: C.faint }}>{worst?.type}</span></span>
                    <span style={{ color: dropTone(drop), fontWeight: 600 }}>-{drop.toFixed(1)}pt</span>
                  </div>
                  <Bar pct={(drop / 16) * 100} tone={dropTone(drop)} h={6} />
                </div>
              );
            })}
          </div>
        </Panel>
        <Panel title="扰动类型影响度" desc="所有模型在各扰动下的平均下降">
          <BarList
            data={types
              .filter((t) => t !== "原始测试集")
              .map((t) => {
                const vals = done.map((e) => e.robust.find((r) => r.type === t)?.drop).filter((v): v is number => v !== undefined);
                return { label: t, value: +avg(vals).toFixed(1), tone: dropTone(avg(vals)) };
              })
              .sort((a, b) => b.value - a.value)}
            unit=" pt"
            max={16}
          />
        </Panel>
      </Grid>

      <Panel title="测试结论">
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.9 }}>
          低照度、背景干扰与错别字扰动是拉低准确率的主要因素（平均下降 8pt 以上），
          说明现有测试集在「真实噪声场景」覆盖不足。建议按扰动类型补充边界样本，并在数据集发布前以鲁棒性报告作为质量门槛之一。
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {done.map((e) => (
            <Btn key={e.id} size="sm" icon={<Eye size={13} />} onClick={() => onOpen(e.id)}>
              {shortName(e.model)} 详情
            </Btn>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ================================================================
// 新建推理评估
// ================================================================
function InferCreate({ onDone, onCancel }: { onDone: (e: InferExp) => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [modelKey, setModelKey] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [engine, setEngine] = useState(INFER_ENGINES[0]);
  const [device, setDevice] = useState(INFER_DEVICES[0]);
  const [concurrency, setConcurrency] = useState(16);
  const [batch, setBatch] = useState(8);
  const [samples, setSamples] = useState(2000);
  const [robust, setRobust] = useState<string[]>(["对抗样本", "高斯噪声", "随机遮挡"]);

  const model = TRAINED_MODELS.find((m) => `${m.name}@${m.version}` === modelKey);
  const ds = expDataset(datasetId);

  const submit = () => {
    const miss: string[] = [];
    if (!name.trim()) miss.push("任务名称");
    if (!modelKey) miss.push("模型");
    if (!datasetId) miss.push("测试数据集");
    if (miss.length) {
      toast.error(`请完善：${miss.join("、")}`);
      return;
    }
    const id = `IE-2026-${String(22 + INFER_EXPS.length).padStart(3, "0")}`;
    onDone({
      id,
      name: name.trim(),
      model: model!.name,
      modelVersion: model!.version,
      datasetId,
      engine,
      device,
      concurrency,
      batch,
      samples,
      status: "运行中",
      progress: 2,
      startedAt: "刚刚",
      perf: { p50: 0, p95: 0, p99: 0, qps: 0, gpuMem: 0, accuracy: 0, accuracyLabel: "准确率" },
      robust: [],
      latency: [],
      conclusion: "评估已提交，平台正在加载模型并预热推理服务。",
      advice: [],
    });
  };

  return (
    <Panel
      title="新建推理评估"
      desc="把数据集当作测试集喂给已训练模型，测性能也测边界"
      extra={<Btn size="sm" onClick={onCancel}>取消</Btn>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Grid cols={2}>
          <Field label="评估任务名称" required span>
            <TextInput value={name} onChange={setName} placeholder="例如：医疗问答模型推理评估 · v3 权重" />
          </Field>
          <Field label="待评估模型" required hint="来自模型仓库的已训练模型，含微调产物">
            <Sel
              value={modelKey}
              onChange={setModelKey}
              options={TRAINED_MODELS.map((m) => ({
                value: `${m.name}@${m.version}`,
                label: `${m.name} ${m.version} · ${m.type} · ${m.size}`,
              }))}
              placeholder="请选择模型"
            />
          </Field>
          <Field label="测试数据集" required hint="作为测试集输入，评估该数据集上的推理表现">
            <Sel
              value={datasetId}
              onChange={(v) => {
                setDatasetId(v);
                const d = expDataset(v);
                if (d && !name) setName(`${d.name} · 推理评估`);
              }}
              options={EXP_DATASETS.map((d) => ({ value: d.id, label: `${d.id} · ${d.name}` }))}
              placeholder="请选择测试数据集"
            />
          </Field>
        </Grid>

        {model && (
          <div style={{ display: "flex", gap: 18, padding: "10px 12px", background: C.bg, borderRadius: 6, fontSize: 12, color: C.sub }}>
            <span>来源试验：<strong style={{ color: C.text }}>{model.from}</strong></span>
            <span>模型类型：<strong style={{ color: C.text }}>{model.type}</strong></span>
            <span>权重体积：<strong style={{ color: C.text }}>{model.size}</strong></span>
            <span>测试集：<strong style={{ color: C.text }}>{ds ? `${ds.name}（${ds.scale} · 质量 ${ds.quality.score}）` : "选择后带入"}</strong></span>
          </div>
        )}

        <SectionTitle step="1" title="性能评估配置" desc="推理延迟、吞吐量等性能指标由平台压测得出" />
        <Grid cols={3}>
          <Field label="推理引擎">
            <Sel value={engine} onChange={setEngine} options={INFER_ENGINES} />
          </Field>
          <Field label="运行设备">
            <Sel value={device} onChange={setDevice} options={INFER_DEVICES} />
          </Field>
          <Field label="测试样本数">
            <NumInput value={samples} onChange={setSamples} min={100} step={100} />
          </Field>
          <Field label="并发数">
            <NumInput value={concurrency} onChange={setConcurrency} min={1} />
          </Field>
          <Field label="Batch Size">
            <NumInput value={batch} onChange={setBatch} min={1} />
          </Field>
          <Field label="性能指标">
            <div style={{ display: "flex", alignItems: "center", height: 34, fontSize: 12.5, color: C.sub }}>
              P50 / P95 / P99 延迟 · QPS · 显存占用（默认全测）
            </div>
          </Field>
        </Grid>

        <SectionTitle step="2" title="鲁棒性测试" desc="在测试集上施加扰动，检验模型与数据集的边界表现" extra={<Tag tone={C.purple}>已选 {robust.length} 类</Tag>} />
        <Chips options={ROBUST_TYPES} value={robust} onChange={setRobust} multi />
        <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.8 }}>
          每类扰动会生成对应的扰动测试子集并单独计算指标，最终在鲁棒性报告里给出「准确率下降幅度」与最敏感维度。
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 4 }}>
          <Btn onClick={onCancel}>取消</Btn>
          <Btn tone="primary" icon={<Play size={13} />} onClick={submit}>提交推理评估</Btn>
        </div>
      </div>
    </Panel>
  );
}

// ================================================================
// 详情
// ================================================================
function InferDetail({ exp, onBack }: { exp: InferExp; onBack: () => void }) {
  const base = exp.robust.find((r) => r.type === "原始测试集");
  const worst = exp.robust.filter((r) => r.type !== "原始测试集").sort((a, b) => b.drop - a.drop)[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Panel bodyStyle={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <IconBtn icon={<ArrowLeft size={15} />} label="返回评估列表" onClick={onBack} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{exp.name}</span>
              <StatusTag status={exp.status} />
              <Tag tone={C.sub}>{exp.id}</Tag>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>
              {exp.model} {exp.modelVersion} ｜ {exp.engine} ｜ {exp.device} ｜ 测试集 {expDataset(exp.datasetId)?.name} ｜ 并发 {exp.concurrency} · Batch {exp.batch} ｜ {exp.samples.toLocaleString()} 条
            </div>
          </div>
          <Btn
            size="sm"
            icon={<Download size={13} />}
            disabled={exp.status !== "已完成"}
            onClick={() => toast.success("推理评估报告（PDF）已开始下载")}
          >
            下载评估报告
          </Btn>
        </div>
      </Panel>

      <Grid cols={4}>
        <Metric icon={<Clock size={15} />} label="P95 延迟" value={exp.perf.p95 ? ms(exp.perf.p95) : "--"} tone={C.primary} hint={`P50 ${ms(exp.perf.p50)} · P99 ${ms(exp.perf.p99)}`} />
        <Metric icon={<Zap size={15} />} label="吞吐量" value={exp.perf.qps ? exp.perf.qps.toFixed(1) : "--"} unit="QPS" tone={C.teal} hint={`并发 ${exp.concurrency} · Batch ${exp.batch}`} />
        <Metric icon={<Target size={15} />} label={exp.perf.accuracyLabel} value={exp.perf.accuracy ? pct(exp.perf.accuracy) : "--"} tone={C.success} hint="该测试集上的推理精度" />
        <Metric
          icon={<ShieldAlert size={15} />}
          label="最大鲁棒性下降"
          value={worst ? `-${worst.drop.toFixed(1)}pt` : "--"}
          tone={worst ? dropTone(worst.drop) : C.faint}
          hint={worst ? worst.type : "未执行鲁棒性测试"}
        />
      </Grid>

      <Grid cols={2}>
        <Panel title="并发 - 延迟曲线" desc="P95 延迟随并发增长，用于确定线上并发上限">
          {exp.latency.length ? (
            <LineChart
              labels={exp.latency.map((l) => `C=${l.concurrency}`)}
              series={[{ name: "P95 延迟(ms)", color: C.primary, data: exp.latency.map((l) => l.p95) }]}
              height={196}
            />
          ) : (
            <Empty text="压测尚未产生数据" />
          )}
        </Panel>
        <Panel title="吞吐随并发变化" desc="QPS 饱和点即服务容量上限">
          {exp.latency.length ? (
            <LineChart
              labels={exp.latency.map((l) => `C=${l.concurrency}`)}
              series={[{ name: "QPS", color: C.teal, data: exp.latency.map((l) => l.qps) }]}
              height={196}
            />
          ) : (
            <Empty text="压测尚未产生数据" />
          )}
        </Panel>
      </Grid>

      <Grid cols="1.15fr 1fr">
        <Panel title="鲁棒性测试结果" desc="在测试集上施加扰动后的准确率与下降幅度">
          {exp.robust.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {exp.robust.map((r) => (
                <div key={r.type}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, color: C.text, flex: 1 }}>{r.type}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{pct(r.acc)}</span>
                    {r.drop > 0 ? (
                      <Tag tone={dropTone(r.drop)}>-{r.drop.toFixed(1)}pt</Tag>
                    ) : (
                      <Tag tone={C.sub}>基线</Tag>
                    )}
                  </div>
                  <Bar pct={r.acc} tone={r.drop === 0 ? C.faint : dropTone(r.drop)} h={5} />
                </div>
              ))}
            </div>
          ) : (
            <Empty text="未执行鲁棒性测试" />
          )}
        </Panel>

        <Panel title="推理性能明细" desc="压测汇总">
          <Kv k="P50 延迟" v={ms(exp.perf.p50)} w={92} />
          <Kv k="P95 延迟" v={ms(exp.perf.p95)} w={92} />
          <Kv k="P99 延迟" v={ms(exp.perf.p99)} w={92} />
          <Kv k="吞吐 QPS" v={exp.perf.qps.toFixed(1)} w={92} />
          <Kv k="显存占用" v={exp.perf.gpuMem ? `${exp.perf.gpuMem.toFixed(1)} GB` : "CPU 部署（无显存）"} w={92} />
          <Kv k="测试样本" v={`${exp.samples.toLocaleString()} 条`} w={92} />
          <Kv k="推理引擎" v={exp.engine} w={92} />
          <Kv k="运行设备" v={exp.device} w={92} />
        </Panel>
      </Grid>

      <Panel title="评估结论" desc="自动生成，随推理评估报告归档" extra={base ? <Tag tone={C.sub}>基线 {pct(base.acc)}</Tag> : undefined}>
        <div style={{ fontSize: 12.5, color: C.text, lineHeight: 1.9 }}>{exp.conclusion}</div>
        {exp.advice.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {exp.advice.map((a, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 8, padding: "9px 12px", borderRadius: 6,
                  background: C.infoSoft, border: `1px solid ${C.info}22`,
                  fontSize: 12, color: "#075985", lineHeight: 1.7,
                }}
              >
                <Activity size={13} style={{ flexShrink: 0, marginTop: 2 }} />
                {a}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

// ================================================================
// 主页面
// ================================================================
export default function ModelInferenceEvalPage() {
  const [exps, setExps] = useState<InferExp[]>(INFER_EXPS);
  const [tab, setTab] = useState<TabKey>("list");
  const [detailId, setDetailId] = useState<string | null>(null);

  const done = exps.filter((e) => e.status === "已完成");
  const running = exps.filter((e) => e.status === "运行中");

  const stop = (id: string) => {
    setExps((prev) => prev.map((e) => (e.id === id ? { ...e, status: "已终止" } : e)));
    toast.success("推理评估已终止");
  };

  const detail = exps.find((e) => e.id === detailId) || null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.bg }}>
      <ExpHeader
        icon={<Rocket size={17} color="#fff" />}
        title="模型推理评估"
        subtitle="数据中试中心 · 模型试验 ｜ 数据集作为测试集，验证推理性能与鲁棒性边界"
        gradient="linear-gradient(135deg, #0ea5e9, #14b8a6)"
        right={
          <>
            <Btn size="sm" onClick={() => setTab("robust")} icon={<ShieldAlert size={13} />}>鲁棒性测试</Btn>
            <Btn size="sm" tone="primary" icon={<Plus size={13} />} onClick={() => { setDetailId(null); setTab("new"); }}>
              新建推理评估
            </Btn>
          </>
        }
      />

      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {detail ? (
          <InferDetail exp={detail} onBack={() => setDetailId(null)} />
        ) : (
          <>
            <Grid cols={4} style={{ marginBottom: 12 }}>
              <Metric icon={<Database size={15} />} label="推理评估任务" value={exps.length} unit="个" hint={`已完成 ${done.length} · 运行中 ${running.length}`} />
              <Metric icon={<Clock size={15} />} label="平均 P95 延迟" value={ms(Math.round(avg(done.map((e) => e.perf.p95))))} tone={C.primary} hint="已完成任务均值" />
              <Metric icon={<Zap size={15} />} label="平均吞吐" value={avg(done.map((e) => e.perf.qps)).toFixed(0)} unit="QPS" tone={C.teal} hint="按各自并发配置压测" />
              <Metric icon={<TrendingDown size={15} />} label="平均鲁棒性下降" value={`-${avg(done.flatMap((e) => e.robust.filter((r) => r.type !== "原始测试集").map((r) => r.drop))).toFixed(1)}pt`} tone={C.warn} hint="扰动测试集准确率降幅" />
            </Grid>

            <Tabs<TabKey>
              value={tab}
              onChange={setTab}
              items={[
                { key: "list", label: "评估任务", icon: <Layers size={13} />, count: exps.length },
                { key: "robust", label: "鲁棒性测试", icon: <ShieldAlert size={13} /> },
                { key: "new", label: "新建评估", icon: <Plus size={13} /> },
              ]}
            />

            {tab === "list" && <InferList exps={exps} onOpen={setDetailId} onStop={stop} />}
            {tab === "robust" && <RobustCompare exps={exps} onOpen={setDetailId} />}
            {tab === "new" && (
              <InferCreate
                onCancel={() => setTab("list")}
                onDone={(e) => {
                  setExps((prev) => [e, ...prev]);
                  setTab("list");
                  toast.success(`推理评估「${e.name}」已提交，正在加载模型`);
                }}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
